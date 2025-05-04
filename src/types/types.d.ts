// Augment PostgrestError
import '@supabase/supabase-js';

declare module '@supabase/supabase-js' {
  interface PostgrestError {
    query?: string;
  }
  
  // Use any for now to allow queries to work without strict type checking
  interface PostgrestFilterBuilder<T, U> {
    eq(column: string, value: any): PostgrestFilterBuilder<T, U>;
    select(columns: string): PostgrestFilterBuilder<T, U>;
  }
}

// Augment ReadonlyHeaders to include required methods
declare global {
  interface ReadonlyHeaders {
    get(name: string): string | null;
  }
} 