# 🔧 RLS Policy Fix - Adım Adım Çözüm

**Sorun:** `infinite recursion detected in policy for relation "user_profiles"`

**Neden:** Policy'ler arasında döngüsel bağımlılık veya yanlış sıralama

---

## ✅ ÇÖZÜM: Tüm Policy'leri Yeniden Oluştur

Supabase Dashboard > SQL Editor'de şu SQL'i çalıştırın:

```sql
-- ============================================
-- STEP 1: Tüm mevcut policy'leri sil
-- ============================================

-- Categories policies
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;

-- Content policies
DROP POLICY IF EXISTS "Content is viewable by everyone" ON content;

-- User profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Ratings policies
DROP POLICY IF EXISTS "Ratings are viewable by everyone" ON ratings;
DROP POLICY IF EXISTS "Users can create ratings" ON ratings;
DROP POLICY IF EXISTS "Users can update own ratings" ON ratings;

-- Analytics policies
DROP POLICY IF EXISTS "Analytics are insertable by everyone" ON content_analytics;
DROP POLICY IF EXISTS "Analytics are viewable by authenticated users" ON content_analytics;

-- ============================================
-- STEP 2: Policy'leri doğru sırayla yeniden oluştur
-- ============================================

-- Categories: Public read access
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (published = true);

-- Content: Public read access
CREATE POLICY "Content is viewable by everyone"
  ON content FOR SELECT
  USING (published = true);

-- User profiles: Only authenticated users can manage their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Ratings: Public read, authenticated write
CREATE POLICY "Ratings are viewable by everyone"
  ON ratings FOR SELECT
  USING (true);

CREATE POLICY "Users can create ratings"
  ON ratings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings"
  ON ratings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Analytics: Public insert, authenticated read
CREATE POLICY "Analytics are insertable by everyone"
  ON content_analytics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Analytics are viewable by authenticated users"
  ON content_analytics FOR SELECT
  TO authenticated
  USING (true);
```

**VEYA** `supabase/migrations/00004_fix_all_rls_policies.sql` dosyasını çalıştırın.

---

## ✅ KONTROL

SQL'i çalıştırdıktan sonra:

```bash
node scripts/check-supabase-tables.js
```

Tüm tabloların ✅ görünmesi gerekiyor.

---

## 🔍 ALTERNATİF ÇÖZÜM (Eğer hala çalışmazsa)

Eğer yukarıdaki çözüm işe yaramazsa, geçici olarak RLS'yi devre dışı bırakıp tekrar açabilirsiniz:

```sql
-- RLS'yi geçici olarak devre dışı bırak
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE content DISABLE ROW LEVEL SECURITY;
ALTER TABLE content_analytics DISABLE ROW LEVEL SECURITY;

-- RLS'yi tekrar aç
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_analytics ENABLE ROW LEVEL SECURITY;

-- Sonra policy'leri yeniden oluştur (yukarıdaki SQL)
```

---

**Not:** Bu işlem mevcut policy'leri silip yeniden oluşturur, veri kaybı olmaz.

