import { createClient } from '@/lib/supabase/client';

export interface Language {
  id: string;
  code: string;
  name: string;
  native_name: string;
  flag_emoji: string | null;
  is_active: boolean;
  is_default: boolean;
  sort_order: number;
}

export interface Translation {
  id: string;
  language_code: string;
  namespace: string;
  key: string;
  value: string;
}

export interface TranslationDict {
  [namespace: string]: {
    [key: string]: string;
  };
}

// Get all active languages
export async function getActiveLanguages(): Promise<Language[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('languages')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching languages:', error);
    return [];
  }

  return data || [];
}

// Get default language
export async function getDefaultLanguage(): Promise<Language | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('languages')
    .select('*')
    .eq('is_default', true)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error fetching default language:', error);
    return null;
  }

  return data;
}

// Get translations for a language
export async function getTranslations(languageCode: string): Promise<TranslationDict> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('translations')
    .select('*')
    .eq('language_code', languageCode);

  if (error) {
    console.error('Error fetching translations:', error);
    return {};
  }

  // Convert to nested object structure
  const translations: TranslationDict = {};
  
  (data || []).forEach((translation) => {
    if (!translations[translation.namespace]) {
      translations[translation.namespace] = {};
    }
    translations[translation.namespace][translation.key] = translation.value;
  });

  return translations;
}

// Get a single translation
export async function getTranslation(
  languageCode: string,
  namespace: string,
  key: string
): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('translations')
    .select('value')
    .eq('language_code', languageCode)
    .eq('namespace', namespace)
    .eq('key', key)
    .single();

  if (error) {
    return null;
  }

  return data?.value || null;
}

// Save user's language preference
export function saveLanguagePreference(languageCode: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('preferred_language', languageCode);
    document.documentElement.lang = languageCode;
  }
}

// Get user's language preference
export function getLanguagePreference(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('preferred_language');
  }
  return null;
}

// Get content translation
export async function getContentTranslation(
  contentId: string,
  languageCode: string
): Promise<{
  title: string;
  description: string | null;
  instructions: string | null;
  meta_title: string | null;
  meta_description: string | null;
} | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('content_translations')
    .select('*')
    .eq('content_id', contentId)
    .eq('language_code', languageCode)
    .single();

  if (error) {
    return null;
  }

  return data ? {
    title: data.title,
    description: data.description,
    instructions: data.instructions,
    meta_title: data.meta_title,
    meta_description: data.meta_description,
  } : null;
}

