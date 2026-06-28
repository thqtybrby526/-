import { createClient } from "@supabase/supabase-js";

const rawSupabaseUrl = 
  (typeof window !== "undefined" && (import.meta as any).env ? ((import.meta as any).env.VITE_SUPABASE_URL as string) : "") ||
  (typeof process !== "undefined" && process?.env ? (process.env.SUPABASE_URL as string) : "") ||
  "https://wufymhbyxwheihtxadnb.supabase.co";

const supabaseUrl = rawSupabaseUrl.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");

const supabaseKey = 
  (typeof window !== "undefined" && (import.meta as any).env ? ((import.meta as any).env.VITE_SUPABASE_ANON_KEY as string) : "") ||
  (typeof process !== "undefined" && process?.env ? (process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY as string) : "") ||
  "";

export const hasSupabase = !!(supabaseKey && supabaseKey.trim().length > 0);

// Use a fallback empty string for initialization if supabaseKey is unavailable; calls will fail gracefully
export const supabase = createClient(supabaseUrl, supabaseKey || "dummy-key-to-prevent-crash");

