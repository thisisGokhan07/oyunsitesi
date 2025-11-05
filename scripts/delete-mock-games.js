/**
 * Mock data oyunlarını veritabanından siler
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

async function deleteMockGames() {
  console.log('\n🗑️  Mock data oyunları siliniyor...\n');

  // Mock data oyunlarının slug'ları
  const mockSlugs = ['subway-surfers', 'renkli-balonlar'];

  for (const slug of mockSlugs) {
    const { data, error } = await supabaseAdmin
      .from('content')
      .delete()
      .eq('slug', slug)
      .select('id, title');

    if (error) {
      console.error(`❌ ${slug} silinemedi:`, error.message);
    } else if (data && data.length > 0) {
      console.log(`✅ Silindi: ${data[0].title} (${slug})`);
    } else {
      console.log(`ℹ️  Bulunamadı: ${slug}`);
    }
  }

  console.log('\n✅ İşlem tamamlandı!');
}

deleteMockGames().catch(console.error);

