# 🚀 SeriGame.com Deployment Rehberi

## 📋 Sunucu Yapılandırması (golog360.com)

### **1. SSH Bağlantısı**

```bash
# SSH ile bağlan
ssh root@golog360.com
# veya
ssh kullanici@golog360.com
```

### **2. Gerekli Paketleri Kur**

```bash
# Node.js 18+ kurulumu
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 kurulumu (process manager)
sudo npm install -g pm2

# Nginx kurulumu (reverse proxy)
sudo apt-get update
sudo apt-get install -y nginx

# Git kurulumu (eğer yoksa)
sudo apt-get install -y git
```

### **3. Proje Klasörü Oluştur**

```bash
# Proje dizini
sudo mkdir -p /var/www/serigame.com
sudo chown -R $USER:$USER /var/www/serigame.com
cd /var/www/serigame.com
```

### **4. Projeyi GitHub'dan Çek**

```bash
# GitHub'dan projeyi klonla
git clone https://github.com/thisisGokhan07/oyunsitesi.git .

# veya mevcut projeyi buraya kopyala
# scp -r /local/path/to/project/* user@golog360.com:/var/www/serigame.com/
```

### **5. Environment Variables Ayarla**

```bash
# .env.local dosyası oluştur
nano .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://zjpmgoycegocllpovmru.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqcG1nb3ljZWdvY2xscG92bXJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4Mzc0NDIsImV4cCI6MjA3NzQxMzQ0Mn0.4EbeffuX3Gn6livCtD3OAyTro1k1UmJKqjAsdKONBaM
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqcG1nb3ljZWdvY2xscG92bXJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImiYXQiOjE3NjE4Mzc0NDIsImV4cCI6MjA3NzQxMzQ0Mn0.EyKyvADk9W1nlX6zNpgroRX9Ch9znFQdKiUE4mXjk6Y
NEXT_PUBLIC_SITE_URL=https://serigame.com
NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=ca-pub-xxxxxxxxxxxxxxxxx
```

### **6. Dependencies Kur**

```bash
npm install
```

### **7. Production Build**

```bash
# Production build
npm run build

# Build başarılı olursa, .next klasörü oluşur
```

### **8. PM2 ile Çalıştır**

```bash
# PM2 ecosystem dosyası oluştur
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'serigame',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/var/www/serigame.com',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/serigame-error.log',
    out_file: '/var/log/pm2/serigame-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G'
  }]
};
```

```bash
# PM2 ile başlat
pm2 start ecosystem.config.js

# PM2'yi sistem başlangıcında otomatik başlat
pm2 startup
pm2 save
```

### **9. Nginx Yapılandırması**

```bash
# Nginx config dosyası oluştur
sudo nano /etc/nginx/sites-available/serigame.com
```

```nginx
server {
    listen 80;
    server_name serigame.com www.serigame.com;

    # Cloudflare'den gelen gerçek IP'leri al
    set_real_ip_from 103.21.244.0/22;
    set_real_ip_from 103.22.200.0/22;
    set_real_ip_from 103.31.4.0/22;
    set_real_ip_from 104.16.0.0/13;
    set_real_ip_from 104.24.0.0/14;
    set_real_ip_from 108.162.192.0/18;
    set_real_ip_from 131.0.72.0/22;
    set_real_ip_from 141.101.64.0/18;
    set_real_ip_from 162.158.0.0/15;
    set_real_ip_from 172.64.0.0/13;
    set_real_ip_from 173.245.48.0/20;
    set_real_ip_from 188.114.96.0/20;
    set_real_ip_from 190.93.240.0/20;
    set_real_ip_from 197.234.240.0/22;
    set_real_ip_from 198.41.128.0/17;
    set_real_ip_from 2400:cb00::/32;
    set_real_ip_from 2606:4700::/32;
    set_real_ip_from 2803:f800::/32;
    set_real_ip_from 2405:b500::/32;
    set_real_ip_from 2405:8100::/32;
    set_real_ip_from 2c0f:f248::/32;
    set_real_ip_from 2a06:98c0::/29;
    real_ip_header CF-Connecting-IP;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout ayarları
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static dosyalar için cache
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;
}
```

