ALTER TABLE public.user_credits ALTER COLUMN credits SET DEFAULT 10;

CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.user_credits (user_id, credits)
  VALUES (NEW.id, 10);
  RETURN NEW;
END;
$function$;

CREATE INDEX IF NOT EXISTS idx_lead_searches_cache
  ON public.lead_searches (country, city, state, created_at DESC);