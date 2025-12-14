import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://frpjuymnrdrtmnwnnigx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZycGp1eW1ucmRydG1ud25uaWd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MjYzOTksImV4cCI6MjA4MTMwMjM5OX0.lhi4lT1YNDTJMRQWb0R429vrXvvL5obbrw88nHx-xCA';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not found. Using mock data fallback.');
}

export const supabase = createClient<Database>(
    supabaseUrl,
    supabaseAnonKey
);
