const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
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
  console.warn('⚠️  .env.local dosyası okunamadı:', error.message);
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GAMEDISTRIBUTION_API_KEY = process.env.GAMEDISTRIBUTION_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase environment variables!');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Kategori mapping
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
    .maybeSingle();

  if (existing) {
    return existing.id;
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
    console.error(`❌ Kategori oluşturma hatası (${categoryName}):`, error.message);
    return null;
  }

  return newCategory.id;
}

async function fetchRandomGames() {
  console.log('🎮 10 rastgele oyun çekiliyor...\n');

  try {
    // GameDistribution API'den oyunları çek
    if (!GAMEDISTRIBUTION_API_KEY) {
      console.error('❌ GAMEDISTRIBUTION_API_KEY bulunamadı!');
      console.log('💡 .env.local dosyasına GAMEDISTRIBUTION_API_KEY ekleyin.');
      return;
    }

    const response = await fetch('https://gamedistribution.com/api/v2.0/games', {
      headers: { 'X-Api-Key': GAMEDISTRIBUTION_API_KEY }
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    const allGames = data.data || [];

    if (allGames.length === 0) {
      console.log('❌ Hiç oyun bulunamadı.');
      return;
    }

    // Rastgele 10 oyun seç
    const shuffled = allGames.sort(() => 0.5 - Math.random());
    const randomGames = shuffled.slice(0, 10);

    console.log(`✅ ${allGames.length} oyun bulundu, 10 tanesi seçiliyor...\n`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const game of randomGames) {
      try {
        const slug = game.slug || game.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, '');

        // Zaten var mı kontrol et
        const { data: existing } = await supabaseAdmin
          .from('content')
          .select('id')
          .eq('slug', slug)
          .maybeSingle();

        if (existing) {
          console.log(`⏭️  Atlandı: ${game.title} (zaten var)`);
          skipCount++;
          continue;
        }

        // Kategori ID'sini al veya oluştur
        const gameCategory = game.category || 'casual';
        const categoryId = await getOrCreateCategory(gameCategory);

        if (!categoryId) {
          console.log(`⚠️  Kategori bulunamadı: ${game.title}`);
          errorCount++;
          continue;
        }

        // Oyunu ekle
        const thumbnail = game.assets?.cover || game.thumb || 'https://via.placeholder.com/500x300';
        const gameUrl = game.url || game.game_link || '';
        const embedUrl = game.embedUrl || game.embed_url || gameUrl;

        const { error: insertError } = await supabaseAdmin
          .from('content')
          .insert({
            title: game.title,
            slug: slug,
            description: game.description || `${game.title} oyunu.`,
            instructions: 'Oyunu oynamak için fare veya dokunmatik ekranı kullanın.',
            content_type: 'game',
            age_group: categoryMapping[gameCategory.toLowerCase()] || 'child',
            category_id: categoryId,
            thumbnail_url: thumbnail,
            content_url: embedUrl || gameUrl,
            duration_minutes: game.duration || 15,
            is_premium: false,
            is_featured: false,
            published: true,
            meta_title: `${game.title} - Ücretsiz Online Oyun`,
            meta_description: `${game.title} oyna. Eğlenceli ve ücretsiz oyunlar.`,
            keywords: game.tags || [gameCategory],
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
    console.log(`   📦 Toplam: ${randomGames.length}`);

  } catch (error) {
    console.error('❌ Genel hata:', error.message);
  }
}

fetchRandomGames();

