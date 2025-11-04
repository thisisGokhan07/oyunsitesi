# 🚀 Yeni Migration'ları Çalıştırma Talimatları

## 📋 Çalıştırılacak Migration'lar

1. **00012_game_providers.sql** - Oyun Sağlayıcıları Tablosu
2. **00013_ad_placements.sql** - Reklam Yerleri ve Analytics Tabloları

---

## 🎯 YÖNTEM 1: Combined SQL (ÖNERİLEN)

### Adımlar:

1. **Supabase Dashboard'a gidin:**
   - https://supabase.com/dashboard
   - Projenizi seçin

2. **SQL Editor'ü açın:**
   - Sol menüden **SQL Editor** seçin
   - **New query** butonuna tıklayın

3. **Migration dosyasını açın:**
   - Proje klasöründe: `MIGRATION_COMBINED.sql`
   - Dosyanın **tüm içeriğini** kopyalayın

4. **SQL'i çalıştırın:**
   - SQL Editor'e yapıştırın
   - **Run** butonuna tıklayın (veya `Ctrl+Enter`)
   - ✅ Başarılı mesajını bekleyin

5. **Kontrol edin:**
   - Sol menüden **Table Editor** seçin
   - Şu tablolar görünmeli:
     - ✅ `game_providers`
     - ✅ `ad_placements`
     - ✅ `ad_analytics`

---

## 🎯 YÖNTEM 2: Ayrı Ayrı Çalıştırma

Her migration'ı ayrı ayrı çalıştırmak isterseniz:

### Migration 1: Oyun Sağlayıcıları

1. **SQL Editor > New Query**
2. `supabase/migrations/00012_game_providers.sql` dosyasını açın
3. Tüm içeriği kopyalayın ve çalıştırın

### Migration 2: Reklam Yerleri

1. **SQL Editor > New Query**
2. `supabase/migrations/00013_ad_placements.sql` dosyasını açın
3. Tüm içeriği kopyalayın ve çalıştırın

---

## ✅ Oluşturulacak Tablolar

### `game_providers`
- Oyun sağlayıcıları (GameDistribution, GameMonetize, GamePix)
- API yapılandırmaları
- Revenue share bilgileri

### `ad_placements`
- Reklam yerleşimleri
- AdSense ayarları
- İstatistikler (gösterim, tıklama, gelir)

### `ad_analytics`
- Reklam analitik verileri
- Event tracking (impression, click, view, skip, complete)

---

## 📊 Varsayılan Veriler

### Oyun Sağlayıcıları:
- ✅ **GameDistribution** - %70 revenue share
- ✅ **GameMonetize** - %100 revenue share
- ✅ **GamePix** - %80 revenue share

### Reklam Yerleri (Balanced Layout):
- ✅ Sayfa Başı Banner (game-top)
- ✅ Oyun Altı Banner (game-bottom)
- ✅ Sidebar Reklam (game-sidebar)
- ✅ Mobil Üst Banner (game-mobile-top)
- ✅ Mobil Alt Banner (game-mobile-bottom)
- ✅ Ana Sayfa Üst (home-top)
- ✅ Ana Sayfa Orta (home-middle)

---

## ⚠️ Önemli Notlar

1. **IF NOT EXISTS:** Migration'lar güvenli, tekrar çalıştırılabilir
2. **ON CONFLICT:** Varsayılan veriler zaten varsa eklenmez
3. **RLS Policies:** Admin yetkisiyle yönetim yapılabilir

---

## 🔍 Kontrol

Migration'lar başarıyla çalıştırıldıktan sonra:

1. **Table Editor**'de tabloları kontrol edin
2. **game_providers** tablosunda 3 sağlayıcı olmalı
3. **ad_placements** tablosunda 7 reklam yeri olmalı

---

## 🆘 Sorun Giderme

### Hata: "relation already exists"
- ✅ Normal, tablo zaten var demektir
- Migration devam edecek

### Hata: "permission denied"
- ⚠️ Service Role Key ile çalıştırdığınızdan emin olun
- Veya Admin hesabıyla giriş yapın

### Hata: "duplicate key value"
- ✅ Normal, veri zaten var demektir
- `ON CONFLICT DO NOTHING` sayesinde sorun yok

---

## ✅ Tamamlandı!

Migration'lar başarıyla çalıştırıldıktan sonra:

- ✅ Admin Panel > Oyun Sağlayıcıları: `/admin/oyun-saglayicilari`
- ✅ Admin Panel > Reklamlar: `/admin/reklamlar`

Her iki özellik de kullanıma hazır! 🎉

