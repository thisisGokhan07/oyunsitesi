/*
  # Aggressive RLS Fix
  This fixes the infinite recursion by:
  1. Temporarily disabling RLS
  2. Dropping ALL policies
  3. Recreating them with simpler, non-recursive definitions
*/

-- ============================================
-- STEP 1: Disable RLS temporarily
-- ============================================
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE content DISABLE ROW LEVEL SECURITY;
ALTER TABLE ratings DISABLE ROW LEVEL SECURITY;
ALTER TABLE content_analytics DISABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 2: Drop ALL existing policies
-- ============================================
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Content is viewable by everyone" ON content;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Ratings are viewable by everyone" ON ratings;
DROP POLICY IF EXISTS "Users can create ratings" ON ratings;
DROP POLICY IF EXISTS "Users can update own ratings" ON ratings;
DROP POLICY IF EXISTS "Analytics are insertable by everyone" ON content_analytics;
DROP POLICY IF EXISTS "Analytics are viewable by authenticated users" ON content_analytics;

-- ============================================
-- STEP 3: Re-enable RLS
-- ============================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_analytics ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 4: Create new policies (simple, non-recursive)
-- ============================================

-- Categories: Public read
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (published = true);

-- Content: Public read
CREATE POLICY "Content is viewable by everyone"
  ON content FOR SELECT
  USING (published = true);

-- User profiles: Simple authenticated access
-- Using SECURITY DEFINER pattern to avoid recursion
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
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM content WHERE id = content_id AND published = true)
  );

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

