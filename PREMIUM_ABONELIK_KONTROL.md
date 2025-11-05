# 🔍 Premium Abonelik Kontrol Rehberi

## ❓ Sorun: Premium abonelikler veritabanında görünmüyor

### 🔍 Kontrol Adımları

#### 1. **Admin Panelden Kontrol**

Admin panelinden kullanıcıları kontrol edin:
- `/admin/kullanicilar` sayfasına gidin
- Kullanıcıları listeleyin
- `is_premium` ve `premium_expires_at` sütunlarını kontrol edin

#### 2. **Supabase Dashboard'dan Kontrol**

1. **Supabase Dashboard** > **Table Editor** > **user_profiles**
2. Tüm kullanıcıları listeleyin
3. `is_premium` ve `premium_expires_at` kolonlarını kontrol edin

**SQL Query:**
```sql
SELECT 
  id,
  display_name,
  email,
  is_premium,
  premium_expires_at,
  created_at
FROM user_profiles
ORDER BY created_at DESC;
```

#### 3. **Console Log Kontrolü**

Dashboard'dan premium upgrade yaparken:
1. Browser Developer Tools'u açın (F12)
2. Console sekmesine gidin
3. Premium upgrade butonuna tıklayın
4. Console'da şu logları arayın:
   - `🔄 Premium upgrade başlatılıyor`
   - `✅ Premium upgrade başarılı`
   - `❌ Premium upgrade hatası` (varsa)

#### 4. **Manuel Premium Ekleme (Admin)**

Eğer premium upgrade çalışmıyorsa, manuel olarak ekleyebilirsiniz:

**Admin Panelden:**
1. `/admin/kullanicilar` sayfasına gidin
2. Kullanıcıyı bulun
3. "Premium" toggle'ını açın
4. Kaydedin

**SQL ile:**
```sql
-- Kullanıcı ID'sini değiştirin
UPDATE user_profiles
SET 
  is_premium = true,
  premium_expires_at = NOW() + INTERVAL '1 month'
WHERE id = 'USER_ID_HERE';
```

#### 5. **RLS Policy Kontrolü**

RLS policy sorunu olabilir. Kontrol edin:

```sql
-- RLS policy'leri kontrol et
SELECT * FROM pg_policies 
WHERE tablename = 'user_profiles';

-- Eğer policy yoksa, ekleyin:
CREATE POLICY "Users can update own profile premium"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

---

## 🛠️ Sorun Giderme

### **Sorun 1: RLS Policy Hatası**

**Hata:** `permission denied for table user_profiles`

**Çözüm:**
```sql
-- user_profiles için RLS'yi kontrol et
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy'yi güncelle
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

### **Sorun 2: Profile Yok**

**Hata:** Kullanıcının `user_profiles` tablosunda kaydı yok

**Çözüm:**
```sql
-- Kullanıcı profilini oluştur
INSERT INTO user_profiles (id, display_name, role, is_premium)
SELECT 
  id,
  email,
  'user',
  false
FROM auth.users
WHERE id = 'USER_ID_HERE'
ON CONFLICT (id) DO NOTHING;
```

### **Sorun 3: Premium Upgrade Başarısız**

**Hata:** `upgradeToPremium` fonksiyonu hata veriyor

**Kontrol:**
1. Browser console'da hata mesajını kontrol edin
2. Network tab'ında Supabase request'ini kontrol edin
3. Supabase Dashboard > Logs'da hata var mı kontrol edin

---

## ✅ Test Senaryosu

### **1. Premium Upgrade Test**

1. Kullanıcı olarak giriş yapın
2. `/dashboard` sayfasına gidin
3. "Premium'a Yükselt" butonuna tıklayın
4. Bir plan seçin (1 aylık, 3 aylık, vs.)
5. Console'da logları kontrol edin
6. Sayfayı yenileyin
7. Premium durumunun güncellendiğini kontrol edin

### **2. Admin Panel Test**

1. Admin olarak giriş yapın
2. `/admin/kullanicilar` sayfasına gidin
3. Kullanıcıyı bulun
4. Premium toggle'ını açın
5. Kaydedin
6. Veritabanında kontrol edin

---

## 📊 Premium Kullanıcı Sorgusu

Tüm premium kullanıcıları listelemek için:

```sql
SELECT 
  up.id,
  up.display_name,
  au.email,
  up.is_premium,
  up.premium_expires_at,
  CASE 
    WHEN up.premium_expires_at IS NULL THEN 'Süresiz'
    WHEN up.premium_expires_at > NOW() THEN 'Aktif'
    ELSE 'Süresi Dolmuş'
  END as status,
  up.created_at
FROM user_profiles up
LEFT JOIN auth.users au ON au.id = up.id
WHERE up.is_premium = true
ORDER BY up.created_at DESC;
```

---

## 🔧 Hızlı Düzeltme Scripti

Eğer premium upgrade çalışmıyorsa, bu script ile manuel olarak ekleyebilirsiniz:

```javascript
// Browser Console'da çalıştırın
// Kullanıcı ID'sini değiştirin
const userId = 'YOUR_USER_ID';
const months = 1; // 1, 3, 6, 12

const expiresAt = new Date();
expiresAt.setMonth(expiresAt.getMonth() + months);

const { data, error } = await supabase
  .from('user_profiles')
  .update({
    is_premium: true,
    premium_expires_at: expiresAt.toISOString(),
  })
  .eq('id', userId)
  .select();

if (error) {
  console.error('Hata:', error);
} else {
  console.log('Başarılı:', data);
}
```

---

## 📞 Destek

Sorun devam ederse:
1. Browser console loglarını kontrol edin
2. Supabase Dashboard > Logs'u kontrol edin
3. Network tab'ında Supabase request'lerini kontrol edin
4. RLS policy'lerini kontrol edin

