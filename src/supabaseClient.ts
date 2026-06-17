import { createClient } from '@supabase/supabase-js';

// ضع رابط مشروعك الحقيقي مباشرة بين علامتي التنصيص
const supabaseUrl = "https://wufymhbyxwheihtxadnb.supabase.co"; 

// ضع المفتاح الطويل (Anon Key) الحقيقي مباشرة بين علامتي التنصيص
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZnltaGJ5eHdoZWlodHhhZG5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NTA2NDksImV4cCI6MjA5NzAyNjY0OX0.15VZe17WklPQ1_aAoxk8yWOJUvlHt4dTdx5P7vALgHg"; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
