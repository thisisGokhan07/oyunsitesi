# 🔑 Supabase Service Role Key - Tam Yetki Erişimi

**Service Role Key** ile Supabase'de tam yetkiye sahip olursunuz. Bu key RLS (Row Level Security) policy'lerini bypass eder.

---

## ⚠️ GÜVENLİK UYARISI

**Service Role Key çok güçlüdür!**
- ❌ **ASLA** frontend'de (client-side) kullanmayın
- ❌ **ASLA** public repository'lere commit etmeyin
- ❌ **ASLA** tarayıcıda expose etmeyin
- ✅ **SADECE** backend/API route'larda kullanın
- ✅ **SADECE** server-side kodda kullanın

---

## 📋 SERVICE ROLE KEY NASIL ALINIR?

### Adım 1: Supabase Dashboard'a Giriş
1. https://supabase.com/dashboard adresine gidin
2. Projenizi seçin (zjpmgoycegocllpovmru)

### Adım 2: API Settings
1. Sol menüden **Settings** (⚙️) seçin
2. **API** sekmesine tıklayın

### Adım 3: Service Role Key'i Kopyala
1. **Service Role Key** (secret) bölümünü bulun
2. **Reveal** butonuna tıklayın
3. Key'i kopyalayın
4. ⚠️ **Güvenli bir yere kaydedin!**

---

## 🔧 KULLANIM ŞEKİLLERİ

### 1. Environment Variable Olarak Ekle

**`.env.local` dosyasına ekleyin:**

```env
# Mevcut
NEXT_PUBLIC_SUPABASE_URL=https://zjpmgoycegocllpovmru.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# YENİ - Service Role Key (SADECE BACKEND İÇİN)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqcG1nb3ljZWdvY2xscG92bXJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTgzNzQ0MiwiZXhwIjoyMDc3NDEzNDQyfQ.xxxxx
```

**⚠️ ÖNEMLİ:** `NEXT_PUBLIC_` prefix'i KULLANMAYIN! Bu frontend'de expose olur.

---

### 2. Server-Side Client Oluştur

**`lib/supabase/server.ts` dosyası oluşturun:**

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// Service Role Key ile client (RLS bypass)
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Normal kullanıcı işlemleri için
export function createServerClient() {
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
    },
  });
}
```

---

### 3. API Route'larda Kullan

**Örnek: `app/api/admin/users/route.ts`:**

```typescript
import { supabaseAdmin } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Service role key ile tüm kullanıcıları çek (RLS bypass)
    const { data: users, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*');

    if (error) throw error;

    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

---

## 🎯 KULLANIM ALANLARI

### Service Role Key ile yapabilecekleriniz:

1. **Tüm kullanıcıları görüntüleme** (RLS bypass)
2. **Admin işlemleri** (role değiştirme, premium verme)
3. **Migration çalıştırma** (programatik)
4. **Tüm verileri okuma/yazma** (RLS bypass)
5. **Bulk işlemler** (toplu güncelleme, silme)

### Örnek Kullanımlar:

```typescript
// Tüm kullanıcıları çek (anon key ile çalışmaz, service role gerekir)
const { data } = await supabaseAdmin
  .from('user_profiles')
  .select('*');

// Kullanıcı rolünü değiştir
await supabaseAdmin
  .from('user_profiles')
  .update({ role: 'admin' })
  .eq('id', userId);

// Tüm içerikleri çek (published olmayanlar dahil)
const { data } = await supabaseAdmin
  .from('content')
  .select('*');
```

---

## 🔒 GÜVENLİK ÖNLEMLERİ

### 1. Environment Variable Koruması

**`.env.local` dosyasını `.gitignore`'a ekleyin:**

```gitignore
# .env.local zaten ignore edilmeli
.env.local
.env*.local
```

### 2. API Route Protection

**Admin route'larını koruyun:**

```typescript
// app/api/admin/route.ts
import { supabaseAdmin } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // API route'u koru (örnek: JWT token kontrolü)
  const token = request.headers.get('authorization');
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Token doğrulama...
  
  // Service role key ile işlem yap
  const { data } = await supabaseAdmin.from('user_profiles').select('*');
  
  return NextResponse.json({ data });
}
```

---

## 📝 ÖZET

1. ✅ Supabase Dashboard > Settings > API
2. ✅ Service Role Key'i kopyala
3. ✅ `.env.local` dosyasına ekle (NEXT_PUBLIC_ prefix OLMADAN)
4. ✅ Server-side client oluştur
5. ✅ API route'larda kullan

---

## ⚠️ UNUTMAYIN

- Service Role Key = **SINIRSIZ YETKİ**
- Frontend'de kullanmayın
- Her zaman güvenli tutun
- Sadece backend'de kullanın

---

**Son Güncelleme:** 2025-11-04