```bash
# Symbolic link oluştur
sudo ln -s /etc/nginx/sites-available/serigame.com /etc/nginx/sites-enabled/

# Nginx config test
sudo nginx -t

# Nginx'i yeniden başlat
sudo systemctl restart nginx
```

### **10. SSL Sertifikası (Cloudflare)**

Cloudflare'den SSL kullanıyorsanız, Nginx'te SSL yapılandırmasına gerek yok. Cloudflare SSL'i handle eder.

Ancak sunucu tarafında da SSL isterseniz:

```bash
# Certbot ile Let's Encrypt SSL
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d serigame.com -d www.serigame.com
```

---

## 🔄 Cloudflare Yapılandırması

### **1. DNS Ayarları**

Cloudflare Dashboard > DNS:
- **A Record:** `serigame.com` → `golog360.com IP adresi`
- **A Record:** `www.serigame.com` → `golog360.com IP adresi`
- **CNAME:** `www` → `serigame.com` (alternatif)

### **2. SSL/TLS Ayarları**

Cloudflare Dashboard > SSL/TLS:
- **SSL/TLS encryption mode:** Full (strict)
- **Always Use HTTPS:** On
- **Automatic HTTPS Rewrites:** On

### **3. Speed Ayarları**

- **Auto Minify:** JavaScript, CSS, HTML
- **Brotli:** On
- **Rocket Loader:** On (opsiyonel)

### **4. Caching**

- **Browser Cache TTL:** 4 hours
- **Edge Cache TTL:** 2 hours

---

## 🔍 Kontrol ve Test

### **Sunucuda Kontrol**

```bash
# PM2 durumu
pm2 status

# PM2 logları
pm2 logs serigame

# Nginx durumu
sudo systemctl status nginx

# Port kontrolü
sudo netstat -tlnp | grep 3000
```

### **Test**

```bash
# Localhost'tan test
curl http://localhost:3000

# Domain'den test
curl http://serigame.com
```

---

## 🛠️ Sorun Giderme

### **Sorun 1: PM2 Çalışmıyor**

```bash
# PM2 loglarını kontrol et
pm2 logs serigame --lines 50

# PM2'yi yeniden başlat
pm2 restart serigame
```

### **Sorun 2: Nginx 502 Bad Gateway**

```bash
# Next.js uygulamasının çalıştığını kontrol et
pm2 status

# Port 3000'in açık olduğunu kontrol et
sudo netstat -tlnp | grep 3000

# Nginx error loglarını kontrol et
sudo tail -f /var/log/nginx/error.log
```

### **Sorun 3: Build Hatası**

```bash
# Node.js versiyonunu kontrol et (18+ olmalı)
node -v

# Dependencies'i yeniden kur
rm -rf node_modules package-lock.json
npm install

# Build'i tekrar dene
npm run build
```

---

## 📊 Monitoring

### **PM2 Monitoring**

```bash
# PM2 monit aç
pm2 monit

# PM2 web interface (opsiyonel)
pm2 web
```

### **Log Rotation**

```bash
# PM2 log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## 🔐 Güvenlik

### **Firewall**

```bash
# UFW firewall kurulumu
sudo apt-get install -y ufw

# Gerekli portları aç
sudo ufw allow 22/tcp  # SSH
sudo ufw allow 80/tcp  # HTTP
sudo ufw allow 443/tcp # HTTPS

# Firewall'u aktif et
sudo ufw enable
```

### **Fail2Ban**

```bash
# Fail2Ban kurulumu
sudo apt-get install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## ✅ Checklist

- [ ] Node.js 18+ kurulu
- [ ] PM2 kurulu ve çalışıyor
- [ ] Nginx kurulu ve yapılandırılmış
- [ ] Proje build edildi
- [ ] Environment variables ayarlandı
- [ ] PM2 ile uygulama çalışıyor
- [ ] Nginx reverse proxy çalışıyor
- [ ] Cloudflare DNS ayarları yapıldı
- [ ] SSL/TLS aktif
- [ ] Domain test edildi

---

## 📞 Destek

Sorun yaşarsanız:
1. PM2 loglarını kontrol edin: `pm2 logs serigame`
2. Nginx loglarını kontrol edin: `sudo tail -f /var/log/nginx/error.log`
3. Sunucu kaynaklarını kontrol edin: `htop` veya `free -h`

