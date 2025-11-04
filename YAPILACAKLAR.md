# 📋 SeriGame Platform - Yapılacaklar ve Eksikler Listesi

**Tarih:** 2025-10-30
**Versiyon:** 1.0.0
**Durum:** %75 Tamamlandı

---

## 🎯 ÖNCELİK SEVİYELERİ

- 🔴 **Kritik** - Sistemin çalışması için gerekli
- 🟡 **Yüksek** - Çok önemli, kısa sürede yapılmalı
- 🟢 **Orta** - Önemli ama acil değil
- 🔵 **Düşük** - İyileştirme, nice-to-have

---

## 🔴 KRİTİK - HEMEN YAPILMALI

### 1. Supabase Kurulumu ve Konfigürasyonu
**Durum:** ❌ Yapılmadı
**Tahmini Süre:** 15 dakika
**Neden Kritik:** Platform çalışmıyor

#### Adımlar:
```bash
1. Supabase Dashboard'a git
2. SQL Editor > Migration dosyalarını çalıştır:
   - 00001_initial_schema.sql
   - 00002_create_test_admin.sql
3. Storage > Bucket oluştur:
   - Name: content-files
   - Public: Yes
   - Max size: 100MB
4. Authentication > Settings:
   - Email Auth: Enable
   - Email Confirmations: Disable (test için)
   - Site URL: http://localhost:3000
   - Redirect URLs: http://localhost:3000/**
```

**Sonuç:** Auth, database, storage kullanıma hazır olacak.

---

### 2. Test Kullanıcıları Oluşturma
**Durum:** ❌ Yapılmadı
**Tahmini Süre:** 5 dakika
**Neden Kritik:** Sistemi test edemiyoruz

#### Oluşturulacak Kullanıcılar:

**A. Super Admin:**
```
Email: admin@serigame.com
Password: Admin123!@#
Role: super_admin
```

**B. Normal Admin:**
```
Email: editor@serigame.com
Password: Editor123!
Role: editor
```

**C. Test User:**
```
Email: user@test.com
Password: Test1234
Role: user
```

**D. Premium User:**
```
Email: premium@test.com
Password: Premium1234
Role: premium
```

#### SQL Script:
```sql
-- Admin kullanıcısına super_admin rolü ver
UPDATE user_profiles SET role = 'super_admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@serigame.com');

-- Editor kullanıcısına editor rolü ver
UPDATE user_profiles SET role = 'editor'
WHERE id = (SELECT id FROM auth.users WHERE email = 'editor@serigame.com');

-- Premium kullanıcısına premium flag ver
UPDATE user_profiles SET is_premium = true, premium_expires_at = '2026-12-31'
WHERE id = (SELECT id FROM auth.users WHERE email = 'premium@test.com');
```

---

### 3. Environment Variables Kontrolü
**Durum:** ⚠️ .env var ama kontrol gerekli
**Tahmini Süre:** 2 dakika
**Neden Kritik:** Yanlış key'ler sistemi bozar

#### Kontrol Edilmesi Gerekenler:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Yapılacak:**
1. Supabase Dashboard > Settings > API
2. Project URL ve anon key'i kopyala
3. `.env` dosyasına yapıştır
4. Dev server'ı restart et

---

## 🟡 YÜKSEK ÖNCELİK - 1 HAFTA İÇİNDE YAPILMALI

### 4. İçerik Yönetimi Sayfası (CRUD)
**Durum:** ⚠️ Placeholder
**Tahmini Süre:** 4-6 saat
**Sayfa:** `/admin/icerikler`

#### Yapılması Gerekenler:

**A. Liste Görünümü:**
- ✅ Supabase'den içerikleri çek (`getAllContent`)
- ❌ DataTable component (sıralama, filtreleme)
- ❌ Pagination (sayfa başına 20 kayıt)
- ❌ Arama (başlık, slug)
- ❌ Filtreler:
  - Kategori seçici
  - Yaş grubu
  - İçerik tipi (game, video, audio, coloring)
  - Durum (published/draft)
  - Featured toggle
- ❌ Toplu işlemler:
  - Toplu silme
  - Toplu yayınla/kaldır
  - Toplu kategori değiştir

