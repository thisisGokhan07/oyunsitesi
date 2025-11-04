import { supabase } from './supabase/client';
import { mockContent, mockCategories } from './mock-data';
import type { ContentRow, CategoryRow } from '@/types/database';
import type { Content, Category } from '@/types';

function convertMockContentToDb(mock: Content): ContentRow {
  return {
    id: mock.id,
    title: mock.title,
    slug: mock.slug,
    description: mock.description,
    instructions: mock.instructions || null,
    content_type: mock.content_type,
    age_group: mock.age_group,
    category_id: mock.category_id,
    thumbnail_url: mock.thumbnail_url,
    content_url: mock.content_url,
    duration_minutes: mock.duration_minutes,
    play_count: mock.play_count,
    rating: mock.rating,
    rating_count: mock.rating_count,
    is_premium: mock.is_premium,
    is_featured: mock.is_featured,
    published: mock.published,
    meta_title: mock.meta_title,
    meta_description: mock.meta_description,
    keywords: mock.keywords,
    created_at: mock.created_at,
    updated_at: mock.updated_at,
    created_by: mock.created_by,
  };
}

function convertMockCategoryToDb(mock: Category): CategoryRow {
  return {
    id: mock.id,
    name: mock.name,
    slug: mock.slug,
    description: mock.description,
    age_group: mock.age_group,
    icon_name: mock.icon_name,
    color_hex: mock.color_hex,
    content_count: mock.content_count,
    sort_order: mock.sort_order,
    published: mock.published,
    created_at: mock.created_at,
    updated_at: mock.updated_at,
  };
}

export async function getAllContent(): Promise<ContentRow[]> {
  try {
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      console.log('Database empty, using mock data');
      return mockContent.map(convertMockContentToDb);
    }

    return data;
  } catch (error) {
    console.error('Error fetching content:', error);
    return mockContent.map(convertMockContentToDb);
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

    if (!data || data.length === 0) {
      console.log('Database empty, using mock categories');
      return mockCategories.map(convertMockCategoryToDb);
    }

    return data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return mockCategories.map(convertMockCategoryToDb);
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

    if (!data) {
      const mockItem = mockContent.find((c) => c.slug === slug);
      return mockItem ? convertMockContentToDb(mockItem) : null;
    }

    const contentData = data as ContentRow;
    try {
      await (supabase.rpc as any)('increment_play_count', { content_id: contentData.id });
    } catch (rpcError) {
      console.log('Could not increment play count:', rpcError);
    }

    return contentData;
  } catch (error) {
    console.error('Error fetching content:', error);
    const mockItem = mockContent.find((c) => c.slug === slug);
    return mockItem ? convertMockContentToDb(mockItem) : null;
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

    if (!data) {
      const mockItem = mockCategories.find((c) => c.slug === slug);
      return mockItem ? convertMockCategoryToDb(mockItem) : null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching category:', error);
    const mockItem = mockCategories.find((c) => c.slug === slug);
    return mockItem ? convertMockCategoryToDb(mockItem) : null;
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

    if (!data || data.length === 0) {
      return mockContent
        .filter((c) => c.category_id === category.id)
        .map(convertMockContentToDb);
    }

    return data;
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

    if (!data || data.length === 0) {
      const lowercaseQuery = query.toLowerCase();
      return mockContent
        .filter(
          (c) =>
            c.title.toLowerCase().includes(lowercaseQuery) ||
            (c.description && c.description.toLowerCase().includes(lowercaseQuery))
        )
        .map(convertMockContentToDb)
        .slice(0, 20);
    }

    return data;
  } catch (error) {
    console.error('Error searching content:', error);
    const lowercaseQuery = query.toLowerCase();
    return mockContent
      .filter(
        (c) =>
          c.title.toLowerCase().includes(lowercaseQuery) ||
          (c.description && c.description.toLowerCase().includes(lowercaseQuery))
      )
      .map(convertMockContentToDb)
      .slice(0, 20);
  }
}
