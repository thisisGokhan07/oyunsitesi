const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
let url, serviceKey;

envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
    url = trimmed.substring('NEXT_PUBLIC_SUPABASE_URL='.length).trim();
  }
  if (trimmed.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
    serviceKey = trimmed.substring('SUPABASE_SERVICE_ROLE_KEY='.length).trim();
  }
});

if (!url || !serviceKey) {
  console.error('❌ Credentials eksik!');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function run() {
  console.log('🎮 GameMonetize oyunları ekleniyor...\n');

  // 1. Kategorileri al
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, slug, name')
    .eq('published', true);

  if (catError) {
    console.error('❌ Kategori hatası:', catError.message);
    return;
  }

  if (!categories || categories.length === 0) {
    console.error('❌ Hiç kategori yok!');
    return;
  }

  console.log(`✅ ${categories.length} kategori bulundu`);
  const firstCategory = categories[0];
  console.log(`📂 İlk kategori: ${firstCategory.name} (ID: ${firstCategory.id})\n`);

  // 2. Oyunları ekle
  const games = [
    {
      title: 'Mud Offroad Jeep Game',
      slug: 'mud-offroad-jeep-game',
      description: 'Çamurlu arazilerde off-road jeep sürüş deneyimi. Zorlu parkurları aş ve hedefe ulaş!',
      embedUrl: 'https://gamemonetize.com/games/mud-offroad-jeep-game/embed.html',
      ageGroup: 'child',
    },
    {
      title: 'Epic Runner Parkour Game',
      slug: 'epic-runner-parkour-game',
      description: 'Engelleri aşarak parkur becerilerinizi test edin. Hızlı koşun ve zıplayın!',
      embedUrl: 'https://gamemonetize.com/games/epic-runner-parkour-game/embed.html',
      ageGroup: 'child',
    },
    {
      title: 'Monster City',
      slug: 'monster-city',
      description: 'Kendi canavar şehrinizi inşa edip yönetin. Şehir simülasyon oyunu!',
      embedUrl: 'https://gamemonetize.com/games/monster-city/embed.html',
      ageGroup: 'adult',
    },
    {
      title: 'Jigsaw Adventure',
      slug: 'jigsaw-adventure',
      description: 'Farklı zorluk seviyelerinde yapbozları tamamlayarak maceraya atılın.',
      embedUrl: 'https://gamemonetize.com/games/jigsaw-adventure/embed.html',
      ageGroup: 'child',
    },
    {
      title: 'Confusions In Math 5-8',
      slug: 'confusions-in-math-5-8',
      description: 'Matematik becerilerinizi sınayabileceğiniz eğlenceli bir bulmaca oyunu.',
      embedUrl: 'https://gamemonetize.com/games/confusions-in-math-5-8/embed.html',
      ageGroup: 'baby',
    },
    {
      title: 'Easiest Maths',
      slug: 'easiest-maths',
      description: 'Basit matematik problemleriyle zihninizi çalıştırın. Eğitici oyun!',
      embedUrl: 'https://gamemonetize.com/games/easiest-maths/embed.html',
      ageGroup: 'baby',
    },
    {
      title: 'Color Jam 3D',
      slug: 'color-jam-3d',
      description: 'Renkleri birleştirerek bulmacaları çözebileceğiniz üç boyutlu bir oyun.',
      embedUrl: 'https://gamemonetize.com/games/color-jam-3d/embed.html',
      ageGroup: 'child',
    },
    {
      title: 'Space IO',
      slug: 'space-io',
      description: 'Uzayda geçen çok oyunculu bir strateji oyunu. En büyük ol!',
      embedUrl: 'https://gamemonetize.com/games/space-io/embed.html',
      ageGroup: 'adult',
    },
    {
      title: 'Pipe Connect Puzzle',
      slug: 'pipe-connect-puzzle',
      description: 'Boru parçalarını doğru şekilde birleştirerek suyun akışını sağlayın.',
      embedUrl: 'https://gamemonetize.com/games/pipe-connect-puzzle/embed.html',
      ageGroup: 'child',
    },
    {
      title: 'Cell Defense',
      slug: 'cell-defense',
      description: 'Hücrelerinizi savunarak düşmanlara karşı mücadele edin. Strateji oyunu!',
      embedUrl: 'https://gamemonetize.com/games/cell-defense/embed.html',
      ageGroup: 'adult',
    },
  ];

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

      // Oyunu ekle
      const { error: insertError } = await supabase.from('content').insert({
        title: game.title,
        slug: game.slug,
        description: game.description,
        instructions: 'Oyunu oynamak için fare veya dokunmatik ekranı kullanın.',
        content_type: 'game',
        age_group: game.ageGroup,
        category_id: firstCategory.id,
        thumbnail_url: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=500',
        content_url: game.embedUrl,
        duration_minutes: 15,
        is_premium: false,
        is_featured: false,
        published: true,
        meta_title: `${game.title} - Ücretsiz Online Oyun`,
        meta_description: game.description,
        keywords: ['game'],
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

run().catch(console.error);

