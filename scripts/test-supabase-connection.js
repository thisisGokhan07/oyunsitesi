const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf-8');
let SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY;

envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
    SUPABASE_URL = trimmed.substring('NEXT_PUBLIC_SUPABASE_URL='.length).trim();
  }
  if (trimmed.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
    SUPABASE_SERVICE_ROLE_KEY = trimmed.substring('SUPABASE_SERVICE_ROLE_KEY='.length).trim();
  }
});

console.log('URL:', SUPABASE_URL ? '✅' : '❌');
console.log('KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✅ (' + SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...)' : '❌');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Test read
supabase.from('categories').select('id').limit(1).then(({ data, error }) => {
  if (error) {
    console.error('❌ Read hatası:', error.message);
    console.error('Code:', error.code);
  } else {
    console.log('✅ Read başarılı!');
  }
  
  // Test insert
  supabase.from('categories').insert({
    name: 'Test Category',
    slug: 'test-category-' + Date.now(),
    description: 'Test',
    age_group: 'family',
    icon_name: 'Test',
    color_hex: '#000000',
    content_count: 0,
    sort_order: 0,
    published: false,
  }).then(({ data: insertData, error: insertError }) => {
    if (insertError) {
      console.error('❌ Insert hatası:', insertError.message);
      console.error('Code:', insertError.code);
    } else {
      console.log('✅ Insert başarılı!');
    }
  });
});

