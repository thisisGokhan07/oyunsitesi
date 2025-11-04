# 🎮 Dinamik Oyun Sağlayıcı Sistemi

## 📋 Özellikler

✅ **Birden fazla sağlayıcı desteği** - GameDistribution, GameMonetize, GamePix ve daha fazlası  
✅ **Dinamik API entegrasyonu** - Her sağlayıcı için özel yapılandırma  
✅ **Otomatik kategori mapping** - Sağlayıcı kategorilerini otomatik eşleştirme  
✅ **Revenue share takibi** - Her sağlayıcı için gelir paylaşımı yüzdesi  
✅ **İstatistikler** - İçe aktarılan oyun sayıları ve toplam oyunlar  

---

## 🚀 Kullanım

### **1. Admin Panel > Oyun Sağlayıcıları**

Admin panelinden `/admin/oyun-saglayicilari` sayfasına gidin.

### **2. Varsayılan Sağlayıcılar**

Migration ile otomatik olarak eklenen sağlayıcılar:

- **GameDistribution** - %70 revenue share
- **GameMonetize** - %100 revenue share  
- **GamePix** - %80 revenue share

### **3. Yeni Sağlayıcı Ekleme**

1. **"Yeni Sağlayıcı"** butonuna tıklayın
2. **Bilgileri girin:**
   - Sağlayıcı Adı: `GameMonetize`
   - Slug: `gamemonetize`
   - API Endpoint: `https://api.gamemonetize.com/games`
   - Auth Tipi: `header`, `query` veya `bearer`
   - Auth Header/Param: `X-Api-Key` veya `api_key`
   - API Key: Sağlayıcıdan aldığınız key
   - Revenue Share: % cinsinden (örn: 100)

3. **Config JSON:** (Örnek)
```json
{
  "categoryMapping": {
    "action": "child",
    "adventure": "child",
    "puzzle": "child",
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
}
```

### **4. Oyunları İçe Aktarma**

1. Sağlayıcı kartında **"İçe Aktar"** butonuna tıklayın
2. Oyun sayısını seçin (1-100)
3. **"Oyunu İçe Aktar"** butonuna tıklayın
4. Sonuçları bekleyin

---

## 📊 Desteklenen Sağlayıcılar

### **GameDistribution**
- **API:** https://gamedistribution.com/api/v2.0/games
- **Auth:** Header (`X-Api-Key`)
- **Revenue Share:** %70
- **Link:** https://publisher.gamedistribution.com

### **GameMonetize**
- **API:** https://api.gamemonetize.com/games
- **Auth:** Query Parameter (`api_key`)
- **Revenue Share:** %100
- **Link:** https://gamemonetize.com

### **GamePix**
- **API:** https://api.gamepix.com/v1/games
- **Auth:** Header (`X-API-KEY`)
- **Revenue Share:** %80
- **Link:** https://gamepix.com

### **Diğer Sağlayıcılar**

Aşağıdaki sağlayıcılar da eklenebilir:
- **CrazyGames API**
- **Kongregate**
- **GameJolt**
- **itch.io API**
- **Y8 Games**

---

## 🔧 Config Yapılandırması

### **Category Mapping**
Sağlayıcı kategorilerini kendi kategorilerinize eşleştirin:

```json
{
  "categoryMapping": {
    "action": "child",
    "adventure": "child",
    "puzzle": "child",
    "educational": "baby",
    "kids": "baby",
    "strategy": "adult",
    "casual": "family"
  }
}
```

### **Response Path**
API response'undaki oyun listesinin yolu:

```json
{
  "responsePath": "data"  // veya "games", "results", vs.
}
```

### **Field Mapping**
API'deki field isimlerini eşleştirin:

```json
{
  "fields": {
    "title": "title",           // Oyun başlığı
    "description": "description", // Açıklama
    "thumbnail": "assets.cover",   // Thumbnail (nested path destekler)
    "url": "url",                  // Oyun URL'i
    "embedUrl": "embedUrl",        // Embed URL
    "category": "category",        // Kategori
    "rating": "rating",           // Puan
    "duration": "duration",       // Süre
    "featured": "featured",       // Öne çıkan
    "tags": "tags"               // Etiketler
  }
}
```

**Nested Path Desteği:** `assets.cover` gibi nested path'ler desteklenir.

---

## 📝 Örnek Sağlayıcı Yapılandırmaları

### **GameMonetize Örneği:**

```json
{
  "name": "GameMonetize",
  "slug": "gamemonetize",
  "api_endpoint": "https://api.gamemonetize.com/games",
  "auth_type": "query",
  "auth_header_name": "api_key",
  "revenue_share": 100,
  "config": {
    "categoryMapping": {
      "action": "child",
      "puzzle": "child",
      "educational": "baby"
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
      "tags": "tags"
    }
  }
}
```

---

## 🎯 Avantajlar

1. **Tek Panel:** Tüm sağlayıcıları tek yerden yönetin
2. **Kolay Ekleme:** Yeni sağlayıcı eklemek sadece birkaç dakika
3. **Esnek Yapı:** Her API yapısına uyum sağlar
4. **İstatistikler:** Her sağlayıcı için ayrı takip
5. **Revenue Tracking:** Gelir paylaşımı yüzdelerini takip edin

---

## ⚠️ Önemli Notlar

1. **API Key Güvenliği:** API key'ler şifrelenmiş olarak saklanır
2. **Rate Limiting:** Her import işleminde max 100 oyun
3. **Duplicate Control:** Aynı slug'a sahip oyunlar atlanır
4. **Auto Categories:** Kategoriler otomatik oluşturulur
5. **Config Validation:** JSON formatı kontrol edilir

---

## 🚀 Migration Çalıştırma

Supabase Dashboard > SQL Editor'de:

```sql
-- Migration 00012_game_providers.sql dosyasını çalıştırın
```

Bu migration:
- ✅ `game_providers` tablosunu oluşturur
- ✅ `content` tablosuna `provider_id` ve `provider_game_id` ekler
- ✅ Varsayılan sağlayıcıları ekler (GameDistribution, GameMonetize, GamePix)

---

## 📞 Destek

Sorularınız için:
- Admin Panel: `/admin/oyun-saglayicilari`
- Migration: `supabase/migrations/00012_game_providers.sql`

