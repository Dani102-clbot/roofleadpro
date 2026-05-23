
-- User credits table
CREATE TABLE public.user_credits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  credits INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credits"
  ON public.user_credits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own credits"
  ON public.user_credits FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Trigger to create credits row on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, credits)
  VALUES (NEW.id, 100);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_credits();
