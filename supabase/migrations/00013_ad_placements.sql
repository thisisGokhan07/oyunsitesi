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

