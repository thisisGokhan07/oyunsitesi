/**
 * Veritabanındaki oyunların detaylarını kontrol eder
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

async function checkContentDetails() {
  console.log('\n🔍 Oyun detayları kontrol ediliyor...\n');

  // Tüm yayınlanmış oyunları çek
  const { data: games, error } = await supabaseAdmin
    .from('content')
    .select('id, title, slug, published, play_count, created_at, age_group, content_type')
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Hata:', error.message);
    return;
  }

  console.log(`📊 Toplam ${games.length} yayınlanmış oyun:\n`);

  // Play count'a göre sırala
  const sortedByPlayCount = [...games].sort((a, b) => (b.play_count || 0) - (a.play_count || 0));
  console.log('🔥 Play Count\'a göre sıralama:');
  sortedByPlayCount.slice(0, 5).forEach((game, index) => {
    console.log(`${index + 1}. ${game.title} - ${game.play_count || 0} görüntülenme`);
  });
  console.log('');

  // Created_at'e göre sırala
  const sortedByDate = [...games].sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dateB - dateA;
  });
  console.log('🆕 Tarihe göre sıralama (Yeni → Eski):');
  sortedByDate.slice(0, 5).forEach((game, index) => {
    console.log(`${index + 1}. ${game.title} - ${game.created_at || 'Tarih yok'}`);
  });
  console.log('');

  // Tüm oyunların listesi
  console.log('📋 Tüm oyunlar:');
  games.forEach((game, index) => {
    console.log(`${index + 1}. ${game.title}`);
    console.log(`   Play Count: ${game.play_count || 0}`);
    console.log(`   Created: ${game.created_at || 'Yok'}`);
    console.log(`   Age Group: ${game.age_group || 'Yok'}`);
    console.log(`   Type: ${game.content_type || 'Yok'}`);
    console.log('');
  });
}

checkContentDetails().catch(console.error);

