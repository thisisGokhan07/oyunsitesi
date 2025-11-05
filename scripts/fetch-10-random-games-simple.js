const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
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
  console.warn('⚠️  .env.local okunamadı:', error.message);
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Supabase credentials eksik!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Basit oyun verileri - GameDistribution API olmadan
const sampleGames = [
  {
    title: 'Bubble Shooter',
    description: 'Balonları patlat ve en yüksek skoru yap!',
    category: 'puzzle',
    thumbnail: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=500',
    url: 'https://html5.gamedistribution.com/games/bubble-shooter/',
  },
  {
    title: 'Solitaire',
    description: 'Klasik solitaire oyunu. Kartları düzenle ve kazan!',
    category: 'puzzle',
    thumbnail: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=500',
    url: 'https://html5.gamedistribution.com/games/solitaire/',
  },
  {
    title: 'Mahjong',
    description: 'Eski Çin oyunu. Eşleşen taşları bul ve kazan!',
    category: 'puzzle',
    thumbnail: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=500',
    url: 'https://html5.gamedistribution.com/games/mahjong/',
  },
  {
    title: 'Snake',
    description: 'Yılanı kontrol et ve yemekleri topla!',
    category: 'arcade',
    thumbnail: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=500',
    url: 'https://html5.gamedistribution.com/games/snake/',
  },
  {
    title: 'Tetris',
    description: 'Klasik blok düşürme oyunu. Satırları tamamla!',
    category: 'puzzle',
    thumbnail: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=500',
    url: 'https://html5.gamedistribution.com/games/tetris/',
  },
  {
    title: 'Pacman',
    description: 'Hayaletlerden kaç ve noktaları topla!',
    category: 'arcade',
    thumbnail: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=500',
    url: 'https://html5.gamedistribution.com/games/pacman/',
  },
  {
    title: 'Chess',
    description: 'Satranç oyna ve stratejinizi geliştir!',
    category: 'strategy',
    thumbnail: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=500',
    url: 'https://html5.gamedistribution.com/games/chess/',
  },
  {
    title: 'Checkers',
    description: 'Dama oyunu. Rakibin taşlarını al!',
    category: 'strategy',
    thumbnail: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=500',
    url: 'https://html5.gamedistribution.com/games/checkers/',
  },
  {
    title: 'Word Search',
    description: 'Kelime bulmaca. Kelimeleri bul ve işaretle!',
    category: 'educational',
    thumbnail: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=500',
    url: 'https://html5.gamedistribution.com/games/word-search/',
  },
  {
    title: 'Memory Match',
    description: 'Hafıza oyunu. Eşleşen kartları bul!',
    category: 'educational',
    thumbnail: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=500',
    url: 'https://html5.gamedistribution.com/games/memory-match/',
  },
];

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
  
  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .maybeSingle();

  if (existing) {
    return existing.id;
  }

  const ageGroup = categoryMapping[categorySlug] || 'family';
  const { data: newCategory, error } = await supabase
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
    return null;
  }

  return newCategory.id;
}

async function addGames() {
  console.log('🎮 10 rastgele oyun ekleniyor...\n');

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const game of sampleGames) {
    try {
      const slug = game.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, '');

      // Zaten var mı?
      const { data: existing } = await supabase
        .from('content')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      if (existing) {
        console.log(`⏭️  Atlandı: ${game.title} (zaten var)`);
        skipCount++;
        continue;
      }

      // Kategori ID
      const categoryId = await getOrCreateCategory(game.category);
      if (!categoryId) {
        errorCount++;
        continue;
      }

      // Oyunu ekle
      const { error: insertError } = await supabase
        .from('content')
        .insert({
          title: game.title,
          slug: slug,
          description: game.description,
          instructions: 'Oyunu oynamak için fare veya dokunmatik ekranı kullanın.',
          content_type: 'game',
          age_group: categoryMapping[game.category] || 'child',
          category_id: categoryId,
          thumbnail_url: game.thumbnail,
          content_url: game.url,
          duration_minutes: 15,
          is_premium: false,
          is_featured: false,
          published: true,
          meta_title: `${game.title} - Ücretsiz Online Oyun`,
          meta_description: `${game.description}`,
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
}

addGames();

