# 🎮 Itch.io Oyun Entegrasyon Rehberi

## 📋 Özellikler

✅ **Itch.io oyunları manuel ekleme**  
✅ **Otomatik embed URL oluşturma**  
✅ **Kategori ve yaş grubu yönetimi**  
✅ **Thumbnail desteği**  

---

## 🚀 Kullanım

### **1. Itch.io Sağlayıcısını Kontrol Edin**

Admin Panel > Oyun Sağlayıcıları sayfasında:
- `Itch.io` sağlayıcısı görünmeli
- Eğer yoksa, migration'ı çalıştırın: `00014_itchio_provider.sql`

### **2. Manuel Oyun Ekleme**

1. **Admin Panel** > **Oyun Sağlayıcıları** > **Itch.io** kartında
2. **"Manuel Ekle"** butonuna tıklayın
3. **Oyun bilgilerini doldurun:**
   - Itch.io Oyun URL'i (örn: `https://kennymakesgames.itch.io/pin`)
   - Oyun Başlığı
   - Açıklama (opsiyonel)
   - Kategori
   - Yaş Grubu
   - Embed URL (opsiyonel - otomatik oluşturulur)
   - Thumbnail URL (opsiyonel)

4. **"Oyunu Ekle"** butonuna tıklayın

---

## 📝 Örnek: Cult of PiN Ekleme

### **Adım 1: Oyun Sayfasına Gidin**
```
https://kennymakesgames.itch.io/pin
```

### **Adım 2: Bilgileri Toplayın**
- **URL:** `https://kennymakesgames.itch.io/pin`
- **Başlık:** `Cult of PiN`
- **Açıklama:** `Roguelike pinball oyunu`
- **Kategori:** `Pinball` veya `Roguelike`
- **Yaş Grubu:** `Child` (13+)
- **Thumbnail:** Oyun sayfasından kopyalayın

### **Adım 3: Admin Panelden Ekle**
1. `/admin/oyun-saglayicilari/itchio-manual` sayfasına gidin
2. Bilgileri girin
3. "Oyunu Ekle" butonuna tıklayın

---

## 🔧 Embed URL Formatı

Itch.io embed URL'leri genellikle şu formattadır:

```
https://[username].itch.io/[game-slug]/embed
```

**Örnek:**
- Oyun URL: `https://kennymakesgames.itch.io/pin`
- Embed URL: `https://kennymakesgames.itch.io/pin/embed`

Sistem otomatik olarak embed URL'ini oluşturur, ancak manuel olarak da girebilirsiniz.

---

## 🖼️ Thumbnail URL Alma

### **Yöntem 1: Itch.io Sayfasından**
1. Oyun sayfasına gidin
2. Thumbnail görseline sağ tıklayın
3. "Resim Adresini Kopyala" seçin
4. URL'yi forma yapıştırın

### **Yöntem 2: Itch.io API (Alternatif)**
Itch.io oyun sayfasının HTML'inden thumbnail URL'ini çıkarabilirsiniz.

---

## 📊 Kategori Eşleştirme

Itch.io kategorileri otomatik olarak eşleştirilir:

| Itch.io Kategori | Sistem Kategorisi | Yaş Grubu |
|------------------|-------------------|-----------|
| arcade | Arcade | child |
| action | Action | child |
| puzzle | Puzzle | child |
| pinball | Pinball | child |
| roguelike | Roguelike | adult |
| casual | Casual | family |
| strategy | Strategy | adult |

---

## ⚠️ Önemli Notlar

### **1. Telif Hakları**
- ⚠️ **Geliştirici izni olmadan oyunları eklemeyin**
- Oyun sahibinden izin alın
- Itch.io kullanım şartlarını okuyun

### **2. Embed İzni**
- Bazı oyunlar embed'e izin vermeyebilir
- Oyun sayfasında "Embed" butonu varsa embed edilebilir
- Embed yoksa, oyunu direkt link olarak ekleyebilirsiniz

### **3. Revenue Share**
- Itch.io'da revenue share yok
- %100 gelir sizin (sağlayıcı ayarlarında)

---

## 🛠️ Teknik Detaylar

### **Embed Format**
```html
<iframe 
  src="https://kennymakesgames.itch.io/pin/embed" 
  width="552" 
  height="167" 
  frameborder="0">
</iframe>
```

### **Veritabanı Yapısı**
```sql
-- Itch.io oyunları content tablosunda saklanır
-- provider_id: Itch.io provider ID
-- provider_game_id: Itch.io oyun URL'i
-- content_url: Embed URL
```

---

## 🔍 Sorun Giderme

### **Sorun 1: Embed Çalışmıyor**
- Oyun sayfasında embed izni var mı kontrol edin
- Embed URL'ini manuel olarak girin
- Oyun iframe'de yükleniyor mu kontrol edin

### **Sorun 2: Thumbnail Görünmüyor**
- Thumbnail URL'inin doğru olduğundan emin olun
- Itch.io görsel URL'lerinin geçerli olduğunu kontrol edin
- Placeholder görsel kullanılabilir

### **Sorun 3: Oyun Eklenmiyor**
- Console'da hata mesajlarını kontrol edin
- Kategori oluşturma hatası var mı kontrol edin
- Slug çakışması var mı kontrol edin

---

## 📚 İlgili Dosyalar

- **Migration:** `supabase/migrations/00014_itchio_provider.sql`
- **Manuel Import Sayfası:** `app/admin/oyun-saglayicilari/itchio-manual/page.tsx`
- **Provider Yönetimi:** `app/admin/oyun-saglayicilari/page.tsx`

---

## ✅ Örnek Oyun Listesi

KennyMakesGames'in oyunları:
- **Cult of PiN** - https://kennymakesgames.itch.io/pin
- Diğer oyunlar için Itch.io profil sayfasını ziyaret edin

---

## 🎯 Gelecek Geliştirmeler

- [ ] Itch.io API entegrasyonu (eğer resmi API çıkarsa)
- [ ] Toplu oyun ekleme
- [ ] Otomatik thumbnail çekme
- [ ] Oyun güncelleme (update)

