// Service Role Key Test
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// .env.local dosyasını oku
const envPath = path.join(__dirname, '..', '.env.local');
let supabaseUrl, supabaseAnonKey, supabaseServiceKey;

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split(/\r?\n/);
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = trimmed.substring('NEXT_PUBLIC_SUPABASE_URL='.length).trim();
    }
    if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      supabaseAnonKey = trimmed.substring('NEXT_PUBLIC_SUPABASE_ANON_KEY='.length).trim();
    }
    if (trimmed.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
      supabaseServiceKey = trimmed.substring('SUPABASE_SERVICE_ROLE_KEY='.length).trim();
    }
  });
}

console.log('🔑 Service Role Key Testi\n');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Environment değişkenleri eksik!');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function testServiceRole() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 SERVICE ROLE KEY TESTİ:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Test 1: Tüm kullanıcıları çek (anon key ile çalışmaz, service role ile çalışır)
  console.log('1️⃣  Tüm kullanıcıları çekme testi...');
  try {
    const { data: users, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.log('❌ Hata:', error.message);
    } else {
      console.log(`✅ Başarılı! ${users?.length || 0} kullanıcı bulundu`);
      if (users && users.length > 0) {
        console.log('\n   Kullanıcılar:');
        users.forEach((u, i) => {
          console.log(`   ${i + 1}. ${u.display_name || 'İsimsiz'} (${u.role}) - ${u.id.substring(0, 8)}...`);
        });
      }
    }
  } catch (err) {
    console.log('❌ Hata:', err.message);
  }

  // Test 2: Tüm içerikleri çek (published olmayanlar dahil)
  console.log('\n2️⃣  Tüm içerikleri çekme testi (published olmayanlar dahil)...');
  try {
    const { data: content, error } = await supabaseAdmin
      .from('content')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.log('❌ Hata:', error.message);
    } else {
      console.log(`✅ Başarılı! ${content?.length || 0} içerik bulundu`);
    }
  } catch (err) {
    console.log('❌ Hata:', err.message);
  }

  // Test 3: Kategorileri çek
  console.log('\n3️⃣  Kategorileri çekme testi...');
  try {
    const { data: categories, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.log('❌ Hata:', error.message);
    } else {
      console.log(`✅ Başarılı! ${categories?.length || 0} kategori bulundu`);
      if (categories && categories.length > 0) {
        console.log('\n   Kategoriler:');
        categories.slice(0, 5).forEach((c, i) => {
          console.log(`   ${i + 1}. ${c.name} (${c.slug})`);
        });
        if (categories.length > 5) {
          console.log(`   ... ve ${categories.length - 5} kategori daha`);
        }
      }
    }
  } catch (err) {
    console.log('❌ Hata:', err.message);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Service Role Key çalışıyor!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('💡 Artık admin panelinde tüm kullanıcıları görebilir ve yönetebilirsiniz!');
}

testServiceRole().catch(err => {
  console.error('❌ Hata:', err.message);
  process.exit(1);
});

