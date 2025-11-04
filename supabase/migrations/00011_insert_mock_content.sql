-- Mock içerikleri Supabase'e ekle
-- Önce kategorileri ekle (eğer yoksa)

INSERT INTO categories (id, name, slug, description, age_group, icon_name, color_hex, content_count, sort_order, published)
VALUES
  ('cat-1', 'Koşu Oyunları', 'kosu', 'Heyecan verici koşu oyunları', 'child', 'Zap', '#f97316', 0, 1, true),
  ('cat-2', 'Eğitici Oyunlar', 'egitici', 'Öğrenirken eğlen', 'baby', 'Brain', '#3b82f6', 0, 2, true),
  ('cat-3', 'Matematik', 'matematik', 'Matematik oyunları', 'child', 'Calculator', '#10b981', 0, 3, true),
  ('cat-4', 'Boyama', 'boyama', 'Boyama oyunları', 'baby', 'Palette', '#8b5cf6', 0, 4, true),
  ('cat-5', 'Zeka Oyunları', 'zeka', 'Zeka geliştiren oyunlar', 'adult', 'Lightbulb', '#f59e0b', 0, 5, true)
ON CONFLICT (id) DO NOTHING;

-- İçerikleri ekle
INSERT INTO content (
  id, title, slug, description, instructions, content_type, age_group, 
  category_id, thumbnail_url, content_url, duration_minutes, play_count, 
  rating, rating_count, is_premium, is_featured, published, 
  meta_title, meta_description, keywords, created_at, updated_at
)
VALUES
  (
    '1',
    'Subway Surfers',
    'subway-surfers',
    'Dünyayı dolaş, engelleri aş ve en yüksek skoru yap! Renkli grafikler ve heyecan verici oynanış ile saatlerce eğlence.',
    '↑ Yukarı ok tuşu ile zıpla, ↓ Aşağı ok tuşu ile kay, ← → Sol/Sağ ok tuşları ile şerit değiştir.',
    'game',
    'child',
    'cat-1',
    'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=500',
    'https://example.com/games/subway-surfers',
    15,
    125000,
    4.8,
    2450,
    false,
    true,
    true,
    'Subway Surfers - Ücretsiz Online Oyun',
    'Subway Surfers oyna, en yüksek skoru yap!',
    ARRAY['koşu', 'arcade', 'oyun'],
    '2025-01-15T00:00:00Z',
    '2025-01-15T00:00:00Z'
  ),
  (
    '2',
    'Renkli Balonlar',
    'renkli-balonlar',
    'Balonları patlatarak renkleri öğren!',
    'Balonlara tıkla ve patla!',
    'game',
    'baby',
    'cat-2',
    'https://images.pexels.com/photos/1058771/pexels-photo-1058771.jpeg?auto=compress&cs=tinysrgb&w=500',
    'https://example.com/games/balloons',
    5,
    45000,
    4.9,
    890,
    false,
    true,
    true,
    NULL,
    NULL,
    NULL,
    '2025-01-20T00:00:00Z',
    '2025-01-20T00:00:00Z'
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  instructions = EXCLUDED.instructions,
  thumbnail_url = EXCLUDED.thumbnail_url,
  content_url = EXCLUDED.content_url,
  updated_at = now();

-- Kategori içerik sayılarını güncelle
UPDATE categories 
SET content_count = (
  SELECT COUNT(*) 
  FROM content 
  WHERE content.category_id = categories.id AND content.published = true
)
WHERE id IN ('cat-1', 'cat-2', 'cat-3', 'cat-4', 'cat-5');

