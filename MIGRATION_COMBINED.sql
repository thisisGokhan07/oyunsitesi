-- ============================================
-- Combined Migration SQL
-- Tüm migration'ları tek seferde çalıştırmak için
-- ============================================
-- 
-- KULLANIM:
-- 1. Supabase Dashboard > SQL Editor > New Query
-- 2. Bu dosyanın tüm içeriğini kopyalayın
-- 3. SQL Editor'e yapıştırın
-- 4. Run butonuna tıklayın
--
-- ============================================

-- ============================================
-- Migration: 00012_game_providers.sql
-- Oyun Sağlayıcıları Tablosu
-- ============================================

-- Oyun Sağlayıcıları Tablosu
CREATE TABLE IF NOT EXISTS game_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE, -- GameDistribution, GameMonetize, etc.
  slug text NOT NULL UNIQUE, -- gamedistribution, gamemonetize
  api_endpoint text NOT NULL, -- API URL
  api_key text, -- API Key (encrypted olabilir)
  api_secret text, -- Gerekirse API Secret
  auth_type text DEFAULT 'header', -- 'header', 'query', 'bearer'
  auth_header_name text DEFAULT 'X-Api-Key', -- Header adı
  enabled boolean DEFAULT true,
  revenue_share numeric(5,2) DEFAULT 0, -- % cinsinden
  total_games integer DEFAULT 0, -- Toplam oyun sayısı
  imported_games integer DEFAULT 0, -- İçe aktarılan oyun sayısı
  config jsonb, -- Ekstra yapılandırma (category mapping, etc.)
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_game_providers_slug ON game_providers(slug);
CREATE INDEX IF NOT EXISTS idx_game_providers_enabled ON game_providers(enabled);

-- RLS Policies
ALTER TABLE game_providers ENABLE ROW LEVEL SECURITY;

-- Herkes okuyabilir (enabled olanlar)
CREATE POLICY "Game providers are viewable by everyone" 
  ON game_providers FOR SELECT 
  USING (enabled = true);

-- Admin'ler yönetebilir
CREATE POLICY "Admins can manage game providers" 
  ON game_providers FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role IN ('super_admin', 'admin')
    )
  );

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_game_providers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_game_providers_updated_at
  BEFORE UPDATE ON game_providers
  FOR EACH ROW
  EXECUTE FUNCTION update_game_providers_updated_at();

-- Content tablosuna provider_id ekle
ALTER TABLE content ADD COLUMN IF NOT EXISTS provider_id uuid REFERENCES game_providers(id) ON DELETE SET NULL;
ALTER TABLE content ADD COLUMN IF NOT EXISTS provider_game_id text; -- Provider'daki orijinal game ID

CREATE INDEX IF NOT EXISTS idx_content_provider ON content(provider_id);

-- Mock Data - Varsayılan sağlayıcılar
INSERT INTO game_providers (name, slug, api_endpoint, auth_type, auth_header_name, revenue_share, config) VALUES
  (
    'GameDistribution',
    'gamedistribution',
    'https://gamedistribution.com/api/v2.0/games',
    'header',
    'X-Api-Key',
    70.00,
    '{
      "categoryMapping": {
        "action": "child",
        "adventure": "child",
        "arcade": "child",
        "puzzle": "child",
        "racing": "child",
        "sports": "child",
        "strategy": "adult",
        "casual": "family",
        "educational": "baby",
        "kids": "baby"
      },
      "responsePath": "data",
      "fields": {
        "title": "title",
        "description": "description",
        "thumbnail": "assets.cover",
        "url": "url",
        "embedUrl": "embedUrl",
        "category": "category",
        "rating": "rating",
        "duration": "duration",
        "featured": "featured",
        "tags": "tags"
      }
    }'::jsonb
  ),
  (
    'GameMonetize',
    'gamemonetize',
    'https://api.gamemonetize.com/games',
    'query',
    'api_key',
    100.00,
    '{
      "categoryMapping": {
        "action": "child",
        "adventure": "child",
        "arcade": "child",
        "puzzle": "child",
        "racing": "child",
        "sports": "child",
        "strategy": "adult",
        "casual": "family",
        "educational": "baby",
        "kids": "baby"
      },
      "responsePath": "games",
      "fields": {
        "title": "title",
        "description": "description",
        "thumbnail": "thumb",
        "url": "game_link",
        "embedUrl": "embed_url",
        "category": "category",
        "rating": "rating",
        "duration": "duration",
        "featured": "featured",
        "tags": "tags"
      }
    }'::jsonb
  ),
  (
    'GamePix',
    'gamepix',
    'https://api.gamepix.com/v1/games',
    'header',
    'X-API-KEY',
    80.00,
    '{
      "categoryMapping": {
        "action": "child",
        "adventure": "child",
        "arcade": "child",
        "puzzle": "child",
        "racing": "child",
        "sports": "child",
        "strategy": "adult",
        "casual": "family",
        "educational": "baby",
        "kids": "baby"
      },
      "responsePath": "data",
      "fields": {
        "title": "title",
        "description": "description",
        "thumbnail": "thumbnail",
        "url": "url",
        "embedUrl": "embedUrl",
        "category": "category",
        "rating": "rating",
        "duration": "duration",
        "featured": "featured",
        "tags": "tags"
      }
    }'::jsonb
  )
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- Migration: 00013_ad_placements.sql
-- Reklam Yerleri ve Analytics Tabloları
-- ============================================

