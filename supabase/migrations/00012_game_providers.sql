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

