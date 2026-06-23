import React, { useState } from "react";
import { supabase } from "../supabaseClient";

interface PDFDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSpecialization?: string;
}

export function PDFDownloadModal({ isOpen, onClose, defaultSpecialization = "الدليل الرسمي الشامل 2026" }: PDFDownloadModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      alert("برجاء ملء جميع الحقول المطلوبة");
      return;
    }

    setLoading(true);

    try {
      // إرسال البيانات مباشرة لجدول الطلاب في Supabase
      const { error } = await supabase
        .from("students")
        .insert([
          {
            name: name,
            phone: phone,
            specialization: defaultSpecialization,
          }
        ]);

      if (error) throw error;

      alert("تم تسجيل بياناتك بنجاح وجاري تحضير ملف الـ PDF! 🎉");
      
      // هنا يمكنك وضع رابط تحميل الـ PDF المباشر الخاص بك
      window.open("/path-to-your-pdf.pdf", "_blank");
      
      setName("");
      setPhone("");
      onClose();
    } catch (err) {
      console.error("Supabase Insertion Error:", err);
      alert("حدث خطأ أثناء حفظ البيانات، برجاء المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl">
      <div className="relative w-full max-w-md overflow-hidden bg-[#0A2463] border border-white/10 rounded-2xl shadow-2xl p-6 text-white animate-fade-in">
        
        {/* زر الإغلاق */}
        <button 
          onClick={onClose}
          className="absolute top-4 left-4 text-slate-400 hover:text-white text-xl font-bold transition-colors cursor-pointer"
        >
          ✕
        </button>

        <div className="text-center space-y-2 mb-6">
          <h3 className="text-lg sm:text-xl font-black text-amber-400">
            📥 تحميل الدليل الرسمي المعتمد لعام 2026
          </h3>
          <p className="text-xs text-slate-300 font-medium">
            برجاء إدخال بياناتك لتأكيد الهوية وتنزيل نسخة الـ PDF فوراً
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1">إسم الطالب ثلاثي أو رباعي:</label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: محمد أحمد مصطفى"
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400 font-medium text-right"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1">رقم الهاتف (واتساب):</label>
            <input 
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="مثال: 01xxxxxxxxx"
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400 font-medium text-left"
              dir="ltr"
              required
            />
          </div>

          <div className="bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs text-slate-300 font-medium">
            📂 المستند المطلوب: <span className="text-amber-300 font-bold">{defaultSpecialization}</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-slate-600 disabled:to-slate-700 text-white font-black py-3.5 rounded-xl text-sm shadow-xl transition-all duration-200 text-center cursor-pointer"
          >
            {loading ? "جاري التحقق والتحميل..." : "⚡ تأكيد البيانات وتحميل الكتيب الآن"}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-white/5 text-[10px] text-center text-slate-400 font-medium">
          🔒 بياناتك مشفرة ومحمية بالكامل وفقاً لسياسة الخصوصية للمنصة.
        </div>
      </div>
    </div>
  );
}
