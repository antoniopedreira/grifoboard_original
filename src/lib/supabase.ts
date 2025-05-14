
import { createClient } from '@supabase/supabase-js';

// Try to get values from environment variables
let supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// If environment variables are not available (during development), 
// you need to replace these values with your actual Supabase URL and Anon Key
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Variáveis de ambiente do Supabase não encontradas, usando valores de desenvolvimento');
  
  // IMPORTANTE: Substitua estes valores pelos fornecidos pelo seu projeto Supabase
  supabaseUrl = 'https://your-supabase-project-url.supabase.co';
  supabaseAnonKey = 'your-supabase-anon-key';
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
