const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
let url, anonKey;

envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
    url = trimmed.substring('NEXT_PUBLIC_SUPABASE_URL='.length).trim();
  }
  if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
    anonKey = trimmed.substring('NEXT_PUBLIC_SUPABASE_ANON_KEY='.length).trim();
  }
});

const supabase = createClient(url, anonKey);

supabase
  .from('categories')
  .select('id, slug, name')
  .eq('published', true)
  .limit(10)
  .then(({ data, error }) => {
    if (error) {
      console.error('Hata:', error.message);
      return;
    }
    console.log('Kategori ID\'leri:');
    data.forEach(c => {
      console.log(`  ${c.name} (${c.slug}): ${c.id}`);
    });
    console.log('\nİlk kategori ID (kullanılacak):', data[0].id);
  });

