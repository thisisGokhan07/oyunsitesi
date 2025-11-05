#!/bin/bash

# Email Sunucu Kurulum Scripti
# serigame.com için info@serigame.com ve global@serigame.com hesapları

set -e

echo "📧 Email Sunucu Kurulumu Başlıyor..."
echo "=================================="

# Renk kodları
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Şifre tanımlama
EMAIL_PASSWORD="Serinhisar20*"

# 1. Sistem Güncellemesi
echo -e "${YELLOW}[1/12] Sistem güncelleniyor...${NC}"
sudo apt update
sudo apt upgrade -y

# 2. Postfix Kurulumu
echo -e "${YELLOW}[2/12] Postfix kuruluyor...${NC}"
export DEBIAN_FRONTEND=noninteractive
sudo debconf-set-selections <<< "postfix postfix/mailname string serigame.com"
sudo debconf-set-selections <<< "postfix postfix/main_mailer_type string 'Internet Site'"
sudo apt install -y postfix

# 3. Postfix Yapılandırması
echo -e "${YELLOW}[3/12] Postfix yapılandırılıyor...${NC}"
sudo tee /etc/postfix/main.cf > /dev/null <<EOF
# Postfix Main Configuration
myhostname = serigame.com
mydomain = serigame.com
myorigin = \$mydomain
inet_interfaces = all
inet_protocols = ipv4
mydestination = \$myhostname, localhost.\$mydomain, \$mydomain, localhost
mynetworks = 127.0.0.0/8 [::ffff:127.0.0.0]/104 [::1]/128
home_mailbox = Maildir/
mailbox_command = 
virtual_alias_maps = hash:/etc/postfix/virtual
EOF

# 4. Virtual Alias Dosyası
echo -e "${YELLOW}[4/12] Virtual alias dosyası oluşturuluyor...${NC}"
sudo tee /etc/postfix/virtual > /dev/null <<EOF
info@serigame.com    info
global@serigame.com  global
EOF

sudo postmap /etc/postfix/virtual

# 5. Dovecot Kurulumu
echo -e "${YELLOW}[5/12] Dovecot kuruluyor...${NC}"
sudo apt install -y dovecot-core dovecot-imapd dovecot-pop3d

# 6. Dovecot Yapılandırması
echo -e "${YELLOW}[6/12] Dovecot yapılandırılıyor...${NC}"

# dovecot.conf
sudo sed -i 's/#protocols = imap pop3 lmtp/protocols = imap pop3 lmtp/' /etc/dovecot/dovecot.conf
sudo sed -i 's/#listen = \*, ::/listen = *, ::/' /etc/dovecot/dovecot.conf

# 10-mail.conf
sudo sed -i 's/^mail_location = .*/mail_location = maildir:~\/Maildir/' /etc/dovecot/conf.d/10-mail.conf

# 10-auth.conf
sudo sed -i 's/^#disable_plaintext_auth = yes/disable_plaintext_auth = no/' /etc/dovecot/conf.d/10-auth.conf
sudo sed -i 's/^#auth_mechanisms = plain/auth_mechanisms = plain login/' /etc/dovecot/conf.d/10-auth.conf

# 7. Email Kullanıcıları Oluşturma
echo -e "${YELLOW}[7/12] Email kullanıcıları oluşturuluyor...${NC}"

# info kullanıcısı
if id "info" &>/dev/null; then
    echo "info kullanıcısı zaten mevcut"
else
    sudo useradd -m -s /bin/bash info
    echo "info:${EMAIL_PASSWORD}" | sudo chpasswd
    echo -e "${GREEN}✓ info kullanıcısı oluşturuldu${NC}"
fi

# global kullanıcısı
if id "global" &>/dev/null; then
    echo "global kullanıcısı zaten mevcut"
else
    sudo useradd -m -s /bin/bash global
    echo "global:${EMAIL_PASSWORD}" | sudo chpasswd
    echo -e "${GREEN}✓ global kullanıcısı oluşturuldu${NC}"
fi

# 8. Mail Klasörlerini Oluşturma
echo -e "${YELLOW}[8/12] Mail klasörleri oluşturuluyor...${NC}"
sudo mkdir -p /home/info/Maildir/{new,cur,tmp}
sudo mkdir -p /home/global/Maildir/{new,cur,tmp}
sudo chown -R info:info /home/info/Maildir
sudo chown -R global:global /home/global/Maildir
sudo chmod -R 700 /home/info/Maildir
sudo chmod -R 700 /home/global/Maildir
echo -e "${GREEN}✓ Mail klasörleri oluşturuldu${NC}"

