/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from "recharts";
import { DepartmentExplorer } from "./components/DepartmentExplorer";
import { CareerQuiz } from "./components/CareerQuiz";
import { StudentCertificates } from "./components/StudentCertificates";
import { StudentBookingForm } from "./components/StudentBookingForm";
import { ComplaintsForm } from "./components/ComplaintsForm";
import { PopularDepartments } from "./components/PopularDepartments";
import { StudentReviews } from "./components/StudentReviews";
import { ACADEMY_DEPARTMENTS, Department } from "./data";
import { 
  GraduationCap, 
  Map, 
  Settings, 
  BookOpen, 
  Compass, 
  Megaphone, 
  Ticket, 
  Clock, 
  ShieldCheck, 
  ChevronLeft, 
  CheckCircle, 
  Sparkles, 
  AlertTriangle,
  Flame,
  PhoneCall,
  Award,
  ShieldAlert,
  Lock,
  UserCheck,
  FileCheck,
  PhoneOutgoing,
  Trash2,
  Copy,
  RefreshCw,
  X,
  Check,
  Eye,
  Phone,
  MapPin,
  User,
  Calendar,
  MessageCircle,
  Volume2,
  VolumeX,
  Facebook,
  Mail,
  HeartHandshake,
  Users,
  TrendingUp,
  Search
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"depts" | "popular" | "quiz" | "certificates" | "booking" | "complaints">("depts");
  const [preselectedDeptsForBooking, setPreselectedDeptsForBooking] = useState<string[]>([]);
  const [time, setTime] = useState(new Date());
  const [simulatedStudentsCount, setSimulatedStudentsCount] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("academy_simulated_count_v1");
      return saved ? parseInt(saved, 10) : 4872;
    }
    return 4872;
  });

  // Administrative Panel States
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminSubTab, setAdminSubTab] = useState<"leads" | "complaints">("leads");
  const [adminLeads, setAdminLeads] = useState<any[]>([]);
  const [adminCallbacks, setAdminCallbacks] = useState<any[]>([]);
  const [adminComplaints, setAdminComplaints] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [adminSoundEnabled, setAdminSoundEnabled] = useState(true);

  // New States: internal editing notes, admin search query, and split communication lists
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNoteText, setTempNoteText] = useState<string>("");
  const [adminSearchQuery, setAdminSearchQuery] = useState("");
  const [leadsFilterMode, setLeadsFilterMode] = useState<"pending_all" | "completed_all">("pending_all");
  const [showStatsOnMobile, setShowStatsOnMobile] = useState(false);

  // Advanced administrative filter options
  const [adminFilterDate, setAdminFilterDate] = useState<string>("all");
  const [adminFilterGov, setAdminFilterGov] = useState<string>("all");
  const [adminFilterDept, setAdminFilterDept] = useState<string>("all");
  const [adminFilterAgent, setAdminFilterAgent] = useState<string>("all");

  // Mobile admin panel header collapse state
  const [isAdminHeaderMinimised, setIsAdminHeaderMinimised] = useState(true);

  // Track expanded student cards
  const [expandedStudents, setExpandedStudents] = useState<Record<string, boolean>>({});

  // Toggle student details expansion
  const toggleStudentExpand = (id: string) => {
    setExpandedStudents(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // New States for dynamic sales representative (السيلز) assignment
  const [editingSalesStudentId, setEditingSalesStudentId] = useState<string | null>(null);
  const [tempSalesOption, setTempSalesOption] = useState<string>("");
  const [tempSalesInput, setTempSalesInput] = useState<string>("");

  // Custom alert tones & automatic alerts states
  const [autoAlertsEnabled, setAutoAlertsEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("academy_auto_alerts_enabled_v1");
      return saved !== "false"; // default to true
    }
    return true;
  });

  const [preferredAlertTone, setPreferredAlertTone] = useState<"dynamic" | "registration" | "callback">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("academy_preferred_alert_tone_v1");
      return (saved as any) || "dynamic";
    }
    return "dynamic";
  });

  const [toasts, setToasts] = useState<{ id: string; message: string; type: "lead" | "callback"; time: string }[]>([]);

  // References for new item alerts (to prevent beeping on first load or decrease)
  const prevLeadsCountRef = React.useRef<number | null>(null);
  const prevCallbacksCountRef = React.useRef<number | null>(null);

  // Web Audio API pure synthesizer supporting distinct crisp chime tones
  const playNotificationSound = (forcedTone?: "registration" | "callback") => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const playBeep = (freq: number, type: "sine" | "triangle" | "square" | "sawtooth", startTime: number, duration: number, vol: number) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, startTime);
        gainNode.gain.setValueAtTime(vol, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const toneToPlay = forcedTone || (preferredAlertTone === "dynamic" ? "registration" : preferredAlertTone);

      if (toneToPlay === "registration") {
        // "تنبيه تسجيل جديد" - Premium Rising Double Sine Chime (G5 -> C6)
        playBeep(783.99, "sine", audioCtx.currentTime, 0.18, 0.08);
        playBeep(1046.50, "sine", audioCtx.currentTime + 0.12, 0.28, 0.08);
      } else {
        // "تنبيه طلب اتصال" - Telephone Multi-Beep Accent (Triple alert bleeps in soft square/triangle style for telephone distinction)
        const now = audioCtx.currentTime;
        playBeep(880.00, "triangle", now, 0.08, 0.08);
        playBeep(880.00, "triangle", now + 0.12, 0.08, 0.08);
        playBeep(1174.66, "triangle", now + 0.24, 0.18, 0.08);
      }
    } catch (e) {
      console.warn("Could not play notification chime:", e);
    }
  };
  
  // Callback quick-submit modal states
  const [isCallbackModalOpen, setIsCallbackModalOpen] = useState(false);
  const [cbName, setCbName] = useState("");
  const [cbPhone, setCbPhone] = useState("");
  const [cbSuccess, setCbSuccess] = useState(false);
  const [cbError, setCbError] = useState<string | null>(null);
  const [cbLoading, setCbLoading] = useState(false);
  const [copiedFeedback, setCopiedFeedback] = useState<string | null>(null);

  // Hidden owner secure gateway states
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  const handleVerifyAdminPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pin = adminPinInput.trim().toLowerCase();
    if (pin === "eng2026" || pin === "mamdouh2026" || pin === "engmamdouh2026") {
      setPinError(false);
      setIsPinModalOpen(false);
      setAdminPinInput("");
      fetchAdminData();
      setIsAdminOpen(true);
    } else {
      setPinError(true);
    }
  };

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize simulated student count on load; no active background timers to satisfy real-time-only requests.
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("academy_simulated_count_v1");
      if (!stored) {
        localStorage.setItem("academy_simulated_count_v1", "4872");
      }
    }
  }, []);

  // Fetch registered list, callbacks, and complaints actively every 6 seconds 
  const fetchAdminData = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/admin/data");
      const data = await res.json();
      if (data.success) {
        const nextLeads = data.leads || [];
        const nextCallbacks = data.callbacks || [];
        const nextComplaints = data.complaints || [];

        // Check if list counts increased for callbacks or leads (and was initialized prior)
        const hasNewLead = prevLeadsCountRef.current !== null && nextLeads.length > prevLeadsCountRef.current;
        const hasNewCallback = prevCallbacksCountRef.current !== null && nextCallbacks.length > prevCallbacksCountRef.current;

        if (hasNewLead || hasNewCallback) {
          // Play audio alert if enabled
          if (adminSoundEnabled) {
            const forceTone = preferredAlertTone === "dynamic" 
              ? (hasNewLead ? "registration" : "callback")
              : (preferredAlertTone === "registration" ? "registration" : "callback");
            playNotificationSound(forceTone);
          }

          // Trigger Toast visible alert even if admin is elsewhere, using the state
          if (autoAlertsEnabled) {
            const toastId = Math.random().toString();
            let msg = "";
            if (hasNewLead && hasNewCallback) {
              msg = "🔥 مزامنة حية: تم استقبال تسجيل جديد لطالب وتلقي طلب مكالمة هاتفية!";
            } else if (hasNewLead) {
              const addedLeadName = nextLeads[nextLeads.length - 1]?.name || "طالب جديد";
              msg = `💼 تسجيل جديد: قام الطالب "${addedLeadName}" بتقديم استمارة حجز كاملة الآن.`;
            } else {
              const addedPhone = nextCallbacks[nextCallbacks.length - 1]?.phoneNumber || "جهة اتصال";
              msg = `📞 طلب مكالمة: مطلوب تواصل هاتفي مع الرقم (${addedPhone}) بخصوص القبول.`;
            }

            setToasts(prev => [...prev, { id: toastId, message: msg, type: hasNewLead ? "lead" : "callback", time: new Date().toLocaleTimeString("ar-EG") }]);
            
            // Auto disappear after 6 seconds
            setTimeout(() => {
              setToasts(prev => prev.filter(t => t.id !== toastId));
            }, 6000);
          }
        }

        // Keep counts updated
        prevLeadsCountRef.current = nextLeads.length;
        prevCallbacksCountRef.current = nextCallbacks.length;

        setAdminLeads(nextLeads);
        setAdminCallbacks(nextCallbacks);
        setAdminComplaints(nextComplaints);
        setSyncStatus("تم تحديث البيانات من الخادم فوراً ومزامنة السيلز بنجاح! 🔄");
        setTimeout(() => setSyncStatus(null), 3500);
      }
    } catch (err) {
      console.error("Error retrieving dashboard admin metrics:", err);
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  useEffect(() => {
    fetchAdminData();

    // Subscribe to real-time changes on the "students" table to refresh data instantly without continuous polling
    const channel = supabase
      .channel("student-updates-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "students",
        },
        () => {
          fetchAdminData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSelectDepartmentForBooking = (dept: Department) => {
    setPreselectedDeptsForBooking([dept.id]);
    setActiveTab("booking");
  };

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
      await fetchAdminData(); // update stats immediately
    } catch (err: any) {
      setCbError(err.message || "عذراً فشل إرسال الطلب.");
    } finally {
      setCbLoading(false);
    }
  };

  const handleDeleteItem = async (type: "lead" | "callback" | "complaint", id: string) => {
    if (!window.confirm("هل أنت متأكد تماماً من رغبتك في حذف هذا البند من السجلات نهائياً؟")) return;
    try {
      const res = await fetch("/api/admin/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id }),
      });
      const data = await res.json();
      if (data.success) {
        if (type === "lead") setAdminLeads(data.leads || []);
        if (type === "callback") setAdminCallbacks(data.callbacks || []);
        if (type === "complaint") setAdminComplaints(data.complaints || []);
        setCopiedFeedback("تم الحذف بنجاح!");
        setTimeout(() => setCopiedFeedback(null), 2500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Administrative Agent Popup States
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [agentModalTarget, setAgentModalTarget] = useState<{type: "lead" | "callback", id: string, name?: string} | null>(null);
  const [agentNameInput, setAgentNameInput] = useState("");
  const [agentModalError, setAgentModalError] = useState("");

  const handleToggleStatus = async (type: "lead" | "callback", id: string, currentStatus: string) => {
    if (currentStatus !== "completed") {
      // Bring up state modal to insert representative's name
      const targetItem = type === "lead" 
        ? adminLeads.find(l => l.id === id)
        : adminCallbacks.find(c => c.id === id);
      const name = targetItem?.studentName || "طلب جديد";
      setAgentModalTarget({ type, id, name });
      setAgentNameInput("");
      setAgentModalError("");
      setShowAgentModal(true);
    } else {
      if (type === "lead") {
        // Reverting student registrations status is strictly disabled as per administrative requirements
        return;
      }
      // Revert status back to active waiting list (pending)
      try {
        const res = await fetch("/api/admin/update-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, id, status: "pending", agentName: "" }),
        });
        const data = await res.json();
        if (data.success) {
          setAdminCallbacks(data.callbacks || []);
          setAdminLeads(data.leads || []);
          setCopiedFeedback("تم إرجاع الحالة لقائمة الانتظار ⏳");
          setTimeout(() => setCopiedFeedback(null), 2000);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSetNoReply = async (type: "lead" | "callback", id: string) => {
    try {
      const res = await fetch("/api/admin/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id, status: "no_reply" }),
      });
      const data = await res.json();
      if (data.success) {
        setAdminCallbacks(data.callbacks || []);
        setAdminLeads(data.leads || []);
        setCopiedFeedback("تم تسجيل الحالة: (لم يتم الرد) 📞");
        setTimeout(() => setCopiedFeedback(null), 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopySingleNumber = (phoneNumber: string) => {
    navigator.clipboard.writeText(phoneNumber);
    setCopiedFeedback(`تم نسخ الرقم ${phoneNumber} بنجاح! 📋`);
    setTimeout(() => setCopiedFeedback(null), 2500);
  };

  const handleSaveInternalNote = async (type: "lead" | "callback", id: string) => {
    if (tempNoteText.trim() === "") {
      setCopiedFeedback("الرجاء كتابة تعليق أو ملاحظة أولاً ⚠️");
      setTimeout(() => setCopiedFeedback(null), 2000);
      return;
    }
    try {
      const res = await fetch("/api/admin/update-internal-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id, internalNotes: tempNoteText.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setAdminLeads(data.leads || []);
        setAdminCallbacks(data.callbacks || []);
        setEditingNoteId(null);
        setTempNoteText("");
        setCopiedFeedback("✓ تم تسجيل التعليق الداخلي لفريق المبيعات بنجاح!");
        setTimeout(() => setCopiedFeedback(null), 2000);
      }
    } catch (err) {
      console.error("Error updating internal note:", err);
    }
  };

  const handleSaveSalesAssignment = async (id: string, salesName: string) => {
    try {
      const finalSalesName = salesName.trim();
      // If a sales agent is specified, mark as contacted ("completed"). Otherwise, mark as pending.
      const newStatus = finalSalesName ? "completed" : "pending";
      
      setIsSyncing(true);
      const res = await fetch("/api/admin/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "lead",
          id,
          status: newStatus,
          agentName: finalSalesName
        })
      });
      const data = await res.json();
      if (data.success) {
        setAdminLeads(data.leads || []);
        setAdminCallbacks(data.callbacks || []);
        setEditingSalesStudentId(null);
        setTempSalesOption("");
        setTempSalesInput("");
        setCopiedFeedback(
          finalSalesName 
            ? `✓ تم تسجيل كود السيلز "${finalSalesName}" بنجاح وترحيل الطالب إلى قائمة تم التواصل!` 
            : "✓ تم إخلاء سكرتارية المتابعة وإرجاع الطالب إلى قائمة الانتظار (مؤقتة اليقظة)!"
        );
        setTimeout(() => setCopiedFeedback(null), 3000);
      }
    } catch (err) {
      console.error("Error updating sales representative:", err);
      setCopiedFeedback("❌ حدث خطأ أثناء التحديث.");
      setTimeout(() => setCopiedFeedback(null), 2500);
    } finally {
      setIsSyncing(false);
    }
  };

  const getWhatsAppLink = (phone: string, name?: string) => {
    const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, "");
    let targetPhone = cleanPhone;
    if (cleanPhone.startsWith("0")) {
      targetPhone = "2" + cleanPhone;
    } else if (!cleanPhone.startsWith("2") && cleanPhone.length === 11) {
      targetPhone = "2" + cleanPhone;
    }
    const message = encodeURIComponent(`السلام عليكم يا أستاذ ${name || "الطالب المتفضل"}، مع حضرتك مستشار القبول والتسجيل من مكتب ايه ام جروب للتسويق التابع لموقع المعاهد والاكاديميات الخاصة بخصوص استمارة الحجز الأكاديمي التي قمتم بملئها على موقعنا الإلكتروني.`);
    return `https://wa.me/${targetPhone}?text=${message}`;
  };

  const handleCopyAllPhoneNumbers = (type: "leads" | "callbacks") => {
    let list = [];
    if (type === "leads") {
      // نسخ أرقام الطلاب الذين "لم يتم التواصل معهم بالفعل"
      list = adminLeads.filter(item => item.status !== "completed");
    } else {
      list = adminCallbacks;
    }

    const phoneNumbers = list.map(item => item.phoneNumber).join(", ");
    if (!phoneNumbers) {
      setCopiedFeedback(type === "leads" ? "لا توجد أرقام لمتقدمين لم يتم الاتصال بهم حالياً." : "لا توجد أرقام متاحة لنسخها حالياً.");
      setTimeout(() => setCopiedFeedback(null), 3000);
      return;
    }
    navigator.clipboard.writeText(phoneNumbers);
    setCopiedFeedback(type === "leads" ? "تم نسخ أرقام المتقدمين غير المتصل بهم بنجاح! 📋" : "تم نسخ أرقام طلب المعاودة!");
    setTimeout(() => setCopiedFeedback(null), 3000);
  };

  const formatEgyptianTime = (date: Date) => {
    return date.toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" dir="rtl">
      {/* 1. Global Announcement Ticker */}
      <div className="bg-brand-navy text-white text-xs py-2 px-4 border-b border-white/5 relative z-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-brand-coral text-white font-extrabold text-[10px] px-2 py-0.5 rounded-sm animate-pulse uppercase tracking-wide">
              خصومات حصرية محدودة🔥
            </span>
            <p className="font-medium text-slate-100 text-center sm:text-right">
              فرص الحجز للعام الدراسي والخصومات الحالية مفعلة مؤقتاً للطلاب وأولياء الأمور للتقديم المبكر
            </p>
          </div>
          
          {/* Dynamic Cairo/GMT clock widget & live counter in the ticker bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[11px] font-sans text-slate-300">
            <span className="flex items-center gap-1.5 bg-[#102a6b] px-2.5 py-1 rounded-md text-amber-350 font-extrabold border border-amber-500/25 shrink-0 transition shadow-xs">
              <Users className="w-3.5 h-3.5 text-brand-gold shrink-0" />
              <span>التقديمات الجارية لحظياً:</span>
              <span className="font-mono text-white font-extrabold text-[12.5px] tracking-tight">
                {simulatedStudentsCount.toLocaleString("ar-EG")}
              </span>
              <span className="text-[9px] bg-emerald-600 text-white rounded px-1.5 font-bold animate-pulse inline-block leading-normal">لايف</span>
            </span>
            <span className="text-slate-650 hidden sm:inline">|</span>
            <span className="flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5 text-brand-gold shrink-0" />
              <span>بتوقيت القاهرة:</span>
              <span className="text-white font-bold">{formatEgyptianTime(time)}</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Brand Hero Header */}
      <header className="bg-white border-b border-slate-200 py-6 px-4 md:px-8 shadow-xs sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Custom Designed Logo & Corporate Title */}
          <div className="flex items-center gap-4 text-right">
            {/* Double click or click 3 times to trigger the hidden master password gate */}
            <div 
              onClick={() => {
                const globalWin = (window as any);
                globalWin.logoClicks = (globalWin.logoClicks || 0) + 1;
                if (globalWin.logoClicks >= 3) {
                  globalWin.logoClicks = 0;
                  setAdminPinInput("");
                  setPinError(false);
                  setIsPinModalOpen(true);
                }
              }}
              onDoubleClick={() => {
                setAdminPinInput("");
                setPinError(false);
                setIsPinModalOpen(true);
              }}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md shrink-0 border-2 border-amber-500 p-0.5 relative cursor-pointer hover:scale-105 active:scale-95 transition-all group"
              title="بوابة المعاهد والأكاديميات الخاصة (انقر مرتين للتحقق)"
              id="brand-circular-emblem"
            >
              <div className="w-full h-full rounded-full border border-amber-400 p-0.5 flex flex-col items-center justify-center relative bg-gradient-to-br from-amber-50 via-white to-amber-100 overflow-hidden">
                <svg viewBox="0 0 100 100" className="w-full h-full select-none">
                  {/* Curved path for English text at the top */}
                  <path id="curveTop" d="M 12 50 A 38 38 0 1 1 88 50" fill="none" />
                  <text className="font-extrabold text-[5.5px]" fill="#0A2463" letterSpacing="0.2px">
                    <textPath href="#curveTop" startOffset="50%" textAnchor="middle">
                      institutes and special academies
                    </textPath>
                  </text>

                  {/* Curved path for English text at the bottom */}
                  <path id="curveBottom" d="M 88 50 A 38 38 0 0 1 12 50" fill="none" />
                  <text className="font-extrabold text-[5.5px]" fill="#b45309" letterSpacing="0.2px">
                    <textPath href="#curveBottom" startOffset="50%" textAnchor="middle">
                      institutes and special academies
                    </textPath>
                  </text>

                  {/* Open Book graphic in center */}
                  <g transform="translate(30, 24) scale(0.40)">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="#0A2463" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                    <path d="M6 2v15c0 .5-.5 1-1 1s1 .5 1 1h14V2H6z" fill="#ffffff" stroke="#0A2463" strokeWidth="2.5" strokeLinejoin="round" />
                    <line x1="9" y1="6" x2="17" y2="6" stroke="#b45309" strokeWidth="2" strokeLinecap="round" />
                    <line x1="9" y1="10" x2="17" y2="10" stroke="#0A2463" strokeWidth="2" strokeLinecap="round" />
                    <line x1="9" y1="14" x2="15" y2="14" stroke="#0A2463" strokeWidth="2" strokeLinecap="round" />
                  </g>

                  {/* Arabic text styled in center below the book */}
                  <text x="50" y="70" className="fill-brand-navy font-sans font-extrabold text-[8px]" textAnchor="middle">
                    المعاهد والأكاديميات
                  </text>
                  <text x="50" y="81" className="fill-brand-coral font-sans font-extrabold text-[8.5px]" textAnchor="middle">
                    الخاصة
                  </text>
                </svg>

                {/* Secret lock clue overlay */}
                <div className="absolute inset-0 bg-amber-500/10 opacity-0 group-hover:opacity-100 transition rounded-full flex items-center justify-center">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <h1 className="font-extrabold text-xl md:text-2xl text-brand-navy tracking-tight font-sans">
                بوابة المعاهد والأكاديميات الخاصة
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                المنصة التفاعلية المتكاملة لتوجيه ومساعدة الطلاب على فهم تخصصاتهم وحفظ مقاعد القبول والتأجيل بنزاهة
              </p>
            </div>
          </div>

          {/* Quick Contact CTA & Secret Admin Gate */}
          <div className="flex flex-wrap items-center gap-3">

            {/* 2. Request a call from advisor option */}
            <button
              onClick={() => {
                setCbSuccess(false);
                setCbError(null);
                setIsCallbackModalOpen(true);
              }}
              className="bg-brand-coral text-white hover:bg-brand-coral/95 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              style={{ minHeight: "44px" }}
              id="request-callback-trigger"
            >
              <PhoneCall className="w-4 h-4" />
              <span>اطلب اتصالاً من مستشار التسجيل 📞</span>
            </button>
          </div>

        </div>
      </header>

      {/* 3. Metrics Overview - Proving Strengths of the Academy */}
      <section className="bg-gradient-to-b from-white to-slate-50 border-b border-slate-200 py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4 hover:border-brand-navy/30 transition shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-brand-navy/5 text-brand-navy flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-bold">التخصصات المعتمدة</span>
              <strong className="text-xl font-extrabold text-slate-900 font-sans">
                {ACADEMY_DEPARTMENTS.length} قسماً وتخصصاً (سبعة عشر)
              </strong>
              <p className="text-[10px] text-slate-500">مغطي ببيانات تفصيلية حية بالمرجع</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4 hover:border-brand-navy/30 transition shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-brand-turquoise/10 text-brand-navy flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-bold">النزاهة والصدق الإعلاني</span>
              <strong className="text-md font-extrabold text-slate-900 block">بدون وعود وهمية 100%</strong>
              <p className="text-[10px] text-emerald-600 font-semibold">ترشيح ذكي ضد التوظيف الفوري ومبالغات الوظائف</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4 hover:border-brand-navy/30 transition shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-brand-gold/10 text-brand-gold flex items-center justify-center shrink-0">
              <Ticket className="w-6 h-6 text-brand-coral" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-bold">خصومات المصروفات</span>
              <strong className="text-sm font-extrabold text-slate-950 block">حفظ الخصم فورا بالتذكرة</strong>
              <p className="text-[10px] text-slate-500">حجز مقعد وتثبيت عروض العام الحالي</p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4 hover:border-brand-navy/30 transition shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-slate-50 text-brand-navy flex items-center justify-center shrink-0 border border-slate-100">
              <Award className="w-6 h-6 text-brand-gold" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-bold">الاعتمادات والتجنيد</span>
              <strong className="text-sm font-extrabold text-slate-900 block">شهادات مهنية تدريبية</strong>
              <p className="text-[10px] text-brand-coral font-bold flex items-center gap-1">
                <span>تأجيل تجنيد متاح برسوم</span>
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Navigation Tab Switchers */}
      <section className="bg-slate-100 border-b border-slate-200 py-3.5 px-4 md:px-8 sticky top-[89px] md:top-[103px] z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Mobile Dropdown Index & Lists Menu */}
          <div className="md:hidden w-full flex flex-col gap-2" id="mobile-quick-navigation">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-brand-coral animate-spin-slow" />
                <span>فهرس الانتقال السريع للأقسام والخدمات:</span>
              </span>
              <span className="bg-brand-navy text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                تصفح ذكي 📱
              </span>
            </div>
            
            <div className="relative">
              <select
                value={activeTab}
                onChange={(e) => {
                  setActiveTab(e.target.value as any);
                }}
                className="w-full bg-slate-900 text-amber-400 border-2 border-slate-800 rounded-xl py-3 px-3 pl-8 text-xs font-extrabold focus:outline-none focus:ring-2 focus:ring-brand-coral cursor-pointer text-right appearance-none"
              >
                <option value="depts" className="bg-slate-950 text-white font-bold">📚 ١. دليل التخصصات والأقسام الدراسية ({ACADEMY_DEPARTMENTS.length} أقسام)</option>
                <option value="popular" className="bg-slate-950 text-white font-bold">🔥 ٢. التخصصات الأكثر طلباً واهتماماً من الطلاب</option>
                <option value="quiz" className="bg-slate-950 text-white font-bold">🧭 ٣. مستشار التوجيه وتقييم مستوى الطالب</option>
                <option value="certificates" className="bg-slate-950 text-white font-bold">🎓 ٤. الشهادات المعتمدة وملف تأجيل التجنيد</option>
                <option value="booking" className="bg-slate-950 text-white font-bold">🎟️ ٥. حجز وعروض خصم المصروفات المتاحة</option>
                <option value="complaints" className="bg-slate-950 text-white font-bold">📢 ٦. الشكاوى والمقترحات وسرية البيانات</option>
              </select>
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-amber-400">
                <ChevronLeft className="w-4 h-4 transform -rotate-90" />
              </div>
            </div>

            {/* Quick click pill selection for mobile */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 mt-1 scrollbar-hide">
              <button
                onClick={() => setActiveTab("depts")}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition shrink-0 ${activeTab === 'depts' ? 'bg-brand-navy text-white' : 'bg-white text-slate-700 border border-slate-200'}`}
              >
                📚 التخصصات ({ACADEMY_DEPARTMENTS.length})
              </button>
              <button
                onClick={() => setActiveTab("popular")}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition shrink-0 ${activeTab === 'popular' ? 'bg-brand-navy text-white' : 'bg-white text-slate-700 border border-slate-200'}`}
              >
                🔥 الأكثر طلباً
              </button>
              <button
                onClick={() => setActiveTab("quiz")}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition shrink-0 ${activeTab === 'quiz' ? 'bg-brand-navy text-white' : 'bg-white text-slate-700 border border-slate-200'}`}
              >
                🧭 مستشار التوجيه
              </button>
              <button
                onClick={() => setActiveTab("certificates")}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition shrink-0 ${activeTab === 'certificates' ? 'bg-brand-navy text-white' : 'bg-white text-slate-700 border border-slate-200'}`}
              >
                🎓 التجنيد والشهادات
              </button>
              <button
                onClick={() => setActiveTab("booking")}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition shrink-0 ${activeTab === 'booking' ? 'bg-brand-navy text-white' : 'bg-white text-slate-700 border border-slate-200'}`}
              >
                🎟️ حجز خصم مقعد
              </button>
              <button
                onClick={() => setActiveTab("complaints")}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition shrink-0 ${activeTab === 'complaints' ? 'bg-brand-navy text-white' : 'bg-white text-slate-700 border border-slate-200'}`}
              >
                📢 تقديم شكوى/مقترح
              </button>
            </div>
          </div>

          {/* Desktop/Tablet Tab Row */}
          <div className="hidden md:flex flex-wrap gap-2 justify-center md:justify-start w-full" id="main-navigation-tabs">
            
            <button
              onClick={() => setActiveTab("depts")}
              className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === "depts"
                  ? "bg-brand-navy text-white shadow-xs"
                  : "bg-white text-slate-700 hover:bg-slate-50"
              }`}
              style={{ minHeight: "44px" }}
              id="tab-btn-depts"
            >
              <BookOpen className="w-4 h-4" />
              <span>تصفح الأقسام والتخصصات ({ACADEMY_DEPARTMENTS.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("popular")}
              className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition flex items-center gap-2 cursor-pointer relative ${
                activeTab === "popular"
                  ? "bg-brand-navy text-white shadow-xs"
                  : "bg-white text-slate-700 hover:bg-slate-50"
              }`}
              style={{ minHeight: "44px" }}
              id="tab-btn-popular"
            >
              <TrendingUp className="w-4 h-4 text-orange-500 animate-pulse" />
              <span>التخصصات الأكثر طلباً 🔥</span>
              <span className="absolute -top-1 -left-1 bg-emerald-600 text-white text-[9px] rounded-full px-1.5 py-0.5 font-bold scale-90 border border-white animate-pulse">
                لايف
              </span>
            </button>

            <button
              onClick={() => setActiveTab("quiz")}
              className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === "quiz"
                  ? "bg-brand-navy text-white shadow-xs"
                  : "bg-white text-slate-700 hover:bg-slate-50"
              }`}
              style={{ minHeight: "44px" }}
              id="tab-btn-quiz"
            >
              <Compass className="w-4 h-4 text-brand-coral" />
              <span>مستشار التوجيه وتقييم الطالب</span>
            </button>

            <button
              onClick={() => setActiveTab("certificates")}
              className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === "certificates"
                  ? "bg-brand-navy text-white shadow-xs"
                  : "bg-white text-slate-700 hover:bg-slate-50"
              }`}
              style={{ minHeight: "44px" }}
              id="tab-btn-certificates"
            >
              <Award className="w-4 h-4 text-brand-gold animate-bounce" />
              <span>الشهادات والاعتمادات والتجنيد</span>
            </button>

            <button
              onClick={() => setActiveTab("booking")}
              className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition flex items-center gap-2 cursor-pointer relative ${
                activeTab === "booking"
                  ? "bg-brand-navy text-white shadow-xs"
                  : "bg-white text-slate-700 hover:bg-slate-50"
              }`}
              style={{ minHeight: "44px" }}
              id="tab-btn-booking"
            >
              <Ticket className="w-4 h-4" />
              <span>حفظ خصم وحجز مقعد بالدفعة</span>
              <span className="absolute -top-1 -left-1 bg-brand-coral text-white text-[9px] rounded-full px-1.5 py-0.5 font-bold scale-90 border border-white">
                عروض
              </span>
            </button>

            <button
              onClick={() => setActiveTab("complaints")}
              className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition flex items-center gap-2 cursor-pointer relative ${
                activeTab === "complaints"
                  ? "bg-brand-navy text-white shadow-xs"
                  : "bg-white text-slate-700 hover:bg-slate-50"
              }`}
              style={{ minHeight: "44px" }}
              id="tab-btn-complaints"
            >
              <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
              <span>الشكاوى والمقترحات</span>
            </button>

          </div>

        </div>
      </section>

      {/* 5. Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 my-1">
        
        {/* Left/Middle Column (Dynamic active view) */}
        <div className="lg:col-span-8 space-y-6">
          
          {activeTab === "depts" && (
            <div className="space-y-6 animate-fade-in font-sans">
              <div className="p-4 bg-white rounded-2xl border border-slate-200">
                <h2 className="text-xl font-extrabold text-slate-900 font-sans mb-1">
                  الدليل المعتمد للأقسام والتخصصات المهنية
                </h2>
                <p className="text-xs text-slate-500">
                  انقر على أي عارضة لقراءة مهارات التخصص وفرص العمل بالتفصيل، ثم يمكنك بدء عملية التقديم وحفظ مقعدك بضغطة زر.
                </p>
              </div>

              <DepartmentExplorer 
                onSelectDepartment={(dept) => {
                  handleSelectDepartmentForBooking(dept);
                }} 
              />

              {/* Student Testimonials and Ratings section */}
              <StudentReviews />
            </div>
          )}

          {activeTab === "popular" && (
            <div className="space-y-6 animate-fade-in font-sans">
              <div className="p-5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl border border-amber-500/10 text-right">
                <div className="flex items-center gap-2 mb-2 justify-end">
                  <span className="text-xs bg-amber-500 text-white font-black px-2.5 py-0.5 rounded-full animate-pulse">
                    مزامنة حية ⏳
                  </span>
                  <h2 className="text-lg font-black text-slate-900 font-sans">
                    الأكثر تقديماً واهتماماً من الطلاب 🔥
                  </h2>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  يتم رصد هذه الإحصائيات مباشرة بالاعتماد على إجمالي استمارات الطلاب الجدد بقاعدة البيانات وحركة الاستعلام الفوري بطلب الاتصال لضمان ترتيب الأقسام طبقاً للشغف الحالي للطلاب.
                </p>
              </div>

              <PopularDepartments 
                adminLeads={adminLeads}
                simulatedStudentsCount={simulatedStudentsCount}
                onSelectDepartmentForBooking={(deptId) => {
                  const targetDept = ACADEMY_DEPARTMENTS.find(d => d.id === deptId);
                  if (targetDept) {
                    handleSelectDepartmentForBooking(targetDept);
                  }
                }}
              />
            </div>
          )}

          {activeTab === "quiz" && (
            <div className="space-y-4 animate-fade-in" id="quiz-view">
              <CareerQuiz 
                onSelectDepartment={(dept) => {
                  handleSelectDepartmentForBooking(dept);
                }} 
              />
            </div>
          )}

          {activeTab === "certificates" && (
            <div className="space-y-4 animate-fade-in" id="certificates-view">
              <StudentCertificates onNavigateToBooking={() => {
                setActiveTab("booking");
                setTimeout(() => {
                  const el = document.getElementById("booking-form-wrapper");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }} />
            </div>
          )}

          {activeTab === "booking" && (
            <div className="space-y-4 animate-fade-in" id="booking-view">
              <StudentBookingForm preselectedDepts={preselectedDeptsForBooking} />
            </div>
          )}

          {activeTab === "complaints" && (
            <div className="space-y-4 animate-fade-in" id="complaints-view">
              <ComplaintsForm />
            </div>
          )}

        </div>

        {/* Right Sidebar - Sticky Widget Column */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quick Info & Ethics Policy widget */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4" id="sidebar-policy-widget">
            <h3 className="font-extrabold text-md text-brand-navy border-b border-slate-100 pb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>ميثاق النزاهة والحياد الأكاديمي</span>
            </h3>
            
            <p className="text-xs text-slate-600 leading-relaxed font-semibold">
              تلتزم المعاهد والاكاديميات بالوقوف كشريك تعليمي حقيقي للطالب دون إثقال كاهله بوعود تعيين فوري أو نسب توظيف خيالية. محتوى الأقسام يخضع دورياً للتحديث ليتلاءم حرفياً مع المهارات المطلوبة في سوق العمل:
            </p>

            <ul className="space-y-2.5">
              {[
                "تقييم دقيق للمؤهل المدرسي (عام، أزهري، دبلومات)",
                "مساواة كاملة في الدعم العملي لجميع فئات الطلاب المتقدمين",
                "نشرك الطلاب وأولياء أمورهم في صياغة الأهداف المهنية والواقعية"
              ].map((policy, idx) => (
                <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{policy}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Department Shortcut List */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4" id="sidebar-shortcuts-widget">
            <h3 className="font-extrabold text-md text-brand-navy border-b border-slate-100 pb-3">
              البدء السريع بحجز تخصصك
            </h3>
            
            <div className="grid grid-cols-1 gap-2">
              {ACADEMY_DEPARTMENTS.slice(0, 8).map((dept) => (
                <button
                  key={dept.id}
                  onClick={() => {
                    handleSelectDepartmentForBooking(dept);
                  }}
                  className="w-full text-right p-2.5 hover:bg-slate-50 text-xs font-semibold text-slate-700 rounded-lg transition border border-slate-100 hover:border-slate-300 flex items-center justify-between cursor-pointer"
                  id={`shortcut-btn-${dept.id}`}
                >
                  <span>{dept.name}</span>
                  <ChevronLeft className="w-4 h-4 text-slate-400" />
                </button>
              ))}
            </div>

            <p className="text-[10px] text-slate-400 text-center">
              انقر على أي قسم للبدء الفوري بالتسجيل وتثبيت خصومات دفعة العام الجديد
            </p>
          </div>

          {/* Affiliation and Enlistment Quick Notice */}
          <div className="bg-red-50 rounded-2xl p-6 border border-red-200 space-y-3" id="sidebar-affiliation-notice">
            <div className="flex items-center gap-2 text-red-800">
              <ShieldAlert className="w-5 h-5 text-red-650 shrink-0" />
              <h4 className="font-extrabold text-sm font-sans">إقرار عدم التبعية والتجنيد</h4>
            </div>
            <div className="text-xs text-slate-700 leading-relaxed text-right space-y-2">
              <p>
                • <strong>توضيح هام جداً:</strong> المعاهد والأكاديميات المهنية هنا غير خاضعة للتعليم العالي المصري ولا المجلس الأعلى للجامعات.
              </p>
              <p>
                • <strong>تأجيل التجنيد:</strong> يتوفر تأجيل الموقف التجنيدي للطلاب الذكور الراغبين طوال دراستهم بفرض رسوم إدارية إضافية لإنجاز المستندات.
              </p>
            </div>
          </div>

          {/* Alert panel for visual quality */}
          <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200 space-y-3" id="sidebar-warning-widget">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <h4 className="font-extrabold text-sm">بيان المصروفات والرسوم الدراسية</h4>
            </div>
            <p className="text-xs text-amber-700 leading-relaxed text-right">
              يرجى العلم بأنه لم يتم حصر قيمة الرسوم أو نسب الخصم المئوية المحددة مالياً في هذا المرجع لضمان عدم حدوث مغالطات مع دفعة العام الجديد. احجز تذكرتك بالتطبيق وسيتم التواصل معك لشرح الميزانية المالية المناسبة لقسمك المختار.
            </p>
          </div>

        </div>

      </main>

      {/* 6. Footer Section */}
      <footer className="bg-brand-navy text-white py-12 px-4 md:px-8 mt-12 border-t-4 border-brand-gold">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-brand-gold" />
              <strong className="text-lg font-bold font-sans">المعاهد والأكاديميات الخاصة</strong>
            </div>
            <p className="text-xs text-amber-400 font-bold leading-normal">
              أكثر من 10 سنوات من الخبرة في تسويق المعاهد والأكاديميات الخاصة ⭐
            </p>
            <p className="text-[11px] text-slate-350 leading-relaxed font-sans">
              جهة مساعدة لتقديم الاستشارات التعليمية، ونتعامل مع عدد من الأكاديميين والمعاهد الخاصة المعتمدة، وبن مساعدة الطالب في اختيار الأنسب له ومتابعة إجراءات التقديم.
            </p>
          </div>

          <div className="space-y-3">
            <strong className="text-sm font-bold block border-b border-white/10 pb-2">التزام المصداقية فقط</strong>
            <p className="text-xs text-slate-300 leading-relaxed">
              جميع المحتويات المتوفرة هنا مستقاة بدقة متناهية من المرجع الشامل لضمان موثوقية الأكاديمية وحفظ حقوق الطالب في فهم البيئة والفرص الفعلية دون وعود تعيين مضللة.
            </p>
          </div>

          <div className="space-y-3">
            <strong className="text-sm font-bold block border-b border-white/10 pb-2">الدعم الفني للطلاب الجدد</strong>
            <p className="text-xs text-slate-300 leading-relaxed">
              بوابة إدارية رقمية لتذليل صعوبات التقديم. يمكنك إدارة تذكرة الحجز وإظهارها لمندوب القبول بالجامعة لتثبيت عرضك الأكاديمي الحصري فور تواصلنا الهاتفي.
            </p>
          </div>

          <div className="space-y-4">
            <strong className="text-sm font-bold block border-b border-white/10 pb-2">قنوات التواصل الرسمية 📱</strong>
            <div className="space-y-3 font-sans text-right">
              
              {/* Facebook Button Link */}
              <a 
                href="https://www.facebook.com/Privateinstitutesandacademies1/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition shadow-sm w-fit mr-auto md:mr-0 md:ml-auto"
              >
                <Facebook className="w-4 h-4 fill-white" />
                <span>صفحة الفيسبوك الرسمية</span>
              </a>

              {/* Email Link */}
              <a 
                href="mailto:almahdwalakadymyatalkhash@gmail.com"
                className="flex items-center gap-2.5 p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl text-xs font-semibold transition border border-slate-700 w-fit mr-auto md:mr-0 md:ml-auto"
              >
                <Mail className="w-4 h-4 text-brand-gold" />
                <span className="font-mono text-[10px] break-all">almahdwalakadymyatalkhash@gmail.com</span>
              </a>

            </div>
          </div>

        </div>

        {/* Trust and Safety Badges (علامات الثقة والأمان) */}
        <div className="max-w-7xl mx-auto border-t border-white/10 mt-8 pt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-right">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-start gap-3.5 transition hover:bg-white/10">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="space-y-1">
              <strong className="text-xs font-bold text-white block">علامة أمان وخصوصية البيانات 🔒</strong>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                تشفير كامل لجميع طلبات الحجز المبدئية لحماية خصوصية بياناتك ومعلومات التواصل الخاصة بك بشكل مستقل.
              </p>
            </div>
          </div>

          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-start gap-3.5 transition hover:bg-white/10">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 text-amber-400" />
            </div>
            <div className="space-y-1">
              <strong className="text-xs font-bold text-white block">معايير الدقة والنزاهة الأكاديمية ⭐</strong>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                بوابة مستقلة تعمل بنزاهة تامة لمساعدتك في الحصول على استشارات وحجوزات مطابقة للأكاديميات الخاصة المعتمدة.
              </p>
            </div>
          </div>

          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-start gap-3.5 transition hover:bg-white/10">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-5 h-5 text-sky-400" />
            </div>
            <div className="space-y-1">
              <strong className="text-xs font-bold text-white block">ضمان الموثوقية والدعم للطلبة 🤝</strong>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                متابعة تامة لإجراءات حجز وتوجيه الطلاب الجدد، وتسهيل التدريب الميداني المعتمد والقبول المضمون.
              </p>
            </div>
          </div>
        </div>

        {/* Egyptian Flag and Vision 2030 Section */}
        <div className="max-w-7xl mx-auto border-t border-white/10 mt-6 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 bg-white/5 px-4 py-2.5 rounded-2xl border border-white/5 shadow-xs">
            {/* Beautiful Custom CSS-Flag for Egypt */}
            <div className="flex flex-col w-7 h-4.5 border border-white/25 overflow-hidden rounded-xs shrink-0 shadow-sm">
              <div className="bg-[#FF0000] h-1/3"></div>
              <div className="bg-white h-1/3 relative flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
              </div>
              <div className="bg-[#000000] h-1/3"></div>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-extrabold text-slate-100 block leading-tight">جمهورية مصر العربية</span>
              <span className="text-[9px] text-slate-400 block font-sans">تحت مظلة رعاية وتمكين الكفاءات الوطنية الشابة</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-right bg-white/5 px-4 py-2.5 rounded-2xl border-r-4 border-amber-500 max-w-lg">
            <div>
              <span className="text-[11px] font-extrabold text-amber-500 block">رؤية مصر ٢٠٣٠ 🇪🇬✨</span>
              <p className="text-[10px] text-slate-300 leading-relaxed font-sans">
                ندعم بقوة جهود الدولة المصرية ورؤية مصر الاستراتيجية المستدامة ٢٠٣٠ في تمكين وتوجيه الكوادر وبناء مهارات أجيال الغد بالجمهورية الجديدة.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-white/5 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-1.5">
            <span>&copy; {new Date().getFullYear()} جميع الحقوق محفوظة لبوابة المعاهد والأكاديميات بموجب المرجع الأساسي.</span>
            <button
              onClick={() => {
                setAdminPinInput("");
                setPinError(false);
                setIsPinModalOpen(true);
              }}
              className="opacity-15 hover:opacity-100 text-slate-400 hover:text-brand-gold transition duration-200 cursor-pointer p-0.5 inline-flex items-center"
              title="لوحة الإشراف والمشرفين (تحتاج الرمز السري)"
            >
              <Lock className="w-3 h-3" />
            </button>
          </div>
          <span>بوابة إرشادية وتوجيهية مستقلة تخدم تخصصات التدريب والمهارات المهنية</span>
        </div>
      </footer>

      {/* ==================== SECRET ADMINISTRATOR PIN GATE MODAL ==================== */}
      {isPinModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[120] flex items-center justify-center p-4 animate-fade-in" dir="rtl">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-right animate-scale-up">
            
            <div className="bg-slate-900 p-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-500 animate-pulse" />
                <h4 className="font-extrabold text-sm text-white">التحقق من هوية صاحب المنصة 👤🔑</h4>
              </div>
              <button
                onClick={() => setIsPinModalOpen(false)}
                className="text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <form onSubmit={handleVerifyAdminPinSubmit} className="space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  هذه البوابة مشفرة ومخفية بالكامل لحمايتها من المتطفلين والطلاب الجدد. أدخل رمز الحماية السري لتصفح قاعدة بيانات المسجلين الحية:
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">أدخل رمز الحماية السري لتأكيد الصلاحية:</label>
                  <input
                    type="password"
                    required
                    value={adminPinInput}
                    onChange={(e) => {
                      setAdminPinInput(e.target.value);
                      if (pinError) setPinError(false);
                    }}
                    placeholder="••••"
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-navy/15 focus:outline-none focus:border-slate-900 text-center font-bold tracking-widest text-lg text-slate-800"
                    autoFocus
                  />
                </div>

                {pinError && (
                  <p className="text-xs text-red-650 font-bold bg-red-50 p-2.5 rounded-lg border border-red-200 flex items-center gap-1.5 animate-bounce">
                    <span>⚠️ رمز التحقق غير صحيح، حاول مرة أخرى!</span>
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-slate-950" />
                  <span>تأكيد الرمز وفتح لوحة الإدارة 🔓</span>
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* ==================== 1. OWNER / ADMINISTRATIVE AGENT NAME MODAL ==================== */}
      {showAgentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[110] flex items-center justify-center p-4 animate-fade-in" dir="rtl">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col animate-scale-up text-right">
            
            <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-400" />
                <h4 className="font-extrabold text-sm">تسجيل كود خدمة العملاء المسؤول 🧑‍💻</h4>
              </div>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!agentNameInput.trim()) {
                setAgentModalError("الرجاء كتابة اسم الموظف/كود المتابعة.");
                return;
              }
              try {
                const res = await fetch("/api/admin/update-status", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    type: agentModalTarget?.type,
                    id: agentModalTarget?.id,
                    status: "completed",
                    agentName: agentNameInput.trim()
                  }),
                });
                const data = await res.json();
                if (data.success) {
                  setAdminCallbacks(data.callbacks || []);
                  setAdminLeads(data.leads || []);
                  setShowAgentModal(false);
                  setAgentModalTarget(null);
                  setAgentNameInput("");
                  setCopiedFeedback("✓ تم تسجيل تأكيد الاتصال وتعيين كود المسؤول بنجاح!");
                  setTimeout(() => setCopiedFeedback(null), 2500);
                } else {
                  setAgentModalError(data.error || "فشل التحديث.");
                }
              } catch (err: any) {
                setAgentModalError(err.message || "حدث خطأ غير متوقع.");
              }
            }} className="p-5 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                يقوم وكيل خدمة العملاء أو المبيعات بإدخال اسمه أو كوده التعريفي لتأكيد التواصل وحفظ المسؤول عن الطالب <strong className="text-slate-800">({agentModalTarget?.name})</strong> في السجلات:
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم/كود مستشار المبيعات المسؤول:</label>
                <input
                  type="text"
                  required
                  value={agentNameInput}
                  onChange={(e) => setAgentNameInput(e.target.value)}
                  placeholder="مثال: م. أحمد ممدوح"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:outline-none focus:border-slate-800 text-xs font-semibold text-slate-800"
                />
                {agentModalError && <p className="text-[10px] text-red-500 font-bold mt-1">⚠️ {agentModalError}</p>}
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition cursor-pointer text-center flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>تأكيد المكالمة والتعميد ✓</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAgentModal(false);
                    setAgentModalTarget(null);
                    setAgentNameInput("");
                    setAgentModalError("");
                  }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl text-xs font-bold transition cursor-pointer text-center"
                >
                  إلغاء الأمر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAdminOpen && (
        <div className="fixed inset-0 bg-slate-900/85 backdrop-blur-md z-[100] flex items-center justify-center p-2 sm:p-4 animate-fade-in" dir="rtl">
          <div className="bg-white w-full max-w-6xl rounded-2xl md:rounded-3xl shadow-2xl border border-slate-200 flex flex-col h-[95vh] md:h-[92vh] max-h-[95vh] md:max-h-[92vh] overflow-hidden animate-scale-up" id="admin-panel-container">
            
            {/* Top Navigation Bar of the Dashboard */}
            <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-4 md:px-6 py-4 md:py-5 flex items-center justify-between shrink-0 text-right">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4 md:w-5 md:h-5 text-amber-200" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm md:text-xl font-sans text-white leading-tight">
                    لوحة تحكم صاحب التطبيق والمشرفين 👤
                  </h3>
                  <p className="text-[10px] md:text-xs text-amber-100 font-medium font-sans">
                    متابعة الطلاب المسجلين وحالة تواصل خدمة العملاء لحظياً (تحديث تلقائي)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Sound Notification Toggle Button */}
                <button
                  onClick={() => {
                    const newState = !adminSoundEnabled;
                    setAdminSoundEnabled(newState);
                    if (newState) {
                      setTimeout(() => {
                        playNotificationSound();
                      }, 100);
                    }
                  }}
                  className={`p-1.5 md:p-2 rounded-lg transition flex items-center gap-1.5 text-xs font-semibold ${
                    adminSoundEnabled 
                      ? "bg-amber-800/80 text-white border border-amber-500 hover:bg-amber-900" 
                      : "bg-slate-800/60 hover:bg-slate-800 text-slate-200 border border-slate-600"
                  }`}
                  title={adminSoundEnabled ? "تنبيهات الصوت المباشرة مفعلة - اضغط للتعطيل" : "تنبيهات الصوت المباشرة معطلة - اضغط للتفعيل"}
                >
                  {adminSoundEnabled ? (
                    <>
                      <Volume2 className="w-4 h-4 text-emerald-300 animate-pulse" />
                      <span className="hidden sm:inline">صوت التنبيه: مفعّل 🔔</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-4 h-4 text-rose-300" />
                      <span className="hidden sm:inline">صوت التنبيه: مغلق 🔇</span>
                    </>
                  )}
                </button>

                <button
                  onClick={fetchAdminData}
                  disabled={isSyncing}
                  className={`p-1.5 md:p-2 hover:bg-white/10 text-white rounded-lg transition ${isSyncing ? "opacity-35" : ""}`}
                  title="تحديث ومزامنة البيانات يدوياً"
                >
                  <RefreshCw className={`w-4.5 h-4.5 ${isSyncing ? "animate-spin text-amber-200" : ""}`} />
                </button>
                <button
                  onClick={() => setIsAdminOpen(false)}
                  className="bg-slate-900/40 hover:bg-red-650 text-white p-2 rounded-full transition flex items-center justify-center"
                  title="إغلاق لوحة التحكم"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mobile Header Collapsible Toggle Button */}
            <button
              type="button"
              onClick={() => setIsAdminHeaderMinimised(!isAdminHeaderMinimised)}
              className="md:hidden w-full bg-amber-50 hover:bg-amber-100 text-amber-950 border-b border-amber-200 py-2.5 px-4 text-xs font-extrabold flex justify-between items-center transition select-none shrink-0"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span>لوحة التحكم: أرقام التنبيه وأصوات الضبط السريعة 📊⚙️</span>
              </span>
              <span className="bg-amber-200/80 text-amber-900 px-3 py-1 rounded-full text-[10px] font-black tracking-wide">
                {isAdminHeaderMinimised ? "عرض التفاصيل ➕" : "إخفاء التفاصيل ➖"}
              </span>
            </button>

            {/* Quick alert settings bar */}
            <div className={`${isAdminHeaderMinimised ? "hidden md:flex" : "flex"} bg-amber-500/10 border-b border-amber-500/20 px-4 py-3 md:px-6 flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-right shrink-0`}>
              {/* Auto alerts toggle */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-slate-800">تخصيص نظام التنبيهات المباشرة:</span>
                </div>
                
                {/* Visual Toast Alerts checkbox layout */}
                <label className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-3xs cursor-pointer hover:border-amber-400 hover:bg-slate-50 transition select-none">
                  <input
                    type="checkbox"
                    checked={autoAlertsEnabled}
                    onChange={(e) => {
                      const val = e.target.checked;
                      setAutoAlertsEnabled(val);
                      localStorage.setItem("academy_auto_alerts_enabled_v1", String(val));
                    }}
                    className="w-4 h-4 text-amber-600 border-slate-350 rounded focus:ring-amber-500 cursor-pointer"
                  />
                  <span className="text-xs font-extrabold text-slate-700">🔔 تنبيهات تلقائية (إشعارات Toast)</span>
                </label>
              </div>

              {/* Sound alert tone selection drop-down */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-slate-500 font-bold">نغمة التنبيه السمعي لتمييز الطلب:</span>
                <select
                  value={preferredAlertTone}
                  onChange={(e) => {
                    const val = e.target.value as any;
                    setPreferredAlertTone(val);
                    localStorage.setItem("academy_preferred_alert_tone_v1", val);
                    // play test beep of selected
                    setTimeout(() => {
                      playNotificationSound(val === "dynamic" ? "registration" : val);
                    }, 50);
                  }}
                  className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-extrabold text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer shadow-3xs"
                >
                  <option value="dynamic">🧭 تمييز تلقائي حسب نوع الإجراء</option>
                  <option value="registration">🎓 نغمة تنبيه تسجيل جديد</option>
                  <option value="callback">📞 نغمة تنبيه طلب اتصال</option>
                </select>

                {/* Instant preview button */}
                <button
                  type="button"
                  onClick={() => {
                    playNotificationSound(preferredAlertTone === "dynamic" ? "registration" : preferredAlertTone);
                  }}
                  className="px-2.5 py-1.5 bg-slate-900 text-white rounded-xl text-[10px] font-bold hover:bg-slate-850 active:scale-95 transition flex items-center gap-1 cursor-pointer"
                  title="استماع لتجربة جودة ونغمة التنبيه المحدد حالياً"
                >
                  <span>🔊 تجربة النغمة</span>
                </button>
              </div>
            </div>

            {/* Quick Informative Metric Cards Row */}
            <div className={`${isAdminHeaderMinimised ? "hidden md:grid" : "grid"} bg-slate-50 p-2 md:p-5 grid-cols-2 sm:grid-cols-4 gap-1.5 md:gap-3.5 border-b border-slate-200 shrink-0 text-right`}>
              {/* Card 1: Total Registered */}
              <div className="bg-white p-2.5 md:p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-1.5 sm:gap-3 shadow-xs text-center sm:text-right">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4.5 h-4.5 text-indigo-600" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 block font-bold truncate">إجمالي المسجلين</span>
                  <strong className="text-[11px] sm:text-xs md:text-md font-bold font-mono text-slate-800 block leading-none">{adminLeads.length} طالب</strong>
                </div>
              </div>

              {/* Card 2: New Uncontacted Registrations */}
              <div className="bg-white p-2.5 md:p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-1.5 sm:gap-3 shadow-xs text-center sm:text-right relative overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <Clock className="w-4.5 h-4.5 text-rose-600" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 block font-bold truncate">جديد لم يتم التواصل</span>
                  <strong className="text-[11px] sm:text-xs md:text-md font-bold font-mono text-rose-600 block leading-none">
                    {adminLeads.filter(l => l.status === "pending" || !l.status).length} جديد ⏳
                  </strong>
                </div>
                {adminLeads.some(l => l.status === "pending" || !l.status) && (
                  <div className="absolute top-1 left-1 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                )}
              </div>

              {/* Card 3: Contacted Students */}
              <div className="bg-white p-2.5 md:p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-1.5 sm:gap-3 shadow-xs text-center sm:text-right">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-4.5 h-4.5 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 block font-bold truncate">طلاب تم التواصل معهم</span>
                  <strong className="text-[11px] sm:text-xs md:text-md font-bold font-mono text-emerald-600 block leading-none">
                    {adminLeads.filter(l => l.status === "completed").length} طالب ✓
                  </strong>
                </div>
              </div>

              {/* Card 4: Did not answer (لم يتم الرد) */}
              <div className="bg-white p-2.5 md:p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-1.5 sm:gap-3 shadow-xs text-center sm:text-right">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Phone className="w-4.5 h-4.5 text-amber-600" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 block font-bold truncate">لم يتم الرد</span>
                  <strong className="text-[11px] sm:text-xs md:text-md font-bold font-mono text-amber-600 block leading-none">
                    {adminLeads.filter(l => l.status === "no_reply").length} طالب 📞
                  </strong>
                </div>
              </div>
            </div>

            {/* Sub Tabs controller */}
            <div className="flex bg-slate-100 p-1.5 gap-1.5 border-b border-slate-200 shrink-0">
              <button
                onClick={() => setAdminSubTab("leads")}
                className={`flex-1 py-2 md:py-3 px-2 md:px-4 rounded-xl text-[10px] sm:text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-1 sm:gap-2 cursor-pointer relative ${
                  adminSubTab === "leads"
                    ? "bg-white text-slate-900 shadow-xs border-b-2 border-amber-600"
                    : "text-slate-600 hover:bg-white/50"
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>الطلاب المسجلين ({adminLeads.length})</span>
                {adminLeads.some(l => l.status !== "completed") && (
                  <span className="absolute top-1 left-1 md:left-2 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                )}
              </button>

              <button
                onClick={() => setAdminSubTab("complaints")}
                className={`flex-1 py-2 md:py-3 px-2 md:px-4 rounded-xl text-[10px] sm:text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-1 sm:gap-2 cursor-pointer relative ${
                  adminSubTab === "complaints"
                    ? "bg-white text-slate-900 shadow-xs border-b-2 border-amber-600"
                    : "text-slate-600 hover:bg-white/50"
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>المقترحات والشكاوى ({adminComplaints.length})</span>
              </button>
            </div>

            {/* List panel lists container */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-5">
              {adminSubTab === "leads" ? (
                /* Tab 1: Leads/Student registrations list view */
                <div className="space-y-4 text-right">

                  {/* Mobile Stats Toggle Button */}
                  <div className="md:hidden">
                    <button
                      type="button"
                      onClick={() => setShowStatsOnMobile(!showStatsOnMobile)}
                      className="w-full py-2.5 px-4 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold rounded-xl border border-amber-200 flex items-center justify-center gap-2 transition cursor-pointer select-none"
                    >
                      {showStatsOnMobile ? "📈 إخفاء المخططات البيانية وإحصائيات المبيعات" : "📊 إظهار المخططات البيانية وإحصائيات القبول والأداء"}
                    </button>
                  </div>

                  {/* Real-time Analytics Cards (Visual BarChart / Recharts) */}
                  <div className={`${showStatsOnMobile ? "block animate-fade-in" : "hidden md:block"}`}>
                    <div className="bg-gradient-to-br from-indigo-900/5 to-slate-100/50 p-4 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                        <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                        <h4 className="font-extrabold text-xs text-slate-800">مخطط بياني حي لتوزيع حالات التواصل ومتابعة الطلاب:</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Interactive Bar Chart inside ResponsiveContainer */}
                        <div className="md:col-span-2 bg-white p-3 rounded-xl border border-slate-150 h-56 flex items-center justify-center">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={[
                                { name: "تم التواصل ✓", "عدد الطلاب": adminLeads.filter(l => l.status === "completed").length },
                                { name: "لم يتم الرد 📞", "عدد الطلاب": adminLeads.filter(l => l.status === "no_reply").length },
                                { name: "قيد الانتظار ⏳", "عدد الطلاب": adminLeads.filter(l => l.status === "pending" || !l.status).length }
                              ]}
                              margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: "bold", fill: "#475569" }} axisLine={false} tickLine={false} />
                              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                              <Tooltip 
                                contentStyle={{ direction: "rtl", textAlign: "right", borderRadius: "10px", fontSize: "11px", border: "1px solid #e2e8f0" }}
                                cursor={{ fill: "#f8fafc" }}
                              />
                              <Bar dataKey="عدد الطلاب" radius={[6, 6, 0, 0]} maxBarSize={48}>
                                <Cell fill="#10b981" />
                                <Cell fill="#fbbf24" />
                                <Cell fill="#ef4444" />
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Descriptive Analysis Info */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between space-y-2 text-right">
                          <div>
                            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-extrabold">موجز اتخاذ القرار السريع ⚡</span>
                            <h5 className="font-extrabold text-xs text-slate-800 mt-2">تقرير تفاعلي عن تقدم العمل:</h5>
                            <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                              تُظهر هذه التحليلات نسبة الاستجابة ومعدلات التواصل، لتمكين رؤساء التنسيق من متابعة كفاءة مستشاري القبول ومحاولة تغطية طلبات الانتظار بسرعة.
                            </p>
                          </div>
                          <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[10px] text-slate-650 font-bold font-mono">
                            <div className="flex justify-between">
                              <span>نسبة الإنجاز المحقة:</span>
                              <span className="text-emerald-600">
                                {adminLeads.length > 0 
                                  ? Math.round((adminLeads.filter(l => l.status === "completed").length / adminLeads.length) * 100)
                                  : 0}% 📈
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>الطلاب قيد المتابعة والاتصال:</span>
                              <span className="text-rose-500">
                                {adminLeads.filter(l => l.status === "pending" || !l.status || l.status === "no_reply").length} طالب
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Advanced Admin Search, Separator, and Sales Standings Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Right side: Search and list separation */}
                    <div className="lg:col-span-2 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-right">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-800">🔍 فرز وبحث الطلاب فلاش ومتابعة السيلز</h4>
                          <p className="text-[11px] text-slate-400">ابحث بالاسم، برقم الهاتف أو باسم مستشار خدمة العملاء (السيلز) لمراجعة المستندات.</p>
                        </div>
                        
                        {/* Toggle switches for communication division based on sales representative presence */}
                        <div className="flex flex-col sm:flex-row bg-slate-150/70 p-1.5 rounded-xl border border-slate-200 shrink-0 gap-1.5 sm:gap-0 sm:min-w-[360px]">
                          <button
                            onClick={() => setLeadsFilterMode("pending_all")}
                            type="button"
                            className={`w-full sm:w-auto sm:flex-1 py-2 px-3 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-between sm:justify-center gap-2 ${
                              leadsFilterMode === "pending_all"
                                ? "bg-amber-600 text-white shadow-xs font-black"
                                : "text-slate-750 hover:bg-slate-200 hover:text-slate-900"
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <span className="text-xs">⚠️</span>
                              <span>لم يتم التواصل (مؤقتة اليقظة)</span>
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono shrink-0 ${
                              leadsFilterMode === "pending_all"
                                ? "bg-white/20 text-white font-bold"
                                : "bg-slate-250 text-slate-700"
                            }`}>
                              {adminLeads.filter(l => !l.agentName || !l.agentName.trim()).length} ⏳
                            </span>
                          </button>
                          <button
                            onClick={() => setLeadsFilterMode("completed_all")}
                            type="button"
                            className={`w-full sm:w-auto sm:flex-1 py-2 px-3 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-between sm:justify-center gap-2 ${
                              leadsFilterMode === "completed_all"
                                ? "bg-emerald-600 text-white shadow-xs font-black"
                                : "text-slate-750 hover:bg-slate-200 hover:text-slate-900"
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <span className="text-xs">✅</span>
                              <span>تم التواصل (سيلز مُعيّن)</span>
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono shrink-0 ${
                              leadsFilterMode === "completed_all"
                                ? "bg-white/20 text-white font-bold"
                                : "bg-slate-250 text-slate-700"
                            }`}>
                              {adminLeads.filter(l => l.agentName && l.agentName.trim()).length} 📈
                            </span>
                          </button>
                        </div>
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          value={adminSearchQuery}
                          onChange={(e) => setAdminSearchQuery(e.target.value)}
                          placeholder="ابحث بالاسم الرباعي، رقم الهاتف، أو كود/اسم مستشار المبيعات..."
                          className="w-full bg-slate-50 border border-slate-200 hover:bg-slate-50/50 rounded-xl py-2.5 pr-10 pl-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-right text-slate-800 font-sans"
                        />
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                          <Search className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Advanced Multi-criteria Filter Bar */}
                      <div className="bg-slate-50/85 p-3 sm:p-4 rounded-2xl border border-slate-150 space-y-3 text-right">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                          <span className="text-[11.5px] font-black text-slate-800 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                            <span>🎯 شريط الفلترة والتصفية متعدد الاختصارات (تحديد وحملات مستهدفة):</span>
                          </span>
                          {(adminFilterDate !== "all" || adminFilterGov !== "all" || adminFilterDept !== "all" || adminFilterAgent !== "all") && (
                            <button
                              type="button"
                              onClick={() => {
                                setAdminFilterDate("all");
                                setAdminFilterGov("all");
                                setAdminFilterDept("all");
                                setAdminFilterAgent("all");
                              }}
                              className="text-[10px] text-rose-650 hover:text-rose-800 font-extrabold flex items-center gap-1 cursor-pointer transition select-none self-end sm:self-auto"
                            >
                              <span>إلغاء وتهيئة الفلاتر المقيدة 🔄</span>
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                          {/* Filter 1: Registration period */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-extrabold text-slate-500 block">📅 تاريخ وتوقيت الحجز المبدئي:</label>
                            <select
                              value={adminFilterDate}
                              onChange={(e) => setAdminFilterDate(e.target.value)}
                              className="w-full bg-white border border-slate-200 font-bold text-xs text-slate-800 rounded-lg p-2 focus:ring-1 focus:ring-amber-500 cursor-pointer text-right shadow-3xs"
                            >
                              <option value="all">📁 جميع التواريخ (الكل)</option>
                              <option value="today">🌞 سجلات اليوم فقط</option>
                              <option value="yesterday_today">🗓️ سجلات اليوم وأمس</option>
                              <option value="week">⏳ آخر 7 أيام</option>
                              <option value="month">📊 سجلات هذا الشهر</option>
                            </select>
                          </div>

                          {/* Filter 2: Governorate */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-extrabold text-slate-500 block">📍 المحافظة الجغرافية:</label>
                            <select
                              value={adminFilterGov}
                              onChange={(e) => setAdminFilterGov(e.target.value)}
                              className="w-full bg-white border border-slate-200 font-bold text-xs text-slate-800 rounded-lg p-2 focus:ring-1 focus:ring-amber-500 cursor-pointer text-right shadow-3xs"
                            >
                              <option value="all">🗺️ جميع المحافظات ({Array.from(new Set(adminLeads.map(l => l.governorate?.trim()).filter(Boolean))).length})</option>
                              {Array.from(new Set(adminLeads.map(l => l.governorate?.trim()).filter(Boolean))).sort().map((gov: any) => (
                                <option key={gov} value={gov}>📍 {gov}</option>
                              ))}
                            </select>
                          </div>

                          {/* Filter 3: Department */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-extrabold text-slate-500 block">📚 القسم/التخصص المهتم به:</label>
                            <select
                              value={adminFilterDept}
                              onChange={(e) => setAdminFilterDept(e.target.value)}
                              className="w-full bg-white border border-slate-200 font-bold text-xs text-slate-800 rounded-lg p-2 focus:ring-1 focus:ring-amber-500 cursor-pointer text-right shadow-3xs"
                            >
                              <option value="all">🎓 جميع الأقسام والدورات</option>
                              {ACADEMY_DEPARTMENTS.map((dept) => (
                                <option key={dept.id} value={dept.id}>📚 {dept.name}</option>
                              ))}
                            </select>
                          </div>

                          {/* Filter 4: Sales Representative */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-extrabold text-slate-500 block">👤 حالة السيلز ومستشار التواصل:</label>
                            <select
                              value={adminFilterAgent}
                              onChange={(e) => setAdminFilterAgent(e.target.value)}
                              className="w-full bg-white border border-slate-200 font-bold text-xs text-slate-800 rounded-lg p-2 focus:ring-1 focus:ring-amber-500 cursor-pointer text-right shadow-3xs"
                            >
                              <option value="all">👥 جميع مستشاري المبيعات</option>
                              <option value="unassigned">⚠️ طلاب بدون موظف سيلز (معلق)</option>
                              {Array.from(new Set(adminLeads.map(l => l.agentName?.trim()).filter(Boolean))).sort().map((agent: any) => (
                                <option key={agent} value={agent}>📞 سيلز: {agent}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Left side: Sales Standings (لوحة تفاعلية لمقارنة أداء السيلز وتوزييع المكافآت) */}
                    <div className={`${showStatsOnMobile ? "flex animate-fade-in" : "hidden lg:flex"} bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex-col justify-between text-right`}>
                      <div>
                        <div className="flex items-center gap-1.5 justify-end">
                          <Award className="w-4.5 h-4.5 text-amber-500 animate-bounce" />
                          <h4 className="font-extrabold text-xs text-slate-800">🏆 أداء مستشاري المبيعات (السيلز)</h4>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">
                          مقارنة فورية لنشاط السيلز الموثق لتوزيع المكافآت والنسب الإدارية بالشركة.
                        </p>

                        {/* Dynamic Sales Stats List */}
                        <div className="mt-3 space-y-1.5 max-h-36 overflow-y-auto pr-1">
                          {(() => {
                            const entries = Object.entries(
                              adminLeads.reduce((acc: { [name: string]: number }, cur: any) => {
                                if (cur.agentName && cur.agentName.trim()) {
                                  const name = cur.agentName.trim();
                                  acc[name] = (acc[name] || 0) + 1;
                                }
                                return acc;
                              }, {})
                            ).sort((a: any, b: any) => Number(b[1]) - Number(a[1]));

                            if (entries.length === 0) {
                              return (
                                <div className="text-center py-5 text-[10px] text-slate-400 italic font-bold">
                                  لم يتم تسجيل اسم سيلز لأي طالب حتى الآن.
                                </div>
                              );
                            }

                             return entries.map(([name, count], index) => {
                               const estimatedBonus = Number(count) * 200; // 200 EGP per student as administrative incentive
                               return (
                                 <div
                                   key={name}
                                   className={`flex items-center justify-between p-2 rounded-xl text-xs font-bold border transition ${
                                     index === 0
                                       ? "bg-amber-50 border-amber-200 text-slate-900 shadow-sm"
                                       : "bg-slate-50 text-slate-700 border-slate-100"
                                   }`}
                                 >
                                   <div className="flex flex-col text-right">
                                     <div className="flex items-center gap-1.5">
                                       {index === 0 ? (
                                         <span className="text-amber-700 text-[10px] bg-amber-200/50 px-1.5 py-0.5 rounded font-black flex items-center gap-1">👑 الأول في القبول</span>
                                       ) : (
                                         <span className="text-slate-400 text-[10px] font-mono">#{index + 1}</span>
                                       )}
                                       <span className="font-sans text-slate-800 text-[11px] font-extrabold">{name}</span>
                                     </div>
                                     <span className="text-[9px] text-emerald-600 font-bold mt-0.5">
                                       🎁 المكافأة المالية المستحقة: {estimatedBonus.toLocaleString('ar-EG')} ج.م
                                     </span>
                                   </div>
                                   <span className="bg-indigo-650 text-white px-2.5 py-1 rounded-lg text-[9.5px] font-mono font-black shrink-0">
                                     {count} طلاب
                                   </span>
                                 </div>
                               );
                             });
                          })()}
                        </div>
                      </div>
                      <div className="text-[9px] text-slate-450 border-t border-slate-100 pt-2 shrink-0 text-center font-bold">
                        تتحدث تلقائياً بمجرد إدخال اسم الموظف عند التواصل.
                      </div>
                    </div>
                  </div>

                  {/* Bulk copy / phone numbers manager */}
                  {(() => {
                    // 1. Compute dynamic list of active sales reps to prevent undefined errors and allow selection
                    const defaultSalesReps = ["أ. دينا خالد", "أ. محمد أحمد", "أ. سارة علي", "أ. محمود صابر"];
                    const activeSalesReps = Array.from(new Set([
                      ...defaultSalesReps,
                      ...adminLeads
                        .map(lead => lead.agentName?.trim())
                        .filter(Boolean)
                    ]));

                    // Define list of rewarded sales representatives (e.g. sales who have more than 2 students are rewarded)
                    // This dynamically rewards and lists rewarded reps as requested: "وكذلك عدد طلاب السيلز ليها إلى جانب السيلز فكافأت ليهم من قبل الإدارة"
                    const rewardedReps = Array.from(new Set(
                      adminLeads
                        .map(lead => lead.agentName?.trim())
                        .filter(Boolean)
                        .filter(name => {
                          const count = adminLeads.filter(l => l.agentName === name).length;
                          return count >= 2; // Reps with 2 or more students are rewarded!
                        })
                    ));

                    // Filter the leads dynamically according to the search query and filters
                    const filteredLeads = adminLeads.filter(lead => {
                      // 1. Division Tab filter:
                      // completed_all: contacted. Has agentName or status === "completed"
                      // pending_all: not contacted. No agentName and status !== "completed"
                      const isCompletedTab = !!(lead.agentName && lead.agentName.trim() !== "") || lead.status === "completed";
                      const matchTab = (leadsFilterMode === "completed_all") ? isCompletedTab : !isCompletedTab;
                      if (!matchTab) return false;

                      // 2. Search Query filter
                      const query = adminSearchQuery.trim().toLowerCase();
                      if (query) {
                        const matchQuery = (
                          (lead.studentName || "").toLowerCase().includes(query) ||
                          (lead.phoneNumber || "").toLowerCase().includes(query) ||
                          (lead.whatsappNumber || "").toLowerCase().includes(query) ||
                          (lead.agentName || "").toLowerCase().includes(query) ||
                          (lead.reservationCode || "").toLowerCase().includes(query) ||
                          (lead.governorate || "").toLowerCase().includes(query)
                        );
                        if (!matchQuery) return false;
                      }

                      // 3. Date / Period filter
                      if (adminFilterDate !== "all") {
                        const studentTime = Number(lead.timestamp);
                        if (!studentTime) return false;
                        const now = Date.now();
                        const startOfToday = new Date().setHours(0,0,0,0);
                        
                        if (adminFilterDate === "today") {
                          if (studentTime < startOfToday) return false;
                        } else if (adminFilterDate === "yesterday_today") {
                          const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
                          if (studentTime < startOfYesterday) return false;
                        } else if (adminFilterDate === "week") {
                          const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
                          if (studentTime < sevenDaysAgo) return false;
                        } else if (adminFilterDate === "month") {
                          const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
                          if (studentTime < startOfMonth) return false;
                        }
                      }

                      // 4. Governorate filter
                      if (adminFilterGov !== "all") {
                        if ((lead.governorate || "").trim().toLowerCase() !== adminFilterGov.toLowerCase()) return false;
                      }

                      // 5. Department filter
                      if (adminFilterDept !== "all") {
                        const matchDept = (lead.selectedDepartments && lead.selectedDepartments.includes(adminFilterDept)) ||
                                          (lead.basicCourse === adminFilterDept);
                        if (!matchDept) return false;
                      }

                      // 6. Agent filter (Sales representative)
                      if (adminFilterAgent !== "all") {
                        if (adminFilterAgent === "unassigned") {
                          if (lead.agentName && lead.agentName.trim() !== "") return false;
                        } else {
                          if ((lead.agentName || "").trim().toLowerCase() !== adminFilterAgent.toLowerCase()) return false;
                        }
                      }

                      return true;
                    });

                    return (
                      <div className="space-y-4">
                        {/* Bulk copy / phone numbers manager */}
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-right">
                          <div className="text-xs text-slate-600 font-sans">
                            <p className="font-extrabold text-slate-800 mb-0.5">📱 أداة الاتصال السريع ومتابعة الطلاب لمستشار التسجيل:</p>
                            <p>يمكنك نسخ جميع أرقام هواتف الطلاب المصفاة بنقرة واحدة لسهولة الاتصال دفعة واحدة.</p>
                          </div>
                          <button
                            onClick={() => {
                              const phoneNumbers = filteredLeads.map(l => l.phoneNumber).filter(Boolean);
                              if (phoneNumbers.length === 0) {
                                alert("لا توجد أرقام هواتف في هذه القائمة المصفاة حالياً!");
                                return;
                              }
                              navigator.clipboard.writeText(phoneNumbers.join(", "));
                              setCopiedFeedback("leads_phones");
                              setTimeout(() => setCopiedFeedback(null), 2500);
                            }}
                            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-3xs hover:shadow-xs self-end sm:self-auto"
                          >
                            {copiedFeedback === "leads_phones" ? "✓ تم نسخ الأرقام بنجاح!" : "📋 نسخ جميع أرقام القائمة الهاتفية المصفاة"}
                          </button>
                        </div>

                        {/* Leads Display List Grid */}
                        {filteredLeads.length === 0 ? (
                          <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 w-full">
                            <span className="text-3xl block mb-2">🔍</span>
                            <p className="text-xs text-slate-500 font-extrabold">لا توجد سجلات مطابقة للبحث أو الفلاتر المحددة حالياً.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredLeads.map((student: any) => {
                          const isDelayed = student.status !== "completed" && student.timestamp && (Date.now() - Number(student.timestamp) > 24 * 60 * 60 * 1000);
                          const isExpanded = !!expandedStudents[student.id];

                          return (
                          <div key={student.id} className={`rounded-2xl border transition-all relative ${
                            student.status === "completed"
                              ? "bg-slate-50/70 border-slate-200 opacity-80 hover:border-emerald-500"
                              : isDelayed
                              ? "bg-red-50/40 border-red-300 ring-2 ring-red-500/10 shadow-sm"
                              : student.status === "no_reply"
                              ? "bg-amber-50/20 border-amber-350 hover:border-amber-500"
                              : "bg-white border-slate-200 hover:border-amber-400 shadow-3xs"
                          } ${isExpanded ? "p-5 space-y-4" : "p-3 sm:p-3.5 space-y-2"} hover:shadow-sm`}>
                            
                            {/* Card Header (Both collapsed and expanded) */}
                            <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-slate-100 pb-2">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => toggleStudentExpand(student.id)}
                                  className="w-6.5 h-6.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer select-none shrink-0 text-xs font-bold"
                                >
                                  {isExpanded ? "➖" : "➕"}
                                </button>
                                <span 
                                  className="font-extrabold text-sm text-slate-900 cursor-pointer flex items-center gap-1.5 hover:text-amber-700 transition" 
                                  onClick={() => toggleStudentExpand(student.id)}
                                >
                                  <User className="w-4 h-4 text-slate-400 shrink-0" />
                                  <span>{student.studentName}</span>
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-[9px] font-bold text-amber-850 bg-amber-50 px-2 py-0.5 rounded border border-amber-250/20">
                                  كود: #{student.reservationCode || "1000"}
                                </span>
                              </div>
                            </div>

                            {/* 1. COLLAPSED COMPACT CARD VIEW */}
                            {!isExpanded ? (
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-0.5 text-right">
                                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                                  {/* Contact Status Badge */}
                                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                                    student.status === "completed"
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                      : student.status === "no_reply"
                                      ? "bg-amber-50 text-amber-800 border border-amber-250"
                                      : isDelayed
                                      ? "bg-red-50 text-red-700 border border-red-200"
                                      : "bg-slate-100 text-slate-755 border border-slate-200"
                                  }`}>
                                    {student.status === "completed"
                                      ? "✓ تم التواصل"
                                      : student.status === "no_reply"
                                      ? "📞 لم يرد"
                                      : isDelayed
                                      ? "⚠️ تأخير 24س"
                                      : "⏳ انتظار"}
                                  </span>

                                  {/* Assigned Sales Rep badge */}
                                  {student.agentName ? (
                                    <span className="inline-flex items-center gap-1.5 text-[10.5px] font-black text-indigo-950 bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded-md shrink-0">
                                      <span className="w-1 h-1 rounded-full bg-indigo-600"></span>
                                      <span>السيلز: {student.agentName}</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-amber-850 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md shrink-0 animate-pulse">
                                      <span>⚠️ بدون سيلز</span>
                                    </span>
                                  )}

                                  {/* Course Category */}
                                  <span className="text-slate-550 text-[10px] bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5 font-bold">
                                    📚 {student.basicCourse?.replace("دورة ", "") || "الرئيسية"}
                                  </span>

                                  {student.governorate && (
                                    <span className="text-slate-500 font-bold text-[9.5px]">
                                      📍 {student.governorate}
                                    </span>
                                  )}
                                </div>

                                {/* Instant Fast Actions (Phone and WhatsApp) */}
                                <div className="flex items-center justify-between sm:justify-end gap-1.5 border-t sm:border-t-0 border-slate-100 pt-2 sm:pt-0 shrink-0">
                                  <div className="flex items-center gap-1">
                                    <a
                                      href={`tel:${student.phoneNumber}`}
                                      className="w-7 h-7 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition flex items-center justify-center shrink-0 border border-emerald-200/50"
                                      title="اتصال سريع بالهاتف"
                                    >
                                      <Phone className="w-3.5 h-3.5" />
                                    </a>
                                    {student.whatsappNumber && (
                                      <a
                                        href={getWhatsAppLink(student.whatsappNumber, student.studentName)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-7 h-7 bg-emerald-55 text-emerald-600 rounded-lg hover:bg-emerald-100 border border-emerald-200 transition flex items-center justify-center shrink-0"
                                        title="مراسلة واتساب فوراً"
                                      >
                                        <MessageCircle className="w-3.5 h-3.5 text-emerald-650" />
                                      </a>
                                    )}
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => toggleStudentExpand(student.id)}
                                    className="text-[10px] text-amber-955 hover:bg-amber-100 bg-amber-50 border border-amber-200/60 font-black px-2.5 py-1 rounded-lg transition shrink-0 flex items-center gap-1 cursor-pointer select-none"
                                  >
                                    <span>المزيد 📂</span>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              /* 2. EXPANDED FULL DETAIL CARD VIEW */
                              <div className="space-y-4 text-right animate-fade-in">
                                {/* Code, State label and Register date */}
                                <div className="flex justify-between items-center text-xs">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    student.status === "completed"
                                      ? "bg-emerald-55 text-emerald-700 border border-emerald-200"
                                      : student.status === "no_reply"
                                      ? "bg-amber-100 text-amber-850 border border-amber-300 animate-pulse"
                                      : isDelayed
                                      ? "bg-red-100 text-red-700 border border-red-300 animate-pulse"
                                      : "bg-red-50 text-red-650 border border-red-200"
                                  }`}>
                                    {student.status === "completed"
                                      ? "تم التواصل والتعميد ✓"
                                      : student.status === "no_reply"
                                      ? "لم يتم الرد (المتابعة مستمرة) 📞"
                                      : isDelayed
                                      ? "تأخير (تجاوز 24 ساعة) ⚠️"
                                      : "انتظار تواصل السيلز ⏳"}
                                  </span>

                                  {student.date && (
                                    <div className="text-[10px] text-slate-550 font-semibold bg-slate-50 px-2 py-1 rounded border border-slate-100 flex items-center gap-1 shrink-0 font-mono">
                                      <Clock className="w-3 h-3 text-indigo-500" />
                                      <span>{student.date}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Contact phone numbers with copy action */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center justify-between font-mono">
                                    <span className="text-slate-400 font-sans">الهاتف:</span>
                                    <div className="flex items-center gap-1.5">
                                      <strong className="text-brand-navy font-bold">{student.phoneNumber}</strong>
                                      <a
                                        href={`tel:${student.phoneNumber}`}
                                        className="p-1 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100 transition flex items-center justify-center shrink-0"
                                        title="اتصال مباشر"
                                        style={{ minWidth: "26px", minHeight: "26px" }}
                                      >
                                        <Phone className="w-3.5 h-3.5" />
                                      </a>
                                      <button
                                        onClick={() => handleCopySingleNumber(student.phoneNumber)}
                                        className="p-1 bg-slate-200/60 text-slate-600 rounded hover:bg-slate-300 transition flex items-center justify-center shrink-0"
                                        title="نسخ الرقم"
                                        style={{ minWidth: "26px", minHeight: "26px" }}
                                      >
                                        <Copy className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  {student.whatsappNumber && (
                                    <div className="bg-emerald-55/25 p-2 rounded-xl border border-emerald-100/50 flex items-center justify-between font-mono">
                                      <span className="text-slate-400 font-sans">واتساب:</span>
                                      <div className="flex items-center gap-1.5">
                                        <strong className="text-emerald-700 font-bold">{student.whatsappNumber}</strong>
                                        <a
                                          href={getWhatsAppLink(student.whatsappNumber, student.studentName)}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="p-1 bg-emerald-55 text-emerald-600 rounded hover:bg-emerald-100 transition flex items-center justify-center shrink-0"
                                          title="فتح شات واتساب"
                                          style={{ minWidth: "26px", minHeight: "26px" }}
                                        >
                                          <MessageCircle className="w-3.5 h-3.5" />
                                        </a>
                                        <button
                                          onClick={() => handleCopySingleNumber(student.whatsappNumber)}
                                          className="p-1 bg-slate-200/60 text-slate-600 rounded hover:bg-slate-300 transition flex items-center justify-center shrink-0"
                                          title="نسخ الرقم"
                                          style={{ minWidth: "26px", minHeight: "26px" }}
                                        >
                                          <Copy className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Metadata fields (Governorate, Graduation Year) */}
                                <div className="grid grid-cols-2 gap-2 text-[11px]">
                                  {student.governorate && (
                                    <div className="bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 flex items-center gap-1.5 text-slate-600">
                                      <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                      <span>المحافظة: <strong>{student.governorate}</strong></span>
                                    </div>
                                  )}
                                  {student.graduationYear && (
                                    <div className="bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 flex items-center gap-1.5 text-slate-600">
                                      <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                      <span>سنة التخرج: <strong>{student.graduationYear}</strong></span>
                                    </div>
                                  )}
                                </div>

                                {/* Qualifications & Main Course details */}
                                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150 space-y-1 text-xs">
                                  <p>
                                    <span className="font-semibold text-slate-400">المؤهل الدراسي للتقديم:</span> {student.educationLevel}
                                  </p>
                                  <p className="flex items-center gap-1 text-emerald-800 font-extrabold text-[11px] mt-1">
                                    <Sparkles className="w-3.5 h-3.5 text-brand-gold shrink-0 animate-pulse" />
                                    <span>الدورة الدراسية للتقديم:</span>
                                    <span className="bg-emerald-50 px-2 py-0.5 rounded border border-emerald-250/25 text-[10px]">{student.basicCourse || "دورة أكتوبر 2026 (الرئيسية)"}</span>
                                  </p>
                                </div>

                                {/* Selected Departments */}
                                <div className="space-y-1">
                                  <span className="text-[10px] text-slate-400 font-bold block">الأقسام المهتم بها الطالب:</span>
                                  <div className="flex flex-wrap gap-1">
                                    {student.selectedDepartments && student.selectedDepartments.length > 0 ? (
                                      student.selectedDepartments.map((dept: string, i: number) => (
                                        <span key={i} className="text-[10px] font-bold text-amber-900 bg-amber-50 border border-amber-200/50 px-2 py-0.5 rounded-sm">
                                          {dept}
                                        </span>
                                      ))
                                    ) : (
                                      <span className="text-[10px] text-slate-400 italic">لم يختر قسماً محدداً</span>
                                    )}
                                  </div>
                                </div>

                                {/* Notes */}
                                {student.notes && (
                                  <div className="p-2.5 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-100 leading-relaxed font-sans">
                                    <strong className="text-[10px] text-slate-400 block mb-0.5 font-bold">ملاحظات الطالب:</strong>
                                    "{student.notes}"
                                  </div>
                                )}

                                 {/* Confidential Staff/Sales Internal Notes */}
                                 <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-right space-y-1.5 shadow-sm text-white">
                                   <div className="flex items-center justify-between">
                                     <span className="text-[10px] text-amber-400 font-extrabold flex items-center gap-1 font-sans">
                                       <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                       🔐 تعليق داخلي للمبيعات والمشرفين (سري ومحمي)
                                     </span>
                                     {editingNoteId !== student.id ? (
                                       <button
                                         type="button"
                                         onClick={() => {
                                           setEditingNoteId(student.id);
                                           setTempNoteText(student.internalNotes || "");
                                         }}
                                         className="text-[9.5px] font-black text-amber-300 hover:text-white bg-slate-800 hover:bg-slate-755 px-2.5 py-1 rounded cursor-pointer transition-all"
                                       >
                                         {student.internalNotes ? "تعديل ✍️" : "إضافة ملاحظة داخلياً ➕"}
                                       </button>
                                     ) : null}
                                   </div>

                                   {editingNoteId === student.id ? (
                                     <div className="space-y-1.5 pt-1">
                                       <textarea
                                         value={tempNoteText}
                                         onChange={(e) => setTempNoteText(e.target.value)}
                                         placeholder="اكتب هنا ملاحظات السيلز الداخلية حول الطالب (سري ومحمي)..."
                                         className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-right font-semibold font-sans resize-none"
                                         rows={2}
                                       />
                                       <div className="flex gap-1.5 justify-end">
                                         <button
                                           onClick={() => handleSaveInternalNote("lead", student.id)}
                                           type="button"
                                           className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 text-[10px] font-black rounded cursor-pointer transition-all"
                                         >
                                           تأكيد وحفظ ✓
                                         </button>
                                         <button
                                           onClick={() => {
                                             setEditingNoteId(null);
                                             setTempNoteText("");
                                           }}
                                           type="button"
                                           className="px-2 py-1 bg-slate-800 hover:bg-slate-705 text-slate-300 text-[10px] font-bold rounded cursor-pointer transition-all"
                                         >
                                           إلغاء
                                         </button>
                                       </div>
                                     </div>
                                   ) : (
                                     <p className="text-xs font-semibold leading-relaxed text-slate-200">
                                       {student.internalNotes ? `"${student.internalNotes}"` : "لا توجد أي ملاحظات داخلية لفريق العمل بعد."}
                                     </p>
                                   )}
                                 </div>

                                 {/* Dynamic Sales Representative Assignment and Tracking */}
                                 <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-right space-y-2 mt-1.5 font-sans text-slate-800">
                                   <div className="flex items-center justify-between flex-wrap gap-1">
                                     <span className="text-[11px] text-indigo-900 font-extrabold flex items-center gap-1">
                                       <Users className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                       <span>👤 مستشار التسجيل ومتابعة المبيعات (السيلز)</span>
                                     </span>
                                     {editingSalesStudentId !== student.id && (
                                       <button
                                         type="button"
                                         onClick={() => {
                                           setEditingSalesStudentId(student.id);
                                           const currentRep = student.agentName || "";
                                           if (currentRep && activeSalesReps.includes(currentRep)) {
                                             setTempSalesOption(currentRep);
                                             setTempSalesInput("");
                                           } else if (currentRep) {
                                              setTempSalesOption("NEW");
                                              setTempSalesInput(currentRep);
                                           } else {
                                             setTempSalesOption("");
                                             setTempSalesInput("");
                                           }
                                         }}
                                         className="text-[10px] font-black text-indigo-700 hover:text-white bg-indigo-50 hover:bg-indigo-600 px-2.5 py-1 rounded-md transition duration-150 cursor-pointer"
                                       >
                                         {student.agentName ? "تعديل المبيعات ✍️" : "تسجيل مستشار تواصل ➕"}
                                       </button>
                                     )}
                                   </div>

                                   {editingSalesStudentId === student.id ? (
                                     <div className="space-y-2 bg-white p-3 rounded-lg border border-indigo-150 shadow-xs">
                                       <div>
                                         <label className="block text-[10px] text-slate-500 font-bold mb-1">اختر من مستشاري المبيعات الموجودين:</label>
                                         <select
                                           value={tempSalesOption}
                                           onChange={(e) => {
                                             const val = e.target.value;
                                             setTempSalesOption(val);
                                             if (val !== "NEW") {
                                               setTempSalesInput("");
                                             }
                                           }}
                                           className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                                         >
                                    <option value="">-- بدون سيلز (إرجاع لم تواصل / معلق) --</option>
                                    {activeSalesReps.map((repName) => (
                                      <option key={repName} value={repName}>
                                        👤 {repName} ({adminLeads.filter(l => l.agentName === repName).length} طلاب)
                                      </option>
                                    ))}
                                    <option value="NEW">➕ إضافة اسم سيلز جديد في الشركة...</option>
                                  </select>
                                </div>

                                {tempSalesOption === "NEW" && (
                                  <div className="space-y-1">
                                    <label className="block text-[10px] text-slate-500 font-bold">اسم السيلز الجديد:</label>
                                    <input
                                      type="text"
                                      value={tempSalesInput}
                                      onChange={(e) => setTempSalesInput(e.target.value)}
                                      placeholder="مثال: أ. دينا خالد"
                                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 text-right"
                                    />
                                  </div>
                                )}

                                <div className="flex gap-2 justify-end pt-1">
                                  <button
                                    onClick={() => {
                                      const selectedName = tempSalesOption === "NEW" ? tempSalesInput : tempSalesOption;
                                      handleSaveSalesAssignment(student.id, selectedName);
                                    }}
                                    type="button"
                                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-extrabold rounded-lg cursor-pointer transition shadow-xs"
                                  >
                                    تأكيد وتثبيت السيلز والمكالمة 💾
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingSalesStudentId(null);
                                      setTempSalesOption("");
                                      setTempSalesInput("");
                                    }}
                                    type="button"
                                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold rounded-lg cursor-pointer transition"
                                  >
                                    إلغاء
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 flex-wrap">
                                {student.agentName ? (
                                  <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-indigo-950 bg-indigo-50 border border-indigo-150 px-3 py-1.5 rounded-lg">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
                                    <span>الاسم المسجل: <strong>{student.agentName}</strong></span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-250 px-3 py-1.5 rounded-lg">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                                    <span>لم يتم ترحيله للتواصل بعد (بانتظار سيلز ومكالمة) ⏳</span>
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Actions panel */}
                          <div className="flex flex-col sm:flex-row gap-2 justify-between items-stretch sm:items-center pt-2.5 border-t border-slate-100">
                            <div className="flex flex-wrap gap-1.5">
                              {student.status !== "completed" && (
                                <button
                                  onClick={() => handleSetNoReply("lead", student.id)}
                                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition cursor-pointer flex items-center gap-1 ${
                                    student.status === "no_reply"
                                      ? "bg-amber-100 text-amber-900 border-amber-300"
                                      : "bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
                                  }`}
                                >
                                  {student.status === "no_reply" ? "تم تسجيل لم يرد (متابعة) 📞" : "تسجيل لم يرد 📞"}
                                </button>
                              )}

                              {student.status === "completed" ? (
                                <span className="text-xs font-extrabold px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 flex items-center gap-1 select-none">
                                  تم المكالمة والمتابعة والترحيل بنجاح ✓
                                </span>
                              ) : (
                                <button
                                  onClick={() => {
                                    // Trigger quick select or input by activating sales edit
                                    setEditingSalesStudentId(student.id);
                                    setTempSalesOption("");
                                    setTempSalesInput("");
                                  }}
                                  className="text-[11px] font-extrabold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition duration-150 cursor-pointer flex items-center gap-1"
                                >
                                  إدخال اسم السيلز لترحيله لتم التواصل ✓
                                </button>
                              )}
                            </div>

                            <button
                              onClick={() => handleDeleteItem("lead", student.id)}
                              className="text-xs text-slate-350 hover:text-red-500 transition flex items-center gap-1 py-1 px-2 hover:bg-red-50 rounded cursor-pointer self-end sm:self-auto"
                              title="حذف هذا الطالب بالكامل من القائمة"
                            >
                              <Trash2 className="w-4 h-4 text-red-500 shrink-0" />
                              <span className="text-[10px] text-red-655 font-bold">حذف طالب</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
              ) : (
                /* Tab 3: Complaints & Suggestions list view */
                <div className="space-y-4 text-right">
                  <div className="p-4 bg-rose-50 border-r-4 border-rose-500 rounded-2xl">
                    <h4 className="font-extrabold text-xs text-rose-950 mb-0.5">📢 صندوق المقترحات والشكاوى لزيادة الشفافية والخصوصية:</h4>
                    <p className="text-[11px] text-rose-800">بيانات الطلاب والشكاوى المقدمة تكون سرية بالكامل ومحمية بجدار حماية لمنع مشاركة البيانات مع أي جهة خارجية.</p>
                  </div>

                  {adminComplaints.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-150">
                      <ShieldAlert className="w-12 h-12 mx-auto text-slate-200 mb-3" />
                      <span>لا توجد شكاوى أو مقترحات مرسلة حتى الآن. صندوق الوارد فارغ ونظيف!</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {adminComplaints.map((item: any) => (
                        <div key={item.id} className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-rose-400 transition relative space-y-3 shadow-xs">
                          <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              item.type === "complaint"
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}>
                              {item.type === "complaint" ? "⚠️ شكوى رسمية" : "💡 فكرة / مقترح تطوير"}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {item.date || "اليوم"}
                            </span>
                          </div>

                          <div className="space-y-1 text-right">
                            <h4 className="font-extrabold text-sm text-slate-900">{item.studentName}</h4>
                            
                            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center justify-between text-xs font-mono">
                              <span className="text-slate-400 font-sans">رقم الهاتف:</span>
                              <div className="flex items-center gap-1.5">
                                <strong className="text-slate-900">{item.phoneNumber}</strong>
                                <a
                                  href={`tel:${item.phoneNumber}`}
                                  className="p-1 bg-emerald-50 text-emerald-600 rounded-sm hover:bg-emerald-100 transition flex items-center justify-center shrink-0"
                                  title="اتصال مباشر بالهاتف"
                                  style={{ minWidth: "26px", minHeight: "26px" }}
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </a>
                                <button
                                  onClick={() => handleCopySingleNumber(item.phoneNumber)}
                                  className="p-1 bg-slate-200/60 text-slate-650 rounded-sm hover:bg-slate-300 transition flex items-center justify-center shrink-0"
                                  title="نسخ رقم الهاتف"
                                  style={{ minWidth: "26px", minHeight: "26px" }}
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="p-2.5 bg-slate-50 rounded-lg text-xs text-slate-800 border border-slate-100 leading-relaxed font-sans text-right">
                            <strong className="text-[10px] text-rose-600 block mb-1 font-bold">محتوى الإرسال:</strong>
                            "{item.text || item.complaintText}"
                          </div>

                          <div className="flex justify-end pt-2 border-t border-slate-100">
                            <button
                              onClick={() => handleDeleteItem("complaint", item.id)}
                              className="text-xs text-slate-350 hover:text-red-650 transition flex items-center gap-1.5 p-1 rounded hover:bg-red-50 cursor-pointer"
                              title="حذف الشكوى من الأرشيف"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                              <span className="text-[10px] text-red-650 font-bold">حذف نهائياً</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}



            </div>

            {/* Admin Footer bar */}
            <div className="bg-slate-100 p-4 border-t border-slate-200 shrink-0 text-center flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 text-right">
              <span className="font-semibold text-slate-600">
                الحماية مشغلة ✓ يتصل الخادم بقاعدة حية في حاوية الذاكرة محلياً لمصلحتك وتحديث البيانات مستمر كل 6 ثوانٍ.
              </span>
              <button
                onClick={() => setIsAdminOpen(false)}
                className="w-full sm:w-auto px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold font-sans cursor-pointer transition text-center"
              >
                رجوع للأكاديمية والطلبات الدراسية
              </button>
            </div>

          </div>
        </div>
      )}


      {/* ==================== 2. FLOATING ADVISOR CALL QUICK MODAL ==================== */}
      {isCallbackModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-[110] flex items-center justify-center p-4 animate-fade-in" dir="rtl">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-scale-up text-right">
            
            <div className="bg-brand-navy p-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <PhoneCall className="w-4 h-4 text-brand-gold animate-bounce" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm md:text-base text-white">اتصال سريع بمستشار التسجيل 📱</h4>
                  <p className="text-[10px] text-slate-300">دعنا نتصل بك فوراً ونجيب على كل استفساراتك</p>
                </div>
              </div>
              <button
                onClick={() => setIsCallbackModalOpen(false)}
                className="bg-white/10 p-1.5 rounded-full text-white hover:bg-white/20 transition-all cursor-pointer flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {!cbSuccess ? (
                <form onSubmit={handleRequestCallbackSubmit} className="space-y-4 text-right">
                  <div className="p-3 bg-blue-50 border-r-4 border-blue-500 rounded-xl text-blue-900 text-xs leading-relaxed font-semibold">
                    اترك رقم هاتفك، وسيقوم مستشار القبول والتسجيل بالاتصال بك خلال ساعة واحدة لشرح المصروفات الدراسية وإجراءات حجز التجنيد.
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">الاسم الكريم (اختياري):</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-navy/15 focus:outline-none focus:border-brand-navy text-xs text-right text-slate-800"
                      placeholder="مثال: الطالب محمد السيد"
                      value={cbName}
                      onChange={(e) => setCbName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      رقم الهاتف / واتساب للتواصل المعتمد: <span className="text-brand-coral">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-navy/15 focus:outline-none focus:border-brand-navy text-xs text-right font-bold text-slate-800"
                      placeholder="مثال: 01012345678"
                      value={cbPhone}
                      onChange={(e) => setCbPhone(e.target.value)}
                    />
                  </div>

                  {cbError && (
                    <p className="text-xs text-red-650 font-bold bg-red-50 p-2.5 rounded-lg border border-red-200">
                      {cbError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={cbLoading}
                    className="w-full py-3 bg-brand-coral hover:bg-brand-coral/95 text-white text-xs font-extrabold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    style={{ minHeight: "44px" }}
                  >
                    {cbLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>جاري طلب الاتصال بك...</span>
                      </>
                    ) : (
                      <>
                        <PhoneCall className="w-4 h-4 animate-pulse" />
                        <span>اطلب اتصالاً من مستشار التسجيل الآن 📱</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="text-center py-6 space-y-4 animate-fade-in text-right">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Check className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5 text-center">
                    <h5 className="font-extrabold text-sm text-slate-900">تم تسجيل طلب الاتصال بنجاح! 🎉</h5>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                      سيقوم مستشار القبول الهاتفي والتسجيل بالاتصال بك قريباً جداً على الرقم الذي حددته لإكمال الموقف القانوني والخصم.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setCbSuccess(false);
                      setIsCallbackModalOpen(false);
                    }}
                    className="w-full py-2.5 bg-slate-900 text-white rounded-lg text-xs font-bold transition hover:bg-slate-800 inline-block text-center mt-3 cursor-pointer"
                  >
                    موافق، الرجوع للموقع
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}


      {/* ==================== 3. FLOATING CIRCULAR PHONE ICON TRIGGER ==================== */}
      <div className="fixed bottom-6 left-6 z-40 flex flex-col items-center gap-2">
        <span className="bg-brand-navy hover:bg-brand-navy/95 border border-white/10 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg block animate-pulse select-none text-center">
          📱 اطلب اتصالا فوريا
        </span>
        <button
          onClick={() => {
            setCbSuccess(false);
            setCbError(null);
            setIsCallbackModalOpen(true);
          }}
          className="w-14 h-14 bg-gradient-to-tr from-brand-coral to-red-500 hover:scale-105 hover:rotate-6 text-white rounded-full flex items-center justify-center shadow-2xl transition-all cursor-pointer relative animate-bounce border-2 border-white focus:outline-none"
          title="اطلب مكالمة من مستشار التسجيل"
          id="global-floating-phone-callback"
        >
          <PhoneCall className="w-6 h-6 animate-pulse" />
          
          {/* Soft small tag next to the circle */}
          <span className="absolute -top-1.5 -right-1.5 bg-brand-gold text-brand-navy text-[9px] font-extrabold rounded-full w-5 h-5 flex items-center justify-center border border-white">
            متاح
          </span>
        </button>
      </div>

      {/* Real-time Toast Notifications container */}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-[120] flex flex-col gap-3 max-w-sm w-full p-4 pointer-events-none" dir="rtl">
          {toasts.map((toast) => (
            <div 
              key={toast.id}
              className={`p-4 rounded-2xl shadow-2xl border text-right pointer-events-auto animate-scale-up flex flex-col gap-1.5 transition-all duration-300 relative overflow-hidden bg-slate-900 text-white border-slate-800`}
            >
              {/* Highlight background shine */}
              <div className="absolute top-0 right-0 w-2 h-full bg-amber-500" />
              
              <div className="flex items-start justify-between gap-3 font-sans pr-2">
                <div className="text-xs font-medium space-y-1">
                  <p className="font-extrabold text-[12.5px] leading-relaxed text-slate-100">
                    {toast.message}
                  </p>
                  <span className="text-[9px] text-slate-400 font-mono inline-block">
                    تم الاستلام: {toast.time}
                  </span>
                </div>
                <button
                  onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                  className="text-slate-400 hover:text-white shrink-0 p-1 bg-white/5 hover:bg-white/10 rounded-lg transition text-xs cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

