# 🌐 Cloudflare DNS Ayarları - serigame.com

## ⚡ HIZLI KURULUM

Cloudflare Dashboard > **DNS** > **Records** > **Add record**

### **1. A Record Ekle**
```
Type: A
Name: @
IPv4 address: 72.61.97.76
Proxy status: ✅ Proxied (Orange Cloud AÇIK)
TTL: Auto
```
→ **Save** butonuna tıklayın

### **2. CNAME Record Ekle**
```
Type: CNAME
Name: www
Target: serigame.com
Proxy status: ✅ Proxied (Orange Cloud AÇIK)
TTL: Auto
```
→ **Save** butonuna tıklayın

---

## 🔐 SSL/TLS Ayarları

Cloudflare Dashboard > **SSL/TLS**

- **SSL/TLS encryption mode:** `Full (strict)` ✅
- **Always Use HTTPS:** `On` ✅
- **Automatic HTTPS Rewrites:** `On` ✅

---

## ✅ TAMAMLANDI!

5-10 dakika sonra: **https://serigame.com** çalışmalı! 🚀

**Sunucu IP:** `72.61.97.76`

