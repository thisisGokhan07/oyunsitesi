-- Footer Linkler Tablosu
CREATE TABLE IF NOT EXISTS footer_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  url text NOT NULL,
  section text NOT NULL, -- 'quick_links', 'support', 'social'
  icon_name text, -- Lucide icon name
  sort_order integer DEFAULT 0,
  is_external boolean DEFAULT false,
  published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_footer_links_section ON footer_links(section);
CREATE INDEX IF NOT EXISTS idx_footer_links_published ON footer_links(published);

-- RLS Policies
ALTER TABLE footer_links ENABLE ROW LEVEL SECURITY;

-- Herkes okuyabilir (published olanlar)
CREATE POLICY "Footer links are viewable by everyone" 
  ON footer_links FOR SELECT 
  USING (published = true);

-- Admin'ler yönetebilir
CREATE POLICY "Admins can manage footer links" 
  ON footer_links FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role IN ('super_admin', 'admin')
    )
  );

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_footer_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_footer_links_updated_at
  BEFORE UPDATE ON footer_links
  FOR EACH ROW
  EXECUTE FUNCTION update_footer_links_updated_at();

-- Mock Data
INSERT INTO footer_links (title, url, section, icon_name, sort_order, is_external) VALUES
-- Hızlı Linkler
('Hakkımızda', '/about', 'quick_links', 'Info', 1, false),
('Kategoriler', '/kategori', 'quick_links', 'FolderTree', 2, false),
('Yeni Oyunlar', '/arama?sort=newest', 'quick_links', 'Sparkles', 3, false),
('Popüler', '/arama?sort=popular', 'quick_links', 'TrendingUp', 4, false),
-- Destek
('İletişim', '/contact', 'support', 'Mail', 1, false),
('SSS', '/faq', 'support', 'HelpCircle', 2, false),
('Gizlilik Politikası', '/privacy', 'support', 'Shield', 3, false),
('Kullanım Şartları', '/terms', 'support', 'FileText', 4, false),
-- Sosyal Medya
('Instagram', 'https://instagram.com/serigame', 'social', 'Instagram', 1, true),
('YouTube', 'https://youtube.com/@serigame', 'social', 'Youtube', 2, true),
('TikTok', 'https://tiktok.com/@serigame', 'social', 'Music', 3, true)
ON CONFLICT DO NOTHING;