**B. Ekleme Formu:**
- ❌ Başlık (TR, EN için çoklu dil desteği?)
- ❌ Slug (otomatik oluşturulsun)
- ❌ Açıklama (rich text editor)
- ❌ Talimatlar/Kurallar
- ❌ Kategori seçici (dropdown)
- ❌ Yaş grubu seçici
- ❌ İçerik tipi (game/video/audio/coloring)
- ❌ Thumbnail upload (drag & drop)
- ❌ İçerik URL (oyun için iframe URL)
- ❌ Video upload (video için)
- ❌ Audio upload (masal için)
- ❌ Süre (dakika)
- ❌ Premium flag
- ❌ Featured flag
- ❌ SEO alanları:
  - Meta title
  - Meta description
  - Keywords (tag input)
- ❌ Yayınla/Taslak toggle

**C. Düzenleme:**
- ❌ Mevcut içeriği yükle
- ❌ Tüm alanları düzenle
- ❌ Thumbnail değiştirme
- ❌ Preview modu

**D. Silme:**
- ❌ Onay modal'ı
- ❌ Soft delete mi hard delete mi?
- ❌ İlişkili verileri temizle (ratings, analytics)

**E. Preview/Test:**
- ❌ İçeriği önizleme butonu
- ❌ Oyunları test etme modal'ı

**Teknolojiler:**
- Form: React Hook Form + Zod
- Upload: Supabase Storage
- Editor: TipTap veya Quill
- Table: TanStack Table

---

### 5. Kategori Yönetimi Sayfası (CRUD)
**Durum:** ⚠️ Placeholder
**Tahmini Süre:** 2-3 saat
**Sayfa:** `/admin/kategoriler`

#### Yapılması Gerekenler:

**A. Liste Görünümü:**
- ❌ Grid veya Table view toggle
- ❌ Kategorileri listele (icon, name, count, age group)
- ❌ Drag & drop sıralama (sort_order güncelle)
- ❌ Arama (kategori adı)
- ❌ Yaş grubu filtresi

**B. Ekleme/Düzenleme Modal:**
- ❌ Kategori adı (TR, EN?)
- ❌ Slug (otomatik)
- ❌ Açıklama
- ❌ Yaş grubu seçici
- ❌ Icon seçici (Lucide icons listesi)
- ❌ Renk seçici (color picker)
- ❌ Sıralama numarası
- ❌ Yayınla toggle

**C. Silme:**
- ❌ Onay modal'ı
- ❌ İçerik varsa uyarı göster
- ❌ İçerikleri başka kategoriye taşıma seçeneği

**D. İstatistikler:**
- ❌ Her kategoride kaç içerik var
- ❌ En çok görüntülenen kategoriler
- ❌ Boş kategorileri göster

---

### 6. Kullanıcı Yönetimi Sayfası
**Durum:** ⚠️ Placeholder
**Tahmini Süre:** 3-4 saat
**Sayfa:** `/admin/kullanicilar`

#### Yapılması Gerekenler:

**A. Liste Görünümü:**
- ❌ Kullanıcı listesi (DataTable)
- ❌ Kolonlar:
  - Avatar
  - Email
  - Display name
  - Role
  - Premium status
  - Kayıt tarihi
  - Son giriş
  - İzleme sayısı
- ❌ Arama (email, isim)
- ❌ Filtreler:
  - Role (user, premium, admin, vb.)
  - Premium status
  - Kayıt tarihi aralığı
  - Aktif/Inactive
- ❌ Sıralama (tarihe, role göre)
- ❌ Pagination

**B. Kullanıcı Detay Modal:**
- ❌ Kullanıcı bilgileri
- ❌ İstatistikler:
  - Toplam izleme
  - Favoriler
  - Verdiği puanlar
  - Yorumları
- ❌ Aktivite log'u
- ❌ Role değiştirme
- ❌ Premium ver/kaldır
- ❌ Kullanıcıyı askıya al/ban

**C. Toplu İşlemler:**
- ❌ Toplu email gönder
- ❌ Toplu premium ver
- ❌ Toplu ban

**D. Export:**
- ❌ Excel export
- ❌ CSV export
- ❌ Filtrelenmiş listeyi export

---

