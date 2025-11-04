// Database Durum Kontrolü
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

console.log('🔍 Database Durum Kontrolü\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Environment değişkenleri eksik!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 TABLOLAR VE KAYIT SAYILARI:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Categories
  try {
    const { count, error } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ categories:', error.message);
    } else {
      console.log(`✅ categories: ${count || 0} kayıt`);
    }
  } catch (err) {
    console.log('❌ categories:', err.message);
  }

  // Content
  try {
    const { count, error } = await supabase
      .from('content')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ content:', error.message);
    } else {
      console.log(`✅ content: ${count || 0} kayıt`);
    }
  } catch (err) {
    console.log('❌ content:', err.message);
  }

  // User Profiles
  try {
    const { data: profiles, error } = await supabase
      .from('user_profiles')
      .select('*');
    
    if (error) {
      console.log('❌ user_profiles:', error.message);
    } else {
      console.log(`✅ user_profiles: ${profiles?.length || 0} kayıt`);
      if (profiles && profiles.length > 0) {
        console.log('\n   Kullanıcılar:');
        profiles.forEach((p, i) => {
          console.log(`   ${i + 1}. ${p.display_name || 'İsimsiz'} (${p.role}) - ${p.id.substring(0, 8)}...`);
        });
      }
    }
  } catch (err) {
    console.log('❌ user_profiles:', err.message);
  }

  // Ratings
  try {
    const { count, error } = await supabase
      .from('ratings')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ ratings:', error.message);
    } else {
      console.log(`✅ ratings: ${count || 0} kayıt`);
    }
  } catch (err) {
    console.log('❌ ratings:', err.message);
  }

  // Content Analytics
  try {
    const { count, error } = await supabase
      .from('content_analytics')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ content_analytics:', error.message);
    } else {
      console.log(`✅ content_analytics: ${count || 0} kayıt`);
    }
  } catch (err) {
    console.log('❌ content_analytics:', err.message);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔧 FONKSİYONLAR:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Test increment_play_count
  try {
    // Test with a dummy UUID (should fail gracefully)
    const { error } = await supabase.rpc('increment_play_count', {
      content_id: '00000000-0000-0000-0000-000000000000'
    });
    if (error && error.message.includes('does not exist')) {
      console.log('❌ increment_play_count: Fonksiyon bulunamadı');
    } else {
      console.log('✅ increment_play_count: Mevcut');
    }
  } catch (err) {
    console.log('⚠️  increment_play_count: Test edilemedi');
  }

  // Test ensure_user_profile
  try {
    const { error } = await supabase.rpc('ensure_user_profile', {
      user_uuid: '00000000-0000-0000-0000-000000000000',
      display_name: 'Test'
    });
    if (error && error.message.includes('does not exist')) {
      console.log('❌ ensure_user_profile: Fonksiyon bulunamadı');
    } else {
      console.log('✅ ensure_user_profile: Mevcut');
    }
  } catch (err) {
    console.log('⚠️  ensure_user_profile: Test edilemedi');
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 ÖZET:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Auth users kontrolü (Supabase auth tablosu)
  try {
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) {
      console.log('⚠️  Auth users kontrol edilemedi (anon key ile erişim yok)');
    } else {
      console.log(`📧 Auth kullanıcıları: ${users?.length || 0} kayıt`);
      if (users && users.length > 0) {
        console.log('\n   Auth Kullanıcıları:');
        users.forEach((u, i) => {
          console.log(`   ${i + 1}. ${u.email} - ${u.id.substring(0, 8)}...`);
          
          // Profile var mı kontrol et
          supabase
            .from('user_profiles')
            .select('*')
            .eq('id', u.id)
            .maybeSingle()
            .then(({ data: profile }) => {
              if (!profile) {
                console.log(`      ⚠️  Profile eksik!`);
              }
            });
        });
      }
    }
  } catch (err) {
    console.log('⚠️  Auth users kontrol edilemedi (normal - anon key ile erişim yok)');
  }

  console.log('\n✅ Kontrol tamamlandı!');
}

checkDatabase().catch(err => {
  console.error('❌ Hata:', err.message);
  process.exit(1);
});

