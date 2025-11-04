export type Database = {
  public: {
    Functions: {
      increment_play_count: {
        Args: { content_id: string };
        Returns: void;
      };
    };
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          age_group: 'baby' | 'child' | 'adult' | 'family';
          icon_name: string | null;
          color_hex: string | null;
          content_count: number;
          sort_order: number;
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['categories']['Insert']>;
      };
      content: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          instructions: string | null;
          content_type: 'game' | 'video' | 'audio_story' | 'coloring_book';
          age_group: 'baby' | 'child' | 'adult' | 'family';
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
        };
        Insert: Omit<
          Database['public']['Tables']['content']['Row'],
          'id' | 'play_count' | 'rating' | 'rating_count' | 'created_at' | 'updated_at'
        >;
        Update: Partial<Database['public']['Tables']['content']['Insert']>;
      };
      user_profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          birth_year: number | null;
          role: 'guest' | 'user' | 'premium' | 'admin' | 'super_admin' | 'editor';
          is_premium: boolean;
          premium_expires_at: string | null;
          favorite_content: string[];
          parental_controls: Record<string, any> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['user_profiles']['Insert']>;
      };
      ratings: {
        Row: {
          id: string;
          content_id: string;
          user_id: string;
          rating: number;
          review: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['ratings']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['ratings']['Insert']>;
      };
      content_analytics: {
        Row: {
          id: string;
          content_id: string;
          user_id: string | null;
          session_id: string | null;
          user_agent: string | null;
          referrer: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['content_analytics']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['content_analytics']['Insert']>;
      };
    };
  };
};

export type ContentRow = Database['public']['Tables']['content']['Row'];
export type CategoryRow = Database['public']['Tables']['categories']['Row'];
export type UserProfileRow = Database['public']['Tables']['user_profiles']['Row'];
export type RatingRow = Database['public']['Tables']['ratings']['Row'];
