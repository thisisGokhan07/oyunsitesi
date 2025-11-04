import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CategoryPageClient } from '@/components/CategoryPageClient';
import { getCategoryBySlug, getContentByCategory, getAllCategories } from '@/lib/data-service';

export async function generateStaticParams() {
  try {
    const allCategories = await getAllCategories();
    return (allCategories as any[]).map((category) => ({
      slug: category.slug,
    }));
  } catch (error) {
    console.error('Error generating static params for categories:', error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const category = await getCategoryBySlug(params.slug);

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

export default async function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const category = await getCategoryBySlug(params.slug);

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

  const categoryGames = await getContentByCategory(params.slug);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-16 lg:pt-20">
        <div className="container py-6">
          <CategoryPageClient category={category as any} games={categoryGames as any} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
