# 🎯 Dinamik Reklam Yönetim Sistemi

## 📋 Özellikler

✅ **Dinamik AdSense Entegrasyonu** - Admin panelden yönetilebilir  
✅ **Pre-roll Video Ads** - Oyun başlamadan önce video reklamlar  
✅ **Çoklu Reklam Yerleri** - Sayfa başı, alt, sidebar, mobil  
✅ **Analytics Tracking** - Gösterim, tıklama, gelir takibi  
✅ **Layout Tipleri** - Agresif, Dengeli, Minimal  
✅ **A/B Testing Desteği** - Farklı layout'ları test edin  

---

## 🚀 Kurulum

### **1. Migration Çalıştırın**

Supabase Dashboard > SQL Editor'de:

```sql
-- Migration 00013_ad_placements.sql dosyasını çalıştırın
```

Bu migration:
- ✅ `ad_placements` tablosunu oluşturur
- ✅ `ad_analytics` tablosunu oluşturur
- ✅ Varsayılan reklam yerlerini ekler (Balanced Layout)

### **2. Environment Variables**

`.env.local` dosyasına ekleyin:

```env
NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=ca-pub-xxxxxxxxxxxxxxxxx
```

**Not:** Bu değişken opsiyonel. Her reklam yerinde Publisher ID ayrı ayrı da ayarlanabilir.

---

## 📊 Admin Panel

### **Reklam Yönetimi Sayfası**

`/admin/reklamlar` sayfasından:

1. **Yeni Reklam Ekle**
   - Reklam adı
   - Pozisyon (game-top, game-bottom, sidebar, vs.)
   - Reklam tipi (banner, video_preroll, video_interstitial, custom)
   - AdSense Publisher ID ve Slot ID
   - Boyutlar ve format

2. **Reklam Listesi**
   - Tüm reklamlar
   - Gösterim, tıklama, gelir istatistikleri
   - Aktif/Pasif durumu

3. **İstatistikler**
   - Toplam reklam sayısı
   - Aktif reklamlar
   - Toplam gösterim
   - Toplam gelir

---

## 🎨 Kullanım

### **1. Oyun Sayfasında Reklamlar**

`components/GameDetailClient.tsx` içinde:

```tsx
// Pre-roll Video Ad
<AdUnit
  position="game-preroll"
  pageType="game"
  gameUrl={game.content_url}
/>

// Sayfa Başı Banner
<AdUnit position="game-top" pageType="game" />

// Oyun Altı Banner
<AdUnit position="game-bottom" pageType="game" />

// Sidebar Reklam
<AdUnit position="game-sidebar" pageType="game" />

// Mobil Bannerlar
<AdUnit position="game-mobile-top" pageType="game" />
<AdUnit position="game-mobile-bottom" pageType="game" />
```

### **2. Ana Sayfada Reklamlar**

`app/page.tsx` içinde:

```tsx
<AdUnit position="home-top" pageType="home" />
<AdUnit position="home-middle" pageType="home" />
```

### **3. Kategori Sayfasında Reklamlar**

```tsx
<AdUnit position="category-top" pageType="category" />
```

---

## 📍 Reklam Pozisyonları

### **Oyun Sayfası**
- `game-top` - Sayfa başı banner (728x90)
- `game-bottom` - Oyun altı banner (728x90)
- `game-sidebar` - Sidebar reklam (300x250)
- `game-mobile-top` - Mobil üst banner (320x100)
- `game-mobile-bottom` - Mobil alt banner (320x100)
- `game-preroll` - Pre-roll video ad

### **Ana Sayfa**
- `home-top` - Ana sayfa üst
- `home-middle` - Ana sayfa orta

### **Kategori Sayfası**
- `category-top` - Kategori üst

---

## 🎬 Reklam Tipleri

### **1. Banner Ads**
- Standart banner reklamlar
- AdSense veya özel kod
- Responsive desteği

### **2. Pre-roll Video Ads**
- Oyun başlamadan önce gösterilir
- Atlanabilir (skipable)
- Süre ayarlanabilir

### **3. Interstitial Video Ads**
- Oyun oynarken belirli aralıklarla gösterilir
- Gösterim aralığı ayarlanabilir (dakika)

### **4. Custom Ads**
- Özel HTML/JS kodu
- Herhangi bir reklam ağı

---

## 📊 Layout Tipleri

### **Agresif (Daha Fazla Gelir)**
- 5+ reklam birimi
- Pre-roll video (zorunlu)
- Interstitial (5 dakikada bir)
- CPM: $4-6
- UX: ⭐⭐⚠️⚠️⚠️

