
-- ============================================================
-- MIGRATION: Collapse "daemons" into "host_daemons"
-- Keep daemons table but stop using it. All FKs redirect to host_daemons.
-- ============================================================

-- 1. Add new columns to host_daemons
ALTER TABLE public.host_daemons
  ADD COLUMN name text NOT NULL DEFAULT 'unnamed',
  ADD COLUMN description text,
  ADD COLUMN capabilities jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN visibility text NOT NULL DEFAULT 'private';

-- Remove the temp default
ALTER TABLE public.host_daemons ALTER COLUMN name DROP DEFAULT;

-- 2. Make daemon_id nullable (legacy field, no longer required)
ALTER TABLE public.host_daemons ALTER COLUMN daemon_id DROP NOT NULL;

-- 3. Redirect FKs from daemons → host_daemons

-- swarm_daemons
ALTER TABLE public.swarm_daemons DROP CONSTRAINT swarm_daemons_daemon_id_fkey;
ALTER TABLE public.swarm_daemons ADD CONSTRAINT swarm_daemons_daemon_id_fkey
  FOREIGN KEY (daemon_id) REFERENCES public.host_daemons(id) ON DELETE CASCADE;

-- events
ALTER TABLE public.events DROP CONSTRAINT events_source_daemon_id_fkey;
ALTER TABLE public.events ADD CONSTRAINT events_source_daemon_id_fkey
  FOREIGN KEY (source_daemon_id) REFERENCES public.host_daemons(id) ON DELETE SET NULL;

-- tasks.daemon_id
ALTER TABLE public.tasks DROP CONSTRAINT tasks_daemon_id_fkey;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_daemon_id_fkey
  FOREIGN KEY (daemon_id) REFERENCES public.host_daemons(id) ON DELETE SET NULL;

-- tasks.locked_by
ALTER TABLE public.tasks DROP CONSTRAINT tasks_locked_by_fkey;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_locked_by_fkey
  FOREIGN KEY (locked_by) REFERENCES public.host_daemons(id) ON DELETE SET NULL;

-- 4. Update owns_task function to use host_daemons via netherhosts
CREATE OR REPLACE FUNCTION public.owns_task(_task_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tasks t
    WHERE t.id = _task_id
    AND (
      (t.swarm_id IS NOT NULL AND owns_swarm(t.swarm_id))
      OR (t.daemon_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.host_daemons hd
        JOIN public.netherhosts nh ON nh.id = hd.host_id
        WHERE hd.id = t.daemon_id AND nh.user_id = auth.uid()
      ))
    )
  )
$$;

-- 5. Update RLS on host_daemons: allow reading daemons on public hosts too
DROP POLICY IF EXISTS "Users can read own host_daemons" ON public.host_daemons;
CREATE POLICY "Users can read own or public host_daemons"
ON public.host_daemons FOR SELECT TO authenticated
USING (
  owns_host(host_id) OR EXISTS (
    SELECT 1 FROM public.netherhosts nh WHERE nh.id = host_id AND nh.is_public = true
  )
);

-- 6. Update RLS on events to reference host_daemons
DROP POLICY IF EXISTS "Users can read own events" ON public.events;
CREATE POLICY "Users can read own events"
ON public.events FOR SELECT TO authenticated
USING (
  (swarm_id IS NOT NULL AND owns_swarm(swarm_id))
  OR (source_daemon_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.host_daemons hd
    JOIN public.netherhosts nh ON nh.id = hd.host_id
    WHERE hd.id = events.source_daemon_id AND nh.user_id = auth.uid()
  ))
);

DROP POLICY IF EXISTS "Users can insert own events" ON public.events;
CREATE POLICY "Users can insert own events"
ON public.events FOR INSERT TO authenticated
WITH CHECK (
  (swarm_id IS NOT NULL AND owns_swarm(swarm_id))
  OR (source_daemon_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.host_daemons hd
    JOIN public.netherhosts nh ON nh.id = hd.host_id
    WHERE hd.id = events.source_daemon_id AND nh.user_id = auth.uid()
  ))
);

-- 7. Update RLS on tasks to reference host_daemons
DROP POLICY IF EXISTS "Users can read own tasks" ON public.tasks;
CREATE POLICY "Users can read own tasks"
ON public.tasks FOR SELECT TO authenticated
USING (
  (swarm_id IS NOT NULL AND owns_swarm(swarm_id))
  OR (daemon_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.host_daemons hd
    JOIN public.netherhosts nh ON nh.id = hd.host_id
    WHERE hd.id = tasks.daemon_id AND nh.user_id = auth.uid()
  ))
);

DROP POLICY IF EXISTS "Users can insert own tasks" ON public.tasks;
CREATE POLICY "Users can insert own tasks"
ON public.tasks FOR INSERT TO authenticated
WITH CHECK (
  (swarm_id IS NOT NULL AND owns_swarm(swarm_id))
  OR (daemon_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.host_daemons hd
    JOIN public.netherhosts nh ON nh.id = hd.host_id
    WHERE hd.id = tasks.daemon_id AND nh.user_id = auth.uid()
  ))
);

DROP POLICY IF EXISTS "Users can update own tasks" ON public.tasks;
CREATE POLICY "Users can update own tasks"
ON public.tasks FOR UPDATE TO authenticated
USING (
  (swarm_id IS NOT NULL AND owns_swarm(swarm_id))
  OR (daemon_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.host_daemons hd
    JOIN public.netherhosts nh ON nh.id = hd.host_id
    WHERE hd.id = tasks.daemon_id AND nh.user_id = auth.uid()
  ))
);

DROP POLICY IF EXISTS "Users can delete own tasks" ON public.tasks;
CREATE POLICY "Users can delete own tasks"
ON public.tasks FOR DELETE TO authenticated
USING (
  (swarm_id IS NOT NULL AND owns_swarm(swarm_id))
  OR (daemon_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.host_daemons hd
    JOIN public.netherhosts nh ON nh.id = hd.host_id
    WHERE hd.id = tasks.daemon_id AND nh.user_id = auth.uid()
  ))
);

-- 8. Add UNIQUE constraint for daemon_ref per host
ALTER TABLE public.host_daemons ADD CONSTRAINT host_daemons_host_id_daemon_ref_unique UNIQUE (host_id, daemon_ref);
