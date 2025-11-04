/**
 * GameDistribution API Import Script
 * 
 * Kullanım:
 * 1. .env.local dosyasına GAMEDISTRIBUTION_API_KEY ekleyin
 * 2. node scripts/import-gamedistribution.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GD_API_KEY = process.env.GAMEDISTRIBUTION_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Supabase environment variables eksik!');
  console.error('NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli');
  process.exit(1);
}

if (!GD_API_KEY) {
  console.error('❌ GameDistribution API Key eksik!');
  console.error('.env.local dosyasına GAMEDISTRIBUTION_API_KEY ekleyin');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Kategori mapping (GameDistribution kategorilerini bizim kategorilere map et)
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

const ageGroupMapping = {
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

// Slug oluştur
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Kategori ID bul veya oluştur
async function getOrCreateCategory(gdCategory) {
  const categoryName = gdCategory.charAt(0).toUpperCase() + gdCategory.slice(1);
  const slug = generateSlug(categoryName);
  const ageGroup = categoryMapping[gdCategory] || 'child';

  // Önce var mı kontrol et
  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  if (existing) {
    return existing.id;
  }

  // Yoksa oluştur
  const { data: newCategory, error } = await supabase
    .from('categories')
    .insert({
      name: categoryName,
      slug: slug,
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
    console.error(`Kategori oluşturma hatası: ${error.message}`);
    return null;
  }

  return newCategory.id;
}

// GameDistribution API'den oyunları çek
async function fetchGamesFromGD(limit = 20) {
  try {
    console.log('🎮 GameDistribution API\'den oyunlar çekiliyor...');
    
    const response = await fetch('https://gamedistribution.com/api/v2.0/games', {
      headers: {
        'X-Api-Key': GD_API_KEY,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.data || !Array.isArray(data.data)) {
      throw new Error('Invalid API response format');
    }

    console.log(`✅ ${data.data.length} oyun bulundu`);
    return data.data.slice(0, limit);
  } catch (error) {
    console.error('❌ GameDistribution API hatası:', error.message);
    throw error;
  }
}

// Oyunu veritabanına ekle
async function importGame(game) {
  try {
    const slug = generateSlug(game.title);
    
    // Zaten var mı kontrol et
    const { data: existing } = await supabase
      .from('content')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existing) {
      console.log(`⏭️  "${game.title}" zaten mevcut, atlanıyor`);
      return { skipped: true };
    }

    // Kategori ID al
    const categoryId = await getOrCreateCategory(game.category || 'casual');
    if (!categoryId) {
      console.error(`⚠️  "${game.title}" için kategori oluşturulamadı`);
      return { error: 'Category creation failed' };
    }

    // Oyun verilerini hazırla
    const gameData = {
      title: game.title,
      slug: slug,
      description: game.description || `${game.title} oyunu. Eğlenceli ve eğitici içerik.`,
      instructions: game.instructions || 'Oyunu oynamak için fare veya dokunmatik ekranı kullanın.',
      content_type: 'game',
      age_group: ageGroupMapping[game.category] || 'child',
      category_id: categoryId,
      thumbnail_url: game.assets?.cover || game.assets?.icon || 'https://via.placeholder.com/500x300',
      content_url: game.url || game.embedUrl || '',
      duration_minutes: game.duration || 15,
      play_count: 0,
      rating: game.rating || 0,
      rating_count: 0,
      is_premium: false,
      is_featured: game.featured || false,
      published: true,
      meta_title: `${game.title} - Ücretsiz Online Oyun`,
      meta_description: `${game.title} oyna. Eğlenceli ve ücretsiz oyunlar.`,
      keywords: game.tags || [game.category],
      created_by: null,
    };

    // Veritabanına ekle
    const { data, error } = await supabase
      .from('content')
      .insert(gameData)
      .select('id')
      .single();

    if (error) {
      console.error(`❌ "${game.title}" eklenemedi:`, error.message);
      return { error: error.message };
    }

    console.log(`✅ "${game.title}" başarıyla eklendi`);
    return { success: true, id: data.id };
  } catch (error) {
    console.error(`❌ "${game.title}" import hatası:`, error.message);
    return { error: error.message };
  }
}

// Ana import fonksiyonu
async function importGames() {
  console.log('\n🚀 GameDistribution Import Başlatılıyor...\n');

  try {
    // Oyunları çek
    const games = await fetchGamesFromGD(20);

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
      const result = await importGame(game);
      
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
  // .env.local dosyasını yükle
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, ...values] = line.split('=');
      if (key && values.length) {
        process.env[key.trim()] = values.join('=').trim();
      }
    });
  }

  importGames().then(() => {
    console.log('✅ Script tamamlandı');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Script hatası:', error);
    process.exit(1);
  });
}

module.exports = { importGames, fetchGamesFromGD };

