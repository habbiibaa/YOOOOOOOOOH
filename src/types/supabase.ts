// Re-export types from database.ts
export type { Json } from './database';

// Define the SchemaName type needed for Supabase
export type SchemaName = 'public';

// Import Database type from database.ts and re-export it
import type { Database as DatabaseType } from './database';
export type Database = DatabaseType;

// Add missing properties to PostgrestError
declare module '@supabase/supabase-js' {
  interface PostgrestError {
    query?: string;
  }
}

// Add typings for user data
export interface UserDataResult {
  role: string;
  approved: boolean;
}

// Type for token data
export interface TokenData {
  id: string;
  email: string;
  token: string;
  expires_at: string;
  created_at: string;
}

// Type for branch data
export interface BranchData {
  id: string;
  name: string;
}

// Type for coach data
export interface CoachData {
  id: string;
  full_name: string;
  email: string;
}

// Type for new branch result
export interface NewBranchResult {
  id: string;
}

// Type for schedule data
export interface ScheduleData {
  id: string;
  coach_id: string;
  branch_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  session_duration: number;
} 