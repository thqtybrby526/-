import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ACADEMY_DEPARTMENTS, Department } from "../data";
import { Check, Loader2, Sparkles, AlertCircle, Ticket, Calendar, Phone, GraduationCap, X, FileCheck, ArrowLeft, User, MessageCircle, MapPin } from "lucide-react";

interface StudentBookingFormProps {
  preselectedDepts: string[];
}

const EGYPT_GOVERNORATES = [
  "القاهرة",
  "الجيزة",
  "الإسكندرية",
  "الدقهلية",
  "البحر الأحمر",
  "البحيرة",
  "الفيوم",
  "الغربية",
  "الإسماعيلية",
  "المنوفية",
  "المنيا",
  "القليوبية",
  "الوادي الجديد",
  "السويس",
  "الشرقية",
  "دمياط",
  "بني سويف",
  "بورسعيد",
  "جنوب سيناء",
  "قنا",
  "كفر الشيخ",
  "مطروح",
  "الأقصر",
  "أسوان",
  "أسيوط",
  "سوهاج",
  "شمال سيناء"
].sort();

export function StudentBookingForm({ preselectedDepts }: StudentBookingFormProps) {
  const navigate = useNavigate();
  
  const [seatsCount, setSeatsCount] = useState(() => Math.floor(Math.random() * 4) + 6); // Starts at random 6 to 9
  const [commitmentSliderVal, setCommitmentSliderVal] = useState(0);

  useEffect(() => {
    // Dynamic countdown timer of remaining seats (decrement every 45 to 60 seconds until 3 seats, then lock)
    const minTime = 45000;
    const maxTime = 60000;
    const getRandomTime = () => Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;

    let timerId: any;
    const runCountdown = () => {
      timerId = setTimeout(() => {
        setSeatsCount((prev) => {
          if (prev <= 3) return 3;
          return prev - 1;
        });
        runCountdown();
      }, getRandomTime());
    };

    runCountdown();
    return () => clearTimeout(timerId);
  }, []);

  const getScarcitySeats = (gov: string) => {
    if (!gov) return 7;
    const hash = gov.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (hash % 5) + 3; // Guaranteed 3, 4, 5, 6, 7 (always below 8)
  };

  const [studentName, setStudentName] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("academy_draft_studentName") || "";
    }
    return "";
  });
  const [phoneNumber, setPhoneNumber] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("academy_draft_phoneNumber") || "";
    }
    return "";
  });
  const [whatsappNumber, setWhatsappNumber] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("academy_draft_whatsappNumber") || "";
    }
    return "";
  });
  const [graduationYear, setGraduationYear] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("academy_draft_graduationYear") || "";
    }
    return "";
  });
  const [governorate, setGovernorate] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("academy_draft_governorate") || "";
    }
    return "";
  });
  const [educationLevel, setEducationLevel] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("academy_draft_educationLevel") || "ثانوية عامة";
    }
    return "ثانوية عامة";
  });
  const [selectedDepts, setSelectedDepts] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("academy_draft_selectedDepts");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return [];
        }
      }
    }
    return [];
  });
  const [notes, setNotes] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("academy_draft_notes") || "";
    }
    return "";
  });
  const [basicCourse, setBasicCourse] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("academy_draft_basicCourse") || "دورة أكتوبر 2026 (الرئيسية)";
    }
    return "دورة أكتوبر 2026 (الرئيسية)";
  });
  const [wantsEquivalence, setWantsEquivalence] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("academy_draft_wantsEquivalence") === "1";
    }
    return false;
  });
  const [isConfirming, setIsConfirming] = useState(false);
  
  const [complianceChecked, setComplianceChecked] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<any | null>(null);

  // Auto-save form inputs live to localStorage as draft
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("academy_draft_studentName", studentName);
      localStorage.setItem("academy_draft_phoneNumber", phoneNumber);
      localStorage.setItem("academy_draft_whatsappNumber", whatsappNumber);
      localStorage.setItem("academy_draft_graduationYear", graduationYear);
      localStorage.setItem("academy_draft_governorate", governorate);
      localStorage.setItem("academy_draft_educationLevel", educationLevel);
      localStorage.setItem("academy_draft_selectedDepts", JSON.stringify(selectedDepts));
      localStorage.setItem("academy_draft_notes", notes);
      localStorage.setItem("academy_draft_basicCourse", basicCourse);
      localStorage.setItem("academy_draft_wantsEquivalence", wantsEquivalence ? "1" : "0");
    }
  }, [
    studentName,
    phoneNumber,
    whatsappNumber,
    graduationYear,
    governorate,
    educationLevel,
    selectedDepts,
    notes,
    basicCourse,
    wantsEquivalence,
  ]);

  // Sync selected departments when clicked/preselected from other tabs or widgets
  useEffect(() => {
    if (preselectedDepts && preselectedDepts.length > 0) {
      // Add or merge them
      setSelectedDepts(prev => {
        const union = new Set([...prev, ...preselectedDepts]);
        return Array.from(union);
      });
    }
  }, [preselectedDepts]);

  const handleToggleDept = (deptId: string) => {
    setSelectedDepts(prev => {
      if (prev.includes(deptId)) {
        return prev.filter(id => id !== deptId);
      } else {
        return [...prev, deptId];
      }
    });
  };

  const handleDeselectAll = () => {
    setSelectedDepts([]);
  };

  const isPhoneValid = (num: string) => {
    return num.length === 11 && /^(010|011|012|015)/.test(num);
  };

  const handlePhoneChange = (val: string) => {
    const clean = val.replace(/\D/g, "");
    if (clean.length <= 11) {
      setPhoneNumber(clean);
    }
  };

  const handleWhatsappChange = (val: string) => {
    const clean = val.replace(/\D/g, "");
    if (clean.length <= 11) {
      setWhatsappNumber(clean);
    }
  };

  // Live progress calculated smoothly
  const getProgressPercentage = () => {
    let score = 0;
    
    // Name (at least 4 words)
    const nameWords = studentName.trim().split(/\s+/).filter(Boolean);
    if (nameWords.length >= 4) {
      score += 25;
    } else if (nameWords.length > 0) {
      score += Math.min(20, (nameWords.length / 4) * 20);
    }

    // Phone (11 digits, starts with 010,011,012,015)
    if (isPhoneValid(phoneNumber)) {
      score += 25;
    } else if (phoneNumber.length > 0) {
      score += Math.min(15, (phoneNumber.length / 11) * 15);
    }

    // Governorate
    if (governorate) {
      score += 15;
    }

    // Education Level (always set since it defaults to ثانوية عامة)
    if (educationLevel) {
      score += 15;
    }

    // Selected Depts (at least one check)
    if (selectedDepts.length > 0) {
      score += 20;
    }

    return Math.min(100, Math.round(score));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Legal compliance validation
    if (!complianceChecked) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setError("يرجى التكرم بالموافقة على إقرار شروط القبول أولاً للمتابعة");
      setTimeout(() => {
        const wrapperElem = document.getElementById("compliance-checkbox-wrapper");
        if (wrapperElem) {
          wrapperElem.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 50);
      return;
    }
    
    // Simple custom validation
    if (!studentName.trim()) {
      setError("الرجاء إدخال الاسم الرباعي بالكامل لتفعيل الحجز.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Require quadripartite name (at least 3 spaces / 4 words)
    const words = studentName.trim().split(/\s+/).filter(Boolean);
    if (words.length < 4) {
      setError("الرجاء إدخال الاسم الرباعي بالكامل لضمان تماشي البيانات مع الملفات والمستندات الرسمية .");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!phoneNumber.trim()) {
      setError("الرجاء إدخال رقم الهاتف للتواصل معكم.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!isPhoneValid(phoneNumber)) {
      setError("الرجاء إدخال رقم هاتف مصري صحيح مكون من 11 رقماً ويبدأ بـ (010، 011، 012، 015).");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (whatsappNumber.trim() && !isPhoneValid(whatsappNumber)) {
      setError("الرجاء إدخال رقم واتساب مصري صحيح مكون من 11 رقماً ويبدأ بـ (010، 011، 012، 015) أو تركه فارغاً.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setError(null);
    setIsConfirming(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFinalSubmit = async () => {
    setIsLoading(true);
    setError(null);

    // Get readable names of departments
    const readableDeptNames = selectedDepts.map(id => {
      return ACADEMY_DEPARTMENTS.find(d => d.id === id)?.name || id;
    });

    const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, "");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentName: studentName.trim(),
          phoneNumber: cleanPhone,
          whatsappNumber: whatsappNumber.trim(),
          graduationYear: graduationYear.trim(),
          governorate: governorate.trim(),
          educationLevel,
          basicCourse,
          wantsEquivalence,
          selectedDepartments: readableDeptNames,
          notes,
          complianceLevelChecked: true,
          consentTimestamp: new Date().toISOString(),
        }),
      });

// الحماية من الخطأ الأعمى: التحقق من نوع الاستجابة قبل التحويل
      let data: any = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const textError = await response.text();
        throw new Error(`السيرفر واجه مشكلة ورجع استجابة نصية (كود: ${response.status}). تفاصيل: ${textError.substring(0, 120)}`);
      }

      if (!response.ok) {
        if (data.supabaseError) {
          throw new Error(`${data.error} (تفاصيل: ${data.supabaseError.message || ""} - الرمز: ${data.supabaseError.code || ""})`);
        }
        throw new Error(data.error || "عذراً، فشل تسجيل الطلب.");
      }

      // 1. Send Google Sheets Structured Payload Webhook URL
      const googleSheetsWebhook = ((import.meta as any).env && (import.meta as any).env.VITE_GOOGLE_SHEETS_WEBHOOK) || "https://script.google.com/macros/s/AKfycby-mock-google-sheets-webhook-url-mamdouh/exec";
      const sheetPayload = {
        fullName: studentName.trim(),
        phoneNumber: cleanPhone,
        whatsappNumber: whatsappNumber.trim() || cleanPhone,
        governorate: governorate.trim() || "غير محدد",
        courseName: basicCourse,
        graduationYear: graduationYear.trim() || "غير محدد",
        timestamp: new Date().toISOString()
      };

      try {
        await fetch(googleSheetsWebhook, {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(sheetPayload)
        });
        console.log("Structured Google Sheets payload sent successfully", sheetPayload);
      } catch (sheetsError) {
        console.warn("Failed to ping direct Google Sheets Webhook directly", sheetsError);
      }

      // 2. Automated Trigger Simulation mirroring Gmail API Transaction setup
      const reservation = data.reservation || { reservationCode: "REG-2026-MOCK" };
      const mailPayload = {
        sender: "admissions@am-group-academy.com",
        recipient: `${cleanPhone}@sms-or-mail.com`,
        subject: `تم تأكيد حجز مقعدك بالأكاديمية بنجاح لدفعة 2026 🎓 | كود الحجز: ${reservation.reservationCode}`,
        bodyTemplate: `
          أهلاً بك يا ${studentName.trim()}،
          يسعدنا في (الأكاديمية - AM Group) أن نهنئك بقبول طلبك وتأكيد حجز مقعدك الدراسي المبدئي بنجاح لعام ٢٠٢٦!
          
          تفاصيل الحجز المؤكدة:
          - كود التسجيل الفريد الخاص بك: ${reservation.reservationCode}
          - رقم الهاتف المسجل لدينا: ${cleanPhone}
          - الدورة المعتمدة: ${basicCourse}
          - المحافظة: ${governorate.trim() || "غير محدد"}
          
          برجاء الاحتفاظ بكود الحجز لسرعة مراجعة ملفك في أقرب فرع للأكاديمية وتوفير الأوراق الرسمية المحددة بالدليل لتثبيت القبول النهائي.
          
          مع أطيب الأمنيات بالتفوق والنجاح الباهر،
          إدارة الاستشارات والقبول - (المعاهد والأكاديميات الخاصة) للدراسات المهنية التدريبية
        `
      };

      try {
        await fetch("/api/simulate-gmail-trigger", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(mailPayload)
        });
        console.log("Mock Gmail transactional API SMTP trigger executed successfully.");
      } catch (gmailErr) {
        console.warn("Mock Gmail API outbound delivery failed", gmailErr);
      }

      // Save success result first for fallback view, then redirect
      setSuccessResult(data.reservation);
      if (typeof window !== "undefined") {
        const reservationWithCompliance = {
          ...(data.reservation || {}),
          complianceLevelChecked: true,
          consentTimestamp: new Date().toISOString()
        };
        localStorage.setItem("last_success_reservation", JSON.stringify(reservationWithCompliance));

        // Maintain student local registration list with compliance parameter
        const studentHistory = JSON.parse(localStorage.getItem("academy_student_reservations") || "[]");
        studentHistory.push({
          id: "res-" + Date.now(),
          studentName: studentName.trim(),
          phoneNumber: cleanPhone,
          complianceLevelChecked: true,
          consentTimestamp: new Date().toISOString(),
          reservationCode: data.reservation?.reservationCode || "REG-2026",
        });
        localStorage.setItem("academy_student_reservations", JSON.stringify(studentHistory));

        // Add to active direct geo-registration list for live ticker propagation
        const directLeads = JSON.parse(localStorage.getItem("academy_direct_leads") || "[]");
        directLeads.unshift({
          studentName: studentName.trim(),
          governorate: governorate.trim() || "غير محدد",
          timestamp: new Date().toISOString()
        });
        localStorage.setItem("academy_direct_leads", JSON.stringify(directLeads.slice(0, 30)));
        window.dispatchEvent(new Event("academy_leads_updated"));
        window.dispatchEvent(new StorageEvent("storage", { key: "academy_direct_leads", newValue: JSON.stringify(directLeads.slice(0, 30)) }));
      }
      
      // Clear localStorage draft on success
      if (typeof window !== "undefined") {
        localStorage.removeItem("academy_draft_studentName");
        localStorage.removeItem("academy_draft_phoneNumber");
        localStorage.removeItem("academy_draft_whatsappNumber");
        localStorage.removeItem("academy_draft_graduationYear");
        localStorage.removeItem("academy_draft_governorate");
        localStorage.removeItem("academy_draft_educationLevel");
        localStorage.removeItem("academy_draft_selectedDepts");
        localStorage.removeItem("academy_draft_notes");
        localStorage.removeItem("academy_draft_basicCourse");
        localStorage.removeItem("academy_draft_wantsEquivalence");
      }

      // Reset form fields
      setStudentName("");
      setPhoneNumber("");
      setWhatsappNumber("");
      setGraduationYear("");
      setGovernorate("");
      setNotes("");
      setSelectedDepts([]);
      setWantsEquivalence(false);
      setIsConfirming(false);

      toast.success("✓ تم حجز مقعدك بنجاح للعام الدراسي 2026!");

      // Programmatic router navigation redirect
      navigate("/thank-you", { state: { reservation: data.reservation } });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "عذراً، فشل حجز المقعد! يرجى التحقق وإعادة المحاولة.");
      setError(err.message || "عذراً، حدث خطأ أثناء الاتصال بالخادم المركزي، حاول مرة أخرى.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs" id="booking-form-wrapper" dir="rtl">
      {/* Top Banner accent depicting identity colors */}
      <div className="h-2 bg-gradient-to-r from-brand-coral via-brand-navy to-brand-turquoise"></div>

      {!successResult ? (
        isConfirming ? (
          <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-lg z-[99999] flex items-center justify-center p-3 sm:p-5 overflow-y-auto" dir="rtl">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border-4 border-amber-500 overflow-hidden my-auto animate-scale-up">
              
              {/* Highlight Alert Header so it represents an intermediate review state */}
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="w-5.5 h-5.5 text-white animate-bounce shrink-0" />
                  <span className="font-sans font-black text-xs sm:text-sm tracking-wide text-white">⚠️ خطوة أخيرة هامة للغاية لإتمام حجزك!</span>
                </div>
                <div className="bg-amber-700/60 px-3 py-1 rounded-full text-[10px] font-bold">بانتظار تأكيدك ⏳</div>
              </div>

              <div className="p-5 sm:p-7 space-y-5">
                {/* Header */}
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="w-11 h-11 bg-indigo-50 text-indigo-700 rounded-xl flex items-center justify-center shrink-0">
                    <FileCheck className="w-5.5 h-5.5 text-indigo-700" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-md sm:text-lg text-slate-900 font-sans leading-snug">مراجعة والتحقق من بيانات الحجز المبدئي 📑</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">يرجى مراجعة كافة البيانات والتحقق من صحتها وتعديلها إذا لزم الأمر قبل الإرسال النهائي</p>
                  </div>
                </div>

                {/* Blinking Critical Alert Prompt */}
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-center space-y-1">
                  <p className="text-xs font-black text-red-700 animate-pulse">📢 تنبيه هام: لم يتم إرسال البيانات حتى الآن!</p>
                  <p className="text-[11px] text-slate-650 font-semibold leading-relaxed">
                    من فضلك، لا تغلق هذه الصفحة حالياً. يجب الضغط على الزر الأخضر بالأسفل لتفعيل حجز المقعد وضمان تفعيل الكود الخاص بك بالمنظومة التدريبية.
                  </p>
                </div>

                {/* Warning alert */}
                <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/40 text-xs text-slate-700 leading-relaxed font-semibold">
                  ⚠️ "برجاء مراجعة البيانات وتطابقها مع الهوية الشخصية وشهادة التخرج بدقة، حيث يتم فحص الملفات من قِبل إدارة القبول والتسجيل لتأكيد الترشيح النهائي لدفعة 2026.".
                </div>

                {/* Verification Table */}
                <div className="border border-slate-200 rounded-2xl bg-slate-50 overflow-hidden divide-y divide-slate-150 text-sm">
                  <div className="grid grid-cols-3 p-3.5 bg-white">
                    <span className="text-slate-400 font-bold col-span-1 border-l border-slate-100 pl-2">الاسم الرباعي:</span>
                    <span className="text-slate-900 font-extrabold col-span-2 text-right">{studentName}</span>
                  </div>
                  
                  <div className="grid grid-cols-3 p-3.5 bg-white/40">
                    <span className="text-slate-400 font-bold col-span-1 border-l border-slate-100 pl-2">رقم الهاتف:</span>
                    <strong className="text-slate-900 font-bold col-span-2 text-right font-mono">{phoneNumber}</strong>
                  </div>

                  {whatsappNumber && (
                    <div className="grid grid-cols-3 p-3.5 bg-white">
                      <span className="text-slate-400 font-bold col-span-1 border-l border-slate-100 pl-2">رقم واتساب:</span>
                      <strong className="text-slate-900 font-bold col-span-2 text-right font-mono">{whatsappNumber}</strong>
                    </div>
                  )}

                  <div className="grid grid-cols-3 p-3.5 bg-white/40">
                    <span className="text-slate-400 font-bold col-span-1 border-l border-slate-100 pl-2">الدورة الأساسية:</span>
                    <strong className="text-brand-navy font-extrabold col-span-2 text-right text-emerald-800">{basicCourse}</strong>
                  </div>

                  <div className="grid grid-cols-3 p-3.5 bg-white">
                    <span className="text-slate-400 font-bold col-span-1 border-l border-slate-100 pl-2">المؤهل الدراسي:</span>
                    <span className="text-slate-800 font-bold col-span-2 text-right">{educationLevel}</span>
                  </div>

                  {(governorate || graduationYear) && (
                    <div className="grid grid-cols-3 p-3.5 bg-white/40">
                      <span className="text-slate-400 font-bold col-span-1 border-l border-slate-100 pl-2">المحافظة / الدفعة:</span>
                      <span className="text-slate-800 font-bold col-span-2 text-right">
                        {governorate || "غير محدد"} / {graduationYear || "غير محدد"}
                      </span>
                    </div>
                  )}

                  <div className="p-3.5 bg-white space-y-2">
                    <span className="text-slate-400 font-bold block text-xs">الأقسام والخدمات المهتم بها للتسجيل:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedDepts.length > 0 ? (
                        selectedDepts.map(id => {
                          const name = ACADEMY_DEPARTMENTS.find(d => d.id === id)?.name || id;
                          return (
                            <span key={id} className="text-[10px] font-extrabold text-brand-navy bg-brand-navy/5 px-2.5 py-1.5 rounded-lg border border-brand-navy/10">
                              {name}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-xs text-rose-500 font-bold">⚠️ لم تقم باختيار أي قسم، سيتم توجيهك بواسطة مستشار القبول</span>
                      )}
                    </div>
                  </div>

                  {notes.trim() && (
                    <div className="p-3.5 bg-white/40 leading-relaxed text-xs">
                      <span className="text-slate-400 font-bold block mb-1">الأسئلة والملاحظات المضافة:</span>
                      <p className="text-slate-700 font-medium">"{notes}"</p>
                    </div>
                  )}
                </div>

                {error && (
                  <p className="text-xs text-rose-650 font-bold bg-white border border-rose-200 p-3 rounded-xl animate-pulse">
                    ❌ {error}
                  </p>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleFinalSubmit}
                    disabled={isLoading}
                    className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl transition flex items-center justify-center gap-2 shadow-md cursor-pointer text-sm"
                    style={{ minHeight: "44px" }}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>جاري إرسال وتأكيد البيانات...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5 text-brand-gold shrink-0 animate-bounce" />
                        <span>تأكيد البيانات وإرسال وتفعيل حجزك المبدئي 🚀</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirming(false)}
                    disabled={isLoading}
                    className="py-4 px-6 bg-slate-150 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer text-center text-xs"
                    style={{ minHeight: "44px" }}
                  >
                    تعديل البيانات ✏️
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Unsubmitted Form view */
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-coral to-brand-coral/80 text-white rounded-xl flex items-center justify-center shrink-0">
                <Ticket className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-extrabold text-xl text-slate-900 font-sans">تفعيل حجز مقعد وحفظ الخصم الدراسي 🎟️</h3>
                <p className="text-xs text-slate-500">سجل بياناتك المبدئية الآن لحفظ مقعدك وتثبيت الخصم المتاح لفترة محدودة</p>
              </div>
            </div>

            {/* Guidelines on Discounts and Limitations */}
            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-start gap-3">
              <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 space-y-1">
                <p className="font-bold text-emerald-800">تفاصيل الخصومات المتاحة حالياً:</p>
                <p>تمنح الأكاديمية خصومات دورية متغيرة ومحدودة على الملحقات والمصروفات الدراسية. تواصل مع مندوب القبول لتأكيد النسبة الفعلية المحددة لدفعتك والتفاصيل المالية الشاملة لشهادتك.</p>
              </div>
            </div>

            {/* Dynamic Scarcity Seat Counter with red/amber pulse indicators */}
            <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl flex items-start sm:items-center gap-3" id="scarcity-seats-banner">
              <span className="relative flex h-3 w-3 mt-1 sm:mt-0 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
              </span>
              <div className="text-xs font-black text-red-700 leading-relaxed text-right">
                تنبيه: متبقي {getScarcitySeats(governorate)} مقاعد فقط لشعبة تكنولوجيا الحاسبات والمختبرات في {governorate ? `محافظة ${governorate}` : "محافظتك"} لدفعة 2026!
              </div>
            </div>

            {/* Strategic Conversion Progress Indicator */}
            {(() => {
              const progress = getProgressPercentage();
              const nameWordsCount = studentName.trim().split(/\s+/).filter(Boolean).length;
              const hasValidName = nameWordsCount >= 4;
              const hasValidPhone = isPhoneValid(phoneNumber);
              return (
                <div className="p-5 bg-gradient-to-br from-indigo-50/40 to-slate-50 border border-slate-200/80 rounded-2xl space-y-3" id="student-booking-progress">
                  <div className="flex items-center justify-between text-xs sm:text-sm font-black text-slate-705">
                    <span className="flex items-center gap-1.5 text-slate-700">
                      <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                      <span>مؤشر جدية ونسبة القبول المبدئي للطلب (Smart Eligibility Scoring):</span>
                    </span>
                    <strong className={`font-mono text-base ${progress >= 95 ? 'text-emerald-600 animate-bounce' : 'text-indigo-600'}`}>
                      {progress >= 100 ? 95 : Math.round(progress)}%
                    </strong>
                  </div>

                  {/* Simple sleek progress bar container with dynamic status text based on input scoring */}
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        progress >= 80 ? "bg-emerald-500" : progress >= 50 ? "bg-[#0A2463]" : "bg-amber-500"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <span className="font-bold flex items-center gap-1">
                      {progress >= 95 ? (
                        <span className="text-emerald-600 font-extrabold flex items-center gap-0.5">🔒 القبول المبدئي مكتمل بنسبة {Math.round(progress)}%!</span>
                      ) : progress >= 60 ? (
                        <span className="text-indigo-600 font-extrabold">🚀 نسبة ممتازة - أكمل كتابة بياناتك للتأمين</span>
                      ) : (
                        <span className="text-amber-600 font-extrabold">⚠️ تتبقى بيانات التواصل لإتمام دراسة الملف</span>
                      )}
                    </span>
                    <span className="font-mono text-[9px] text-slate-400">نظام تقييم الجدية الذكي v2026</span>
                  </div>
                </div>
              );
            })()}

          {/* Form Fields Grid */}
          <div className="space-y-4">
            {/* Name Input */}
            <div>
              <label htmlFor="student-name-input" className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-amber-600" />
                <span>الاسم الرباعي بالكامل: <span className="text-brand-coral">*</span></span>
              </label>
              <input
                id="student-name-input"
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="اكتب اسمك الرباعي بالكامل كما هو بالبطاقة الشخصية أو شهادة الميلاد"
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition text-right font-extrabold"
              />
              {(() => {
                const currentNameWords = studentName.trim().split(/\s+/).filter(Boolean);
                const showLiveNameWarning = studentName.trim().length > 0 && currentNameWords.length > 0 && currentNameWords.length < 4;
                if (!showLiveNameWarning) return null;
                return (
                  <div className="mt-2 p-3 bg-amber-50 border-r-4 border-amber-600 rounded-r-lg text-amber-955 text-xs flex items-start gap-2 animate-bounce-short" id="live-name-warning-badge">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
                    <div className="text-right">
                      <p className="font-extrabold text-amber-955">⚠️ تنبيه: مطلوب الاسم رباعي بالكامل!</p>
                      <p className="mt-0.5 text-[11px] text-amber-800 leading-normal">
                        لقد قمت بكتابة اسم {currentNameWords.length === 1 ? "منفرد" : currentNameWords.length === 2 ? "ثنائي" : "ثلاثي"} فقط ({currentNameWords.length} من أصل 4 كلمات). لضمان قبول ملفك معنا، يجب كتابة اسمك رباعياً كاملاً.
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Phone and WhatsApp row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="student-phone-input" className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>رقم الهاتف للتواصل: <span className="text-brand-coral">*</span></span>
                </label>
                <div className="relative">
                  <input
                    id="student-phone-input"
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="مثال: 010XXXXXXXX"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition text-right font-mono font-extrabold"
                  />
                  {isPhoneValid(phoneNumber) && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-emerald-600 bg-emerald-50 p-1 rounded-full border border-emerald-200 animate-scale-up" title="رقم صحيح">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="student-whatsapp-input" className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-teal-600" />
                  <span>رقم واتساب للتواصل الفوري: <span className="text-slate-400 text-xs">(اختياري)</span></span>
                </label>
                <div className="relative">
                  <input
                    id="student-whatsapp-input"
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => handleWhatsappChange(e.target.value)}
                    placeholder="مثال: 011XXXXXXXX"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition text-right font-mono font-extrabold"
                  />
                  {isPhoneValid(whatsappNumber) && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-emerald-600 bg-emerald-50 p-1 rounded-full border border-emerald-200 animate-scale-up" title="رقم صحيح">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Governorate and Graduation Year row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="student-gov-input" className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-indigo-500" />
                  <span>المحافظــــــــــــــة: <span className="text-slate-400 text-xs">(اختياري)</span></span>
                </label>
                <select
                  id="student-gov-input"
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition text-right cursor-pointer font-extrabold font-sans"
                >
                  <option value="" className="font-extrabold text-slate-900">اختر محافظتك من القائمة... (اختياري)</option>
                  {EGYPT_GOVERNORATES.map((gov) => (
                    <option key={gov} value={gov} className="font-extrabold text-slate-900">
                      {gov}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="student-grad-input" className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-500" />
                  <span>سنـــة التخرج: <span className="text-slate-400 text-xs">(اختياري)</span></span>
                </label>
                <input
                  id="student-grad-input"
                  type="text"
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  placeholder="مثال: 2024 أو 2025"
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition text-right font-extrabold"
                />
              </div>
            </div>

            {/* Current Education Level */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-blue-500" />
                <span>المستند أو المؤهل الدراسي الحالي للتقديم:</span>
              </label>
              <select
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition cursor-pointer font-extrabold"
                id="student-education-select"
              >
                <option value="ثانوية عامة" className="font-extrabold text-slate-900">طالب ثانوية عامة (أو معادلها)</option>
                <option value="ثانوية أزهرية" className="font-extrabold text-slate-900">طالب ثانوية أزهرية</option>
                <option value="دبلوم فني صناعي" className="font-extrabold text-slate-900">طالب دبلوم فني صناعي</option>
                <option value="دبلوم فني تجاري" className="font-extrabold text-slate-900">طالب دبلوم فني تجاري</option>
                <option value="دبلوم فني زراعي" className="font-extrabold text-slate-900">طالب دبلوم فني زراعي</option>
                <option value="دبلوم صحي أو فني أخر" className="font-extrabold text-slate-900">دبلوم فني أو صحي أخر</option>
                <option value="خريج أو راغب في تغيير المسار المهني" className="font-extrabold text-slate-900">خريج راغب في تغيير المسار المهني</option>
              </select>
            </div>

            {/* Basic Course Selection (الدورة الأساسية للتقديم) */}
            <div>
              <label htmlFor="student-course-select" className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand-gold animate-pulse" />
                <span>الدورة الأساسية للتقديم (الدفعة والموعد الدراسي):</span>
              </label>
              <select
                id="student-course-select"
                value={basicCourse}
                onChange={(e) => setBasicCourse(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition cursor-pointer font-extrabold"
              >
                <option value="دورة أكتوبر 2026 (الرئيسية)" className="font-extrabold text-slate-900">دورة أكتوبر 2026 (الدفعة الرئيسية - احجز مقعدك الآن)</option>
                <option value="دورة يناير 2027" className="font-extrabold text-slate-900">دورة يناير 2027 (الدفعة الشتوية)</option>
                <option value="دورة مارس 2027" className="font-extrabold text-slate-900">دورة مارس 2027 (الفصل الدراسي الثاني)</option>
                <option value="دورة مايو 2027" className="font-extrabold text-slate-900">دورة مايو 2027 (التقديم الصيفي المبكر)</option>
              </select>
            </div>

            {/* Select Interested Departments (Multi Select tags style) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-700">الأقسام التي تود الاستفسار والتسجيل بها:</span>
                {selectedDepts.length > 0 && (
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    className="text-xs text-slate-400 hover:text-brand-coral transition"
                    id="deselect-all-btn"
                  >
                    إلغاء التحديد بالكامل
                  </button>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2" id="form-dept-tags">
                {ACADEMY_DEPARTMENTS.map((dept) => {
                  const isChecked = selectedDepts.includes(dept.id);
                  return (
                    <button
                      key={dept.id}
                      type="button"
                      onClick={() => handleToggleDept(dept.id)}
                      className={`text-xs px-3.5 py-2 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                        isChecked
                          ? "bg-brand-navy text-white border-brand-navy font-bold shadow-xs"
                          : "bg-white text-slate-800 border-slate-300 hover:border-slate-450 font-extrabold"
                      }`}
                      id={`form-dept-tag-${dept.id}`}
                    >
                      <span>{dept.name}</span>
                      {isChecked ? <X className="w-3.5 h-3.5" /> : <span className="text-slate-400 font-mono font-bold">+</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Notes */}
            <div>
              <label htmlFor="notes-textarea" className="block text-sm font-bold text-slate-700 mb-1.5">
                ملاحظات أو أسئلة خاصة تود توجيهها للقبول والتسجيل (اختياري):
              </label>
              <textarea
                id="notes-textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="اكتب أسئلتك بخصوص المصاريف الدراسية، أوراق التقديم، مواعيد المحاضرات، إلخ..."
                className="w-full p-4 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition text-right resize-none h-24 font-extrabold"
              />
            </div>
            {/* Legal Compliance Checkbox */}
            <div 
              className={`p-4 rounded-xl border transition-all ${
                !complianceChecked 
                  ? "bg-rose-50 border-r-4 border-r-rose-500 border-rose-200" 
                  : "bg-emerald-500/5 border-r-4 border-r-emerald-500 border-emerald-500/20"
              }`}
              id="compliance-checkbox-wrapper"
            >
              <label className="flex items-start gap-3 cursor-pointer select-none text-right">
                <input
                  type="checkbox"
                  required
                  checked={complianceChecked}
                  onChange={(e) => {
                    setComplianceChecked(e.target.checked);
                    if (e.target.checked) setError(null);
                  }}
                  className="mt-1 w-5 h-5 accent-emerald-600 rounded-sm cursor-pointer shrink-0"
                  id="compliance-checkbox-input"
                />
                <span className="text-xs font-extrabold leading-relaxed text-slate-900">
                  ☑️ أقر بصفتي المتقدم بالطلب بصحة كافة البيانات المدونة أعلاه والموافقة الكاملة علي شروط واحكام بوابة القبول ؛ وأعلم ان هذا الحجز مبدئي لحين مراجعة الملف وتأكيده بعد التواصل معي لشرح كافة التفاصيل 🤝🏻 .
                </span>
              </label>
            </div>

            {/* Dynamic Urgency Seat Ticker (FOMO) */}
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-center animate-pulse" id="urgency-seats-ticker">
              <span className="text-xs font-black text-amber-950 block leading-relaxed">
                ⚠️ تنبيه: متبقي ({seatsCount}) مقاعد فقط متاحة للقبول المباشر في هذه الشعبة لهذا الأسبوع!
              </span>
            </div>

            {/* Smart Commitment Slider */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2" id="family-commitment-slider">
              <label htmlFor="student-commitment-slider" className="block text-xs font-extrabold text-slate-800 text-right">
                👉 اسحب الزر لتأكيد جديتك ورغبتك الفعالة في حجز المقعد المهني:
              </label>
              <div className="flex items-center gap-4">
                <input
                  id="student-commitment-slider"
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={commitmentSliderVal}
                  onChange={(e) => setCommitmentSliderVal(Number(e.target.value))}
                  className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-coral"
                />
                <span className={`text-xs font-mono font-black py-1 px-2.5 rounded-lg shrink-0 ${commitmentSliderVal >= 100 ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-800"}`}>
                  {commitmentSliderVal}%
                </span>
              </div>
              {commitmentSliderVal < 100 && (
                <div className="text-[11px] font-bold text-red-650 text-right animate-pulse">
                  ⚠️ المؤشر مغلق - اسحب شريط الجدية إلى نسبة 100% ليفتح زر التثبيت
                </div>
              )}
            </div>
          </div>

          {/* Validation & Error Warning */}
          {error && (
            <div className="p-4 bg-red-50 border-r-4 border-red-500 rounded-xl text-red-800 text-sm flex items-center gap-2" id="booking-error">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {/* Action Trigger Button */}
          <button
            type="submit"
            disabled={isLoading || !complianceChecked || commitmentSliderVal < 100}
            className={`w-full py-4 rounded-xl font-extrabold text-white flex items-center justify-center gap-2 shadow-md transition cursor-pointer select-none text-base ${
              isShaking ? "animate-shake" : ""
            } ${
              isLoading 
                ? "bg-slate-400 cursor-not-allowed" 
                : (!complianceChecked || commitmentSliderVal < 100)
                ? "bg-slate-300 text-slate-500 cursor-not-allowed border border-slate-200"
                : "bg-brand-coral hover:bg-brand-coral/90 active:scale-98"
            }`}
            style={{ minHeight: "44px" }}
            id="submit-booking-btn"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>جاري ربط وحفظ الحجز المبدئي...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-brand-gold animate-bounce" />
                <span>تثبيت خصم وحفظ مقعد بالدفعة الجديدة</span>
              </>
            )}
          </button>
        </form>
        )
      ) : (
        /* Success Receipt View - Beautifully crafted interactive Ticket representation */
        <div className="p-6 md:p-8 space-y-6 text-center animate-fade-in" id="success-receipt-card">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 text-emerald-600" />
          </div>

          <div className="space-y-2">
            <h3 className="font-extrabold text-2xl text-slate-900 font-sans">
              تهانينا! تم تفعيل الحجز المبدئي بنجاح
            </h3>
            <p className="text-emerald-700 text-sm font-semibold">
              تم تثبيت أحقيتك في الخصومات المتاحة حالياً على حسابك الدراسي بالدفعة الجديدة
            </p>
          </div>

          {/* Realistic Visual Ticket Container */}
          <div className="border border-slate-200 rounded-2xl bg-slate-50/50 p-6 max-w-md mx-auto text-right relative overflow-hidden" id="ticket-visual">
            {/* Intersecting Ticket Punches visual overlay */}
            <div className="absolute top-1/2 -left-3 w-6 h-6 bg-white border border-slate-200 rounded-full -translate-y-1/2"></div>
            <div className="absolute top-1/2 -right-3 w-6 h-6 bg-white border border-slate-200 rounded-full -translate-y-1/2"></div>
            
            <div className="border-b border-dashed border-slate-200 pb-4 mb-4 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded-sm">
                كود حجز الأكاديمية
              </span>
              <span className="font-mono font-bold text-brand-navy tracking-widest text-lg">
                {successResult.reservationCode}
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-500 text-xs flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-amber-600" />
                  <span>اسم الطالب المسجل:</span>
                </span>
                <span className="font-extrabold text-slate-800">{successResult.studentName}</span>
              </div>

              <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-100 font-mono">
                <span className="text-slate-500 text-xs font-sans flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>رقم الهاتف المسجل:</span>
                </span>
                <strong className="text-slate-800">{successResult.phoneNumber}</strong>
              </div>

              {successResult.whatsappNumber && (
                <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-100 font-mono">
                  <span className="text-slate-500 text-xs font-sans flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5 text-teal-600" />
                    <span>رقم واتساب:</span>
                  </span>
                  <strong className="text-slate-800">{successResult.whatsappNumber}</strong>
                </div>
              )}

              {successResult.governorate && (
                <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-100">
                  <span className="text-slate-500 text-xs flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                    <span>المحافظــــــــــــــة:</span>
                  </span>
                  <span className="font-bold text-slate-700">{successResult.governorate}</span>
                </div>
              )}

              {successResult.graduationYear && (
                <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-100">
                  <span className="text-slate-500 text-xs flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    <span>سنـــة التخرج:</span>
                  </span>
                  <span className="font-bold text-slate-700">{successResult.graduationYear}</span>
                </div>
              )}

              <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-500 text-xs flex items-center gap-1">
                  <FileCheck className="w-3.5 h-3.5 text-blue-500" />
                  <span>المؤهل الدراسي:</span>
                </span>
                <span className="font-bold text-slate-700">{successResult.educationLevel}</span>
              </div>

              <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-500 text-xs flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-brand-gold shrink-0 animate-pulse" />
                  <span>الدورة الأساسية للتقديم:</span>
                </span>
                <span className="font-extrabold text-emerald-800">{successResult.basicCourse || "دورة أكتوبر 2026 (الرئيسية)"}</span>
              </div>

              {successResult.selectedDepartments && successResult.selectedDepartments.length > 0 && (
                <div className="bg-white p-2.5 rounded-lg border border-slate-100 space-y-1">
                  <span className="text-slate-500 text-xs block">الأقسام المهتم بها:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {successResult.selectedDepartments.map((deptName: string, idx: number) => (
                      <span key={idx} className="text-[10px] font-bold text-brand-navy bg-brand-navy/5 px-2 py-0.5 rounded-md border border-brand-navy/10">
                        {deptName}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-slate-150 flex justify-between items-center text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>تاريخ الحجز المبدئي:</span>
                </span>
                <span>{successResult.date}</span>
              </div>

              <div className="flex justify-between items-center text-[11px] text-brand-coral py-0.5">
                <span className="flex items-center gap-1 font-bold">
                  <AlertCircle className="w-3.5 h-3.5 animate-pulse" />
                  <span>انتهاء موعد تثبيت الخصم:</span>
                </span>
                <strong className="font-bold">{successResult.expiresAt}</strong>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-slate-500 text-xs max-w-sm mx-auto leading-relaxed">
              سيقوم أحد ممثلي قسم القبول والتسجيل بالتواصل معكم هاتفياً على الرقم المدون لاستكمال أوراق التقديم والإيداع والشروط وتأكيد نسبة الخصم النهائي.
            </p>

            <button
              onClick={() => setSuccessResult(null)}
              className="px-6 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5 mx-auto"
              style={{ minHeight: "44px" }}
              id="book-another-btn"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>الرجوع وتسجيل حجز آخر</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
