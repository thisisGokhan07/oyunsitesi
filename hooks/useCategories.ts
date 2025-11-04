import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { CategoryRow } from '@/types/database';

export function useCategories() {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('published', true)
        .order('sort_order', { ascending: true });

      setCategories(data || []);
    } finally {
      setLoading(false);
    }
  }

  return { categories, loading };
}

export function useCategoryBySlug(slug: string) {
  const [category, setCategory] = useState<CategoryRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) fetchCategory();
  }, [slug]);

  async function fetchCategory() {
    try {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .maybeSingle();

      setCategory(data);
    } finally {
      setLoading(false);
    }
  }

  return { category, loading };
}
