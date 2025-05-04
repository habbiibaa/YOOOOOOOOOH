export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Define database table types
export type Tables = {
  users: {
    id: string;
    email: string;
    full_name: string;
    role: string;
    created_at?: string;
  };
  training_slots: {
    id: number;
    level: number;
    branch_id: string;
    start_time: string;
    end_time: string;
    is_group_session: boolean;
    max_group_size: number;
  };
  training_levels: {
    id: number;
    level_number: number;
    name: string;
    description: string;
    price: number;
    created_at?: string;
    updated_at?: string;
  };
  subscriptions: {
    id: string;
    user_id: string;
    plan: string;
    status: string;
    start_date: string;
    end_date: string;
    created_at?: string;
    updated_at?: string;
  };
  roles: {
    id: string;
    user_id: string;
    role: 'admin' | 'coach' | 'player';
    created_at?: string;
  };
  refresh_tokens: {
    id: number;
    user_id: string;
    token: string;
    expires_at: string;
    created_at?: string;
    used: boolean;
  };
  profiles: {
    id: string;
    user_id: string;
    name: string;
    type: string;
    avatar_url?: string;
    created_at?: string;
    updated_at?: string;
    role: 'admin' | 'coach' | 'player';
  };
  players: {
    id: string;
    skill_level: string;
    years_playing: number;
    goals: string;
  };
  player_videos: {
    id: string;
    user_id: string;
    video_url: string;
    description: string;
    analysis_result?: any;
    coach_feedback?: string;
    status: string;
    created_at?: string;
    updated_at?: string;
  };
  password_reset_tokens: {
    id: string;
    email: string;
    token: string;
    expires_at: string;
    created_at?: string;
    used: boolean;
  };
  leaked_passwords: {
    id: string;
    password_hash: string;
    created_at?: string;
  };
  credits_transactions: {
    id: string;
    user_id: string;
    amount: number;
    description: string;
    created_at?: string;
  };
  coaches: {
    id: string;
    name: string;
    specialties: string[];
    available_levels: string[];
    rating: number;
  };
  coach_schedules: {
    id: string;
    coach_id: string;
    branch_id: string;
    day_of_week: string;
    start_time: string;
    end_time: string;
    session_duration: number;
  };
  coach_availability: {
    id: string;
    coach_id: string;
    day_of_week: string;
    start_time: string;
    end_time: string;
    session_duration: number;
    max_sessions: number;
  };
  clients: {
    id: string;
    user_id: string;
    date_of_birth?: string;
    branch_id: string;
  };
  branches: {
    id: string;
    name: string;
    location: string;
    address: string;
    is_members_only: boolean;
    created_at?: string;
    updated_at?: string;
  };
  bookings: {
    id: string;
    client_id: string;
    slot_id: number;
    booking_date: string;
    confirmed: boolean;
    payment_status: string;
  };
  audits: {
    id: string;
    tbl: string;
    row_id: string;
    before?: any;
    after?: any;
    timestamp: string;
    user_id?: string;
  };
  assessments: {
    id: string;
    client_id: string;
    level: number;
    assessment_date: string;
    assessed_by: string;
    notes?: string;
  };
  coach_sessions: {
    id: string;
    coach_id: string;
    branch_id: string;
    player_id?: string;
    session_date: string;
    start_time: string;
    end_time: string;
    status: string;
    payment_status?: string;
  };
  payments: {
    id: string;
    user_id: string;
    session_id?: string;
    subscription_id?: string;
    amount: number;
    payment_method: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    transaction_id?: string;
    payment_date: string;
    created_at?: string;
    updated_at?: string;
  };
};

export type Database = {
  public: {
    Tables: {
      [K in keyof Tables]: {
        Row: Tables[K];
        Insert: Partial<Tables[K]>;
        Update: Partial<Tables[K]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: "player" | "coach" | "admin";
    };
    CompositeTypes: Record<string, never>;
  };
}; 