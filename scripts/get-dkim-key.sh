#!/bin/bash

# DKIM Key'i Görüntüleme Scripti

echo "🔐 DKIM Key Görüntüleniyor..."
echo "=============================="

if [ -f /etc/opendkim/keys/serigame.com.txt ]; then
    echo ""
    echo "✅ DKIM Key Bulundu!"
    echo ""
    echo "📋 Cloudflare'e Eklenecek TXT Kaydı:"
    echo "======================================"
    echo ""
    echo "Type: TXT"
    echo "Name: mail._domainkey"
    echo "Content: (Aşağıdaki satırı kopyalayın - tırnak işaretleri OLMADAN)"
    echo ""
    
    # TXT kaydını göster (tırnak işaretleri olmadan)
    cat /etc/opendkim/keys/serigame.com.txt | grep -oP '(?<=").*(?=")' | tr -d '"'
    
    echo ""
    echo "======================================"
    echo ""
    echo "⚠️  Proxy status: KAPALI (DNS only - Gri Cloud)"
else
    echo "❌ DKIM key bulunamadı!"
    echo ""
    echo "🔧 Key oluşturmak için:"
    echo "sudo apt install -y opendkim opendkim-tools"
    echo "sudo mkdir -p /etc/opendkim/keys"
    echo "sudo opendkim-genkey -t -s mail -d serigame.com"
    echo "sudo mv mail.private /etc/opendkim/keys/serigame.com.private"
    echo "sudo mv mail.txt /etc/opendkim/keys/serigame.com.txt"
    echo "sudo chown opendkim:opendkim /etc/opendkim/keys/serigame.com.private"
    echo "sudo chmod 600 /etc/opendkim/keys/serigame.com.private"
    echo "cat /etc/opendkim/keys/serigame.com.txt"
fi

