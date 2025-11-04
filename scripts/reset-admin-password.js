// Admin Şifresini Sıfırla
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

async function resetAdminPassword() {
  console.log('🔐 Admin Şifresini Sıfırlıyorum...\n');

  const adminEmail = 'admin@serigame.com';
  const newPassword = 'Admin123!@#';

  try {
    // Önce kullanıcıyı bul
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Kullanıcılar listelenemedi:', listError.message);
      process.exit(1);
    }

    const adminUser = users?.find(u => u.email === adminEmail);

    if (!adminUser) {
      console.error(`❌ ${adminEmail} kullanıcısı bulunamadı!`);
      console.log('\n💡 Yeni admin kullanıcısı oluşturuluyor...');
      
      // Yeni kullanıcı oluştur
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: adminEmail,
        password: newPassword,
        email_confirm: true, // Auto confirm
        user_metadata: {
          display_name: 'Admin',
        },
      });

      if (createError) {
        console.error('❌ Kullanıcı oluşturulamadı:', createError.message);
        process.exit(1);
      }

      console.log('✅ Yeni admin kullanıcısı oluşturuldu!');
      console.log(`   User ID: ${newUser.user.id}`);

      // Profile oluştur
      const { error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .upsert({
          id: newUser.user.id,
          display_name: 'Admin',
          role: 'super_admin',
          is_premium: false,
        }, {
          onConflict: 'id'
        });

      if (profileError) {
        console.log('⚠️  Profile oluşturulamadı:', profileError.message);
        console.log('💡 Manuel olarak profile oluşturun:');
        console.log(`   UPDATE user_profiles SET role = 'super_admin' WHERE id = '${newUser.user.id}';`);
      } else {
        console.log('✅ Admin profile oluşturuldu!');
      }

      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ BAŞARILI!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`Email:    ${adminEmail}`);
      console.log(`Password: ${newPassword}`);
      console.log(`Role:     super_admin`);
      process.exit(0);
    }

    // Mevcut kullanıcının şifresini güncelle
    console.log(`✅ Kullanıcı bulundu: ${adminUser.email}`);
    console.log(`   User ID: ${adminUser.id}`);
    console.log('\n🔄 Şifre güncelleniyor...');

    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      adminUser.id,
      {
        password: newPassword,
        email_confirm: true, // Email'i onayla
      }
    );

    if (updateError) {
      console.error('❌ Şifre güncellenemedi:', updateError.message);
      process.exit(1);
    }

    console.log('✅ Şifre başarıyla güncellendi!');

    // Profile'ı kontrol et ve güncelle
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', adminUser.id)
      .maybeSingle();

    if (profileError) {
      console.log('⚠️  Profile kontrol edilemedi:', profileError.message);
    } else if (!profile) {
      console.log('🔄 Profile oluşturuluyor...');
      const { error: createProfileError } = await supabaseAdmin
        .from('user_profiles')
        .insert({
          id: adminUser.id,
          display_name: 'Admin',
          role: 'super_admin',
          is_premium: false,
        });

      if (createProfileError) {
        console.log('⚠️  Profile oluşturulamadı:', createProfileError.message);
      } else {
        console.log('✅ Profile oluşturuldu!');
      }
    } else {
      // Profile var, role'ü güncelle
      if (profile.role !== 'super_admin') {
        console.log('🔄 Role güncelleniyor...');
        const { error: roleError } = await supabaseAdmin
          .from('user_profiles')
          .update({ role: 'super_admin' })
          .eq('id', adminUser.id);

        if (roleError) {
          console.log('⚠️  Role güncellenemedi:', roleError.message);
        } else {
          console.log('✅ Role super_admin olarak güncellendi!');
        }
      } else {
        console.log('✅ Profile zaten super_admin rolüne sahip');
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ BAŞARILI!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Email:    ${adminEmail}`);
    console.log(`Password: ${newPassword}`);
    console.log(`Role:     super_admin`);
    console.log('\n💡 Artık bu bilgilerle giriş yapabilirsiniz!');

  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  }
}

resetAdminPassword();

