# 📋 SeriGame - Eksikler ve Çalışma Planı

**Tarih:** 2025-11-04  
**Durum:** Migration'lar çalıştırılmalı, eksikler tamamlanmalı

---

## 🔴 KRİTİK - HEMEN YAPILMALI (1-2 saat)

### 1. ✅ Supabase Migration'ları Çalıştır
**Durum:** ⚠️ Manuel olarak çalıştırılmalı

#### Adımlar:
1. **Supabase Dashboard'a git:** https://supabase.com/dashboard
2. **Projenizi seçin:** bnyoqpalfeeisbqanazd
3. **SQL Editor > New Query**
4. **İlk Migration:** `supabase/migrations/00001_initial_schema.sql` dosyasını açın
   - Tüm SQL kodunu kopyalayın
   - SQL Editor'e yapıştırın
   - "Run" butonuna tıklayın
   - ✅ Başarılı mesajını kontrol edin

5. **İkinci Migration:** `supabase/migrations/00002_create_test_admin.sql`
   - Önce test kullanıcısı oluşturun:
     - Authentication > Users > Add User
     - Email: `admin@serigame.com`
     - Password: `Admin123!@#`
   - Sonra migration'ı çalıştırın

#### Oluşturulacak Tablolar:
- ✅ `categories` - Kategoriler
- ✅ `content` - Oyunlar ve içerikler
- ✅ `user_profiles` - Kullanıcı profilleri
- ✅ `ratings` - Puanlar ve yorumlar
- ✅ `content_analytics` - Analitik veriler

#### Oluşturulacak Fonksiyonlar:
- ✅ `increment_play_count()` - Oynama sayısını artırır
- ✅ `update_category_count()` - Kategori içerik sayısını günceller
- ✅ `update_content_rating()` - İçerik puanını günceller

---

### 2. ✅ Supabase Storage Bucket Oluştur
**Durum:** ❌ Yapılmadı

#### Adımlar:
1. Supabase Dashboard > **Storage**
2. **New bucket** butonuna tıklayın
3. **Bucket ayarları:**
   - Name: `content-files`
   - Public bucket: ✅ **Evet** (işaretli olmalı)
   - File size limit: `100 MB`
   - Allowed MIME types: `image/*, video/*, audio/*`

4. **Bucket Policies ekle:**
   - **Public read access:** Herkes okuyabilir
   - **Authenticated upload:** Sadece giriş yapanlar yükleyebilir

---

### 3. ✅ Supabase Authentication Ayarları
**Durum:** ⚠️ Kontrol edilmeli

#### Ayarlar:
1. **Authentication > Settings:**
   - ✅ Email Auth: **Enable**
   - ⚠️ Email Confirmations: **Disable** (test için)
   - ✅ Site URL: `http://localhost:3000`
   - ✅ Redirect URLs: `http://localhost:3000/**`

2. **Providers:**
   - ✅ Email: Enable
   - ⚠️ Google OAuth: (opsiyonel, şimdilik kapalı)

---

### 4. ✅ Test Kullanıcıları Oluştur
**Durum:** ❌ Manuel olarak oluşturulmalı

#### Oluşturulacak Kullanıcılar:

**A. Super Admin:**
- Email: `admin@serigame.com`
- Password: `Admin123!@#`
- Role: `super_admin`
- **Oluşturma:** Authentication > Users > Add User
- **Rol verme:** Migration 2 çalıştırıldıktan sonra otomatik

**B. Editor (Opsiyonel):**
- Email: `editor@serigame.com`
- Password: `Editor123!`
- Role: `editor`
- **SQL ile rol verme:**
```sql
UPDATE user_profiles 
SET role = 'editor' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'editor@serigame.com');
```

**C. Test User (Opsiyonel):**
- Email: `user@test.com`
- Password: `Test1234`
- Role: `user`

---

## 🟡 YÜKSEK ÖNCELİK - 1 HAFTA İÇİNDE

### 5. ❌ İçerik Yönetimi Sayfası (CRUD)
**Durum:** ⚠️ Placeholder var, tam çalışmıyor
**Sayfa:** `/admin/icerikler`
**Tahmini Süre:** 4-6 saat

#### Eksikler:
- ❌ DataTable component (sıralama, filtreleme)
- ❌ Pagination
- ❌ Arama fonksiyonu
- ❌ Filtreler (kategori, yaş grubu, içerik tipi)
- ❌ Toplu işlemler
- ❌ Ekleme formu (tam özellikli)
- ❌ Düzenleme formu
- ❌ Silme onay modal'ı
- ❌ Preview/Test özelliği

#### Yapılması Gerekenler:
1. TanStack Table entegrasyonu
2. Form validasyonu (Zod)
3. File upload (Supabase Storage)
4. Rich text editor (TipTap veya Quill)

---

### 6. ❌ Kategori Yönetimi Sayfası (CRUD)
**Durum:** ⚠️ Placeholder var
**Sayfa:** `/admin/kategoriler`
**Tahmini Süre:** 2-3 saat

#### Eksikler:
- ❌ Drag & drop sıralama
- ❌ Arama
- ❌ Filtreler
- ❌ Icon seçici (Lucide icons)
- ❌ Color picker
- ❌ İçerik sayısı gösterimi

---

### 7. ❌ Kullanıcı Yönetimi Sayfası
**Durum:** ⚠️ Placeholder var
**Sayfa:** `/admin/kullanicilar`
**Tahmini Süre:** 3-4 saat

#### Eksikler:
- ❌ Kullanıcı listesi (DataTable)
- ❌ Filtreler (role, premium, tarih)
- ❌ Kullanıcı detay modal'ı
- ❌ Role değiştirme
- ❌ Premium ver/kaldır
- ❌ Export (CSV, Excel)

