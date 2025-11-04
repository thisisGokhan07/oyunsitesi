'use client';

import { Content } from '@/types';
import { Star, ChevronRight, Loader2, Search as SearchIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface SearchResultsProps {
  results: Content[];
  query: string;
  isSearching: boolean;
  onClose: () => void;
}

export function SearchResults({
  results,
  query,
  isSearching,
  onClose,
}: SearchResultsProps) {
  if (isSearching) {
    return (
      <div className="absolute top-full mt-2 w-full bg-card border border-white/10 rounded-xl shadow-2xl z-50">
        <div className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-gray-400 mt-2">Aranıyor...</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="absolute top-full mt-2 w-full bg-card border border-white/10 rounded-xl shadow-2xl z-50">
        <div className="p-8 text-center">
          <SearchIcon className="w-12 h-12 mx-auto text-gray-600 mb-2" />
          <p className="text-gray-400">Sonuç bulunamadı</p>
          <p className="text-sm text-gray-500 mt-1">
            &quot;{query}&quot; için oyun bulunamadı
          </p>
        </div>
      </div>
    );
  }

  const displayResults = results.slice(0, 5);

  return (
    <div className="absolute top-full mt-2 w-full bg-card border border-white/10 rounded-xl shadow-2xl max-h-[500px] overflow-y-auto z-50">
      <div className="p-4 border-b border-white/10">
        <p className="text-sm text-gray-400">{results.length} sonuç bulundu</p>
      </div>

      <div className="divide-y divide-white/5">
        {displayResults.map((game) => (
          <Link
            key={game.id}
            href={`/oyunlar/${game.slug}`}
            onClick={onClose}
            className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors"
          >
            <img
              src={game.thumbnail_url}
              alt={game.title}
              className="w-20 h-14 object-cover rounded-lg flex-shrink-0"
            />

            <div className="flex-1 min-w-0">
              <h4 className="font-semibold truncate">{game.title}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                  {(game.rating || 0).toFixed(1)}
                </span>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
          </Link>
        ))}
      </div>

      {results.length > 5 && (
        <Link
          href={`/arama?q=${encodeURIComponent(query)}`}
          onClick={onClose}
          className="block p-4 text-center text-primary hover:text-primary/80 font-medium border-t border-white/10"
        >
          Tüm Sonuçları Gör ({results.length})
        </Link>
      )}
    </div>
  );
}
