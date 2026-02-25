
-- 1. DAEMONS (catálogo/contrato)
CREATE TABLE public.daemons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  capabilities jsonb DEFAULT '{}',
  visibility text NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'swarm', 'public')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

ALTER TABLE public.daemons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own daemons" ON public.daemons FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own daemons" ON public.daemons FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own daemons" ON public.daemons FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own daemons" ON public.daemons FOR DELETE USING (auth.uid() = user_id);

-- 2. HOST_DAEMONS (binding: daemon desplegado en host)
CREATE TABLE public.host_daemons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL REFERENCES public.netherhosts(id) ON DELETE CASCADE,
  daemon_id uuid NOT NULL REFERENCES public.daemons(id) ON DELETE CASCADE,
  daemon_ref text,
  status text NOT NULL DEFAULT 'unknown' CHECK (status IN ('online', 'offline', 'unknown', 'error', 'disabled')),
  last_seen timestamptz,
  version text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  disabled boolean NOT NULL DEFAULT false,
  UNIQUE(host_id, daemon_id)
);

CREATE INDEX idx_host_daemons_host_last_seen ON public.host_daemons(host_id, last_seen);

ALTER TABLE public.host_daemons ENABLE ROW LEVEL SECURITY;

-- RLS via join al owner del host
CREATE OR REPLACE FUNCTION public.owns_host(_host_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.netherhosts WHERE id = _host_id AND user_id = auth.uid()
  )
$$;

CREATE POLICY "Users can read own host_daemons" ON public.host_daemons FOR SELECT USING (public.owns_host(host_id));
CREATE POLICY "Users can insert own host_daemons" ON public.host_daemons FOR INSERT WITH CHECK (public.owns_host(host_id));
CREATE POLICY "Users can update own host_daemons" ON public.host_daemons FOR UPDATE USING (public.owns_host(host_id));
CREATE POLICY "Users can delete own host_daemons" ON public.host_daemons FOR DELETE USING (public.owns_host(host_id));

-- 3. SWARM_DAEMONS (many-to-many)
CREATE TABLE public.swarm_daemons (
  swarm_id uuid NOT NULL REFERENCES public.swarms(id) ON DELETE CASCADE,
  daemon_id uuid NOT NULL REFERENCES public.daemons(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (swarm_id, daemon_id)
);

ALTER TABLE public.swarm_daemons ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.owns_swarm(_swarm_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.swarms WHERE id = _swarm_id AND user_id = auth.uid()
  )
$$;

CREATE POLICY "Users can read own swarm_daemons" ON public.swarm_daemons FOR SELECT USING (public.owns_swarm(swarm_id));
CREATE POLICY "Users can insert own swarm_daemons" ON public.swarm_daemons FOR INSERT WITH CHECK (public.owns_swarm(swarm_id));
CREATE POLICY "Users can update own swarm_daemons" ON public.swarm_daemons FOR UPDATE USING (public.owns_swarm(swarm_id));
CREATE POLICY "Users can delete own swarm_daemons" ON public.swarm_daemons FOR DELETE USING (public.owns_swarm(swarm_id));

-- 4. LOGS (genérica)
CREATE TABLE public.logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  level text NOT NULL DEFAULT 'info' CHECK (level IN ('debug', 'info', 'warning', 'error', 'critical')),
  source text NOT NULL,
  source_id uuid,
  message text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_logs_user_created ON public.logs(user_id, created_at DESC);
CREATE INDEX idx_logs_source ON public.logs(source, source_id);

ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own logs" ON public.logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own logs" ON public.logs FOR INSERT WITH CHECK (auth.uid() = user_id);
