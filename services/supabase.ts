import { createClient } from '@supabase/supabase-js';


const supabaseUrl = 'https://tosxoeewyykjppzwqyda.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvc3hvZWV3eXlranBwendxeWRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMTc0NDYsImV4cCI6MjA4MDU5MzQ0Nn0.4LGNtwr1nWCe5Dy6fNhc8POS3x0ntE41aJBhPfpI9rE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);