/*
  # Initial SeriGame Database Schema

  1. New Tables
    - `categories`: Game categories (Matematik, Boyama, etc.)
    - `content`: Games and educational content
    - `user_profiles`: User data and preferences
    - `ratings`: User ratings for content
    - `content_analytics`: Usage tracking

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access
    - Add policies for authenticated user actions
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  age_group text NOT NULL CHECK (age_group IN ('baby', 'child', 'adult', 'family')),
  icon_name text,
  color_hex text,
  content_count integer DEFAULT 0,
  sort_order integer DEFAULT 0,
  published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create content table
CREATE TABLE IF NOT EXISTS content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  instructions text,
  content_type text NOT NULL CHECK (content_type IN ('game', 'video', 'audio_story', 'coloring_book')),
  age_group text NOT NULL CHECK (age_group IN ('baby', 'child', 'adult', 'family')),
  category_id uuid REFERENCES categories(id),
  thumbnail_url text NOT NULL,
  content_url text NOT NULL,
  duration_minutes integer,
  play_count integer DEFAULT 0,
  rating numeric(3,2) DEFAULT 0,
  rating_count integer DEFAULT 0,
  is_premium boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  published boolean DEFAULT true,
  meta_title text,
  meta_description text,
  keywords text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  display_name text,
  avatar_url text,
  birth_year integer,
  role text DEFAULT 'user' CHECK (role IN ('guest', 'user', 'premium', 'editor', 'moderator', 'admin', 'super_admin')),
  is_premium boolean DEFAULT false,
  premium_expires_at timestamptz,
  favorite_content uuid[],
  parental_controls jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(content_id, user_id)
);

-- Create content_analytics table
CREATE TABLE IF NOT EXISTS content_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  user_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  session_id text,
  user_agent text,
  referrer text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_category ON content(category_id);
CREATE INDEX IF NOT EXISTS idx_content_slug ON content(slug);
CREATE INDEX IF NOT EXISTS idx_content_published ON content(published);
CREATE INDEX IF NOT EXISTS idx_content_featured ON content(is_featured);
CREATE INDEX IF NOT EXISTS idx_content_play_count ON content(play_count DESC);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_ratings_content ON ratings(content_id);
CREATE INDEX IF NOT EXISTS idx_analytics_content ON content_analytics(content_id);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories (public read)
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (published = true);

-- RLS Policies for content (public read)
CREATE POLICY "Content is viewable by everyone"
  ON content FOR SELECT
  USING (published = true);

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for ratings
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

-- RLS Policies for analytics (no public access)
CREATE POLICY "Analytics are insertable by everyone"
  ON content_analytics FOR INSERT
  WITH CHECK (true);

-- Function to increment play count
CREATE OR REPLACE FUNCTION increment_play_count(content_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE content
  SET play_count = play_count + 1
  WHERE id = content_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update category content count
CREATE OR REPLACE FUNCTION update_category_count()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE categories
    SET content_count = content_count + 1
    WHERE id = NEW.category_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE categories
    SET content_count = content_count - 1
    WHERE id = OLD.category_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.category_id != NEW.category_id THEN
    UPDATE categories
    SET content_count = content_count - 1
    WHERE id = OLD.category_id;
    UPDATE categories
    SET content_count = content_count + 1
    WHERE id = NEW.category_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to keep category counts updated
CREATE TRIGGER update_category_count_trigger
AFTER INSERT OR DELETE OR UPDATE ON content
FOR EACH ROW EXECUTE FUNCTION update_category_count();

-- Function to update rating averages
CREATE OR REPLACE FUNCTION update_content_rating()
RETURNS trigger AS $$
BEGIN
  UPDATE content
  SET
    rating = (SELECT COALESCE(AVG(rating), 0) FROM ratings WHERE content_id = NEW.content_id),
    rating_count = (SELECT COUNT(*) FROM ratings WHERE content_id = NEW.content_id)
  WHERE id = NEW.content_id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to keep ratings updated
CREATE TRIGGER update_content_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON ratings
FOR EACH ROW EXECUTE FUNCTION update_content_rating();
