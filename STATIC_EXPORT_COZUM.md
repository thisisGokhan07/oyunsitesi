# 🔧 Static Export 404 Hatası Çözümü

## Sorun
`output: 'export'` konfigürasyonu dev modunda (`next dev`) çalışmaz. Bu yüzden CSS ve JS dosyaları 404 hatası veriyor.

## Çözüm

### 1. **next.config.js Güncellemesi**
`output: 'export'` sadece production build için kullanılmalı. Dev modunda kapatıldı:

```javascript
const nextConfig = {
  // output: 'export' - Dev modunda kapatıldı
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

// Production build için export modunu etkinleştir
if (process.env.NODE_ENV === 'production') {
  nextConfig.output = 'export';
}
```

### 2. **Kullanım**

#### Development (Dev Server):
```bash
npm run dev
```
- `output: 'export'` kapalı
- Normal dev server çalışır
- Hot reload çalışır

#### Production Build:
```bash
npm run build
```
- `output: 'export'` otomatik açılır
- Static HTML dosyaları oluşturulur
- `out/` klasöründe export edilir

## ✅ Sonuç

- ✅ Dev modunda normal çalışır
- ✅ Production build'de static export yapar
- ✅ 404 hataları çözüldü

---

**Not:** Production'a deploy ederken `npm run build` çalıştırın, `out/` klasöründeki dosyaları sunucuya yükleyin.

