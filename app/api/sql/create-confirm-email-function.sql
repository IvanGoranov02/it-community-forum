-- Create a function to confirm a user's email
CREATE OR REPLACE FUNCTION confirm_user_email(user_id UUID DEFAULT NULL, user_email TEXT DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  -- If user_id is provided, use it directly
  IF user_id IS NOT NULL THEN
    UPDATE auth.users
    SET email_confirmed_at = NOW(),
        updated_at = NOW()
    WHERE id = user_id;
  -- Otherwise, use email to find the user
  ELSIF user_email IS NOT NULL THEN
    UPDATE auth.users
    SET email_confirmed_at = NOW(),
        updated_at = NOW()
    WHERE email = user_email;
  ELSE
    RAISE EXCEPTION 'Either user_id or user_email must be provided';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to the function
GRANT EXECUTE ON FUNCTION confirm_user_email TO service_role;
