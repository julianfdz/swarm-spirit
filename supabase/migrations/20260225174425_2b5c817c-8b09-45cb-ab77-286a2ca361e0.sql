
-- Drop existing foreign keys and recreate pointing to profiles
ALTER TABLE public.netherhosts DROP CONSTRAINT netherhosts_user_id_fkey;
ALTER TABLE public.netherhosts ADD CONSTRAINT netherhosts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.swarms DROP CONSTRAINT swarms_user_id_fkey;
ALTER TABLE public.swarms ADD CONSTRAINT swarms_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
