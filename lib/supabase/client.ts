import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

// For client components
export function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // During build, env vars might not be set - use placeholder values
  // The client will work at runtime when env vars are properly configured
  const url = supabaseUrl || 'https://placeholder.supabase.co';
  const key = supabaseAnonKey || 'placeholder-key';

  return createClient<Database>(url, key);
}

// Singleton instance for client-side usage
let supabaseClient: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createSupabaseClient();
  }
  return supabaseClient;
}
