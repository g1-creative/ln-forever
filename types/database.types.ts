export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string | null
          avatar_url: string | null
          avatar_selection: string | null
          username: string | null
          bio: string | null
          language_level: string | null
          preferred_difficulty: 'easy' | 'medium' | 'hard' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name?: string | null
          avatar_url?: string | null
          avatar_selection?: string | null
          username?: string | null
          bio?: string | null
          language_level?: string | null
          preferred_difficulty?: 'easy' | 'medium' | 'hard' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          avatar_url?: string | null
          avatar_selection?: string | null
          username?: string | null
          bio?: string | null
          language_level?: string | null
          preferred_difficulty?: 'easy' | 'medium' | 'hard' | null
          created_at?: string
          updated_at?: string
        }
      }
      couples: {
        Row: {
          id: string
          user1_id: string
          user2_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user1_id: string
          user2_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user1_id?: string
          user2_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      scenarios: {
        Row: {
          id: string
          title: string
          category: 'daily' | 'travel' | 'work' | 'romance' | 'fun' | 'deep'
          difficulty: 'easy' | 'medium' | 'hard'
          role_a: string
          role_b: string
          hints: string[]
          created_by: string | null
          is_community: boolean
          rating: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          category: 'daily' | 'travel' | 'work' | 'romance' | 'fun' | 'deep'
          difficulty: 'easy' | 'medium' | 'hard'
          role_a: string
          role_b: string
          hints: string[]
          created_by?: string | null
          is_community?: boolean
          rating?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          category?: 'daily' | 'travel' | 'work' | 'romance' | 'fun' | 'deep'
          difficulty?: 'easy' | 'medium' | 'hard'
          role_a?: string
          role_b?: string
          hints?: string[]
          created_by?: string | null
          is_community?: boolean
          rating?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          couple_id: string | null
          scenario_id: string
          completed_at: string | null
          duration_seconds: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          couple_id?: string | null
          scenario_id: string
          completed_at?: string | null
          duration_seconds?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          couple_id?: string | null
          scenario_id?: string
          completed_at?: string | null
          duration_seconds?: number | null
          notes?: string | null
          created_at?: string
        }
      }
      user_scenarios: {
        Row: {
          id: string
          user_id: string
          scenario_id: string
          is_favorite: boolean
          is_custom: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          scenario_id: string
          is_favorite?: boolean
          is_custom?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          scenario_id?: string
          is_favorite?: boolean
          is_custom?: boolean
          created_at?: string
        }
      }
      progress: {
        Row: {
          id: string
          user_id: string
          date: string
          scenarios_completed: number
          time_practiced_seconds: number
          difficulty_breakdown: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          scenarios_completed?: number
          time_practiced_seconds?: number
          difficulty_breakdown?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          scenarios_completed?: number
          time_practiced_seconds?: number
          difficulty_breakdown?: Json
          created_at?: string
        }
      }
      friends: {
        Row: {
          id: string
          user1_id: string
          user2_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user1_id: string
          user2_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user1_id?: string
          user2_id?: string
          created_at?: string
        }
      }
      friend_requests: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          status: 'pending' | 'accepted' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      difficulty: 'easy' | 'medium' | 'hard'
      category: 'daily' | 'travel' | 'work' | 'romance' | 'fun' | 'deep'
    }
  }
}
