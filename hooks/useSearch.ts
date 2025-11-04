import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { ContentRow } from '@/types/database';

export function useSearch(query: string) {
  const [results, setResults] = useState<ContentRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length > 0) {
      searchContent(query);
    } else {
      setResults([]);
    }
  }, [query]);

  async function searchContent(searchQuery: string) {
    try {
      setLoading(true);

      const { data } = await supabase
        .from('content')
        .select('*')
        .eq('published', true)
        .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .order('play_count', { ascending: false })
        .limit(20);

      setResults(data || []);
    } finally {
      setLoading(false);
    }
  }

  return { results, loading };
}
