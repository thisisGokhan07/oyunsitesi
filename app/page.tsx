'use client';

import { useState } from 'react';
import { Gamepad2, Grid3x3 } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AgeGroupTabs } from '@/components/AgeGroupTabs';
import { ContentCard } from '@/components/ContentCard';
import { CategoryCard } from '@/components/CategoryCard';
import { Button } from '@/components/ui/button';
import { mockContent, mockCategories } from '@/lib/mock-data';
import { AgeGroup } from '@/types';

export default function Home() {
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeGroup | 'all'>('all');

  const filterByAgeGroup = (items: typeof mockContent) => {
    if (selectedAgeGroup === 'all') return items;
    return items.filter((item) => item.age_group === selectedAgeGroup);
  };

  const popularContent = filterByAgeGroup(
    [...mockContent].sort((a, b) => b.play_count - a.play_count).slice(0, 16)
  );

  const newContent = filterByAgeGroup(
    [...mockContent].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ).slice(0, 16)
  );

  const scrollToGames = () => {
    document.getElementById('games-section')?.scrollIntoView({ behavior: 'smooth' });
  };

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
            <div className="pt-2">
              <Button
                size="lg"
                onClick={scrollToGames}
                className="bg-white text-primary hover:bg-white/90 font-bold text-base px-6 h-12 shadow-xl"
              >
                Oyunları Gör
              </Button>
            </div>
          </div>
        </section>

        <AgeGroupTabs onSelectAgeGroup={setSelectedAgeGroup} />

        <section id="games-section" className="container py-6">
          <div className="flex items-center gap-2 mb-4">
            <Gamepad2 className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Popüler Oyunlar</h2>
          </div>

          {popularContent.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">
                Bu kategoride henüz içerik bulunmuyor.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 md:gap-4">
              {popularContent.map((content) => (
                <ContentCard key={content.id} content={content} />
              ))}
            </div>
          )}
        </section>

        <section className="container py-6">
          <div className="flex items-center gap-2 mb-4">
            <Gamepad2 className="h-5 w-5 text-accent" />
            <h2 className="text-xl font-bold">Yeni Eklenenler</h2>
          </div>

          {newContent.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">
                Bu kategoride henüz içerik bulunmuyor.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 md:gap-4">
              {newContent.map((content) => (
                <ContentCard key={content.id} content={content} />
              ))}
            </div>
          )}
        </section>

        <section className="container py-6">
          <div className="flex items-center gap-2 mb-4">
            <Grid3x3 className="h-5 w-5 text-secondary" />
            <h2 className="text-xl font-bold">Kategoriler</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {mockCategories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
