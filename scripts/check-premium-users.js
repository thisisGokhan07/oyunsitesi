const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
try {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        process.env[key] = value;
      }
    });
  }
} catch (error) {
  console.warn('⚠️  .env.local dosyası okunamadı:', error.message);
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase environment variables!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
  },
});

async function checkPremiumUsers() {
  console.log('🔍 Premium kullanıcılar kontrol ediliyor...\n');

  try {
    // Tüm kullanıcı profillerini getir
    const { data: profiles, error } = await supabase
      .from('user_profiles')
      .select('id, display_name, email, is_premium, premium_expires_at, role, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Hata:', error.message);
      return;
    }

    console.log(`📊 Toplam Kullanıcı: ${profiles.length}\n`);

    // Premium kullanıcıları filtrele
    const premiumUsers = profiles.filter(p => p.is_premium === true);
    const expiredPremium = profiles.filter(p => 
      p.is_premium === true && 
      p.premium_expires_at && 
      new Date(p.premium_expires_at) < new Date()
    );

    console.log('⭐ Premium Kullanıcılar:');
    console.log('='.repeat(80));
    
    if (premiumUsers.length === 0) {
      console.log('❌ Premium kullanıcı bulunamadı!\n');
    } else {
      premiumUsers.forEach((user, index) => {
        const expiresAt = user.premium_expires_at 
          ? new Date(user.premium_expires_at).toLocaleString('tr-TR')
          : 'Süresiz';
        
        const isExpired = user.premium_expires_at && new Date(user.premium_expires_at) < new Date();
        const status = isExpired ? '❌ SÜRESİ DOLMUŞ' : '✅ AKTİF';
        
        console.log(`\n${index + 1}. ${user.display_name || 'İsimsiz'}`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Email: ${user.email || 'N/A'}`);
        console.log(`   Premium: ${user.is_premium ? '✅' : '❌'}`);
        console.log(`   Durum: ${status}`);
        console.log(`   Bitiş Tarihi: ${expiresAt}`);
        console.log(`   Rol: ${user.role || 'user'}`);
      });
    }

    console.log('\n' + '='.repeat(80));
    console.log(`\n📈 Özet:`);
    console.log(`   Toplam Kullanıcı: ${profiles.length}`);
    console.log(`   Premium Kullanıcı: ${premiumUsers.length}`);
    console.log(`   Aktif Premium: ${premiumUsers.length - expiredPremium.length}`);
    console.log(`   Süresi Dolmuş: ${expiredPremium.length}`);

    // Auth kullanıcıları ile karşılaştır
    console.log('\n🔐 Auth Kullanıcıları:');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (!authError && authUsers) {
      console.log(`   Toplam Auth Kullanıcı: ${authUsers.users.length}`);
      
      // Eşleşmeyen kullanıcıları bul
      const profileIds = new Set(profiles.map(p => p.id));
      const missingProfiles = authUsers.users.filter(u => !profileIds.has(u.id));
      
      if (missingProfiles.length > 0) {
        console.log(`\n⚠️  Profile'ı olmayan ${missingProfiles.length} auth kullanıcı var:`);
        missingProfiles.forEach(u => {
          console.log(`   - ${u.email} (${u.id})`);
        });
      }
    }

    // Son 10 kullanıcıyı göster
    console.log('\n📋 Son 10 Kullanıcı:');
    console.log('='.repeat(80));
    profiles.slice(0, 10).forEach((user, index) => {
      console.log(`${index + 1}. ${user.display_name || 'İsimsiz'} | Premium: ${user.is_premium ? '✅' : '❌'} | ${user.email || 'N/A'}`);
    });

  } catch (error) {
    console.error('❌ Hata:', error.message);
  }
}

checkPremiumUsers().catch(console.error);

