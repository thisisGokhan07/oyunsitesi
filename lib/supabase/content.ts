import { supabase } from './client';

export async function createContent(data: any) {
  const { data: content, error } = await (supabase
    .from('content')
    .insert as any)([data])
    .select()
    .single();

  if (error) throw error;
  return content;
}

export async function updateContent(id: string, data: any) {
  const { data: content, error } = await (supabase
    .from('content')
    .update as any)(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return content;
}

export async function deleteContent(id: string) {
  const { error } = await supabase.from('content').delete().eq('id', id);

  if (error) throw error;
}

export async function getContent(id: string) {
  const { data, error } = await supabase
    .from('content')
    .select('*, category:categories(name)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function getAllContent(filters?: {
  content_type?: string;
  category_id?: string;
  age_group?: string;
  published?: boolean;
  is_premium?: boolean;
  limit?: number;
  offset?: number;
}) {
  let query = supabase.from('content').select('*, category:categories(name)', {
    count: 'exact',
  });

  if (filters?.content_type) {
    query = query.eq('content_type', filters.content_type);
  }

  if (filters?.category_id) {
    query = query.eq('category_id', filters.category_id);
  }

  if (filters?.age_group) {
    query = query.eq('age_group', filters.age_group);
  }

  if (filters?.published !== undefined) {
    query = query.eq('published', filters.published);
  }

  if (filters?.is_premium !== undefined) {
    query = query.eq('is_premium', filters.is_premium);
  }

  query = query
    .order('created_at', { ascending: false })
    .limit(filters?.limit || 20);

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters?.limit || 20) - 1);
  }

  const { data, error, count } = await query;

  if (error) throw error;
  return { data, count };
}

export async function uploadFile(file: File, bucket: string = 'content-files') {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(fileName);

  return publicUrl;
}

export async function searchContent(
  query: string,
  filters?: {
    content_type?: string;
    category_id?: string;
    age_group?: string;
    is_premium?: boolean;
  }
) {
  let supabaseQuery = supabase
    .from('content')
    .select('*, category:categories(name)')
    .eq('published', true)
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`);

  if (filters?.content_type) {
    supabaseQuery = supabaseQuery.eq('content_type', filters.content_type);
  }

  if (filters?.age_group) {
    supabaseQuery = supabaseQuery.eq('age_group', filters.age_group);
  }

  if (filters?.category_id) {
    supabaseQuery = supabaseQuery.eq('category_id', filters.category_id);
  }

  if (filters?.is_premium !== undefined) {
    supabaseQuery = supabaseQuery.eq('is_premium', filters.is_premium);
  }

  const { data, error } = await supabaseQuery.limit(50);

  if (error) throw error;
  return data;
}
