import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { getAllContent, getAllCategories } from '@/lib/data-service';
import type { Content, Category } from '@/types';
import { HomePageClient } from '@/components/HomePageClient';

export default async function Home() {
  // Server-side'da veritabanından direkt çek
  const [contentData, categoriesData] = await Promise.all([
    getAllContent(),
    getAllCategories(),
  ]);

  const content = (contentData || []) as Content[];
  const categories = (categoriesData || []) as Category[];

  // Popüler oyunlar (play_count'a göre)
  const popularContent = [...content]
    .filter(c => c && (c.play_count || 0) >= 0)
    .sort((a, b) => (b.play_count || 0) - (a.play_count || 0))
    .slice(0, 16);

  // Yeni eklenenler (created_at'e göre)
  const newContent = [...content]
    .filter(c => c && c.created_at)
    .sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 16);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-16 lg:pt-20">
        <section className="gradient-hero py-8 md:py-10">
          <div className="container text-center space-y-3">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
              1000+ Ücretsiz Oyun
            </h1>
            <p className="text-sm md:text-base text-white/90">
              Hemen oyna, indirme gerektirmez
            </p>
          </div>
        </section>

        <HomePageClient
          initialContent={content}
          initialCategories={categories}
          popularContent={popularContent}
          newContent={newContent}
        />
      </main>

      <Footer />
    </div>
  );
}
