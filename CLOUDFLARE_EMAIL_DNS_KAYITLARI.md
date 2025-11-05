# 🌐 Cloudflare Email DNS Kayıtları - serigame.com

## 📋 Cloudflare Dashboard'a Eklenecek DNS Kayıtları

**Cloudflare Dashboard:** https://dash.cloudflare.com  
→ Domain: **serigame.com**  
→ **DNS** > **Records** > **Add record**

**⚠️ ÖNEMLİ:** Tüm email DNS kayıtları için **Proxied KAPALI** (Gri Cloud) olmalı!

---

## 📧 Email DNS Kayıtları

### **1. MX Record (Mail Exchange) - ZORUNLU**
```
Type: MX
Name: @
Mail server: mail.serigame.com
Priority: 10
Proxy status: ❌ DNS only (Proxied KAPALI - Gri Cloud)
TTL: Auto
```
→ **Save** butonuna tıklayın

**Açıklama:** Gelen emaillerin hangi sunucuya yönlendirileceğini belirler.

---

### **2. A Record (Mail Sunucu) - ZORUNLU**
```
Type: A
Name: mail
IPv4 address: 72.61.97.76
Proxy status: ❌ DNS only (Proxied KAPALI - Gri Cloud)
TTL: Auto
```
→ **Save** butonuna tıklayın

**Açıklama:** mail.serigame.com adresinin IP karşılığı.

---

### **3. TXT Record (SPF - Sender Policy Framework) - ZORUNLU**
```
Type: TXT
Name: @
Content: v=spf1 mx a ip4:72.61.97.76 ~all
Proxy status: ❌ DNS only (Proxied KAPALI)
TTL: Auto
```
→ **Save** butonuna tıklayın

**Açıklama:** Email sahteciliğini önlemek için hangi sunucuların email gönderebileceğini belirtir.

---

### **4. TXT Record (DMARC - Domain-based Message Authentication) - ÖNERİLİR**
```
Type: TXT
Name: _dmarc
Content: v=DMARC1; p=quarantine; rua=mailto:info@serigame.com
Proxy status: ❌ DNS only (Proxied KAPALI)
TTL: Auto
```
→ **Save** butonuna tıklayın

**Açıklama:** Email doğrulama politikası. `p=quarantine` şüpheli emailleri spam klasörüne gönderir.

**Alternatif DMARC Politikaları:**
- `p=none` - Sadece raporlama (test için)
- `p=quarantine` - Şüpheli emailleri spam'e gönder (önerilen)
- `p=reject` - Şüpheli emailleri reddet (en güvenli)

---

### **5. TXT Record (DKIM - DomainKeys Identified Mail) - ÖNERİLİR**

**ÖNEMLİ:** Bu kayıt, sunucuda DKIM key oluşturulduktan sonra eklenecek!

**Sunucuda DKIM Key Oluşturma:**
```bash
# SSH ile sunucuya bağlanın ve şu komutları çalıştırın:
sudo apt install opendkim opendkim-tools -y
sudo mkdir -p /etc/opendkim/keys
sudo opendkim-genkey -t -s mail -d serigame.com
sudo mv mail.private /etc/opendkim/keys/serigame.com.private
sudo mv mail.txt /etc/opendkim/keys/serigame.com.txt
sudo chown opendkim:opendkim /etc/opendkim/keys/serigame.com.private
sudo chmod 600 /etc/opendkim/keys/serigame.com.private

# Public key'i görmek için:
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
Content: v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC... (tam key'i buraya yapıştırın, tırnak işaretleri OLMADAN)
Proxy status: ❌ DNS only (Proxied KAPALI)
TTL: Auto
```
→ **Save** butonuna tıklayın

**Açıklama:** Email gönderenin kimliğini doğrulamak için kullanılır.

---

## 📊 DNS Kayıtları Özet Tablosu

