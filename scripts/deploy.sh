#!/bin/bash

# SeriGame.com Deployment Script
# Kullanım: ./deploy.sh

set -e

echo "🚀 SeriGame.com Deployment başlatılıyor..."

# Renkler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Kontroller
echo -e "${YELLOW}📋 Kontroller yapılıyor...${NC}"

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

# Git kontrol
if ! command -v git &> /dev/null; then
    echo -e "${YELLOW}⚠️  Git bulunamadı, devam ediliyor...${NC}"
fi

# .env.local kontrol
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ .env.local dosyası bulunamadı!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ .env.local bulundu${NC}"

# Dependencies kurulumu
echo -e "${YELLOW}📦 Dependencies kuruluyor...${NC}"
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

# PM2 kontrol
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}⚠️  PM2 bulunamadı, kurulum öneriliyor: npm install -g pm2${NC}"
else
    echo -e "${GREEN}✅ PM2 bulundu${NC}"
    
    # PM2 restart
    if pm2 list | grep -q "serigame"; then
        echo -e "${YELLOW}🔄 PM2 uygulaması yeniden başlatılıyor...${NC}"
        pm2 restart serigame
    else
        echo -e "${YELLOW}🚀 PM2 uygulaması başlatılıyor...${NC}"
        pm2 start ecosystem.config.js
    fi
    
    echo -e "${GREEN}✅ PM2 durumu:${NC}"
    pm2 status
fi

echo -e "${GREEN}✅ Deployment tamamlandı!${NC}"
echo -e "${YELLOW}💡 Şimdi Nginx'i kontrol edin ve Cloudflare ayarlarını yapın.${NC}"

