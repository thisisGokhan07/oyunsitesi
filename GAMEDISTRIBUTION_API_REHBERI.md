# 🎮 GameDistribution API Rehberi

## 📋 API Key Nasıl Alınır?

### **ADIM 1: Hesap Aktivasyonu**

1. **Email Kontrolü:**
   - `iam@azerionconnect.com` adresinden gelen **Account Activation** email'ini kontrol edin
   - Spam klasörünü de kontrol edin
   - Email'deki aktivasyon linkine tıklayın

2. **Hesap Oluşturma:**
   - Eğer aktivasyon linki gelmediyse: [Azerion Connect Kayıt](https://connect.azerion.com)
   - Eğer zaten hesabınız varsa: [Şifre Sıfırlama](https://connect.azerion.com/forgot-password)

### **ADIM 2: Publisher Panel'e Giriş**

1. **GameDistribution Publisher Panel:**
   - URL: `https://publisher.gamedistribution.com`
   - Azerion Connect hesabınızla giriş yapın

2. **Dashboard'a Erişim:**
   - Giriş yaptıktan sonra Publisher Dashboard'a yönlendirileceksiniz

### **ADIM 3: API Key Alma**

1. **Publisher Panel > Settings > API Keys**
   - Sol menüden **Settings** bölümüne gidin
   - **API Keys** sekmesine tıklayın
   - Yeni bir API Key oluşturun veya mevcut olanı kopyalayın

2. **Alternatif Yol:**
   - **Developer Settings** > **API Configuration**
   - Veya **Account Settings** > **API Access**

---

## 📚 Önemli Linkler

### **Resmi Dokümantasyon:**
- **Quality Guidelines:** https://gamedistribution.com/developers/quality-guidelines/
- **Developer Guidelines:** https://static.gamedistribution.com/developer/developers-guidelines.html
- **Developer Agreement:** https://static.gamedistribution.com/terms/developer.html

### **API Dokümantasyonu:**
- **API Endpoint:** `https://gamedistribution.com/api/v2.0/games`
- **API Format:** REST API
- **Authentication:** `X-Api-Key` header ile

### **SDK ve Entegrasyon:**
- **HTML5 SDK:** https://github.com/GameDistribution/GD-HTML5
- **Unity SDK:** https://github.com/GameDistribution/gd-sdk-unity
- **Construct 2 SDK:** https://github.com/GameDistribution/GD-Construct2
- **Construct 3 SDK:** https://github.com/GameDistribution/gd-sdk-construct-3
- **Direct Game Integration (DGI):** https://blog.gamedistribution.com/embed-games-in-minutes-with-dgi-from-gamedistribution/

### **Publisher Panel:**
- **Publisher Dashboard:** https://publisher.gamedistribution.com
- **Azerion Connect:** https://connect.azerion.com

---

## 🔐 API Key Kullanımı

### **1. Environment Variable Olarak Ekle:**

`.env.local` dosyasına ekleyin:
```env
GAMEDISTRIBUTION_API_KEY=your_api_key_here
```

### **2. API Request Örneği:**

```javascript
const response = await fetch('https://gamedistribution.com/api/v2.0/games', {
  headers: {
    'X-Api-Key': 'YOUR_API_KEY',
    'Accept': 'application/json',
  },
});

const data = await response.json();
const games = data.data; // Oyun listesi
```

---

## 📝 Onboarding Adımları

### **1. ads.txt Dosyası Ekleme**

GameDistribution'dan gelen `ads.txt` dosyasını domain'inizin root'una ekleyin:
- Örnek: `https://serigame.com/ads.txt`
- Bu dosya reklamların doğru şekilde gösterilmesi için kritik!

### **2. Domain Paylaşımı**

Publisher Panel'de:
1. **Settings** > **Domains**
2. Domain'inizi ekleyin: `serigame.com`
3. Domain doğrulamasını tamamlayın

### **3. Bekleme Süresi**

- Oyunların kataloğa eklenmesi: **~2 hafta**
- Hesap aktivasyonu: **1-2 gün**
- Domain onayı: **1-3 gün**

---

## 🎯 API Response Formatı

```json
{
  "data": [
    {
      "id": "game-id",
      "title": "Game Title",
      "description": "Game description",
      "category": "action",
      "url": "https://gamedistribution.com/games/game-id",
      "embedUrl": "https://gamedistribution.com/games/game-id/embed",
      "assets": {
        "cover": "https://...",
        "icon": "https://..."
      },
      "rating": 4.5,
      "duration": 15,
      "featured": true,
      "tags": ["action", "arcade"]
    }
  ]
}
```

---

## ⚠️ Önemli Notlar

1. **API Rate Limits:**
   - Çok fazla istek göndermeyin
   - Her import işleminde max 20 oyun alın

2. **Oyun Kalitesi:**
   - Quality Guidelines'a uygun oyunlar seçin
   - Family-friendly içerik tercih edin

3. **Reklam Entegrasyonu:**
   - ads.txt dosyası eklenmeden reklamlar çalışmaz
   - Domain doğrulaması tamamlanmalı

4. **Güvenlik:**
   - API Key'i asla public repository'de paylaşmayın
   - `.env.local` dosyasını `.gitignore`'a ekleyin

---

## 🚀 Hızlı Başlangıç

1. ✅ Email'den hesabı aktifleştir
2. ✅ Publisher Panel'e giriş yap
3. ✅ API Key'i al
4. ✅ `.env.local`'e ekle
5. ✅ Admin panelinden import et

---

## 📞 Destek

- **GameDistribution Support:** support@gamedistribution.com
- **Publisher Panel:** https://publisher.gamedistribution.com
- **Azerion Connect:** https://connect.azerion.com

