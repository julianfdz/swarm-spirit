
-- Tasks table for orchestration
CREATE TABLE public.tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  swarm_id uuid REFERENCES public.swarms(id) ON DELETE CASCADE,
  host_id uuid REFERENCES public.netherhosts(id) ON DELETE SET NULL,
  daemon_id uuid REFERENCES public.daemons(id) ON DELETE SET NULL,
  type text NOT NULL,
  label text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  priority text NOT NULL DEFAULT 'medium',
  retries integer NOT NULL DEFAULT 0,
  max_retries integer NOT NULL DEFAULT 3,
  locked_by uuid REFERENCES public.daemons(id) ON DELETE SET NULL,
  correlation_id text,
  error text,
  payload jsonb DEFAULT '{}'::jsonb,
  result jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Events table for event stream
CREATE TABLE public.events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  swarm_id uuid REFERENCES public.swarms(id) ON DELETE CASCADE,
  source_daemon_id uuid REFERENCES public.daemons(id) ON DELETE SET NULL,
  type text NOT NULL,
  level text NOT NULL DEFAULT 'info',
  message text NOT NULL,
  payload jsonb DEFAULT '{}'::jsonb,
  correlation_id text,
  task_id uuid REFERENCES public.tasks(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for swarm_id (most common query pattern)
CREATE INDEX idx_tasks_swarm_id ON public.tasks(swarm_id);
CREATE INDEX idx_events_swarm_id ON public.events(swarm_id);

-- Additional useful indexes
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_swarm_status ON public.tasks(swarm_id, status);
CREATE INDEX idx_tasks_correlation ON public.tasks(correlation_id) WHERE correlation_id IS NOT NULL;
CREATE INDEX idx_events_created_at ON public.events(created_at DESC);
CREATE INDEX idx_events_correlation ON public.events(correlation_id) WHERE correlation_id IS NOT NULL;

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- RLS helper: user owns the task (via swarm ownership or direct daemon ownership)
CREATE OR REPLACE FUNCTION public.owns_task(_task_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tasks t
    WHERE t.id = _task_id
    AND (
      (t.swarm_id IS NOT NULL AND owns_swarm(t.swarm_id))
      OR (t.daemon_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.daemons d WHERE d.id = t.daemon_id AND d.user_id = auth.uid()))
    )
  )
$$;

-- Tasks RLS: users can read tasks from their swarms or their daemons
CREATE POLICY "Users can read own tasks" ON public.tasks
  FOR SELECT USING (
    (swarm_id IS NOT NULL AND owns_swarm(swarm_id))
    OR (daemon_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.daemons d WHERE d.id = daemon_id AND d.user_id = auth.uid()))
  );

CREATE POLICY "Users can insert own tasks" ON public.tasks
  FOR INSERT WITH CHECK (
    (swarm_id IS NOT NULL AND owns_swarm(swarm_id))
    OR (daemon_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.daemons d WHERE d.id = daemon_id AND d.user_id = auth.uid()))
  );

CREATE POLICY "Users can update own tasks" ON public.tasks
  FOR UPDATE USING (
    (swarm_id IS NOT NULL AND owns_swarm(swarm_id))
    OR (daemon_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.daemons d WHERE d.id = daemon_id AND d.user_id = auth.uid()))
  );

CREATE POLICY "Users can delete own tasks" ON public.tasks
  FOR DELETE USING (
    (swarm_id IS NOT NULL AND owns_swarm(swarm_id))
    OR (daemon_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.daemons d WHERE d.id = daemon_id AND d.user_id = auth.uid()))
  );

-- Events RLS
CREATE POLICY "Users can read own events" ON public.events
  FOR SELECT USING (
    (swarm_id IS NOT NULL AND owns_swarm(swarm_id))
    OR (source_daemon_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.daemons d WHERE d.id = source_daemon_id AND d.user_id = auth.uid()))
  );

CREATE POLICY "Users can insert own events" ON public.events
  FOR INSERT WITH CHECK (
    (swarm_id IS NOT NULL AND owns_swarm(swarm_id))
    OR (source_daemon_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.daemons d WHERE d.id = source_daemon_id AND d.user_id = auth.uid()))
  );

-- Events: no update/delete from frontend (immutable log)

-- Trigger for updated_at on tasks
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