### **Dengeli (ÖNERİLEN)**
- 3 reklam birimi
- Pre-roll video (atlanabilir)
- Interstitial yok
- CPM: $2-3
- UX: ⭐⭐⭐⭐⚠️

### **Minimal (En İyi UX)**
- 2 reklam birimi
- Pre-roll yok
- Sadece banner
- CPM: $1-2
- UX: ⭐⭐⭐⭐⭐

---

## 📈 Analytics

### **Otomatik Tracking**

Reklam gösterimleri ve tıklamalar otomatik olarak takip edilir:

```typescript
// AdUnit component'i otomatik olarak:
- Impression tracking
- Click tracking
- Revenue tracking (gerekirse)
```

### **Analytics Dashboard**

`/admin/analitics` sayfasında gelir istatistikleri görüntülenebilir.

### **API Endpoint**

`/api/analytics/ad-event` endpoint'i ile manuel tracking:

```typescript
await fetch('/api/analytics/ad-event', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    event_type: 'impression',
    placement_id: 'placement-id',
    content_id: 'game-id',
    revenue: 0.001,
  }),
});
```

---

## 🔧 AdSense Yapılandırması

### **1. Publisher ID Ayarlama**

**Yöntem 1: Environment Variable**
```env
NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=ca-pub-xxxxxxxxxxxxxxxxx
```

**Yöntem 2: Admin Panel**
- Her reklam yerinde ayrı Publisher ID ayarlanabilir
- Daha esnek yönetim

### **2. Ad Slot ID**

Her reklam yeri için AdSense'den aldığınız Slot ID'yi girin.

### **3. Responsive Ads**

AdSense otomatik responsive reklamları destekler. `responsive: true` ayarını kullanın.

---

## 🎯 Best Practices

### **1. Reklam Yerleşimi**
- Kullanıcı deneyimini bozmayın
- Reklamlar içeriği engellememeli
- Mobil uyumlu olmalı

### **2. Pre-roll Video**
- Süre: 15-30 saniye
- Atlanabilir olmalı (5 saniye sonra)
- Sadece premium olmayan kullanıcılara göster

### **3. Interstitial**
- Gösterim aralığı: 5-10 dakika
- Oyun oynarken kritik anlarda gösterilmemeli

### **4. A/B Testing**
- Farklı layout'ları test edin
- Analytics'i takip edin
- Kullanıcı geri bildirimlerini alın

---

## 📊 Gelir Hesaplama

### **CPM (Cost Per Mille)**
```typescript
Revenue = (Impressions / 1000) * CPM
```

### **CPC (Cost Per Click)**
```typescript
Revenue = Clicks * CPC
```

### **Ortalama Değerler**
- CPM: $2-5 (coğrafyaya göre değişir)
- CPC: $0.30-1.00
- CTR: %1-3 (trafiğe göre değişir)

---

## ⚠️ Önemli Notlar

1. **AdSense Onayı:** AdSense hesabınızın onaylanması gerekir
2. **ads.txt:** Domain'inizin root'una `ads.txt` dosyası eklemelisiniz
3. **GDPR:** Avrupa kullanıcıları için cookie consent gerekli olabilir
4. **Rate Limiting:** Reklam gösterimleri için rate limiting uygulanabilir

---

## 🚀 Gelişmiş Özellikler

### **1. Premium Kullanıcılar için Reklam Yok**

```typescript
const { isPremium } = useAuth();

{!isPremium && (
  <AdUnit position="game-top" pageType="game" />
)}
```

### **2. A/B Testing**

Farklı layout'ları test etmek için:

```typescript
// Layout type'a göre farklı reklamlar göster
const layoutType = user?.layout_preference || 'balanced';

<AdUnit 
  position="game-top" 
  pageType="game"
  layoutType={layoutType}
/>
```

### **3. Coğrafi Targeting**

```typescript
// IP'ye göre farklı reklamlar
const country = getCountryFromIP();
const adSlot = country === 'TR' ? 'tr-slot' : 'intl-slot';
```

---

## 📞 Destek

Sorularınız için:
- Admin Panel: `/admin/reklamlar`
- Migration: `supabase/migrations/00013_ad_placements.sql`
- Bileşenler: `components/AdUnit.tsx`, `components/AdBanner.tsx`, `components/VideoAdPreroll.tsx`

---

## ✅ Yapılacaklar (Gelecek)

- [ ] IMA SDK entegrasyonu (pre-roll video ads için)
- [ ] GDPR cookie consent entegrasyonu
- [ ] Revenue dashboard geliştirmeleri
- [ ] A/B testing otomasyonu
- [ ] Coğrafi targeting
- [ ] Premium kullanıcı reklam bypass

