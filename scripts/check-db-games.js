/**
 * Veritabanındaki oyunları kontrol eder
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// .env.local dosyasını oku
function loadEnv() {
  try {
    const envPath = path.join(__dirname, '..', '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      envContent.split('\n').forEach(line => {
        line = line.trim();
        if (!line || line.startsWith('#')) return;
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
        }
      });
    }
  } catch (error) {
    console.error('Env load error:', error);
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Supabase environment variables bulunamadı!');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkGames() {
  console.log('\n🔍 Veritabanındaki oyunlar kontrol ediliyor...\n');

  // Tüm yayınlanmış oyunları çek
  const { data: games, error } = await supabaseAdmin
    .from('content')
    .select('id, title, slug, published, content_url')
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Hata:', error.message);
    return;
  }

  console.log(`📊 Toplam ${games.length} yayınlanmış oyun bulundu:\n`);

  games.forEach((game, index) => {
    console.log(`${index + 1}. ${game.title}`);
    console.log(`   Slug: ${game.slug}`);
    console.log(`   URL: ${game.content_url}`);
    console.log('');
  });

  // Subway Surfers ve Renkli Balonlar kontrolü
  const subwaySurfers = games.find(g => g.slug === 'subway-surfers' || g.title.includes('Subway Surfers'));
  const renkliBalonlar = games.find(g => g.slug === 'renkli-balonlar' || g.title.includes('Renkli Balonlar'));

  if (subwaySurfers) {
    console.log('⚠️  Subway Surfers bulundu!');
    console.log(`   ID: ${subwaySurfers.id}`);
    console.log(`   URL: ${subwaySurfers.content_url}`);
    console.log('');
  }

  if (renkliBalonlar) {
    console.log('⚠️  Renkli Balonlar bulundu!');
    console.log(`   ID: ${renkliBalonlar.id}`);
    console.log(`   URL: ${renkliBalonlar.content_url}`);
    console.log('');
  }

  if (subwaySurfers || renkliBalonlar) {
    console.log('💡 Bu oyunları silmek için:');
    console.log('   node scripts/delete-mock-games.js');
  }
}

checkGames().catch(console.error);

