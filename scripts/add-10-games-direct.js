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
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Supabase credentials eksik!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 10 rastgele oyun
const games = [
  {
    title: 'Bubble Shooter Classic',
    slug: 'bubble-shooter-classic',
    description: 'Renkli balonları patlat ve en yüksek skoru yap! Klasik balon patlatma oyunu.',
    category: 'puzzle',
    thumbnail: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=500',
    url: 'https://html5.gamedistribution.com/games/bubble-shooter/',
  },
  {
    title: 'Solitaire Cards',
    slug: 'solitaire-cards',
    description: 'Klasik solitaire oyunu. Kartları düzenle ve kazan!',
    category: 'puzzle',
    thumbnail: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=500',
    url: 'https://html5.gamedistribution.com/games/solitaire/',
  },
  {
    title: 'Mahjong Tiles',
    slug: 'mahjong-tiles',
    description: 'Eski Çin oyunu. Eşleşen taşları bul ve kazan!',
    category: 'puzzle',
    thumbnail: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=500',
    url: 'https://html5.gamedistribution.com/games/mahjong/',
  },
  {
    title: 'Snake Adventure',
    slug: 'snake-adventure',
    description: 'Yılanı kontrol et ve yemekleri topla! Ne kadar uzun olabilirsin?',
    category: 'arcade',
    thumbnail: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=500',
    url: 'https://html5.gamedistribution.com/games/snake/',
  },
  {
    title: 'Tetris Blocks',
    slug: 'tetris-blocks',
    description: 'Klasik blok düşürme oyunu. Satırları tamamla ve puan kazan!',
    category: 'puzzle',
    thumbnail: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=500',
    url: 'https://html5.gamedistribution.com/games/tetris/',
  },
  {
    title: 'Pacman Classic',
    slug: 'pacman-classic',
    description: 'Hayaletlerden kaç ve noktaları topla! Klasik arcade oyunu.',
    category: 'arcade',
    thumbnail: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=500',
    url: 'https://html5.gamedistribution.com/games/pacman/',
  },
  {
    title: 'Chess Master',
    slug: 'chess-master',
    description: 'Satranç oyna ve stratejinizi geliştir! Zihin geliştirici oyun.',
    category: 'strategy',
    thumbnail: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=500',
    url: 'https://html5.gamedistribution.com/games/chess/',
  },
  {
    title: 'Word Search Puzzle',
    slug: 'word-search-puzzle',
    description: 'Kelime bulmaca. Kelimeleri bul ve işaretle!',
    category: 'educational',
    thumbnail: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=500',
    url: 'https://html5.gamedistribution.com/games/word-search/',
  },
  {
    title: 'Memory Cards',
    slug: 'memory-cards',
    description: 'Hafıza oyunu. Eşleşen kartları bul!',
    category: 'educational',
    thumbnail: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=500',
    url: 'https://html5.gamedistribution.com/games/memory-match/',
  },
  {
    title: 'Racing Speed',
    slug: 'racing-speed',
    description: 'Hızlı araba yarışı! En yüksek hızı yap ve kazan!',
    category: 'racing',
    thumbnail: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=500',
    url: 'https://html5.gamedistribution.com/games/racing/',
  },
];

async function getCategoryId(categorySlug) {
  const { data, error } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .eq('published', true)
    .maybeSingle();

  if (error) {
    console.error(`Kategori hatası (${categorySlug}):`, error.message);
    return null;
  }

  if (data) {
    return data.id;
  }

  // Kategori bulunamazsa, ilk kategoriyi kullan
  const { data: firstCategory } = await supabase
    .from('categories')
    .select('id')
    .eq('published', true)
    .limit(1)
    .single();

  return firstCategory?.id || null;
}

async function addGames() {
  console.log('🎮 10 oyun ekleniyor...\n');

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const game of games) {
    try {
      // Zaten var mı kontrol et
      const { data: existing } = await supabase
        .from('content')
        .select('id')
        .eq('slug', game.slug)
        .maybeSingle();

      if (existing) {
        console.log(`⏭️  Atlandı: ${game.title} (zaten var)`);
        skipCount++;
        continue;
      }

      // Kategori ID al
      const categoryId = await getCategoryId(game.category);
      if (!categoryId) {
        console.log(`⚠️  Kategori bulunamadı: ${game.title}`);
        errorCount++;
        continue;
      }

      // Oyunu ekle
      const { error: insertError } = await supabase
        .from('content')
        .insert({
          title: game.title,
          slug: game.slug,
          description: game.description,
          instructions: 'Oyunu oynamak için fare veya dokunmatik ekranı kullanın.',
          content_type: 'game',
          age_group: game.category === 'educational' ? 'baby' : game.category === 'strategy' ? 'adult' : 'child',
          category_id: categoryId,
          thumbnail_url: game.thumbnail,
          content_url: game.url,
          duration_minutes: 15,
          is_premium: false,
          is_featured: false,
          published: true,
          meta_title: `${game.title} - Ücretsiz Online Oyun`,
          meta_description: game.description,
          keywords: [game.category],
        });

      if (insertError) {
        console.error(`❌ Hata (${game.title}):`, insertError.message);
        errorCount++;
      } else {
        console.log(`✅ Eklendi: ${game.title}`);
        successCount++;
      }
    } catch (error) {
      console.error(`❌ Oyun hatası (${game.title}):`, error.message);
      errorCount++;
    }
  }

  console.log(`\n📊 Sonuç:`);
  console.log(`   ✅ Başarılı: ${successCount}`);
  console.log(`   ⏭️  Atlanan: ${skipCount}`);
  console.log(`   ❌ Hatalı: ${errorCount}`);
  console.log(`   📦 Toplam: ${games.length}`);
}

addGames();

