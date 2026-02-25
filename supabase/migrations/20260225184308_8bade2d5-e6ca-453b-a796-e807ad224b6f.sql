
-- 1. Create is_admin function matching by UUID
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT _user_id = '8dbad350-5257-4b0a-8b95-1758e8615d0e'::uuid
$$;

-- 2. Admin can read all profiles
CREATE POLICY "Admin can read all profiles"
  ON public.profiles
  FOR SELECT
  USING (public.is_admin(auth.uid()));

-- 3. Admin can read all logs
CREATE POLICY "Admin can read all logs"
  ON public.logs
  FOR SELECT
  USING (public.is_admin(auth.uid()));

-- 4. Insert a test log
INSERT INTO public.logs (user_id, source, source_id, level, message, metadata)
VALUES (
  '8dbad350-5257-4b0a-8b95-1758e8615d0e',
  'system',
  NULL,
  'info',
  'Sistema iniciado correctamente — log de prueba',
  '{"origin": "migration", "test": true}'::jsonb
);
