import { Content } from '@/types';

export function searchGames(query: string, allGames: Content[]): Content[] {
  const lowercaseQuery = query.toLowerCase().trim();

  if (!lowercaseQuery) return [];

  const scored = allGames.map((game) => {
    let score = 0;
    const titleLower = game.title.toLowerCase();
    const descLower = game.description?.toLowerCase() || '';

    if (titleLower === lowercaseQuery) {
      score += 100;
    } else if (titleLower.startsWith(lowercaseQuery)) {
      score += 50;
    } else if (titleLower.includes(lowercaseQuery)) {
      score += 30;
    }

    if (descLower.includes(lowercaseQuery)) {
      score += 10;
    }

    score += Math.log(game.play_count + 1) * 0.1;

    return { game, score };
  });

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.game);
}

export function saveRecentSearch(query: string): void {
  if (typeof window === 'undefined') return;

  try {
    const recent = JSON.parse(
      localStorage.getItem('recentSearches') || '[]'
    ) as string[];
    const updated = [query, ...recent.filter((q) => q !== query)].slice(0, 5);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save recent search:', error);
  }
}

export function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];

  try {
    return JSON.parse(localStorage.getItem('recentSearches') || '[]') as string[];
  } catch (error) {
    console.error('Failed to get recent searches:', error);
    return [];
  }
}

export function trackSearch(query: string, resultCount: number): void {
  console.log('Search tracked:', { query, resultCount, timestamp: new Date() });
}
