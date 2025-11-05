'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Menu, X as XIcon, Gamepad2, ChevronDown, Clock, User, Heart, History, Settings, LogOut, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/AuthModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SearchResults } from '@/components/SearchResults';
import { useDebounce } from '@/hooks/use-debounce';
import { searchGames, saveRecentSearch, getRecentSearches, trackSearch } from '@/lib/search';
import { searchContent, getAllCategories } from '@/lib/data-service';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useTranslation } from '@/contexts/TranslationContext';

export function Header() {
  const { user, profile, signOut, isAdmin, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
    async function loadCategories() {
      try {
        const data = await getAllCategories();
        setCategories((data as any) || []);
      } catch (error) {
        console.error('Categories load error:', error);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    async function performSearch() {
      if (debouncedQuery.trim()) {
        setIsSearching(true);
        try {
          const results = await searchContent(debouncedQuery);
          setSearchResults((results as any) || []);
          trackSearch(debouncedQuery, results.length);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setIsSearching(false);
      }
    }
    performSearch();
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }

      if (e.key === 'Escape') {
        setShowResults(false);
        searchInputRef.current?.blur();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSearchFocus = () => {
    setShowResults(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowResults(true);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    searchInputRef.current?.focus();
  };

  const handleCloseResults = () => {
    setShowResults(false);
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery);
      setRecentSearches(getRecentSearches());
    }
  };

  const handleRecentSearchClick = (query: string) => {
    setSearchQuery(query);
    searchInputRef.current?.focus();
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/95 backdrop-blur-md shadow-lg' : 'bg-background'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <a href="/" className="flex items-center gap-2">
            <Gamepad2 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-extrabold text-foreground">
              Seri<span className="text-primary">Game</span>
            </span>
          </a>

          <div className="hidden lg:flex items-center flex-1 max-w-2xl mx-8">
            <div className="relative w-full" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none z-10" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Oyun ara... (Ctrl+K)"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                className="w-full pl-10 pr-10 h-12 bg-card border-border focus:border-primary"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10"
                >
                  <XIcon className="w-4 h-4 text-gray-400 hover:text-white" />
                </button>
              )}

              {showResults && searchQuery && (
                <SearchResults
                  results={searchResults}
                  query={searchQuery}
                  isSearching={isSearching}
                  onClose={handleCloseResults}
                />
              )}

              {showResults && !searchQuery && recentSearches.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-card border border-white/10 rounded-xl shadow-2xl z-50 p-4">
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">
                    Son Aramalar
                  </h4>
                  {recentSearches.map((query, index) => (
                    <button
                      key={index}
                      onClick={() => handleRecentSearchClick(query)}
                      className="block w-full text-left px-3 py-2 hover:bg-white/5 rounded text-sm"
                    >
                      <Clock className="w-4 h-4 inline mr-2 text-gray-500" />
                      {query}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-2">
            <LanguageSelector />
            <div 
              className="relative"
              onMouseEnter={() => setIsCategoriesOpen(true)}
              onMouseLeave={() => setIsCategoriesOpen(false)}
            >
              <Button
                variant="ghost"
                className="gap-2"
              >
                {t('header', 'categories', 'Kategoriler')}
                <ChevronDown className="h-4 w-4" />
              </Button>

              {isCategoriesOpen && (
                <div className="absolute top-full left-0 pt-2 w-72 z-50">
                  <div className="bg-card rounded-lg shadow-2xl border border-border p-4 grid grid-cols-1 gap-2">
                    {categories.slice(0, 8).map((category) => (
                      <Link
                        key={category.id}
                        href={`/kategori/${category.slug}`}
                        onClick={() => setIsCategoriesOpen(false)}
                        className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors cursor-pointer"
                      >
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: category.color_hex || '#666' }}
                        />
                        <span className="text-sm flex-1">{category.name}</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {category.content_count}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {authLoading ? (
              <div className="w-10 h-10 rounded-full bg-gray-800 animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                      <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.display_name || ''} />
                      <AvatarFallback className="bg-primary">
                        {profile?.display_name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{profile?.display_name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      {profile?.is_premium && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gradient-to-r from-yellow-500 to-primary text-white w-fit">
                          ⭐ Premium
                        </span>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profil" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profilim
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/favoriler" className="cursor-pointer">
                      <Heart className="mr-2 h-4 w-4" />
                      Favorilerim
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/gecmis" className="cursor-pointer">
                      <History className="mr-2 h-4 w-4" />
                      İzleme Geçmişi
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/ayarlar" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Ayarlar
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer text-primary">
                          <Shield className="mr-2 h-4 w-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="cursor-pointer text-red-500"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Çıkış Yap
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <AuthModal />
            )}
          </nav>

          <button
            className="lg:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <XIcon className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden pb-4 space-y-4 animate-in slide-in-from-top">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Oyun ara..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 h-12 bg-card border-border"
              />
            </div>

            <div className="space-y-2">
              <div className="text-sm font-semibold text-muted-foreground px-2">
                Kategoriler
              </div>
              {categories.slice(0, 6).map((category) => (
                <a
                  key={category.id}
                  href={`/kategori/${category.slug}`}
                  className="flex items-center gap-3 p-3 rounded-md hover:bg-muted transition-colors"
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: category.color_hex || '#666' }}
                  />
                  <span className="text-sm">{category.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {category.content_count}
                  </span>
                </a>
              ))}
            </div>

            {user ? (
              <div className="flex items-center gap-3 p-3 bg-card rounded-lg">
                <Avatar>
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary">
                    {profile?.display_name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{profile?.display_name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
            ) : (
              <AuthModal trigger={
                <Button className="w-full bg-primary hover:bg-primary/90 text-white font-semibold h-12">
                  Giriş Yap
                </Button>
              } />
            )}
          </div>
        )}
      </div>
    </header>
  );
}
