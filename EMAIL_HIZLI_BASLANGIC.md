# 📧 Email Kurulum Hızlı Başlangıç - serigame.com

## 🚀 Hızlı Kurulum (3 Adım)

### **1. Sunucuya SSH ile Bağlan**
```bash
ssh golgo360@72.61.97.76
# Şifre: Serinhisar20*
```

### **2. Kurulum Scriptini Çalıştır**
```bash
# Script'i sunucuya yükleyin veya içeriğini kopyalayın
cd /var/www/serigame.com  # veya proje dizini
chmod +x scripts/setup-email-server.sh
sudo ./scripts/setup-email-server.sh
```

**VEYA Manuel Kurulum:**
```bash
# Detaylı adımlar için:
cat EMAIL_KURULUM_REHBERI.md
```

### **3. Cloudflare DNS Kayıtlarını Ekle**
Cloudflare Dashboard: https://dash.cloudflare.com
→ Domain: **serigame.com** → **DNS** > **Records**

**Aşağıdaki kayıtları ekleyin (Proxied KAPALI olmalı!):**

| Type | Name | Value | Priority |
|------|------|-------|----------|
| **A** | mail | 72.61.97.76 | - |
| **MX** | @ | mail.serigame.com | 10 |
| **TXT** | @ | v=spf1 mx a ip4:72.61.97.76 ~all | - |
| **TXT** | _dmarc | v=DMARC1; p=quarantine; rua=mailto:info@serigame.com | - |
| **TXT** | mail._domainkey | (Script çıktısından alın) | - |

**Detaylı DNS kayıtları için:** `CLOUDFLARE_EMAIL_DNS_KAYITLARI.md`

---

## 📧 Email Hesapları

- **info@serigame.com** - Şifre: `Serinhisar20*`
- **global@serigame.com** - Şifre: `Serinhisar20*`

---

## 📡 Email İstemci Ayarları

### **Gelen Mail (IMAP)**
```
Sunucu: mail.serigame.com
Port: 143 (STARTTLS) veya 993 (SSL)
Kullanıcı: info@serigame.com
Şifre: Serinhisar20*
```

### **Giden Mail (SMTP)**
```
Sunucu: mail.serigame.com
Port: 587 (STARTTLS) veya 465 (SSL)
Kullanıcı: info@serigame.com
Şifre: Serinhisar20*
Kimlik Doğrulama: Gerekli
```

---

## ✅ Kontrol

### **Sunucuda Test**
```bash
# Servis durumu
sudo systemctl status postfix
sudo systemctl status dovecot

# Port kontrolü
sudo netstat -tlnp | grep -E ':25|:587|:143|:993'
```

### **DNS Test**
```bash
# MX kaydı
nslookup -type=MX serigame.com

# SPF kaydı
nslookup -type=TXT serigame.com
```

---

## 📚 Detaylı Dokümantasyon

- **Kurulum Rehberi:** `EMAIL_KURULUM_REHBERI.md`
- **DNS Kayıtları:** `CLOUDFLARE_EMAIL_DNS_KAYITLARI.md`
- **Kurulum Scripti:** `scripts/setup-email-server.sh`

---

**⚠️ ÖNEMLİ:** Email DNS kayıtları Cloudflare'de **Proxied KAPALI** (Gri Cloud) olmalı!

