const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
try {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const match = trimmedLine.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          let value = match[2].trim();
          // Remove quotes if present
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          process.env[key] = value;
        }
      }
    });
  }
} catch (error) {
  console.warn('⚠️  .env.local okunamadı:', error.message);
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Debug removed for cleaner output

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Supabase credentials eksik!');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const categoryMapping = {
  'action': 'child',
  'adventure': 'child',
  'arcade': 'child',
  'puzzle': 'child',
  'racing': 'child',
  'sports': 'child',
  'strategy': 'adult',
  'casual': 'family',
  'educational': 'baby',
  'kids': 'baby',
};

async function getOrCreateCategory(categoryName) {
  const categorySlug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, '');
  
  // Önce mevcut kategorileri kontrol et
  const { data: existing } = await supabaseAdmin
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .maybeSingle();

  if (existing) {
    return existing.id;
  }

  // Mevcut kategorilerden birini kullan (puzzle, arcade, vs.)
  const { data: allCategories } = await supabaseAdmin
    .from('categories')
    .select('id, slug')
    .eq('published', true)
    .limit(10);

  if (allCategories && allCategories.length > 0) {
    // En yakın kategoriyi bul
    const matching = allCategories.find(c => c.slug.includes(categorySlug) || categorySlug.includes(c.slug));
    if (matching) return matching.id;
    
    // İlk kategoriyi kullan
    return allCategories[0].id;
  }

  // Hiç kategori yoksa, direkt insert dene (anon key ile)
  const ageGroup = categoryMapping[categorySlug] || 'family';
  const { data: newCategory, error } = await supabaseAdmin
    .from('categories')
    .insert({
      name: categoryName.charAt(0).toUpperCase() + categoryName.slice(1),
      slug: categorySlug,
      description: `${categoryName} oyunları`,
      age_group: ageGroup,
      icon_name: 'Gamepad2',
      color_hex: '#f97316',
      content_count: 0,
      sort_order: 0,
      published: true,
    })
    .select('id')
    .single();

  if (error) {
    console.error(`❌ Kategori hatası (${categoryName}):`, error.message);
    // Fallback: İlk kategoriyi döndür
    return null;
  }

  return newCategory.id;
}

