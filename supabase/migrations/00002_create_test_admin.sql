/*
  # Create Test Admin User

  IMPORTANT: Run this AFTER creating a user through Supabase Auth Dashboard or signup

  Steps:
  1. Go to Supabase Dashboard > Authentication > Users
  2. Create a new user:
     - Email: admin@serigame.com
     - Password: Admin123!@#
  3. Copy the user ID
  4. Replace 'YOUR_USER_ID_HERE' below with the actual UUID
  5. Run this migration

  Or use this SQL to update an existing user to super_admin:
*/

-- Example: Update existing user to super_admin
-- Replace the email with your actual admin email
UPDATE user_profiles
SET role = 'super_admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'admin@serigame.com' LIMIT 1
);

-- If the user_profiles row doesn't exist yet, create it
INSERT INTO user_profiles (id, display_name, role)
SELECT
  id,
  'Super Admin',
  'super_admin'
FROM auth.users
WHERE email = 'admin@serigame.com'
ON CONFLICT (id) DO UPDATE SET role = 'super_admin';
