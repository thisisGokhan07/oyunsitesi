// Test User Signup
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// .env.local dosyasını oku
const envPath = path.join(__dirname, '..', '.env.local');
let supabaseUrl, supabaseKey;

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split(/\r?\n/);
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = trimmed.substring('NEXT_PUBLIC_SUPABASE_URL='.length).trim();
    }
    if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      supabaseKey = trimmed.substring('NEXT_PUBLIC_SUPABASE_ANON_KEY='.length).trim();
    }
  });
}

console.log('🧪 Kullanıcı Kayıt Testi\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Environment değişkenleri eksik!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignup() {
  const testEmail = `test_${Date.now()}@test.com`;
  const testPassword = 'Test123456!';

  console.log('📝 Test kullanıcısı oluşturuluyor...');
  console.log(`Email: ${testEmail}`);
  console.log(`Password: ${testPassword}\n`);

  try {
    // Signup
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          display_name: 'Test User',
        },
      },
    });

    if (authError) {
      console.error('❌ Auth hatası:', authError.message);
      process.exit(1);
    }

    if (!authData.user) {
      console.error('❌ Kullanıcı oluşturulamadı');
      process.exit(1);
    }

    console.log('✅ Auth kullanıcısı oluşturuldu:', authData.user.id);

    // Wait a bit for trigger to execute
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check if profile was created
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (profileError) {
      console.error('❌ Profile kontrolü hatası:', profileError.message);
      process.exit(1);
    }

    if (profile) {
      console.log('✅ User profile otomatik oluşturuldu!');
      console.log('   - ID:', profile.id);
      console.log('   - Display Name:', profile.display_name);
      console.log('   - Role:', profile.role);
      console.log('   - Premium:', profile.is_premium);
      console.log('\n✅ Kullanıcı kayıt sistemi çalışıyor!');
      process.exit(0);
    } else {
      console.log('⚠️  Profile otomatik oluşturulmadı');
      console.log('💡 Trigger çalışmamış olabilir veya RLS sorunu var');
      
      // Try to create profile manually
      console.log('\n🔄 Manuel profile oluşturma deneniyor...');
      const { data: manualProfile, error: manualError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          display_name: 'Test User',
          role: 'user',
          is_premium: false,
        })
        .select()
        .single();

      if (manualError) {
        console.error('❌ Manuel profile oluşturma hatası:', manualError.message);
        process.exit(1);
      }

      if (manualProfile) {
        console.log('✅ Manuel profile oluşturuldu');
        console.log('⚠️  Ancak trigger çalışmıyor - migration kontrol edilmeli');
        process.exit(0);
      }
    }
  } catch (error) {
    console.error('❌ Genel hata:', error.message);
    process.exit(1);
  }
}

testSignup();

