
-- Netherhosts table
CREATE TABLE public.netherhosts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  domain_cert TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_heartbeat TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.netherhosts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own netherhosts" ON public.netherhosts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own netherhosts" ON public.netherhosts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own netherhosts" ON public.netherhosts
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own netherhosts" ON public.netherhosts
  FOR DELETE USING (auth.uid() = user_id);

-- Swarms table
CREATE TABLE public.swarms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.swarms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own swarms" ON public.swarms
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own swarms" ON public.swarms
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own swarms" ON public.swarms
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own swarms" ON public.swarms
  FOR DELETE USING (auth.uid() = user_id);