# 9. Firewall Ayarları
echo -e "${YELLOW}[9/12] Firewall portları açılıyor...${NC}"
sudo ufw allow 25/tcp comment 'SMTP'
sudo ufw allow 587/tcp comment 'SMTP Submission'
sudo ufw allow 465/tcp comment 'SMTP SSL'
sudo ufw allow 110/tcp comment 'POP3'
sudo ufw allow 995/tcp comment 'POP3 SSL'
sudo ufw allow 143/tcp comment 'IMAP'
sudo ufw allow 993/tcp comment 'IMAP SSL'
echo -e "${GREEN}✓ Firewall portları açıldı${NC}"

# 10. Servisleri Başlatma
echo -e "${YELLOW}[10/12] Servisler başlatılıyor...${NC}"
sudo systemctl restart postfix
sudo systemctl restart dovecot
sudo systemctl enable postfix
sudo systemctl enable dovecot

# 11. Servis Durumunu Kontrol
echo -e "${YELLOW}[11/12] Servis durumları kontrol ediliyor...${NC}"
if sudo systemctl is-active --quiet postfix; then
    echo -e "${GREEN}✓ Postfix çalışıyor${NC}"
else
    echo -e "${RED}✗ Postfix çalışmıyor!${NC}"
    sudo systemctl status postfix
fi

if sudo systemctl is-active --quiet dovecot; then
    echo -e "${GREEN}✓ Dovecot çalışıyor${NC}"
else
    echo -e "${RED}✗ Dovecot çalışmıyor!${NC}"
    sudo systemctl status dovecot
fi

# 12. DKIM Kurulumu (Opsiyonel)
echo -e "${YELLOW}[12/12] DKIM kurulumu başlatılıyor...${NC}"
sudo apt install -y opendkim opendkim-tools

# DKIM dizinini oluştur
sudo mkdir -p /etc/opendkim/keys

# DKIM key oluştur
if [ ! -f /etc/opendkim/keys/serigame.com.private ]; then
    sudo opendkim-genkey -t -s mail -d serigame.com
    sudo mv mail.private /etc/opendkim/keys/serigame.com.private
    sudo mv mail.txt /etc/opendkim/keys/serigame.com.txt
    sudo chown opendkim:opendkim /etc/opendkim/keys/serigame.com.private
    sudo chmod 600 /etc/opendkim/keys/serigame.com.private
    echo -e "${GREEN}✓ DKIM key oluşturuldu${NC}"
    
    echo ""
    echo -e "${YELLOW}📋 DKIM Public Key (Cloudflare'e eklenecek):${NC}"
    echo "=================================="
    cat /etc/opendkim/keys/serigame.com.txt
    echo "=================================="
    echo ""
fi

# Özet
echo ""
echo -e "${GREEN}=================================="
echo "✅ Email Sunucu Kurulumu Tamamlandı!"
echo "==================================${NC}"
echo ""
echo "📧 Email Hesapları:"
echo "  - info@serigame.com (Şifre: ${EMAIL_PASSWORD})"
echo "  - global@serigame.com (Şifre: ${EMAIL_PASSWORD})"
echo ""
echo "📡 Mail Sunucu: mail.serigame.com"
echo "📥 IMAP Port: 143 (STARTTLS) veya 993 (SSL)"
echo "📤 SMTP Port: 587 (STARTTLS) veya 465 (SSL)"
echo ""
echo "🌐 Cloudflare DNS Kayıtları:"
echo "  - MX: mail.serigame.com (Priority: 10) - Proxied KAPALI"
echo "  - A: mail → 72.61.97.76 - Proxied KAPALI"
echo "  - TXT (SPF): v=spf1 mx a ip4:72.61.97.76 ~all - Proxied KAPALI"
echo "  - TXT (DMARC): _dmarc → v=DMARC1; p=quarantine; rua=mailto:info@serigame.com - Proxied KAPALI"
echo "  - TXT (DKIM): mail._domainkey → (Yukarıdaki key'i kullanın) - Proxied KAPALI"
echo ""
echo "⚠️  ÖNEMLİ: Email DNS kayıtları Cloudflare'de Proxied KAPALI olmalı!"
echo ""
echo "📋 Detaylı bilgi için: EMAIL_KURULUM_REHBERI.md dosyasına bakın"
echo ""

