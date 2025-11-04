const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
  },
});

async function runMigration(filename) {
  const filePath = path.join(__dirname, '..', 'supabase', 'migrations', filename);
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Migration file not found: ${filename}`);
    return false;
  }

  const sql = fs.readFileSync(filePath, 'utf-8');
  
  console.log(`\n🔄 Running migration: ${filename}`);
  
  try {
    // Supabase'de SQL çalıştırmak için RPC kullanıyoruz
    // Alternatif olarak doğrudan SQL çalıştırabiliriz
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      // Eğer exec_sql fonksiyonu yoksa, manual olarak SQL'i parçalara ayırıp çalıştıralım
      console.log('⚠️  exec_sql RPC not found, trying alternative method...');
      
      // SQL'i statement'lara ayır
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));
      
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            // Her statement'ı ayrı ayrı çalıştır
            const { error: stmtError } = await supabase.rpc('exec_sql', { sql_query: statement + ';' });
            if (stmtError && !stmtError.message.includes('already exists') && !stmtError.message.includes('duplicate')) {
              console.warn(`⚠️  Statement warning: ${stmtError.message}`);
            }
          } catch (e) {
            // Ignore duplicate/exists errors
            if (!e.message?.includes('already exists') && !e.message?.includes('duplicate')) {
              console.warn(`⚠️  Statement warning: ${e.message}`);
            }
          }
        }
      }
    }
    
    console.log(`✅ Migration completed: ${filename}`);
    return true;
  } catch (error) {
    console.error(`❌ Migration failed: ${filename}`);
    console.error(`Error: ${error.message}`);
    
    // Migration'ları Supabase Dashboard'dan manuel çalıştırmak gerekebilir
    console.log(`\n💡 TIP: Supabase Dashboard > SQL Editor'den migration'ı manuel çalıştırın:`);
    console.log(`   File: ${filePath}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting migration process...\n');
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  
  // Yeni migration'ları çalıştır
  const migrations = [
    '00012_game_providers.sql',
    '00013_ad_placements.sql',
  ];
  
  let successCount = 0;
  let failCount = 0;
  
  for (const migration of migrations) {
    const success = await runMigration(migration);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    
    // Kısa bir bekleme
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n📊 Migration Summary:');
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  
  if (failCount > 0) {
    console.log('\n⚠️  Some migrations failed. Please run them manually from Supabase Dashboard:');
    console.log('   1. Go to: https://supabase.com/dashboard');
    console.log('   2. Select your project');
    console.log('   3. Go to SQL Editor');
    console.log('   4. Copy and paste the migration SQL');
    console.log('   5. Run the query');
  } else {
    console.log('\n🎉 All migrations completed successfully!');
  }
}

main().catch(console.error);

