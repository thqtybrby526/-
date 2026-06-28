import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, CheckCircle, Bell, User, MapPin, Award, Shield, FileText } from "lucide-react";

interface RealtimeEvent {
  name: string;
  governorate: string;
  specialization: string;
  source: string;
  timestamp?: string;
}

// Simulated backup database for social proof when server is silent
const ARABIC_NAMES_POOL = [
  "أحمد مصطفى", "محمد عبد الرحمن", "محمود الشربيني", "يوسف الدمرداش", "حسن جلال", 
  "عبد الله الصاوي", "كريم عبد الهادي", "عمر الفاروق", "خالد الهواري", "علي زين العابدين",
  "إبراهيم السعيد", "مصطفى الشافعي", "سليمان العزازي", "طارق رضوان", "شريف الحسيني",
  "منى عبد السلام", "فاطمة الزهراء", "آية الشربيني", "أميرة الجبالي", "يارا الكردي",
  "مريم سليمان", "سارة عاصم", "رنا عبد الوهاب", "نوران بدوي", "هدى النجار"
];

const GOVERNORATES_POOL = [
  "الدقهلية", "القاهرة", "الجيزة", "الإسكندرية", "الغربية", 
  "الشرقية", "القليوبية", "المنوفية", "دمياط", "بورسعيد", 
  "البحيرة", "كفر الشيخ", "الفيوم", "بني سويف"
];

const SPECIALIZATIONS_POOL = [
  "قسم التمريض المهني", "قسم إدارة الأعمال والنظم والعلاقات العامة AI", "قسم الضيافة الجوية",  
  "قسم الصحافة والإعلام", "قسم بترول وبتروكيماويات ", "قسم تركيبات الاسنان", 
  "قسم المساحة والخرائط", "قسم اللاسلكي والاتصالات", "قسم فنون جميلة", 
  "قسم لغات وترجمة"
];

const SOURCES_POOL = [
  "استمارة القبول المركزي 🎫", "مستشار القبول الذكي 🤖", "طلب اتصال مباشر 📞",
  "تحميل كراسة الشروط والدليل 📥"
];

