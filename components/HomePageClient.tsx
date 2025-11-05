'use client';

import { useState } from 'react';
import { Gamepad2, Grid3x3 } from 'lucide-react';
import { AgeGroupTabs } from '@/components/AgeGroupTabs';
import { ContentCard } from '@/components/ContentCard';
import { CategoryCard } from '@/components/CategoryCard';
import { Button } from '@/components/ui/button';
import { AgeGroup } from '@/types';
import type { Content, Category } from '@/types';

interface HomePageClientProps {
  initialContent: Content[];
  initialCategories: Category[];
  popularContent: Content[];
  newContent: Content[];
}

export function HomePageClient({
  initialContent,
  initialCategories,
  popularContent: initialPopularContent,
  newContent: initialNewContent,
}: HomePageClientProps) {
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeGroup | 'all'>('all');

  const filterByAgeGroup = (items: Content[]) => {
    if (selectedAgeGroup === 'all') return items;
    return items.filter((item) => item.age_group === selectedAgeGroup);
  };

  const popularContent = filterByAgeGroup(initialPopularContent);
  const newContent = filterByAgeGroup(initialNewContent);

  const scrollToGames = () => {
    document.getElementById('games-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <div className="pt-2">
        <Button
          size="lg"
          onClick={scrollToGames}
          className="bg-white text-primary hover:bg-white/90 font-bold text-base px-6 h-12 shadow-xl"
        >
          Oyunları Gör
        </Button>
      </div>

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
          {initialCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>
    </>
  );
}


