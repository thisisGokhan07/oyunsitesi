const https = require('https');

const url = 'zjpmgoycegocllpovmru.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqcG1nb3ljZWdvY2xscG92bXJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImiYXQiOjE3NjE4Mzc0NDIsImV4cCI6MjA3NzQxMzQ0Mn0.EyKyvADk9W1nlX6zNpgroRX9Ch9znFQdKiUE4mXjk6Y';

const games = [
  { title: 'Mud Offroad Jeep Game', slug: 'mud-offroad-jeep-game', desc: 'Çamurlu arazilerde off-road jeep sürüş deneyimi. Zorlu parkurları aş ve hedefe ulaş!', embed: 'https://gamemonetize.com/games/mud-offroad-jeep-game/embed.html', age: 'child', cat: 'ff43de0d-7a94-4ae6-8fff-9e36ea3c1c4b' },
  { title: 'Epic Runner Parkour Game', slug: 'epic-runner-parkour-game', desc: 'Engelleri aşarak parkur becerilerinizi test edin. Hızlı koşun ve zıplayın!', embed: 'https://gamemonetize.com/games/epic-runner-parkour-game/embed.html', age: 'child', cat: 'ff43de0d-7a94-4ae6-8fff-9e36ea3c1c4b' },
  { title: 'Monster City', slug: 'monster-city', desc: 'Kendi canavar şehrinizi inşa edip yönetin. Şehir simülasyon oyunu!', embed: 'https://gamemonetize.com/games/monster-city/embed.html', age: 'adult', cat: 'ff43de0d-7a94-4ae6-8fff-9e36ea3c1c4b' },
  { title: 'Jigsaw Adventure', slug: 'jigsaw-adventure', desc: 'Farklı zorluk seviyelerinde yapbozları tamamlayarak maceraya atılın.', embed: 'https://gamemonetize.com/games/jigsaw-adventure/embed.html', age: 'child', cat: '3a8adbde-474a-4f50-9930-73ddcd47c8bc' },
  { title: 'Confusions In Math 5-8', slug: 'confusions-in-math-5-8', desc: 'Matematik becerilerinizi sınayabileceğiniz eğlenceli bir bulmaca oyunu.', embed: 'https://gamemonetize.com/games/confusions-in-math-5-8/embed.html', age: 'baby', cat: '7cbcf228-5ee4-464d-bd43-8d0e8fe00dbd' },
  { title: 'Easiest Maths', slug: 'easiest-maths', desc: 'Basit matematik problemleriyle zihninizi çalıştırın. Eğitici oyun!', embed: 'https://gamemonetize.com/games/easiest-maths/embed.html', age: 'baby', cat: '7cbcf228-5ee4-464d-bd43-8d0e8fe00dbd' },
  { title: 'Color Jam 3D', slug: 'color-jam-3d', desc: 'Renkleri birleştirerek bulmacaları çözebileceğiniz üç boyutlu bir oyun.', embed: 'https://gamemonetize.com/games/color-jam-3d/embed.html', age: 'child', cat: '3a8adbde-474a-4f50-9930-73ddcd47c8bc' },
  { title: 'Space IO', slug: 'space-io', desc: 'Uzayda geçen çok oyunculu bir strateji oyunu. En büyük ol!', embed: 'https://gamemonetize.com/games/space-io/embed.html', age: 'adult', cat: '75518bf4-0974-4630-946b-5ad7c2308ebe' },
  { title: 'Pipe Connect Puzzle', slug: 'pipe-connect-puzzle', desc: 'Boru parçalarını doğru şekilde birleştirerek suyun akışını sağlayın.', embed: 'https://gamemonetize.com/games/pipe-connect-puzzle/embed.html', age: 'child', cat: '3a8adbde-474a-4f50-9930-73ddcd47c8bc' },
  { title: 'Cell Defense', slug: 'cell-defense', desc: 'Hücrelerinizi savunarak düşmanlara karşı mücadele edin. Strateji oyunu!', embed: 'https://gamemonetize.com/games/cell-defense/embed.html', age: 'adult', cat: 'aa450e8b-bb5e-4b6e-b5d2-feac0a1688f1' },
];

let success = 0, skip = 0, error = 0;

function addGame(game) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      title: game.title,
      slug: game.slug,
      description: game.desc,
      instructions: 'Oyunu oynamak için fare veya dokunmatik ekranı kullanın.',
      content_type: 'game',
      age_group: game.age,
      category_id: game.cat,
      thumbnail_url: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=500',
      content_url: game.embed,
      duration_minutes: 15,
      is_premium: false,
      is_featured: false,
      published: true,
      meta_title: game.title + ' - Ücretsiz Online Oyun',
      meta_description: game.desc,
      keywords: ['game'],
    });

    const options = {
      hostname: url,
      port: 443,
      path: '/rest/v1/content',
      method: 'POST',
      headers: {
        'apikey': serviceKey,
        'Authorization': 'Bearer ' + serviceKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 201 || res.statusCode === 200) {
          console.log('✅ ' + game.title);
          resolve('success');
        } else if (res.statusCode === 409) {
          console.log('⏭️  ' + game.title + ' (zaten var)');
          resolve('skip');
        } else {
          console.log('❌ ' + game.title + ': ' + res.statusCode + ' - ' + data.substring(0, 100));
          resolve('error');
        }
      });
    });

    req.on('error', (e) => {
      console.log('❌ ' + game.title + ': ' + e.message);
      resolve('error');
    });

    req.write(postData);
    req.end();
  });
}

async function run() {
  console.log('🎮 10 oyun REST API ile ekleniyor...\n');
  for (const game of games) {
    const result = await addGame(game);
    if (result === 'success') success++;
    else if (result === 'skip') skip++;
    else error++;
    await new Promise(r => setTimeout(r, 300));
  }
  console.log('\n📊 Sonuç: ✅ ' + success + ' | ⏭️  ' + skip + ' | ❌ ' + error);
}

run();