### 7. Analytics Dashboard
**Durum:** ⚠️ Placeholder (sadece basit stats var)
**Tahmini Süre:** 4-5 saat
**Sayfa:** `/admin/analitics`

#### Yapılması Gerekenler:

**A. Genel İstatistikler (Cards):**
- ❌ Bugünkü ziyaretçi (benzersiz IP)
- ❌ Bugünkü oyun oynama sayısı
- ❌ Yeni kayıtlar (bugün/hafta/ay)
- ❌ Aktif kullanıcılar (şu an online)
- ❌ Toplam gelir (premium subscriptions)

**B. Grafikler:**
- ❌ Ziyaretçi trendi (son 30 gün) - Line chart
- ❌ En popüler içerikler - Bar chart
- ❌ En popüler kategoriler - Pie chart
- ❌ Yaş grubu dağılımı - Donut chart
- ❌ Kayıt trendi - Area chart
- ❌ Gelir trendi - Line chart
- ❌ Saatlik trafik (heat map)
- ❌ Cihaz dağılımı (mobile/desktop/tablet)

**C. Gerçek Zamanlı:**
- ❌ Şu an aktif kullanıcılar
- ❌ Şu an oynanan oyunlar (live feed)
- ❌ Son kayıtlar
- ❌ Son yorumlar/puanlar

**D. Raporlar:**
- ❌ Haftalık rapor oluştur
- ❌ Aylık rapor oluştur
- ❌ Custom tarih aralığı
- ❌ PDF export
- ❌ Email ile gönder

**E. Segment Analizi:**
- ❌ Yaş gruplarına göre içerik tercihleri
- ❌ Premium vs Free kullanıcı davranışları
- ❌ Retention rate
- ❌ Churn analysis

**Teknolojiler:**
- Charts: Recharts (zaten var)
- Real-time: Supabase Realtime
- Export: jsPDF

---

### 8. Mock Data'yı Supabase ile Değiştir
**Durum:** ❌ Şu an mock data kullanılıyor
**Tahmini Süre:** 2-3 saat

#### Değiştirilmesi Gerekenler:

**A. Ana Sayfa (`app/page.tsx`):**
```typescript
// ❌ Şu an:
import { mockContent, mockCategories } from '@/lib/mock-data';

// ✅ Olmalı:
import { getAllContent, getAllCategories } from '@/lib/supabase/content';

// Server Component yap veya useEffect ile fetch et
```

**B. Kategori Sayfası (`app/kategori/[slug]/page.tsx`):**
```typescript
// ❌ Mock data kullanıyor
// ✅ Supabase'den kategori ve içeriklerini çek
```

**C. Oyun Detay Sayfası (`app/oyunlar/[slug]/page.tsx`):**
```typescript
// ❌ Mock data kullanıyor
// ✅ Supabase'den oyun detaylarını çek
// ✅ İlgili oyunları çek
// ✅ Play count artır
// ✅ Analytics kaydet
```

**D. Arama Sayfası (`app/arama/page.tsx`):**
```typescript
// ❌ Mock data'da arama yapıyor
// ✅ searchContent() fonksiyonunu kullan
```

**E. Admin Dashboard:**
```typescript
// ❌ Mock stats
// ✅ Gerçek Supabase stats
```

---

### 9. SEO Optimizasyonu
**Durum:** ⚠️ Temel var ama yetersiz
**Tahmini Süre:** 3-4 saat

#### Yapılması Gerekenler:

**A. Metadata:**
```typescript
// Her sayfa için dynamic metadata
export async function generateMetadata({ params }) {
  const content = await getContent(params.slug);
  return {
    title: content.meta_title || content.title,
    description: content.meta_description,
    keywords: content.keywords,
    openGraph: {
      title: content.title,
      description: content.description,
      images: [content.thumbnail_url],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: content.title,
      description: content.description,
      images: [content.thumbnail_url],
    },
  };
}
```

**B. Sitemap:**
- ❌ `sitemap.xml` oluştur
- ❌ Dynamic sitemap (Supabase'den URL'leri çek)
- ❌ Günlük otomatik güncelleme

**C. Robots.txt:**
- ❌ `robots.txt` düzenle
- ❌ Admin sayfalarını kapat
- ❌ Sitemap URL'ini ekle

