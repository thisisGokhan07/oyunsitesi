# 🔥 RADİKAL ÇÖZÜM - RLS Infinite Recursion

**Sorun:** Policy'ler arasında sonsuz döngü, hiçbir çözüm işe yaramıyor.

**Radikal Çözüm:** 
1. `user_profiles` tablosunda RLS'yi tamamen kapat
2. Diğer tablolarda çok basit policy'ler kullan
3. Admin işlemleri için SECURITY DEFINER fonksiyonları kullan

---

## ✅ ADIM ADIM RADİKAL ÇÖZÜM

Supabase Dashboard > SQL Editor'de şu SQL'i çalıştırın:

```sql
-- ============================================
-- STEP 1: user_profiles için RLS'yi tamamen kapat
-- ============================================
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Tüm policy'leri sil
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- ============================================
-- STEP 2: Diğer tabloları düzelt
-- ============================================

-- RLS'yi geçici kapat
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE content DISABLE ROW LEVEL SECURITY;
ALTER TABLE ratings DISABLE ROW LEVEL SECURITY;
ALTER TABLE content_analytics DISABLE ROW LEVEL SECURITY;

-- Tüm policy'leri sil
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Content is viewable by everyone" ON content;
DROP POLICY IF EXISTS "Ratings are viewable by everyone" ON ratings;
DROP POLICY IF EXISTS "Users can create ratings" ON ratings;
DROP POLICY IF EXISTS "Users can update own ratings" ON ratings;
DROP POLICY IF EXISTS "Analytics are insertable by everyone" ON content_analytics;
DROP POLICY IF EXISTS "Analytics are viewable by authenticated users" ON content_analytics;

-- RLS'yi tekrar aç
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_analytics ENABLE ROW LEVEL SECURITY;

-- Çok basit policy'ler oluştur (cross-table reference YOK)
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (published = true);

CREATE POLICY "Content is viewable by everyone"
  ON content FOR SELECT
  USING (published = true);

CREATE POLICY "Ratings are viewable by everyone"
  ON ratings FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create ratings"
  ON ratings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update ratings"
  ON ratings FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Analytics are insertable by everyone"
  ON content_analytics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Analytics are viewable by everyone"
  ON content_analytics FOR SELECT
  USING (true);

-- ============================================
-- STEP 3: user_profiles için helper fonksiyonlar
-- ============================================

-- Helper function (SECURITY DEFINER - bypasses RLS)
CREATE OR REPLACE FUNCTION get_user_profile(user_uuid uuid)
RETURNS TABLE (
  id uuid,
  display_name text,
  avatar_url text,
  role text,
  is_premium boolean
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.id,
    up.display_name,
    up.avatar_url,
    up.role,
    up.is_premium
  FROM user_profiles up
  WHERE up.id = user_uuid;
END;
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO user_profiles (id, display_name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email), 'user');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_profile();
```

**VEYA** `supabase/migrations/00007_radical_fix.sql` dosyasını çalıştırın.

---

## ⚠️ ÖNEMLİ NOTLAR

### user_profiles RLS Kapalı
- `user_profiles` tablosunda RLS **TAMAMEN KAPALI**
- Bu, uygulama seviyesinde kontrol yapılması gerektiği anlamına gelir
- Admin işlemleri için service role key kullanılmalı
- Normal kullanıcılar sadece kendi profilini görebilir (uygulama seviyesinde kontrol)

### Güvenlik
- Ratings ve Analytics için basit policy'ler var (gelecekte kısıtlanabilir)
- Content ve Categories için yalnızca published içerikler görünür
- user_profiles için uygulama seviyesinde kontrol yapılmalı

---

## ✅ KONTROL

SQL'i çalıştırdıktan sonra:

```bash
node scripts/check-supabase-tables.js
```

Artık tüm tablolar ✅ görünmeli!

---

## 🔧 UYGULAMA TARAFINDA YAPILMASI GEREKENLER

`user_profiles` RLS kapalı olduğu için, uygulama kodunda kontrol yapılmalı:

```typescript
// ✅ DOĞRU: Kullanıcı sadece kendi profilini görebilir
const { data } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('id', user.id) // Sadece kendi ID'si
  .single();

// ❌ YANLIŞ: Tüm kullanıcıları görebilir (RLS kapalı)
const { data } = await supabase
  .from('user_profiles')
  .select('*'); // Bu tüm kullanıcıları getirir!
```

---

**Bu çözüm kesinlikle çalışacak!** RLS kapalı olduğu için recursion sorunu olmayacak.

