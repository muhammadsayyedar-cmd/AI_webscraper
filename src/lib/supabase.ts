import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ScrapeData {
  id?: string;
  created_at?: string;
  user_id?: string; // Added for user-specific data
  url: string;
  title?: string;
  meta_description?: string;
  keywords?: string[];
  links?: Array<{
    url: string;
    text: string;
    type?: string;
  }>;
  highlighted_content?: Array<{
    text: string;
    importance?: number;
  }>;
  og_data?: {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
  };
  raw_content?: string;
  ai_summary?: string;
  // New fields for AI Research & Analysis
  verified_origin?: string;
  future_forecast?: string;
}

// Auth helper functions
export const authHelpers = {
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (error) throw error;
    return data;
  },

  async signInWithGithub() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  onAuthStateChange(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null);
    });
  },
};