**D. Schema Markup:**
- ❌ VideoObject schema (video içerikler için)
- ❌ Game schema (oyunlar için)
- ❌ Organization schema
- ❌ BreadcrumbList schema

**E. Performance:**
- ❌ Image optimization (next/image kullan)
- ❌ Lazy loading (iframe'ler için)
- ❌ Code splitting optimize et

**F. metadataBase:**
```typescript
// app/layout.tsx
export const metadata = {
  metadataBase: new URL('https://serigame.com'), // veya test URL'i
}
```

---

## 🟢 ORTA ÖNCELİK - 2-4 HAFTA İÇİNDE YAPILMALI

### 10. User Dashboard
**Durum:** ❌ Yok
**Tahmini Süre:** 6-8 saat
**Route:** `/dashboard`

#### Özellikler:

**A. Profil Sayfası:**
- ❌ Profil fotoğrafı yükleme
- ❌ İsim/email değiştirme
- ❌ Şifre değiştirme
- ❌ Doğum yılı (yaş hesaplama için)
- ❌ Hesap silme

**B. Favoriler:**
- ❌ Favori oyunları listele
- ❌ Favorilerden kaldır
- ❌ Favori kategoriler

**C. İzleme Geçmişi:**
- ❌ Son oynadığı oyunlar
- ❌ İzlediği videolar
- ❌ Dinlediği masallar
- ❌ Geçmişi temizle

**D. Puanlama ve Yorumlar:**
- ❌ Verdiği puanları listele
- ❌ Yazdığı yorumları göster
- ❌ Düzenle/sil

**E. İstatistikler:**
- ❌ Toplam oyun oynama süresi
- ❌ En çok oynadığı kategoriler
- ❌ Rozet/Achievement sistemi (opsiyonel)

**F. Premium Yönetimi:**
- ❌ Premium durumu göster
- ❌ Abonelik bitişi
- ❌ Upgrade butonu
- ❌ Fatura geçmişi

---

### 11. Premium/Abonelik Sistemi
**Durum:** ⚠️ Database var, UI yok
**Tahmini Süre:** 8-10 saat

#### Yapılması Gerekenler:

**A. Premium Landing Page (`/premium`):**
- ❌ Özellikler listesi:
  - Reklamsız deneyim
  - Tüm premium içeriklere erişim
  - HD video kalitesi
  - Offline download (gelecekte)
  - Öncelikli destek
- ❌ Fiyatlandırma tablosu:
  - Aylık: 29.99 TL
  - 6 Aylık: 149.99 TL (%15 indirim)
  - Yıllık: 249.99 TL (%30 indirim)
- ❌ FAQ section
- ❌ Testimonials
- ❌ CTA butonları

**B. Stripe Entegrasyonu:**
```env
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Adımlar:**
1. ❌ Stripe account oluştur
2. ❌ Products & Prices oluştur
3. ❌ Checkout Session API
4. ❌ Webhook handler (success/failed events)
5. ❌ Customer Portal integration

**C. Checkout Flow:**
- ❌ `/checkout` sayfası
- ❌ Stripe Checkout entegrasyonu
- ❌ Success redirect (`/checkout/success`)
- ❌ Cancel redirect (`/checkout/cancel`)

**D. Webhook Handler:**
```typescript
// app/api/webhooks/stripe/route.ts
- ❌ checkout.session.completed event
- ❌ customer.subscription.updated event
- ❌ customer.subscription.deleted event
- ❌ invoice.paid event
```

**E. Database Update:**
```sql
-- Premium verildikinde:
UPDATE user_profiles SET
  is_premium = true,
  premium_expires_at = NOW() + INTERVAL '1 month' -- veya 6 month, 1 year
WHERE id = user_id;
```

**F. Premium Content Lock:**
- ❌ Premium içerikleri işaretle (is_premium flag)
- ❌ Premium olmayanlara "Upgrade" modal göster
- ❌ Premium kullanıcılara full erişim

---

### 12. Yorum ve Puanlama Sistemi
**Durum:** ⚠️ Database var, UI yok
**Tahmini Süre:** 4-5 saat

#### Yapılması Gerekenler:

**A. Oyun Detay Sayfasında:**
- ❌ Star rating component (1-5 yıldız)
- ❌ Yorum yazma formu
- ❌ Yorumları listeleme
- ❌ Yorumları sıralama (en yeni, en beğenilen)
- ❌ Yorum beğenme/şikayet butonu
- ❌ Sadece giriş yapanlar yorum yapabilir

**B. Admin Moderasyon:**
- ❌ `/admin/yorumlar` sayfası
- ❌ Tüm yorumları listele
- ❌ Spam olarak işaretle
- ❌ Yorumu sil
- ❌ Kullanıcıyı yasakla
- ❌ Otomatik spam detection (opsiyonel)

**C. Bildirimler:**
- ❌ Yeni yorum geldiğinde mail
- ❌ Yorumunuza yanıt geldiğinde bildirim

---

### 13. Arama Özelliklerini Geliştir
**Durum:** ⚠️ Basit arama var
**Tahmini Süre:** 3-4 saat
**Sayfa:** `/arama`

#### Yapılması Gerekenler:

**A. Gelişmiş Filtreler:**
- ❌ Kategori seçici (multiple)
- ❌ Yaş grubu seçici
- ❌ İçerik tipi (game/video/audio)
- ❌ Sıralama:
  - En popüler
  - En yeni
  - En yüksek puanlı
  - Alfabetik
- ❌ Premium/Free toggle
- ❌ Süre filtresi (0-5dk, 5-15dk, 15dk+)

**B. Autocomplete:**
- ❌ Yazarken öneri göster
- ❌ Son aramalar
- ❌ Popüler aramalar
- ❌ Kategori önerileri

**C. Arama Sonuçları:**
- ❌ Grid/List view toggle
- ❌ Sonuç sayısı göster
- ❌ Pagination
- ❌ "Sonuç bulunamadı" mesajı + öneri oyunlar

**D. Analytics:**
- ❌ Arama kaydet (content_analytics tablosuna)
- ❌ Popüler arama terimleri
- ❌ Sonuç bulunamayan aramalar (SEO için)

---

### 14. Çoklu Dil Desteği
**Durum:** ⚠️ Placeholder sayfalar var
**Tahmini Süre:** 10-15 saat
**Sayfalar:** `/admin/diller`, `/admin/ceviriler`

#### Yapılması Gerekenler:

**A. Database Schema:**
```sql
-- Diller tablosu zaten var mı? Yoksa ekle:
CREATE TABLE languages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL, -- tr, en, de, fr
  name text NOT NULL, -- Türkçe, English
  native_name text NOT NULL, -- Türkçe, English
  flag_emoji text, -- 🇹🇷, 🇬🇧
  is_active boolean DEFAULT false,
  is_default boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Çeviriler tablosu
CREATE TABLE translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  language_code text NOT NULL REFERENCES languages(code),
  namespace text NOT NULL, -- 'common', 'admin', 'games'
  key text NOT NULL, -- 'header.login', 'footer.copyright'
  value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(language_code, namespace, key)
);

