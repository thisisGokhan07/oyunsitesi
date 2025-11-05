import { supabase } from './supabase/client';
import type { ContentRow, CategoryRow } from '@/types/database';

export async function getAllContent(): Promise<ContentRow[]> {
  try {
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching content:', error);
    return [];
  }
}

export async function getAllCategories(): Promise<CategoryRow[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('published', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function getContentBySlug(slug: string): Promise<ContentRow | null> {
  try {
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .maybeSingle();

    if (error) throw error;

    if (!data) return null;

    const contentData = data as ContentRow;
    try {
      await (supabase.rpc as any)('increment_play_count', { content_id: contentData.id });
    } catch (rpcError) {
      console.log('Could not increment play count:', rpcError);
    }

    return contentData;
  } catch (error) {
    console.error('Error fetching content:', error);
    return null;
  }
}

export async function getCategoryBySlug(slug: string): Promise<CategoryRow | null> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .maybeSingle();

    if (error) throw error;

    return data || null;
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
}

export async function getContentByCategory(categorySlug: string): Promise<ContentRow[]> {
  try {
    const category = await getCategoryBySlug(categorySlug);
    if (!category) return [];

    const { data, error } = await supabase
      .from('content')
      .select('*')
      .eq('category_id', category.id)
      .eq('published', true)
      .order('play_count', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching content by category:', error);
    return [];
  }
}

export async function searchContent(query: string): Promise<ContentRow[]> {
  try {
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .eq('published', true)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('play_count', { ascending: false })
      .limit(20);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error searching content:', error);
    return [];
  }
}
