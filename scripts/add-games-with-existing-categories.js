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

// GameMonetize.com oyunları
const games = [
  {
    title: 'Mud Offroad Jeep Game',
    slug: 'mud-offroad-jeep-game',
    description: 'Çamurlu arazilerde off-road jeep sürüş deneyimi. Zorlu parkurları aş ve hedefe ulaş!',
    category: 'racing',
    embedUrl: 'https://gamemonetize.com/games/mud-offroad-jeep-game/embed.html',
  },
  {
    title: 'Epic Runner Parkour Game',
    slug: 'epic-runner-parkour-game',
    description: 'Engelleri aşarak parkur becerilerinizi test edin. Hızlı koşun ve zıplayın!',
    category: 'action',
    embedUrl: 'https://gamemonetize.com/games/epic-runner-parkour-game/embed.html',
  },
  {
    title: 'Monster City',
    slug: 'monster-city',
    description: 'Kendi canavar şehrinizi inşa edip yönetin. Şehir simülasyon oyunu!',
    category: 'strategy',
    embedUrl: 'https://gamemonetize.com/games/monster-city/embed.html',
  },
  {
    title: 'Jigsaw Adventure',
    slug: 'jigsaw-adventure',
    description: 'Farklı zorluk seviyelerinde yapbozları tamamlayarak maceraya atılın.',
    category: 'puzzle',
    embedUrl: 'https://gamemonetize.com/games/jigsaw-adventure/embed.html',
  },
  {
    title: 'Confusions In Math 5-8',
    slug: 'confusions-in-math-5-8',
    description: 'Matematik becerilerinizi sınayabileceğiniz eğlenceli bir bulmaca oyunu.',
    category: 'educational',
    embedUrl: 'https://gamemonetize.com/games/confusions-in-math-5-8/embed.html',
  },
  {
    title: 'Easiest Maths',
    slug: 'easiest-maths',
    description: 'Basit matematik problemleriyle zihninizi çalıştırın. Eğitici oyun!',
    category: 'educational',
    embedUrl: 'https://gamemonetize.com/games/easiest-maths/embed.html',
  },
  {
    title: 'Color Jam 3D',
    slug: 'color-jam-3d',
    description: 'Renkleri birleştirerek bulmacaları çözebileceğiniz üç boyutlu bir oyun.',
    category: 'puzzle',
    embedUrl: 'https://gamemonetize.com/games/color-jam-3d/embed.html',
  },
  {
    title: 'Space IO',
    slug: 'space-io',
    description: 'Uzayda geçen çok oyunculu bir strateji oyunu. En büyük ol!',
    category: 'strategy',
    embedUrl: 'https://gamemonetize.com/games/space-io/embed.html',
  },
  {
    title: 'Pipe Connect Puzzle',
    slug: 'pipe-connect-puzzle',
    description: 'Boru parçalarını doğru şekilde birleştirerek suyun akışını sağlayın.',
    category: 'puzzle',
    embedUrl: 'https://gamemonetize.com/games/pipe-connect-puzzle/embed.html',
  },
  {
    title: 'Cell Defense',
    slug: 'cell-defense',
    description: 'Hücrelerinizi savunarak düşmanlara karşı mücadele edin. Strateji oyunu!',
    category: 'strategy',
    embedUrl: 'https://gamemonetize.com/games/cell-defense/embed.html',
  },
];

async function getCategoryMapping() {
  // Mevcut kategorileri al
  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, slug, name')
    .eq('published', true);

  if (error || !categories || categories.length === 0) {
    console.error('❌ Kategoriler yüklenemedi:', error?.message);
    return null;
  }

  console.log('\n📂 Mevcut kategoriler:');
  categories.forEach(c => console.log(`   - ${c.name} (${c.slug})`));

  // Kategori mapping oluştur
  const mapping = {};
  categories.forEach(cat => {
    const slug = cat.slug.toLowerCase();
    if (slug.includes('kosu') || slug.includes('action')) mapping['action'] = cat.id;
    if (slug.includes('egitici') || slug.includes('educational')) mapping['educational'] = cat.id;
    if (slug.includes('puzzle') || slug.includes('bulmaca')) mapping['puzzle'] = cat.id;
    if (slug.includes('strategy') || slug.includes('zeka')) mapping['strategy'] = cat.id;
    if (slug.includes('racing') || slug.includes('yaris')) mapping['racing'] = cat.id;
  });

  // Fallback: ilk kategoriyi kullan
  const firstCategoryId = categories[0].id;
  
  return {
    get: (categoryType) => {
      return mapping[categoryType] || firstCategoryId;
    },
  };
}

async function addGames() {
  console.log('🎮 GameMonetize.com\'dan 10 oyun ekleniyor...\n');

  const categoryMap = await getCategoryMapping();
  if (!categoryMap) {
    console.error('❌ Kategori mapping oluşturulamadı!');
    return;
  }

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
      const categoryId = categoryMap.get(game.category);

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
          thumbnail_url: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=500',
          content_url: game.embedUrl,
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

