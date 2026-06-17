import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Clean up values in case of placeholders
const isValidUrl = supabaseUrl && supabaseUrl.startsWith('https://');
const isValidKey = supabaseAnonKey && supabaseAnonKey.length > 20;

if (!isValidUrl || !isValidKey) {
  console.warn(
    'Supabase environment variables are missing or invalid. The website will run in demo/offline mode with mock data.'
  );
}

export const supabase = createClient(
  isValidUrl ? supabaseUrl : 'https://placeholder-project.supabase.co',
  isValidKey ? supabaseAnonKey : 'placeholder-anon-key'
);

// Helper to check if database is connected
export const isDbConfigured = () => isValidUrl && isValidKey;
