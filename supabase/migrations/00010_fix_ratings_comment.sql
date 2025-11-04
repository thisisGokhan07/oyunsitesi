-- Ratings tablosuna comment kolonu ekle (review yerine comment kullanıyoruz)
ALTER TABLE ratings ADD COLUMN IF NOT EXISTS comment text;

-- Eğer review kolonunda veri varsa comment'e taşı
UPDATE ratings SET comment = review WHERE comment IS NULL AND review IS NOT NULL;

-- Review kolonunu kaldırmayalım, sadece comment ekleyelim (geriye uyumluluk için)

