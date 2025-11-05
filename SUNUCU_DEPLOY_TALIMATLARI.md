# 🚀 Sunucuya Deployment Talimatları

## 📋 Sunucuya Bağlanma

Sunucuya SSH ile bağlanın:

```bash
ssh golog360@serigame.com
# veya
ssh golog360@golog360.com
```

## 🔄 GitHub'dan Son Güncel Hali Çekme ve Deployment

Sunucuya bağlandıktan sonra aşağıdaki komutları çalıştırın:

### **Yöntem 1: Otomatik Script (Önerilen)**

```bash
# Proje dizinine git
cd /var/www/serigame.com

# Script'i çalıştırılabilir yap
chmod +x scripts/server-deploy.sh

# Script'i çalıştır
./scripts/server-deploy.sh
```

### **Yöntem 2: Manuel Komutlar**

```bash
# Proje dizinine git
cd /var/www/serigame.com

# Eğer proje yoksa klonla
if [ ! -d ".git" ]; then
    git clone https://github.com/thisisGokhan07/oyunsitesi.git .
fi

# Mevcut değişiklikleri stash'e al (varsa)
git stash || true

# Son güncel hali çek
git fetch origin main
git pull origin main

# Stash'teki değişiklikleri geri yükle (varsa)
git stash pop || true

# Dependencies güncelle
npm install

# Production build
npm run build

# PM2 ile yeniden başlat
pm2 restart serigame
# veya ilk defa başlatıyorsanız:
# pm2 start ecosystem.config.js
```

## ✅ Kontrol Komutları

```bash
# PM2 durumu
pm2 status

# PM2 logları
pm2 logs serigame --lines 50

# PM2 monitör
pm2 monit

# Nginx durumu
sudo systemctl status nginx

# Nginx config test
sudo nginx -t

# Nginx reload
sudo systemctl reload nginx
```

## 🔍 Sorun Giderme

### Build Hatası
```bash
# Node modules'ı temizle ve yeniden kur
rm -rf node_modules package-lock.json
npm install
npm run build
```

### PM2 Hatası
```bash
# PM2'yi durdur ve yeniden başlat
pm2 stop serigame
pm2 delete serigame
pm2 start ecosystem.config.js
```

### Port Çakışması
```bash
# 3000 portunu kullanan process'i kontrol et
lsof -i :3000
# veya
netstat -tulpn | grep 3000

# Gerekirse process'i öldür
kill -9 <PID>
```

## 📝 Önemli Notlar

1. **.env.local dosyası** mutlaka mevcut olmalı ve doğru değerler içermeli
2. **PM2 ecosystem.config.js** dosyası `/var/www/serigame.com` dizininde olmalı
3. **Nginx config** `/etc/nginx/sites-available/serigame.com` dosyasında olmalı
4. Build sonrası PM2 mutlaka yeniden başlatılmalı

## 🔗 Faydalı Linkler

- GitHub Repository: https://github.com/thisisGokhan07/oyunsitesi
- Site: https://serigame.com
- PM2 Dokümantasyon: https://pm2.keymetrics.io/docs/

