export type AgeGroup = 'baby' | 'child' | 'adult' | 'family';

export type ContentType = 'game' | 'video' | 'audio_story' | 'coloring_book';

export interface Content {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  instructions: string | null;
  content_type: ContentType;
  age_group: AgeGroup;
  category_id: string | null;
  thumbnail_url: string;
  content_url: string;
  duration_minutes: number | null;
  play_count: number;
  rating: number;
  rating_count: number;
  is_premium: boolean;
  is_featured: boolean;
  published: boolean;
  meta_title: string | null;
  meta_description: string | null;
  keywords: string[] | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  age_group: AgeGroup;
  icon_name: string | null;
  color_hex: string | null;
  content_count: number;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  isPremium: boolean;
}
