import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

// For client components
export function createSupabaseClient(): SupabaseClient<Database> | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // During build, these might not be available
    if (typeof window === 'undefined') {
      console.warn('Supabase environment variables are not set. Skipping client creation during build.');
      return null;
    }
    // In browser, log warning but return null to prevent hanging
    console.warn('Missing Supabase environment variables. Authentication features will not work.');
    return null;
  }

  try {
    return createClient<Database>(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    return null;
  }
}

// Singleton instance for client-side usage
let supabaseClient: SupabaseClient<Database> | null = null;

export function getSupabaseClient(): SupabaseClient<Database> | null {
  if (!supabaseClient) {
    supabaseClient = createSupabaseClient();
  }
  return supabaseClient;
}