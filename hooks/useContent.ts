import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { ContentRow } from '@/types/database';

export function useContent() {
  const [content, setContent] = useState<ContentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchContent();
  }, []);

  async function fetchContent() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContent(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }

  return { content, loading, error, refetch: fetchContent };
}

export function useContentBySlug(slug: string) {
  const [content, setContent] = useState<ContentRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (slug) fetchContent();
  }, [slug]);

  async function fetchContent() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const contentData = data as ContentRow;
        try {
          await (supabase.rpc as any)('increment_play_count', { content_id: contentData.id });
        } catch (rpcError) {
          console.log('Could not increment play count');
        }
        setContent(contentData);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }

  return { content, loading, error };
}

export function useContentByCategory(categoryId: string) {
  const [content, setContent] = useState<ContentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (categoryId) fetchContent();
  }, [categoryId]);

  async function fetchContent() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .eq('category_id', categoryId)
        .eq('published', true)
        .order('play_count', { ascending: false });

      if (error) throw error;
      setContent(data || []);
    } finally {
      setLoading(false);
    }
  }

  return { content, loading };
}

export function useFeaturedContent(limit: number = 5) {
  const [content, setContent] = useState<ContentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  async function fetchContent() {
    try {
      const { data } = await supabase
        .from('content')
        .select('*')
        .eq('is_featured', true)
        .eq('published', true)
        .limit(limit);

      setContent(data || []);
    } finally {
      setLoading(false);
    }
  }

  return { content, loading };
}

export function useRelatedContent(
  contentId: string,
  categoryId: string,
  limit: number = 8
) {
  const [content, setContent] = useState<ContentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (contentId && categoryId) fetchContent();
  }, [contentId, categoryId]);

  async function fetchContent() {
    try {
      const { data } = await supabase
        .from('content')
        .select('*')
        .eq('category_id', categoryId)
        .eq('published', true)
        .neq('id', contentId)
        .order('play_count', { ascending: false })
        .limit(limit);

      setContent(data || []);
    } finally {
      setLoading(false);
    }
  }

  return { content, loading };
}