---

### 8. ❌ Mock Data'yı Supabase ile Değiştir
**Durum:** ❌ Şu an mock data kullanılıyor
**Tahmini Süre:** 2-3 saat

#### Değiştirilmesi Gereken Sayfalar:
- ❌ `app/page.tsx` - Ana sayfa
- ❌ `app/kategori/[slug]/page.tsx` - Kategori sayfası
- ❌ `app/oyunlar/[slug]/page.tsx` - Oyun detay sayfası
- ❌ `app/arama/page.tsx` - Arama sayfası
- ❌ `components/Header.tsx` - Header arama
- ❌ `components/SearchResults.tsx` - Arama sonuçları

#### Yapılacaklar:
1. `mock-data.ts` import'larını kaldır
2. `lib/supabase/content.ts` fonksiyonlarını kullan
3. Server Components veya useEffect ile fetch
4. Loading states ekle
5. Error handling ekle

---

### 9. ❌ SEO Optimizasyonu
**Durum:** ⚠️ Temel var ama yetersiz
**Tahmini Süre:** 3-4 saat

#### Eksikler:
- ❌ Dynamic metadata (her sayfa için)
- ❌ Sitemap.xml (dynamic)
- ❌ Robots.txt
- ❌ Schema markup (JSON-LD)
- ❌ Open Graph tags
- ❌ Twitter Card tags
- ❌ Image optimization (next/image)

#### Yapılacaklar:
1. `generateMetadata` fonksiyonları ekle
2. `app/sitemap.ts` oluştur
3. `app/robots.ts` oluştur
4. Schema.org markup ekle

---

### 10. ❌ Analytics Dashboard
**Durum:** ⚠️ Placeholder (basit stats)
**Sayfa:** `/admin/analitics`
**Tahmini Süre:** 4-5 saat

#### Eksikler:
- ❌ Gerçek zamanlı istatistikler
- ❌ Grafikler (Recharts)
- ❌ Ziyaretçi trendi
- ❌ Popüler içerikler
- ❌ Kategori dağılımı
- ❌ Yaş grubu analizi
- ❌ Export (PDF, CSV)

---

## 🟢 ORTA ÖNCELİK - 2-4 HAFTA İÇİNDE

### 11. ❌ User Dashboard
**Durum:** ❌ Yok
**Sayfa:** `/dashboard`
**Tahmini Süre:** 6-8 saat

#### Özellikler:
- ❌ Profil sayfası
- ❌ Favoriler
- ❌ İzleme geçmişi
- ❌ Puanlar ve yorumlar
- ❌ İstatistikler
- ❌ Premium yönetimi

---

### 12. ❌ Premium/Abonelik Sistemi
**Durum:** ⚠️ Database var, UI yok
**Tahmini Süre:** 8-10 saat

#### Eksikler:
- ❌ Premium landing page
- ❌ Stripe entegrasyonu
- ❌ Checkout flow
- ❌ Webhook handler
- ❌ Premium content lock

---

### 13. ❌ Yorum ve Puanlama Sistemi
**Durum:** ⚠️ Database var, UI yok
**Tahmini Süre:** 4-5 saat

#### Eksikler:
- ❌ Star rating component
- ❌ Yorum yazma formu
- ❌ Yorum listesi
- ❌ Admin moderasyon

---

## 📊 ÖZET

### Tamamlanan:
- ✅ Frontend (52 sayfa)
- ✅ Authentication (kod hazır)
- ✅ Database schema (migration dosyaları hazır)
- ✅ UI Components (shadcn/ui)
- ✅ Environment variables (.env.local)

### Yapılması Gerekenler (Kritik):
1. ⚠️ **Migration'ları çalıştır** (15 dakika)
2. ⚠️ **Storage bucket oluştur** (5 dakika)
3. ⚠️ **Test kullanıcısı oluştur** (5 dakika)
4. ❌ **İçerik CRUD** (4-6 saat)
5. ❌ **Mock data → Supabase** (2-3 saat)
6. ❌ **SEO optimizasyonu** (3-4 saat)

### Toplam Tahmini Süre (Kritik):
- **Migration ve Setup:** ~30 dakika
- **İçerik CRUD:** 4-6 saat
- **Mock → Real Data:** 2-3 saat
- **SEO:** 3-4 saat
- **Toplam:** ~10-14 saat (1.5-2 gün)

---

## 🚀 HIZLI BAŞLANGIÇ KOMUTLARI

### Migration'ları Çalıştırmak İçin:
```bash
# 1. Supabase Dashboard'a git
# 2. SQL Editor > New Query
# 3. Dosyaları sırayla çalıştır:
#    - supabase/migrations/00001_initial_schema.sql
#    - supabase/migrations/00002_create_test_admin.sql
```

### Test Kullanıcısı Oluşturmak İçin:
```bash
# Supabase Dashboard > Authentication > Users > Add User
# Email: admin@serigame.com
# Password: Admin123!@#
```

### Storage Bucket Oluşturmak İçin:
```bash
# Supabase Dashboard > Storage > New Bucket
# Name: content-files
# Public: Yes
# Max size: 100MB
```

---

## 📝 NOTLAR

- Migration'ları çalıştırdıktan sonra projeyi yeniden başlatın
- Test kullanıcısını oluşturduktan sonra migration 2'yi tekrar çalıştırın
- Storage bucket'ı public yapmayı unutmayın
- Email confirmations'ı test için disable edin

---

**Son Güncelleme:** 2025-11-04  
**Durum:** Migration'lar hazır, çalıştırılmayı bekliyor

