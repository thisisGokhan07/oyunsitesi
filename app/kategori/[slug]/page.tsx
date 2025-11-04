import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CategoryPageClient } from '@/components/CategoryPageClient';
import { mockCategories, mockContent } from '@/lib/mock-data';

export function generateStaticParams() {
  return mockCategories.map((category) => ({
    slug: category.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const category = mockCategories.find((c) => c.slug === params.slug);

  if (!category) {
    return {
      title: 'Kategori Bulunamadı | SeriGame',
    };
  }

  return {
    title: `${category.name} - ${category.content_count} Oyun | SeriGame`,
    description: `${category.name} kategorisinde ${category.content_count} ücretsiz oyun. Hemen oyna, indirme gerektirmez! Eğitici ve eğlenceli oyunlar SeriGame'de.`,
    keywords: [
      category.name,
      'ücretsiz oyunlar',
      'online oyunlar',
      'tarayıcı oyunları',
      'SeriGame',
    ].join(', '),
    openGraph: {
      title: `${category.name} - ${category.content_count} Oyun`,
      description: `${category.name} kategorisinde ${category.content_count} ücretsiz oyun`,
      type: 'website',
      siteName: 'SeriGame',
    },
  };
}

export default function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const category = mockCategories.find((c) => c.slug === params.slug);

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Kategori bulunamadı</h1>
            <p className="text-muted-foreground">
              Aradığınız kategori mevcut değil.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const categoryGames = mockContent.filter(
    (game) => game.category_id === category.id
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-16 lg:pt-20">
        <div className="container py-6">
          <CategoryPageClient category={category} games={categoryGames} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
