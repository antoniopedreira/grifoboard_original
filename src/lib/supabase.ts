
import { createClient } from '@supabase/supabase-js';

// Using environment variables or hardcoded for now
const supabaseUrl = 'https://qacaerwosglbayjfskyx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhY2Flcndvc2dsYmF5amZza3l4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNDEwNDksImV4cCI6MjA2MjgxNzA0OX0.gT9Je1R7Kv-UTJLV0C9K9UA5tfdTr3leB7Dp8NCDQK8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
