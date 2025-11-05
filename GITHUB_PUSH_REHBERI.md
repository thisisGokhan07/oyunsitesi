# 🔐 GitHub Push Rehberi

## ⚠️ Sorun

GitHub artık **password authentication** kabul etmiyor. **Personal Access Token** gerekiyor.

## ✅ Çözüm: Personal Access Token Oluşturma

### **1. GitHub'da Token Oluştur:**

1. GitHub'a giriş yap: https://github.com
2. Sağ üst köşe → **Settings**
3. Sol menüden **Developer settings**
4. **Personal access tokens** → **Tokens (classic)**
5. **Generate new token** → **Generate new token (classic)**
6. **Note:** `serigame-deployment` (veya istediğin isim)
7. **Expiration:** 90 days (veya istediğin süre)
8. **Scopes:** ✅ `repo` (tüm repository işlemleri için)
9. **Generate token** butonuna tıkla
10. **Token'ı kopyala** (bir daha gösterilmeyecek!)

### **2. Token ile Push:**

```bash
# Remote URL'i token ile güncelle
git remote set-url origin https://thisisGokhan07:[TOKEN]@github.com/thisisGokhan07/oyunsitesi.git

# Push yap
git push origin main
```

**Örnek:**
```bash
git remote set-url origin https://thisisGokhan07:ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@github.com/thisisGokhan07/oyunsitesi.git
git push origin main
```

### **3. Alternatif: SSH Key (Önerilir)**

#### **SSH Key Oluştur:**
```bash
ssh-keygen -t ed25519 -C "gokhan@outlook.it"
# Enter'a bas (default location)
# Şifre opsiyonel (boş bırakabilirsin)
```

#### **Public Key'i GitHub'a Ekle:**
1. Public key'i kopyala:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```
2. GitHub → **Settings** → **SSH and GPG keys**
3. **New SSH key**
4. **Title:** `Serigame Development` (veya istediğin isim)
5. **Key:** Public key'i yapıştır
6. **Add SSH key**

#### **Remote URL'i SSH ile Güncelle:**
```bash
git remote set-url origin git@github.com:thisisGokhan07/oyunsitesi.git
git push origin main
```

---

## 📋 Şu Anki Durum

**Local:**
- ✅ 7 yeni commit var
- ✅ Tüm dosyalar güncel
- ✅ `next.config.js` düzeltilmiş

**GitHub:**
- ❌ Sadece ilk commit var
- ❌ Eski `next.config.js` (output: 'export' var)

**Sunucu:**
- ✅ Local'den manuel kopyalandı
- ✅ `next.config.js` güncel
- ✅ UI components mevcut
- ✅ Build başarılı

---

## 🔄 Sonraki Adımlar

1. **Personal Access Token oluştur** (yukarıdaki adımlar)
2. **Token ile push yap:**
   ```bash
   git remote set-url origin https://thisisGokhan07:[TOKEN]@github.com/thisisGokhan07/oyunsitesi.git
   git push origin main
   ```
3. **Sunucuya çek:**
   ```bash
   ssh golog360 "cd /var/www/serigame.com && git pull origin main"
   ```

---

## 💡 Güvenlik Notu

- **Token'ı asla commit etme!**
- Token'ı `.gitignore`'a ekle
- Token'ı environment variable olarak kullan
- Token'ı sadece güvenli yerlerde sakla

---

**Not:** Şu anda sunucu manuel olarak güncellendi ve çalışıyor. GitHub'a push edildikten sonra normal git workflow kullanılabilir.

