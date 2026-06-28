import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Clock, PhoneCall, Lock, ChevronLeft, X, Check, Users, Menu } from "lucide-react";
import { useSimulatedCount } from "../hooks/useSimulatedCount";
import { supabase, hasSupabase } from "../supabaseClient";

// Simulated background entries pool containing at least 30 distinct organic Arabic identities
const SIMULATED_POOL = [
  { name: "أمجد سمير كمال", governorate: "الدقهلية", dept: "تحاليل طبية وأشعة (مساعد خدمات صحية)" },
  { name: "فاطمة أحمد الزهراء", governorate: "الإسكندرية", dept: "تمريض (مساعد خدمات صحية)" },
  { name: "كريم حسين مرسي", governorate: "الجيزة", dept: "البرمجة والذكاء الاصطناعي (نظم معلومات)" },
  { name: "ولاء حسن الصياد", governorate: "البحيرة", dept: "إدارة الأعمال والنظم والعلاقات العامة" },
  { name: "إبراهيم فرج الشافعي", governorate: "القليوبية", dept: "بترول وبتروكيماويات" },
  { name: "شروق محمد الرفاعي", governorate: "الشرقية", dept: "تركيبات الأسنان" },
  { name: "مصطفى عادل يسري", governorate: "الفيوم", dept: "مساحة وخرائط" },
  { name: "روان بهجت خليل", governorate: "طنطا", dept: "التسويق الإلكتروني" },
  { name: "سعد الدين محمود", governorate: "أسيوط", dept: "تشييد وبناء" },
  { name: "منار زكريا عبد الله", governorate: "السويس", dept: "تغذية علاجية" },
  { name: "يوسف أحمد النجار", governorate: "القاهرة", dept: "البرمجة والذكاء الاصطناعي (نظم معلومات)" },
  { name: "رنا سعيد جلال", governorate: "المنوفية", dept: "صحافة وإعلام" },
  { name: "محمود عبد الرحمن", governorate: "الأقصر", dept: "مساحة وخرائط" },
  { name: "ليلى فوزي البدري", governorate: "الإسماعيلية", dept: "لغات وترجمة" },
  { name: "أمجد سيف النصر", governorate: "بورسعيد", dept: "التصميم والفنون الجميلة" },
  { name: "سارة كمال الهواري", governorate: "سوهاج", dept: "تمريض (مساعد خدمات صحية)" },
  { name: "مهند عمرو الشرقاوي", governorate: "الغربية", dept: "ضيافة جوية" },
  { name: "ندى عماد الشريف", governorate: "القاهرة", dept: "تحاليل طبية وأشعة (مساعد خدمات صحية)" },
  { name: "عبد الله جلال مراد", governorate: "المنيا", dept: "سياحة وفنادق" },
  { name: "رانيا عصام هلال", governorate: "بني سويف", dept: "ضباط لاسلكي" },
  { name: "حازم أشرف عبد الخالق", governorate: "الإسكندرية", dept: "تربية خاصة" },
  { name: "جهاد رأفت الجبالي", governorate: "القليوبية", dept: "تحاليل طبية وأشعة (مساعد خدمات صحية)" },
  { name: "علاء مرسي أبو العزم", governorate: "كفر الشيخ", dept: "بترول وبتروكيماويات" },
  { name: "مروة شريف غانم", governorate: "الجيزة", dept: "البرمجة والذكاء الاصطناعي (نظم معلومات)" },
  { name: "يحيى زكريا الطوخي", governorate: "دمياط", dept: "التسويق الإلكتروني" },
  { name: "إيمان عادل المليجي", governorate: "البحيرة", dept: "تركيبات الأسنان" },
  { name: "باسل فريد الخياط", governorate: "قنا", dept: "تشييد وبناء" },
  { name: "ضحى مسعد الوكيل", governorate: "الشرقية", dept: "تغذية علاجية" },
  { name: "عمر ياسر القاضي", governorate: "الفيوم", dept: "إدارة الأعمال والنظم والعلاقات العامة" },
  { name: "دينا طارق رسلان", governorate: "أسوان", dept: "صحافة وإعلام" }
];

function stripEmojis(text: string): string {
  if (!text) return "";
  try {
    return text.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "").trim();
  } catch (e) {
    return text.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}]/gu, "").trim();
  }
}

