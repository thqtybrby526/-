import React, { useState, useEffect } from "react";
import { X, FileText, User, Phone, CheckCircle, AlertCircle, Loader2, Download } from "lucide-react";
import { ACADEMY_DEPARTMENTS } from "../data";

interface PDFDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSpecialization?: string;
}

export function PDFDownloadModal({ isOpen, onClose, defaultSpecialization }: PDFDownloadModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [specialization, setSpecialization] = useState(defaultSpecialization || "الدليل الرسمي الشامل 2026");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pdfLibraryList, setPdfLibraryList] = useState<any[]>([]);

  const loadFilesList = () => {
    const saved = localStorage.getItem("custom_pdf_library_v1");
    if (saved) {
      try {
        setPdfLibraryList(JSON.parse(saved));
      } catch (err) {
        setPdfLibraryList([]);
      }
    } else {
      const defaultFiles = [
        { id: "file_comp_1", name: "الدليل الشامل والمصروفات لجميع الأقسام 2026", url: "https://raw.githubusercontent.com/alroubymediabuyer/academy-files/main/official-booklet-2026.pdf", specialization: "الدليل الرسمي الشامل 2026" },
        { id: "file_prog_1", name: "منهج وحقيبة قسم البرمجة والذكاء الاصطناعي", url: "https://raw.githubusercontent.com/alroubymediabuyer/academy-files/main/programming-2026-guide.pdf", specialization: "قسم البرمجة والذكاء الاصطناعي" },
        { id: "file_nurs_1", name: "منهج وحقيبة قسم مساعد خدمات صحية (تمريض)", url: "https://raw.githubusercontent.com/alroubymediabuyer/academy-files/main/nursing-assistant-2026-guide.pdf", specialization: "قسم مساعد خدمات صحية (تمريض)" },
        { id: "file_petr_1", name: "منهج وحقيبة قسم البترول والطاقة", url: "https://raw.githubusercontent.com/alroubymediabuyer/academy-files/main/petroleum-2026-guide.pdf", specialization: "قسم البترول" }
      ];
      localStorage.setItem("custom_pdf_library_v1", JSON.stringify(defaultFiles));
      setPdfLibraryList(defaultFiles);
    }
  };

  useEffect(() => {
    loadFilesList();
    window.addEventListener("pdf_library_updated", loadFilesList);
    return () => {
      window.removeEventListener("pdf_library_updated", loadFilesList);
    };
  }, []);

  // Sync choice if defaults change
  useEffect(() => {
    if (defaultSpecialization) {
      setSpecialization(defaultSpecialization);
    } else if (pdfLibraryList.length > 0) {
      // Find matching default specialization or fallback to first file
      const foundMatch = pdfLibraryList.some(f => f.specialization === defaultSpecialization);
      if (!foundMatch && pdfLibraryList[0]) {
        setSpecialization(pdfLibraryList[0].specialization);
      }
    }
  }, [defaultSpecialization, pdfLibraryList]);

  if (!isOpen) return null;

  // Resolve target download link dynamically
  const activeFileItem = pdfLibraryList.find(f => f.specialization === specialization) || pdfLibraryList[0];
  const currentDownloadUrl = activeFileItem ? activeFileItem.url : "https://raw.githubusercontent.com/alroubymediabuyer/academy-files/main/official-booklet-2026.pdf";

  const isPhoneValid = (num: string) => {
    const cleanNum = num.trim().replace(/[\s\-\(\)]/g, "");
    const regex = /^(010|011|012|015)[0-9]{8}$/;
    return regex.test(cleanNum);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const nameTrim = name.trim();
    if (!nameTrim) {
      setError("الرجاء إدخال الاسم بالكامل لإتمام التحقق.");
      return;
    }

    const words = nameTrim.split(/\s+/).filter(Boolean);
    if (words.length < 3) {
      setError("يرجى كتابة الاسم ثلاثياً أو رباعياً على الأقل لتسجيل طلب التحميل.");
      return;
    }

    if (!isPhoneValid(phone)) {
      setError("الرجاء إدخال رقم هاتف مصري صحيح مكون من 11 رقماً ويبدأ بـ 010 أو 011 أو 012 أو 015.");
      return;
    }

    setLoading(true);
    try {
      // Send download lead request to the server
      const response = await fetch("/api/pdf-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameTrim,
          phone: phone.trim(),
          specialization: specialization
        })
      });

      if (!response.ok) {
        throw new Error("Failed to register lead");
      }

      // Live registration synchronizer event dispatch for ticker and general layout
      const directLeads = JSON.parse(localStorage.getItem("academy_direct_leads") || "[]");
      directLeads.unshift({
        studentName: nameTrim,
        governorate: "تحميل الملف الوصفي PDF",
        timestamp: new Date().toISOString()
      });
      localStorage.setItem("academy_direct_leads", JSON.stringify(directLeads.slice(0, 30)));
      window.dispatchEvent(new Event("academy_leads_updated"));

      setSuccess(true);

      // Trigger automatic file download
      setTimeout(() => {
        const link = document.createElement("a");
        link.href = currentDownloadUrl;
        link.target = "_blank";
        link.download = `دليل_${specialization.replace(/\s+/g, "_")}_2026.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, 500);

    } catch (err) {
      console.error(err);
      setError("حدث خطأ ما بالاتصال في الشبكة، برجاء المحاولة مجدداً.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 overflow-y-auto font-sans" dir="rtl">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto relative animate-scale-up text-right">
        
        {/* Header Decor */}
        <div className="bg-gradient-to-r from-teal-850 to-emerald-900 bg-[#115e59] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 shrink-0 text-amber-300 animate-pulse" />
            <span className="font-sans font-black text-xs sm:text-sm tracking-wide text-white">نموذج تحميل الملف التعريفي والدليل PDF 📑</span>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="text-white hover:text-amber-100 p-1 bg-white/10 hover:bg-white/20 rounded-lg cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3.5 bg-teal-500/5 border border-teal-500/20 rounded-xl text-xs text-slate-700 font-bold leading-relaxed text-center">
                📢 يرجى ملء البيانات لفتح رابط التحميل المباشر للدليل التفصيلي والكتيب للعام الجديد فوراً.
              </div>

              {/* Name field */}
              <div className="space-y-1">
                <label className="block text-xs font-black text-slate-650">الاسم بالكامل (ثلاثي أو رباعي):</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="اكتب اسمك الثلاثي أو الرباعي..."
                    className="w-full pl-3 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-[#115e59] focus:outline-none transition leading-normal"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Phone field */}
              <div className="space-y-1">
                <label className="block text-xs font-black text-slate-650">رقم الهاتف للتواصل ومطابقة الرقم (واتس اب):</label>
                <div className="relative font-mono">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="مثال: 010XXXXXXXX"
                    className="w-full pl-3 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-[#115e59] focus:outline-none transition leading-normal text-right"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Specialization Selection field */}
              <div className="space-y-1">
                <label className="block text-xs font-black text-slate-650">الملف أو الدليل المراد تحميله:</label>
                <select
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-bold focus:ring-2 focus:ring-teal-500/20 focus:border-[#115e59] focus:outline-none transition"
                >
                  {pdfLibraryList.map((file) => (
                    <option key={file.id} value={file.specialization}>
                      📙 {file.name}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-250 rounded-lg text-rose-700 text-[11px] font-bold flex items-center gap-1.5 leading-relaxed">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit / Download Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-lg transition active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
                style={{ minHeight: "44px" }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    <span>جاري تسجيل الطلب وتجهيز ملف التحميل...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-emerald-100 animate-bounce" />
                    <span>حفظ البيانات والتحميل الفوري للملف PDF 💾</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4 animate-scale-up py-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6 text-emerald-600 animate-bounce" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-sm text-slate-900">تم تفعيل كود التحميل وبدأ التنزيل تلقائياً! 🎉</h4>
                <p className="text-[11px] text-slate-500 font-bold leading-normal">
                  نشكرك على اهتمامك بـ ({specialization}). تم تسجيل بياناتك وحفظ طلبك في المنظومة المركزية لمتابعتك.
                </p>
              </div>

              <hr className="border-slate-100 my-2" />

              <a
                href={currentDownloadUrl}
                download={`دليل_${specialization.replace(/\s+/g, "_")}_2026.pdf`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-md animate-pulse"
                style={{ minHeight: "44px" }}
              >
                <Download className="w-4 h-4 shrink-0" />
                <span>تحميل بديل يدوي مباشر للدليل (إذا لم يبدأ تلقائياً) ⬇️</span>
              </a>

              <p className="text-[9.5px] text-slate-400">إذا لم يبدأ التحميل تلقائياً خلال ثوانٍ، اضغط على الزر أعلاه للتحميل الفوري.</p>
            </div>
          )}
        </div>

        {/* Footer lock state */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-sans">
          <span>حماية وسرية تامة ومصداقية كاملة</span>
          <span className="font-semibold text-emerald-600 flex items-center gap-0.5">
            <CheckCircle className="w-3.5 h-3.5 inline text-emerald-600" /> اتصال مشفر وآمن
          </span>
        </div>
      </div>
    </div>
  );
}
