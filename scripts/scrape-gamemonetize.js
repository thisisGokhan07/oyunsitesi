/**
 * GameMonetize.com'dan oyunları web scraping ile çekip ekler
 * https://gamemonetize.com adresinden oyun listesini alır
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
          const key = match[1].trim();
          let value = match[2].trim();
          value = value.replace(/^["']|["']$/g, '');
          process.env[key] = value;
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
  'platform': 'child',
  'multiplayer': 'adult',
  'math': 'baby',
  'coloring': 'baby',
  'board': 'family',
};

// Slug oluştur
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-*|-*$/g, '');
}

// Kategori ID al veya oluştur
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

  const { data: allCategories } = await supabaseAdmin
    .from('categories')
    .select('id, slug, name')
    .eq('published', true)
    .limit(20);

  if (allCategories && allCategories.length > 0) {
    const matching = allCategories.find(c => 
      c.slug.includes(categorySlug) || 
      categorySlug.includes(c.slug) ||
      c.name.toLowerCase().includes(categoryName.toLowerCase())
    );
    if (matching) return matching.id;
    return allCategories[0].id;
  }

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

// GameMonetize.com API'den oyunları çek
async function fetchGamesFromGameMonetize(limit = 20) {
  console.log('🎮 GameMonetize.com API\'den oyunlar çekiliyor...');
  
  try {
    // GameMonetize API endpoint (API key olmadan deneyelim)
    const response = await fetch('https://api.gamemonetize.com/games', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      console.warn(`⚠️  API hatası (${response.status}), web scraping deneniyor...`);
      // API çalışmazsa, web scraping yapılabilir
      return await scrapeGamesFromWeb(limit);
    }

    const data = await response.json();
    
    // Response format kontrolü
    let games = [];
    if (data.games && Array.isArray(data.games)) {
      games = data.games;
    } else if (data.data && Array.isArray(data.data)) {
      games = data.data;
    } else if (Array.isArray(data)) {
      games = data;
    } else {
      console.warn('⚠️  API format beklenmiyor, web scraping deneniyor...');
      return await scrapeGamesFromWeb(limit);
    }

    console.log(`✅ ${games.length} oyun bulundu (API)`);
    return games.slice(0, limit);
  } catch (error) {
    console.warn(`⚠️  API hatası: ${error.message}, web scraping deneniyor...`);
    return await scrapeGamesFromWeb(limit);
  }
}

// Web scraping fallback (basit HTML parsing)
async function scrapeGamesFromWeb(limit = 20) {
  console.log('🌐 Web scraping başlatılıyor...');
  
  try {
    // GameMonetize.com ana sayfasından oyun listesini çek
    const response = await fetch('https://gamemonetize.com', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    
    // Basit regex ile oyun linklerini bul
    // GameMonetize.com genellikle iframe URL'lerini şu formatta kullanır:
    // https://html5.gamemonetize.co/XXXXX/
    const iframeUrlPattern = /https?:\/\/html5\.gamemonetize\.co\/[a-z0-9]+\//gi;
    const iframeUrls = [...new Set(html.match(iframeUrlPattern) || [])];
    
    console.log(`✅ ${iframeUrls.length} iframe URL bulundu`);
    
    // Her iframe URL'inden oyun bilgilerini çıkar
    const games = [];
    for (let i = 0; i < Math.min(limit, iframeUrls.length); i++) {
      const url = iframeUrls[i];
      const gameId = url.split('/').filter(Boolean).pop()?.replace('/', '') || `game-${i}`;
      
      games.push({
        title: `Game ${i + 1}`,
        description: `GameMonetize.com oyunu`,
        category: 'Arcade',
        thumbnail: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=500',
        embedUrl: url,
        gameId: gameId,
      });
    }
    
    return games;
  } catch (error) {
    console.error('❌ Web scraping hatası:', error.message);
    return [];
  }
}

// GameMonetize provider ID'sini al
async function getGameMonetizeProvider() {
  const { data, error } = await supabaseAdmin
    .from('game_providers')
    .select('id')
    .eq('slug', 'gamemonetize')
    .maybeSingle();

  if (error) {
    console.error('❌ Provider hatası:', error.message);
    return null;
  }

  if (!data) {
    const { data: newProvider, error: insertError } = await supabaseAdmin
      .from('game_providers')
      .insert({
        name: 'GameMonetize',
        slug: 'gamemonetize',
        api_endpoint: 'https://api.gamemonetize.com/games',
        auth_type: 'none',
        auth_header_name: '',
        enabled: true,
        revenue_share: 100.00,
        config: {},
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('❌ Provider oluşturma hatası:', insertError.message);
      return null;
    }

    return newProvider.id;
  }

  return data.id;
}

// Oyunu veritabanına ekle
async function importGame(game, providerId) {
  try {
    // Oyun başlığını API'den veya URL'den çıkar
    let title = game.title || game.name || `GameMonetize Game ${Date.now()}`;
    let description = game.description || `${title} - GameMonetize.com oyunu`;
    let category = game.category || game.category_name || 'Arcade';
    let thumbnail = game.thumbnail || game.thumb || game.image || 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=500';
    let embedUrl = game.embedUrl || game.embed_url || game.game_link || game.url;
    
    if (!embedUrl) {
      console.warn(`⚠️  Embed URL bulunamadı: ${title}`);
      return { skipped: true };
    }

    // Embed URL formatını kontrol et ve düzelt
    if (!embedUrl.includes('html5.gamemonetize.co')) {
      // Eğer direkt oyun URL'i ise, iframe URL'ine çevir
      if (embedUrl.includes('gamemonetize.com/games/')) {
        const gameId = embedUrl.split('/').pop();
        embedUrl = `https://html5.gamemonetize.co/${gameId}/`;
      } else {
        console.warn(`⚠️  Geçersiz embed URL: ${embedUrl}`);
        return { skipped: true };
      }
    }

    // URL sonunda / yoksa ekle
    if (!embedUrl.endsWith('/')) {
      embedUrl += '/';
    }

    const slug = generateSlug(title);
    
    // Slug kontrolü
    const { data: existing } = await supabaseAdmin
      .from('content')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existing) {
      console.log(`⏭️  Zaten var: ${title}`);
      return { skipped: true };
    }

    // Kategori ID al
    const categoryId = await getOrCreateCategory(category);
    if (!categoryId) {
      console.warn(`⚠️  Kategori bulunamadı: ${category}, oyun atlanıyor`);
      return { skipped: true };
    }

    // Oyunu ekle
    const { data, error } = await supabaseAdmin
      .from('content')
      .insert({
        title: title,
        slug: slug,
        description: description,
        instructions: 'Oyunu oynamak için fare veya dokunmatik ekranı kullanın.',
        content_type: 'game',
        age_group: categoryMapping[category.toLowerCase()] || 'family',
        category_id: categoryId,
        provider_id: providerId,
        provider_game_id: embedUrl,
        thumbnail_url: thumbnail,
        content_url: embedUrl,
        duration_minutes: game.duration || 15,
        is_premium: false,
        is_featured: false,
        published: true,
        meta_title: `${title} - Ücretsiz Online Oyun`,
        meta_description: `${description} oyna. Eğlenceli ve ücretsiz oyunlar.`,
        keywords: [category.toLowerCase(), 'gamemonetize'],
      })
      .select('id')
      .single();

    if (error) {
      console.error(`❌ Oyun eklenemedi (${title}):`, error.message);
      return { error: error.message };
    }

    console.log(`✅ Eklendi: ${title}`);
    return { success: true, id: data.id };
  } catch (error) {
    console.error(`❌ Oyun import hatası:`, error.message);
    return { error: error.message };
  }
}

// Ana import fonksiyonu
async function importGames(limit = 20) {
  console.log('\n🚀 GameMonetize Import Başlatılıyor...\n');

  try {
    // Provider ID al
    const providerId = await getGameMonetizeProvider();
    if (!providerId) {
      console.error('❌ Provider ID alınamadı!');
      return;
    }

    // Oyunları çek
    const games = await fetchGamesFromGameMonetize(limit);

    if (games.length === 0) {
      console.log('⚠️  Hiç oyun bulunamadı');
      return;
    }

    console.log(`\n📦 ${games.length} oyun import ediliyor...\n`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    // Her oyunu import et
    for (const game of games) {
      const result = await importGame(game, providerId);
      
      if (result.success) {
        successCount++;
      } else if (result.skipped) {
        skipCount++;
      } else {
        errorCount++;
      }

      // Rate limiting için kısa bekleme
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Özet
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ IMPORT TAMAMLANDI!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Başarılı: ${successCount}`);
    console.log(`⏭️  Atlanan: ${skipCount}`);
    console.log(`❌ Hatalı: ${errorCount}`);
    console.log(`📊 Toplam: ${games.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ Import hatası:', error.message);
    process.exit(1);
  }
}

// Script'i çalıştır
if (require.main === module) {
  const limit = process.argv[2] ? parseInt(process.argv[2]) : 20;
  importGames(limit);
}

module.exports = { importGames };

