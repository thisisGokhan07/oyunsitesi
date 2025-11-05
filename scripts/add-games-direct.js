/**
 * GameMonetize.com'dan direkt oyun URL'lerini ekler
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

// Slug oluştur
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-*|-*$/g, '');
}

// Kategori ID al
async function getOrCreateCategory(categoryName) {
  const categorySlug = generateSlug(categoryName);
  
  const { data: existing } = await supabaseAdmin
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .maybeSingle();

  if (existing) {
    return existing.id;
  }

  // Mevcut kategorilerden birini kullan
  const { data: allCategories } = await supabaseAdmin
    .from('categories')
    .select('id, slug, name')
    .eq('published', true)
    .limit(20)
    .order('sort_order');

  if (allCategories && allCategories.length > 0) {
    return allCategories[0].id; // İlk kategoriyi kullan
  }

  // Yeni kategori oluştur
  const { data: newCategory, error } = await supabaseAdmin
    .from('categories')
    .insert({
      name: categoryName.charAt(0).toUpperCase() + categoryName.slice(1),
      slug: categorySlug,
      description: `${categoryName} oyunları`,
      age_group: 'child',
      icon_name: 'Gamepad2',
      color_hex: '#f97316',
      content_count: 0,
      sort_order: 0,
      published: true,
    })
    .select('id')
    .single();

  if (error) {
    console.error(`❌ Kategori hatası:`, error.message);
    return null;
  }

  return newCategory.id;
}

// GameMonetize provider ID'sini al
async function getGameMonetizeProvider() {
  const { data, error } = await supabaseAdmin
    .from('game_providers')
    .select('id')
    .eq('slug', 'gamemonetize')
    .maybeSingle();

  if (error || !data) {
    // Provider oluştur
    const { data: newProvider } = await supabaseAdmin
      .from('game_providers')
      .insert({
        name: 'GameMonetize',
        slug: 'gamemonetize',
        api_endpoint: 'https://gamemonetize.com',
        auth_type: 'none',
        auth_header_name: '',
        enabled: true,
        revenue_share: 100.00,
        config: {},
      })
      .select('id')
      .single();

    return newProvider?.id || null;
  }

  return data.id;
}

// Oyun bilgilerini GameMonetize.com sayfasından çek
async function fetchGameInfo(gameUrl) {
  try {
    // Oyun sayfası URL'ini oluştur (eğer direkt iframe URL ise)
    let pageUrl = gameUrl;
    
    // Eğer iframe URL ise, oyun sayfasını bulmaya çalış
    if (gameUrl.includes('html5.gamemonetize.co')) {
      // iframe URL'den oyun ID'sini çıkar
      const gameId = gameUrl.split('/').filter(Boolean).pop()?.replace('/', '');
      if (gameId) {
        // GameMonetize.com'da oyun sayfası formatı: https://gamemonetize.com/game-slug
        // Ama biz sadece iframe URL'ini kullanacağız, bilgileri manuel ekleyeceğiz
        console.log(`ℹ️  Oyun ID: ${gameId}`);
      }
    }

    return {
      embedUrl: gameUrl.endsWith('/') ? gameUrl : gameUrl + '/',
      gameId: gameUrl.split('/').filter(Boolean).pop()?.replace('/', ''),
    };
  } catch (error) {
    console.error('Oyun bilgisi çekme hatası:', error.message);
    return null;
  }
}

// Oyunu veritabanına ekle
async function addGame(gameData) {
  try {
    const { embedUrl, title, description, category, thumbnail } = gameData;
    
    if (!embedUrl) {
      console.error('❌ Embed URL gerekli!');
      return { error: 'Embed URL gerekli' };
    }

    // Slug oluştur
    const slug = title ? generateSlug(title) : `gamemonetize-${Date.now()}`;

    // Slug kontrolü
    const { data: existing } = await supabaseAdmin
      .from('content')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existing) {
      console.log(`⏭️  Zaten var: ${title || slug}`);
      return { skipped: true };
    }

    // Provider ID al
    const providerId = await getGameMonetizeProvider();

    // Kategori ID al
    const categoryId = await getOrCreateCategory(category || 'Arcade');

    // Oyunu ekle
    const { data, error } = await supabaseAdmin
      .from('content')
      .insert({
        title: title || `GameMonetize Game ${Date.now()}`,
        slug: slug,
        description: description || `${title || 'GameMonetize'} oyunu. Eğlenceli ve ücretsiz oyun!`,
        instructions: 'Oyunu oynamak için fare veya dokunmatik ekranı kullanın.',
        content_type: 'game',
        age_group: 'child',
        category_id: categoryId,
        provider_id: providerId,
        provider_game_id: embedUrl,
        thumbnail_url: thumbnail || 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=500',
        content_url: embedUrl,
        duration_minutes: 15,
        is_premium: false,
        is_featured: false,
        published: true,
        meta_title: `${title || 'GameMonetize Game'} - Ücretsiz Online Oyun`,
        meta_description: `${description || title || 'GameMonetize'} oyna. Eğlenceli ve ücretsiz oyunlar.`,
        keywords: ['gamemonetize', category?.toLowerCase() || 'arcade'],
      })
      .select('id')
      .single();

    if (error) {
      console.error(`❌ Oyun eklenemedi:`, error.message);
      return { error: error.message };
    }

    console.log(`✅ Eklendi: ${title || slug}`);
    return { success: true, id: data.id };
  } catch (error) {
    console.error(`❌ Oyun ekleme hatası:`, error.message);
    return { error: error.message };
  }
}

// Ana fonksiyon
async function main() {
  console.log('\n🚀 GameMonetize Oyunları Ekleniyor...\n');

  // Eklemek istediğiniz oyunlar
  const games = [
    {
      embedUrl: 'https://html5.gamemonetize.co/qszsjvbbog34bpge30jspq1j73p6cfj8/',
      title: 'Mud Offroad Jeep Game',
      description: 'Çamurlu arazilerde off-road jeep sürüş deneyimi. Zorlu parkurları aş ve hedefe ulaş!',
      category: 'Racing',
      thumbnail: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=500',
    },
    {
      embedUrl: 'https://html5.gamemonetize.co/93d6h8i0rbebzr6pcjrc98ui9bhtdn7q/',
      title: 'Epic Adventure Game',
      description: 'Heyecan verici macera oyunu. Düşmanları yen, hazineleri topla ve seviyeleri tamamla!',
      category: 'Action',
      thumbnail: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=500',
    },
  ];

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const game of games) {
    const result = await addGame(game);
    
    if (result.success) {
      successCount++;
    } else if (result.skipped) {
      skipCount++;
    } else {
      errorCount++;
    }

    // Kısa bekleme
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ İŞLEM TAMAMLANDI!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Başarılı: ${successCount}`);
  console.log(`⏭️  Atlanan: ${skipCount}`);
  console.log(`❌ Hatalı: ${errorCount}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Çalıştır
main().catch(console.error);

