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
      branches: {
        Row: {
          id: string
          name: string
          location: string
          address: string
          is_members_only: boolean
          created_at?: string
        }
        Insert: {
          id?: string
          name: string
          location: string
          address: string
          is_members_only: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          location?: string
          address?: string
          is_members_only?: boolean
          created_at?: string
        }
        Relationships: []
      }
      coach_schedules: {
        Row: {
          id: string
          coach_id: string
          branch_id: string
          day_of_week: string
          start_time: string
          end_time: string
          session_duration: number
          created_at?: string
        }
        Insert: {
          id?: string
          coach_id: string
          branch_id: string
          day_of_week: string
          start_time: string
          end_time: string
          session_duration: number
          created_at?: string
        }
        Update: {
          id?: string
          coach_id?: string
          branch_id?: string
          day_of_week?: string
          start_time?: string
          end_time?: string
          session_duration?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_schedules_branch_id_fkey"
            columns: ["branch_id"]
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_schedules_coach_id_fkey"
            columns: ["coach_id"]
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          }
        ]
      }
      coach_sessions: {
        Row: {
          id: string
          coach_id: string
          branch_id: string
          session_date: string
          start_time: string
          end_time: string
          status: string
          player_id?: string
          created_at?: string
        }
        Insert: {
          id?: string
          coach_id: string
          branch_id: string
          session_date: string
          start_time: string
          end_time: string
          status: string
          player_id?: string
          created_at?: string
        }
        Update: {
          id?: string
          coach_id?: string
          branch_id?: string
          session_date?: string
          start_time?: string
          end_time?: string
          status?: string
          player_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_sessions_branch_id_fkey"
            columns: ["branch_id"]
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_sessions_coach_id_fkey"
            columns: ["coach_id"]
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_sessions_player_id_fkey"
            columns: ["player_id"]
            referencedRelation: "players"
            referencedColumns: ["id"]
          }
        ]
      }
      coaches: {
        Row: {
          id: string
          name: string
          specialties: string[]
          available_levels: string[]
          rating: number
          created_at?: string
        }
        Insert: {
          id: string
          name: string
          specialties: string[]
          available_levels: string[]
          rating: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          specialties?: string[]
          available_levels?: string[]
          rating?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coaches_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      password_reset_tokens: {
        Row: {
          id: string
          email: string
          token: string
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          token: string
          expires_at: string
          created_at: string
        }
        Update: {
          id?: string
          email?: string
          token?: string
          expires_at?: string
          created_at?: string
        }
        Relationships: []
      }
      players: {
        Row: {
          id: string
          skill_level: string
          years_playing: number
          goals: string
          created_at?: string
        }
        Insert: {
          id: string
          skill_level: string
          years_playing: number
          goals: string
          created_at?: string
        }
        Update: {
          id?: string
          skill_level?: string
          years_playing?: number
          goals?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "players_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          name: string
          type: string
          role: string
          created_at?: string
        }
        Insert: {
          id: string
          user_id: string
          name: string
          type: string
          role: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: string
          role?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          id: string
          full_name: string
          email: string
          role: string
          approved: boolean
          created_at?: string
        }
        Insert: {
          id: string
          full_name: string
          email: string
          role: string
          approved?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          role?: string
          approved?: boolean
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 