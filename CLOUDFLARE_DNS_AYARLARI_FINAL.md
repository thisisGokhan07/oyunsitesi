# 🌐 Cloudflare DNS Ayarları - serigame.com

## 📋 YAPILACAKLAR (Cloudflare Dashboard)

### **1. DNS Kayıtları Ekle**

Cloudflare Dashboard > **DNS** > **Records** > **Add record**

#### **A Record (Ana Domain)**
```
Type: A
Name: @
IPv4 address: 72.61.97.76
Proxy status: ✅ Proxied (Orange Cloud - AÇIK olmalı)
TTL: Auto
```
**EKLE** butonuna tıklayın

#### **CNAME Record (WWW)**
```
Type: CNAME
Name: www
Target: serigame.com
Proxy status: ✅ Proxied (Orange Cloud - AÇIK olmalı)
TTL: Auto
```
**EKLE** butonuna tıklayın

**VEYA A Record:**
```
Type: A
Name: www
IPv4 address: 72.61.97.76
Proxy status: ✅ Proxied
TTL: Auto
```

---

### **2. SSL/TLS Ayarları**

Cloudflare Dashboard > **SSL/TLS**

#### **Overview Sekmesi:**
- **SSL/TLS encryption mode:** `Full (strict)` seçin ✅

#### **Edge Certificates Sekmesi:**
- **Always Use HTTPS:** `On` ✅
- **Automatic HTTPS Rewrites:** `On` ✅
- **Minimum TLS Version:** `1.2` ✅

---

### **3. Speed Ayarları (Opsiyonel)**

Cloudflare Dashboard > **Speed**

#### **Optimization:**
- **Auto Minify:** 
  - ✅ JavaScript
  - ✅ CSS
  - ✅ HTML

- **Brotli:** `On` ✅

---

### **4. Caching Ayarları (Opsiyonel)**

Cloudflare Dashboard > **Caching**

- **Browser Cache TTL:** `Respect Existing Headers` veya `4 hours`
- İlk deployment'tan sonra cache'i temizleyin: **Purge Everything**

---

## ✅ Kontrol Listesi

- [ ] DNS A record eklendi: `@` → `72.61.97.76` (Proxied)
- [ ] DNS CNAME eklendi: `www` → `serigame.com` (Proxied)
- [ ] SSL/TLS: `Full (strict)` mode
- [ ] Always Use HTTPS: `On`
- [ ] 5-10 dakika bekle (DNS propagation)
- [ ] Test: https://serigame.com

---

## 🔍 Test

### **DNS Kontrolü:**
```bash
nslookup serigame.com
# Cloudflare IP'lerini görmeli (proxied ise)
```

### **Website Test:**
Tarayıcıda açın: `https://serigame.com`

---

## 📊 Sunucu Bilgileri

- **Sunucu IP:** `72.61.97.76`
- **Domain:** `serigame.com`
- **Port:** `3000` (Nginx reverse proxy)
- **PM2:** Çalışıyor (2 instance)
- **Nginx:** Yapılandırıldı

---

## ⚠️ Önemli Notlar

1. **Proxy Status:** MUTLAKA **Proxied (Orange Cloud)** olmalı
2. **DNS Propagation:** 5-10 dakika sürebilir
3. **SSL:** Cloudflare otomatik SSL sağlar, sunucuda SSL gerekmez
4. **Build:** Build hataları varsa önce düzeltilmeli

---

**Tüm ayarlar tamamlandıktan sonra:** https://serigame.com çalışmalı! 🚀

