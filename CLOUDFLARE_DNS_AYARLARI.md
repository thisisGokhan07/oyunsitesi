# 🌐 Cloudflare DNS Ayarları - serigame.com

## 📋 DNS Kayıtları

Cloudflare Dashboard > DNS > Records bölümüne şu kayıtları ekleyin:

### **1. A Record (Ana Domain)**

```
Type: A
Name: @
IPv4 address: [SUNUCU_IP_ADRESI]
Proxy status: ✅ Proxied (Orange Cloud)
TTL: Auto
```

**Not:** `[SUNUCU_IP_ADRESI]` yerine golog360.com sunucusunun IP adresini yazın.

**Sunucu IP Adresi:** Sunucuda `hostname -I` komutu ile IP adresini öğrenebilirsiniz.

### **2. A Record (WWW)**

```
Type: A
Name: www
IPv4 address: [SUNUCU_IP_ADRESI]
Proxy status: ✅ Proxied (Orange Cloud)
TTL: Auto
```

**VEYA**

```
Type: CNAME
Name: www
Target: serigame.com
Proxy status: ✅ Proxied (Orange Cloud)
TTL: Auto
```

---

## 🔐 SSL/TLS Ayarları

Cloudflare Dashboard > SSL/TLS:

### **Overview**
- **SSL/TLS encryption mode:** `Full (strict)` ✅
  - Bu ayar, Cloudflare ile sunucu arasında şifreli bağlantı kullanır

### **Edge Certificates**
- **Always Use HTTPS:** `On` ✅
- **Automatic HTTPS Rewrites:** `On` ✅
- **Minimum TLS Version:** `1.2` ✅

---

## ⚡ Speed Ayarları

Cloudflare Dashboard > Speed:

### **Optimization**
- **Auto Minify:** 
  - ✅ JavaScript
  - ✅ CSS
  - ✅ HTML

### **Brotli:** `On` ✅

---

## 🗄️ Caching Ayarları

Cloudflare Dashboard > Caching:

### **Browser Cache TTL**
- **Respect Existing Headers** (veya `4 hours`)

### **Purge Cache**
- Gerekirse cache'i temizleyin

---

## 🛡️ Security Ayarları

Cloudflare Dashboard > Security:

### **WAF (Web Application Firewall)**
- **Security Level:** `Medium` veya `High`
- **Challenge Passage:** `30 minutes`

### **Bot Fight Mode**
- `On` (opsiyonel)

---

## 📊 Analytics

Cloudflare Dashboard > Analytics:

### **Web Analytics**
- `On` (opsiyonel - ücretsiz)

---

## ✅ Checklist

Deployment sonrası kontrol:

- [ ] DNS kayıtları eklendi (A record veya CNAME)
- [ ] Proxy status: ✅ Proxied (Orange Cloud)
- [ ] SSL/TLS: Full (strict)
- [ ] Always Use HTTPS: On
- [ ] Nginx yapılandırması tamamlandı
- [ ] PM2 uygulaması çalışıyor
- [ ] Domain test edildi: https://serigame.com

---

## 🔍 Test

### **1. DNS Kontrolü**

```bash
# DNS kayıtlarını kontrol et
nslookup serigame.com
nslookup www.serigame.com

# Cloudflare IP'lerini görmeli (proxied ise)
```

### **2. SSL Kontrolü**

```bash
# SSL sertifikasını kontrol et
curl -I https://serigame.com

# Cloudflare SSL sertifikası görünmeli
```

### **3. Website Test**

```bash
# Website çalışıyor mu kontrol et
curl https://serigame.com

# HTTP 200 OK dönmeli
```

---

## 🆘 Sorun Giderme

### **Sorun 1: "DNS_PROBE_FINISHED_NXDOMAIN"**

**Çözüm:**
- DNS kayıtlarının eklendiğinden emin olun
- Proxy status'un "Proxied" olduğunu kontrol edin
- DNS propagation için 5-10 dakika bekleyin

### **Sorun 2: SSL Sertifika Hatası**

**Çözüm:**
- SSL/TLS encryption mode: `Full (strict)` olmalı
- Always Use HTTPS: `On` olmalı
- Nginx'te SSL yapılandırması gerekli değil (Cloudflare handle eder)

### **Sorun 3: 502 Bad Gateway**

**Çözüm:**
- PM2 uygulamasının çalıştığını kontrol edin: `pm2 status`
- Nginx loglarını kontrol edin: `tail -f /var/log/nginx/error.log`
- Port 3000'in açık olduğunu kontrol edin

---

## 📝 Özet

**Cloudflare'de yapılacaklar:**

1. ✅ **DNS:** A record ekle (serigame.com → sunucu IP)
2. ✅ **DNS:** CNAME ekle (www → serigame.com) veya A record
3. ✅ **SSL/TLS:** Full (strict) mode
4. ✅ **Speed:** Auto Minify aktif
5. ✅ **Always Use HTTPS:** On

**Sunucuda yapılanlar:**

1. ✅ PM2 kuruldu
2. ✅ Proje deploy edildi
3. ✅ Nginx yapılandırıldı
4. ✅ Uygulama çalışıyor

---

**Son Güncelleme:** Deployment tamamlandıktan sonra bu dosyayı güncelleyin.

