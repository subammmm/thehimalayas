import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Null when no project is configured: the app then runs on the bundled dataset.
export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient<Database>(supabaseUrl, supabaseAnonKey)
    : null;
