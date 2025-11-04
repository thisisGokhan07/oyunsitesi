/*
  # Fix RLS Policies - Infinite Recursion Fix
  
  This migration fixes the infinite recursion issue in RLS policies
  by ensuring proper policy definitions and adding missing policies.
*/

-- Drop existing problematic policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Recreate user_profiles policies with proper definitions
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Add missing policies for admin operations
-- Note: Admin operations should use service role or SECURITY DEFINER functions

-- Ensure content_analytics has proper SELECT policy
DROP POLICY IF EXISTS "Analytics are viewable by authenticated users" ON content_analytics;

CREATE POLICY "Analytics are viewable by authenticated users"
  ON content_analytics FOR SELECT
  TO authenticated
  USING (true);

