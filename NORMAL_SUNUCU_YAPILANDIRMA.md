# 🔧 Normal Sunucu Yapılandırması (Cloudflare Olmadan)

## ✅ Yapılan Yapılandırmalar

### 1. **SSL Sertifikası (Let's Encrypt)**
- ✅ Certbot kuruldu
- ✅ SSL sertifikası oluşturuldu
- ✅ Otomatik yenileme ayarlandı

### 2. **Nginx Yapılandırması**
- ✅ HTTP (port 80) → HTTPS'e yönlendirme
- ✅ HTTPS (port 443) yapılandırıldı
- ✅ SSL/TLS ayarları optimize edildi
- ✅ Security headers eklendi
- ✅ Gzip compression aktif

### 3. **Reverse Proxy**
- ✅ Next.js uygulaması proxy ediliyor (port 3000)
- ✅ Static dosyalar cache'leniyor
- ✅ API route'ları yapılandırıldı

---

## 📋 Nginx Yapılandırması

### **HTTP (Port 80)**
- Tüm istekler HTTPS'e yönlendiriliyor
- Let's Encrypt doğrulama için `.well-known` path açık

### **HTTPS (Port 443)**
- SSL/TLS 1.2 ve 1.3 aktif
- Modern cipher suites
- Security headers (HSTS, X-Frame-Options, vb.)
- Static dosyalar cache'leniyor (1 yıl)
- Gzip compression aktif

---

## 🔐 SSL Sertifikası

**Konum:** `/etc/letsencrypt/live/serigame.com/`
- `fullchain.pem` - Tam sertifika zinciri
- `privkey.pem` - Özel anahtar

**Otomatik Yenileme:**
```bash
# Certbot otomatik yenileme cron job'u kurdu
certbot renew --dry-run
```

---

## 🚀 Erişim

### **HTTP:**
- `http://serigame.com` → `https://serigame.com`'a yönlendirir
- `http://www.serigame.com` → `https://www.serigame.com`'a yönlendirir

### **HTTPS:**
- `https://serigame.com` ✅
- `https://www.serigame.com` ✅

---

## 🔧 Yönetim Komutları

### **SSL Sertifikası Yenileme:**
```bash
certbot renew
systemctl reload nginx
```

### **Nginx Test:**
```bash
nginx -t
```

### **Nginx Reload:**
```bash
systemctl reload nginx
```

### **Nginx Restart:**
```bash
systemctl restart nginx
```

### **PM2 Durumu:**
```bash
pm2 status
pm2 logs serigame
```

---

## 📊 Port Durumu

- **Port 80:** HTTP (HTTPS'e yönlendirir)
- **Port 443:** HTTPS (Ana site)
- **Port 3000:** Next.js uygulaması (local)

---

## 🔒 Security Headers

- ✅ `Strict-Transport-Security` (HSTS)
- ✅ `X-Frame-Options`
- ✅ `X-Content-Type-Options`
- ✅ `X-XSS-Protection`

---

## ⚡ Performans

- ✅ Gzip compression aktif
- ✅ Static dosyalar cache'leniyor
- ✅ HTTP/2 aktif
- ✅ SSL session cache

---

## ✅ Test

```bash
# HTTP test
curl -I http://serigame.com
# 301 redirect dönmeli

# HTTPS test
curl -I https://serigame.com
# 200 OK dönmeli

# SSL sertifikası kontrolü
openssl s_client -connect serigame.com:443 -servername serigame.com
```

---

## 🎯 Sonuç

- ✅ SSL sertifikası kuruldu
- ✅ HTTPS yapılandırıldı
- ✅ Security headers eklendi
- ✅ Cloudflare olmadan çalışıyor
- ✅ Otomatik SSL yenileme aktif

**Site artık direkt sunucudan erişilebilir:** `https://serigame.com`