-- İçerik çevirileri
CREATE TABLE content_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL REFERENCES content(id),
  language_code text NOT NULL REFERENCES languages(code),
  title text NOT NULL,
  description text,
  instructions text,
  meta_title text,
  meta_description text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(content_id, language_code)
);
```

**B. Admin - Dil Yönetimi (`/admin/diller`):**
- ❌ Dil ekleme (kod, isim, bayrak)
- ❌ Dil aktif/pasif yapma
- ❌ Varsayılan dil seçme
- ❌ Sıralama

**C. Admin - Çeviri Yönetimi (`/admin/ceviriler`):**
- ❌ Namespace seçici (common, admin, games)
- ❌ Dil seçici
- ❌ Key-value editor
- ❌ Eksik çevirileri göster
- ❌ JSON import/export
- ❌ Toplu çeviri (Google Translate API?)

**D. Frontend:**
- ❌ Dil değiştirici (header'da)
- ❌ Context API veya i18n library (next-intl?)
- ❌ Cookie'de dil seçimi sakla
- ❌ Tüm static text'leri çevir
- ❌ İçerik çevirilerini göster

**E. Otomatik Çeviri:**
- ❌ Google Translate API entegrasyonu
- ❌ Toplu çeviri butonu
- ❌ Manuel düzenleme seçeneği

---

### 15. Email Sistemi (SMTP)
**Durum:** ⚠️ Admin ayarlar sayfasında form var, çalışmıyor
**Tahmini Süre:** 3-4 saat

#### Yapılması Gerekenler:

**A. SMTP Konfigürasyonu:**
```typescript
// lib/email.ts
import nodemailer from 'nodemailer';

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  // Supabase'den SMTP ayarlarını çek
  const settings = await getSettings('smtp');

  const transporter = nodemailer.createTransport({
    host: settings.smtp_host,
    port: settings.smtp_port,
    secure: settings.smtp_secure,
    auth: {
      user: settings.smtp_username,
      pass: settings.smtp_password,
    },
  });

  await transporter.sendMail({
    from: settings.smtp_from_email,
    to,
    subject,
    html,
    text,
  });
}
```

**B. Email Templates:**
- ❌ Hoş geldin email (kayıt sonrası)
- ❌ Email doğrulama
- ❌ Şifre sıfırlama
- ❌ Premium abonelik başladı
- ❌ Premium abonelik bitti (hatırlatma)
- ❌ Yeni yorum bildirimi
- ❌ Haftalık özet (popüler oyunlar)

**C. Email Template Engine:**
- ❌ HTML email templates (responsive)
- ❌ Template variables ({{userName}}, {{gameTitle}})
- ❌ Preview feature

**D. Email Queue:**
- ❌ Supabase Edge Function ile queue
- ❌ Rate limiting
- ❌ Retry mekanizması
- ❌ Delivery tracking

---

### 16. Parental Controls (Ebeveyn Kontrolleri)
**Durum:** ⚠️ Database field var, UI yok
**Tahmini Süre:** 5-6 saat

#### Yapılması Gerekenler:

**A. Ebeveyn Dashboard:**
- ❌ `/dashboard/parental-controls` sayfası
- ❌ PIN kodu ayarla (4 haneli)
- ❌ Yaş kısıtlaması:
  - Sadece baby içerikler
  - Baby + child içerikler
  - Tüm içerikler (adult hariç)
  - Hepsi
- ❌ Kategori kısıtlamaları (kategorileri seç)
- ❌ Zaman limiti:
  - Günlük maksimum süre (30dk, 1sa, 2sa)
  - İzin verilen saatler (09:00-18:00)
- ❌ İçerik onayı:
  - Premium içerikler için onay iste
  - Yeni içerikler için onay iste

**B. Frontend Kontroller:**
- ❌ Login sonrası parental controls kontrol et
- ❌ Kısıtlı içerikleri gizle/blur yap
- ❌ Süre kontrolü (timer)
- ❌ PIN ile kilidi aç

**C. Raporlama:**
- ❌ Çocuk ne kadar süre geçirdi
- ❌ Hangi oyunları oynadı
- ❌ Haftalık/aylık rapor email

---

### 17. Offline Mode & PWA
**Durum:** ❌ Yok
**Tahmini Süre:** 6-8 saat

#### Yapılması Gerekenler:

**A. PWA Setup:**
```typescript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

