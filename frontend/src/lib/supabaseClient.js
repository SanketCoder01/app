import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vrtmtwbajvesifalamum.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZydG10d2JhanZlc2lmYWxhbXVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNTIyNjAsImV4cCI6MjA4NjYyODI2MH0.4nu9Gh8nzGJZCdexQ66JOtXNBaTZypX3TCMnMcSz0Co';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
