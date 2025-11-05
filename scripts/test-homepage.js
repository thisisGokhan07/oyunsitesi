/**
 * Homepage'i test eder ve içerik sayısını kontrol eder
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
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Supabase environment variables bulunamadı!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testHomepage() {
  console.log('\n🧪 Homepage Test Ediliyor...\n');

  try {
    // getAllContent() fonksiyonunu simüle et
    const { data: content, error: contentError } = await supabase
      .from('content')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (contentError) {
      console.error('❌ Content fetch hatası:', contentError.message);
      return;
    }

    console.log(`✅ ${content.length} oyun bulundu\n`);

    // Popular content (play_count'a göre)
    const popularContent = [...content]
      .filter(c => c && (c.play_count || 0) >= 0)
      .sort((a, b) => (b.play_count || 0) - (a.play_count || 0))
      .slice(0, 16);

    console.log(`🔥 Popüler Oyunlar (${popularContent.length}):`);
    popularContent.slice(0, 5).forEach((game, i) => {
      console.log(`   ${i + 1}. ${game.title} (${game.play_count || 0} görüntülenme)`);
    });
    console.log('');

    // New content (created_at'e göre)
    const newContent = [...content]
      .filter(c => c && c.created_at)
      .sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 16);

    console.log(`🆕 Yeni Eklenenler (${newContent.length}):`);
    newContent.slice(0, 5).forEach((game, i) => {
      console.log(`   ${i + 1}. ${game.title} (${game.created_at ? new Date(game.created_at).toLocaleDateString('tr-TR') : 'Tarih yok'})`);
    });
    console.log('');

    // Sonuç
    if (popularContent.length < 2) {
      console.log('⚠️  UYARI: Popüler oyunlar bölümünde sadece', popularContent.length, 'oyun var!');
    }
    if (newContent.length < 2) {
      console.log('⚠️  UYARI: Yeni eklenenler bölümünde sadece', newContent.length, 'oyun var!');
    }

    if (popularContent.length >= 2 && newContent.length >= 2) {
      console.log('✅ Test başarılı! Her iki bölümde de yeterli oyun var.');
    }

  } catch (error) {
    console.error('❌ Test hatası:', error.message);
  }
}

testHomepage().catch(console.error);