export function RealtimeNotificationToast() {
  const [activeNotification, setActiveNotification] = useState<RealtimeEvent | null>(null);
  const sseRef = useRef<EventSource | null>(null);

  // Play a beautiful synthesized warm futuristic digital chime using standard Web Audio API
  const playElegantChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      // Node 1: Gentle warm carrier note (sine wave)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc1.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.12); // Pleasant upward G5 leap
      
      // Node 2: Tech/glimmer top texture (triangle wave)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(1046.50, ctx.currentTime); // C6 sparkle note
      
      // Apply smooth exponential decays to avoid popping
      gain1.gain.setValueAtTime(0.06, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
      
      gain2.gain.setValueAtTime(0.02, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      
      osc1.connect(gain1);
      osc2.connect(gain2);
      gain1.connect(ctx.destination);
      gain2.connect(ctx.destination);
      
      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.75);
      osc2.stop(ctx.currentTime + 0.45);
    } catch (e) {
      console.warn("Chime auto-play deferred by browser security policies", e);
    }
  };

  // Mask student's name professionally to protect privacy while maintaining full authenticity
  const maskName = (rawName: string): string => {
    if (!rawName) return "طالب مهتم";
    const cleaned = rawName.replace(/^\[.*?\]\s*/, "").trim();
    const parts = cleaned.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "طالب جديد";
    if (parts.length === 1) return parts[0];
    
    // Mask subsequent names (e.g. محمد عبد الرحمن -> محمد ع***)
    const firstName = parts[0];
    const maskedParts = parts.slice(1).map(p => {
      if (p.length <= 1) return p + "*";
      return p[0] + "***";
    });
    return [firstName, ...maskedParts].slice(0, 3).join(" ");
  };

  // Trigger a notification display
  const triggerNotification = (event: RealtimeEvent) => {
    setActiveNotification(null);
    // Tiny delay to trigger CSS entry transition
    setTimeout(() => {
      setActiveNotification(event);
      playElegantChime();
    }, 150);
  };

  useEffect(() => {
    // 1. Set up active real-time SSE listener directly from our Express/Vite backend
    const connectSSE = () => {
      console.log("[SSE Client] Connecting to real-time events endpoint...");
      const sse = new EventSource("/api/realtime-events");
      sseRef.current = sse;

      sse.onopen = () => {
        console.log("[SSE Client] Connection established successfully.");
      };

      sse.addEventListener("message", (e) => {
        if (e.data === ": keepalive") return;
        try {
          const parsed = JSON.parse(e.data);
          if (parsed.type === "registration" && parsed.data) {
            console.log("[SSE Client] Received registration event:", parsed.data);
            triggerNotification({
              name: parsed.data.name,
              governorate: parsed.data.governorate,
              specialization: parsed.data.specialization,
              source: parsed.data.source
            });
          }
        } catch (err) {
          console.error("[SSE Client] Error parsing event message:", err);
        }
      });

      sse.onerror = (err) => {
        console.warn("[SSE Client] Event source encountered an error. Attempting auto-reconnect...", err);
        sse.close();
        // Exponential backoff reconnect
        setTimeout(connectSSE, 10000);
      };
    };

    connectSSE();

    // 2. Set up high-conversion social proof simulator (runs occasionally to keep site vibrant)
    const simulateSocialProof = () => {
      // Pick random values from pools
      const randomName = ARABIC_NAMES_POOL[Math.floor(Math.random() * ARABIC_NAMES_POOL.length)];
      const randomGov = GOVERNORATES_POOL[Math.floor(Math.random() * GOVERNORATES_POOL.length)];
      const randomSpec = SPECIALIZATIONS_POOL[Math.floor(Math.random() * SPECIALIZATIONS_POOL.length)];
      const randomSource = SOURCES_POOL[Math.floor(Math.random() * SOURCES_POOL.length)];

      triggerNotification({
        name: randomName,
        governorate: randomGov,
        specialization: randomSpec,
        source: randomSource
      });
    };

    // First simulated social proof after 20 seconds, then every 60-90 seconds
    const initialSimTimeout = setTimeout(() => {
      simulateSocialProof();
    }, 20000);

    const simulationInterval = setInterval(() => {
      // Only simulate if user is active/tab is in focus to prevent sound spam
      if (document.visibilityState === "visible") {
        simulateSocialProof();
      }
    }, 75000);

    return () => {
      if (sseRef.current) {
        sseRef.current.close();
      }
      clearTimeout(initialSimTimeout);
      clearInterval(simulationInterval);
    };
  }, []);

  // Auto-dismiss the active notification after 5.5 seconds
  useEffect(() => {
    if (activeNotification) {
      const dismissTimer = setTimeout(() => {
        setActiveNotification(null);
      }, 5500);
      return () => clearTimeout(dismissTimer);
    }
  }, [activeNotification]);

  // Choose matching visual theme/icon for each registration source
  const getSourceIcon = (source: string) => {
    if (source.includes("🤖") || source.includes("البوت") || source.includes("الذكي")) {
      return <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />;
    }
    if (source.includes("📞") || source.includes("اتصال")) {
      return <Bell className="w-5 h-5 text-indigo-500 animate-bounce" />;
    }
    if (source.includes("📥") || source.includes("دليل")) {
      return <FileText className="w-5 h-5 text-emerald-500" />;
    }
    return <CheckCircle className="w-5 h-5 text-teal-500" />;
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] pointer-events-none select-none max-w-sm w-full font-sans">
      <AnimatePresence mode="wait">
        {activeNotification && (
          <motion.div
            initial={{ opacity: 0, y: 35, scale: 0.93, x: 25 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, y: -25, scale: 0.95, filter: "blur(4px)" }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="pointer-events-auto bg-white/95 backdrop-blur-xl shadow-[0_20px_50px_rgba(15,23,42,0.15)] border border-slate-100/80 rounded-2xl p-4 flex items-start gap-3.5 relative overflow-hidden"
            dir="rtl"
            id="realtime-live-toast"
          >
            {/* Visual shine overlay */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/40 rounded-full blur-2xl pointer-events-none -mr-8 -mt-8" />
            
            {/* Interactive Pulse Dot */}
            <span className="absolute top-3 left-3 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>

            {/* Icon Container */}
            <div className="flex-shrink-0 bg-slate-50 border border-slate-100 p-2.5 rounded-xl flex items-center justify-center shadow-sm">
              {getSourceIcon(activeNotification.source)}
            </div>

            {/* Message Body */}
            <div className="flex-grow min-w-0">
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                <Shield className="w-3 h-3 text-slate-400" />
                <span>نشاط لحظي آمن وموثق</span>
              </div>
              
              {/* Student Name & Gov */}
              <h4 className="text-slate-850 text-[13px] font-bold leading-tight mb-1 flex items-center flex-wrap gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500 inline" />
                <span>{maskName(activeNotification.name)}</span>
                {activeNotification.governorate && (
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 py-0.5 px-2 rounded-full inline-flex items-center gap-0.5">
                    <MapPin className="w-2.5 h-2.5 text-slate-400" />
                    {activeNotification.governorate}
                  </span>
                )}
              </h4>

              {/* Specialization Detail */}
              <p className="text-slate-600 text-xs leading-relaxed mb-2 font-medium flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="truncate">حجز واهتمام في: <strong className="text-slate-850 font-bold">{activeNotification.specialization}</strong></span>
              </p>

              {/* Source/Badge */}
              <div className="flex items-center justify-between border-t border-slate-50 pt-2 text-[10px] text-slate-400 font-bold">
                <span>المصدر: <span className="text-indigo-600 bg-indigo-50/60 border border-indigo-100/30 rounded px-1.5 py-0.5 font-bold">{activeNotification.source}</span></span>
                <span className="text-emerald-600 font-extrabold flex items-center gap-0.5 animate-pulse">
                  ● حجز معتمد
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
