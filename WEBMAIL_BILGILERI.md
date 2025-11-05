# 📧 Webmail Bilgileri - serigame.com

## 🔍 Webmail Adresini Bulma

Sunucuda webmail genellikle şu adreslerden birinde olur:

### **Olası Webmail Adresleri:**
- `https://mail.serigame.com` (en yaygın)
- `https://webmail.serigame.com`
- `https://serigame.com/webmail`
- `https://serigame.com/mail`
- `http://mail.serigame.com` (SSL olmadan)

### **Port Kontrolü:**
Sunucuda şu komutları çalıştırın:

```bash
# SSH ile bağlan
ssh golgo360@72.61.97.76

# Webmail kurulu mu kontrol et
ls -la /var/www/ | grep -i mail
ls -la /usr/share/ | grep -i roundcube
ls -la /usr/share/ | grep -i squirrelmail

# Nginx config dosyalarını kontrol et
sudo ls -la /etc/nginx/sites-available/ | grep -i mail
sudo ls -la /etc/nginx/sites-enabled/ | grep -i mail
sudo grep -r "webmail\|roundcube\|squirrelmail" /etc/nginx/

# Apache config (eğer varsa)
sudo ls -la /etc/apache2/sites-available/ | grep -i mail
sudo grep -r "webmail\|roundcube\|squirrelmail" /etc/apache2/

# Çalışan servisleri kontrol et
sudo netstat -tlnp | grep -E ':80|:443|:8080|:8443'
sudo systemctl list-units | grep -i mail

# Port 80 ve 443'te ne dinliyor?
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443

# Roundcube varsa
sudo find /var/www -name "config.inc.php" -type f 2>/dev/null | grep roundcube
sudo find /usr/share -name "config.inc.php" -type f 2>/dev/null | grep roundcube
```

## 📋 Genel Webmail Portları

- **Port 80:** HTTP (http://mail.serigame.com)
- **Port 443:** HTTPS (https://mail.serigame.com)
- **Port 8080:** Alternatif HTTP
- **Port 8443:** Alternatif HTTPS

## 🎯 En Yaygın Webmail Kurulumları

### **1. Roundcube**
- **Yer:** `/var/www/roundcube` veya `/usr/share/roundcube`
- **Config:** `/var/www/roundcube/config/config.inc.php`
- **Adres:** Genellikle `https://mail.serigame.com` veya `https://serigame.com/webmail`

### **2. SquirrelMail**
- **Yer:** `/usr/share/squirrelmail`
- **Config:** `/etc/squirrelmail/config.php`
- **Adres:** Genellikle `https://serigame.com/webmail`

### **3. Rainloop**
- **Yer:** `/var/www/rainloop`
- **Adres:** Genellikle `https://mail.serigame.com`

## 🔧 Hızlı Kontrol Komutları

```bash
# Tüm nginx config dosyalarını oku
sudo cat /etc/nginx/sites-enabled/* | grep -A 10 -i "mail\|webmail"

# Apache config kontrol (eğer varsa)
sudo cat /etc/apache2/sites-enabled/* | grep -A 10 -i "mail\|webmail"

# Webmail dizinlerini bul
sudo find /var/www -type d -iname "*mail*" 2>/dev/null
sudo find /usr/share -type d -iname "*mail*" 2>/dev/null

# Çalışan web servisleri
sudo systemctl status nginx
sudo systemctl status apache2
```

## 📧 Email Hesapları

- **info@serigame.com** - Şifre: `Serinhisar20*`
- **global@serigame.com** - Şifre: `Serinhisar20*`

## 🔐 Webmail Giriş Bilgileri

Webmail adresini bulduktan sonra:

**Kullanıcı Adı:** `info@serigame.com` veya `global@serigame.com`  
**Şifre:** `Serinhisar20*`

**IMAP Sunucu:** `mail.serigame.com` (webmail otomatik olarak buraya bağlanır)

---

**Yukarıdaki komutları çalıştırarak webmail adresini ve portunu bulabilirsiniz!**