module.exports = withPWA({
  // existing config
});
```

**B. Manifest:**
```json
// public/manifest.json
{
  "name": "SeriGame",
  "short_name": "SeriGame",
  "description": "Ücretsiz Çocuk Oyunları",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#f97316",
  "icons": [...]
}
```

**C. Service Worker:**
- ❌ Cache strategy (Network First)
- ❌ Offline sayfası
- ❌ Oyun cache'leme (seçili oyunları offline oyna)
- ❌ Push notifications

**D. Install Prompt:**
- ❌ "Ana ekrana ekle" banner
- ❌ iOS için özel talimat
- ❌ Android için özel talimat

---

### 18. Push Notifications
**Durum:** ❌ Yok
**Tahmini Süre:** 4-5 saat

#### Yapılması Gerekenler:

**A. Database:**
```sql
CREATE TABLE push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id),
  endpoint text NOT NULL,
  keys jsonb NOT NULL,
  user_agent text,
  created_at timestamptz DEFAULT now()
);
```

**B. Frontend:**
- ❌ Bildirim izni iste
- ❌ Subscription kaydet
- ❌ Bildirim ayarları (dashboard'da)

**C. Backend (Edge Function):**
- ❌ Bildirim gönder fonksiyonu
- ❌ Toplu bildirim
- ❌ Scheduled notifications

**D. Bildirim Tipleri:**
- ❌ Yeni oyun eklendi
- ❌ Favori kategorinde yeni içerik
- ❌ Premium abonelik bitiyor
- ❌ Haftalık özet

---

## 🔵 DÜŞÜK ÖNCELİK - NICE TO HAVE

### 19. Admin Activity Logging
**Durum:** ⚠️ Sayfa var, otomatik log yok
**Tahmini Süre:** 3-4 saat

#### Yapılması Gerekenler:

**A. Otomatik Log:**
```typescript
// lib/activity-logger.ts
export async function logActivity(
  action: string, // 'content.create', 'user.ban', 'settings.update'
  details: object,
  userId: string
) {
  await supabase.from('activity_logs').insert({
    user_id: userId,
    action,
    details,
    ip_address: req.ip,
    user_agent: req.headers['user-agent'],
  });
}
```

**B. Log Her Yerde:**
- ❌ İçerik ekleme/düzenleme/silme
- ❌ Kategori işlemleri
- ❌ Kullanıcı işlemleri (ban, role change)
- ❌ Ayar değişiklikleri
- ❌ Premium işlemleri
- ❌ Toplu işlemler

**C. Activity Log Sayfası:**
- ❌ Filtreleme (action type, user, date)
- ❌ Detay modal
- ❌ Export (CSV, JSON)
- ❌ Retention policy (30 gün sonra sil)

---

### 20. Advanced Admin Features
**Tahmini Süre:** 10+ saat

#### A. Bulk Import:
- ❌ Excel ile toplu içerik ekleme
- ❌ CSV template download
- ❌ Validation ve error reporting

#### B. Content Scheduler:
- ❌ İçerikleri ileri tarihte yayınla
- ❌ Auto-publish date
- ❌ Auto-unpublish date

#### C. A/B Testing:
- ❌ Farklı thumbnail'lar test et
- ❌ Farklı başlıklar test et
- ❌ Conversion tracking

#### D. SEO Recommendations:
- ❌ Eksik meta description uyarısı
- ❌ Title length checker
- ❌ Keyword density analyzer

#### E. Backup & Restore:
- ❌ Database backup (otomatik)
- ❌ Manual backup butonu
- ❌ Restore from backup

---

### 21. User Features

#### A. Social Features:
- ❌ Arkadaş sistemi
- ❌ Oyun skorlarını paylaş
- ❌ Challenge gönder
- ❌ Leaderboard

#### B. Gamification:
- ❌ Achievement sistemi (rozetler)
- ❌ Seviye sistemi (XP)
- ❌ Daily rewards
- ❌ Streak system

#### C. Collections:
- ❌ Oyun koleksiyonları oluştur
- ❌ Playlist sistemi
- ❌ Koleksiyonu paylaş

---

### 22. Video Platform Features
**Durum:** ❌ Video tipi var ama özellikler eksik
**Tahmini Süre:** 8-10 saat

#### Yapılması Gerekenler:

**A. Video Player:**
- ❌ Custom video player (react-player?)
- ❌ Playback controls
- ❌ Kalite seçimi (720p, 1080p)
- ❌ Playback speed
- ❌ Subtitles/CC support
- ❌ Picture-in-Picture

**B. Video Upload:**
- ❌ Drag & drop upload
- ❌ Progress bar
- ❌ Thumbnail auto-generate
- ❌ Video compression
- ❌ Multiple formats support

**C. Streaming:**
- ❌ HLS/DASH streaming
- ❌ Adaptive bitrate
- ❌ Video transcoding (FFmpeg?)

---

### 23. Audio Stories Platform
**Durum:** ❌ Audio tipi var ama özellikler eksik
**Tahmini Süre:** 6-8 saat

#### Yapılması Gerekenler:

**A. Audio Player:**
- ❌ Custom audio player
- ❌ Playlist support
- ❌ Sleep timer
- ❌ Speed control
- ❌ Background playback

**B. Audio Upload:**
- ❌ MP3, WAV, M4A support
- ❌ Waveform visualization
- ❌ Audio editing (trim, fade)

**C. Features:**
- ❌ "Uyku masalları" kategorisi
- ❌ Auto-play next
- ❌ Continue listening

---

### 24. Mobile App
**Durum:** ❌ Yok (PWA var olacak)
**Tahmini Süre:** 100+ saat

#### Seçenekler:

**A. React Native:**
- Mevcut React bilgisiyle yapılabilir
- iOS + Android
- Shared codebase

**B. Flutter:**
- Daha iyi performans
- Öğrenme eğrisi

**C. Sadece PWA:**
- En hızlı çözüm
- App store gerektirmez
- Push notification desteği

---

## 📊 ÖNCELIK MATRISI

### Kritik (1-2 gün):
1. ✅ Supabase kurulumu
2. ✅ Test kullanıcıları
3. ✅ Environment variables

### Yüksek (1 hafta):
4. ❌ İçerik CRUD
5. ❌ Kategori CRUD
6. ❌ Kullanıcı yönetimi
7. ❌ Mock data → Supabase
8. ❌ SEO optimizasyonu

### Orta (2-4 hafta):
9. ❌ Analytics dashboard
10. ❌ User dashboard
11. ❌ Premium sistem
12. ❌ Yorum/puanlama
13. ❌ Gelişmiş arama

### Düşük (1-3 ay):
14. ❌ Çoklu dil
15. ❌ Email sistemi
16. ❌ Parental controls
17. ❌ PWA
18. ❌ Push notifications
19. ❌ Activity logging
20. ❌ Advanced features

---

## 🎯 ÖNERİLEN ÇALIŞMA SIRASI

### Sprint 1 (1 hafta):
1. Supabase kurulumu ✅
2. Test kullanıcıları ✅
3. İçerik CRUD
4. Mock data → Supabase

### Sprint 2 (1 hafta):
5. Kategori CRUD
6. Kullanıcı yönetimi
7. SEO optimizasyonu

### Sprint 3 (1 hafta):
8. Analytics dashboard
9. User dashboard (temel)

### Sprint 4 (1 hafta):
10. Premium sistem (Stripe)
11. Yorum/puanlama

### Sprint 5+:
12. Diğer özellikler

---

## 📈 İLERLEME TAKİBİ

**Toplam Özellik:** ~50
**Tamamlanan:** ~15 (%30)
**Devam Eden:** 0
**Yapılacak:** ~35 (%70)

**Tahmini Toplam Süre:** 150-200 saat

---

## 🔑 BAŞARILI LANSMAN İÇİN MİNİMUM GEREKSINIMLER

### Kritik (Olmadan lansman yapılamaz):
- ✅ Supabase kurulumu
- ✅ Authentication çalışıyor
- ❌ İçerik CRUD (admin)
- ❌ Mock data → Gerçek data
- ❌ SEO optimizasyonu
- ❌ En az 50 oyun eklenmeli

### Önemli (Lansman sonrası ilk hafta):
- ❌ User dashboard
- ❌ Yorum/puanlama
- ❌ Analytics
- ❌ Email sistemi (hoşgeldin mail)

### Olsa İyi (Lansman sonrası 1 ay):
- ❌ Premium sistem
- ❌ Gelişmiş arama
- ❌ PWA

---

## 🎨 TASARIM İYİLEŞTİRMELERİ

### Ana Sayfa:
- ❌ Hero section animasyonları
- ❌ Loading skeletons
- ❌ Infinite scroll
- ❌ Better empty states

### Oyun Detay:
- ❌ Screenshot carousel
- ❌ Similar games section
- ❌ Share buttons
- ❌ Embed code

### Admin:
- ❌ Dark mode toggle
- ❌ Keyboard shortcuts
- ❌ Better mobile view
- ❌ Dashboard widgets (draggable)

---

## 📝 DOKÜMANTASYON

### Eksikler:
- ❌ API documentation
- ❌ Component documentation
- ❌ Database schema docs
- ❌ Deployment guide
- ❌ Contributing guide
- ❌ User manual (for admins)

---

**Son Güncelleme:** 2025-10-30
**Durum:** %75 Tamamlandı
**Sonraki Review:** 1 hafta sonra
