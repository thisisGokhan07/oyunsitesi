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

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  console.error('\n💡 .env.local dosyasını kontrol edin.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
  },
});

async function checkTableExists(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    // Eğer tablo yoksa error gelir, ama bazı durumlarda boş array döner
    if (error) {
      // Tablo yoksa veya erişim yoksa
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        return false;
      }
      // RLS hatası olabilir, tablo var demektir
      if (error.code === '42501' || error.message.includes('permission denied')) {
        return true; // Tablo var ama erişim yok
      }
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
}

async function checkMigrationStatus() {
  console.log('🔍 Migration durumu kontrol ediliyor...\n');
  
  const migrations = [
    {
      name: '00012_game_providers.sql',
      tables: ['game_providers'],
      description: 'Oyun Sağlayıcıları Tablosu',
    },
    {
      name: '00013_ad_placements.sql',
      tables: ['ad_placements', 'ad_analytics'],
      description: 'Reklam Yerleri ve Analytics Tabloları',
    },
  ];
  
  const results = [];
  
  for (const migration of migrations) {
    console.log(`📋 ${migration.name}: ${migration.description}`);
    
    const tableChecks = await Promise.all(
      migration.tables.map(async (table) => {
        const exists = await checkTableExists(table);
        return { table, exists };
      })
    );
    
    const allExist = tableChecks.every(check => check.exists);
    const status = allExist ? '✅' : '❌';
    
    tableChecks.forEach(({ table, exists }) => {
      console.log(`   ${exists ? '✅' : '❌'} ${table}`);
    });
    
    results.push({
      migration,
      status: allExist,
      tableChecks,
    });
    
    console.log('');
  }
  
  return results;
}

async function generateMigrationSQL() {
  const migrations = [
    '00012_game_providers.sql',
    '00013_ad_placements.sql',
  ];
  
  let combinedSQL = '-- Combined Migration SQL\n';
  combinedSQL += '-- Generated automatically\n';
  combinedSQL += '-- Run this in Supabase Dashboard > SQL Editor\n\n';
  
  for (const filename of migrations) {
    const filePath = path.join(__dirname, '..', 'supabase', 'migrations', filename);
    
    if (fs.existsSync(filePath)) {
      const sql = fs.readFileSync(filePath, 'utf-8');
      combinedSQL += `-- ============================================\n`;
      combinedSQL += `-- Migration: ${filename}\n`;
      combinedSQL += `-- ============================================\n\n`;
      combinedSQL += sql;
      combinedSQL += `\n\n`;
    }
  }
  
  // Combined SQL dosyasına kaydet
  const outputPath = path.join(__dirname, '..', 'MIGRATION_COMBINED.sql');
  fs.writeFileSync(outputPath, combinedSQL, 'utf-8');
  
  console.log(`✅ Combined migration SQL oluşturuldu: ${outputPath}`);
  return outputPath;
}

async function main() {
  console.log('🚀 Migration Kontrol ve Çalıştırma Script\n');
  console.log(`Supabase URL: ${SUPABASE_URL.substring(0, 30)}...\n`);
  
  // Migration durumunu kontrol et
  const results = await checkMigrationStatus();
  
  const missingMigrations = results.filter(r => !r.status);
  
  if (missingMigrations.length === 0) {
    console.log('✅ Tüm migration\'lar çalıştırılmış!\n');
    return;
  }
  
  console.log(`⚠️  ${missingMigrations.length} migration çalıştırılmamış:\n`);
  
  missingMigrations.forEach(({ migration }) => {
    console.log(`   ❌ ${migration.name}`);
  });
  
  console.log('\n📝 Combined migration SQL oluşturuluyor...\n');
  const combinedPath = await generateMigrationSQL();
  
  console.log('\n💡 YAPILACAKLAR:');
  console.log('1. Supabase Dashboard\'a gidin: https://supabase.com/dashboard');
  console.log('2. Projenizi seçin');
  console.log('3. SQL Editor > New Query');
  console.log(`4. ${combinedPath} dosyasını açın ve içeriğini kopyalayın`);
  console.log('5. SQL Editor\'e yapıştırın ve Run butonuna tıklayın');
  console.log('\nVEYA');
  console.log('Her migration\'ı ayrı ayrı çalıştırın:');
  missingMigrations.forEach(({ migration }) => {
    const filePath = path.join(__dirname, '..', 'supabase', 'migrations', migration.name);
    console.log(`   - ${filePath}`);
  });
  
  console.log('\n✅ Migration\'lar çalıştırıldıktan sonra bu script\'i tekrar çalıştırın.');
}

main().catch(console.error);

