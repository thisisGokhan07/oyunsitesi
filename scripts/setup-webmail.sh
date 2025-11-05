#!/bin/bash

# Webmail (Roundcube) Kurulum Scripti
# serigame.com için

set -e

echo "📧 Roundcube Webmail Kurulumu Başlıyor..."
echo "=========================================="

# Renk kodları
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Sistem Güncellemesi
echo -e "${YELLOW}[1/8] Sistem güncelleniyor...${NC}"
sudo apt update

# 2. PHP ve Gerekli Paketler
echo -e "${YELLOW}[2/8] PHP ve gerekli paketler kuruluyor...${NC}"
sudo apt install -y php php-fpm php-mysql php-mbstring php-xml php-zip php-gd php-curl php-intl php-imap php-ldap

# 3. Roundcube Kurulumu
echo -e "${YELLOW}[3/8] Roundcube kuruluyor...${NC}"
cd /var/www
if [ -d "roundcube" ]; then
    echo "Roundcube zaten kurulu, güncelleniyor..."
    cd roundcube
    sudo wget -q https://github.com/roundcube/roundcubemail/releases/download/1.6.7/roundcubemail-1.6.7-complete.tar.gz
    sudo tar -xzf roundcubemail-1.6.7-complete.tar.gz
    sudo mv roundcubemail-1.6.7/* .
    sudo rm -rf roundcubemail-1.6.7 roundcubemail-1.6.7-complete.tar.gz
else
    sudo wget -q https://github.com/roundcube/roundcubemail/releases/download/1.6.7/roundcubemail-1.6.7-complete.tar.gz
    sudo tar -xzf roundcubemail-1.6.7-complete.tar.gz
    sudo mv roundcubemail-1.6.7 roundcube
    sudo rm roundcubemail-1.6.7-complete.tar.gz
fi

sudo chown -R www-data:www-data /var/www/roundcube
sudo chmod -R 755 /var/www/roundcube
sudo chmod -R 777 /var/www/roundcube/temp
sudo chmod -R 777 /var/www/roundcube/logs

# 4. Roundcube Database Kurulumu
echo -e "${YELLOW}[4/8] Roundcube database kuruluyor...${NC}"
# Roundcube kendi database'ini kullanacak, Supabase kullanmayacağız
# MySQL/MariaDB kurulumu (Roundcube için)
sudo apt install -y mariadb-server mariadb-client

# Database ve kullanıcı oluştur
sudo mysql <<EOF
CREATE DATABASE IF NOT EXISTS roundcube CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'roundcube'@'localhost' IDENTIFIED BY 'roundcube_$(openssl rand -hex 8)';
GRANT ALL PRIVILEGES ON roundcube.* TO 'roundcube'@'localhost';
FLUSH PRIVILEGES;
EOF

# Roundcube database schema'sını import et
sudo mysql roundcube < /var/www/roundcube/SQL/mysql.initial.sql

# 5. Roundcube Config
echo -e "${YELLOW}[5/8] Roundcube yapılandırılıyor...${NC}"
cd /var/www/roundcube/config

# config.inc.php oluştur
sudo cp config.inc.php.sample config.inc.php

# Database config
DB_PASSWORD=$(sudo mysql -e "SELECT password FROM mysql.user WHERE user='roundcube' AND host='localhost';" 2>/dev/null | grep -v password | head -1)
if [ -z "$DB_PASSWORD" ]; then
    DB_PASSWORD=$(openssl rand -hex 16)
fi

sudo sed -i "s|\$config\['db_dsnw'\] = 'mysql://roundcube:pass@localhost/roundcubemail';|\$config['db_dsnw'] = 'mysql://roundcube:${DB_PASSWORD}@localhost/roundcube';|" config.inc.php

# IMAP/SMTP config
sudo tee -a config.inc.php > /dev/null <<EOF

// IMAP Configuration
\$config['default_host'] = 'mail.serigame.com';
\$config['default_port'] = 143;
\$config['imap_conn_options'] = array(
    'ssl' => array('verify_peer' => false, 'verify_peer_name' => false),
);
\$config['imap_timeout'] = 15;
\$config['smtp_server'] = 'mail.serigame.com';
\$config['smtp_port'] = 587;
\$config['smtp_user'] = '%u';
\$config['smtp_pass'] = '%p';
\$config['smtp_conn_options'] = array(
    'ssl' => array('verify_peer' => false, 'verify_peer_name' => false),
);

// Mail server configuration
\$config['imap_host'] = 'mail.serigame.com:143';
\$config['smtp_host'] = 'mail.serigame.com:587';
\$config['username_domain'] = 'serigame.com';

// Security
\$config['use_https'] = true;
\$config['force_https'] = true;
\$config['session_lifetime'] = 10;
\$config['ip_check'] = false;

// Language
\$config['language'] = 'tr_TR';
\$config['default_charset'] = 'UTF-8';

// Plugins
\$config['plugins'] = array('archive', 'zipdownload');
EOF

# 6. Nginx Yapılandırması
echo -e "${YELLOW}[6/8] Nginx yapılandırılıyor...${NC}"
sudo tee /etc/nginx/sites-available/webmail.serigame.com > /dev/null <<EOF
server {
    listen 80;
    server_name mail.serigame.com webmail.serigame.com;

    # Redirect to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name mail.serigame.com webmail.serigame.com;

    # SSL Configuration (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/serigame.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/serigame.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    root /var/www/roundcube;
    index index.php;

    access_log /var/log/nginx/webmail-access.log;
    error_log /var/log/nginx/webmail-error.log;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        try_files \$uri \$uri/ /index.php;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    location ~ ^/(config|temp|logs)/ {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Deny access to SQL files
    location ~ \.sql$ {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF

# 7. SSL Sertifikası (Let's Encrypt)
echo -e "${YELLOW}[7/8] SSL sertifikası alınıyor...${NC}"
if ! command -v certbot &> /dev/null; then
    sudo apt install -y certbot python3-certbot-nginx
fi

# Certbot ile SSL al (eğer yoksa)
if [ ! -f /etc/letsencrypt/live/serigame.com/fullchain.pem ]; then
    echo "Let's Encrypt sertifikası alınıyor..."
    sudo certbot --nginx -d mail.serigame.com -d webmail.serigame.com --non-interactive --agree-tos --email info@serigame.com --redirect
else
    echo "SSL sertifikası zaten mevcut, genişletiliyor..."
    sudo certbot --nginx -d mail.serigame.com -d webmail.serigame.com --non-interactive --agree-tos --expand
fi

# Nginx site'ı aktif et
sudo ln -sf /etc/nginx/sites-available/webmail.serigame.com /etc/nginx/sites-enabled/

# 8. Servisleri Başlatma
echo -e "${YELLOW}[8/8] Servisler başlatılıyor...${NC}"
sudo systemctl restart php8.1-fpm
sudo systemctl restart nginx
sudo systemctl enable php8.1-fpm

# Özet
echo ""
echo -e "${GREEN}=========================================="
echo "✅ Roundcube Webmail Kurulumu Tamamlandı!"
echo "==========================================${NC}"
echo ""
echo "🌐 Webmail Adresi:"
echo "  - https://mail.serigame.com"
echo "  - https://webmail.serigame.com"
echo ""
echo "📧 Email Hesapları:"
echo "  - info@serigame.com (Şifre: Serinhisar20*)"
echo "  - global@serigame.com (Şifre: Serinhisar20*)"
echo ""
echo "📋 Database Bilgileri:"
echo "  - Database: roundcube"
echo "  - User: roundcube"
echo "  - Password: (mysql'de saklanıyor)"
echo ""
echo "⚠️  ÖNEMLİ:"
echo "  1. Cloudflare DNS'e mail ve webmail için A kaydı ekleyin"
echo "  2. mail.serigame.com → 72.61.97.76 (Proxied KAPALI)"
echo "  3. webmail.serigame.com → 72.61.97.76 (Proxied KAPALI)"
echo ""
echo "✅ Kurulum tamamlandı! Webmail'e erişebilirsiniz."
echo ""

