#!/bin/bash

# SeriGame.com Sunucu Deployment Script
# GitHub'dan son güncel hali çekip birleştirir ve çalıştırır
# Kullanım: ./scripts/server-deploy.sh

set -e

echo "🚀 SeriGame.com Sunucu Deployment başlatılıyor..."

# Renkler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Proje dizini kontrolü
if [ ! -d "/var/www/serigame.com" ]; then
    echo -e "${YELLOW}📁 Proje dizini bulunamadı, oluşturuluyor...${NC}"
    sudo mkdir -p /var/www/serigame.com
    sudo chown -R $USER:$USER /var/www/serigame.com
fi

cd /var/www/serigame.com

# Git kontrolü
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}📥 Proje GitHub'dan klonlanıyor...${NC}"
    git clone https://github.com/thisisGokhan07/oyunsitesi.git .
else
    echo -e "${YELLOW}🔄 GitHub'dan son güncel hali çekiliyor...${NC}"
    # Mevcut değişiklikleri stash'e al (eğer varsa)
    git stash || true
    
    # Son güncel hali çek
    git fetch origin main
    git pull origin main
    
    # Stash'teki değişiklikleri geri yükle (eğer varsa)
    git stash pop || true
fi

echo -e "${GREEN}✅ GitHub'dan güncel kod çekildi${NC}"

# .env.local kontrolü
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ .env.local dosyası bulunamadı!${NC}"
    echo -e "${YELLOW}⚠️  Lütfen .env.local dosyasını oluşturun:${NC}"
    echo ""
    echo "NEXT_PUBLIC_SUPABASE_URL=https://zjpmgoycegocllpovmru.supabase.co"
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqcG1nb3ljZWdvY2xscG92bXJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4Mzc0NDIsImV4cCI6MjA3NzQxMzQ0Mn0.4EbeffuX3Gn6livCtD3OAyTro1k1UmJKqjAsdKONBaM"
    echo "SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqcG1nb3ljZWdvY2xscG92bXJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImiYXQiOjE3NjE4Mzc0NDIsImV4cCI6MjA3NzQxMzQ0Mn0.EyKyvADk9W1nlX6zNpgroRX9Ch9znFQdKiUE4mXjk6Y"
    echo "NEXT_PUBLIC_SITE_URL=https://serigame.com"
    exit 1
fi

echo -e "${GREEN}✅ .env.local bulundu${NC}"

# Node.js versiyonu kontrol
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js bulunamadı!${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js 18+ gerekli! Mevcut: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v)${NC}"

# Dependencies kurulumu
echo -e "${YELLOW}📦 Dependencies kuruluyor/güncelleniyor...${NC}"
npm install

# Build
echo -e "${YELLOW}🔨 Production build yapılıyor...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build başarılı!${NC}"
else
    echo -e "${RED}❌ Build başarısız!${NC}"
    exit 1
fi

# PM2 kontrol ve restart
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}⚠️  PM2 bulunamadı, kuruluyor...${NC}"
    sudo npm install -g pm2
fi

echo -e "${GREEN}✅ PM2 bulundu${NC}"

# PM2 restart
if pm2 list | grep -q "serigame"; then
    echo -e "${YELLOW}🔄 PM2 uygulaması yeniden başlatılıyor...${NC}"
    pm2 restart serigame
else
    echo -e "${YELLOW}🚀 PM2 uygulaması başlatılıyor...${NC}"
    
    # ecosystem.config.js kontrolü
    if [ ! -f ecosystem.config.js ]; then
        echo -e "${YELLOW}📝 ecosystem.config.js oluşturuluyor...${NC}"
        cat > ecosystem.config.js << 'EOF'
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
EOF
    fi
    
    pm2 start ecosystem.config.js
    pm2 startup
    pm2 save
fi

echo -e "${GREEN}✅ PM2 durumu:${NC}"
pm2 status

# Nginx kontrolü
if command -v nginx &> /dev/null; then
    echo -e "${YELLOW}🔄 Nginx config test ediliyor...${NC}"
    sudo nginx -t && sudo systemctl reload nginx || echo -e "${YELLOW}⚠️  Nginx reload edilemedi, manuel kontrol gerekli${NC}"
fi

echo ""
echo -e "${GREEN}✅✅✅ Deployment tamamlandı!${NC}"
echo -e "${YELLOW}💡 Site: https://serigame.com${NC}"
echo -e "${YELLOW}📊 PM2 logları: pm2 logs serigame${NC}"
echo -e "${YELLOW}🔄 PM2 durumu: pm2 status${NC}"

