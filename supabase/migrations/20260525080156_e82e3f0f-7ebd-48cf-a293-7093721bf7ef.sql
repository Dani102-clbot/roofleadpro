-- Remove direct UPDATE access on user_credits and replace with a SECURITY DEFINER function
DROP POLICY IF EXISTS "Users can update own credits" ON public.user_credits;

CREATE OR REPLACE FUNCTION public.deduct_credits(_amount integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user uuid := auth.uid();
  _new_balance integer;
BEGIN
  IF _user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF _amount IS NULL OR _amount <= 0 THEN
    RAISE EXCEPTION 'Invalid amount';
  END IF;

  UPDATE public.user_credits
    SET credits = credits - _amount,
        updated_at = now()
    WHERE user_id = _user AND credits >= _amount
    RETURNING credits INTO _new_balance;

  IF _new_balance IS NULL THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;

  RETURN _new_balance;
END;
$$;

REVOKE ALL ON FUNCTION public.deduct_credits(integer) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.deduct_credits(integer) TO authenticated;