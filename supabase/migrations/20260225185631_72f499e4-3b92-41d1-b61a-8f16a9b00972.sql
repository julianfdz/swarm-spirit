
-- Host claims table for claim-code flow
CREATE TABLE public.host_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL REFERENCES public.profiles(id),
  code text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  host_id uuid REFERENCES public.netherhosts(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.host_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own claims"
  ON public.host_claims FOR SELECT TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can insert own claims"
  ON public.host_claims FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own claims"
  ON public.host_claims FOR UPDATE TO authenticated
  USING (auth.uid() = created_by);

-- Admin dev notes table (single-row per admin)
CREATE TABLE public.admin_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  content text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage own notes"
  ON public.admin_notes FOR ALL TO authenticated
  USING (is_admin(auth.uid()) AND auth.uid() = user_id)
  WITH CHECK (is_admin(auth.uid()) AND auth.uid() = user_id);