function maskName(fullName: string): string {
  if (!fullName) return "";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return "";
  const firstName = parts[0];
  if (parts.length === 1) {
    return firstName + " " + "*".repeat(3);
  }
  const secondInitial = parts[1][0] || "";
  return `${firstName} ${secondInitial}${"*".repeat(3)}`;
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [time, setTime] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);
  
  const simulatedStudentsCount = useSimulatedCount();

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const [isCallbackModalOpen, setIsCallbackModalOpen] = useState(false);
  const [cbName, setCbName] = useState("");
  const [cbPhone, setCbPhone] = useState("");
  const [cbSuccess, setCbSuccess] = useState(false);
  const [cbError, setCbError] = useState<string | null>(null);
  const [cbLoading, setCbLoading] = useState(false);

  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    const isHC = localStorage.getItem("high_contrast") === "true";
    setHighContrast(isHC);
    if (isHC) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
  }, []);

  const toggleHighContrast = () => {
    const nextHC = !highContrast;
    setHighContrast(nextHC);
    localStorage.setItem("high_contrast", String(nextHC));
    if (nextHC) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
    window.dispatchEvent(new Event("high_contrast_changed"));
  };

  // Live Geo-Registration Ticker states
  const [tickerActive, setTickerActive] = useState(true);
  const [trueRegistrations, setTrueRegistrations] = useState<any[]>([]);
  const [activeDepts, setActiveDepts] = useState<string[]>([
    "تحاليل طبية وأشعة (مساعد خدمات صحية)",
    "تمريض (مساعد خدمات صحية)",
    "تركيبات الأسنان",
    "تغذية علاجية",
    "بترول وبتروكيماويات",
    "مساحة وخرائط",
    "تشييد وبناء",
    "البرمجة والذكاء الاصطناعي (نظم معلومات)",
    "إدارة الأعمال والنظم والعلاقات العامة",
    "التسويق الإلكتروني",
    "صحافة وإعلام",
    "لغات وترجمة",
    "تربية خاصة",
    "التصميم والفنون الجميلة",
    "ضيافة جوية",
    "سياحة وفنادق",
    "ضباط لاسلكي"
  ]);

  const loadTrueRegistrations = async () => {
    try {
      let combined: any[] = [];
      if (hasSupabase) {
        // 1. Fetch from Supabase with specialization and selected_departments included
        const { data, error } = await supabase
          .from("students")
          .select("full_name, governorate, created_at, specialization, selected_departments")
          .order("created_at", { ascending: false })
          .limit(15);
        
        if (data && !error) {
          combined = data.map(item => {
            let deptName = item.specialization || "";
            if (!deptName && item.selected_departments) {
              let depts = [];
              if (Array.isArray(item.selected_departments)) {
                depts = item.selected_departments;
              } else if (typeof item.selected_departments === "string") {
                try { depts = JSON.parse(item.selected_departments); } catch (e) { depts = []; }
              }
              if (depts && depts.length > 0) {
                deptName = depts[0];
              }
            }
            // Strip emojis from department name to keep the ticker display perfectly clean
            if (deptName) {
              deptName = stripEmojis(deptName);
            }
            if (!deptName || deptName === "القبول والتسجيل المباشر" || deptName === "استفسار عام بالشات" || deptName === "مستندات وقبول كلي") {
              deptName = "البرمجة والذكاء الاصطناعي (نظم معلومات)";
            }
            return {
              name: item.full_name,
              governorate: item.governorate || "محافظة القاهرة",
              dept: deptName,
              isReal: true
            };
          });
        }
      }

      // 2. Fetch/merge from immediate local storage leads for instant client-side testing response
      const localLeadsRaw = localStorage.getItem("academy_direct_leads");
      if (localLeadsRaw) {
        try {
          const localParsed = JSON.parse(localLeadsRaw);
          if (Array.isArray(localParsed)) {
            const mapped = localParsed.map((item: any) => {
              let deptName = (Array.isArray(item.selectedDepartments) && item.selectedDepartments.length > 0) ? item.selectedDepartments[0] : (item.specialization || "");
              if (deptName) {
                deptName = stripEmojis(deptName);
              }
              if (!deptName || deptName === "القبول والتسجيل المباشر" || deptName === "استفسار عام بالشات" || deptName === "مستندات وقبول كلي") {
                deptName = "البرمجة والذكاء الاصطناعي (نظم معلومات)";
              }
              return {
                name: item.studentName || item.fullName,
                governorate: item.governorate || "استمارة حية",
                dept: deptName,
                isReal: true
              };
            });
            // Append and deduplicate by name slightly to prioritize latest inputs
            combined = [...mapped, ...combined];
          }
        } catch (e) {
          console.warn("Local leads parse error", e);
        }
      }

      // De-duplicate matching names
      const seen = new Set();
      const uniqueCombined = combined.filter(item => {
        if (!item.name) return false;
        const key = item.name.trim();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      setTrueRegistrations(uniqueCombined);
    } catch (err) {
      console.warn("Error loading true registrations ticker list", err);
    }
  };

  useEffect(() => {
    const handleTickerActiveCheck = () => {
      const active = localStorage.getItem("academy_simulated_ticker_active") !== "false";
      setTickerActive(active);
    };

    handleTickerActiveCheck();
    loadTrueRegistrations();

    // Fetch live active departments
    fetch("/api/roi-departments")
      .then(res => res.json())
      .then(data => {
        if (data && data.success && Array.isArray(data.departments)) {
          const names = data.departments.map((d: any) => {
            // Strip any emojis for cleaner display in the scrolling ticker
            return stripEmojis(d.name);
          });
          if (names.length > 0) {
            setActiveDepts(names);
          }
        }
      })
      .catch(err => console.warn("Failed to fetch roi departments", err));

    // Event listeners for absolute live reactivity
    window.addEventListener("storage", (e) => {
      if (e.key === "academy_simulated_ticker_active") {
        setTickerActive(e.newValue !== "false");
      }
      if (e.key === "academy_direct_leads") {
        loadTrueRegistrations();
      }
    });

    const handleLeadsUpdatedEvent = () => {
      loadTrueRegistrations();
    };

    window.addEventListener("academy_leads_updated", handleLeadsUpdatedEvent);

    return () => {
      window.removeEventListener("academy_leads_updated", handleLeadsUpdatedEvent);
    };
  }, []);

  // Stable, performance-optimized, non-shivering ticker items stream
  const tickerItems = useMemo(() => {
    const simulatedMapped = SIMULATED_POOL.map((item, index) => {
      // Deterministically map simulated names to actual active departments in the academy
      const deptName = activeDepts[index % activeDepts.length];
      return {
        text: `🔥 انضم الآن الطالب ${maskName(item.name)} من ${item.governorate} لشعبة ${deptName}`,
        isReal: false
      };
    });

    const realMapped = trueRegistrations.map(item => ({
      text: `🎉 حجز مؤكد وموثق للطالب ${maskName(item.name || "جديد")} من ${item.governorate || "محافظة القاهرة"} لشعبة ${item.dept || "مستندات وقبول كلي"}`,
      isReal: true
    }));

    if (tickerActive) {
      return [...realMapped, ...simulatedMapped];
    } else {
      return realMapped;
    }
  }, [trueRegistrations, tickerActive, activeDepts]);

  // Dynamically calculate ticker duration for a uniform scrolling speed (constant pace per item)
  // Highly readable on mobile (very slow: 22s per item) and smooth on desktop (14s per item)
  const tickerDuration = useMemo(() => {
    const factor = isMobile ? 22 : 14;
    return `${Math.max(30, tickerItems.length * factor)}s`;
  }, [tickerItems.length, isMobile]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRequestCallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cbPhone.trim()) {
      setCbError("من فضلك اكتب رقم هاتفك أولاً.");
      return;
    }
    setCbLoading(true);
    setCbError(null);
    try {
      const res = await fetch("/api/callbacks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: cbPhone, studentName: cbName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setCbSuccess(true);
      setCbName("");
      setCbPhone("");
    } catch (err: any) {
      setCbError(err.message || "عذراً فشل إرسال الطلب.");
    } finally {
      setCbLoading(false);
    }
  };

  const formatEgyptianTime = (date: Date) => {
    return date.toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="w-full flex flex-col font-sans sticky top-0 z-50 shadow-sm" dir="rtl">
      
      {/* 1. شريط الإعلانات العلوي الرفيع */}
      <div className="bg-[#0A2463] text-white text-[7px] md:text-xs py-1 md:py-1.5 px-2 md:px-3 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1">
          <div className="flex items-center gap-1">
            <span className="bg-[#FF7F50] text-white font-black text-[7px] md:text-[9px] px-1 py-0.5 rounded-sm animate-pulse shrink-0">
              خصومات حصرية محدودة🔥
            </span>
            <p className="font-medium text-slate-200 text-center text-[7.5px] md:text-xs">
              فرص حجز مفعّلة مؤقتاً للتقديم المبكر لعام ٢٠٢٦
            </p>
          </div>
          
          <div className="flex items-center gap-1.5 text-[8px] md:text-xs font-sans text-slate-350">
            <span className="flex items-center gap-1 bg-[#102a6b] px-1 md:px-2 py-0.5 rounded text-amber-300 font-bold border border-amber-500/25 text-[8px]">
              <Users className="w-2.5 h-2.5 md:w-3 md:h-3 text-amber-400 shrink-0" />
              <span>التقديمات لحظياً:</span>
              <span className="font-mono text-white font-extrabold">{simulatedStudentsCount.toLocaleString("ar-EG")}</span>
            </span>
            <span className="flex items-center gap-1 font-mono hidden sm:flex">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>بتوقيت القاهرة: {formatEgyptianTime(time)}</span>
            </span>
          </div>
        </div>
      </div>

      {/* 1.5 شريط التسجيلات والقبول الحي (Live Geo-Registration Ticker) */}
      <div 
        className="bg-[#040D21] text-white py-0.5 md:py-1.5 px-2 md:px-3 border-b border-indigo-950/50 text-[7px] md:text-[10px] font-sans overflow-hidden select-none relative z-20" 
        id="geo-registration-ticker"
        dir="rtl"
      >
        <div className="max-w-7xl mx-auto w-full flex items-center gap-1.5 md:gap-3">
          <div className="bg-emerald-500 text-slate-950 text-[8px] md:text-xs px-1.5 py-0.5 md:px-3 md:py-1 font-black rounded shrink-0 flex items-center gap-0.5 md:gap-1 shadow-xs animate-pulse">
            <span className="relative flex h-1 w-1 md:h-1.5 md:w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1 w-1 md:h-1.5 md:w-1.5 bg-slate-950"></span>
            </span>
            <span>لوحة التسجيلات 🟢</span>
          </div>

          <div className="relative w-full overflow-hidden flex items-center h-4 md:h-5">
            {tickerItems.length > 0 ? (
              <div 
                className="flex animate-marquee whitespace-nowrap gap-4 md:gap-8 text-[8px] md:text-[12px] font-extrabold text-[#94A3B8]"
                style={{ animationDuration: tickerDuration, animationTimingFunction: "linear", willChange: "transform" }}
              >
                {tickerItems.concat(tickerItems).map((item, idx) => (
                  <span key={idx} className="flex items-center gap-1.5 md:gap-2.5">
                    <span className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full inline-block ${item.isReal ? "bg-emerald-400" : "bg-cyan-400 animate-pulse"}`}></span>
                    <span className={item.isReal ? "text-emerald-300 font-black border-b border-emerald-500/20" : "text-white"}>
                      {item.text}
                    </span>
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-[7px] md:text-[10px] text-slate-400 animate-pulse">بانتظار تسجيلات الطلاب النشطة للظهور هنا...</span>
            )}
          </div>
        </div>
      </div>

       {/* 2. شريط التنقل الأساسي الزجاجي النحيف جداً على الموبايل */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 py-1.5 md:py-2 px-2.5 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 md:gap-2">
          
          {/* الشعار والاسم متجاوب ورشيق للغاية */}
          <div className="flex items-center gap-1.5 md:gap-2 shrink-0 text-right">
            <img 
              src="/logo.png" 
              className="h-7 w-7 md:h-12 md:w-12 bg-white p-0.5 rounded-full border border-slate-200 object-cover shadow-sm" 
              alt="بوابة المعاهد والأكاديميات الخاصة" 
              referrerPolicy="no-referrer"
            />
            <div className="space-y-0">
              <h1 className="font-black text-[8px] md:text-sm text-[#0A2463] font-sans tracking-tight">
                بوابة المعاهد والأكاديميات الخاصة
              </h1>
              <p className="hidden xl:block text-[8.5px] sm:text-[10.5px] text-[#D49800] font-black font-sans leading-none mt-1">
                المنصة التفاعلية المعتمدة للتسجيل والتوجيه
              </p>
            </div>
          </div>

          {/* القائمة للكمبيوتر فقط واللاب توب - موسطنة ومنسقة بشكل شيك */}
          <div className="hidden lg:flex flex-1 justify-center mx-1.5 xl:mx-3">
            <nav className="flex items-center gap-1.5 bg-slate-50/70 p-1 rounded-2xl border border-slate-100/80 relative">
              {[
                { path: "/", text: "الرئيسية", icon: "" },
                { path: "/registration-guide", text: "دليل التسجيل", icon: "📋" },
                { path: "/departments", text: "الأقسام", icon: "📚" },
                { path: "/news", text: "الأخبار", icon: "📰" },
                { path: "/form-extraction", text: "الاستمارة 📄", icon: "", isSpecial: true }
              ].map((item) => (
                <Link 
                  key={item.path}
                  to={item.path} 
                  className={`px-3.5 py-2 rounded-xl text-xs xl:text-sm font-black transition flex items-center gap-1.5 shrink-0 ${
                    isActive(item.path) 
                      ? "bg-[#0A2463] text-white shadow-sm" 
                      : item.isSpecial 
                        ? "bg-amber-500 text-slate-950 hover:bg-amber-600 border border-amber-400 font-black shadow-3xs" 
                        : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span>{item.text}</span>
                  {item.icon && <span className="text-xs xl:text-sm opacity-90 inline-block">{item.icon}</span>}
                </Link>
              ))}

              {/* Dropdown "المزيد ▾" */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setShowMoreDropdown(!showMoreDropdown)}
                  className={`px-3.5 py-2 rounded-xl text-xs xl:text-sm font-black transition flex items-center gap-1 cursor-pointer select-none ${
                    showMoreDropdown ? "bg-slate-200 text-slate-900" : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span>المزيد ▾</span>
                </button>

                {showMoreDropdown && (
                  <>
                    {/* Backdrop to close the dropdown when clicking outside */}
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowMoreDropdown(false)}
                    />
                    <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl py-2.5 z-20 text-right animate-scale-up" dir="rtl">
                      {[
                        { path: "/trending", text: "الأكثر طلباً", icon: "🔥" },
                        { path: "/guidance", text: "اكتشف مجالك", icon: "🧭" },
                        { path: "/complaints", text: "الشكاوى", icon: "📢" },
                        { path: "/about", text: "عن البوابة", icon: "🏢" },
                        { path: "/privacy", text: "الخصوصية", icon: "🔒" },
                      ].map((subItem) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          onClick={() => setShowMoreDropdown(false)}
                          className={`block px-4 py-2.5 text-xs xl:text-sm font-black transition-colors ${
                            isActive(subItem.path)
                              ? "bg-[#0A2463]/10 text-[#0A2463]"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            {subItem.icon && <span className="text-sm shrink-0">{subItem.icon}</span>}
                            <span>{subItem.text}</span>
                          </div>
                        </Link>
                      ))}
                      <div className="border-t border-slate-100 my-1" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleHighContrast();
                          setShowMoreDropdown(false);
                        }}
                        className="w-full text-right px-4 py-2.5 text-xs xl:text-sm font-black text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm shrink-0">👁️</span>
                          <span>التباين العالي</span>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${highContrast ? "bg-[#0A2463] text-white" : "bg-slate-100 text-slate-500"}`}>
                          {highContrast ? "مفعّل" : "مغلق"}
                        </span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </nav>
          </div>

          {/* زر الطلب السريع للاتصال */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <button
              onClick={() => { setCbSuccess(false); setCbError(null); setIsCallbackModalOpen(true); }}
              className="bg-[#FF7F50] text-white hover:bg-[#FF7F50]/95 px-4 py-2.5 rounded-xl text-xs xl:text-sm font-black transition flex items-center gap-1.5 cursor-pointer shadow-md whitespace-nowrap active:scale-95"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>اتصل بمستشار 📞</span>
            </button>
          </div>

          {/* واجهة التليفون: زر الحجز السريع + زر القائمة الـ Hamburger الحقيقي */}
          <div className="flex lg:hidden items-center gap-2">
            <Link
              to="/discounts"
              className="bg-[#FF7F50] hover:bg-[#FF7F50]/95 text-white px-3 py-1.5 text-[10px] font-black rounded-lg transition shadow-xs active:scale-95"
            >
              احجز الآن 🏷️
            </Link>
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 text-slate-700 hover:bg-slate-100 active:bg-slate-200 rounded-lg border border-slate-200 transition-all flex items-center justify-center shrink-0"
            >
              {isOpen ? <X className="w-4 h-4 text-red-500" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

        </div>

        {/* المنيو المنسدل للموبايل - بيقفل ويفتح بضغطة واحدة من غير أي بوظان */}
        {isOpen && (
          <div className="lg:hidden mt-2 border-t border-slate-100 pt-2 pb-2 space-y-1 bg-white text-right animate-fade-in px-1">
            {[
              { path: "/", label: "الرئيسية" },
              { path: "/registration-guide", label: "كيفية التسجيل 📋" },
              { path: "/departments", label: "تصفح الأقسام 📚" },
              { path: "/news", label: "أخبار ومقالات 📰" },
              { path: "/trending", label: "الأكثر طلباً 🔥" },
              { path: "/guidance", label: "اكتشف مجالك 🧭" },
              { path: "/form-extraction", label: "📄 استخرج استمارتك للتقديم" },
              { path: "/complaints", label: "الشكاوى والمقترحات 📢" },
              { path: "/about", label: "عن البوابة" },
              { path: "/privacy", label: "سياسة الخصوصية 🔒" }
            ].map((item) => (
              <Link 
                key={item.path}
                to={item.path} 
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                  isActive(item.path) ? "bg-[#0A2463] text-white" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {item.label}
              </Link>
            ))}
             {/* زر التباين العالي للموبايل */}
            <button
              onClick={() => { toggleHighContrast(); }}
              className={`w-full text-right block px-3 py-2.5 text-xs font-black rounded-xl border ${
                highContrast 
                  ? "bg-yellow-400 text-black border-yellow-500" 
                  : "bg-slate-100 text-slate-800 border-slate-200"
              }`}
            >
              👁️ وضع التباين العالي: {highContrast ? "مفعّل 🟢" : "مغلق 🔴"}
            </button>

            <button
              onClick={() => { setIsOpen(false); setCbSuccess(false); setCbError(null); setIsCallbackModalOpen(true); }}
              className="w-full text-right block px-3 py-2.5 text-xs font-black text-[#FF7F50] bg-amber-50/50 rounded-xl hover:bg-amber-50"
            >
              طلب مكالمة مستشار 📞
            </button>
          </div>
        )}
      </header>

      {/* مودال طلب الاتصال السريع */}
      {isCallbackModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[150] flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-right animate-scale-up">
            <div className="bg-[#0A2463] p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-amber-400" />
                <h4 className="font-extrabold text-xs sm:text-sm">اتصال من مستشار التسجيل 📞</h4>
              </div>
              <button onClick={() => setIsCallbackModalOpen(false)} className="text-slate-300 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleRequestCallbackSubmit} className="p-5 space-y-4">
              {cbSuccess ? (
                <div className="space-y-3 text-center py-2">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100"><Check className="w-5 h-5" /></div>
                  <h5 className="font-black text-sm text-emerald-800">تم تسجيل طلبك بنجاح! ⭐</h5>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">سيقوم مستشار القبول بالتواصل المباشر معكم لشرح التخصصات والخصومات الجارية.</p>
                  <button type="button" onClick={() => { setIsCallbackModalOpen(false); setCbSuccess(false); }} className="w-full py-2 bg-slate-900 text-white text-xs font-bold rounded-xl">موافق</button>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">اسم الطالب (اختياري):</label>
                      <input type="text" value={cbName} onChange={(e) => setCbName(e.target.value)} placeholder="اكتب اسمك هنا" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#0A2463]" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">رقم الهاتف النشط (مهم جداً):</label>
                      <input type="tel" required value={cbPhone} onChange={(e) => setCbPhone(e.target.value)} placeholder="مثال: 01012345678" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold text-sm text-slate-800 focus:outline-none" />
                    </div>
                  </div>
                  {cbError && <p className="text-xs text-red-500 font-bold">⚠️ {cbError}</p>}
                  <button type="submit" disabled={cbLoading} className="w-full py-2.5 bg-[#FF7F50] text-white text-xs font-black rounded-xl hover:bg-[#FF7F50]/90 disabled:opacity-40">{cbLoading ? "جاري الإرسال..." : "اتصل بي الآن 📞"}</button>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}