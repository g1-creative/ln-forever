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
      moments: {
        Row: {
          id: string
          user_id: string
          partner_id: string
          image_url: string
          caption: string
          moment_date: string
          partner_comment: string | null
          partner_comment_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          partner_id: string
          image_url: string
          caption: string
          moment_date?: string
          partner_comment?: string | null
          partner_comment_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          partner_id?: string
          image_url?: string
          caption?: string
          moment_date?: string
          partner_comment?: string | null
          partner_comment_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      lobbies: {
        Row: {
          id: string
          host_id: string
          game_type: string
          status: 'waiting' | 'playing' | 'finished'
          max_players: number
          current_players: number
          created_at: string
          updated_at: string
          settings: Json
        }
        Insert: {
          id?: string
          host_id: string
          game_type?: string
          status?: 'waiting' | 'playing' | 'finished'
          max_players?: number
          current_players?: number
          created_at?: string
          updated_at?: string
          settings?: Json
        }
        Update: {
          id?: string
          host_id?: string
          game_type?: string
          status?: 'waiting' | 'playing' | 'finished'
          max_players?: number
          current_players?: number
          created_at?: string
          updated_at?: string
          settings?: Json
        }
      }
      lobby_participants: {
        Row: {
          id: string
          lobby_id: string
          user_id: string
          joined_at: string
          is_ready: boolean
        }
        Insert: {
          id?: string
          lobby_id: string
          user_id: string
          joined_at?: string
          is_ready?: boolean
        }
        Update: {
          id?: string
          lobby_id?: string
          user_id?: string
          joined_at?: string
          is_ready?: boolean
        }
      }
      guess_my_answer_sessions: {
        Row: {
          id: string
          lobby_id: string
          question: string
          answerer_id: string
          secret_answer: string | null
          guesses: Json
          status: 'answering' | 'guessing' | 'revealed' | 'finished'
          round_number: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lobby_id: string
          question: string
          answerer_id: string
          secret_answer?: string | null
          guesses?: Json
          status?: 'answering' | 'guessing' | 'revealed' | 'finished'
          round_number?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lobby_id?: string
          question?: string
          answerer_id?: string
          secret_answer?: string | null
          guesses?: Json
          status?: 'answering' | 'guessing' | 'revealed' | 'finished'
          round_number?: number
          created_at?: string
          updated_at?: string
        }
      }
      guess_my_answer_state: {
        Row: {
          id: string
          lobby_id: string
          current_session_id: string | null
          current_turn_user_id: string | null
          game_data: Json
          updated_at: string
        }
        Insert: {
          id?: string
          lobby_id: string
          current_session_id?: string | null
          current_turn_user_id?: string | null
          game_data?: Json
          updated_at?: string
        }
        Update: {
          id?: string
          lobby_id?: string
          current_session_id?: string | null
          current_turn_user_id?: string | null
          game_data?: Json
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
