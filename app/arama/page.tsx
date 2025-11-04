'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useMemo, useEffect } from 'react';
import { Search as SearchIcon, Grid3x3, List, Filter } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ContentCard } from '@/components/ContentCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { searchContent, getAllCategories } from '@/lib/data-service';
import type { Content, Category } from '@/types';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(query);
  const [results, setResults] = useState<Content[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('popular');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterAgeGroup, setFilterAgeGroup] = useState<string>('all');
  const [filterContentType, setFilterContentType] = useState<string>('all');
  const [filterPremium, setFilterPremium] = useState<string>('all');

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
    loadCategories();
  }, [query]);

  async function loadCategories() {
    try {
      const data = await getAllCategories();
      setCategories((data as any) || []);
    } catch (error) {
      console.error('Categories load error:', error);
    }
  }

  async function performSearch(term: string) {
    if (!term.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const data = await searchContent(term);
      setResults(data as any);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.history.pushState({}, '', `/arama?q=${encodeURIComponent(searchTerm)}`);
      performSearch(searchTerm);
    }
  };

  const filteredAndSorted = useMemo(() => {
    let filtered = [...results];

    // Apply filters
    if (filterCategory !== 'all') {
      filtered = filtered.filter(c => c.category_id === filterCategory);
    }
    if (filterAgeGroup !== 'all') {
      filtered = filtered.filter(c => c.age_group === filterAgeGroup);
    }
    if (filterContentType !== 'all') {
      filtered = filtered.filter(c => c.content_type === filterContentType);
    }
    if (filterPremium !== 'all') {
      filtered = filtered.filter(c => 
        filterPremium === 'premium' ? c.is_premium : !c.is_premium
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.play_count - a.play_count);
        break;
      case 'newest':
        filtered.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title, 'tr'));
        break;
      default:
        break;
    }

    return filtered;
  }, [results, filterCategory, filterAgeGroup, filterContentType, filterPremium, sortBy]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-16 lg:pt-20">
        <div className="container py-6">
          <div className="mb-6">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="flex-1 relative">
                <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Oyun ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                Ara
              </Button>
            </form>
          </div>

          {!query ? (
            <div className="text-center py-16">
              <SearchIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <h1 className="text-2xl font-bold mb-2">Arama yapın</h1>
              <p className="text-gray-400">
                Yukarıdaki arama kutusunu kullanarak oyun arayın
              </p>
            </div>
          ) : loading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Aranıyor...</p>
            </div>
          ) : filteredAndSorted.length === 0 ? (
            <div className="text-center py-16">
              <SearchIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <h1 className="text-2xl font-bold mb-2">Sonuç Bulunamadı</h1>
              <p className="text-gray-400">
                &quot;{query}&quot; için oyun bulunamadı
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Farklı anahtar kelimeler veya filtreler deneyin
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 flex flex-wrap gap-2">
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Kategoriler</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterAgeGroup} onValueChange={setFilterAgeGroup}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Yaş Grubu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Yaşlar</SelectItem>
                      <SelectItem value="baby">Bebek</SelectItem>
                      <SelectItem value="child">Çocuk</SelectItem>
                      <SelectItem value="adult">Yetişkin</SelectItem>
                      <SelectItem value="family">Aile</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterContentType} onValueChange={setFilterContentType}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Tip" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Tipler</SelectItem>
                      <SelectItem value="game">Oyun</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="audio_story">Sesli Masal</SelectItem>
                      <SelectItem value="coloring_book">Boyama</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterPremium} onValueChange={setFilterPremium}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Premium" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tümü</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="free">Ücretsiz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popular">En Popüler</SelectItem>
                      <SelectItem value="newest">En Yeni</SelectItem>
                      <SelectItem value="rating">En Yüksek Puanlı</SelectItem>
                      <SelectItem value="alphabetical">Alfabetik</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-1 border rounded-lg p-1">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid3x3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-400">
                  <strong className="text-white">{filteredAndSorted.length}</strong> sonuç bulundu
                  {query && ` "${query}" için`}
                </p>
              </div>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {filteredAndSorted.map((content) => (
                    <ContentCard key={content.id} content={content} />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAndSorted.map((content) => (
                    <Card key={content.id} className="bg-card border-white/10">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={content.thumbnail_url}
                            alt={content.title}
                            className="w-24 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold">{content.title}</h3>
                            <p className="text-sm text-gray-400 line-clamp-1">
                              {content.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">{content.content_type}</Badge>
                              <Badge variant="outline">{content.age_group}</Badge>
                              {content.is_premium && (
                                <Badge className="bg-orange-500">Premium</Badge>
                              )}
                            </div>
                          </div>
                          <a href={`/oyunlar/${content.slug}`}>
                            <Button size="sm">Oyna</Button>
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
