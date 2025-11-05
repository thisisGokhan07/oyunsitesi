#!/bin/bash

# DKIM Key Oluşturma Scripti
# serigame.com için

echo "🔐 DKIM Key Oluşturuluyor..."
echo "=============================="

# Gerekli paketleri kontrol et ve kur
if ! command -v opendkim-genkey &> /dev/null; then
    echo "📦 OpenDKIM kuruluyor..."
    sudo apt update
    sudo apt install -y opendkim opendkim-tools
fi

# DKIM dizinini oluştur
sudo mkdir -p /etc/opendkim/keys
sudo chown opendkim:opendkim /etc/opendkim/keys

# DKIM key oluştur
echo "🔑 DKIM key oluşturuluyor..."
sudo opendkim-genkey -t -s mail -d serigame.com

# Key dosyalarını taşı
if [ -f mail.private ] && [ -f mail.txt ]; then
    sudo mv mail.private /etc/opendkim/keys/serigame.com.private
    sudo mv mail.txt /etc/opendkim/keys/serigame.com.txt
    sudo chown opendkim:opendkim /etc/opendkim/keys/serigame.com.private
    sudo chmod 600 /etc/opendkim/keys/serigame.com.private
    
    echo ""
    echo "✅ DKIM key başarıyla oluşturuldu!"
    echo ""
    echo "📋 Cloudflare'e eklenecek DKIM TXT Kaydı:"
    echo "=========================================="
    echo ""
    echo "Type: TXT"
    echo "Name: mail._domainkey"
    echo "Content: (Aşağıdaki satırdaki tırnak işaretleri OLMADAN kopyalayın)"
    echo ""
    
    # TXT kaydını göster
    cat /etc/opendkim/keys/serigame.com.txt | grep -oP '(?<=").*(?=")' | tr -d '"'
    
    echo ""
    echo "=========================================="
    echo ""
    echo "📁 Key Dosyaları:"
    echo "  Private Key: /etc/opendkim/keys/serigame.com.private"
    echo "  Public Key: /etc/opendkim/keys/serigame.com.txt"
    echo ""
    echo "⚠️  ÖNEMLİ: Private key'i güvende tutun!"
    echo ""
else
    echo "❌ Hata: Key dosyaları oluşturulamadı!"
    exit 1
fi

