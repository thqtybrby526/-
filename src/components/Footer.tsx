import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  ChevronLeft,
  Facebook,
  Instagram,
  Mail,
  ShieldCheck,
  Award,
  BookOpen,
  Compass,
  HeartHandshake,
  Lock,
  X,
  Check,
  ShieldAlert
} from "lucide-react";
import DeveloperFeederModal from "./DeveloperFeederModal";

export default function Footer() {
  const navigate = useNavigate();
  const [flagClicks, setFlagClicks] = useState(0);
  const [isAdminPasswordModalOpen, setIsAdminPasswordModalOpen] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  // Developer Easter Egg (5 clicks on Gold Medal icon)
  const [devClicks, setDevClicks] = useState(0);
  const [isDevPromptOpen, setIsDevPromptOpen] = useState(false);
  const [devPasswordInput, setDevPasswordInput] = useState("");
  const [devPasswordError, setDevPasswordError] = useState(false);
  const [isDevModalOpen, setIsDevModalOpen] = useState(false);

  const handleFlagClick = () => {
    setFlagClicks((prev) => {
      const nextClicks = prev + 1;
      if (nextClicks >= 3) {
        setIsAdminPasswordModalOpen(true);
        setAdminPasswordInput("");
        setPasswordError(false);
        return 0;
      }
      return nextClicks;
    });
  };

  const handleVerifyPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasswordInput.trim() === "admin123") {
      setPasswordError(false);
      setIsAdminPasswordModalOpen(false);
      setAdminPasswordInput("");
      if (typeof window !== "undefined") {
        sessionStorage.setItem("admin_authenticated", "true");
      }
      navigate("/admin");
    } else {
      setPasswordError(true);
      // Reset clicks
      setFlagClicks(0);
    }
  };

  const handleDevMedalClick = () => {
    setDevClicks((prev) => {
      const nextClicks = prev + 1;
      if (nextClicks >= 5) {
        setIsDevPromptOpen(true);
        setDevPasswordInput("");
        setDevPasswordError(false);
        return 0;
      }
      return nextClicks;
    });
  };

  const handleVerifyDevPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (devPasswordInput.trim() === "Mm151997") {
      setDevPasswordError(false);
      setIsDevPromptOpen(false);
      setDevPasswordInput("");
      setIsDevModalOpen(true);
    } else {
      setDevPasswordError(true);
      setDevClicks(0);
    }
  };

  const handleComplaintClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate("/complaints");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-slate-950 text-white pt-16 pb-8 px-4 md:px-8 border-t-4 border-amber-500 font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-right">
        
        {/* Column 1: About the Portal */}
        <div className="space-y-4">
          <div className="flex items-center gap-3.5 justify-start">
            <img 
              src="/src/assets/images/logo_academic_white_1781734502554.jpg" 
              className="h-12 w-12 object-cover rounded-full bg-white border border-slate-800 shadow-md shrink-0" 
              alt="بوابة المعاهد والأكاديميات" 
              referrerPolicy="no-referrer"
            />
            <div>
              <h3 className="text-base font-black text-white leading-tight">بوابة المعاهد والأكاديميات</h3>
              <p className="text-[10px] text-amber-500 font-extrabold tracking-widest leading-none mt-1">المنصة الشريكة للتوجيه الذكي</p>
            </div>
          </div>
          
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            أكثر من 10 سنوات من الخبرة المتراكمة وعلاقات الشراكة الأكاديمية الراسخة لمساندة الطلاب وأولياء الأمور في توجيه رغباتهم وحجز مقاعدهم بالقبول المباشر.
          </p>
          
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold rounded-md border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>مظلة استشارية معتمدة</span>
            </span>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="space-y-4">
          <h4 className="text-sm font-black text-white border-r-4 border-amber-500 pr-2.5">روابط التنقل السريع</h4>
          <ul className="space-y-2.5 text-xs font-semibold">
            <li>
              <Link 
                to="/" 
                className="text-slate-350 hover:text-amber-450 transition-all flex items-center gap-1.5 justify-start hover:translate-x-[-4px]"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                <ChevronLeft className="w-3.5 h-3.5 text-slate-650 shrink-0" />
                <span>الصفحة الرئيسية للبوابة</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/departments" 
                className="text-slate-350 hover:text-amber-450 transition-all flex items-center gap-1.5 justify-start hover:translate-x-[-4px]"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                <ChevronLeft className="w-3.5 h-3.5 text-slate-650 shrink-0" />
                <span>تصفح الأقسام والتخصصات</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/about" 
                className="text-slate-350 hover:text-amber-450 transition-all flex items-center gap-1.5 justify-start hover:translate-x-[-4px]"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                <ChevronLeft className="w-3.5 h-3.5 text-slate-650 shrink-0" />
                <span>عن البوابة ورؤيتنا</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/privacy" 
                className="text-slate-350 hover:text-amber-450 transition-all flex items-center gap-1.5 justify-start hover:translate-x-[-4px]"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                <ChevronLeft className="w-3.5 h-3.5 text-slate-650 shrink-0" />
                <span>سياسة الخصوصية وسرية المعلومات</span>
              </Link>
            </li>
            <li>
              <a 
                href="/?tab=complaints" 
                onClick={handleComplaintClick}
                className="text-slate-350 hover:text-amber-455 transition-all flex items-center gap-1.5 justify-start hover:translate-x-[-4px]"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-slate-650 shrink-0" />
                <span>الشكاوى والمقترحات للعملاء</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Column 3: Trust & Quality */}
        <div className="space-y-4">
          <h4 className="text-sm font-black text-white border-r-4 border-emerald-500 pr-2.5">الاعتماد والجودة والأمان</h4>
          <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-3.5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-xs font-bold text-slate-100 block">خصوصية البيانات وسريتها 🔒</strong>
                <p className="text-[10px] text-slate-400 leading-normal mt-0.5">
                  جميع سجلات التسجيل وأرقام هواتف الطلاب والشهادات مشفرة تماماً ومحمية لمراعاة خصوصية الاستلام.
                </p>
              </div>
            </div>
            
            <div className="h-px bg-slate-800" />
            
            <div className="flex items-start gap-3">
              <Award className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-xs font-bold text-slate-100 block">معايير الدقة والنزاهة</strong>
                <p className="text-[10px] text-slate-400 leading-normal mt-0.5">
                  توجيه أكاديمي بمصداقية مطلقة لربط الطلاب بالمقاعد المرخصة والشعب الدراسية الفعلية دون مغالطات.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Column 4: Official Communication Channels */}
        <div className="space-y-4">
          <h4 className="text-sm font-black text-white border-r-4 border-slate-500 pr-2.5">قنوات التواصل المعتمدة</h4>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            يرجى مرؤوسة الدعم الفني بالبوابة لخدمتكم والإجابة على تظلماتكم:
          </p>
          
          <div className="space-y-2.5 font-sans">
            {/* Facebook Link */}
            <a 
              href="https://www.facebook.com/Privateinstitutesandacademies1/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 text-blue-100 text-xs font-bold transition duration-200 group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Facebook className="w-4 h-4 text-blue-400" />
                <span>صفحة الفيسبوك الرسمية</span>
              </div>
              <ChevronLeft className="w-3.5 h-3.5 text-blue-400/60 group-hover:translate-x-[-2px] transition-transform" />
            </a>

            {/* Instagram Link */}
            <a 
              href="https://www.instagram.com/private_institutes_and_academi/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/20 text-rose-100 text-xs font-bold transition duration-200 group cursor-pointer hover:bg-gradient-to-r hover:from-purple-950 hover:to-rose-950"
            >
              <div className="flex items-center gap-2">
                <Instagram className="w-4 h-4 text-rose-400" />
                <span>حساب انستجرام الرسمي</span>
              </div>
              <span className="text-[9px] text-rose-300 font-extrabold pr-1 font-mono">@private_institutes</span>
            </a>

            {/* Email Link */}
            <a 
              href="mailto:almahdwalakadymyatalkhash@gmail.com"
              className="flex items-center gap-1.5 hover:text-amber-400 text-slate-300 transition duration-150 py-1.5"
            >
              <Mail className="w-4.5 h-4.5 text-amber-500 shrink-0" />
              <span className="font-mono text-[10.5px] truncate">almahdwalakadymyatalkhash@gmail.com</span>
            </a>
          </div>
        </div>

      </div>

      {/* Egyptian National Pride Badge */}
      <div className="max-w-7xl mx-auto border-t border-slate-900 mt-10 pt-8">
        <div className="bg-gradient-to-r from-slate-950 to-slate-900/40 p-4 rounded-2xl border border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-right">
          
          <div 
            onClick={handleFlagClick}
            className="flex items-center gap-3.5 cursor-pointer select-none group/flag"
            title="جمهورية مصر العربية 🇪🇬"
          >
            {/* Real aesthetic design of Egypt's flag */}
            <div className="flex flex-col w-11 h-7 border border-slate-800/80 overflow-hidden rounded-sm shrink-0 shadow-md relative group-hover/flag:scale-105 transition-transform duration-200">
              <div className="bg-[#FF0000] h-1/3"></div>
              <div className="bg-white h-1/3 flex items-center justify-center relative">
                <span className="text-[7px] text-amber-500 absolute select-none leading-none">🦅</span>
              </div>
              <div className="bg-[#000000] h-1/3"></div>
            </div>
            <div>
              <span className="text-xs font-black text-slate-100 block leading-tight group-hover/flag:text-amber-400 transition-colors">جمهورية مصر العربية</span>
              <p className="text-[10px] text-slate-400 font-bold font-sans mt-0.5">تحت مظلة رعاية الكفاءات الشابة وتمكين رغبات التعليم والمهارات الوطنية</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:border-r border-slate-800 md:pr-4 md:mr-4">
            <span className="bg-amber-500/10 text-amber-450 px-2.5 py-1 rounded-lg text-[9px] font-black border border-amber-500/20 shrink-0">
              رؤية مصر ٢٠٣٠ 🇪🇬✨
            </span>
            <p className="text-[10px] text-slate-300 leading-relaxed font-sans max-w-xl">
              ندعم بقوة جهود الدولة الاستباقية لتنمية مهارات الكوادر الواعدة وتمكين التكنولوجيا الحديثة لدعم بناء أجيال المستقبل وبالمساهمة الحية في بناء الجمهورية الجديدة.
            </p>
          </div>

        </div>
      </div>

      {/* Copyrights and Custom Developer Signature */}
      <div className="max-w-7xl mx-auto border-t border-slate-900 mt-6 pt-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-sans text-center sm:text-right">
        <div className="space-y-1">
          <p className="font-extrabold text-[11px] text-slate-350">جميع الحقوق محفوظة لبوابة المعاهد والأكاديميات الخاصة © 2026</p>
          <p className="text-[10px] text-slate-500">منصة إرشادية وتسهيل إجراءات استشارية حرة، لا تقدم وعوداً أكاديمية مضللة ومستقلة تماماً.</p>
        </div>
        
        <div className="flex flex-col items-center gap-2">
          <div className="bg-slate-900/50 px-5 py-3 border border-slate-800 rounded-xl flex items-center justify-center gap-1.5 hover:border-amber-500/20 transition-all font-sans">
            <span className="text-[11px] text-slate-300">برمجة وتطوير المهندس محمد ممدوح الروبي</span>
          </div>
          <div 
            onClick={handleDevMedalClick}
            className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-amber-500/10 border border-amber-500/30 rounded-full shadow-sm animate-pulse cursor-pointer hover:scale-105 active:scale-95 transition-all select-none"
          >
            <span className="text-[10px] font-black text-amber-350 uppercase tracking-wider">🏅 وسام التميز الإداري (Premium)</span>
          </div>
        </div>
      </div>

      {/* Corporate Legal Disclaimer Box */}
      <div className="max-w-7xl mx-auto text-xs text-slate-400 bg-slate-950 p-4 rounded-xl border border-slate-800 text-center mt-6 leading-relaxed font-sans" dir="rtl">
        تنبيه قانوني: المنصة عبارة عن بوابة تدريبية مهنية خاصة معتمدة لتقديم برامج ودبلومات تدريبية وعملية لتأهيل الطلاب لسوق العمل والتوظيف، وليست منشأة تعليمية أكاديمية تابعة لوزارة التعليم العالي والبحث العلمي ولا تخضع لنظام التنسيق الجامعي الحكومي. الشهادات الممنوحة هي شهادات تدريب مهني وخبرة عملية معتمدة.
      </div>
      {/* Admin Password Modal Triggered via Egyptian flag 3 clicks */}
      {isAdminPasswordModalOpen && (
        <div className="fixed inset-0 bg-[#0a2463]/30 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-fade-in" dir="rtl">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-right animate-scale-up">
            
            <div className="bg-slate-950 p-5 text-white flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-500 animate-pulse" />
                <h4 className="font-extrabold text-sm text-white">التحقق الثنائي المشدد للإدارة 🔐</h4>
              </div>
              <button
                onClick={() => {
                  setIsAdminPasswordModalOpen(false);
                  setFlagClicks(0);
                }}
                className="text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <form onSubmit={handleVerifyPasswordSubmit} className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                  بموجب النقر الثلاثي على الرابط السيادي لجمهورية مصر العربية، يرجى تقديم كلمة مرور المشرف العام لتخطي جدار الحماية:
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">أدخل كلمة مرور الإدارة السريّة:</label>
                  <input
                    type="password"
                    required
                    value={adminPasswordInput}
                    onChange={(e) => {
                      setAdminPasswordInput(e.target.value);
                      if (passwordError) setPasswordError(false);
                    }}
                    placeholder="••••••••"
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-950/15 focus:outline-none focus:border-slate-800 text-center font-bold tracking-widest text-lg text-slate-800"
                    autoFocus
                  />
                </div>

                {passwordError && (
                  <p className="text-xs text-red-650 font-bold bg-red-50 p-2.5 rounded-lg border border-red-250 flex items-center gap-1.5 animate-bounce text-red-600">
                    <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
                    <span>كلمة المرور خاطئة، حاول مرة أخرى!</span>
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-slate-950" />
                  <span>تأكيد الهوية وتخطي بوابات الحماية 🔓</span>
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* Developer Master Password Modal (5 clicks on Gold Medal) */}
      {isDevPromptOpen && (
        <div className="fixed inset-0 bg-[#0a2463]/30 backdrop-blur-md z-[210] flex items-center justify-center p-4 animate-fade-in" dir="rtl">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-right animate-scale-up">
            
            <div className="bg-[#0a2463] p-5 text-white flex justify-between items-center border-b border-indigo-950">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-500 animate-pulse" />
                <h4 className="font-extrabold text-sm text-white">بوابة التحقق من المطور السريّة 🥇</h4>
              </div>
              <button
                onClick={() => {
                  setIsDevPromptOpen(false);
                  setDevClicks(0);
                }}
                className="text-slate-350 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <form onSubmit={handleVerifyDevPasswordSubmit} className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                  بموجب النقر الخماسي على شعار التميز والوسامة الإداري، يرجى تقديم الرمز السري الرئيسي لتفجير بوابات تغذية النظام (System Feeder):
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">أدخل رمز تفويض المطور الأكبر:</label>
                  <input
                    type="password"
                    required
                    value={devPasswordInput}
                    onChange={(e) => {
                      setDevPasswordInput(e.target.value);
                      if (devPasswordError) setDevPasswordError(false);
                    }}
                    placeholder="••••••••"
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:outline-none focus:border-slate-800 text-center font-bold tracking-widest text-lg text-slate-900"
                    autoFocus
                  />
                </div>

                {devPasswordError && (
                  <p className="text-xs text-red-650 font-bold bg-red-50 p-2.5 rounded-lg border border-red-250 flex items-center gap-1.5 animate-bounce text-red-600">
                    <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
                    <span>الرمز البرمجي خاطئ! تم إلغاء التفويض الأمني.</span>
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-[#0a2463] hover:bg-slate-900 text-white text-xs font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border border-indigo-950"
                >
                  <Check className="w-4 h-4 text-amber-400" />
                  <span>تأكيد الهوية البرمجية لفك القفل 🔓</span>
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* Developer Feeder Master Modal */}
      <DeveloperFeederModal 
        isOpen={isDevModalOpen}
        onClose={() => setIsDevModalOpen(false)}
      />
    </footer>
  );
}
