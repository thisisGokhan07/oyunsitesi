// Supabase Tablolarını Kontrol Et
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

console.log('🔍 Supabase Tablo Kontrolü\n');
console.log('URL:', supabaseUrl ? '✅ Tanımlı' : '❌ Eksik');
console.log('Key:', supabaseKey ? '✅ Tanımlı' : '❌ Eksik\n');

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Environment değişkenleri eksik!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Gerekli tablolar
const requiredTables = [
  'categories',
  'content',
  'user_profiles',
  'ratings',
  'content_analytics'
];

// Gerekli fonksiyonlar
const requiredFunctions = [
  'increment_play_count',
  'update_category_count',
  'update_content_rating'
];

async function checkTables() {
  console.log('📊 Tablolar Kontrol Ediliyor...\n');
  
  const results = {
    tables: {},
    functions: {},
    errors: []
  };

  // Tabloları kontrol et
  for (const tableName of requiredTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (error && error.code === 'PGRST116') {
        results.tables[tableName] = { exists: false, error: 'Tablo bulunamadı' };
      } else if (error) {
        results.tables[tableName] = { exists: false, error: error.message };
        results.errors.push(`${tableName}: ${error.message}`);
      } else {
        results.tables[tableName] = { exists: true };
      }
    } catch (err) {
      results.tables[tableName] = { exists: false, error: err.message };
      results.errors.push(`${tableName}: ${err.message}`);
    }
  }

  // Fonksiyonları kontrol et
  console.log('🔧 Fonksiyonlar Kontrol Ediliyor...\n');
  
  for (const funcName of requiredFunctions) {
    try {
      // increment_play_count fonksiyonunu test et
      if (funcName === 'increment_play_count') {
        // Test için geçersiz bir ID ile çağır (sadece fonksiyonun varlığını kontrol etmek için)
        const { error } = await supabase.rpc(funcName, { content_id: '00000000-0000-0000-0000-000000000000' });
        if (error && error.message.includes('function') && error.message.includes('does not exist')) {
          results.functions[funcName] = { exists: false, error: 'Fonksiyon bulunamadı' };
        } else {
          results.functions[funcName] = { exists: true };
        }
      } else {
        // Diğer fonksiyonlar için genel kontrol
        results.functions[funcName] = { exists: null, note: 'Manuel kontrol gerekli' };
      }
    } catch (err) {
      results.functions[funcName] = { exists: false, error: err.message };
      results.errors.push(`${funcName}: ${err.message}`);
    }
  }

  // Sonuçları göster
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 TABLO DURUMU:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let allTablesExist = true;
  for (const [tableName, result] of Object.entries(results.tables)) {
    if (result.exists) {
      console.log(`✅ ${tableName}: Mevcut`);
    } else {
      console.log(`❌ ${tableName}: Eksik - ${result.error || 'Bilinmeyen hata'}`);
      allTablesExist = false;
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔧 FONKSİYON DURUMU:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  for (const [funcName, result] of Object.entries(results.functions)) {
    if (result.exists === true) {
      console.log(`✅ ${funcName}: Mevcut`);
    } else if (result.exists === false) {
      console.log(`❌ ${funcName}: Eksik - ${result.error || 'Bilinmeyen hata'}`);
    } else {
      console.log(`⚠️  ${funcName}: ${result.note || 'Kontrol edilemedi'}`);
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 ÖZET:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const existingTables = Object.values(results.tables).filter(t => t.exists).length;
  const totalTables = requiredTables.length;
  
  console.log(`Tablolar: ${existingTables}/${totalTables} mevcut`);
  
  if (allTablesExist) {
    console.log('\n✅ Tüm tablolar mevcut! Migration\'lar başarıyla çalıştırılmış.');
  } else {
    console.log('\n❌ Bazı tablolar eksik! Migration\'ları çalıştırmanız gerekiyor.');
    console.log('\n💡 Yapılacaklar:');
    console.log('1. Supabase Dashboard > SQL Editor');
    console.log('2. supabase/migrations/00001_initial_schema.sql dosyasını çalıştırın');
    console.log('3. supabase/migrations/00002_create_test_admin.sql dosyasını çalıştırın');
    console.log('\nDetaylı talimatlar: MIGRATION_TALIMATLARI.md');
  }

  if (results.errors.length > 0) {
    console.log('\n⚠️  Hatalar:');
    results.errors.forEach(err => console.log(`   - ${err}`));
  }

  process.exit(allTablesExist ? 0 : 1);
}

checkTables().catch(err => {
  console.error('❌ Hata:', err.message);
  process.exit(1);
});