// GameMonetize.com'dan oyun çekme
async function fetchGamesFromGameMonetize() {
  try {
    console.log('🎮 GameMonetize.com\'dan oyunlar çekiliyor...');
    
    // GameMonetize API endpoint
    const response = await fetch('https://api.gamemonetize.com/api/v2/games', {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    const games = data.games || data.data || [];

    if (games.length === 0) {
      console.log('⚠️  GameMonetize\'den oyun bulunamadı');
      return [];
    }

    // Rastgele 5 oyun seç
    const shuffled = games.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 5);
  } catch (error) {
    console.error('❌ GameMonetize API hatası:', error.message);
    return [];
  }
}

// itch.io'dan oyun çekme (Public API yok, örnek oyunlar)
async function fetchGamesFromItch() {
  // itch.io public API yok, bu yüzden manuel örnek oyunlar
  const itchGames = [
    {
      title: 'Bubble Shooter',
      description: 'Balonları patlat ve en yüksek skoru yap!',
      category: 'puzzle',
      thumbnail: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=500',
      url: 'https://kennymakesgames.itch.io/pin',
      embedUrl: 'https://kennymakesgames.itch.io/pin',
    },
    {
      title: 'Solitaire',
      description: 'Klasik solitaire oyunu. Kartları düzenle ve kazan!',
      category: 'puzzle',
      thumbnail: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=500',
      url: 'https://itch.io/games/free',
      embedUrl: 'https://itch.io/games/free',
    },
    {
      title: 'Mahjong',
      description: 'Eski Çin oyunu. Eşleşen taşları bul ve kazan!',
      category: 'puzzle',
      thumbnail: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=500',
      url: 'https://itch.io/games/browser',
      embedUrl: 'https://itch.io/games/browser',
    },
    {
      title: 'Snake',
      description: 'Yılanı kontrol et ve yemekleri topla!',
      category: 'arcade',
      thumbnail: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=500',
      url: 'https://itch.io/games/arcade',
      embedUrl: 'https://itch.io/games/arcade',
    },
    {
      title: 'Tetris',
      description: 'Klasik blok düşürme oyunu. Satırları tamamla!',
      category: 'puzzle',
      thumbnail: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=500',
      url: 'https://itch.io/games/puzzle',
      embedUrl: 'https://itch.io/games/puzzle',
    },
  ];

  return itchGames;
}

async function addGame(game, source) {
  try {
    const slug = game.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, '');

    // Zaten var mı?
    const { data: existing } = await supabaseAdmin
      .from('content')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existing) {
      return { status: 'skipped', message: 'Zaten var' };
    }

    // Kategori ID
    const categoryId = await getOrCreateCategory(game.category || 'casual');
    if (!categoryId) {
      return { status: 'error', message: 'Kategori bulunamadı' };
    }

    // Oyunu ekle
    const { error: insertError } = await supabaseAdmin
      .from('content')
      .insert({
        title: game.title,
        slug: slug,
        description: game.description || `${game.title} oyunu.`,
        instructions: 'Oyunu oynamak için fare veya dokunmatik ekranı kullanın.',
        content_type: 'game',
        age_group: categoryMapping[game.category] || 'child',
        category_id: categoryId,
        thumbnail_url: game.thumbnail || game.thumb || 'https://via.placeholder.com/500x300',
        content_url: game.embedUrl || game.url || game.game_link || '',
        duration_minutes: game.duration || 15,
        is_premium: false,
        is_featured: false,
        published: true,
        meta_title: `${game.title} - Ücretsiz Online Oyun`,
        meta_description: game.description || `${game.title} oyna. Eğlenceli ve ücretsiz oyunlar.`,
        keywords: [game.category || 'casual'],
      });

    if (insertError) {
      return { status: 'error', message: insertError.message };
    }

    return { status: 'success', message: 'Eklendi' };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}

async function main() {
  console.log('🎮 10 rastgele oyun çekiliyor (itch.io + GameMonetize)...\n');

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  // GameMonetize'den 5 oyun çek
  const gameMonetizeGames = await fetchGamesFromGameMonetize();
  console.log(`✅ GameMonetize: ${gameMonetizeGames.length} oyun bulundu\n`);

  for (const game of gameMonetizeGames) {
    const result = await addGame(game, 'GameMonetize');
    if (result.status === 'success') {
      console.log(`✅ [GameMonetize] ${game.title || game.name}`);
      successCount++;
    } else if (result.status === 'skipped') {
      console.log(`⏭️  [GameMonetize] ${game.title || game.name} (${result.message})`);
      skipCount++;
    } else {
      console.log(`❌ [GameMonetize] ${game.title || game.name}: ${result.message}`);
      errorCount++;
    }
  }

  // itch.io'dan 5 oyun ekle
  const itchGames = await fetchGamesFromItch();
  console.log(`\n✅ itch.io: ${itchGames.length} oyun bulundu\n`);

  for (const game of itchGames) {
    const result = await addGame(game, 'itch.io');
    if (result.status === 'success') {
      console.log(`✅ [itch.io] ${game.title}`);
      successCount++;
    } else if (result.status === 'skipped') {
      console.log(`⏭️  [itch.io] ${game.title} (${result.message})`);
      skipCount++;
    } else {
      console.log(`❌ [itch.io] ${game.title}: ${result.message}`);
      errorCount++;
    }
  }

  console.log(`\n📊 Sonuç:`);
  console.log(`   ✅ Başarılı: ${successCount}`);
  console.log(`   ⏭️  Atlanan: ${skipCount}`);
  console.log(`   ❌ Hatalı: ${errorCount}`);
  console.log(`   📦 Toplam: ${successCount + skipCount + errorCount}`);
}

main();

