import { PostgrestFilterBuilder, PostgrestError } from '@supabase/supabase-js';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Add any custom HTML elements here
    }
  }
}

// Extend PostgrestFilterBuilder to allow looser typing
declare module '@supabase/supabase-js' {
  interface PostgrestFilterBuilder<T, R> {
    eq(column: string, value: any): PostgrestFilterBuilder<T, R>;
    neq(column: string, value: any): PostgrestFilterBuilder<T, R>;
    gt(column: string, value: any): PostgrestFilterBuilder<T, R>;
    gte(column: string, value: any): PostgrestFilterBuilder<T, R>;
    lt(column: string, value: any): PostgrestFilterBuilder<T, R>;
    lte(column: string, value: any): PostgrestFilterBuilder<T, R>;
    like(column: string, value: any): PostgrestFilterBuilder<T, R>;
    ilike(column: string, value: any): PostgrestFilterBuilder<T, R>;
    is(column: string, value: any): PostgrestFilterBuilder<T, R>;
    in(column: string, value: any): PostgrestFilterBuilder<T, R>;
    select(columns: string): PostgrestFilterBuilder<T, R>;
    order(column: string, options?: object): PostgrestFilterBuilder<T, R>;
    limit(limit: number): PostgrestFilterBuilder<T, R>;
    range(from: number, to: number): PostgrestFilterBuilder<T, R>;
  }

  interface PostgrestError {
    query?: string;
  }
} 