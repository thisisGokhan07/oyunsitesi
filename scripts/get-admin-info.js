// Admin Kullanıcı Bilgilerini Getir
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// .env.local dosyasını oku
const envPath = path.join(__dirname, '..', '.env.local');
let supabaseUrl, supabaseServiceKey;

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split(/\r?\n/);
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = trimmed.substring('NEXT_PUBLIC_SUPABASE_URL='.length).trim();
    }
    if (trimmed.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
      supabaseServiceKey = trimmed.substring('SUPABASE_SERVICE_ROLE_KEY='.length).trim();
    }
  });
}

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

async function getAdminInfo() {
  console.log('👤 Admin Kullanıcı Bilgileri\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Admin kullanıcılarını çek
    const { data: admins, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .in('role', ['super_admin', 'admin', 'editor', 'moderator'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Hata:', error.message);
      process.exit(1);
    }

    if (!admins || admins.length === 0) {
      console.log('⚠️  Admin kullanıcısı bulunamadı!');
      console.log('\n💡 Admin kullanıcısı oluşturmak için:');
      console.log('1. Supabase Dashboard > Authentication > Users > Add User');
      console.log('2. Email: admin@serigame.com');
      console.log('3. Password: Admin123!@#');
      console.log('4. Sonra migration 2\'yi çalıştırın (rolü güncellemek için)');
      process.exit(0);
    }

    console.log(`✅ ${admins.length} admin kullanıcısı bulundu:\n`);

    admins.forEach((admin, index) => {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📋 Admin ${index + 1}:`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`ID:              ${admin.id}`);
      console.log(`Display Name:    ${admin.display_name || 'İsimsiz'}`);
      console.log(`Role:            ${admin.role}`);
      console.log(`Premium:         ${admin.is_premium ? '✅ Evet' : '❌ Hayır'}`);
      console.log(`Premium Bitiş:   ${admin.premium_expires_at ? new Date(admin.premium_expires_at).toLocaleDateString('tr-TR') : 'Yok'}`);
      console.log(`Avatar URL:      ${admin.avatar_url || 'Yok'}`);
      console.log(`Doğum Yılı:      ${admin.birth_year || 'Yok'}`);
      console.log(`Oluşturulma:     ${new Date(admin.created_at).toLocaleString('tr-TR')}`);
      console.log(`Son Güncelleme:  ${new Date(admin.updated_at).toLocaleString('tr-TR')}`);
      console.log('');
    });

    // Auth email bilgilerini de çekmeye çalış
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Auth Kullanıcı Bilgileri:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  Email bilgisi için Supabase Dashboard\'a bakmanız gerekiyor.');
    console.log('   (Service Role Key ile auth.users tablosuna erişim sınırlı)');
    console.log('');
    console.log('💡 Test için kullanılan admin bilgileri:');
    console.log('   Email:    admin@serigame.com');
    console.log('   Password: Admin123!@#');
    console.log('   Role:     super_admin');
    console.log('');

  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  }
}

getAdminInfo();

