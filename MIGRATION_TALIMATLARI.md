# 🚀 Supabase Migration Talimatları

Bu dosya Supabase migration'larını çalıştırmak için adım adım talimatlar içerir.

---

## 📋 ÖN HAZIRLIK

1. **Supabase Dashboard'a giriş yapın:**
   - https://supabase.com/dashboard
   - Projenizi seçin (bnyoqpalfeeisbqanazd)

---

## 🔧 ADIM 1: İlk Migration (Schema Oluşturma)

1. **SQL Editor'ü açın:**
   - Sol menüden **SQL Editor** seçin
   - **New query** butonuna tıklayın

2. **Migration dosyasını açın:**
   - Proje klasöründe: `supabase/migrations/00001_initial_schema.sql`
   - Dosyanın tüm içeriğini kopyalayın

3. **SQL'i çalıştırın:**
   - SQL Editor'e yapıştırın
   - **Run** butonuna tıklayın (veya Ctrl+Enter)
   - ✅ Başarılı mesajını bekleyin

4. **Oluşturulan tabloları kontrol edin:**
   - Sol menüden **Table Editor** seçin
   - Şu tablolar görünmeli:
     - ✅ `categories`
     - ✅ `content`
     - ✅ `user_profiles`
     - ✅ `ratings`
     - ✅ `content_analytics`

---

## 👤 ADIM 2: Test Kullanıcısı Oluşturma

1. **Authentication > Users** sayfasına gidin
2. **Add User** butonuna tıklayın
3. **Kullanıcı bilgilerini girin:**
   - Email: `admin@serigame.com`
   - Password: `Admin123!@#`
   - **Auto Confirm User** seçeneğini işaretleyin
4. **Add User** butonuna tıklayın
5. **User ID'yi kopyalayın** (sonraki adımda gerekli olabilir)

---

## 🔧 ADIM 3: İkinci Migration (Admin Rolü)

1. **SQL Editor > New query**
2. **Migration dosyasını açın:**
   - `supabase/migrations/00002_create_test_admin.sql`
   - Tüm içeriği kopyalayın
3. **SQL'i çalıştırın**
4. **Kontrol edin:**
   - Table Editor > `user_profiles` tablosuna gidin
   - Admin kullanıcısının `role` alanının `super_admin` olduğunu kontrol edin

---

## 📦 ADIM 4: Storage Bucket Oluşturma

1. **Storage** menüsüne gidin
2. **New bucket** butonuna tıklayın
3. **Bucket ayarları:**
   - **Name:** `content-files`
   - **Public bucket:** ✅ **Evet** (işaretli olmalı!)
   - **File size limit:** `100` MB
   - **Allowed MIME types:** `image/*, video/*, audio/*`
4. **Create bucket** butonuna tıklayın

5. **Bucket Policies ekleyin:**
   - Bucket'ı açın
   - **Policies** sekmesine gidin
   - **New Policy** butonuna tıklayın
   - **Policy adı:** `Public read access`
   - **Policy:** 
   ```sql
   -- Public read access
   CREATE POLICY "Public read access"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'content-files');
   ```
   - **Save** butonuna tıklayın

---

## ⚙️ ADIM 5: Authentication Ayarları

1. **Authentication > Settings** sayfasına gidin
2. **Site URL:** `http://localhost:3000`
3. **Redirect URLs:** `http://localhost:3000/**`
4. **Email Auth:** ✅ Enable
5. **Email Confirmations:** ⚠️ Disable (test için)
6. **Save** butonuna tıklayın

---

## ✅ KONTROL LİSTESİ

Migration'ları başarıyla çalıştırdıktan sonra kontrol edin:

- [ ] `categories` tablosu oluşturuldu
- [ ] `content` tablosu oluşturuldu
- [ ] `user_profiles` tablosu oluşturuldu
- [ ] `ratings` tablosu oluşturuldu
- [ ] `content_analytics` tablosu oluşturuldu
- [ ] Test kullanıcısı oluşturuldu (`admin@serigame.com`)
- [ ] Admin kullanıcısının rolü `super_admin`
- [ ] Storage bucket `content-files` oluşturuldu
- [ ] Storage bucket public
- [ ] Authentication ayarları yapılandırıldı

---

## 🧪 TEST

Migration'ları çalıştırdıktan sonra:

1. **Development server'ı yeniden başlatın:**
   ```bash
   npm run dev
   ```

2. **Tarayıcıda test edin:**
   - http://localhost:3000
   - http://localhost:3000/admin
   - Admin girişi yapın: `admin@serigame.com` / `Admin123!@#`

3. **Admin panelinde test edin:**
   - İçerik eklemeyi deneyin
   - Kategori eklemeyi deneyin

---

## ❌ SORUN GİDERME

### Hata: "relation already exists"
- Migration'ı zaten çalıştırmışsınız
- Devam edebilirsiniz

### Hata: "permission denied"
- RLS policies sorunlu olabilir
- Migration'ı tekrar kontrol edin

### Hata: "function does not exist"
- Migration 1'deki fonksiyonlar oluşturulmamış
- Migration'ı tekrar çalıştırın

### Kullanıcı giriş yapamıyor
- Email confirmations kapalı mı kontrol edin
- Kullanıcı şifresini kontrol edin
- User profile oluşturulmuş mu kontrol edin

---

## 📞 DESTEK

Sorun yaşarsanız:
1. Hata mesajını kopyalayın
2. SQL Editor'deki query'yi kontrol edin
3. Supabase Dashboard'daki tabloları kontrol edin

---

**Son Güncelleme:** 2025-11-04

