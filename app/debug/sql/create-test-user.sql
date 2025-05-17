-- This SQL script creates a test user directly in the database
-- Note: This is for debugging purposes only

-- First, check if the user already exists in auth.users
DO $$
DECLARE
  user_exists BOOLEAN;
  user_id UUID;
BEGIN
  -- Check if user exists
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'test@example.com'
  ) INTO user_exists;

  IF NOT user_exists THEN
    -- Create user in auth.users
    user_id := gen_random_uuid();
    
    INSERT INTO auth.users (
      id, 
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at
    ) VALUES (
      user_id,
      'test@example.com',
      -- This is a hashed version of 'password123'
      crypt('password123', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW()
    );

    -- Create profile
    INSERT INTO public.profiles (
      id,
      username,
      full_name,
      role,
      reputation,
      created_at,
      updated_at
    ) VALUES (
      user_id,
      'testuser',
      'Test User',
      'member',
      0,
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'Test user created successfully';
  ELSE
    RAISE NOTICE 'Test user already exists';
  END IF;
END $$;
