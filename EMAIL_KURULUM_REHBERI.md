# 📧 Email Kurulum Rehberi - serigame.com

## 📋 Email Hesapları
- **info@serigame.com** - Şifre: Serinhisar20*
- **global@serigame.com** - Şifre: Serinhisar20*

---

## 🖥️ Sunucu Kurulumu (SSH ile)

### 1. SSH Bağlantısı
```bash
ssh golgo360@[SUNUCU_IP]
# Şifre: Serinhisar20*
```

### 2. Sistem Güncellemesi
```bash
sudo apt update
sudo apt upgrade -y
```

### 3. Postfix Kurulumu (SMTP Sunucu)
```bash
sudo apt install postfix -y
```

**Postfix kurulum sırasında sorulan sorular:**
- **General type of mail configuration:** `Internet Site` seçin
- **System mail name:** `serigame.com` yazın

### 4. Postfix Yapılandırması
```bash
sudo nano /etc/postfix/main.cf
```

**Aşağıdaki ayarları ekleyin/düzenleyin:**
```
myhostname = serigame.com
mydomain = serigame.com
myorigin = $mydomain
inet_interfaces = all
inet_protocols = ipv4
mydestination = $myhostname, localhost.$mydomain, $mydomain, localhost
mynetworks = 127.0.0.0/8 [::ffff:127.0.0.0]/104 [::1]/128
home_mailbox = Maildir/
mailbox_command = 
```

**Dosyayı kaydedin (Ctrl+O, Enter, Ctrl+X)**

### 5. Dovecot Kurulumu (IMAP/POP3 Sunucu)
```bash
sudo apt install dovecot-core dovecot-imapd dovecot-pop3d -y
```

### 6. Dovecot Yapılandırması
```bash
sudo nano /etc/dovecot/dovecot.conf
```

**Aşağıdaki satırların başındaki `#` işaretini kaldırın:**
```
protocols = imap pop3 lmtp
listen = *, ::
```

```bash
sudo nano /etc/dovecot/conf.d/10-mail.conf
```

**Aşağıdaki satırı bulun ve değiştirin:**
```
mail_location = maildir:~/Maildir
```

```bash
sudo nano /etc/dovecot/conf.d/10-auth.conf
```

**Aşağıdaki satırları kontrol edin:**
```
disable_plaintext_auth = no
auth_mechanisms = plain login
```

### 7. Email Kullanıcıları Oluşturma
```bash
# info@serigame.com için kullanıcı oluştur
sudo adduser info
# Şifre: Serinhisar20*
# Diğer bilgileri Enter ile geçebilirsiniz

# global@serigame.com için kullanıcı oluştur
sudo adduser global
# Şifre: Serinhisar20*
# Diğer bilgileri Enter ile geçebilirsiniz
```

### 8. Mail Klasörlerini Oluşturma
```bash
sudo mkdir -p /home/info/Maildir/{new,cur,tmp}
sudo mkdir -p /home/global/Maildir/{new,cur,tmp}
sudo chown -R info:info /home/info/Maildir
sudo chown -R global:global /home/global/Maildir
sudo chmod -R 700 /home/info/Maildir
sudo chmod -R 700 /home/global/Maildir
```

### 9. Postfix Virtual Alias Yapılandırması
```bash
sudo nano /etc/postfix/virtual
```

**Aşağıdaki satırları ekleyin:**
```
info@serigame.com    info
global@serigame.com  global
```

**Postfix'e virtual dosyasını söyle:**
```bash
sudo nano /etc/postfix/main.cf
```

**Aşağıdaki satırı ekleyin:**
```
virtual_alias_maps = hash:/etc/postfix/virtual
```

**Virtual dosyasını derle:**
```bash
sudo postmap /etc/postfix/virtual
```

### 10. Firewall Ayarları (Port Açma)
```bash
sudo ufw allow 25/tcp   # SMTP
sudo ufw allow 587/tcp  # SMTP Submission
sudo ufw allow 465/tcp  # SMTP SSL
sudo ufw allow 110/tcp  # POP3
sudo ufw allow 995/tcp  # POP3 SSL
sudo ufw allow 143/tcp  # IMAP
sudo ufw allow 993/tcp  # IMAP SSL
```

### 11. Servisleri Başlatma
```bash
sudo systemctl restart postfix
sudo systemctl restart dovecot
sudo systemctl enable postfix
sudo systemctl enable dovecot
```

### 12. Servis Durumunu Kontrol
```bash
sudo systemctl status postfix
sudo systemctl status dovecot
```

---

## 🌐 Cloudflare DNS Kayıtları

**Cloudflare Dashboard:** https://dash.cloudflare.com  
→ Domain: **serigame.com**  
→ **DNS** > **Records** > **Add record**

### **1. MX Record (Mail Exchange)**
```
Type: MX
Name: @
Mail server: mail.serigame.com
Priority: 10
Proxy status: ❌ DNS only (Proxied KAPALI - Gri Cloud)
TTL: Auto
```

**EKLE** butonuna tıklayın

### **2. A Record (Mail Sunucu)**
```
Type: A
Name: mail
IPv4 address: 72.61.97.76
Proxy status: ❌ DNS only (Proxied KAPALI - Gri Cloud)
TTL: Auto
```

**EKLE** butonuna tıklayın

