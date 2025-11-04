'use client';

import { useState, useMemo } from 'react';
import * as Icons from 'lucide-react';
import {
  Users,
  Star,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Frown,
} from 'lucide-react';
import { ContentCard } from '@/components/ContentCard';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Category, Content, AgeGroup } from '@/types';

interface CategoryPageClientProps {
  category: Category;
  games: Content[];
}

const ITEMS_PER_PAGE = 20;

export function CategoryPageClient({
  category,
  games,
}: CategoryPageClientProps) {
  const [ageFilter, setAgeFilter] = useState<AgeGroup | 'all'>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [currentPage, setCurrentPage] = useState(1);

  const IconComponent = Icons[(category.icon_name || 'Gamepad2') as keyof typeof Icons] as React.ComponentType<{
    className?: string;
  }>;

  const filteredAndSortedGames = useMemo(() => {
    let filtered = [...games];

    if (ageFilter !== 'all') {
      filtered = filtered.filter((g) => g.age_group === ageFilter);
    }

    if (ratingFilter === '4plus') {
      filtered = filtered.filter((g) => (g.rating || 0) >= 4);
    } else if (ratingFilter === '3plus') {
      filtered = filtered.filter((g) => (g.rating || 0) >= 3);
    }

    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.play_count - a.play_count);
        break;
      case 'newest':
        filtered.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title, 'tr'));
        break;
    }

    return filtered;
  }, [games, ageFilter, ratingFilter, sortBy]);

  const totalPages = Math.ceil(filteredAndSortedGames.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentGames = filteredAndSortedGames.slice(startIndex, endIndex);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <>
      <div className="bg-gradient-to-br from-primary/20 via-secondary/20 to-background rounded-xl p-6 md:p-8 mb-6 border border-white/10">
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: category.color_hex || '#f97316' }}
          >
            {IconComponent && <IconComponent className="w-8 h-8 text-white" />}
          </div>

          <div>
            <h1 className="text-3xl md:text-4xl font-bold">{category.name}</h1>
            <p className="text-gray-400">
              {filteredAndSortedGames.length} oyun
            </p>
          </div>
        </div>

        <p className="text-gray-300 max-w-2xl">
          {category.name} kategorisinde en popüler ve en yeni oyunları
          keşfedin. Tüm oyunlar ücretsiz ve indirme gerektirmez!
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 p-4 bg-card rounded-lg border border-white/10 sticky top-16 lg:top-20 z-30">
        <div className="flex flex-wrap gap-2">
          <Select value={ageFilter} onValueChange={(v) => setAgeFilter(v as AgeGroup | 'all')}>
            <SelectTrigger className="w-[140px]">
              <Users className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Yaş Grubu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="baby">👶 Bebekler</SelectItem>
              <SelectItem value="child">🧒 Çocuklar</SelectItem>
              <SelectItem value="adult">🧠 Yetişkinler</SelectItem>
              <SelectItem value="family">👨‍👩‍👧‍👦 Aile</SelectItem>
            </SelectContent>
          </Select>

          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger className="w-[140px]">
              <Star className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Değerlendirme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="4plus">⭐ 4+ Yıldız</SelectItem>
              <SelectItem value="3plus">⭐ 3+ Yıldız</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <ArrowUpDown className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Sırala" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">🔥 En Popüler</SelectItem>
            <SelectItem value="newest">✨ En Yeni</SelectItem>
            <SelectItem value="rating">⭐ En Yüksek Puan</SelectItem>
            <SelectItem value="title">🔤 İsme Göre</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {currentGames.length === 0 ? (
        <div className="text-center py-16">
          <Frown className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Oyun Bulunamadı</h3>
          <p className="text-gray-400">Filtreleri değiştirmeyi deneyin</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {currentGames.map((game) => (
              <ContentCard key={game.id} content={game} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex flex-wrap justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => {
                  setCurrentPage(currentPage - 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="min-w-[100px]"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Önceki
              </Button>

              {getPageNumbers().map((page, index) =>
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                    ...
                  </span>
                ) : (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    onClick={() => {
                      setCurrentPage(page as number);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={
                      currentPage === page
                        ? 'bg-primary hover:bg-primary/90'
                        : ''
                    }
                  >
                    {page}
                  </Button>
                )
              )}

              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => {
                  setCurrentPage(currentPage + 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="min-w-[100px]"
              >
                Sonraki
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
}
