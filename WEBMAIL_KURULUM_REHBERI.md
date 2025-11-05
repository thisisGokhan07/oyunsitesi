# 📧 Webmail (Roundcube) Kurulum Rehberi - serigame.com

## 🚀 Hızlı Kurulum

### **1. Sunucuya SSH ile Bağlan**
```bash
ssh golgo360@72.61.97.76
# Şifre: Serinhisar20*
```

### **2. Kurulum Scriptini Çalıştır**
```bash
# Script'i sunucuya yükleyin veya içeriğini kopyalayın
cd /var/www/serigame.com
chmod +x scripts/setup-webmail.sh
sudo bash scripts/setup-webmail.sh
```

**VEYA Manuel Kurulum:**
Aşağıdaki adımları sırayla takip edin.

---

## 📋 Manuel Kurulum Adımları

### **1. Sistem Güncellemesi**
```bash
sudo apt update
```

### **2. PHP ve Gerekli Paketler**
```bash
sudo apt install -y php php-fpm php-mysql php-mbstring php-xml php-zip php-gd php-curl php-intl php-imap php-ldap
```

### **3. Roundcube İndirme ve Kurulum**
```bash
cd /var/www
sudo wget https://github.com/roundcube/roundcubemail/releases/download/1.6.7/roundcubemail-1.6.7-complete.tar.gz
sudo tar -xzf roundcubemail-1.6.7-complete.tar.gz
sudo mv roundcubemail-1.6.7 roundcube
sudo rm roundcubemail-1.6.7-complete.tar.gz

# İzinleri ayarla
sudo chown -R www-data:www-data /var/www/roundcube
sudo chmod -R 755 /var/www/roundcube
sudo chmod -R 777 /var/www/roundcube/temp
sudo chmod -R 777 /var/www/roundcube/logs
```

### **4. Database Kurulumu**
```bash
# MariaDB kurulumu
sudo apt install -y mariadb-server mariadb-client

# Database ve kullanıcı oluştur
sudo mysql <<EOF
CREATE DATABASE IF NOT EXISTS roundcube CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'roundcube'@'localhost' IDENTIFIED BY 'güçlü_şifre_buraya';
GRANT ALL PRIVILEGES ON roundcube.* TO 'roundcube'@'localhost';
FLUSH PRIVILEGES;
EOF

# Roundcube database schema'sını import et
sudo mysql roundcube < /var/www/roundcube/SQL/mysql.initial.sql
```

### **5. Roundcube Yapılandırması**
```bash
cd /var/www/roundcube/config
sudo cp config.inc.php.sample config.inc.php
sudo nano config.inc.php
```

**config.inc.php dosyasına ekleyin:**
```php
// Database
$config['db_dsnw'] = 'mysql://roundcube:ŞİFRE_BURAYA@localhost/roundcube';

// IMAP Configuration
$config['default_host'] = 'mail.serigame.com';
$config['default_port'] = 143;
$config['imap_conn_options'] = array(
    'ssl' => array('verify_peer' => false, 'verify_peer_name' => false),
);

// SMTP Configuration
$config['smtp_server'] = 'mail.serigame.com';
$config['smtp_port'] = 587;
$config['smtp_user'] = '%u';
$config['smtp_pass'] = '%p';
$config['smtp_conn_options'] = array(
    'ssl' => array('verify_peer' => false, 'verify_peer_name' => false),
);

// Security
$config['use_https'] = true;
$config['force_https'] = true;

// Language
$config['language'] = 'tr_TR';
$config['default_charset'] = 'UTF-8';
```

### **6. Nginx Yapılandırması**
```bash
sudo nano /etc/nginx/sites-available/webmail.serigame.com
```

**İçeriği:**
```nginx
server {
    listen 80;
    server_name mail.serigame.com webmail.serigame.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name mail.serigame.com webmail.serigame.com;

    ssl_certificate /etc/letsencrypt/live/serigame.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/serigame.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    root /var/www/roundcube;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\. {
        deny all;
    }

    location ~ ^/(config|temp|logs)/ {
        deny all;
    }
}
```

**Site'ı aktif et:**
```bash
sudo ln -s /etc/nginx/sites-available/webmail.serigame.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### **7. SSL Sertifikası**
```bash
# Let's Encrypt ile SSL al
sudo certbot --nginx -d mail.serigame.com -d webmail.serigame.com
```

---

## 🌐 Cloudflare DNS Ayarları

Cloudflare Dashboard: https://dash.cloudflare.com  
→ Domain: **serigame.com** → **DNS** > **Records**

**Eklenmesi gereken kayıtlar:**

| Type | Name | Value | Proxy |
|------|------|-------|-------|
| **A** | mail | 72.61.97.76 | ❌ KAPALI (DNS only) |
| **A** | webmail | 72.61.97.76 | ❌ KAPALI (DNS only) |

**⚠️ ÖNEMLİ:** Webmail kayıtları için **Proxied KAPALI** (Gri Cloud) olmalı!

---

## 📧 Webmail Erişim

### **Webmail Adresleri:**
- `https://mail.serigame.com`
- `https://webmail.serigame.com`

### **Giriş Bilgileri:**
- **Kullanıcı Adı:** `info@serigame.com` veya `global@serigame.com`
- **Şifre:** `Serinhisar20*`

---

## ✅ Kurulum Sonrası Kontrol

### **1. Webmail Erişimi**
```bash
# Tarayıcıda aç
https://mail.serigame.com
```

### **2. Nginx Durumu**
```bash
sudo systemctl status nginx
sudo nginx -t
```

### **3. PHP-FPM Durumu**
```bash
sudo systemctl status php8.1-fpm
```

### **4. Log Kontrolü**
```bash
# Nginx logları
sudo tail -f /var/log/nginx/webmail-error.log

# Roundcube logları
sudo tail -f /var/www/roundcube/logs/errors.log
```

---

## 🔧 Sorun Giderme

### **Webmail açılmıyor:**
```bash
# Nginx config test
sudo nginx -t

# PHP-FPM durumu
sudo systemctl status php8.1-fpm

# İzinleri kontrol et
sudo ls -la /var/www/roundcube
sudo chown -R www-data:www-data /var/www/roundcube
```

### **Giriş yapamıyorum:**
- IMAP sunucusunun çalıştığından emin olun: `sudo systemctl status dovecot`
- Email hesaplarının doğru olduğundan emin olun
- config.inc.php'deki IMAP ayarlarını kontrol edin

### **SSL hatası:**
```bash
# SSL sertifikasını yenile
sudo certbot renew
sudo systemctl reload nginx
```

---

## 📚 Ek Bilgiler

### **Roundcube Versiyonu:**
- Kurulacak: 1.6.7 (en son stabil)

### **PHP Versiyonu:**
- Gerekli: PHP 7.4 veya üzeri
- Önerilen: PHP 8.1

### **Database:**
- MariaDB/MySQL kullanılıyor
- Roundcube kendi database'ini kullanır

---

**Kurulum tamamlandıktan sonra webmail'e erişebilirsiniz!** 📧✨

