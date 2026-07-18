import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.https://jnkwbawkflaugqgdbgiy.supabase.co;
const supabaseAnonKey = process.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impua3diYXdrZmxhdWdxZ2RiZ2l5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzOTcxOTksImV4cCI6MjA5OTk3MzE5OX0.-aWLHUxJzJrkTuiPZUUCM8wVH51-zkO-EqYD0tFgKzA;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);