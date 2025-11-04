# 🔧 Son Çözüm - RLS Infinite Recursion Fix

**Sorun:** Policy'ler arasında sonsuz döngü oluşuyor.

**Çözüm:** RLS'yi geçici olarak kapatıp, tüm policy'leri silip yeniden oluşturmak.

---

## ✅ ADIM ADIM ÇÖZÜM

Supabase Dashboard > SQL Editor'de şu SQL'i **TAM OLARAK** çalıştırın:

```sql
-- ============================================
-- STEP 1: RLS'yi geçici olarak kapat
-- ============================================
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE content DISABLE ROW LEVEL SECURITY;
ALTER TABLE ratings DISABLE ROW LEVEL SECURITY;
ALTER TABLE content_analytics DISABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 2: Tüm policy'leri sil
-- ============================================
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Content is viewable by everyone" ON content;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Ratings are viewable by everyone" ON ratings;
DROP POLICY IF EXISTS "Users can create ratings" ON ratings;
DROP POLICY IF EXISTS "Users can update own ratings" ON ratings;
DROP POLICY IF EXISTS "Analytics are insertable by everyone" ON content_analytics;
DROP POLICY IF EXISTS "Analytics are viewable by authenticated users" ON content_analytics;

-- ============================================
-- STEP 3: RLS'yi tekrar aç
-- ============================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_analytics ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 4: Yeni policy'leri oluştur
-- ============================================

-- Categories: Public read
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (published = true);

-- Content: Public read
CREATE POLICY "Content is viewable by everyone"
  ON content FOR SELECT
  USING (published = true);

-- User profiles: Simple authenticated access
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
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM content WHERE id = content_id AND published = true)
  );

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

**VEYA** `supabase/migrations/00005_aggressive_rls_fix.sql` dosyasını çalıştırın.

---

## ✅ KONTROL

SQL'i çalıştırdıktan sonra:

```bash
node scripts/check-supabase-tables.js
```

Tüm tabloların ✅ görünmesi gerekiyor.

---

## 🔍 EĞER HALA ÇALIŞMAZSA

Eğer yukarıdaki çözüm işe yaramazsa, sorun başka bir yerde olabilir. Şunları kontrol edin:

1. **Supabase Dashboard > Table Editor** - Tabloların gerçekten var olup olmadığını kontrol edin
2. **Supabase Dashboard > Authentication > Policies** - Orada ekstra policy'ler olabilir
3. **Database Functions** - Bazı fonksiyonlar policy'leri tetikliyor olabilir

---

**Not:** Bu işlem RLS'yi geçici olarak kapatır, bu yüzden çok kısa bir süre için güvenlik açığı oluşabilir. Ancak hemen ardından RLS tekrar açılır ve policy'ler oluşturulur.

