import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { GameDetailClient } from '@/components/GameDetailClient';
import { mockContent } from '@/lib/mock-data';

export function generateStaticParams() {
  return mockContent.map((game) => ({
    slug: game.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const game = mockContent.find((g) => g.slug === params.slug);

  if (!game) {
    return {
      title: 'Oyun Bulunamadı | SeriGame',
    };
  }

  return {
    title: `${game.title} - Ücretsiz Oyna | SeriGame`,
    description: game.description || '',
    keywords: game.keywords ? game.keywords.join(', ') : [
      game.title,
      'ücretsiz oyun',
      'online oyun',
      'tarayıcı oyunu',
      'oyna',
      'SeriGame',
    ].join(', '),
    openGraph: {
      title: game.title,
      description: game.description || '',
      images: [game.thumbnail_url],
      type: 'website',
      siteName: 'SeriGame',
    },
    twitter: {
      card: 'summary_large_image',
      title: game.title,
      description: game.description || '',
      images: [game.thumbnail_url],
    },
  };
}

export default function GameDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const game = mockContent.find((g) => g.slug === params.slug);

  if (!game) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Oyun bulunamadı</h1>
            <p className="text-muted-foreground">Aradığınız oyun mevcut değil.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const relatedGames = mockContent
    .filter((g) => g.category_id === game.category_id && g.id !== game.id)
    .sort((a, b) => b.play_count - a.play_count)
    .slice(0, 8);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-16 lg:pt-20">
        <div className="container py-6">
          <GameDetailClient game={game} relatedGames={relatedGames} />
        </div>
      </main>

      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'VideoGame',
            name: game.title,
            description: game.description,
            image: game.thumbnail_url,
            playMode: 'SinglePlayer',
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: game.rating,
              ratingCount: game.rating_count || 0,
            },
          }),
        }}
      />
    </div>
  );
}
