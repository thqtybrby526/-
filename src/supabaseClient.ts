import { createClient } from '@supabase/supabase-js';

// قراءة المتغيرات بالطريقة الرسمية لـ Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// التأكد من وجود المتغيرات حتى لا تظهر شاشة بيضاء
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ خطأ: متغيرات Supabase غير موجودة في إعدادات البيئة!');
}

export const supabase = createClient(
  supabaseUrl || '', 
  supabaseAnonKey || ''
);
