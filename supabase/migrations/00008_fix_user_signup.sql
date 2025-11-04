/*
  # Fix User Signup - Profile Creation
  
  This ensures user profiles are created automatically when users sign up.
  Since RLS is disabled on user_profiles, we need to ensure the trigger works.
*/

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the function with better error handling
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert user profile (RLS is disabled, so this should work)
  INSERT INTO user_profiles (id, display_name, role, is_premium)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1), 'User'),
    'user',
    false
  )
  ON CONFLICT (id) DO NOTHING; -- Prevent duplicate profile creation
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Error creating user profile: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION create_user_profile();

-- Also create a function that can be called manually if needed
CREATE OR REPLACE FUNCTION ensure_user_profile(user_uuid uuid, display_name text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO user_profiles (id, display_name, role, is_premium)
  VALUES (
    user_uuid,
    COALESCE(display_name, 'User'),
    'user',
    false
  )
  ON CONFLICT (id) DO UPDATE SET
    display_name = COALESCE(EXCLUDED.display_name, user_profiles.display_name);
END;
$$;

