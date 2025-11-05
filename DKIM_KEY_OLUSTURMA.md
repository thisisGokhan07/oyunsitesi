# 🔐 DKIM Key Oluşturma - serigame.com

## 🚀 Hızlı Yöntem (Script ile)

Sunucuya SSH ile bağlanın ve şu komutları çalıştırın:

```bash
ssh golgo360@72.61.97.76
# Şifre: Serinhisar20*

# Script'i çalıştır
cd /var/www/serigame.com  # veya script'in olduğu dizin
chmod +x scripts/generate-dkim-key.sh
sudo bash scripts/generate-dkim-key.sh
```

Script otomatik olarak DKIM key'ini oluşturup Cloudflare'e eklemeniz gereken TXT kaydını gösterecektir.

---

## 📝 Manuel Yöntem

### 1. OpenDKIM Kurulumu
```bash
sudo apt update
sudo apt install -y opendkim opendkim-tools
```

### 2. DKIM Dizinini Oluştur
```bash
sudo mkdir -p /etc/opendkim/keys
sudo chown opendkim:opendkim /etc/opendkim/keys
```

### 3. DKIM Key Oluştur
```bash
sudo opendkim-genkey -t -s mail -d serigame.com
```

### 4. Key Dosyalarını Taşı
```bash
sudo mv mail.private /etc/opendkim/keys/serigame.com.private
sudo mv mail.txt /etc/opendkim/keys/serigame.com.txt
sudo chown opendkim:opendkim /etc/opendkim/keys/serigame.com.private
sudo chmod 600 /etc/opendkim/keys/serigame.com.private
```

### 5. DKIM Public Key'i Görüntüle
```bash
cat /etc/opendkim/keys/serigame.com.txt
```

**Çıktı şuna benzer olacak:**
```
mail._domainkey IN TXT ( "v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC..." )
```

**VEYA sadece key değerini almak için:**
```bash
cat /etc/opendkim/keys/serigame.com.txt | grep -oP '(?<=").*(?=")' | tr -d '"'
```

---

## 🌐 Cloudflare'e Eklenecek DKIM TXT Kaydı

**Cloudflare Dashboard:** https://dash.cloudflare.com  
→ Domain: **serigame.com**  
→ **DNS** > **Records** > **Add record**

```
Type: TXT
Name: mail._domainkey
Content: v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC... (yukarıdaki komuttan aldığınız tam key'i buraya yapıştırın)
Proxy status: ❌ DNS only (Proxied KAPALI - Gri Cloud)
TTL: Auto
```

**⚠️ ÖNEMLİ:**
- Tırnak işaretleri (`"`) OLMADAN sadece key değerini yapıştırın
- Proxy status KESİNLİKLE KAPALI olmalı (Gri Cloud)

---

## ✅ DKIM Kaydını Test Etme

DNS kaydını ekledikten 5-10 dakika sonra test edin:

```bash
nslookup -type=TXT mail._domainkey.serigame.com
```

**VEYA:**

```bash
dig TXT mail._domainkey.serigame.com
```

**Beklenen Çıktı:**
```
mail._domainkey.serigame.com text = "v=DKIM1; k=rsa; p=..."
```

---

## 📧 Email Göndererek Test

DKIM'in çalışıp çalışmadığını test etmek için:

1. **Mail-Tester:** https://www.mail-tester.com/
   - Siteye gidin, size verilen email adresine bir email gönderin
   - Sonuçları kontrol edin, DKIM için puan almalısınız

2. **Gmail'den Gönder:**
   - info@serigame.com hesabından kendi email adresinize gönderin
   - Gmail'de "Show original" (Orijinali göster) ile header'ları kontrol edin
   - "DKIM: pass" yazıyorsa başarılı!

---

## 🔍 DKIM Key Formatı

Normal bir DKIM key şu şekildedir:

```
v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC[çok uzun base64 string]...
```

**Açıklama:**
- `v=DKIM1` - DKIM versiyonu
- `k=rsa` - Key tipi (RSA)
- `p=...` - Public key (base64 encoded)

---

## ⚠️ Önemli Notlar

1. **Key Güvenliği:** Private key (`serigame.com.private`) kesinlikle güvende tutulmalı
2. **Key Değişikliği:** Key değiştirilirse, tüm email gönderenlerin yeniden yapılandırılması gerekir
3. **DNS Propagation:** DKIM kaydı eklendikten sonra 5-10 dakika bekleyin
4. **Proxy:** Cloudflare'de Proxied KAPALI olmalı (Gri Cloud)

---

**DKIM key oluşturulduktan sonra Cloudflare'e ekleyin ve email sisteminiz hazır!** 🔐✨

