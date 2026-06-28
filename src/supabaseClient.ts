import { createClient } from "@supabase/supabase-js";

// قراءة مباشرة وصريحة لـ Vite
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || "https://wufymhbyxwheihtxadnb.supabase.co";
const supabaseKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || "";

export const hasSupabase = !!(supabaseKey && supabaseKey.trim().length > 0);

// إذا لم يجد الـ Key الحقيقي، نضع الـ Key الاحتياطي هنا مباشرة لو أحببت، 
// لكن طالما مضاف في فيرسيل هيقرأ الحقيقي فوراً.
export const supabase = createClient(
  supabaseUrl.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/$/, ""), 
  supabaseKey || "dummy-key-to-prevent-crash"
);