| # | Type | Name | Value/Content | Priority | Proxy | Zorunlu |
|---|------|------|---------------|----------|-------|---------|
| 1 | **MX** | @ | mail.serigame.com | 10 | ❌ Kapalı | ✅ Evet |
| 2 | **A** | mail | 72.61.97.76 | - | ❌ Kapalı | ✅ Evet |
| 3 | **TXT** | @ | v=spf1 mx a ip4:72.61.97.76 ~all | - | ❌ Kapalı | ✅ Evet |
| 4 | **TXT** | _dmarc | v=DMARC1; p=quarantine; rua=mailto:info@serigame.com | - | ❌ Kapalı | ⚠️ Önerilir |
| 5 | **TXT** | mail._domainkey | (DKIM key - sunucudan alınacak) | - | ❌ Kapalı | ⚠️ Önerilir |

---

## ✅ Ekleme Sırası

1. ✅ **A Record (mail)** - Önce mail sunucusunu tanımlayın
2. ✅ **MX Record** - Sonra MX kaydını ekleyin
3. ✅ **TXT Record (SPF)** - Email gönderme yetkisi
4. ✅ **TXT Record (DMARC)** - Email doğrulama politikası
5. ✅ **TXT Record (DKIM)** - Sunucuda key oluşturduktan sonra

---

## 🔍 DNS Kayıtlarını Test Etme

### **1. MX Kaydı Kontrolü**
```bash
nslookup -type=MX serigame.com
# veya
dig MX serigame.com
```

**Beklenen Çıktı:**
```
serigame.com mail exchanger = 10 mail.serigame.com.
```

### **2. A Kaydı Kontrolü (mail.serigame.com)**
```bash
nslookup mail.serigame.com
# veya
dig mail.serigame.com
```

**Beklenen Çıktı:**
```
mail.serigame.com    A    72.61.97.76
```

### **3. SPF Kaydı Kontrolü**
```bash
nslookup -type=TXT serigame.com
# veya
dig TXT serigame.com
```

**Beklenen Çıktı:**
```
serigame.com text = "v=spf1 mx a ip4:72.61.97.76 ~all"
```

### **4. DMARC Kaydı Kontrolü**
```bash
nslookup -type=TXT _dmarc.serigame.com
# veya
dig TXT _dmarc.serigame.com
```

**Beklenen Çıktı:**
```
_dmarc.serigame.com text = "v=DMARC1; p=quarantine; rua=mailto:info@serigame.com"
```

### **5. DKIM Kaydı Kontrolü**
```bash
nslookup -type=TXT mail._domainkey.serigame.com
# veya
dig TXT mail._domainkey.serigame.com
```

**Beklenen Çıktı:**
```
mail._domainkey.serigame.com text = "v=DKIM1; k=rsa; p=..."
```

---

## 🌐 Online DNS Test Araçları

DNS kayıtlarını test etmek için:
- **MXToolbox:** https://mxtoolbox.com/SuperTool.aspx
- **MXToolbox Email Test:** https://mxtoolbox.com/emailhealth/
- **Mail-Tester:** https://www.mail-tester.com/ (Email göndererek test edin)

---

## ⏱️ DNS Propagation Süresi

- **Normal:** 5-10 dakika
- **Bazen:** 1-2 saat (nadiren)
- **Maksimum:** 48 saat (çok nadir)

**Test:** DNS kayıtlarını ekledikten 10 dakika sonra yukarıdaki test komutlarını çalıştırın.

---

## ⚠️ Önemli Notlar

1. **Proxied KAPALI:** Email DNS kayıtları için Cloudflare proxy **KESİNLİKLE kapalı** olmalı (Gri Cloud)
2. **SPF:** `~all` yerine `-all` kullanırsanız daha güvenli olur ama test için `~all` önerilir
3. **DMARC:** Başlangıçta `p=none` kullanıp test edebilir, sonra `p=quarantine` yapabilirsiniz
4. **DKIM:** Key oluşturulduktan sonra değiştirilmemeli
5. **Reverse DNS (PTR):** Sunucu sağlayıcınızdan mail.serigame.com için reverse DNS kaydı isteyin

---

## 📧 Email Hesapları

- **info@serigame.com** - Şifre: Serinhisar20*
- **global@serigame.com** - Şifre: Serinhisar20*

---

**Tüm DNS kayıtları eklendikten sonra email sistemi çalışmaya hazır olacaktır!** 📧✨

