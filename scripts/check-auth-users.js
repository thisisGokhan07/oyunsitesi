// Auth Kullanıcılarını Kontrol Et
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

async function checkAuthUsers() {
  console.log('🔍 Auth Kullanıcılarını Kontrol Ediyorum...\n');

  try {
    // Service Role Key ile auth.admin.listUsers() kullanabiliriz
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      console.error('❌ Hata:', error.message);
      console.log('\n💡 Supabase Dashboard\'dan kontrol edin:');
      console.log('   1. Authentication > Users');
      console.log('   2. Mevcut kullanıcıları görebilirsiniz');
      process.exit(1);
    }

    if (!users || users.length === 0) {
      console.log('⚠️  Hiç kullanıcı bulunamadı!');
      console.log('\n💡 Admin kullanıcısı oluşturmak için:');
      console.log('   1. Supabase Dashboard > Authentication > Users');
      console.log('   2. Add User butonuna tıklayın');
      console.log('   3. Email: admin@serigame.com');
      console.log('   4. Password: Admin123!@#');
      console.log('   5. Auto Confirm User: ✅ İşaretleyin');
      console.log('   6. Add User butonuna tıklayın');
      process.exit(0);
    }

    console.log(`✅ ${users.length} kullanıcı bulundu:\n`);

    users.forEach((user, index) => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`👤 Kullanıcı ${index + 1}:`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`Email:            ${user.email}`);
      console.log(`ID:               ${user.id}`);
      console.log(`Email Confirmed:  ${user.email_confirmed_at ? '✅ Evet' : '❌ Hayır'}`);
      console.log(`Created:          ${new Date(user.created_at).toLocaleString('tr-TR')}`);
      console.log(`Last Sign In:     ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('tr-TR') : 'Henüz giriş yapmamış'}`);
      
      // Profile bilgilerini kontrol et
      supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data: profile }) => {
          if (profile) {
            console.log(`Role:             ${profile.role}`);
            console.log(`Display Name:     ${profile.display_name || 'Yok'}`);
          } else {
            console.log(`Role:             ⚠️  Profile eksik!`);
          }
        });
      
      console.log('');
    });

    // Admin kullanıcılarını filtrele
    const adminUsers = users.filter(u => {
      // Profile kontrolü için async işlem yapmamız gerekiyor
      return true; // Şimdilik hepsini göster
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 GİRİŞ BİLGİLERİ:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   Password: Supabase Dashboard'dan kontrol edin veya şifre sıfırlayın`);
      console.log(`   Status: ${user.email_confirmed_at ? '✅ Onaylı' : '❌ Onaylanmamış'}`);
      console.log('');
    });

    console.log('💡 Şifreyi unuttuysanız:');
    console.log('   - Supabase Dashboard > Authentication > Users');
    console.log('   - Kullanıcıyı seçin > Reset Password');
    console.log('   - VEYA yeni bir kullanıcı oluşturun');

  } catch (error) {
    console.error('❌ Hata:', error.message);
    console.log('\n💡 Alternatif: Supabase Dashboard\'dan kontrol edin');
    console.log('   Authentication > Users');
  }
}

checkAuthUsers();

