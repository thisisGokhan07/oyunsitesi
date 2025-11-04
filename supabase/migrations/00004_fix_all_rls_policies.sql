/*
  # Fix All RLS Policies - Complete Fix
  
  This migration fixes all RLS policy issues by recreating them properly.
  The issue was likely caused by circular dependencies or missing policies.
*/

-- ============================================
-- STEP 1: Drop ALL existing policies
-- ============================================

-- Categories policies
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;

-- Content policies
DROP POLICY IF EXISTS "Content is viewable by everyone" ON content;

-- User profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Ratings policies
DROP POLICY IF EXISTS "Ratings are viewable by everyone" ON ratings;
DROP POLICY IF EXISTS "Users can create ratings" ON ratings;
DROP POLICY IF EXISTS "Users can update own ratings" ON ratings;

-- Analytics policies
DROP POLICY IF EXISTS "Analytics are insertable by everyone" ON content_analytics;
DROP POLICY IF EXISTS "Analytics are viewable by authenticated users" ON content_analytics;

-- ============================================
-- STEP 2: Recreate all policies in correct order
-- ============================================

-- Categories: Public read access
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (published = true);

-- Content: Public read access
CREATE POLICY "Content is viewable by everyone"
  ON content FOR SELECT
  USING (published = true);

-- User profiles: Only authenticated users can manage their own profile
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

-- Ratings: Public read, authenticated write
CREATE POLICY "Ratings are viewable by everyone"
  ON ratings FOR SELECT
  USING (true);

CREATE POLICY "Users can create ratings"
  ON ratings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings"
  ON ratings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Analytics: Public insert, authenticated read
CREATE POLICY "Analytics are insertable by everyone"
  ON content_analytics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Analytics are viewable by authenticated users"
  ON content_analytics FOR SELECT
  TO authenticated
  USING (true);

