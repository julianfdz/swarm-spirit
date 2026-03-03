
-- Add public/private visibility to netherhosts
ALTER TABLE public.netherhosts ADD COLUMN is_public boolean NOT NULL DEFAULT false;

-- Drop existing SELECT policy
DROP POLICY "Users can read own netherhosts" ON public.netherhosts;

-- New SELECT policy: own hosts + public hosts
CREATE POLICY "Users can read own or public netherhosts"
ON public.netherhosts
FOR SELECT
USING (auth.uid() = user_id OR is_public = true);
