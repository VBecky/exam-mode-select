CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  account_id uuid := auth.uid();
BEGIN
  IF account_id IS NULL THEN
    RAISE EXCEPTION 'Sign in before deleting your account.';
  END IF;
  DELETE FROM auth.users WHERE id = account_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Account not found.';
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.delete_own_account() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;