### **3. TXT Record (SPF - Sender Policy Framework)**
```
Type: TXT
Name: @
Content: v=spf1 mx a ip4:72.61.97.76 ~all
Proxy status: ❌ DNS only (Proxied KAPALI)
TTL: Auto
```

**EKLE** butonuna tıklayın

### **4. TXT Record (DMARC - Domain-based Message Authentication)**
```
Type: TXT
Name: _dmarc
Content: v=DMARC1; p=quarantine; rua=mailto:info@serigame.com
Proxy status: ❌ DNS only (Proxied KAPALI)
TTL: Auto
```

**EKLE** butonuna tıklayın

### **5. CNAME Record (DKIM - DomainKeys Identified Mail)**
**ÖNEMLİ:** DKIM için önce sunucuda key oluşturulmalı. Aşağıdaki adımları izleyin:

**Sunucuda DKIM Key Oluşturma:**
```bash
sudo apt install opendkim opendkim-tools -y
sudo opendkim-genkey -t -s mail -d serigame.com
sudo mv mail.private /etc/opendkim/keys/serigame.com.private
sudo mv mail.txt /etc/opendkim/keys/serigame.com.txt
sudo chown opendkim:opendkim /etc/opendkim/keys/serigame.com.private
sudo chmod 600 /etc/opendkim/keys/serigame.com.private
```

**DKIM Public Key'i görmek için:**
```bash
cat /etc/opendkim/keys/serigame.com.txt
```

**Çıktı şuna benzer olacak:**
```
mail._domainkey IN TXT ( "v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC..." )
```

**Cloudflare'de TXT Record olarak ekleyin:**
```
Type: TXT
Name: mail._domainkey
Content: v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC... (tam key'i buraya yapıştırın)
Proxy status: ❌ DNS only (Proxied KAPALI)
TTL: Auto
```

**EKLE** butonuna tıklayın

---

## ✅ DNS Kayıtları Özeti

Cloudflare'de eklenmesi gereken kayıtlar:

| Type | Name | Value | Priority | Proxy |
|------|------|-------|----------|-------|
| **MX** | @ | mail.serigame.com | 10 | ❌ Kapalı |
| **A** | mail | 72.61.97.76 | - | ❌ Kapalı |
| **TXT** | @ | v=spf1 mx a ip4:72.61.97.76 ~all | - | ❌ Kapalı |
| **TXT** | _dmarc | v=DMARC1; p=quarantine; rua=mailto:info@serigame.com | - | ❌ Kapalı |
| **TXT** | mail._domainkey | (DKIM key'i - sunucudan alınacak) | - | ❌ Kapalı |

**⚠️ ÖNEMLİ:** Email kayıtları için **Proxied KAPALI** olmalı (Gri Cloud)!

---

## 🔍 Test İşlemleri

### 1. DNS Kontrolü
```bash
# MX kaydı kontrolü
nslookup -type=MX serigame.com

# SPF kaydı kontrolü
nslookup -type=TXT serigame.com

# DMARC kaydı kontrolü
nslookup -type=TXT _dmarc.serigame.com
```

### 2. Email Gönderme Testi
```bash
# Sunucuda test email gönder
echo "Test mesajı" | mail -s "Test Email" info@serigame.com

# Mail loglarını kontrol et
sudo tail -f /var/log/mail.log
```

### 3. Port Kontrolü
```bash
# SMTP port kontrolü
sudo netstat -tlnp | grep :25
sudo netstat -tlnp | grep :587

# IMAP port kontrolü
sudo netstat -tlnp | grep :143
sudo netstat -tlnp | grep :993
```

---

## 📧 Email İstemci Ayarları

### **Gelen Mail (IMAP)**
```
Sunucu: mail.serigame.com
Port: 143 (IMAP) veya 993 (IMAPS)
Kullanıcı: info@serigame.com veya global@serigame.com
Şifre: Serinhisar20*
Şifreleme: STARTTLS veya SSL/TLS
```

### **Giden Mail (SMTP)**
```
Sunucu: mail.serigame.com
Port: 587 (SMTP Submission) veya 465 (SMTPS)
Kullanıcı: info@serigame.com veya global@serigame.com
Şifre: Serinhisar20*
Şifreleme: STARTTLS veya SSL/TLS
Kimlik Doğrulama: Gerekli (AUTH)
```

---

## ⚠️ Önemli Notlar

1. **DNS Propagation:** DNS kayıtları 5-10 dakika içinde yayılır
2. **Port Açma:** Sunucu firewall'unda portlar açık olmalı
3. **Proxied:** Email kayıtları Cloudflare'de **Proxied KAPALI** olmalı
4. **SPF/DKIM/DMARC:** Email deliverability için önemli
5. **Reverse DNS:** Sunucu sağlayıcınızdan reverse DNS (PTR) kaydı isteyin

---

## 🐛 Sorun Giderme

### Email Gönderilemiyor
```bash
# Postfix loglarını kontrol et
sudo tail -f /var/log/mail.log

# Postfix durumunu kontrol et
sudo systemctl status postfix
```

### Email Alınamıyor
```bash
# Dovecot loglarını kontrol et
sudo tail -f /var/log/mail.log

# Dovecot durumunu kontrol et
sudo systemctl status dovecot
```

### Port Kontrolü
```bash
# Portlar açık mı?
sudo ufw status
sudo netstat -tlnp | grep -E ':25|:587|:143|:993'
```

---

**Kurulum tamamlandıktan sonra email hesapları kullanıma hazır olacaktır!** 📧✨

