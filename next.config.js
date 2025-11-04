/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export' - Dev modunda kapatıldı, production build için açılacak
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

// Production build için export modunu etkinleştir
if (process.env.NODE_ENV === 'production') {
  nextConfig.output = 'export';
}

module.exports = nextConfig;
