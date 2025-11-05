# 🌐 Cloudflare DNS Ayarları - serigame.com

## ✅ YAPILACAKLAR (Cloudflare Dashboard)

### **1. DNS Kayıtları Ekle**

Cloudflare Dashboard'a gidin: https://dash.cloudflare.com  
→ Domain seçin: **serigame.com**  
→ Sol menüden **DNS** > **Records**  
→ **Add record** butonuna tıklayın

#### **📌 A Record (Ana Domain)**
```
Type: A
Name: @
IPv4 address: 72.61.97.76
Proxy status: ✅ Proxied (Orange Cloud - AÇIK olmalı)
TTL: Auto
```
→ **Save** butonuna tıklayın

#### **📌 CNAME Record (WWW)**
```
Type: CNAME
Name: www
Target: serigame.com
Proxy status: ✅ Proxied (Orange Cloud - AÇIK olmalı)
TTL: Auto
```
→ **Save** butonuna tıklayın

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

### **3. Speed Ayarları (Opsiyonel - Önerilir)**

Cloudflare Dashboard > **Speed**

- **Auto Minify:** ✅ JavaScript, ✅ CSS, ✅ HTML
- **Brotli:** `On` ✅

---

## 📊 Sunucu Durumu

✅ **Sunucu IP:** `72.61.97.76`  
✅ **PM2:** Çalışıyor (2 instance)  
✅ **Nginx:** Yapılandırıldı ve çalışıyor  
✅ **Build:** Başarılı  
✅ **Port:** 3000 (Nginx reverse proxy)

---

## ⏱️ Bekleme Süresi

DNS propagation için **5-10 dakika** bekleyin.

---

## 🔍 Test

### **DNS Kontrolü:**
```bash
nslookup serigame.com
# Cloudflare IP'lerini görmeli (proxied ise)
```

### **Website Test:**
Tarayıcıda açın: **https://serigame.com**

---

## ✅ Checklist

- [ ] DNS A record eklendi: `@` → `72.61.97.76` (✅ Proxied)
- [ ] DNS CNAME eklendi: `www` → `serigame.com` (✅ Proxied)
- [ ] SSL/TLS: `Full (strict)` mode
- [ ] Always Use HTTPS: `On`
- [ ] 5-10 dakika bekle
- [ ] Test: https://serigame.com

---

## 🎯 Özet

**Cloudflare'de yapılacaklar:**
1. ✅ DNS: A record (`@` → `72.61.97.76`) - **Proxied**
2. ✅ DNS: CNAME (`www` → `serigame.com`) - **Proxied**
3. ✅ SSL/TLS: `Full (strict)`
4. ✅ Always Use HTTPS: `On`

**Sunucu hazır!** Sadece Cloudflare DNS ayarlarını yapmanız yeterli. 🚀

