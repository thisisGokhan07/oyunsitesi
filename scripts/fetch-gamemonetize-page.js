/**
 * GameMonetize.com oyun sayfasından bilgileri çeker
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

  const { data: allCategories } = await supabaseAdmin
    .from('categories')
    .select('id, slug, name')
    .eq('published', true)
    .limit(20)
    .order('sort_order');

  if (allCategories && allCategories.length > 0) {
    return allCategories[0].id;
  }

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

// GameMonetize.com sayfasından oyun bilgilerini çek
async function fetchGameInfoFromPage(pageUrl) {
  try {
    console.log(`📥 Sayfa çekiliyor: ${pageUrl}`);
    
    const response = await fetch(pageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    
    // HTML'den bilgileri çıkar (basit regex ile)
    let title = 'GameMonetize Game';
    let description = 'Eğlenceli oyun!';
    let thumbnail = 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=500';
    let embedUrl = null;
    let category = 'Arcade';

    // Title çek
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      title = titleMatch[1].trim().replace(/ - GameMonetize.*$/i, '').replace(/ \| GameMonetize.*$/i, '');
    }

    // Meta description çek
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    if (descMatch) {
      description = descMatch[1].trim();
    }

    // Open Graph image çek
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    if (ogImageMatch) {
      thumbnail = ogImageMatch[1].trim();
    }

    // iframe URL çek
    const iframeMatch = html.match(/<iframe[^>]*src=["']([^"']+html5\.gamemonetize\.co[^"']+)["']/i);
    if (iframeMatch) {
      embedUrl = iframeMatch[1].trim();
    }

    // Category çek (meta keywords veya breadcrumb'tan)
    const categoryMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["']/i);
    if (categoryMatch) {
      const keywords = categoryMatch[1].toLowerCase();
      if (keywords.includes('racing') || keywords.includes('car')) category = 'Racing';
      else if (keywords.includes('action') || keywords.includes('shooter')) category = 'Action';
      else if (keywords.includes('puzzle')) category = 'Puzzle';
      else if (keywords.includes('strategy')) category = 'Strategy';
      else if (keywords.includes('educational') || keywords.includes('math')) category = 'Educational';
    }

    return {
      title,
      description,
      thumbnail,
      embedUrl,
      category,
    };
  } catch (error) {
    console.error('Sayfa çekme hatası:', error.message);
    return null;
  }
}

// Oyunu veritabanına ekle
async function addGameFromPage(pageUrl) {
  try {
    // Sayfadan bilgileri çek
    const gameInfo = await fetchGameInfoFromPage(pageUrl);
    
    if (!gameInfo) {
      console.error('❌ Oyun bilgileri çekilemedi!');
      return { error: 'Oyun bilgileri çekilemedi' };
    }

    const { embedUrl, title, description, category, thumbnail } = gameInfo;

    if (!embedUrl) {
      console.error('❌ Embed URL bulunamadı!');
      return { error: 'Embed URL bulunamadı' };
    }

    // Slug oluştur
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

    // Provider ID al
    const providerId = await getGameMonetizeProvider();

    // Kategori ID al
    const categoryId = await getOrCreateCategory(category);

    // Oyunu ekle
    const { data, error } = await supabaseAdmin
      .from('content')
      .insert({
        title: title,
        slug: slug,
        description: description,
        instructions: 'Oyunu oynamak için fare veya dokunmatik ekranı kullanın.',
        content_type: 'game',
        age_group: 'child',
        category_id: categoryId,
        provider_id: providerId,
        provider_game_id: embedUrl,
        thumbnail_url: thumbnail,
        content_url: embedUrl.endsWith('/') ? embedUrl : embedUrl + '/',
        duration_minutes: 15,
        is_premium: false,
        is_featured: false,
        published: true,
        meta_title: `${title} - Ücretsiz Online Oyun`,
        meta_description: `${description}`,
        keywords: ['gamemonetize', category.toLowerCase()],
      })
      .select('id')
      .single();

    if (error) {
      console.error(`❌ Oyun eklenemedi:`, error.message);
      return { error: error.message };
    }

    console.log(`✅ Eklendi: ${title}`);
    return { success: true, id: data.id };
  } catch (error) {
    console.error(`❌ Oyun ekleme hatası:`, error.message);
    return { error: error.message };
  }
}

// Ana fonksiyon
async function main() {
  console.log('\n🚀 GameMonetize Oyun Sayfasından Bilgi Çekiliyor...\n');

  // GameMonetize.com oyun sayfası URL'i
  const pageUrl = 'https://gamemonetize.com/mud-offroad-jeep-game-game';

  const result = await addGameFromPage(pageUrl);

  if (result.success) {
    console.log('\n✅ Oyun başarıyla eklendi!');
  } else if (result.skipped) {
    console.log('\n⏭️  Oyun zaten mevcut!');
  } else {
    console.log('\n❌ Oyun eklenemedi:', result.error);
  }
}

// Çalıştır
main().catch(console.error);

