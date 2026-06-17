import { createClient } from '@supabase/supabase-js';

// ضع رابطك الحقيقي ومفتاحك هنا مباشرة بدون أي كلمات VITE_
const supabaseUrl = "https://wufymhbyxwheihtxadnb.supabase.co"; 
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZnltaGJ5eHdoZWlodHhhZG5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NTA2NDksImV4cCI6MjA5NzAyNjY0OX0.15VZe17WklPQ1_aAoxk8yWOJUvlHt4dTdx5P7vALgHg"; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
