'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useMemo } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CategoryPageClient } from '@/components/CategoryPageClient';
import { mockContent } from '@/lib/mock-data';
import { searchGames } from '@/lib/search';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const searchResults = useMemo(() => {
    if (!query) return [];
    return searchGames(query, mockContent);
  }, [query]);

  const mockCategory = {
    id: 'search',
    name: `"${query}" için Arama Sonuçları`,
    slug: 'arama',
    description: `${searchResults.length} oyun bulundu`,
    age_group: 'child' as const,
    icon_name: 'Search',
    color_hex: '#FF6B35',
    content_count: searchResults.length,
    sort_order: 0,
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-16 lg:pt-20">
        <div className="container py-6">
          {!query ? (
            <div className="text-center py-16">
              <SearchIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <h1 className="text-2xl font-bold mb-2">Arama yapın</h1>
              <p className="text-gray-400">
                Yukarıdaki arama kutusunu kullanarak oyun arayın
              </p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-16">
              <SearchIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <h1 className="text-2xl font-bold mb-2">Sonuç Bulunamadı</h1>
              <p className="text-gray-400">
                &quot;{query}&quot; için oyun bulunamadı
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Farklı anahtar kelimeler deneyin
              </p>
            </div>
          ) : (
            <CategoryPageClient category={mockCategory} games={searchResults} />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
