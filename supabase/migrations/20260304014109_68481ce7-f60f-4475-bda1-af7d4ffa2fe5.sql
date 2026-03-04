ALTER TABLE public.host_daemons
  ADD COLUMN sigil_json jsonb NULL,
  ADD COLUMN avatar_url text NULL;