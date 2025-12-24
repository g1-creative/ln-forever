'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase/client';
import { Database } from '@/types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: ProfileUpdate) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabaseClient();

  useEffect(() => {
    if (!supabase) {
      // If Supabase is not available, just set loading to false
      setLoading(false);
      return;
    }

    let mounted = true;
    let subscription: { unsubscribe: () => void } | null = null;

    // Get initial session with timeout
    // Use getSession() which is faster than getUser() as it checks localStorage first
    const sessionPromise = supabase.auth.getSession();
    // Reduced timeout to 5 seconds - session check should be fast
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('TIMEOUT')), 5000)
    );

    Promise.race([sessionPromise, timeoutPromise])
      .then((result: any) => {
        if (!mounted) return;
        
        const { data: { session }, error } = result;
        
        if (error) {
          // Only log non-timeout errors
          if (error.message !== 'TIMEOUT') {
            console.error('Error getting session:', error);
          }
          setLoading(false);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setLoading(false);
        }
      })
      .catch((error) => {
        // Handle timeout gracefully - only log in development
        if (error.message === 'TIMEOUT') {
          if (process.env.NODE_ENV === 'development') {
            console.warn('Session check timeout - this may indicate a slow connection');
          }
        } else {
          console.error('Error in getSession:', error);
        }
        if (mounted) {
          setLoading(false);
        }
      });

    // Listen for auth changes
    try {
      const {
        data: { subscription: authSubscription },
      } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      });
      subscription = { unsubscribe: () => authSubscription.unsubscribe() };
    } catch (error) {
      console.error('Error setting up auth listener:', error);
      if (mounted) {
        setLoading(false);
      }
    }

    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [supabase]);

  const fetchProfile = async (userId: string) => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      // Optimize query: only select needed fields instead of *
      const profilePromise = supabase
        .from('profiles')
        .select('id, name, username, bio, avatar_selection, avatar_url, language_level, preferred_difficulty, created_at, updated_at')
        .eq('id', userId)
        .single();
      
      // Reduced timeout to 5 seconds - if it takes longer, something is wrong
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('TIMEOUT')), 5000)
      );

      const result: any = await Promise.race([profilePromise, timeoutPromise]);
      const { data, error } = result;

      if (error) {
        // Profile might not exist yet, that's okay
        if (error.code === 'PGRST116') {
          // Don't log - this is expected for new users
          setProfile(null);
        } else {
          // Only log non-timeout errors
          if (error.message !== 'TIMEOUT') {
            console.error('Error fetching profile:', error);
          }
          setProfile(null);
        }
      } else {
        setProfile(data);
      }
    } catch (error: any) {
      // Handle timeout gracefully - only log in development
      if (error.message === 'TIMEOUT') {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Profile fetch timeout - this may indicate a slow connection');
        }
        setProfile(null);
      } else {
        console.error('Error fetching profile:', error);
        setProfile(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, name?: string) => {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/games` : undefined,
        data: {
          name: name || email.split('@')[0],
        },
      },
    });
    if (error) throw error;
    
    // If email confirmation is enabled, show a message
    if (data.user && !data.session) {
      // User needs to confirm email - but don't throw error, just inform them
      // They can still proceed, Supabase will handle the confirmation
    }
  };

  const signOut = async () => {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updateProfile = async (updates: ProfileUpdate) => {
    if (!user) throw new Error('No user logged in');
    if (!supabase) throw new Error('Supabase client not initialized');
    
    // Remove id, created_at, updated_at from updates as they shouldn't be updated directly
    const { id, created_at, updated_at, ...updateData } = updates;
    
    // Type assertion needed due to Supabase type inference limitations during build
    const { data, error } = await (supabase
      .from('profiles') as any)
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    if (data) setProfile(data);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
