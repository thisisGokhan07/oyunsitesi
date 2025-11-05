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
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

// GameMonetize.com'dan 10 oyun (iframe embed kodlarıyla)
const games = [
  {
    title: 'Mud Offroad Jeep Game',
    slug: 'mud-offroad-jeep-game',
    description: 'Çamurlu arazilerde off-road jeep sürüş deneyimi. Zorlu parkurları aş ve hedefe ulaş!',
    category: 'racing',
    thumbnail: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=500',
    embedUrl: 'https://gamemonetize.com/games/mud-offroad-jeep-game/',
    gameId: 'mud-offroad-jeep-game',
  },
  {
    title: 'Epic Runner Parkour Game',
    slug: 'epic-runner-parkour-game',
    description: 'Engelleri aşarak parkur becerilerinizi test edin. Hızlı koşun ve zıplayın!',
    category: 'action',
    thumbnail: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=500',
    embedUrl: 'https://gamemonetize.com/games/epic-runner-parkour-game/',
    gameId: 'epic-runner-parkour-game',
  },
  {
    title: 'Monster City',
    slug: 'monster-city',
    description: 'Kendi canavar şehrinizi inşa edip yönetin. Şehir simülasyon oyunu!',
    category: 'strategy',
    thumbnail: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=500',
    embedUrl: 'https://gamemonetize.com/games/monster-city/',
    gameId: 'monster-city',
  },
  {
    title: 'Jigsaw Adventure',
    slug: 'jigsaw-adventure',
    description: 'Farklı zorluk seviyelerinde yapbozları tamamlayarak maceraya atılın.',
    category: 'puzzle',
    thumbnail: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=500',
    embedUrl: 'https://gamemonetize.com/games/jigsaw-adventure/',
    gameId: 'jigsaw-adventure',
  },
  {
    title: 'Confusions In Math 5-8',
    slug: 'confusions-in-math-5-8',
    description: 'Matematik becerilerinizi sınayabileceğiniz eğlenceli bir bulmaca oyunu.',
    category: 'educational',
    thumbnail: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=500',
    embedUrl: 'https://gamemonetize.com/games/confusions-in-math-5-8/',
    gameId: 'confusions-in-math-5-8',
  },
  {
    title: 'Easiest Maths',
    slug: 'easiest-maths',
    description: 'Basit matematik problemleriyle zihninizi çalıştırın. Eğitici oyun!',
    category: 'educational',
    thumbnail: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=500',
    embedUrl: 'https://gamemonetize.com/games/easiest-maths/',
    gameId: 'easiest-maths',
  },
  {
    title: 'Color Jam 3D',
    slug: 'color-jam-3d',
    description: 'Renkleri birleştirerek bulmacaları çözebileceğiniz üç boyutlu bir oyun.',
    category: 'puzzle',
    thumbnail: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=500',
    embedUrl: 'https://gamemonetize.com/games/color-jam-3d/',
    gameId: 'color-jam-3d',
  },
  {
    title: 'Space IO',
    slug: 'space-io',
    description: 'Uzayda geçen çok oyunculu bir strateji oyunu. En büyük ol!',
    category: 'strategy',
    thumbnail: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=500',
    embedUrl: 'https://gamemonetize.com/games/space-io/',
    gameId: 'space-io',
  },
  {
    title: 'Pipe Connect Puzzle',
    slug: 'pipe-connect-puzzle',
    description: 'Boru parçalarını doğru şekilde birleştirerek suyun akışını sağlayın.',
    category: 'puzzle',
    thumbnail: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=500',
    embedUrl: 'https://gamemonetize.com/games/pipe-connect-puzzle/',
    gameId: 'pipe-connect-puzzle',
  },
  {
    title: 'Cell Defense',
    slug: 'cell-defense',
    description: 'Hücrelerinizi savunarak düşmanlara karşı mücadele edin. Strateji oyunu!',
    category: 'strategy',
    thumbnail: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=500',
    embedUrl: 'https://gamemonetize.com/games/cell-defense/',
    gameId: 'cell-defense',
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
  
  // Mevcut kategoriyi kontrol et
  const { data: existing } = await supabaseAdmin
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .eq('published', true)
    .maybeSingle();

  if (existing) {
    return existing.id;
  }

  // Tüm kategorileri al
  const { data: allCategories } = await supabaseAdmin
    .from('categories')
    .select('id, slug')
    .eq('published', true)
    .limit(10);

  if (allCategories && allCategories.length > 0) {
    const matching = allCategories.find(c => c.slug.includes(categorySlug) || categorySlug.includes(c.slug));
    if (matching) return matching.id;
    return allCategories[0].id;
  }

  // Yeni kategori oluştur
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
    return null;
  }

  return newCategory.id;
}

async function addGames() {
  console.log('🎮 GameMonetize.com\'dan 10 oyun ekleniyor...\n');

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const game of games) {
    try {
      // Zaten var mı kontrol et
      const { data: existing } = await supabaseAdmin
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
      const categoryId = await getOrCreateCategory(game.category);
      if (!categoryId) {
        console.log(`⚠️  Kategori bulunamadı: ${game.title}`);
        errorCount++;
        continue;
      }

      // GameMonetize iframe embed URL oluştur
      const embedUrl = `https://gamemonetize.com/games/${game.gameId}/embed.html`;

      // Oyunu ekle
      const { error: insertError } = await supabaseAdmin
        .from('content')
        .insert({
          title: game.title,
          slug: game.slug,
          description: game.description,
          instructions: 'Oyunu oynamak için fare veya dokunmatik ekranı kullanın.',
          content_type: 'game',
          age_group: categoryMapping[game.category] || 'child',
          category_id: categoryId,
          thumbnail_url: game.thumbnail,
          content_url: embedUrl,
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

