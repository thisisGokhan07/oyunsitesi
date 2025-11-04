# 🔐 Admin Giriş Sorunu - Çözüm

**Sorun:** "Invalid login credentials" hatası alıyorsunuz.

**Sebep:** Email doğru ama şifre yanlış veya değiştirilmiş.

---

## ✅ ÇÖZÜM 1: Şifreyi Sıfırla (ÖNERİLEN)

### Adımlar:
1. **Supabase Dashboard** > **Authentication** > **Users**
2. `admin@serigame.com` kullanıcısını bulun
3. Kullanıcıya tıklayın (detayları açılır)
4. **Reset Password** butonuna tıklayın
5. Yeni şifreyi belirleyin: `Admin123!@#`
6. **Update User** butonuna tıklayın

**VEYA** kullanıcıyı düzenleyin:
- **Password** alanına yeni şifreyi girin: `Admin123!@#`
- **Auto Confirm User** seçeneğini işaretleyin (eğer yoksa)
- **Save** butonuna tıklayın

---

## ✅ ÇÖZÜM 2: Yeni Admin Kullanıcısı Oluştur

Eğer mevcut kullanıcıyla sorun yaşıyorsanız, yeni bir admin oluşturun:

### Adımlar:
1. **Supabase Dashboard** > **Authentication** > **Users**
2. **Add User** butonuna tıklayın
3. **Bilgileri girin:**
   - Email: `admin@serigame.com` (veya farklı bir email)
   - Password: `Admin123!@#`
   - **Auto Confirm User:** ✅ İşaretleyin
4. **Add User** butonuna tıklayın
5. **User ID'yi kopyalayın**

### Sonra SQL Editor'de çalıştırın:

```sql
-- Yeni kullanıcıya super_admin rolü ver
UPDATE user_profiles
SET role = 'super_admin'
WHERE id = 'YENİ_KULLANICI_ID_BURAYA';

-- VEYA profile yoksa oluştur
INSERT INTO user_profiles (id, display_name, role)
VALUES ('YENİ_KULLANICI_ID_BURAYA', 'Admin', 'super_admin')
ON CONFLICT (id) DO UPDATE SET role = 'super_admin';
```

---

## ✅ ÇÖZÜM 3: Test Kullanıcısı Oluştur (Hızlı)

Supabase Dashboard'da:
1. **Authentication** > **Users** > **Add User**
2. Email: `test@admin.com`
3. Password: `Test123456!`
4. **Auto Confirm User:** ✅
5. **Add User**

Sonra migration 2'yi çalıştırın (rolü güncellemek için):
```sql
UPDATE user_profiles
SET role = 'super_admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'test@admin.com' LIMIT 1);
```

---

## 🔍 MEVCUT KULLANICI BİLGİLERİ

- **Email:** `admin@serigame.com` ✅ Doğru
- **ID:** `f24f5759-7db6-4aa1-9cb1-7aa9f9a68f82`
- **Role:** `super_admin` ✅
- **Email Confirmed:** ✅ Evet
- **Password:** ❓ Şifre yanlış veya değiştirilmiş

---

## 💡 HIZLI ÇÖZÜM

**Supabase Dashboard'da şifreyi sıfırlayın:**

1. Authentication > Users
2. `admin@serigame.com` kullanıcısını açın
3. Password alanına: `Admin123!@#` yazın
4. Save/Update butonuna tıklayın
5. Tekrar giriş yapmayı deneyin

---

**Not:** Şifre sıfırladıktan sonra development server'ı yeniden başlatmanız gerekmez, direkt giriş yapabilirsiniz.

