import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SeriGame - Türkiye\'nin En Eğlenceli Oyun ve Eğlence Platformu',
  description: 'Bebekler, çocuklar, yetişkinler ve tüm aile için 1000+ ücretsiz oyun ve eğlence içeriği. Eğitici oyunlar, zeka oyunları, bulmacalar ve daha fazlası!',
  keywords: ['oyun', 'çocuk oyunları', 'bebek oyunları', 'eğitici oyunlar', 'zeka oyunları', 'aile oyunları', 'ücretsiz oyunlar', 'Türkiye'],
  authors: [{ name: 'SeriGame' }],
  openGraph: {
    title: 'SeriGame - Tüm Aile İçin Eğlence ve Oyun',
    description: 'Türkiye\'nin en büyük aile dostu oyun platformu. 1000+ ücretsiz içerik!',
    type: 'website',
    locale: 'tr_TR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SeriGame - Tüm Aile İçin Eğlence ve Oyun',
    description: 'Türkiye\'nin en büyük aile dostu oyun platformu.',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="dark">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster position="bottom-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
