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
    const sessionPromise = supabase.auth.getSession();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('TIMEOUT')), 10000)
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
        // Handle timeout gracefully
        if (error.message === 'TIMEOUT') {
          console.warn('Session check took longer than expected, continuing without session');
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
      // Add timeout to prevent hanging - increased to 10 seconds for slower connections
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('TIMEOUT')), 10000)
      );

      const result: any = await Promise.race([profilePromise, timeoutPromise]);
      const { data, error } = result;

      if (error) {
        // Profile might not exist yet, that's okay
        if (error.code === 'PGRST116') {
          console.log('Profile not found, will be created on first use');
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
      // Handle timeout gracefully - don't log as error since it's expected behavior
      if (error.message === 'TIMEOUT') {
        console.warn('Profile fetch took longer than expected, continuing without profile data');
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