-- Reklam Yerleri Tablosu
CREATE TABLE IF NOT EXISTS ad_placements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, -- "Sayfa Başı Banner", "Oyun Altı", etc.
  position text NOT NULL UNIQUE, -- "game-top", "game-bottom", "sidebar", "preroll"
  ad_type text NOT NULL CHECK (ad_type IN ('banner', 'video_preroll', 'video_interstitial', 'custom')), -- Banner, Video, Custom
  ad_network text DEFAULT 'adsense', -- 'adsense', 'custom', 'gamedistribution'
  publisher_id text, -- AdSense Publisher ID (ca-pub-...)
  ad_slot_id text, -- AdSense Slot ID
  custom_code text, -- Custom ad code (HTML/JS)
  width integer,
  height integer,
  format text DEFAULT 'auto', -- 'auto', 'horizontal', 'rectangle', 'vertical'
  responsive boolean DEFAULT true,
  enabled boolean DEFAULT true,
  show_on_pages text[], -- ['game', 'home', 'category'] - hangi sayfalarda gösterilecek
  priority integer DEFAULT 0, -- Sıralama
  layout_type text DEFAULT 'balanced', -- 'aggressive', 'balanced', 'minimal'
  skipable boolean DEFAULT false, -- Video ads için atlanabilir mi
  duration integer, -- Video ads için süre (saniye)
  show_interval integer, -- Interstitial için gösterim aralığı (dakika)
  impressions integer DEFAULT 0, -- Toplam gösterim sayısı
  clicks integer DEFAULT 0, -- Toplam tıklama sayısı
  revenue numeric(10,2) DEFAULT 0, -- Toplam gelir
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_ad_placements_position ON ad_placements(position);
CREATE INDEX IF NOT EXISTS idx_ad_placements_enabled ON ad_placements(enabled);
CREATE INDEX IF NOT EXISTS idx_ad_placements_show_on ON ad_placements USING GIN(show_on_pages);

-- RLS Policies
ALTER TABLE ad_placements ENABLE ROW LEVEL SECURITY;

-- Herkes okuyabilir (enabled olanlar)
CREATE POLICY "Ad placements are viewable by everyone" 
  ON ad_placements FOR SELECT 
  USING (enabled = true);

-- Admin'ler yönetebilir
CREATE POLICY "Admins can manage ad placements" 
  ON ad_placements FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role IN ('super_admin', 'admin')
    )
  );

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_ad_placements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ad_placements_updated_at
  BEFORE UPDATE ON ad_placements
  FOR EACH ROW
  EXECUTE FUNCTION update_ad_placements_updated_at();

-- Reklam Analytics Tablosu
CREATE TABLE IF NOT EXISTS ad_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  placement_id uuid REFERENCES ad_placements(id) ON DELETE CASCADE,
  content_id uuid REFERENCES content(id) ON DELETE SET NULL,
  user_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  session_id text,
  event_type text NOT NULL CHECK (event_type IN ('impression', 'click', 'view', 'skip', 'complete')),
  revenue numeric(10,4) DEFAULT 0, -- Bu event'ten gelen gelir
  user_agent text,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ad_analytics_placement ON ad_analytics(placement_id);
CREATE INDEX IF NOT EXISTS idx_ad_analytics_content ON ad_analytics(content_id);
CREATE INDEX IF NOT EXISTS idx_ad_analytics_created ON ad_analytics(created_at);

-- RLS Policies for analytics
ALTER TABLE ad_analytics ENABLE ROW LEVEL SECURITY;

-- Herkes insert edebilir (analytics tracking)
CREATE POLICY "Ad analytics are insertable by everyone" 
  ON ad_analytics FOR INSERT 
  WITH CHECK (true);

-- Admin'ler okuyabilir
CREATE POLICY "Admins can view ad analytics" 
  ON ad_analytics FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role IN ('super_admin', 'admin')
    )
  );

-- Varsayılan reklam yerleri (Balanced Layout)
INSERT INTO ad_placements (name, position, ad_type, ad_network, width, height, format, responsive, enabled, show_on_pages, priority, layout_type) VALUES
  -- Oyun Sayfası Reklamları
  ('Sayfa Başı Banner', 'game-top', 'banner', 'adsense', 728, 90, 'horizontal', true, true, ARRAY['game'], 1, 'balanced'),
  ('Oyun Altı Banner', 'game-bottom', 'banner', 'adsense', 728, 90, 'horizontal', true, true, ARRAY['game'], 2, 'balanced'),
  ('Sidebar Reklam', 'game-sidebar', 'banner', 'adsense', 300, 250, 'rectangle', true, true, ARRAY['game'], 3, 'balanced'),
  ('Mobil Üst Banner', 'game-mobile-top', 'banner', 'adsense', 320, 100, 'horizontal', true, true, ARRAY['game'], 4, 'balanced'),
  ('Mobil Alt Banner', 'game-mobile-bottom', 'banner', 'adsense', 320, 100, 'horizontal', true, true, ARRAY['game'], 5, 'balanced'),
  -- Ana Sayfa Reklamları
  ('Ana Sayfa Üst', 'home-top', 'banner', 'adsense', 728, 90, 'horizontal', true, true, ARRAY['home'], 1, 'balanced'),
  ('Ana Sayfa Orta', 'home-middle', 'banner', 'adsense', 728, 90, 'horizontal', true, true, ARRAY['home'], 2, 'balanced')
ON CONFLICT (position) DO NOTHING;

-- ============================================
-- Migration Tamamlandı!
-- ============================================
-- 
-- Oluşturulan Tablolar:
-- ✅ game_providers - Oyun sağlayıcıları
-- ✅ ad_placements - Reklam yerleri
-- ✅ ad_analytics - Reklam analitikleri
--
-- Oluşturulan Varsayılan Veriler:
-- ✅ GameDistribution, GameMonetize, GamePix sağlayıcıları
-- ✅ 7 varsayılan reklam yeri (Balanced Layout)
--
-- ============================================

