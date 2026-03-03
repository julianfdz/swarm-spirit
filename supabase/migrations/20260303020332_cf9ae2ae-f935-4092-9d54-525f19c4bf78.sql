
-- host_daemons: add URL columns for A2A protocol
ALTER TABLE public.host_daemons ADD COLUMN IF NOT EXISTS sigil_url TEXT;
ALTER TABLE public.host_daemons ADD COLUMN IF NOT EXISTS invoke_url TEXT;
ALTER TABLE public.host_daemons ADD COLUMN IF NOT EXISTS status_url TEXT;
ALTER TABLE public.host_daemons ADD COLUMN IF NOT EXISTS mcp_url TEXT;

-- Rename last_seen → last_seen_at for consistency with backend
ALTER TABLE public.host_daemons RENAME COLUMN last_seen TO last_seen_at;

-- Unique constraint: one daemon_ref per host (daemon_ref is the text ID the backend uses)
ALTER TABLE public.host_daemons ADD CONSTRAINT host_daemons_host_daemon_ref_unique UNIQUE (host_id, daemon_ref);

-- tasks: add A2A protocol fields
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS method TEXT DEFAULT 'tasks/send';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'nethernet';
