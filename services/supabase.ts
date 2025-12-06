import { createClient } from '@supabase/supabase-js';

// Access environment variablesтз
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("CRITICAL: Supabase URL or Anon Key is missing. Check your .env file.");
}

// Create the client
// We use '!' to tell TypeScript we are confident these exist, or it will throw at runtime if missing
export const supabase = createClient(
  supabaseUrl || 'https://tosxoeewyykjppzwqyda.supabase.co', 
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvc3hvZWV3eXlranBwendxeWRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMTc0NDYsImV4cCI6MjA4MDU5MzQ0Nn0.4LGNtwr1nWCe5Dy6fNhc8POS3x0ntE41aJBhPfpI9rE'
);
