ALTER TABLE public.tasks
  ADD COLUMN is_template    boolean NOT NULL DEFAULT false,
  ADD COLUMN schedule_type  text NULL,
  ADD COLUMN schedule_value text NULL,
  ADD COLUMN next_run_at    timestamptz NULL,
  ADD COLUMN last_run_at    timestamptz NULL;