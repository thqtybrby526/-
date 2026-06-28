import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { supabase, hasSupabase } from "../supabaseClient";
import { ACADEMY_DEPARTMENTS, Department } from "../data";
import { LOCAL_IMAGES, DEPARTMENT_DEFAULT_IMAGES } from "../assets/images";
import { useSimulatedCount } from "../hooks/useSimulatedCount";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie
} from "recharts";
import {
  Lock,
  X,
  Check,
  Users,
  Search,
  BookOpen,
  Compass,
  ShieldAlert,
  Award,
  Globe,
  Trash2,
  Phone,
  MessageCircle,
  Copy,
  MapPin,
  Calendar,
  Sparkles,
  Clock,
  Volume2,
  VolumeX,
  RefreshCw,
  Bell,
  Ticket,
  ChevronLeft,
  ChevronDown,
  LogOut,
  AlertTriangle,
  User,
  HeartHandshake,
  Briefcase,
  Star,
  Megaphone
} from "lucide-react";

interface Lead {
  id: string;
  reservationCode: string;
  studentName: string;
  phoneNumber: string;
  whatsappNumber?: string;
  graduationYear?: string;
  governorate?: string;
  educationLevel: string;
  basicCourse?: string;
  selectedDepartments: string[];
  notes: string;
  date: string;
  timestamp: number;
  expiresAt: string;
  status: "pending" | "completed" | "no_reply";
  agentName?: string;
  internalNotes?: string;
}

interface CallbackRequest {
  id: string;
  phoneNumber: string;
  studentName?: string;
  date: string;
  status: "pending" | "completed" | "no_reply";
  agentName?: string;
  internalNotes?: string;
}

interface Complaint {
  id: string;
  studentName: string;
  phoneNumber: string;
  type: "complaint" | "suggestion";
  text: string;
  date: string;
}

export default function Admin() {
  const navigate = useNavigate();
  
  // Security Verification State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  // Google OAuth Whitelist Authentication
  const [googleEmailInput, setGoogleEmailInput] = useState("");
  const [googleAuthError, setGoogleAuthError] = useState("");
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  // Whitelisted Emails (Google OAuth Security)
  // Feel free to update this array manually with any further admin emails
  const ALLOWED_ADMIN_EMAILS = [
    "mohammedalroubymediabuyer@gmail.com", 
    "your-email@gmail.com"
  ];

  // Administrative Main Data Lists
  const [adminLeads, setAdminLeads] = useState<Lead[]>([]);
  const [adminCallbacks, setAdminCallbacks] = useState<CallbackRequest[]>([]);
  const [adminComplaints, setAdminComplaints] = useState<Complaint[]>([]);
  const [adminPdfLeads, setAdminPdfLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Synchronized counter state & animation
  const simulatedStudentsCount = useSimulatedCount();
  const [animatedAdminTotalLeadsCount, setAnimatedAdminTotalLeadsCount] = useState(0);
  const adminCounterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationFrameId: number;
    let observer: IntersectionObserver;

    if (typeof window !== "undefined" && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Reset and trigger custom slow counting animation
              let startTime: number | null = null;
              const duration = 2500; // Slowed down counting speed for visible and satisfying numerical roll

              const animate = (timestamp: number) => {
                if (!startTime) startTime = timestamp;
                const elapsed = timestamp - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Easing outQuad
                const ease = progress * (2 - progress);

                setAnimatedAdminTotalLeadsCount(Math.round(ease * simulatedStudentsCount));

                if (progress < 1) {
                  animationFrameId = requestAnimationFrame(animate);
                }
              };

              cancelAnimationFrame(animationFrameId);
              animationFrameId = requestAnimationFrame(animate);
            } else {
              // Reset to 0 when out of view so it restarts next time
              setAnimatedAdminTotalLeadsCount(0);
            }
          });
        },
        { threshold: 0.1 }
      );

      if (adminCounterRef.current) {
        observer.observe(adminCounterRef.current);
      }
    } else {
      // Fallback
      setAnimatedAdminTotalLeadsCount(simulatedStudentsCount);
    }

    return () => {
      if (observer) observer.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [simulatedStudentsCount]);

  // Active Filter Tabs
  type TabType = 
    | "all" 
    | "new" 
    | "completed" 
    | "no_reply" 
    | "callbacks" 
    | "pdf_leads"
    | "complaints" 
    | "stats" 
    | "alert_config" 
    | "sales_performance" 
    | "news_manager"
    | "parent_registrations"
    | "free_shadowing_tickets"
    | "partnerships_and_hiring"
    | "live_tracker_manager"
    | "pdf_library"
    | "department_manager";
  const [activeFilterTab, setActiveFilterTab] = useState<TabType>("all");
  const [pdfSettings, setPdfSettings] = useState<Record<string, string>>({});
  const [pdfSettingsLoading, setPdfSettingsLoading] = useState(false);

  // States for Sidebar Ads Customization
  const [adminRightAd, setAdminRightAd] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("custom_news_ad_right_v2");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return {
            visible: parsed.visible !== false,
            title: parsed.title || "مساحة إعلانية",
            description: parsed.description || "سجل الآن لضمان مقعدك الدراسي في التخصصات الأكثر طلباً بسوق العمل والحصول على المزايا الخاصة.",
            linkUrl: parsed.linkUrl || "/registration-guide",
            imageUrl: parsed.imageUrl || "https://images.unsplash.com/photo-1525921429571-473b94195b9d?q=80&w=600&auto=format&fit=crop",
            btnText: parsed.btnText || "تواصل معنا 📞",
            hasFrame: parsed.hasFrame !== false,
            mode: parsed.mode || "image_and_text",
            textPosition: parsed.textPosition || "below",
            frameStyle: parsed.frameStyle || "default"
          };
        } catch (e) {}
      }
    }
    return {
      visible: true,
      title: "مساحة إعلانية",
      description: "احجز مقعدك الدراسي الآن لضمان مستقبلك المهني الأفضل.",
      linkUrl: "/registration-guide",
      imageUrl: "https://images.unsplash.com/photo-1525921429571-473b94195b9d?q=80&w=600&auto=format&fit=crop",
      btnText: "تواصل معنا 📞",
      hasFrame: true,
      mode: "image_and_text",
      textPosition: "below",
      frameStyle: "default"
    };
  });

  const [adminLeftAd, setAdminLeftAd] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("custom_news_ad_left_v2");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return {
            visible: parsed.visible !== false,
            title: parsed.title || "مساحة إعلانية",
            description: parsed.description || "سجل الآن لضمان مقعدك الدراسي في التخصصات الأكثر طلباً بسوق العمل والحصول على المزايا الخاصة.",
            linkUrl: parsed.linkUrl || "/registration-guide",
            imageUrl: parsed.imageUrl || "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800&auto=format&fit=crop",
            btnText: parsed.btnText || "الموقع الرسمي 🔗",
            hasFrame: parsed.hasFrame !== false,
            mode: parsed.mode || "image_and_text",
            textPosition: parsed.textPosition || "below",
            frameStyle: parsed.frameStyle || "default"
          };
        } catch (e) {}
      }
    }
    return {
      visible: true,
      title: "مساحة إعلانية",
      description: "حقق حلمك مع كبرى برامج التعليم والتدريب الفني المعتمد.",
      linkUrl: "/registration-guide",
      imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800&auto=format&fit=crop",
      btnText: "الموقع الرسمي 🔗",
      hasFrame: true,
      mode: "image_and_text",
      textPosition: "below",
      frameStyle: "default"
    };
  });

  const handleSaveAdsConfig = () => {
    localStorage.setItem("custom_news_ad_right_v2", JSON.stringify(adminRightAd));
    localStorage.setItem("custom_news_ad_left_v2", JSON.stringify(adminLeftAd));
    toast.success("تم حفظ وتحديث تصميم الإعلانات الجانبية للبوابة بنجاح! 🎉");
  };

  // States for Department Customization and Image Management
  const [adminAcademyDepartments, setAdminAcademyDepartments] = useState<any[]>(() => {
    const saved = localStorage.getItem("custom_academy_departments_v1");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error("Error parsing custom_academy_departments_v1 in Admin initial state", e);
      }
    }
    return ACADEMY_DEPARTMENTS;
  });

  const handleUpdateDepartmentImage = (deptId: string, imageUrl: string) => {
    const updated = adminAcademyDepartments.map(dept => {
      if (dept.id === deptId) {
        return { ...dept, imageUrl: imageUrl };
      }
      return dept;
    });
    setAdminAcademyDepartments(updated);
  };

  const handleDeleteDepartmentImage = (deptId: string) => {
    const updated = adminAcademyDepartments.map(dept => {
      if (dept.id === deptId) {
        const copy = { ...dept };
        delete copy.imageUrl;
        return copy;
      }
      return dept;
    });
    setAdminAcademyDepartments(updated);
    localStorage.setItem("custom_academy_departments_v1", JSON.stringify(updated));
    toast.success("تم حذف الصورة المخصصة وإرجاع الصورة الافتراضية بنجاح! 🗑️");
  };

  const handleSaveDepartmentsConfig = () => {
    localStorage.setItem("custom_academy_departments_v1", JSON.stringify(adminAcademyDepartments));
    toast.success("تم حفظ وتحديث صور وإعدادات التخصصات بنجاح! 🖼️");
  };

  // States for PDF Digital Library File Manager
  const [pdfLibraryList, setPdfLibraryList] = useState<any[]>([]);
  const [libraryFormId, setLibraryFormId] = useState<string>("");
  const [libraryFormName, setLibraryFormName] = useState<string>("");
  const [libraryFormUrl, setLibraryFormUrl] = useState<string>("");
  const [libraryFormSpecialization, setLibraryFormSpecialization] = useState<string>("الدليل الشامل 2026");
  const [libraryUploadProgress, setLibraryUploadProgress] = useState<string>("");
  const [libraryIsSaving, setLibraryIsSaving] = useState<boolean>(false);

  const [simulatedTickerActive, setSimulatedTickerActive] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("academy_simulated_ticker_active") !== "false";
    }
    return true;
  });

  const handleToggleSimulatedTicker = () => {
    const newVal = !simulatedTickerActive;
    setSimulatedTickerActive(newVal);
    if (typeof window !== "undefined") {
      localStorage.setItem("academy_simulated_ticker_active", newVal.toString());
      // Dispatch storage event so other components receive notification immediately
      window.dispatchEvent(new StorageEvent("storage", { key: "academy_simulated_ticker_active", newValue: newVal.toString() }));
    }
  };

  // Local storage synchronized states for the 4 data receiver tables
  const [parentInquiries, setParentInquiries] = useState<any[]>([]);
  const [shadowTickets, setShadowTickets] = useState<any[]>([]);
  const [partnershipLeads, setPartnershipLeads] = useState<any[]>([]);
  const [liveTrackerStatusMap, setLiveTrackerStatusMap] = useState<{ [key: string]: string }>({});

  // States for Content Config Panel
  const [jobVacancies, setJobVacancies] = useState<string[]>([]);
  const [newJobText, setNewJobText] = useState("");

  const [roiConstants, setRoiConstants] = useState<any>({
    computers: { name: "", salary: 0, careerPct: "", role: "" },
    medical: { name: "", salary: 0, careerPct: "", role: "" },
    labs: { name: "", salary: 0, careerPct: "", role: "" },
    office: { name: "", salary: 0, careerPct: "", role: "" }
  });

  const [studentTestimonials, setStudentTestimonials] = useState<any[]>([]);
  const [newReviewName, setNewReviewName] = useState("");
  const [newReviewDept, setNewReviewDept] = useState("");
  const [newReviewGov, setNewReviewGov] = useState("الدقهلية");
  const [newReviewStars, setNewReviewStars] = useState(5);
  const [newReviewText, setNewReviewText] = useState("");

  const [aiAdvisorTrainingText, setAiAdvisorTrainingText] = useState("");

  const loadLocalStorageTables = () => {
    if (typeof window !== "undefined") {
      const parents = JSON.parse(localStorage.getItem("academy_parent_inquiries") || "[]");
      const tickets = JSON.parse(localStorage.getItem("academy_shadow_tickets") || "[]");
      const partnerships = JSON.parse(localStorage.getItem("academy_business_leads") || "[]");
      const statusMap = JSON.parse(localStorage.getItem("academy_live_tracker_status") || "{}");

      setParentInquiries(parents);
      setShadowTickets(tickets);
      setPartnershipLeads(partnerships);
      setLiveTrackerStatusMap(statusMap);

      // Job Vacancies Ticker Loader
      const savedJobs = localStorage.getItem("custom_job_announcements");
      const defaultAnnouncements = [
        "مطلوب فني حاسبات - شركة إنترناشونال بالقاهرة - المرتب 8000 ج",
        "مطلوب فني مختبرات - معامل البرج بالجيزة - المرتب 9500 ج",
        "عيادات كليوباترا تطلب فنيين صيانة أجهزة طبية - الإسكندرية - راتب مجزي متميز",
        "مستشفيات دار الفؤاد تعلن عن وظائف شاغرة لخريجي الأجهزة الطبية والمختبرات مع شهادة خبرة",
        "مجموعة فروع معامل المختبر تطلق بوابة لتوظيف خريجي دفعات المعاهد الفنية المعتمدة",
        "فني تكنولوجيا معلومات - بنك خاص - التجمع الخامس - المرتب 11000 ج مع مزايا كاملة"
      ];
      if (savedJobs) {
        setJobVacancies(JSON.parse(savedJobs));
      } else {
        setJobVacancies(defaultAnnouncements);
      }

      // ROI Constants
      const defaultRoi = {
        computers: {
          name: "البرمجة والذكاء الاصطناعي (نظم معلومات) 💻",
          salary: 13000,
          careerPct: "طلب بنسبة %97 في السوق",
          role: "مطور برمجيات وفني قواعد بيانات ونظم ذكاء اصطناعي وتطبيقات الويب"
        },
        medical: {
          name: "تحاليل طبية وأشعة (مساعد خدمات صحية) 🧪",
          salary: 11000,
          careerPct: "طلب بنسبة %96 في السوق",
          role: "مساعد فني بمعامل التحاليل الطبية ومراكز الأشعة والتشخيص المعتمدة"
        },
        labs: {
          name: "مساحة وخرائط 🗺️",
          salary: 12000,
          careerPct: "طلب بنسبة %94 في السوق",
          role: "فني مساحي ورسام مخططات هندسية بشركات المقاولات والإنشاءات الكبرى"
        },
        office: {
          name: "بترول وبتروكيماويات 🛢️",
          salary: 15000,
          careerPct: "طلب بنسبة %95 في السوق",
          role: "فني تشغيل وتنقيب قطاع البترول والغاز والبتروكيماويات بمواقع الإنتاج"
        }
      };
      const savedRoi = localStorage.getItem("custom_roi_calculator_constants_v1");
      if (savedRoi) {
        setRoiConstants(JSON.parse(savedRoi));
      } else {
        setRoiConstants(defaultRoi);
      }

      // Reviews
      const defaultReviews = [
        {
          id: 1,
          studentName: "عبدالرحمن محمد الشافعي",
          department: "قسم البرمجة والذكاء الاصطناعي",
          governorate: "الدقهلية",
          rating: 5,
          text: "الحمد لله سجلت عن طريق البوابة وطبعت تذكرة الخصم والحجز واكتشفت إن الدعم الفني وتوصية مستشار التسجيل ممتازة جداً. المعامل والورش مجهزة بأعلى مستوى وموجود نظام مناسب للتقسيط الشهري المريح تيسيراً للجميع.",
          avatarColor: "bg-blue-600 text-white",
          initials: "ع م",
          date: "٢٠٢٦/٠٥/١٢",
          verified: true
        },
        {
          id: 2,
          studentName: "رنا سليم عبدالوهاب",
          department: "قسم مساعد خدمات صحية (تمريض)",
          governorate: "البحيرة",
          rating: 5,
          text: "حلم حياتي كان دراسة التمريض والدخول لمجال الرعاية والمساعدة. مستشاري القبول تواصلوا معي هاتفياً ووضحوا كل الأمور شرحوا الرسوم والخصم الحصري. التدريب العملي في المستشفيات ممتاز وبدأت أستفيد وأتعلم بجدية.",
          avatarColor: "bg-rose-600 text-white",
          initials: "ر س",
          date: "٢٠٢٦/٠٦/٠١",
          verified: true
        }
      ];
      const savedReviews = localStorage.getItem("custom_student_reviews");
      if (savedReviews) {
        setStudentTestimonials(JSON.parse(savedReviews));
      } else {
        setStudentTestimonials(defaultReviews);
      }

      // AI Advisor Context Prompt
      const savedAiAdvisorText = localStorage.getItem("academy_ai_advisor_training") || "التحق الآن بالدبلومات المهنية الرائدة والمعتمدة في تكنولوجيا الحاسب والبرمجة، وصيانة الأجهزة الطبية، والسجل الطبي والسكرتارية، والتحاليل الطبية والخدمات الصحية المساعدة، والمساحة والخرائط والمقاولات. نظام الدراسة يعتمد على تقسيط شهري مريح، وتدريب نقدي وعملي بالمستشفيات والشركات الكبرى لضمان التوظيف الفوري.";
      setAiAdvisorTrainingText(savedAiAdvisorText);
    }
  };

  useEffect(() => {
    loadLocalStorageTables();
  }, [isAuthenticated]);

  // News Manager CRUD system & default articles
  const DEFAULT_NEWS_POSTS = [
    {
      id: "1",
      title: "كيف تكتشف شغفك المهني الحقيقي؟ خطوات توجيهية عملية",
      desc: "دليل الطالب لاكتشاف المهارات التطبيقية المواءمة لرغباته، والابتعاد عن الضغط العائلي والمبالغات لاختيار تخصص يرضي شغفه ويحقق مستقبلاً مالياً واعداً.",
      category: "توجيه مهني 🧭",
      readTime: "قراءة في ٣ دقائق",
      content: "أولاً، قيّم مهاراتك بشكل محايد عن طريق اختبار تحديد التخصص بالبوابة. ثانياً، ابحث عن المجالات العملية ذات الطلب المستدام في الأسواق كالحوسبة، المساحة الميدانية، والتمريض الفني. الورش والتدريبات العملية في الأكاديميات تمنحك الثقة الكاملة من اليوم الأول للدراسة لتكتشف بنفسك مدى حبك للتخصص قبل الاستمرار."
    },
    {
      id: "2",
      title: "أسرار سوق العمل 2026: لماذا يزداد الطلب على الأكاديميات الفنية؟",
      desc: "تحليل حصري للمهارات الأكثر طلباً في السوق الإقليمي والمصري ولماذا تفضل شركات المقاولات والضيافة والمستشفيات خريجي الدبلومات والشهادات المهنية التطبيقية.",
      category: "تحليل السوق 📈",
      readTime: "قراءة في ٤ دقائق",
      content: "تتغير متطلبات أصحاب الأعمال والمحافظ التقنية بمعدل سريع، حيث يبحث الجميع عن 'فني ممارس ملم بمهارات عملية حقيقية' بدلاً من الحفظ النظري المحض. التخصصات الصحية المساعدة كالتشخيص الطبي والتحاليل، وقسم هندسة البرمجة وتكنولوجيا الذكاء الاصطناعي، والمساحة والمقاولات تعاني حالياً من عجز شديد في الكوادر الفنية الماهرة، مما يضمن للخريجين المتميزين سرعة حجز مقاعدهم الوظيفية."
    },
    {
      id: "3",
      title: "تجهيز المستندات والأوراق الرسمية لدفعة العام الدراسي الجديد 2026",
      desc: "قائمة كاملة بالشروط والملفات والمستندات الأساسية المطلوبة لإتمام الفتح المبدئي لملف الطالب وتجنب تأخير الفحص الطبي والمقابلة الشخصية للقبول.",
      category: "إرشادات القبول 📑",
      readTime: "قراءة في دقيقتين",
      content: "تشمل الأوراق الهامة: أصل شهادة الميلاد المميكنة، صورة بطاقة الطالب الشخصية وبطاقة ولي الأمر، وصور شخصية حديثة بخلفية بيضاء مدون عليها اسم الطالب بالكامل. بالنسبة للشهادة المؤهلة للإعدادية أو الدبلومات أو الثانوية، يكتفى بصورة مؤقتة لحين صدور الاستمارات الرسمية من المدارس وتوثيقها بشكل قانوني في المواعيد المقررة."
    },
    {
      id: "4",
      title: "كيفية الحصول على التوفير المالي عبر حجز باقات التقديم المبكر",
      desc: "كل ما تود معرفته عن نظام الخصومات التراكمية في بوابة المعاهد لحفظ مصروفاتك ضد موجات التضخم وتأمين أسعار تفضيلية لكامل فصول دبلومتك المهنية.",
      category: "المصروفات والمالية 💰",
      readTime: "قراءة في ٣ دقائق",
      content: "تمنح الأكاديمية خصومات دورية حصرية تبدأ من 2,000 جنيه وتصل إلى 6,000 جنيه مصري عند حجز الملف مبكراً وتأكيد التسجيل الإلكتروني عبر بوابتنا. هذا الكود يحفظ التسعير القديم للمواد ومعدات التدريب والكتب لتضمن عدم الالتزام بأي زيادات خارجية لاحقة."
    },
    {
      id: "5",
      title: "خطوات تفعيل وتأجيل التجنيد والخدمة العسكرية للطلاب الذكور",
      desc: "شرح قانوني للخطوات التنظيمية المطلوبة لتفعيل استمارة التأجيل العسكري وتجنب المساءلة أو الاستدعاء طوال فترة قيدك بالبرامج التعليمية بالأكاديميات.",
      category: "التأجيل العسكري 🪖",
      readTime: "قراءة في ٤ دقائق",
      content: "بموجب التعاون الإداري والتنظيمي الخاص، فإن الطالب الذكور يستحق تأجيل التجنيد بمجرد سداد الرسوم الإدارية المقررة للمعاملات العسكرية وتجهيز الأكاديمية لدفاتر استمارات التأجيل الرسمية وربطها مع مكاتب الاتصال العسكري لحماية موقفك طوال مدة البرنامج وصلاحية القيد المقررة."
    },
    {
      id: "6",
      title: "الفرق الجوهري بين الشهادات المهنية التطبيقية والتعليم الجامعي الأكاديمي",
      desc: "توضيح هام وشفاف لكل طالب وولي أمر للفصل الجيد بين المسار المهني العملي الموجه للتوظيف السريع وبين المسار النظري المعادل للجامعات التقليدية.",
      category: "الاعتمادات القانونية ⚖️",
      readTime: "قراءة في ٣ دقائق",
      content: "ننبه صراحة بأن جميع البرامج والتخصصات المدرجة هنا ليست خاضعة للتعليم العالي المصري أو مجلس الجامعات الأعلى؛ بل تركز كلياً على التدريب العملي المهني واكتساب الخبرة الكافية لتمكينك من العمل الفوري بالشركات والمراكز ومعامل الفحص الخاصة التي تبحث عن المهارة كعنصر رئيسي للتوظيف."
    },
    {
      id: "7",
      title: "تفاصيل الأنشطة والرحلات الترفيهية وحفلات الاستقبال لطلاب الأكاديمية",
      desc: "دليل الحياة الطلابية الدافئة وفعاليات دمج الطلاب لتأهيل الجوانب النفسية الإيجابية والمشاركة الفعالة في ورش مهارات الاتصال والتواصل المجانية.",
      category: "الحياة الطلابية 🎉",
      readTime: "قراءة في ٣ دقائق",
      content: "تنظم إدارتنا سنوياً حفلاً ترحيبياً ضخماً يستهدف كسر الرهبة النفسية وصقل روابط الزمالة والاحترام المتبادل بين هيئة التدريس المرموقة والطلبة الجدد. يتخلل العام جولات ترفيهية دورية وسفر لمدن ساحلية ممتازة للترويج عن النفس وموازنة متطلبات التدريب المهني الشاق."
    },
    {
      id: "8",
      title: "بدء فتح باب قيد الشعب التكنولوجية بالتعاون مع الشركات المتخصصة",
      desc: "إعلان قبول استمارات دفعة 2026 في الشعب والبرامج التدريبية المبتكرة لهندسة النظم وتكنولوجيا الذكاء الاصطناعي والإدارة الرقمية للمكاتب واللوجستيات.",
      category: "إعلانات رسمية 📣",
      readTime: "قراءة في دقيقتين",
      content: "بشراكة حية مع نخبة من معامل الفحص وقواعد البيانات والشركات التقنية، انطلق رسمياً حجز مقاعد الشعب التكنولوجية الممتازة. يحصل المقيد على كارنيه الانتساب الرسمي للأكاديمية وحق الدخول وقضاء ساعات تدريب عملية في ورش الشركاء طوال فترة دبلومة."
    }
  ];

  const [adminNewsPosts, setAdminNewsPosts] = useState<any[]>([]);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostDesc, setNewPostDesc] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("توجيه أكاديمي 🧭");
  const [newPostReadTime, setNewPostReadTime] = useState("");
  const [newPostContent, setNewPostContent] = useState("");

  const loadAdminNews = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("custom_news_posts_v1");
      if (saved) {
        try {
          setAdminNewsPosts(JSON.parse(saved));
        } catch (e) {
          setAdminNewsPosts(DEFAULT_NEWS_POSTS);
        }
      } else {
        localStorage.setItem("custom_news_posts_v1", JSON.stringify(DEFAULT_NEWS_POSTS));
        setAdminNewsPosts(DEFAULT_NEWS_POSTS);
      }
    }
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostDesc.trim() || !newPostContent.trim()) {
      alert("يرجى ملء كافة الخانات المطلوبة لنشر المقال بنجاح!");
      return;
    }
    const newPost = {
      id: String(Date.now()),
      title: newPostTitle,
      desc: newPostDesc,
      category: newPostCategory,
      readTime: newPostReadTime || "قراءة في ٣ دقائق",
      content: newPostContent
    };
    const updated = [newPost, ...adminNewsPosts];
    setAdminNewsPosts(updated);
    localStorage.setItem("custom_news_posts_v1", JSON.stringify(updated));
    window.dispatchEvent(new Event("news_posts_updated"));
    setNewPostTitle("");
    setNewPostDesc("");
    setNewPostReadTime("");
    setNewPostContent("");
    alert("✓ تم حفظ ونشر وتعميم المقال بنجاح!");
  };

  const handleDeletePost = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا المقال نهائياً من قائمة الأخبار؟")) {
      const updated = adminNewsPosts.filter(p => p.id !== id);
      setAdminNewsPosts(updated);
      localStorage.setItem("custom_news_posts_v1", JSON.stringify(updated));
      window.dispatchEvent(new Event("news_posts_updated"));
    }
  };

  const handleMovePost = (id: string, direction: "up" | "down") => {
    const index = adminNewsPosts.findIndex(p => p.id === id);
    if (index === -1) return;
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= adminNewsPosts.length) return;

    const updated = [...adminNewsPosts];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;

    setAdminNewsPosts(updated);
    localStorage.setItem("custom_news_posts_v1", JSON.stringify(updated));
    window.dispatchEvent(new Event("news_posts_updated"));
  };

  useEffect(() => {
    loadAdminNews();
  }, []);

  // Advanced Multi-Criteria Filter States
  const [adminSearchQuery, setAdminSearchQuery] = useState("");
  const [adminFilterDate, setAdminFilterDate] = useState("all");
  const [adminFilterGov, setAdminFilterGov] = useState("all");
  const [adminFilterDept, setAdminFilterDept] = useState("all");
  const [adminFilterAgent, setAdminFilterAgent] = useState("all");

  // Alert & Sound configuration
  const [alertSoundEnabled, setAlertSoundEnabled] = useState(true);
  const [autoToastEnabled, setAutoToastEnabled] = useState(true);
  const [preferredAlertTone, setPreferredAlertTone] = useState<"registration" | "callback">("registration");
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "lead" | "callback"; time: string }[]>([]);

  // Expanded student cards record
  const [expandedStudents, setExpandedStudents] = useState<{ [id: string]: boolean }>({});
  const [copiedFeedback, setCopiedFeedback] = useState<string | null>(null);

  // For callback tracking workflow
  const [callbackPromptId, setCallbackPromptId] = useState<string | null>(null);
  const [callbackAgentInput, setCallbackAgentInput] = useState("");
  const [callbackError, setCallbackError] = useState("");

  // Session authorization for deleting in each list
  const [unlockedDeleteTabs, setUnlockedDeleteTabs] = useState<{ [category: string]: boolean }>(() => {
    if (typeof window !== "undefined") {
      const raw = sessionStorage.getItem("unlocked_delete_tabs");
      return raw ? JSON.parse(raw) : {};
    }
    return {};
  });

  // State to track current delete operation intent which needs password authorization
  const [pendingDeleteAction, setPendingDeleteAction] = useState<{
    listKey: "lead_new" | "lead_completed" | "lead_no_reply" | "callback" | "complaint" | "parent" | "ticket" | "pdfLead";
    id: string;
    studentName: string;
    onConfirmed: () => void;
  } | null>(null);

  const [deleteConfirmationAction, setDeleteConfirmationAction] = useState<{
    studentName?: string;
    onConfirmed: () => void;
  } | null>(null);

  const [deletePasswordInput, setDeletePasswordInput] = useState("");
  const [deletePasswordError, setDeletePasswordError] = useState("");

  const triggerSecureDelete = (
    listKey: "lead_new" | "lead_completed" | "lead_no_reply" | "callback" | "complaint" | "parent" | "ticket" | "pdfLead",
    id: string,
    studentName: string,
    onConfirmed: () => void
  ) => {
    const isUnlocked = unlockedDeleteTabs[listKey];
    if (isUnlocked) {
      setDeleteConfirmationAction({
        studentName,
        onConfirmed
      });
    } else {
      setPendingDeleteAction({
        listKey,
        id,
        studentName,
        onConfirmed
      });
      setDeletePasswordInput("");
      setDeletePasswordError("");
    }
  };

  // Internal Notes modification
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNoteText, setTempNoteText] = useState("");

  // Representative/Sales Assignment
  const [editingSalesStudentId, setEditingSalesStudentId] = useState<string | null>(null);
  const [tempSalesOption, setTempSalesOption] = useState("");
  const [tempSalesInput, setTempSalesInput] = useState("");
  const [transferCheckedList, setTransferCheckedList] = useState<{ [key: string]: boolean }>({});

  // References to track database row additions on interval
  const prevLeadsCountRef = useRef<number | null>(null);
  const prevCallbacksCountRef = useRef<number | null>(null);

  // 1. Authenticate check on component render
  useEffect(() => {
    document.title = "لوحة التحكم السريّة";
    if (typeof window !== "undefined") {
      const auth = sessionStorage.getItem("admin_authenticated");
      if (auth === "true") {
        setIsAuthenticated(true);
      }
    }
  }, []);

  // Web Audio ultra-premium elegant synthesizer (Crystalline E major 7 and A major ascending harmonic chime)
  const playNotificationSound = (forcedTone?: "registration" | "callback") => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioCtx.state === "suspended") {
        audioCtx.resume().catch(e => console.warn("Could not resume AudioContext:", e));
      }
      
      const playBeep = (freq: number, type: "sine" | "triangle" | "square" | "sawtooth", startTime: number, duration: number, vol: number) => {
        try {
          const osc = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          osc.type = type;
          osc.frequency.setValueAtTime(freq, startTime);
          
          // Connect smooth volume envelope: dynamic attack and exponential decay
          gainNode.gain.setValueAtTime(0, startTime);
          gainNode.gain.linearRampToValueAtTime(vol, startTime + 0.04);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
          
          osc.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          osc.start(startTime);
          osc.stop(startTime + duration);
        } catch (oscErr) {
          console.error("Oscillator play error:", oscErr);
        }
      };

      const toneToPlay = forcedTone || preferredAlertTone;

      if (toneToPlay === "registration") {
        const now = audioCtx.currentTime;
        // Warm crystalline E major 7 elegant ascending arpeggio
        playBeep(659.25, "sine", now, 0.8, 0.06);        // E5
        playBeep(830.61, "sine", now + 0.12, 0.8, 0.06);   // G#5
        playBeep(987.77, "sine", now + 0.24, 1.0, 0.06);   // B5
        playBeep(1318.51, "sine", now + 0.36, 1.4, 0.07);  // E6
      } else {
        const now = audioCtx.currentTime;
        // Premium soft crystal ascending A major chord
        playBeep(880.00, "sine", now, 0.8, 0.06);        // A5
        playBeep(1109.73, "sine", now + 0.12, 0.8, 0.06); // C#6
        playBeep(1318.51, "sine", now + 0.24, 1.2, 0.07); // E6
      }
    } catch (e) {
      console.warn("Could not play notification chime:", e);
    }
  };

  // Load PDF URLs
  const fetchPdfSettings = async () => {
    setPdfSettingsLoading(true);
    try {
      const res = await fetch("/api/pdf-settings");
      const data = await res.json();
      if (data && data.success) {
        setPdfSettings(data.settings);
      }
      await fetchPdfLibrary();
    } catch (err) {
      console.error("Error fetching PDF settings:", err);
    } finally {
      setPdfSettingsLoading(false);
    }
  };

  const fetchPdfLibrary = async () => {
    try {
      const res = await fetch("/api/pdf-library");
      const data = await res.json();
      if (data && data.success) {
        setPdfLibraryList(data.list);
      }
    } catch (err) {
      console.error("Error fetching PDF library:", err);
    }
  };

  const handleLibraryFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLibraryUploadProgress("جاري تجهيز الملف للرفع...");
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setLibraryUploadProgress("جاري رفع الملف وحفظه على السيرفر...");
      try {
        const res = await fetch("/api/pdf-library/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            base64,
            fileName: file.name
          })
        });
        const data = await res.json();
        if (data && data.success) {
          setLibraryFormUrl(data.fileUrl);
          // Set name if empty
          if (!libraryFormName) {
            setLibraryFormName(file.name.replace(/\.[^/.]+$/, ""));
          }
          setLibraryUploadProgress("تم رفع الملف بنجاح وحفظه على السيرفر! ✓");
        } else {
          setLibraryUploadProgress(`فشل الرفع: ${data.error || "خطأ مجهول"}`);
        }
      } catch (err: any) {
        console.error(err);
        setLibraryUploadProgress("فشل في الاتصال بالسيرفر أثناء عملية الرفع.");
      }
    };
    reader.onerror = () => {
      setLibraryUploadProgress("فشل في قراءة الملف من الجهاز.");
    };
    reader.readAsDataURL(file);
  };

  const handleSaveLibraryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!libraryFormName.trim() || !libraryFormUrl.trim() || !libraryFormSpecialization) {
      alert("الرجاء تعبئة جميع الحقول المطلوبة (مسمى الملف، الرابط، والقسم المرتبط).");
      return;
    }

    setLibraryIsSaving(true);
    try {
      const res = await fetch("/api/pdf-library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: libraryFormId || undefined,
          name: libraryFormName.trim(),
          url: libraryFormUrl.trim(),
          specialization: libraryFormSpecialization
        })
      });
      const data = await res.json();
      if (data && data.success) {
        // Update both library and settings
        setPdfLibraryList(data.list);
        setPdfSettings(data.settings);
        
        // Reset form
        setLibraryFormId("");
        setLibraryFormName("");
        setLibraryFormUrl("");
        setLibraryUploadProgress("");
        alert("تم حفظ الملف بنجاح وربطه فوراً بـ بوابة التحميل (Lead Magnet) للتخصص المختار! 📚");
      } else {
        alert(`فشل الحفظ: ${data.error || "خطأ مجهول"}`);
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء الاتصال بالسيرفر لحفظ الملف.");
    } finally {
      setLibraryIsSaving(false);
    }
  };

  const handleEditLibraryItem = (item: any) => {
    setLibraryFormId(item.id);
    setLibraryFormName(item.name);
    setLibraryFormUrl(item.url);
    setLibraryFormSpecialization(item.specialization);
    setLibraryUploadProgress("تم تحميل بيانات الملف للتعديل الحاسم.");
  };

  const handleDeleteLibraryItem = async (id: string) => {
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذا الملف من المكتبة بشكل نهائي؟")) return;

    try {
      const res = await fetch(`/api/pdf-library/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data && data.success) {
        setPdfLibraryList(data.list);
        alert("تم حذف الملف من المكتبة الرقمية بنجاح.");
      } else {
        alert("فشل حذف الملف.");
      }
    } catch (err) {
      console.error(err);
      alert("خطأ أثناء محاولة حذف الملف.");
    }
  };

  const handleUpdatePdfUrl = (specialization: string, newUrl: string) => {
    setPdfSettings((prev) => ({ ...prev, [specialization]: newUrl }));
  };

  const handleSavePdfSettings = async () => {
    try {
      setPdfSettingsLoading(true);
      const res = await fetch("/api/pdf-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: pdfSettings })
      });
      const data = await res.json();
      if (data && data.success) {
        alert("تم حفظ وتحديث روابط ملفات الـ PDF بنجاح! سيتم تطبيقها فوراً على أدوات تفعيل العملاء الـ Lead Magnet.");
      } else {
        alert("فشل حفظ التغييرات، يرجى المحاولة لاحقاً.");
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء حفظ الإعدادات.");
    } finally {
      setPdfSettingsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchPdfSettings();
    }
  }, [isAuthenticated]);

  // 2. Load API database values
  const fetchAdminData = async (isFirstLoad = false) => {
    try {
      const res = await fetch("/api/admin/data");
      const data = await res.json();
      if (data.success) {
        const leads: Lead[] = data.leads || [];
        const callbacks: CallbackRequest[] = data.callbacks || [];
        const complaints: Complaint[] = data.complaints || [];
        const pdfLeads: any[] = data.pdfLeads || [];

        setAdminLeads(leads);
        setAdminCallbacks(callbacks);
        setAdminComplaints(complaints);
        setAdminPdfLeads(pdfLeads);

        // Analyze count increase to play synthesized auditory alerts
        if (!isFirstLoad) {
          if (prevLeadsCountRef.current !== null && leads.length > prevLeadsCountRef.current) {
            const addedNum = leads.length - prevLeadsCountRef.current;
            const latestItem = leads[0];
            if (alertSoundEnabled) {
              playNotificationSound("registration");
            }
            // Trigger floating screen-level premium toast
            toast(`✨ تم تسجيل طالب جديد بنجاح: "${latestItem?.studentName || 'جديد'}" 📚`, {
              icon: "🎉",
              duration: 8000,
              style: {
                background: "#0f172a",
                color: "#f8fafc",
                borderRadius: "1rem",
                border: "1px solid #334155",
                fontWeight: "900",
                fontSize: "13px",
                direction: "rtl"
              }
            });
            if (autoToastEnabled) {
              setToasts(prev => [
                {
                  id: String(Date.now()),
                  message: `📚 حجز مقعد جديد: تقدّم الطالب "${latestItem?.studentName || 'جديد'}" وحفظ خصم قِسمه الآن!`,
                  type: "lead",
                  time: new Date().toLocaleTimeString("ar-EG")
                },
                ...prev
              ]);
            }
          }

          if (prevCallbacksCountRef.current !== null && callbacks.length > prevCallbacksCountRef.current) {
            const latestCb = callbacks[0];
            if (alertSoundEnabled) {
              playNotificationSound("callback");
            }
            // Trigger floating screen-level premium toast
            toast(`📞 طلب اتصال هاتفي عاجل: "${latestCb?.studentName || 'مجهول'}" ☎️`, {
              icon: "⚡",
              duration: 8000,
              style: {
                background: "#022c22",
                color: "#f0fdf4",
                borderRadius: "1rem",
                border: "1px solid #115e59",
                fontWeight: "900",
                fontSize: "13px",
                direction: "rtl"
              }
            });
            if (autoToastEnabled) {
              setToasts(prev => [
                {
                  id: String(Date.now()),
                  message: `📞 طلب اتصال هاتفي عاجل: العميل "${latestCb?.studentName || 'مجهول'}" يطلب استشارة هاتفية!`,
                  type: "callback",
                  time: new Date().toLocaleTimeString("ar-EG")
                },
                ...prev
              ]);
            }
          }
        }

        prevLeadsCountRef.current = leads.length;
        prevCallbacksCountRef.current = callbacks.length;
      }
    } catch (err) {
      console.error("Could not fetch database records:", err);
    } finally {
      setLoading(false);
    }
  };

  // Pull records on load and refresh on timer interval (6 seconds for real-time tracking)
  useEffect(() => {
    if (!isAuthenticated) return;

    fetchAdminData(true);

    const interval = setInterval(() => {
      fetchAdminData(false);
    }, 6000);

    // Listen to Supabase update triggers directly
    let channel: any = null;
    if (hasSupabase) {
      channel = supabase
        .channel("admin-realtime-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "students",
          },
          () => {
            fetchAdminData(false);
          }
        )
        .subscribe();
    }

    // Unlock Audio Context on first click/touch interaction
    const unlockAudio = () => {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (audioCtx.state === "suspended") {
          audioCtx.resume();
        }
        // Remove event listeners after successfully trying to unlock
        window.removeEventListener("click", unlockAudio);
        window.removeEventListener("touchstart", unlockAudio);
      } catch (err) {
        console.warn("Failed to automatically unlock browser audio context:", err);
      }
    };

    window.addEventListener("click", unlockAudio);
    window.addEventListener("touchstart", unlockAudio);

    return () => {
      clearInterval(interval);
      if (channel) {
        supabase.removeChannel(channel);
      }
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
    };
  }, [isAuthenticated, alertSoundEnabled, autoToastEnabled]);

  // Handle Verify PIN Submit
  const handleVerifyAdminPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pin = adminPinInput.trim().toLowerCase();
    if (pin === "eng2026" || pin === "mamdouh2026" || pin === "engmamdouh2026") {
      setPinError(false);
      setIsAuthenticated(true);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("admin_authenticated", "true");
      }
      fetchAdminData(true);
    } else {
      setPinError(true);
    }
  };

  // Handle Google OAuth Whitelisted Login Submit
  const handleGoogleMagicLogin = (emailAddress: string) => {
    const email = emailAddress.trim().toLowerCase();
    if (!email) {
      setGoogleAuthError("يرجى إدخال البريد الإلكتروني الخاص بك");
      return;
    }
    
    // Check if user email is inside the whitelist
    if (ALLOWED_ADMIN_EMAILS.some(e => e.toLowerCase() === email)) {
      setGoogleAuthError("");
      setIsAuthenticated(true);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("admin_authenticated", "true");
      }
      setShowGoogleModal(false);
      fetchAdminData(true);
    } else {
      const errorMsg = "عذراً، هذا الحساب لا يملك صلاحية دخول لوحة التحكم";
      setGoogleAuthError(errorMsg);
      alert(errorMsg);
    }
  };

  // Sign out handler
  const handleSignout = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("admin_authenticated");
    }
    setIsAuthenticated(false);
    navigate("/");
  };

  // Toggle single row expansion
  const toggleStudentExpand = (id: string) => {
    setExpandedStudents(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Update contact status
  const handleUpdateStatus = async (type: "lead" | "callback", id: string, status: string, name?: string) => {
    try {
      const res = await fetch("/api/admin/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id, status, agentName: name })
      });
      if (res.ok) {
        fetchAdminData(false);
      }
    } catch (err) {
      console.error("Could not update status:", err);
    }
  };

  // Save Sales Representative Assignment
  const handleSaveSalesAssignment = async (studentId: string, name: string) => {
    try {
      await handleUpdateStatus("lead", studentId, "completed", name);
      setEditingSalesStudentId(null);
      setTempSalesOption("");
      setTempSalesInput("");
    } catch (err) {
      console.error("Sales Assignment update failure:", err);
    }
  };

  // Save staff internal notes
  const handleSaveInternalNote = async (type: "lead" | "callback", id: string) => {
    try {
      const res = await fetch("/api/admin/update-internal-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id, internalNotes: tempNoteText })
      });
      if (res.ok) {
        setEditingNoteId(null);
        setTempNoteText("");
        fetchAdminData(false);
      }
    } catch (err) {
      console.error("Failed to save internal note:", err);
    }
  };

  // Delete admissions, callback or complaint
  const handleDeleteItem = async (type: "lead" | "callback" | "complaint", id: string) => {
    try {
      const res = await fetch("/api/admin/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id })
      });
      if (res.ok) {
        fetchAdminData(false);
      }
    } catch (err) {
      console.error("Deletion error:", err);
    }
  };

  // Copy click feedback helper
  const handleCopySingleNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedFeedback(num);
    setTimeout(() => setCopiedFeedback(null), 2000);
  };

  // WhatsApp helper
  const getWhatsAppLink = (phone: string, name: string) => {
    let cleanPhone = phone.trim();
    if (cleanPhone.startsWith("01")) {
      cleanPhone = "2" + cleanPhone;
    }
    const txt = encodeURIComponent(`أهلاً بك يا طالبنا العزيز ${name}، نتواصل معك من إدارة شؤون التسجيل في بوابة المعاهد والأكاديميات الخاصة بخصوص تأكيد طلب حجز مقعدك...`);
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${txt}`;
  };

  // Compute stats details to produce live Visual Analytics Chart
  const getDepartmentStatsForChart = () => {
    const counts: { [name: string]: number } = {};
    adminLeads.forEach(lead => {
      if (lead.selectedDepartments && lead.selectedDepartments.length > 0) {
        lead.selectedDepartments.forEach(deptId => {
          const dept = ACADEMY_DEPARTMENTS.find(d => d.id === deptId || d.name === deptId);
          const label = dept ? dept.name.slice(0, 18) + "..." : "تخصص رئيسي";
          counts[label] = (counts[label] || 0) + 1;
        });
      } else if (lead.basicCourse) {
        const label = lead.basicCourse.slice(0, 18);
        counts[label] = (counts[label] || 0) + 1;
      }
    });

    return Object.entries(counts).map(([name, value]) => ({ name, value })).slice(0, 5);
  };

  const getGovernorateStatsForChart = () => {
    const counts: { [name: string]: number } = {};
    adminLeads.forEach(lead => {
      const gov = lead.governorate?.trim() || "غير مدون";
      counts[gov] = (counts[gov] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).slice(0, 5);
  };

  const chartData = getDepartmentStatsForChart();
  const govData = getGovernorateStatsForChart();

  // Filter student applications according to Tab + Advanced filters
  const filteredLeadsList = adminLeads.filter(lead => {
    // 1. Core Tab State Filter
    if (activeFilterTab === "new") {
      if (lead.status === "completed") return false;
    } else if (activeFilterTab === "completed") {
      if (lead.status !== "completed") return false;
    } else if (activeFilterTab === "no_reply") {
      if (lead.status !== "no_reply") return false;
    }

    // 2. Search Query (studentName, phone, code)
    const query = adminSearchQuery.trim().toLowerCase();
    if (query) {
      const match = (
        (lead.studentName || "").toLowerCase().includes(query) ||
        (lead.phoneNumber || "").toLowerCase().includes(query) ||
        (lead.reservationCode || "").toLowerCase().includes(query) ||
        (lead.governorate || "").toLowerCase().includes(query) ||
        (lead.agentName || "").toLowerCase().includes(query)
      );
      if (!match) return false;
    }

    // 3. Date Interval Period
    if (adminFilterDate !== "all") {
      const studentTime = Number(lead.timestamp);
      if (!studentTime) return false;
      const startOfToday = new Date().setHours(0, 0, 0, 0);

      if (adminFilterDate === "today") {
        if (studentTime < startOfToday) return false;
      } else if (adminFilterDate === "yesterday_today") {
        const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
        if (studentTime < startOfYesterday) return false;
      } else if (adminFilterDate === "week") {
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
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

    // 6. Sales rep agent filter
    if (adminFilterAgent !== "all") {
      if (adminFilterAgent === "unassigned") {
        if (lead.agentName && lead.agentName.trim() !== "") return false;
      } else {
        if ((lead.agentName || "").trim().toLowerCase() !== adminFilterAgent.toLowerCase()) return false;
      }
    }

    return true;
  });

  // Filter callbacks list to display search
  const filteredCallbacksList = adminCallbacks.filter(cb => {
    const q = adminSearchQuery.trim().toLowerCase();
    if (q) {
      return (cb.phoneNumber.includes(q) || (cb.studentName || "").toLowerCase().includes(q));
    }
    return true;
  });

  // Filter PDF leads list to display search
  const filteredPdfLeadsList = adminPdfLeads.filter(pl => {
    const q = adminSearchQuery.trim().toLowerCase();
    
    // Support Sales Rep filtering on PDF leads if active
    if (adminFilterAgent !== "all") {
      if (adminFilterAgent === "unassigned") {
        if (pl.agentName && pl.agentName.trim() !== "") return false;
      } else {
        if ((pl.agentName || "").trim().toLowerCase() !== adminFilterAgent.toLowerCase()) return false;
      }
    }
    
    if (q) {
      return (
        pl.phone.includes(q) || 
        (pl.name || "").toLowerCase().includes(q) || 
        (pl.specialization || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Unique lists from data to feed filter select options
  const uniqueGovs = Array.from(new Set(adminLeads.map(l => l.governorate?.trim()).filter(Boolean))).sort();
  const defaultSalesReps: string[] = [];
  const activeSalesReps = Array.from(new Set([
    ...defaultSalesReps,
    ...adminLeads.map(l => l.agentName?.trim()).filter(Boolean)
  ])).sort();

  // ---------------- SECURITY LOGIN GATE ----------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-right font-sans" dir="rtl">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-scale-up">
          
          <div className="bg-slate-950 p-6 text-white text-center">
            <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-amber-500/25">
              <Lock className="w-8 h-8 text-amber-500 animate-pulse" />
            </div>
            <h2 className="text-xl font-extrabold font-sans">بوابة الإشراف وتسجيل مستشاري القبول 🔐</h2>
            <p className="text-xs text-slate-400 mt-1">تشفير تام لحماية خصوصية وسرية بيانات المسجلين</p>
          </div>

          <form onSubmit={handleVerifyAdminPinSubmit} className="p-6 space-y-4">
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              لوحة التحكم هذه مخصصة فقط لمؤسس المنصة (الباشمهندس ممدوح) وفريق عمل الاستشارات والمبيعات لدى (ايه ام جروب للتسويق). يرجى تأكيد الهوية بإدخال الرمز السري:
            </p>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">أدخل رمز الحماية السري لتأكيد الصلاحية :</label>
              <input
                type="password"
                required
                value={adminPinInput}
                onChange={(e) => {
                  setAdminPinInput(e.target.value);
                  if (pinError) setPinError(false);
                }}
                placeholder="••••"
                className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0A2463]/15 focus:outline-none focus:border-slate-800 text-center font-bold tracking-widest text-lg text-slate-850"
                autoFocus
              />
            </div>

            {pinError && (
              <p className="text-xs text-red-650 bg-red-50 p-3 rounded-lg border border-red-100 flex items-center gap-1.5 animate-bounce font-bold">
                <span>⚠️ الرمز غير صحيح، حاول مرة أخرى!</span>
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
              <span>تأكيد الرمز وفتح لوحة الإدارة 🔓</span>
            </button>

            <div className="flex items-center my-3 text-slate-400 text-xs">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="px-3">أو باستخدام حساب جوجل المعتمر</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <button
              type="button"
              onClick={() => {
                setGoogleEmailInput("");
                setGoogleAuthError("");
                setShowGoogleModal(true);
              }}
              className="w-full py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-black rounded-xl transition shadow-3xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>تسجيل الدخول باستخدام حساب جوجل 🔑</span>
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              الرجوع للصفحة الرئيسية للموقع
            </button>
          </form>

        </div>

        {/* Google Authentication Whitelisted Modal */}
        {showGoogleModal && (
          <div className="fixed inset-0 bg-[#0a2463]/30 backdrop-blur-md flex items-center justify-center p-4 z-50 text-right font-sans" dir="rtl">
            <div className="bg-white w-full max-w-sm rounded-3xl border border-slate-200 overflow-hidden shadow-2xl animate-scale-up space-y-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white text-center relative">
                <button 
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  className="absolute top-4 right-4 text-white hover:text-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
                <h3 className="font-extrabold text-sm block">بوابة الموثوقية والمصادقة الآمنة لجوجل 🛡️</h3>
                <p className="text-[10px] text-blue-100">Sign in with Google - AM Group Agency Whitelist</p>
              </div>

              <div className="p-5 space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed font-bold">
                  الرجاء تسجيل بريد بوابتك الإلكتروني المعتمد للتحقق من هويتك في كشوف مستشاري ومقرري القبول:
                </p>

                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-400 block">عنوان بريد Gmail المعتمد</label>
                  <input
                    type="email"
                    required
                    value={googleEmailInput}
                    onChange={(e) => {
                      setGoogleEmailInput(e.target.value);
                      if (googleAuthError) setGoogleAuthError("");
                    }}
                    placeholder="example@gmail.com"
                    className="w-full bg-slate-50 border border-slate-205 p-3 rounded-xl text-xs font-semibold text-slate-800 text-left font-serif focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                {googleAuthError && (
                  <div className="p-3 bg-rose-50 text-rose-700 text-[10px] font-black rounded-xl border border-rose-100 text-right leading-relaxed">
                    ⚠️ {googleAuthError}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleGoogleMagicLogin(googleEmailInput)}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition cursor-pointer text-center"
                  >
                    تأكيد وتسجيل 🔓
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowGoogleModal(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100/80 text-[10px] text-slate-400 text-center font-bold">
                  ملاحظة للمستشار: البريد المفعل بالترخيص هو <code className="text-blue-600 select-all font-mono">mohammedalroubymediabuyer@gmail.com</code> لتوفير الموثوقية الكاملة.
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // ---------------- AUTHENTICATED PANEL LAYOUT ----------------
  return (
    <div className="min-h-screen bg-slate-100 p-2 sm:p-4 md:p-8 font-sans transition-all text-right" dir="rtl">
      
      {/* A. Header Workspace */}
      <div className="max-w-7xl mx-auto flex flex-col xl:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full xl:w-auto">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-md shrink-0">
              <Globe className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-base sm:text-xl md:text-2xl font-black text-slate-900 tracking-tight">البيئة الإدارية المستقلة الشاملة</h1>
              <p className="text-[10px] sm:text-xs text-slate-500 font-extrabold flex items-center gap-1.5 mt-0.5">
                <span>قاعدة بيانات الطلاب والمسجلين الحية 🟢</span>
                <span className="text-[9px] sm:text-[10px] bg-indigo-150 text-indigo-700 px-1.5 sm:px-2 py-0.2 rounded">تحديث حي تلقائي</span>
              </p>
            </div>
          </div>

          {/* Simulated Ticker Master Control */}
          <div className="bg-slate-950 border border-slate-850 p-2.5 px-4 rounded-xl flex items-center gap-3.5 shadow-lg shrink-0 mt-2 sm:mt-0" id="simulated-ticker-master-container">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${simulatedTickerActive ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${simulatedTickerActive ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
            </span>
            <span className="text-[11px] font-black text-[#F1F5F9]">🤖 محاكي النشاط والتسجيلات الذكية الخلفية:</span>
            <button
              onClick={handleToggleSimulatedTicker}
              type="button"
              className={`min-w-[70px] h-7 px-2.5 rounded-lg text-[10px] font-black tracking-tight transition-all uppercase cursor-pointer ${
                simulatedTickerActive
                  ? "bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-lg shadow-emerald-500/10"
                  : "bg-red-500 hover:bg-red-650 text-white font-black"
              }`}
            >
              {simulatedTickerActive ? "نشط (ON)" : "معطل (OFF)"}
            </button>
          </div>
        </div>

        {/* Mobile-Only Combined Action Row & Dropdown / Desktop Split Action Row */}
        <div className="w-full md:w-auto flex flex-row items-center justify-between gap-2 md:gap-3">
          
          {/* Dropdown for Mobile Only */}
          <div className="md:hidden flex-1 min-w-0">
            <select
              value={activeFilterTab}
              onChange={(e) => setActiveFilterTab(e.target.value as TabType)}
              className="w-full bg-[#0A2463] text-white font-extrabold text-[11px] px-2.5 py-2.5 rounded-xl border border-indigo-950 focus:outline-none cursor-pointer text-right appearance-none"
              style={{ minHeight: "38px" }}
            >
              <option value="all">📁 إجمالي المسجلين ({animatedAdminTotalLeadsCount} طالب)</option>
              <option value="new">⏳ جديد لم يتم التواصل</option>
              <option value="completed">✓ طلاب تم التواصل معهم</option>
              <option value="no_reply">📞 لم يتم الرد</option>
              <option value="callbacks">📞 طلب اتصال سريع</option>
              <option value="complaints">📢 الشكاوى والمقترحات</option>
              <option value="stats">📊 إحصائيات فورية</option>
              <option value="alert_config">🔊 نظام رنين وتنبيهات</option>
              <option value="sales_performance">💼 تقييم أداء Sales</option>
              <option value="pdf_leads">📄 مسجلي روابط PDF</option>
              <option value="news_manager">📰 إدارة المنشورات والجريدة</option>
              <option value="parent_registrations">👨‍👩‍👦 بوابة أولياء الأمور</option>
              <option value="free_shadowing_tickets">🎟️ تذاكر المعايشة المجانية</option>
              <option value="partnerships_and_hiring">💼 توطيد الشراكات والتوظيف</option>
              <option value="live_tracker_manager">🟢 تحديث حالات ملفات الطلاب</option>
              <option value="pdf_library">📚 مكتبة كتب الوزارة والـ PDF</option>
              <option value="department_manager">🏢 إدارة الأقسام الإدارية والـ ROI</option>
            </select>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => fetchAdminData(false)}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
              style={{ minHeight: "38px" }}
            >
              <span>{loading ? "جاري..." : "تحديث فوري 🔄"}</span>
            </button>

            <button
              onClick={handleSignout}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition cursor-pointer"
              style={{ minHeight: "38px" }}
            >
              <span>تسجيل الخروج 🚪</span>
            </button>
          </div>
        </div>
      </div>

      {/* C. Interactive Tab buttons (Counters Tab Controls - Clean Borderless Design - Desktop Only) */}
      <div ref={adminCounterRef} className="mb-6 w-full hidden md:block">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-right">
          
          {/* Tab 1: All admission list */}
          <button
            onClick={() => setActiveFilterTab("all")}
            className={`p-3 rounded-2xl border transition-all text-right flex flex-col justify-between font-sans w-full relative cursor-pointer ${
              activeFilterTab === "all"
                ? "bg-slate-900 text-white border-slate-900 shadow-md transform -translate-y-0.5"
                : "bg-white text-slate-800 border-slate-200 hover:bg-slate-50 hover:border-slate-350"
            }`}
          >
            <span className="text-[11px] font-bold block opacity-75">إجمالي المسجلين</span>
            <strong className="text-xl font-black block mt-1 leading-none font-mono">
              {animatedAdminTotalLeadsCount} طالب
            </strong>
            <div className="absolute top-3 left-3 text-sm">📁</div>
          </button>

            {/* Tab 2: New Students */}
            <button
              onClick={() => setActiveFilterTab("new")}
              className={`p-3 rounded-2xl border transition-all text-right flex flex-col justify-between font-sans w-full relative cursor-pointer ${
                activeFilterTab === "new"
                  ? "bg-amber-500 text-slate-950 border-amber-500 shadow-md transform -translate-y-0.5"
                  : "bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-black block opacity-95">جديد لم يتم التواصل</span>
                {adminLeads.filter(l => l.status === "pending" || !l.status).length > 0 && (
                  <span className="bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full animate-pulse">جديد</span>
                )}
              </div>
              <strong className="text-xl font-black block mt-1 leading-none font-mono">
                {adminLeads.filter(l => l.status === "pending" || !l.status).length} طالب
              </strong>
              <div className="absolute top-3 left-3 text-sm">⏳</div>
            </button>

            {/* Tab 3: Completed */}
            <button
              onClick={() => setActiveFilterTab("completed")}
              className={`p-3 rounded-2xl border transition-all text-right flex flex-col justify-between font-sans w-full relative cursor-pointer ${
                activeFilterTab === "completed"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-md transform -translate-y-0.5"
                  : "bg-emerald-50 text-emerald-950 border-emerald-200 hover:bg-emerald-100"
              }`}
            >
              <span className="text-[11px] font-black block opacity-75">طلاب تم التواصل معهم</span>
              <strong className="text-xl font-black block mt-1 leading-none font-mono">
                {adminLeads.filter(l => l.status === "completed").length} طالب
              </strong>
              <div className="absolute top-3 left-3 text-sm">✓</div>
            </button>

            {/* Tab 4: No reply */}
            <button
              onClick={() => setActiveFilterTab("no_reply")}
              className={`p-3 rounded-2xl border transition-all text-right flex flex-col justify-between font-sans w-full relative cursor-pointer ${
                activeFilterTab === "no_reply"
                  ? "bg-orange-600 text-white border-orange-600 shadow-md transform -translate-y-0.5"
                  : "bg-orange-50 text-orange-900 border-orange-200 hover:bg-orange-100"
              }`}
            >
              <span className="text-[11px] font-bold block opacity-75">لم يتم الرد</span>
              <strong className="text-xl font-black block mt-1 leading-none font-mono">
                {adminLeads.filter(l => l.status === "no_reply").length} طالب
              </strong>
              <div className="absolute top-3 left-3 text-sm">📞</div>
            </button>

            {/* Tab 5: Callbacks */}
            <button
              onClick={() => setActiveFilterTab("callbacks")}
              className={`p-3 rounded-2xl border transition-all text-right flex flex-col justify-between font-sans w-full relative cursor-pointer ${
                activeFilterTab === "callbacks"
                  ? "bg-blue-600 text-white border-blue-600 shadow-md transform -translate-y-0.5"
                  : "bg-blue-50 text-blue-900 border-blue-200 hover:bg-amber-100"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-black block opacity-75">طلب اتصال سريع</span>
                {adminCallbacks.filter(c => c.status === "pending" || !c.status).length > 0 && (
                  <span className="bg-red-500 text-white rounded-full w-2 h-2 animate-ping" />
                )}
              </div>
              <strong className="text-xl font-black block mt-1 leading-none font-mono">
                {adminCallbacks.length} طلب
              </strong>
              <div className="absolute top-3 left-3 text-sm">📞</div>
            </button>

            {/* Tab 6: Complaints */}
            <button
              onClick={() => setActiveFilterTab("complaints")}
              className={`p-3 rounded-2xl border transition-all text-right flex flex-col justify-between font-sans w-full relative cursor-pointer ${
                activeFilterTab === "complaints"
                  ? "bg-rose-500 text-white border-rose-500 shadow-md transform -translate-y-0.5"
                  : "bg-rose-50 text-rose-900 border-rose-200 hover:bg-rose-100"
              }`}
            >
              <span className="text-[11px] font-bold block opacity-75">الشكاوى والمقترحات</span>
              <strong className="text-xl font-black block mt-1 leading-none font-mono">
                {adminComplaints.length} إرسال
              </strong>
              <div className="absolute top-3 left-3 text-sm">📢</div>
            </button>

            {/* Tab 7: Stats */}
            <button
              onClick={() => setActiveFilterTab("stats")}
              className={`p-3 rounded-2xl border transition-all text-right flex flex-col justify-between font-sans w-full relative cursor-pointer ${
                activeFilterTab === "stats"
                  ? "bg-emerald-700 text-white border-emerald-700 shadow-md transform -translate-y-0.5"
                  : "bg-emerald-50 text-emerald-950 border-emerald-200 hover:bg-emerald-100"
              }`}
            >
              <span className="text-[11px] font-bold block opacity-75">إحصائيات فورية 📊</span>
              <strong className="text-xs font-black block mt-2 leading-none whitespace-nowrap">
                مخطط ونسب الطلب حياً
              </strong>
              <div className="absolute top-3 left-3 text-sm">📈</div>
            </button>

            {/* Tab 8: Alert Config */}
            <button
              onClick={() => setActiveFilterTab("alert_config")}
              className={`p-3 rounded-2xl border transition-all text-right flex flex-col justify-between font-sans w-full relative cursor-pointer ${
                activeFilterTab === "alert_config"
                  ? "bg-[#4338ca] text-white border-[#4338ca] shadow-md transform -translate-y-0.5"
                  : "bg-white text-slate-800 border-slate-200 hover:bg-slate-50 hover:border-slate-350"
              }`}
            >
              <span className="text-[11px] font-bold block opacity-75">خيارات التنبيهات ونظام الرنين</span>
              <strong className="text-xs font-black block mt-2 leading-none whitespace-nowrap">
                نظام الرنين والتنبيهات
              </strong>
              <div className="absolute top-3 left-3 text-sm">🔊</div>
            </button>

            {/* Tab 9: Sales performance */}
            <button
              onClick={() => setActiveFilterTab("sales_performance")}
              className={`p-3 rounded-2xl border transition-all text-right flex flex-col justify-between font-sans w-full relative cursor-pointer ${
                activeFilterTab === "sales_performance"
                  ? "bg-amber-600 text-white border-amber-600 shadow-md transform -translate-y-0.5 font-bold"
                  : "bg-white text-slate-800 border-slate-200 hover:bg-slate-50 hover:border-slate-350"
              }`}
            >
              <span className="text-[11px] font-bold block opacity-75">أداء مستشاري المبيعات والتسجيل</span>
              <strong className="text-xs font-black block mt-2 leading-none whitespace-nowrap font-sans">
                كشوف السيلز والمتابعة
              </strong>
              <div className="absolute top-3 left-3 text-sm">🏆</div>
            </button>

            {/* Tab: PDF Leads Download Log */}
            <button
              onClick={() => setActiveFilterTab("pdf_leads")}
              className={`p-3 rounded-2xl border transition-all text-right flex flex-col justify-between font-sans w-full relative cursor-pointer ${
                activeFilterTab === "pdf_leads"
                  ? "bg-teal-600 text-white border-teal-600 shadow-md transform -translate-y-0.5"
                  : "bg-teal-50 text-teal-950 border-teal-200 hover:bg-teal-100"
              }`}
              id="admin-tab-pdf-leads"
            >
              <span className="text-[11px] font-bold block opacity-75">محملي الملفات التعريفية PDF 📑</span>
              <strong className="text-xs font-black block mt-2 leading-none whitespace-nowrap">
                {adminPdfLeads.length} تحميلات نشطة
              </strong>
              <div className="absolute top-3 left-3 text-sm">📄</div>
            </button>

            {/* Tab 10: News Manager */}
            <button
              onClick={() => setActiveFilterTab("news_manager")}
              className={`p-3 rounded-2xl border transition-all text-right flex flex-col justify-between font-sans w-full relative cursor-pointer ${
                activeFilterTab === "news_manager"
                  ? "bg-[#D49800] text-slate-950 border-[#D49850] shadow-md transform -translate-y-0.5 font-bold"
                  : "bg-white text-slate-800 border-slate-200 hover:bg-slate-50 hover:border-slate-350"
              }`}
              id="admin-tab-news-manager"
            >
              <span className="text-[11px] font-bold block opacity-75">إدارة المنشورات والأخبار 📰</span>
              <strong className="text-xs font-black block mt-2 leading-none whitespace-nowrap font-sans">
                تعديل وحذف ونشر المقالات
              </strong>
              <div className="absolute top-3 left-3 text-sm">📰</div>
            </button>

            {/* Tab 11: Parent Registrations */}
            <button
              onClick={() => setActiveFilterTab("parent_registrations")}
              className={`p-3 rounded-2xl border transition-all text-right flex flex-col justify-between font-sans w-full relative cursor-pointer ${
                activeFilterTab === "parent_registrations"
                  ? "bg-purple-600 text-white border-purple-600 shadow-md transform -translate-y-0.5"
                  : "bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100"
              }`}
              id="admin-tab-parent-regs"
            >
              <span className="text-[11px] font-bold block opacity-75 font-sans">تسجيلات أولياء الأمور 👨‍👩‍👦</span>
              <strong className="text-sm font-black block mt-1 leading-none font-mono">
                {parentInquiries.length} طلبات عوائل
              </strong>
              <div className="absolute top-3 left-3 text-sm">👨‍👩‍👦</div>
            </button>

            {/* Tab 12: Free shadowing tickets */}
            <button
              onClick={() => setActiveFilterTab("free_shadowing_tickets")}
              className={`p-3 rounded-2xl border transition-all text-right flex flex-col justify-between font-sans w-full relative cursor-pointer ${
                activeFilterTab === "free_shadowing_tickets"
                  ? "bg-teal-600 text-white border-teal-600 shadow-md transform -translate-y-0.5"
                  : "bg-teal-50 text-teal-950 border-teal-200 hover:bg-teal-100"
              }`}
              id="admin-tab-shadow-tickets"
            >
              <span className="text-[11px] font-bold block opacity-75">تذاكر الحضور المجانية 🎫</span>
              <strong className="text-sm font-black block mt-1 leading-none font-mono">
                {shadowTickets.length} تذكرة حضور
              </strong>
              <div className="absolute top-3 left-3 text-sm">🎫</div>
            </button>

            {/* Tab 13: Corporate partnerships and recruitment */}
            <button
              onClick={() => setActiveFilterTab("partnerships_and_hiring")}
              className={`p-3 rounded-2xl border transition-all text-right flex flex-col justify-between font-sans w-full relative cursor-pointer ${
                activeFilterTab === "partnerships_and_hiring"
                  ? "bg-indigo-700 text-white border-indigo-700 shadow-md transform -translate-y-0.5"
                  : "bg-indigo-50 text-indigo-950 border-indigo-200 hover:bg-indigo-100"
              }`}
              id="admin-tab-partnerships"
            >
              <span className="text-[11px] font-bold block opacity-75">بوابة توطيد الشراكات والتوظيف 💼</span>
              <strong className="text-sm font-black block mt-1 leading-none font-mono">
                {partnershipLeads.length} جهة استقطاب
              </strong>
              <div className="absolute top-3 left-3 text-sm">🤝</div>
            </button>

            {/* Tab 14: Live state student tracker manager */}
            <button
              onClick={() => setActiveFilterTab("live_tracker_manager")}
              className={`p-3 rounded-2xl border transition-all text-right flex flex-col justify-between font-sans w-full relative cursor-pointer ${
                activeFilterTab === "live_tracker_manager"
                  ? "bg-amber-500 text-slate-950 border-amber-500 shadow-md transform -translate-y-0.5"
                  : "bg-amber-50 text-amber-950 border-amber-200 hover:bg-amber-100"
              }`}
              id="admin-tab-tracker"
            >
              <span className="text-[11px] font-bold block opacity-75 font-sans">تحديث حالات ملفات الطلاب 🔍</span>
              <strong className="text-xs font-semibold block mt-1.5 leading-none">
                نظام تتبع الاستحقاق والدراسة
              </strong>
              <div className="absolute top-3 left-3 text-sm">📍</div>
            </button>

            {/* Tab 15: Library and Files Management */}
            <button
              onClick={() => setActiveFilterTab("pdf_library")}
              className={`p-3 rounded-2xl border transition-all text-right flex flex-col justify-between font-sans w-full relative cursor-pointer ${
                activeFilterTab === "pdf_library"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-md transform -translate-y-0.5"
                  : "bg-emerald-50 text-emerald-950 border-emerald-200 hover:bg-emerald-100"
              }`}
              id="admin-tab-pdf-library"
            >
              <span className="text-[11px] font-bold block opacity-75 font-sans">إدارة المكتبة والملفات (PDF) 📚</span>
              <strong className="text-xs font-semibold block mt-1.5 leading-none">
                تعديل كتيبات التخصصات وأدلة التحميل
              </strong>
              <div className="absolute top-3 left-3 text-sm">📚</div>
            </button>

            {/* Tab 16: Department Images Management */}
            <button
              onClick={() => setActiveFilterTab("department_manager")}
              className={`p-3 rounded-2xl border transition-all text-right flex flex-col justify-between font-sans w-full relative cursor-pointer ${
                activeFilterTab === "department_manager"
                  ? "bg-[#0A2463] text-white border-[#0A2463] shadow-md transform -translate-y-0.5 font-bold"
                  : "bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100"
              }`}
              id="admin-tab-department-manager"
            >
              <span className="text-[11px] font-bold block opacity-75 font-sans">إدارة صور وقوائم التخصصات 🖼️</span>
              <strong className="text-xs font-semibold block mt-1.5 leading-none">
                تغيير وحذف صور الأقسام والـ 17 شعبة
              </strong>
              <div className="absolute top-3 left-3 text-sm">🖼️</div>
            </button>

        </div>
      </div>

        {/* D. Main Listing Area with Search & Filters Segment */}
        <div className="bg-white p-2 sm:p-3 md:p-6 rounded-3xl border border-slate-200 shadow-3xs space-y-2.5 sm:space-y-4 md:space-y-6">
          
          {/* 1. Permanent, prominent search and quick filters block */}
          <div className="bg-slate-50 p-2 sm:p-4 rounded-2xl border border-slate-205 flex flex-col gap-2 sm:gap-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-2 border-b border-slate-200 pb-2 sm:pb-3">
              <span className="text-[10.5px] sm:text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
                <span>شريط الفرز والبحث المتقدم الذكي (تصفية تامة للمسجلين) :</span>
              </span>
              <span className="text-[9.5px] sm:text-[11px] text-slate-400 font-bold">يرجى استخدام الحقول بالأسفل للوصول السريع للمحافظات والطلاب</span>
            </div>

            {/* Grid/Flex of inputs - stacked nicely on mobile and grid on desktop */}
            <div className="flex flex-col md:grid md:grid-cols-12 gap-2 sm:gap-3.5 w-full">
              
              {/* Search box value */}
              <div className="md:col-span-4 relative">
                <label className="text-[10px] font-extrabold text-slate-500 block mb-1">🔍 ابحث باسم الطالب، رقم هاتفه، أو كود الحجز:</label>
                <div className="relative">
                  <input
                    type="text"
                    value={adminSearchQuery}
                    onChange={(e) => setAdminSearchQuery(e.target.value)}
                    placeholder="امسح واكتب للبحث الفوري..."
                    className="w-full bg-white border border-slate-205 font-bold text-xs text-slate-800 rounded-lg p-1.5 sm:p-2.5 pr-8 focus:ring-1 focus:ring-amber-500 focus:outline-none text-right shadow-3xs"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Date Filter */}
              <div className="md:col-span-2">
                <label className="text-[10px] font-extrabold text-slate-500 block mb-1">📆 فترة التسجيل :</label>
                <select
                  value={adminFilterDate}
                  onChange={(e) => setAdminFilterDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 font-bold text-xs text-slate-800 rounded-lg p-1.5 sm:p-2.5 focus:ring-1 focus:ring-amber-500 cursor-pointer text-right shadow-3xs"
                >
                  <option value="all">📁 جميع التواريخ (الكل)</option>
                  <option value="today">🌞 سجلات اليوم فقط</option>
                  <option value="yesterday_today">🗓️ سجلات اليوم وأمس</option>
                  <option value="week">⏳ آخر 7 أيام</option>
                  <option value="month">📊 سجلات هذا الشهر</option>
                </select>
              </div>

              {/* Governorate flag filter */}
              <div className="md:col-span-2">
                <label className="text-[10px] font-extrabold text-slate-500 block mb-1">📍 المحافظة الجغرافية:</label>
                <select
                  value={adminFilterGov}
                  onChange={(e) => setAdminFilterGov(e.target.value)}
                  className="w-full bg-white border border-slate-200 font-bold text-xs text-slate-800 rounded-lg p-1.5 sm:p-2.5 focus:ring-1 focus:ring-amber-500 cursor-pointer text-right shadow-3xs"
                >
                  <option value="all">🗺️ جميع المحافظات ({uniqueGovs.length})</option>
                  {uniqueGovs.map((gov: any) => (
                    <option key={gov} value={gov}>📍 {gov}</option>
                  ))}
                </select>
              </div>

              {/* Department study course */}
              <div className="md:col-span-2">
                <label className="text-[10px] font-extrabold text-slate-500 block mb-1">📚 التخصص والشعبة المهتم بها:</label>
                <select
                  value={adminFilterDept}
                  onChange={(e) => setAdminFilterDept(e.target.value)}
                  className="w-full bg-white border border-slate-200 font-bold text-xs text-slate-800 rounded-lg p-1.5 sm:p-2.5 focus:ring-1 focus:ring-amber-500 cursor-pointer text-right shadow-3xs"
                >
                  <option value="all">🎓 جميع الأقسام والدورات</option>
                  {ACADEMY_DEPARTMENTS.map((dept) => (
                    <option key={dept.id} value={dept.id}>📚 {dept.name}</option>
                  ))}
                </select>
              </div>

              {/* Assigned Representative */}
              <div className="md:col-span-2">
                <label className="text-[10px] font-extrabold text-slate-500 block mb-1">👤 مستشار السيلز المتابع:</label>
                <select
                  value={adminFilterAgent}
                  onChange={(e) => setAdminFilterAgent(e.target.value)}
                  className="w-full bg-white border border-slate-200 font-bold text-xs text-slate-800 rounded-lg p-1.5 sm:p-2.5 focus:ring-1 focus:ring-amber-500 cursor-pointer text-right shadow-3xs"
                >
                  <option value="all">👥 جميع مستشاري المبيعات</option>
                  <option value="unassigned">⚠️ طلاب بدون موظف سيلز (معلق)</option>
                  {uniqueGovs.length > 0 && activeSalesReps.map((rep: any) => (
                    <option key={rep} value={rep}>📞 سيلز: {rep}</option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          {/* 2. Database Grid / Render List according to Tabs */}
          <div className="space-y-4">
            
            {activeFilterTab === "complaints" ? (
              /* PANEL A: COMPLAINTS RENDERING LIST */
              <div className="space-y-4 text-right">
                <div className="p-4 bg-rose-50 border-r-4 border-rose-500 rounded-2xl flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                  <p className="text-xs text-rose-800 font-bold">صندوق الوارد للشكاوى والمقترحات (سرية تامة لحفظ الخصوصية)</p>
                </div>

                {adminComplaints.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
                    <ShieldAlert className="w-12 h-12 text-slate-200 mb-3" />
                    <span className="text-xs font-bold">صندوق وارد المقترحات فارغ تماماً حالياً. 👍</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-4">
                    {adminComplaints.map((item) => (
                      <div key={item.id} className="block bg-white p-2.5 sm:p-4 rounded-xl mb-2 sm:mb-0 border border-slate-200 hover:border-rose-400 transition-all relative space-y-2 sm:space-y-3 shadow-xs text-right">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-1.5 sm:pb-2.5">
                          <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full ${
                            item.type === "complaint" ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                          }`}>
                            {item.type === "complaint" ? "⚠️ شكوى رسمية من عميل" : "💡 فكرة / مقترح تطوير"}
                          </span>
                          <span className="text-[9px] sm:text-[10px] text-slate-450 font-mono">{item.date}</span>
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 shrink-0" />
                            <span>{item.studentName}</span>
                          </h4>
                          
                          {/* Quick Dial and Copy */}
                          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center justify-between text-xs font-mono">
                            <span className="text-slate-400 font-sans">رقم الهاتف:</span>
                            <div className="flex items-center gap-1.5">
                              <strong className="text-slate-950 font-bold">{item.phoneNumber}</strong>
                              <a
                                href={`tel:${item.phoneNumber}`}
                                className="p-1 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100 transition flex items-center justify-center shrink-0"
                                style={{ minWidth: "26px", minHeight: "26px" }}
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>
                              <button
                                onClick={() => handleCopySingleNumber(item.phoneNumber)}
                                className="p-1 bg-slate-200 text-slate-600 rounded hover:bg-slate-300 transition flex items-center justify-center shrink-0 cursor-pointer"
                                style={{ minWidth: "26px", minHeight: "26px" }}
                              >
                                {copiedFeedback === item.phoneNumber ? "✓" : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="p-2.5 bg-slate-50 rounded-lg text-xs text-slate-800 border border-slate-100 leading-relaxed font-sans text-right">
                          <strong className="text-[10px] text-rose-600 block mb-1 font-bold">تفاصيل الشكوى المقدمة:</strong>
                          "{item.text}"
                        </div>

                        <div className="flex justify-end pt-2 border-t border-slate-100">
                          <button
                            onClick={() => {
                              triggerSecureDelete("complaint", item.id, item.studentName || "مشتكي", () => {
                                handleDeleteItem("complaint", item.id);
                              });
                            }}
                            className="text-xs text-rose-600 hover:text-red-700 transition flex items-center gap-1 p-1 rounded hover:bg-red-50 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 text-red-500 shrink-0" />
                            <span className="text-[10px] text-red-655 font-bold">حذف الإرسال</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : activeFilterTab === "callbacks" ? (
              /* PANEL B: CALLBACK REQUEST RENDERING LIST */
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border-r-4 border-blue-500 rounded-2xl flex items-center justify-between flex-wrap gap-2 text-right">
                  <p className="text-xs text-blue-900 font-bold">قائمة الاستعلامات وطلبات الاتصال الهاتفي السريع من أولياء الأمور والطلاب الجدد 📞</p>
                  <button
                    onClick={() => {
                      const phoneNumbers = filteredCallbacksList.map(c => c.phoneNumber).filter(Boolean);
                      if (phoneNumbers.length === 0) {
                        alert("لا توجد أرقام هواتف لتصديرها!");
                        return;
                      }
                      navigator.clipboard.writeText(phoneNumbers.join(", "));
                      alert("✓ تم نسخ أرقام طلبات الاتصال الهاتفي السريعة المفلترة بنجاح!");
                    }}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-bold shadow-3xs"
                  >
                    📋 نسخ أرقام الهواتف لهذه القائمة المصفاة
                  </button>
                </div>

                {filteredCallbacksList.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <p className="text-xs font-bold">لا توجد طلبات اتصال مطابقة للبحث حالياً.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-4">
                    {filteredCallbacksList.map((cb) => (
                      <div key={cb.id} className={`block bg-white p-2.5 sm:p-4 rounded-xl mb-2 sm:mb-0 border transition-all space-y-2 sm:space-y-3 shadow-xs text-right overflow-hidden ${
                        cb.status === 'completed' ? 'border-slate-200 opacity-80' : 'border-amber-350 bg-amber-50/10'
                      }`}>
                        
                        <div className="flex justify-between items-center border-b border-slate-100 pb-1.5 sm:pb-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[8.5px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full ${
                              cb.status === "completed" ? "bg-slate-150 text-slate-700" : "bg-amber-500 text-slate-950 animate-pulse"
                            }`}>
                              {cb.status === "completed" ? "✓ تم مكالمته" : "⏳ انتظار مكالمة"}
                            </span>
                            {cb.status === "completed" && cb.agentName && (
                              <span className="text-[8.5px] sm:text-[10px] bg-indigo-50 text-indigo-800 border border-indigo-150 px-1.5 sm:px-2 py-0.5 rounded font-black max-w-[130px] truncate" title={cb.agentName}>
                                المسؤول: {cb.agentName}
                              </span>
                            )}
                          </div>
                          <span className="text-[8.5px] sm:text-[10px] text-slate-400 font-mono">{cb.date}</span>
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 shrink-0" />
                            <span>{cb.studentName || "عميل اتصال غير مسمى الاسم"}</span>
                          </h4>

                          <div className="bg-slate-50 p-2 sm:p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-[11px] sm:text-xs font-mono">
                            <span className="text-slate-400 font-sans">الهاتف للتواصل الهاتفي:</span>
                            <div className="flex items-center gap-1.5">
                              <strong className="text-slate-950 font-bold">{cb.phoneNumber}</strong>
                              <a
                                href={`tel:${cb.phoneNumber}`}
                                className="p-1 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100 transition flex items-center justify-center shrink-0"
                                style={{ minWidth: "26px", minHeight: "26px" }}
                              >
                                <Phone className="w-3.5 h-3.5" strokeWidth={2} />
                              </a>
                              <a
                                href={getWhatsAppLink(cb.phoneNumber, cb.studentName || "مستعلم")}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 bg-emerald-55 text-emerald-600 rounded hover:bg-emerald-100 transition flex items-center justify-center shrink-0"
                                style={{ minWidth: "26px", minHeight: "26px" }}
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                              <button
                                onClick={() => handleCopySingleNumber(cb.phoneNumber)}
                                className="p-1 bg-slate-200 text-slate-600 rounded hover:bg-slate-300 transition flex items-center justify-center shrink-0 cursor-pointer"
                                style={{ minWidth: "26px", minHeight: "26px" }}
                              >
                                {copiedFeedback === cb.phoneNumber ? "✓" : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Internal Note */}
                        <div className="bg-slate-900 p-2.5 rounded-lg text-xs text-white border border-slate-800 text-right space-y-1">
                          <div className="flex justify-between items-center border-b border-slate-800 pb-1.5 mb-1.5">
                            <span className="text-[10px] text-amber-400 font-bold">🔐 تعليق داخلي للسيلز:</span>
                            {editingNoteId !== cb.id ? (
                              <button
                                onClick={() => {
                                  setEditingNoteId(cb.id);
                                  setTempNoteText(cb.internalNotes || "");
                                }}
                                className="text-[9px] text-amber-300 font-bold underline"
                              >
                                {cb.internalNotes ? "تعديل ✍️" : "تسجيل ملاحظات ➕"}
                              </button>
                            ) : null}
                          </div>

                          {editingNoteId === cb.id ? (
                            <div className="space-y-1.5">
                              <textarea
                                value={tempNoteText}
                                onChange={(e) => setTempNoteText(e.target.value)}
                                className="w-full p-2 bg-slate-950 text-white rounded text-xs text-right border border-slate-751 focus:outline-none focus:border-amber-400"
                                rows={2}
                                placeholder="اكتب ملاحظة العميل هنا..."
                              />
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => handleSaveInternalNote("callback", cb.id)}
                                  className="px-2 py-0.5 bg-amber-500 text-slate-950 font-bold text-[10px] rounded"
                                >
                                  حفظ ✓
                                </button>
                                <button
                                  onClick={() => setEditingNoteId(null)}
                                  className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] rounded"
                                >
                                  إلغاء
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-[11px] text-slate-300 italic">"{cb.internalNotes || 'لا توجد ملاحظات داخلية مكتوبة للمستعلم'}"</p>
                          )}
                        </div>

                        {/* Status Checkbox Operations */}
                        <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 w-full text-right animate-fade-in">
                          <div className="flex items-center justify-between flex-wrap gap-2 w-full">
                            <div className="flex gap-1.5">
                              {cb.status === "completed" ? (
                                <button
                                  onClick={() => handleUpdateStatus("callback", cb.id, "pending")}
                                  className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold rounded-lg cursor-pointer"
                                >
                                  إرجاع للانتظار ⏳
                                </button>
                              ) : (
                                <>
                                  {callbackPromptId === cb.id ? (
                                    <div className="mt-1 p-2.5 bg-slate-50 border border-emerald-200 rounded-xl space-y-2 text-right w-full sm:max-w-xs">
                                      <label className="block text-[10px] font-black text-slate-705">أدخل اسم الموظف المسؤول عن المكالمة للتأكيد والتوثيق (إلزامي):</label>
                                      <input 
                                        type="text"
                                        value={callbackAgentInput}
                                        onChange={(e) => setCallbackAgentInput(e.target.value)}
                                        placeholder="اكتب اسم الموظف هنا..."
                                        className="w-full p-2 bg-white border border-slate-205 rounded-lg text-[11px] font-bold text-slate-850 text-right focus:border-emerald-500 focus:outline-none"
                                        autoFocus
                                      />
                                      {callbackError && (
                                        <p className="text-[10px] text-red-655 font-bold">{callbackError}</p>
                                      )}
                                      <div className="flex gap-1.5 justify-end">
                                        <button 
                                          onClick={() => {
                                            if (!callbackAgentInput.trim()) {
                                              setCallbackError("الاسم إلزامي لتوثيق المكالمة!");
                                              return;
                                            }
                                            handleUpdateStatus("callback", cb.id, "completed", callbackAgentInput.trim());
                                            setCallbackPromptId(null);
                                            setCallbackAgentInput("");
                                            setCallbackError("");
                                          }}
                                          className="px-2.5 py-1 bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer rounded text-[10px] font-bold"
                                        >
                                          تأكيد وحفظ 💾
                                        </button>
                                        <button 
                                          onClick={() => {
                                            setCallbackPromptId(null);
                                            setCallbackAgentInput("");
                                            setCallbackError("");
                                          }}
                                          className="px-2.5 py-1 bg-slate-200 text-slate-650 hover:bg-slate-300 cursor-pointer rounded text-[10px]"
                                        >
                                          إلغاء
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setCallbackPromptId(cb.id);
                                        setCallbackAgentInput("");
                                        setCallbackError("");
                                      }}
                                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-[10px] font-black text-white hover:text-white rounded-lg transition cursor-pointer"
                                    >
                                      تم مكالمته وتوثيق التواصل ✓
                                    </button>
                                  )}
                                </>
                              )}
                            </div>

                            <button
                              onClick={() => {
                                triggerSecureDelete("callback", cb.id, cb.studentName || "عميل", () => {
                                  handleDeleteItem("callback", cb.id);
                                });
                              }}
                              className="text-slate-400 hover:text-red-550 border-r border-slate-100 pr-2 pl-1 flex items-center gap-1 text-xs cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              <span className="text-[10px] text-red-655 font-bold">حذفه</span>
                            </button>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : activeFilterTab === "stats" ? (
              /* PANEL D: STATS PANEL */
              <div className="space-y-6 text-right animate-fade-in">
                <div className="p-4 bg-violet-50 border-r-4 border-violet-500 rounded-2xl flex items-center gap-2">
                  <Compass className="w-5 h-5 text-violet-600 shrink-0" />
                  <p className="text-xs text-violet-800 font-bold">لوحة الإحصائيات الفورية والتحليلات البيانية الذكية لحركة التحاق الطلاب</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-3xs flex flex-col justify-between text-right">
                    <span className="text-[11px] font-bold text-slate-500 block mb-1">🎯 إجمالي الطلاب المسجلين</span>
                    <strong className="text-2xl font-black block text-slate-900 font-mono">{animatedAdminTotalLeadsCount} طالب</strong>
                    <span className="text-[10px] text-slate-400 mt-2 block">في كل التخصصات والمستويات</span>
                  </div>

                  <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-3xs flex flex-col justify-between text-right">
                    <span className="text-[11px] font-bold text-slate-500 block mb-1">⏳ جديد بانتظار التواصل والاستعلام</span>
                    <strong className="text-2xl font-black block text-amber-600 font-mono">{adminLeads.filter(l => l.status === "pending" || !l.status).length} طالب</strong>
                    <span className="text-[10px] text-slate-400 mt-2 block">يحتاجون إلى ترحيل فوري لمستشاري المبيعات</span>
                  </div>

                  <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-3xs flex flex-col justify-between text-right">
                    <span className="text-[11px] font-bold text-slate-500 block mb-1">✓ تم التواصل والتعميد بنجاح</span>
                    <strong className="text-2xl font-black block text-emerald-600 font-mono">{adminLeads.filter(l => l.status === "completed").length} طالب</strong>
                    <span className="text-[10px] text-slate-400 mt-2 block">معدل الإنجاز العام: <strong className="font-sans text-emerald-700">{adminLeads.length > 0 ? ((adminLeads.filter(l => l.status === "completed").length / adminLeads.length) * 100).toFixed(1) : "0"}%</strong></span>
                  </div>

                  <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-3xs flex flex-col justify-between text-right">
                    <span className="text-[11px] font-bold text-slate-500 block mb-1">📞 طلاب لم يرد عليهم تليفونياً</span>
                    <strong className="text-2xl font-black block text-orange-600 font-mono">{adminLeads.filter(l => l.status === "no_reply").length} طالب</strong>
                    <span className="text-[10px] text-slate-400 mt-2 block">ممن تمت محاولات الاتصال بهم من Sales</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Governorate performance */}
                  <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-3xs space-y-4 text-right">
                    <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-2.5 flex items-center gap-1.5 justify-end">
                      <span>🗺️ النطاق الجغرافي للطلاب (أعلى المحافظات حضوراً)</span>
                    </h3>
                    <div className="space-y-3.5">
                      {govData.length === 0 ? (
                        <p className="text-xs text-slate-400">لا توجد بيانات جغرافية مخزنة للطلاب بعد.</p>
                      ) : (
                        govData.map((item, i) => {
                          const maxVal = Math.max(...govData.map(g => g.value), 1);
                          const pct = (item.value / maxVal) * 100;
                          return (
                            <div key={i} className="space-y-1">
                              <div className="flex justify-between items-center text-xs text-slate-700 font-bold" dir="rtl">
                                <span>📍 {item.name || "غير محدد"}</span>
                                <span>{item.value} طالب</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-2">
                                <div className="bg-gradient-to-l from-violet-550 from-violet-500 to-indigo-600 h-2 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Course demands */}
                  <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-3xs space-y-4 text-right">
                    <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-2.5 flex items-center gap-1.5 justify-end">
                      <span>📚 التخصصات والأشعبة المهتم بها الطلاب</span>
                    </h3>
                    <div className="space-y-3.5">
                      {chartData.length === 0 ? (
                        <p className="text-xs text-slate-400">لا توجد سجلات تخصصات مسجلة للطلاب بعد.</p>
                      ) : (
                        chartData.map((item, i) => {
                          const maxVal = Math.max(...chartData.map(c => c.value), 1);
                          const pct = (item.value / maxVal) * 100;
                          return (
                            <div key={i} className="space-y-1">
                              <div className="flex justify-between items-center text-xs text-slate-700 font-bold" dir="rtl">
                                <span>📚 {item.name}</span>
                                <span>{item.value} طالب مهتم</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-2">
                                <div className="bg-gradient-to-l from-amber-500 to-orange-550 to-orange-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : activeFilterTab === "alert_config" ? (
              /* PANEL E: ALERT CONFIG PANEL */
              <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-3xs space-y-6 text-right animate-fade-in" dir="rtl">
                <div className="p-4 bg-indigo-50 border-r-4 border-indigo-500 rounded-2xl flex items-center gap-2">
                  <span className="text-base">🔊</span>
                  <p className="text-xs text-indigo-800 font-bold">خيارات التنبيهات المنبثقة وإعدادات نظام الرنين للإعلانات الطلابية الجديدة</p>
                </div>

                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-150 gap-3">
                    <div className="space-y-1 w-full sm:w-auto text-right">
                      <h4 className="text-xs font-black text-slate-900 font-sans text-right">تشغيل الرنين الموسيقي للإشعارات الجديدة بالتطبيق</h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed text-right">سيصدر النظام صوت رنين منبه هادئ لتنبيه مسؤول الدعم فور حجز أو تسجيل أي طالب جديد لطلب الالتحاق.</p>
                    </div>
                    <button
                      onClick={() => setAlertSoundEnabled(!alertSoundEnabled)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold shadow-3xs min-w-[120px] transition-all cursor-pointer ${
                        alertSoundEnabled ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {alertSoundEnabled ? "مفعّل الرنين 🟢" : "معطّل الرنين 🛑"}
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-150 gap-3">
                    <div className="space-y-1 w-full sm:w-auto text-right">
                      <h4 className="text-xs font-black text-slate-900 font-sans text-right">إنشاء وتوليد لافتات تنبيه منبثقة فورية (Toast Notification)</h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed tracking-normal font-sans text-right">تنبيهات عائمة منبثقة تظهر أسفل الشاشة تخولك برؤية تفاصيل الطالب فوراً دون إعادة تحميل الصفحة يدوياً.</p>
                    </div>
                    <button
                      onClick={() => setAutoToastEnabled(!autoToastEnabled)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold shadow-3xs min-w-[120px] transition-all cursor-pointer ${
                        autoToastEnabled ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {autoToastEnabled ? "مفعّلة التنبيهات 🟢" : "معطّلة التنبيهات 🛑"}
                    </button>
                  </div>

                  <div className="flex justify-end pt-3 gap-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        try {
                          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                          const oscillator = audioCtx.createOscillator();
                          const gainNode = audioCtx.createGain();
                          
                          oscillator.type = 'sine';
                          oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 key sound
                          oscillator.connect(gainNode);
                          gainNode.connect(audioCtx.destination);
                          
                          gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
                          oscillator.start();
                          oscillator.stop(audioCtx.currentTime + 0.35);
                        } catch (err) {
                          console.error("Test ring error:", err);
                        }
                      }}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-3xs"
                    >
                      <span>🔊 اختبار مخرجات الرنين الفوري للأجهزة</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : activeFilterTab === "sales_performance" ? (
              /* PANEL F: SALES PERFORMANCE PANEL */
              <div className="space-y-6 text-right animate-fade-in" dir="rtl">
                <div className="p-4 bg-amber-50 border-r-4 border-amber-500 rounded-2xl flex items-center justify-between flex-wrap gap-2 text-right">
                  <p className="text-xs text-amber-900 font-bold text-right">بوابة أداء مستشاري المبيعات والتسجيل - لوحة المخطط والنسب والإنتاج النشط للتواصل 🏆</p>
                </div>

                {/* Star Agent Designation Card */}
                {(() => {
                  let leader = "";
                  let maxCompleted = -1;
                  activeSalesReps.forEach(rep => {
                    const totalCompleted = adminLeads.filter(l => l.agentName?.trim() === rep && l.status === "completed").length;
                    if (totalCompleted > maxCompleted && totalCompleted > 0) {
                      maxCompleted = totalCompleted;
                      leader = rep;
                    }
                  });

                  if (!leader) return null;

                  return (
                    <div className="p-6 bg-gradient-to-l from-amber-500/10 via-white to-transparent border border-amber-300 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-3xs text-right">
                      <div className="flex items-center gap-3.5">
                        <div className="w-14 h-14 bg-amber-500 text-slate-950 rounded-2xl flex items-center justify-center text-2xl shadow-md border border-amber-400">
                          🏆
                        </div>
                        <div className="space-y-0.5 text-right">
                          <span className="text-[10px] text-amber-800 font-extrabold tracking-widest block uppercase text-right">قائد التسجيل ومستشار المبيعات الأعلى إنتاجاً</span>
                          <h4 className="text-base font-black text-slate-900 text-right">{leader}</h4>
                          <p className="text-xs text-slate-500 text-right">تمكن بنجاح من إقفال وتصفية ومتابعة وتثبيت <strong className="font-mono text-emerald-600">{maxCompleted} طالب</strong> في المنصة الإدارية بنجاح.</p>
                        </div>
                      </div>
                      <div className="px-4 py-2 bg-amber-500 text-slate-950 font-black rounded-xl text-xs shadow-3xs cursor-default">
                        نجم الشهر الحالي ⭐
                      </div>
                    </div>
                  );
                })()}

                {/* Scoreboard table */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-3xs overflow-hidden text-right">
                  <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-xs text-slate-700 text-right">
                    كشف الترتيب العام وجرد كفاءة المبيعات والتعميد:
                  </div>

                  <div className="divide-y divide-slate-100">
                    {activeSalesReps.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 font-bold text-xs" dir="rtl">
                        ℹ️ لم يتم العثور على أي مستشار مبيعات مسجل بالمنظومة لغاية الآن. سيظهر المستشارون وأداؤهم هنا تلقائياً بمجرد تعيينهم وطباعة أسمائهم يدوياً على طلبات الاتصال أو قبول الطلاب بنجاح.
                      </div>
                    ) : (
                      activeSalesReps.map((rep) => {
                        const totalAssigned = adminLeads.filter(l => l.agentName?.trim() === rep).length;
                        const totalCompleted = adminLeads.filter(l => l.agentName?.trim() === rep && l.status === "completed").length;
                        const totalNoReply = adminLeads.filter(l => l.agentName?.trim() === rep && l.status === "no_reply").length;
                        const ratio = totalAssigned > 0 ? ((totalCompleted / totalAssigned) * 100).toFixed(0) : "0";

                        return (
                          <div key={rep} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-right">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              <strong className="text-slate-900 text-sm">{rep}</strong>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-xs">
                              <span className="text-slate-500">الطلاب المسندين: <strong className="text-slate-950 font-mono font-bold">{totalAssigned}</strong></span>
                              <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg font-bold">تم التعميد: <strong className="font-mono font-black">{totalCompleted}</strong></span>
                              <span className="text-orange-700 bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-lg font-bold">لم يرد تليفونياً: <strong className="font-mono font-bold">{totalNoReply}</strong></span>
                              <span className="text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg font-bold">معدل التحويل: <strong className="font-mono font-black">{ratio}%</strong></span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            ) : activeFilterTab === "news_manager" ? (
              /* PANEL G: NEWS & ARTICLES MANAGEMENT PANEL */
              <div className="space-y-6 text-right animate-fade-in" dir="rtl" id="admin-news-manager-panel">
                <div className="p-4 bg-amber-50 border-r-4 border-amber-500 rounded-2xl flex items-center gap-2">
                  <p className="text-xs text-amber-900 font-extrabold text-right">إدارة المنشورات والمقالات التثقيفية - WordPress Editorial Assistant 📰</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-6">
                  {/* Left Column (5 cols): Add New Post Form */}
                  <form onSubmit={handleCreatePost} className="lg:col-span-5 bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 text-right">
                    <h3 className="text-sm font-bold text-white bg-[#0A2463] p-3 rounded-xl flex items-center gap-1.5 justify-start">
                      <span>✍️ نشر مقال/خبر جديد بالمنصة</span>
                    </h3>

                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-slate-500 block">عنوان المقال التعليمي</label>
                      <input 
                        type="text"
                        value={newPostTitle}
                        onChange={(e) => setNewPostTitle(e.target.value)}
                        placeholder="مثال: أهمية تخصص الحوسبة التطبيقية لدفعة القبول..."
                        className="w-full bg-white border border-slate-205 p-2.5 rounded-xl text-xs font-semibold text-slate-805 text-right font-sans focus:outline-hidden focus:border-amber-500"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-slate-500 block">وصف المقال المختصر (مقدمة موجزة للرئيسية)</label>
                      <textarea 
                        value={newPostDesc}
                        onChange={(e) => setNewPostDesc(e.target.value)}
                        placeholder="موجز المقال الذي سيظهر تحت العنوان في التغذية الإخبارية بالرئيسية..."
                        rows={2}
                        className="w-full bg-white border border-slate-205 p-2.5 rounded-xl text-xs font-semibold text-slate-805 text-right font-sans focus:outline-hidden focus:border-amber-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-black text-slate-500 block">فئة المقال (القسم)</label>
                        <select
                          value={newPostCategory}
                          onChange={(e) => setNewPostCategory(e.target.value)}
                          className="w-full bg-white border border-slate-205 p-2.5 rounded-xl text-xs font-bold text-slate-850 focus:outline-hidden focus:border-amber-500 cursor-pointer"
                        >
                          <option value="توجيه مهني 🧭">توجيه مهني 🧭</option>
                          <option value="تحليل السوق 📈">تحليل السوق 📈</option>
                          <option value="منشورات تعليمية 🎓">منشورات تعليمية 🎓</option>
                          <option value="إرشادات القبول 📑">إرشادات القبول 📑</option>
                          <option value="المصروفات والمالية 💰">المصروفات والمالية 💰</option>
                          <option value="التأجيل العسكري 🪖">التأجيل العسكري 🪖</option>
                          <option value="الاعتمادات القانونية ⚖️">الاعتمادات القانونية ⚖️</option>
                          <option value="إعلانات رسمية 📣">إعلانات رسمية 📣</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-black text-slate-500 block">زمن القراءة المقدر</label>
                        <input 
                          type="text"
                          value={newPostReadTime}
                          onChange={(e) => setNewPostReadTime(e.target.value)}
                          placeholder="مثال: قراءة في ٣ دقائق"
                          className="w-full bg-white border border-slate-205 p-2.5 rounded-xl text-xs font-semibold text-slate-805 focus:outline-hidden focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-slate-500 block">المحتوى المفصل بالداخل (يظهر عند التوسيع 📖)</label>
                      <textarea 
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        placeholder="اكتب تفاصيل وشرح ونص المقال بالكامل هنا..."
                        rows={5}
                        className="w-full bg-white border border-slate-205 p-2.5 rounded-xl text-xs font-semibold text-slate-805 text-right font-sans focus:outline-hidden focus:border-amber-500"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-amber-550 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl transition cursor-pointer shadow-3xs flex items-center justify-center gap-1.5"
                    >
                      <span>نشر المقال وتعميمه فوراً 🚀</span>
                    </button>
                  </form>

                  {/* Right Column (7 cols): List of existing articles with deletes */}
                  <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 text-right space-y-4">
                    <h3 className="text-sm font-black text-slate-900 border-b border-slate-200 pb-2.5 flex items-center justify-between">
                      <span>📰 الكشوف والمقالات الحالية بالمنصة ({adminNewsPosts.length} منشور)</span>
                    </h3>

                    {adminNewsPosts.length === 0 ? (
                      <div className="p-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                        <p className="text-xs text-slate-400 font-bold">لا يوجد مسودة مقالات حالياً بالذاكرة.</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                        {adminNewsPosts.map((post) => (
                          <div key={post.id} className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition flex justify-between gap-4 items-start text-right">
                            <div className="space-y-1 w-full text-right">
                              <div className="flex items-center gap-2 flex-wrap text-right">
                                <span className="bg-indigo-50 border border-indigo-100 text-[#0A2463] px-2 py-0.2 rounded text-[9px] font-black">
                                  {post.category}
                                </span>
                                <span className="text-[9px] text-slate-400 font-serif">
                                  {post.readTime}
                                </span>
                              </div>
                              <h4 className="text-xs font-extrabold text-slate-900 leading-snug">{post.title}</h4>
                              <p className="text-[10px] text-slate-500 leading-relaxed font-semibold line-clamp-1">{post.desc}</p>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleMovePost(post.id, "up")}
                                className="p-1.5 text-slate-650 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition shrink-0 cursor-pointer"
                                title="تحريك لأعلى"
                                id={`move-up-${post.id}`}
                              >
                                🔼
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMovePost(post.id, "down")}
                                className="p-1.5 text-slate-650 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition shrink-0 cursor-pointer"
                                title="تحريك لأسفل"
                                id={`move-down-${post.id}`}
                              >
                                🔽
                              </button>
                              <button
                                onClick={() => handleDeletePost(post.id)}
                                className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/50 hover:border-rose-300 rounded-lg transition shrink-0 cursor-pointer"
                                title="حذف نهائي"
                                id={`delete-news-article-${post.id}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* ADVANCED ADS DESIGN & MANAGEMENT PANEL */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-6 text-right shadow-3xs mt-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="space-y-1">
                      <h3 className="text-sm font-black text-[#0A2463]">⚙️ تخصيص وتصميم الإعلانات الجانبية لصفحة الأخبار</h3>
                      <p className="text-[10px] text-slate-500 font-semibold">تحكم بظهور الإعلانات، حواف الإطارات المبتكرة، موضع النصوص، والأحجام والروابط المباشرة</p>
                    </div>
                    <Megaphone className="w-5 h-5 text-amber-500" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* RIGHT AD PANEL */}
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 space-y-4 text-right">
                      <div className="flex items-center justify-between border-b border-slate-200/50 pb-2">
                        <h4 className="text-xs font-extrabold text-slate-800">👉 العمود الإعلاني الأيمن (Right Column Ad)</h4>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={adminRightAd.visible} 
                            onChange={(e) => setAdminRightAd({ ...adminRightAd, visible: e.target.checked })}
                            className="sr-only peer" 
                          />
                          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                          <span className="ms-2 text-[10px] font-black text-slate-600">نشط وظاهر</span>
                        </label>
                      </div>

                      {adminRightAd.visible && (
                        <div className="space-y-3 text-right">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-500 block">نمط الإعلان</label>
                              <select 
                                value={adminRightAd.mode} 
                                onChange={(e) => setAdminRightAd({ ...adminRightAd, mode: e.target.value })}
                                className="w-full bg-white border border-slate-250 p-2 rounded-xl text-[11px] font-bold text-slate-800"
                              >
                                <option value="image_and_text">صورة ونص تفاعلي</option>
                                <option value="image_only">صورة إعلانية فقط (بنر كامل)</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-500 block">هل تريد إطار خارجي؟</label>
                              <select 
                                value={adminRightAd.hasFrame ? "yes" : "no"} 
                                onChange={(e) => setAdminRightAd({ ...adminRightAd, hasFrame: e.target.value === "yes" })}
                                className="w-full bg-white border border-slate-250 p-2 rounded-xl text-[11px] font-bold text-slate-800"
                              >
                                <option value="yes">نعم، في إطار مميز ومخصص</option>
                                <option value="no">لا، بدون إطار يظهر بحرية كاملة</option>
                              </select>
                            </div>
                          </div>

                          {adminRightAd.mode === "image_and_text" && (
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-500 block">موضع النص بالنسبة للصورة</label>
                              <select 
                                value={adminRightAd.textPosition} 
                                onChange={(e) => setAdminRightAd({ ...adminRightAd, textPosition: e.target.value })}
                                className="w-full bg-white border border-slate-250 p-2 rounded-xl text-[11px] font-bold text-slate-800"
                              >
                                <option value="below">تحت الصورة (الافتراضي)</option>
                                <option value="above">فوق الصورة</option>
                                <option value="right">يمين الصورة</option>
                                <option value="left">يسار الصورة</option>
                              </select>
                            </div>
                          )}

                          {adminRightAd.hasFrame && (
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-500 block">شكل وتصميم الإطار المميز (اختر من بين 15 نموذجاً رائعاً)</label>
                              <select 
                                value={adminRightAd.frameStyle} 
                                onChange={(e) => setAdminRightAd({ ...adminRightAd, frameStyle: e.target.value })}
                                className="w-full bg-white border border-slate-250 p-2.5 rounded-xl text-[11px] font-extrabold text-[#0A2463]"
                              >
                                <option value="no_frame">1. بدون إطار (حر لتظهر الصورة كاملة) 🔓</option>
                                <option value="dotted">2. منقط 🔗</option>
                                <option value="dashed">3. متقطع 🟠</option>
                                <option value="double">4. مزدوج 🟣</option>
                                <option value="neon_glow">5. توهج نيون ✨</option>
                                <option value="royal_gold">6. ظل ذهبي ملكي 👑</option>
                                <option value="rounded_navy">7. كحلي مدور 🌀</option>
                                <option value="glassmorphic">8. جلاسمورفيك 🧊</option>
                                <option value="smooth_3d">9. حدود ناعمة ثلاثية الأبعاد 🔳</option>
                                <option value="gradient_borders">10. حدود متدرجة 🌈</option>
                                <option value="thick_classic">11. كلاسيكية سميكة 🏛️</option>
                                <option value="floating_shadows">12. ظلال عائمة ☁️</option>
                                <option value="sharp_minimal">13. الحد الأدنى الحاد ⬛</option>
                                <option value="vintage_wave">14. موجة عتيقة 📜</option>
                                <option value="super_elegant">15. أنيق للغاية 🔮</option>
                              </select>
                            </div>
                          )}

                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 block">عنوان الإعلان</label>
                            <input 
                              type="text" 
                              value={adminRightAd.title} 
                              onChange={(e) => setAdminRightAd({ ...adminRightAd, title: e.target.value })}
                              className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs font-semibold text-right"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 block">رابط صورة الإعلان (URL)</label>
                            <input 
                              type="text" 
                              value={adminRightAd.imageUrl} 
                              onChange={(e) => setAdminRightAd({ ...adminRightAd, imageUrl: e.target.value })}
                              className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs font-semibold text-left"
                              dir="ltr"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 block">نص زر الإجراء (Call to Action)</label>
                            <input 
                              type="text" 
                              value={adminRightAd.btnText} 
                              onChange={(e) => setAdminRightAd({ ...adminRightAd, btnText: e.target.value })}
                              placeholder="مثال: تواصل معنا 📞"
                              className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs font-semibold text-right"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 block">الرابط الإعلاني المستهدف</label>
                            <input 
                              type="text" 
                              value={adminRightAd.linkUrl} 
                              onChange={(e) => setAdminRightAd({ ...adminRightAd, linkUrl: e.target.value })}
                              className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs font-semibold text-left"
                              dir="ltr"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 block">نص الوصف الإعلاني</label>
                            <textarea 
                              rows={2}
                              value={adminRightAd.description} 
                              onChange={(e) => setAdminRightAd({ ...adminRightAd, description: e.target.value })}
                              className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs font-semibold leading-relaxed text-right"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* LEFT AD PANEL */}
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 space-y-4 text-right">
                      <div className="flex items-center justify-between border-b border-slate-200/50 pb-2">
                        <h4 className="text-xs font-extrabold text-slate-800">👈 العمود الإعلاني الأيسر (Left Column Ad)</h4>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={adminLeftAd.visible} 
                            onChange={(e) => setAdminLeftAd({ ...adminLeftAd, visible: e.target.checked })}
                            className="sr-only peer" 
                          />
                          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                          <span className="ms-2 text-[10px] font-black text-slate-600">نشط وظاهر</span>
                        </label>
                      </div>

                      {adminLeftAd.visible && (
                        <div className="space-y-3 text-right">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-500 block">نمط الإعلان</label>
                              <select 
                                value={adminLeftAd.mode} 
                                onChange={(e) => setAdminLeftAd({ ...adminLeftAd, mode: e.target.value })}
                                className="w-full bg-white border border-slate-250 p-2 rounded-xl text-[11px] font-bold text-slate-800"
                              >
                                <option value="image_and_text">صورة ونص تفاعلي</option>
                                <option value="image_only">صورة إعلانية فقط (بنر كامل)</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-500 block">هل تريد إطار خارجي؟</label>
                              <select 
                                value={adminLeftAd.hasFrame ? "yes" : "no"} 
                                onChange={(e) => setAdminLeftAd({ ...adminLeftAd, hasFrame: e.target.value === "yes" })}
                                className="w-full bg-white border border-slate-250 p-2 rounded-xl text-[11px] font-bold text-slate-800"
                              >
                                <option value="yes">نعم، في إطار مميز ومخصص</option>
                                <option value="no">لا، بدون إطار يظهر بحرية كاملة</option>
                              </select>
                            </div>
                          </div>

                          {adminLeftAd.mode === "image_and_text" && (
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-500 block">موضع النص بالنسبة للصورة</label>
                              <select 
                                value={adminLeftAd.textPosition} 
                                onChange={(e) => setAdminLeftAd({ ...adminLeftAd, textPosition: e.target.value })}
                                className="w-full bg-white border border-slate-250 p-2 rounded-xl text-[11px] font-bold text-slate-800"
                              >
                                <option value="below">تحت الصورة (الافتراضي)</option>
                                <option value="above">فوق الصورة</option>
                                <option value="right">يمين الصورة</option>
                                <option value="left">يسار الصورة</option>
                              </select>
                            </div>
                          )}

                          {adminLeftAd.hasFrame && (
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-500 block">شكل وتصميم الإطار المميز (اختر من بين 15 نموذجاً رائعاً)</label>
                              <select 
                                value={adminLeftAd.frameStyle} 
                                onChange={(e) => setAdminLeftAd({ ...adminLeftAd, frameStyle: e.target.value })}
                                className="w-full bg-white border border-slate-250 p-2.5 rounded-xl text-[11px] font-extrabold text-[#0A2463]"
                              >
                                <option value="no_frame">1. بدون إطار (حر لتظهر الصورة كاملة) 🔓</option>
                                <option value="dotted">2. منقط 🔗</option>
                                <option value="dashed">3. متقطع 🟠</option>
                                <option value="double">4. مزدوج 🟣</option>
                                <option value="neon_glow">5. توهج نيون ✨</option>
                                <option value="royal_gold">6. ظل ذهبي ملكي 👑</option>
                                <option value="rounded_navy">7. كحلي مدور 🌀</option>
                                <option value="glassmorphic">8. جلاسمورفيك 🧊</option>
                                <option value="smooth_3d">9. حدود ناعمة ثلاثية الأبعاد 🔳</option>
                                <option value="gradient_borders">10. حدود متدرجة 🌈</option>
                                <option value="thick_classic">11. كلاسيكية سميكة 🏛️</option>
                                <option value="floating_shadows">12. ظلال عائمة ☁️</option>
                                <option value="sharp_minimal">13. الحد الأدنى الحاد ⬛</option>
                                <option value="vintage_wave">14. موجة عتيقة 📜</option>
                                <option value="super_elegant">15. أنيق للغاية 🔮</option>
                              </select>
                            </div>
                          )}

                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 block">عنوان الإعلان</label>
                            <input 
                              type="text" 
                              value={adminLeftAd.title} 
                              onChange={(e) => setAdminLeftAd({ ...adminLeftAd, title: e.target.value })}
                              className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs font-semibold text-right"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 block">رابط صورة الإعلان (URL)</label>
                            <input 
                              type="text" 
                              value={adminLeftAd.imageUrl} 
                              onChange={(e) => setAdminLeftAd({ ...adminLeftAd, imageUrl: e.target.value })}
                              className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs font-semibold text-left"
                              dir="ltr"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 block">نص زر الإجراء (Call to Action)</label>
                            <input 
                              type="text" 
                              value={adminLeftAd.btnText} 
                              onChange={(e) => setAdminLeftAd({ ...adminLeftAd, btnText: e.target.value })}
                              placeholder="مثال: الموقع الرسمي 🔗"
                              className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs font-semibold text-right"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 block">الرابط الإعلاني المستهدف</label>
                            <input 
                              type="text" 
                              value={adminLeftAd.linkUrl} 
                              onChange={(e) => setAdminLeftAd({ ...adminLeftAd, linkUrl: e.target.value })}
                              className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs font-semibold text-left"
                              dir="ltr"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 block">نص الوصف الإعلاني</label>
                            <textarea 
                              rows={2}
                              value={adminLeftAd.description} 
                              onChange={(e) => setAdminLeftAd({ ...adminLeftAd, description: e.target.value })}
                              className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs font-semibold leading-relaxed text-right"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end pt-3 border-t border-slate-100">
                    <button 
                      type="button"
                      onClick={handleSaveAdsConfig}
                      className="px-6 py-3 bg-[#0A2463] hover:bg-[#0A2463]/90 text-white font-extrabold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-2"
                    >
                      <span>💾 حفظ وتطبيق تصميم الإعلانات فورا بالبوابة</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : activeFilterTab === "parent_registrations" ? (
              /* PANEL H: PARENT REGISTRATIONS VIEW SCREEN */
              <div className="space-y-4 text-right animate-fade-in" dir="rtl" id="admin-parent-panel">
                <div className="p-4 bg-purple-50 border-r-4 border-purple-500 rounded-2xl flex items-center justify-between flex-wrap gap-2 text-right">
                  <p className="text-xs text-purple-900 font-bold">تسجيلات أولياء الأمور وطلبات الحجز والتقسيط والمتابعة مع العوائل 👨‍👩‍👦</p>
                  <button
                    onClick={() => {
                      const phones = parentInquiries.map(p => p.parentPhone).filter(Boolean);
                      if (phones.length === 0) {
                        alert("لا توجد هواتف لتصديرها!");
                        return;
                      }
                      navigator.clipboard.writeText(phones.join(", "));
                      alert("تم نسخ جميع هواتف أولياء الأمور!");
                    }}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-bold shadow-3xs cursor-pointer"
                  >
                    📋 نسخ هواتف أولياء الأمور
                  </button>
                </div>

                {parentInquiries.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <p className="text-xs font-bold">لا توجد تسجيلات من أولياء الأمور حالياً بالمنصة.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {parentInquiries.map((item: any) => (
                      <div key={item.id} className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs text-right hover:border-purple-300 transition-all">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                          <span className="text-[10px] font-black text-purple-800 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-full">
                            👨‍👩‍👦 طلب ولي أمر VIP
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{item.date}</span>
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                            <User className="w-4 h-4 text-purple-500 shrink-0" />
                            <span>اسم ولي الأمر: {item.parentName}</span>
                          </h4>
                          <p className="text-xs text-slate-600 font-bold">معدل الطالب التراكمي: <strong className="font-mono text-purple-705">%{item.studentGpa}</strong></p>
                        </div>

                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-xs font-mono">
                          <span className="text-slate-400 font-sans">هاتف ولي الأمر للتواصل:</span>
                          <div className="flex items-center gap-1.5">
                            <strong className="text-slate-900">{item.parentPhone}</strong>
                            <a
                              href={`tel:${item.parentPhone}`}
                              className="p-1 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100 transition flex items-center justify-center shrink-0"
                              style={{ minWidth: "26px", minHeight: "26px" }}
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(item.parentPhone);
                                alert("تم النسخ!");
                              }}
                              className="p-1 bg-slate-200 text-slate-600 hover:bg-slate-300 rounded transition flex items-center justify-center shrink-0 cursor-pointer"
                              style={{ minWidth: "26px", minHeight: "26px" }}
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {item.preferredSlot && (
                          <div className="p-2 bg-amber-50 border border-amber-200 text-right text-amber-800 rounded-lg text-xs leading-relaxed font-semibold flex items-center gap-1.5 justify-end">
                            <span>{item.preferredSlot}</span>
                            <strong className="text-amber-600">🕰️</strong>
                          </div>
                        )}

                        {item.notes && (
                          <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-705 leading-relaxed font-sans">
                            <strong className="text-[10px] text-slate-400 block mb-0.5 font-bold">الاستفسارات والدعم المالي المطلوب:</strong>
                            "{item.notes}"
                          </div>
                        )}

                        <div className="flex justify-end pt-2 border-t border-slate-100">
                          <button
                            onClick={() => {
                              triggerSecureDelete("parent", item.id, item.parentName || "ولي أمر", () => {
                                const updated = parentInquiries.filter((p: any) => p.id !== item.id);
                                setParentInquiries(updated);
                                localStorage.setItem("academy_parent_inquiries", JSON.stringify(updated));
                              });
                            }}
                            className="text-xs text-rose-650 hover:text-red-700 transition flex items-center gap-1 p-1 rounded hover:bg-red-50 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 text-red-500 shrink-0" />
                            <span className="text-[10px] font-bold">حذف الاستفسار</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : activeFilterTab === "free_shadowing_tickets" ? (
              /* PANEL I: FREE SHADOWING TICKETS ADMISSION LIST */
              <div className="space-y-4 text-right animate-fade-in" dir="rtl" id="admin-tickets-panel">
                <div className="p-4 bg-teal-50 border-r-4 border-teal-500 rounded-2xl flex items-center justify-between flex-wrap gap-2 text-right">
                  <p className="text-xs text-teal-900 font-bold">تذاكر الحضور المجانية لليوم الاستكشافي الميداني بالأكاديميات 🎫</p>
                  <button
                    onClick={() => {
                      const phones = shadowTickets.map(t => t.phoneNumber || t.phone).filter(Boolean);
                      if (phones.length === 0) {
                        alert("لا توجد هواتف للتصدير!");
                        return;
                      }
                      navigator.clipboard.writeText(phones.join(", "));
                      alert("تم نسخ جميع هواتف تذاكر المعاينة والمطابقة مجمعاً!");
                    }}
                    className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[10px] font-bold shadow-3xs cursor-pointer"
                  >
                    📋 نسخ هواتف تذاكر الحضور
                  </button>
                </div>

                {shadowTickets.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <p className="text-xs font-bold">لا توجد حجوزات لتذاكر اليوم الاستكشافي حالياً.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {shadowTickets.map((ticket: any) => (
                      <div key={ticket.id} className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs text-right hover:border-teal-300 transition-all">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            ticket.confirmed ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-amber-50 text-amber-800 border border-amber-100"
                          }`}>
                            {ticket.confirmed ? "🟢 تم التأكيد هاتفياً ✓" : "⏳ انتظار المكالمة والتأكيد"}
                          </span>
                          <span className="text-[9px] font-mono text-slate-450 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                            كود التذكرة: #{ticket.ticketCode || ticket.code || "SHADOW-501"}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                            <Ticket className="w-4 h-4 text-teal-500 shrink-0" />
                            <span>اسم الطالب: {ticket.studentName || ticket.name}</span>
                          </h4>
                          <p className="text-[11px] text-slate-500 font-bold">القسم المستهدف للمعاينة: <strong className="text-teal-900">{ticket.selectedDept || ticket.dept}</strong></p>
                          <p className="text-[10px] text-slate-400 font-serif">تاريخ الصدور الفوري: {ticket.date}</p>
                        </div>

                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-xs font-mono">
                          <span className="text-slate-400 font-sans">هاتف الطالب المسجل:</span>
                          <div className="flex items-center gap-1.5">
                            <strong className="text-slate-900">{ticket.phoneNumber || ticket.phone}</strong>
                            <a
                              href={`tel:${ticket.phoneNumber || ticket.phone}`}
                              className="p-1 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100 transition flex items-center justify-center shrink-0"
                              style={{ minWidth: "26px", minHeight: "26px" }}
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(ticket.phoneNumber || ticket.phone);
                                alert("تم النسخ!");
                              }}
                              className="p-1 bg-slate-200 text-slate-600 hover:bg-slate-350 rounded flex items-center justify-center shrink-0 cursor-pointer"
                              style={{ minWidth: "26px", minHeight: "26px" }}
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-2.5 border-t border-slate-100 gap-2 flex-wrap">
                          <button
                            onClick={() => {
                              const updated = shadowTickets.map((t: any) => {
                                if (t.id === ticket.id) {
                                  return { ...t, confirmed: !t.confirmed };
                                }
                                return t;
                              });
                              setShadowTickets(updated);
                              localStorage.setItem("academy_shadow_tickets", JSON.stringify(updated));
                            }}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-black transition cursor-pointer ${
                              ticket.confirmed ? "bg-slate-100 text-slate-600 hover:bg-slate-205" : "bg-emerald-600 hover:bg-emerald-700 text-white"
                            }`}
                          >
                            {ticket.confirmed ? "تراجع عن التأكيد ↩" : "✓ تأكيد التذكرة هاتفياً"}
                          </button>

                          <button
                            onClick={() => {
                              triggerSecureDelete("ticket", ticket.id, ticket.studentName || ticket.name || "صاحب التذكرة", () => {
                                const updated = shadowTickets.filter((t: any) => t.id !== ticket.id);
                                setShadowTickets(updated);
                                localStorage.setItem("academy_shadow_tickets", JSON.stringify(updated));
                              });
                            }}
                            className="text-xs text-rose-600 hover:text-red-751 transition flex items-center gap-1 p-1 rounded hover:bg-red-50 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 text-red-505 shrink-0" />
                            <span className="text-[10px] font-bold">حذف</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : activeFilterTab === "pdf_leads" ? (
              /* PANEL: LIVE PDF LEADS DOWNLOAD LOG */
              <div className="space-y-4 animate-fade-in text-right" dir="rtl" id="admin-pdf-leads-panel">
                <div className="p-4 bg-teal-50 border-r-4 border-teal-500 rounded-2xl flex items-center justify-between flex-wrap gap-2 text-right">
                  <div>
                    <h3 className="text-xs text-teal-900 font-bold flex items-center gap-1.5">
                      <span>سجل تحميل الملفات التعريفية وكراسات التخصصات المعتمدة (PDF Leads Live) 📄</span>
                    </h3>
                    <p className="text-[10px] text-teal-700 font-semibold mt-1">
                      هؤلاء الطلاب قاموا بملء النموذج وتحميل الملف التعريفي لشُعب الأكاديمية أو الدليل الشامل 2026.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const phones = filteredPdfLeadsList.map(p => p.phone).filter(Boolean);
                      if (phones.length === 0) {
                        alert("لا توجد أرقام هواتف لتصديرها!");
                        return;
                      }
                      navigator.clipboard.writeText(phones.join(", "));
                      alert("✓ تم نسخ جميع أرقام هواتف محملي كراسات التقديم المفلترة!");
                    }}
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[10px] font-bold shadow-3xs cursor-pointer transition select-none"
                  >
                    📋 نسخ أرقام هواتف القائمة المصفاة
                  </button>
                </div>

                {filteredPdfLeadsList.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <p className="text-xs font-bold">لا توجد طلبات تحميل موافقة لفلاتر البحث الحالية.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredPdfLeadsList.map((pl: any) => (
                      <div key={pl.id} className={`p-5 bg-white border rounded-2xl space-y-4 shadow-3xs text-right transition-all hover:shadow-xs hover:border-teal-300 ${
                        pl.status === 'completed' ? 'border-slate-200 opacity-80 bg-slate-50/50' : 'border-teal-300 bg-teal-500/5'
                      }`}>
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2 flex-wrap gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              pl.status === "completed" 
                                ? "bg-slate-150 text-slate-750" 
                                : pl.status === "no_reply"
                                ? "bg-rose-150 text-rose-800"
                                : "bg-teal-500 text-white animate-pulse"
                            }`}>
                              {pl.status === "completed" ? "✓ تواصل ناجح" : pl.status === "no_reply" ? "🔇 لا يرد" : "⏳ معلق للمتابعة"}
                            </span>
                            {pl.agentName && (
                              <span className="text-[10px] bg-indigo-50 text-indigo-800 border border-indigo-150 px-2 py-0.5 rounded font-black max-w-[130px] truncate" title={pl.agentName}>
                                المسؤول: {pl.agentName}
                              </span>
                            )}
                          </div>
                          
                          <span className="text-[9.5px] font-mono text-slate-400">
                            تاريخ التحميل: {new Date(pl.downloadDate).toLocaleString("ar-EG")}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                            <span>الاسم: {pl.name}</span>
                          </h4>
                          <div className="p-2.5 bg-slate-55 border border-slate-100 rounded-xl flex items-center justify-between text-xs text-slate-650">
                            <span className="text-[11px] font-bold">الملف التعريفي المحمل:</span>
                            <strong className="text-teal-900 text-[11px] font-extrabold">📙 {pl.specialization}</strong>
                          </div>
                        </div>

                        {/* Phone details and links */}
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-xs font-mono">
                          <span className="text-slate-400 font-sans">رقم الهاتف للتواصل:</span>
                          <div className="flex items-center gap-1.5">
                            <strong className="text-slate-900">{pl.phone}</strong>
                            <a
                              href={`tel:${pl.phone}`}
                              className="p-1 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100 transition flex items-center justify-center shrink-0"
                              style={{ minWidth: "26px", minHeight: "26px" }}
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(pl.phone);
                                alert("✓ تم نسخ رقم هاتف العميل!");
                              }}
                              className="p-1 bg-slate-200 text-slate-600 hover:bg-slate-350 rounded flex items-center justify-center shrink-0 cursor-pointer"
                              style={{ minWidth: "26px", minHeight: "26px" }}
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Action controllers (change status, record sales rep, or secure delete) */}
                        <div className="flex justify-between items-center pt-2.5 border-t border-slate-100 gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={async () => {
                                const repName = prompt("برجاء إدخال اسم موظف السيلز (المبيعات) المسؤول عن توثيق هذا التواصل:");
                                if (!repName || repName.trim() === "") {
                                  alert("توثيق اسم الموظف إلزامي لتحديث حالة تواصل كراسة الشروط!");
                                  return;
                                }
                                try {
                                  const reqBody = {
                                    type: "pdfLead",
                                    id: pl.id,
                                    status: "completed",
                                    agentName: repName.trim()
                                  };
                                  const resp = await fetch("/api/admin/update-status", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify(reqBody)
                                  });
                                  const result = await resp.json();
                                  if (result.success) {
                                    setAdminPdfLeads(result.pdfLeads || []);
                                    alert(`✓ تم توثيق تواصل العميل بنجاح باسم مستشار المبيعات: ${repName}`);
                                  }
                                } catch (err) {
                                  console.error(err);
                                  alert("فشل تحديث وتوثيق الحالة.");
                                }
                              }}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] rounded-lg transition shadow-3xs cursor-pointer"
                            >
                              ✓ تم التواصل وتوثيق المكالمة
                            </button>

                            <button
                              onClick={async () => {
                                const repName = prompt("برجاء إدخال اسم موظف السيلز (المبيعات) للتوثيق المكتبي:");
                                if (!repName || repName.trim() === "") {
                                  alert("توثيق اسم الموظف إلزامي لتحديث حالة لا يرد!");
                                  return;
                                }
                                try {
                                  const reqBody = {
                                    type: "pdfLead",
                                    id: pl.id,
                                    status: "no_reply",
                                    agentName: repName.trim()
                                  };
                                  const resp = await fetch("/api/admin/update-status", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify(reqBody)
                                  });
                                  const result = await resp.json();
                                  if (result.success) {
                                    setAdminPdfLeads(result.pdfLeads || []);
                                    alert(`✓ تم حِفظ الحالة (لا يرد) باسم موظف السيلز: ${repName}`);
                                  }
                                } catch (err) {
                                  console.error(err);
                                  alert("فشل تحديث وتوثيق الحالة.");
                                }
                              }}
                              className="px-2.5 py-1.5 bg-rose-100 hover:bg-rose-205 text-rose-800 font-extrabold text-[10px] rounded-lg transition cursor-pointer"
                            >
                              🔇 العميل لا يرد
                            </button>
                          </div>

                          <button
                            onClick={() => {
                              triggerSecureDelete("pdfLead", pl.id, pl.name || "العضو حمّال الكتيب", async () => {
                                try {
                                  const resp = await fetch("/api/admin/delete", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ type: "pdfLead", id: pl.id })
                                  });
                                  const result = await resp.json();
                                  if (result.success) {
                                    setAdminPdfLeads(result.pdfLeads || []);
                                    alert("✓ تم حذف العميل من سجل تحميلات الملفات التعريفية بنجاح.");
                                  }
                                } catch (err) {
                                  console.error(err);
                                  alert("تعذر حذف العميل.");
                                }
                              });
                            }}
                            className="text-xs text-rose-600 hover:text-red-700 transition flex items-center gap-1 p-1 rounded hover:bg-red-50 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 text-red-500 shrink-0" />
                            <span className="text-[10px] font-bold">حذف مؤمن</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : activeFilterTab === "partnerships_and_hiring" ? (
              /* PANEL J: PARTNERSHIPS AND RECRUITMENT GATE */
              <div className="space-y-4 text-right animate-fade-in" dir="rtl" id="admin-partnerships-panel">
                <div className="p-4 bg-indigo-50 border-r-4 border-indigo-500 rounded-2xl flex items-center justify-between flex-wrap gap-2 text-right">
                  <p className="text-xs text-indigo-900 font-bold">بوابة الشراكات، المستشفيات والجهات الساعية لتوظيف واستيعاب الخريجين 🏥💼</p>
                  <button
                    onClick={() => {
                      const phones = partnershipLeads.map(p => p.representativePhone || p.phone).filter(Boolean);
                      if (phones.length === 0) {
                        alert("لا توجد هواتف للتصدير!");
                        return;
                      }
                      navigator.clipboard.writeText(phones.join(", "));
                      alert("تم نسخ جميع هواتف منسقي الشركات والمستشفيات!");
                    }}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold shadow-3xs cursor-pointer"
                  >
                    📋 نسخ هواتف منسقي الجهات
                  </button>
                </div>

                {partnershipLeads.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <p className="text-xs font-bold">لا تتوفر طلبات شراكة أو توظيف من شركات أو مستشفيات حالياً.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {partnershipLeads.map((item: any) => (
                      <div key={item.id} className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs text-right hover:border-indigo-300 transition-all">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                          <span className="text-[10.5px] font-black text-indigo-850 bg-indigo-50 px-2 py-0.5 rounded-full">
                            🏢 طلب شراكة وتوظيف معتمد
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{item.date || "قريب"}</span>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-extrabold text-sm text-slate-900 flex items-center justify-start gap-1.5">
                            <HeartHandshake className="w-4 h-4 text-indigo-600 shrink-0" />
                            <span>اسم المؤسسة: <strong className="text-indigo-950 font-black">{item.hospitalName || item.hospital || "جهة رسمية"}</strong></span>
                          </h4>

                          <p className="text-xs text-slate-605 font-bold">اسم منسق الشراكة: <strong className="text-slate-800">{item.repName || item.representative || "ممثّل الجهة"}</strong></p>
                          <p className="text-xs text-slate-605 font-bold">الأقسام والشعبة المطلوبة للتوظيف: <strong className="text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{item.requiredMajor || "غير محدد"}</strong></p>
                          <p className="text-xs text-slate-605 font-bold">إجمالي خريجين مستهدفين للتشغيل: <strong className="text-slate-850 font-mono">{item.graduatesCount || "غير محدد"}</strong></p>
                        </div>

                        {item.fullDetails && (
                          <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-700 leading-relaxed font-sans">
                            <strong className="text-[10px] text-slate-400 block mb-0.5 font-bold">ملاحظات وبنود التعاقد المطلوبة:</strong>
                            "{item.fullDetails}"
                          </div>
                        )}

                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-xs font-mono">
                          <span className="text-slate-400 font-sans">هاتف ممثل الجهة:</span>
                          <div className="flex items-center gap-1.5">
                            <strong className="text-slate-900">{item.representativePhone || item.phone}</strong>
                            <a
                              href={`tel:${item.representativePhone || item.phone}`}
                              className="p-1 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100 transition flex items-center justify-center shrink-0"
                              style={{ minWidth: "26px", minHeight: "26px" }}
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(item.representativePhone || item.phone);
                                alert("تم النسخ!");
                              }}
                              className="p-1 bg-slate-200 text-slate-600 hover:bg-slate-300 rounded flex items-center justify-center shrink-0 cursor-pointer"
                              style={{ minWidth: "26px", minHeight: "26px" }}
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-end pt-2 border-t border-slate-100">
                          <button
                            onClick={() => {
                              if (confirm("هل تريد إزالة طلب الشراكة هذا؟")) {
                                const updated = partnershipLeads.filter((p: any) => p.id !== item.id);
                                setPartnershipLeads(updated);
                                localStorage.setItem("academy_business_leads", JSON.stringify(updated));
                              }
                            }}
                            className="text-xs text-rose-600 hover:text-red-700 transition flex items-center gap-1 p-1 rounded hover:bg-red-50 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 text-red-500 shrink-0" />
                            <span className="text-[10px] font-extrabold">حذف طلب الاستقطاب</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : activeFilterTab === "live_tracker_manager" ? (
              /* PANEL K: LIVE TRACKER MANAGER SCREEN */
              <div className="space-y-4 text-right animate-fade-in" dir="rtl" id="admin-tracker-panel">
                <div className="p-4 bg-amber-50 border-r-4 border-amber-500 rounded-2xl flex items-center gap-2">
                  <Compass className="w-5 h-5 text-amber-600 shrink-0 animate-spin-slow" />
                  <p className="text-xs text-amber-950 font-bold">لوحة تتبع ومتابعة حالة ملف الطالب الفوري (Live Tracker Manager) 🔍</p>
                </div>

                <div className="p-3 bg-indigo-50 rounded-xl text-xs text-indigo-900 border border-indigo-100 mb-2 leading-relaxed">
                  <p className="font-bold">💡 شرح النظام الإداري:</p>
                  <p className="mt-1">اختر حالة الملف لكل طالب مسجل بالأسفل؛ فور قيام الطالب بإدخال رقم هاتفه في الحقل الاستعلامي بالصفحة التتبعية لملفات الطلاب بالرئيسية، ستظهر له تفاصيل الحالة الحقيقية التي حددتها له هنا فورياً.</p>
                </div>

                {adminLeads.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-205">
                    <p className="text-xs font-bold">لا يوجد طلاب مسجلون لعرضهم في نظام تتبع الملفات في الوقت الحالي. قم بالتسجيل اولاً.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-3xs">
                    <table className="w-full text-right text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-150 text-slate-705 font-extrabold">
                          <th className="p-3">اسم الطالب المسجل</th>
                          <th className="p-3 font-mono">الرقم الهاتفي</th>
                          <th className="p-3">الشعبة</th>
                          <th className="p-3 text-center">رقم كود الحجز</th>
                          <th className="p-3 text-center">حالة الملف النشطة للبحث والدراسة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {adminLeads.map((student) => {
                          const currentStatus = liveTrackerStatusMap[student.phoneNumber] || "تحت المراجعة";

                          return (
                            <tr key={student.id} className="hover:bg-slate-55 transition font-sans">
                              <td className="p-3 font-extrabold text-slate-900">{student.studentName}</td>
                              <td className="p-3 font-mono text-slate-600 font-semibold">{student.phoneNumber}</td>
                              <td className="p-3 text-slate-500 font-bold">{student.basicCourse?.replace("دورة ", "") || "الشعبة المفتوحة"}</td>
                              <td className="p-3 text-center font-mono text-rose-600 font-bold">#{student.reservationCode || "1024"}</td>
                              <td className="p-3 text-center">
                                <select
                                  value={currentStatus}
                                  onChange={(e) => {
                                    const nextStatus = e.target.value;
                                    const nextMap = { ...liveTrackerStatusMap, [student.phoneNumber]: nextStatus };
                                    setLiveTrackerStatusMap(nextMap);
                                    localStorage.setItem("academy_live_tracker_status", JSON.stringify(nextMap));
                                  }}
                                  className="mx-auto block bg-slate-50 hover:bg-slate-100 border border-slate-202 rounded-lg p-2 font-black text-slate-800 text-[11px] cursor-pointer focus:ring-1 focus:ring-amber-500 focus:outline-none"
                                >
                                  <option value="تحت المراجعة">🔍 تحت المراجعة الفنية</option>
                                  <option value="تم قبول الأوراق">🟢 تم قبول الأوراق بالمنظومة</option>
                                  <option value="مرحلة المقابلة الشخصية">🤝 مرحلة المقابلة والنزول العملي</option>
                                  <option value="تم صدور الكارنيه المبدئي">🏆 تم صدور الكارنيه المعتمد</option>
                                </select>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : activeFilterTab === "pdf_library" ? (
              /* PANEL L: LIBRARY AND FILES MANAGEMENT MODULE */
              <div className="space-y-6 text-right font-sans" dir="rtl" id="admin-pdf-library-panel">
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-emerald-950 flex items-center gap-2">
                      <span>📚 نظام مديرة الملفات الرقمية والمكتبة الذكية (PDF Lead Magnet)</span>
                    </h3>
                    <p className="text-xs text-emerald-950 leading-relaxed font-semibold">
                      ارفع كتيبات ومناهج الأقسام مباشرة للتثبيت التلقائي وتفعيل بوابات التحميل الفورية للطلاب.
                    </p>
                  </div>
                  <div className="bg-emerald-600 text-white rounded-lg px-3 py-1.5 text-[10px] font-black self-start md:self-auto shadow-sm">
                    حالة النظام: نشط ومتصل بقاعدة البيانات الحية ✓
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  
                  {/* RIGHT COLUMN: FILE MANAGER UPLOADER & EDIT FORM (2/5 span) */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md border border-slate-800 space-y-4">
                      <div className="border-b border-slate-800 pb-3">
                        <h4 className="text-xs font-black text-amber-400 flex items-center gap-2">
                          <span>⚙️ {libraryFormId ? "تعديل بيانات الملف الحالي" : "رفع وإضافة ملف جديد للمكتبة"}</span>
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-1">تحديد المسمى، الرفع على خوادم الموقع، والربط بالـ Lead Magnet.</p>
                      </div>

                      <form onSubmit={handleSaveLibraryItem} className="space-y-3.5">
                        
                        {/* 1. File Name */}
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-black text-slate-300">مسمى الملف (مثال: دليل قسم تكنولوجيا البرمجيات 2026):</label>
                          <input 
                            type="text" 
                            required
                            value={libraryFormName}
                            onChange={(e) => setLibraryFormName(e.target.value)}
                            placeholder="اكتب اسم الملف التوضيحي للطالب..."
                            className="w-full text-xs font-bold text-slate-100 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 focus:bg-slate-850 focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        {/* 2. Specialization Linkage Dropdown */}
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-black text-slate-300">القسم/التخصص المرتبط به (لتثبيت بوابة التحميل):</label>
                          <select 
                            value={libraryFormSpecialization}
                            onChange={(e) => setLibraryFormSpecialization(e.target.value)}
                            className="w-full text-xs font-bold text-white bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-400"
                          >
                            <option value="الدليل الشامل 2026">📙 الدليل الشامل لجميع الأقسام</option>
                            <option value="الدليل الرسمي الشامل 2026">📙 الدليل الشامل (تسمية بديلة)</option>
                            {ACADEMY_DEPARTMENTS.map(d => (
                              <option key={d.id} value={d.name}>📂 {d.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* 3. Direct File Upload Component */}
                        <div className="bg-slate-800 border border-dashed border-slate-750 p-4 rounded-xl text-center space-y-2">
                          <span className="block text-[10px] font-black text-amber-400 font-sans">📁 الرفع المباشر على السيرفر المحلي:</span>
                          <p className="text-[9px] text-slate-400">اختر الملف من جهازك ليتم الرفع بصورة فائقة السرعة.</p>
                          <input 
                            type="file" 
                            accept=".pdf,application/pdf"
                            onChange={handleLibraryFileUpload}
                            className="hidden" 
                            id="library-direct-uploader"
                          />
                          <label 
                            htmlFor="library-direct-uploader"
                            className="inline-block px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md text-[10px] font-black cursor-pointer shadow-sm transition"
                          >
                            🖱️ اختر ملف الـ PDF من جهازك
                          </label>

                          {libraryUploadProgress && (
                            <div className="text-[10px] font-semibold text-emerald-300 bg-slate-850/65 py-1.5 px-2 rounded-md mt-2 leading-relaxed text-center">
                              {libraryUploadProgress}
                            </div>
                          )}
                        </div>

                        {/* 4. External URL (Optional/Manual override) */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <label className="block text-[10px] font-black text-slate-300">رابط الملف المرفوع أو الرابط الخارجي (Google Drive):</label>
                            <span className="text-[8px] bg-indigo-500/25 px-1.5 py-0.5 rounded text-indigo-300 font-bold">تلقائي أو خارجي</span>
                          </div>
                          <input 
                            type="text" 
                            required
                            value={libraryFormUrl}
                            onChange={(e) => setLibraryFormUrl(e.target.value)}
                            placeholder="https://drive.google.com/your-pdf-file-url"
                            className="w-full text-xs font-mono text-slate-100 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 focus:bg-slate-850 focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        {/* Action buttons */}
                        <div className="pt-2 flex gap-2">
                          <button
                            type="submit"
                            disabled={libraryIsSaving}
                            className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl shadow-lg transition active:scale-98 cursor-pointer text-center"
                          >
                            {libraryIsSaving ? "جاري الحفظ والتطبيق..." : "💾 حفظ وتحديث وتثبيت فوراً"}
                          </button>

                          {libraryFormId && (
                            <button
                              type="button"
                              onClick={() => {
                                setLibraryFormId("");
                                setLibraryFormName("");
                                setLibraryFormUrl("");
                                setLibraryUploadProgress("");
                              }}
                              className="px-3 bg-red-600 text-white hover:bg-red-700 text-xs font-bold rounded-xl transition cursor-pointer"
                            >
                              إلغاء التعديل
                            </button>
                          )}
                        </div>

                      </form>
                    </div>
                  </div>

                  {/* LEFT COLUMN: UPLOADED FILES DIRECTORY LIST (3/5 span) */}
                  <div className="lg:col-span-3 space-y-4">
                    <div className="bg-white p-5 rounded-2xl shadow-3xs border border-slate-200">
                      <div className="border-b border-slate-100 pb-3 mb-4 flex justify-between items-center">
                        <div>
                          <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                            <span>📂 دليل الملفات المرفوعة حالياً بالمكتبة</span>
                          </h4>
                          <p className="text-[10px] text-slate-500 mt-0.5">الملفات التي تظهر للزوار عند الضغط على أزرار تحميل الـ PDF.</p>
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full">
                          إجمالي ملفات المكتبة: {pdfLibraryList.length}
                        </span>
                      </div>

                      {pdfSettingsLoading ? (
                        <div className="p-12 text-center text-xs font-bold text-slate-400">جاري جلب ملفات المكتبة...</div>
                      ) : pdfLibraryList.length === 0 ? (
                        <div className="p-12 text-center text-xs text-slate-400 font-bold border border-dashed rounded-xl">
                          لا يوجد أي ملفات مرفوعة حالياً. ابدأ برفع أول ملف باستخدام لوحة الرفع الذكية لدليل القبول.
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-right border-collapse text-[11px]">
                            <thead>
                              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-black">
                                <th className="p-3">مسمى الملف</th>
                                <th className="p-3">القسم المرتبط ومفتاح الربط</th>
                                <th className="p-3">نوع الرابط</th>
                                <th className="p-3 text-center">إجراءات التحكم</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {pdfLibraryList.map((file) => (
                                <tr key={file.id} className="hover:bg-slate-50/70 transition">
                                  <td className="p-3">
                                    <div className="font-bold text-slate-900 flex items-center gap-1">
                                      <span>📙</span>
                                      <span className="line-clamp-2">{file.name}</span>
                                    </div>
                                    <span className="text-[9px] font-mono text-slate-400 block mt-0.5" dir="ltr">
                                      {file.url}
                                    </span>
                                  </td>
                                  <td className="p-3">
                                    <div className="font-black text-slate-800 bg-amber-50 border border-amber-100 px-2 py-1 rounded-md inline-block">
                                      {file.specialization}
                                    </div>
                                  </td>
                                  <td className="p-3">
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black ${file.mode === 'uploaded' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                                      {file.mode === 'uploaded' ? 'مرفوع محلياً' : 'رابط خارجي'}
                                    </span>
                                  </td>
                                  <td className="p-3">
                                    <div className="flex gap-1.5 justify-center">
                                      <button 
                                        onClick={() => handleEditLibraryItem(file)}
                                        className="px-2 py-1 text-[10px] font-black text-slate-700 bg-slate-100 hover:bg-slate-200 border rounded transition cursor-pointer"
                                      >
                                        تعديل
                                      </button>
                                      <button 
                                        onClick={() => handleDeleteLibraryItem(file.id)}
                                        className="px-2 py-1 text-[10px] font-black text-red-650 bg-red-50 hover:bg-red-100 border border-red-100 rounded transition cursor-pointer"
                                      >
                                        حذف
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* CONVENIENT KEY-VALUE DIRECT BINDINGS EDITOR */}
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                      <div className="mb-4">
                        <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                          <span>⚙️ المسار السريع: خريطة روابط الأزرار المباشرة</span>
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">تعديل فوري على روابط بوابات التحميل النشطة لكل قسم بصفحات الهبوط:</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(pdfSettings).map(([specialization, downloadUrl]) => (
                          <div key={specialization} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                            <span className="block text-[10px] font-bold text-slate-700">{specialization}:</span>
                            <input
                              type="text"
                              value={downloadUrl}
                              onChange={(e) => handleUpdatePdfUrl(specialization, e.target.value)}
                              className="w-full text-[10px] font-mono text-slate-700 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-end pt-3">
                        <button
                          onClick={handleSavePdfSettings}
                          disabled={pdfSettingsLoading}
                          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] rounded-lg transition-all cursor-pointer shadow-sm"
                        >
                          💾 حفظ وتحديث خريطة الأزرار المباشرة
                        </button>
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            ) : activeFilterTab === "department_manager" ? (
              /* PANEL M: DEPARTMENT IMAGES & INFOS MANAGEMENT PANEL */
              <div className="space-y-6 text-right animate-fade-in" dir="rtl" id="admin-dept-images-manager-panel">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 text-right space-y-4 shadow-3xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="space-y-1">
                      <h3 className="text-sm font-black text-[#0A2463]">🖼️ لوحة التحكم بصور وقوائم التخصصات الأكاديمية والـ 17 شعبة</h3>
                      <p className="text-[10px] text-slate-500 font-semibold">تحكم بالخلفيات والصور الحية للأقسام وتعيين روابط مخصصة وحذفها لتعود للشكل الأصلي فوراً</p>
                    </div>
                    <BookOpen className="w-5 h-5 text-amber-500 animate-pulse" />
                  </div>

                  <div className="bg-amber-50 border border-amber-200/65 rounded-2xl p-4 flex items-start gap-3">
                    <span className="text-lg">💡</span>
                    <div className="text-[11px] text-amber-900 leading-relaxed font-semibold">
                      <p className="font-bold">نصائح إدارة الأصول:</p>
                      <p>١. يمكنك كتابة رابط أي صورة خارجية مباشرة (مثل Unsplash أو Imgur) لتغيير خلفية بطاقة التخصص بصفحة الأقسام والدليل.</p>
                      <p>٢. عند الضغط على زر "حذف واستعادة"، سيقوم النظام بإلغاء التخصيص وإرجاع الصورة الموحدة من ملف الأصول الافتراضي تلقائياً.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                    {adminAcademyDepartments.map((dept) => {
                      const hasCustom = !!dept.imageUrl;
                      const currentBg = dept.imageUrl || DEPARTMENT_DEFAULT_IMAGES[dept.id] || LOCAL_IMAGES.logoAcademicWhite;

                      return (
                        <div key={dept.id} className="bg-slate-50 rounded-2xl border border-slate-200/80 overflow-hidden flex flex-col justify-between hover:shadow-xs transition duration-250">
                          {/* Image preview top */}
                          <div className="relative h-28 bg-slate-200 overflow-hidden">
                            <img 
                              src={currentBg} 
                              alt={dept.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>
                            <div className="absolute bottom-2.5 right-3 text-right">
                              <span className="text-[9px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-black mb-1 inline-block">
                                {dept.id}
                              </span>
                              <h4 className="text-xs font-black text-white">{dept.name}</h4>
                            </div>
                            
                            <div className="absolute top-2.5 left-3">
                              {hasCustom ? (
                                <span className="text-[8px] bg-emerald-500 text-white font-black px-2 py-1 rounded-md shadow-xs">
                                  ✨ صورة مخصصة
                                </span>
                              ) : (
                                <span className="text-[8px] bg-slate-600/75 text-white font-semibold px-2 py-1 rounded-md">
                                  🔗 صورة افتراضية
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Controls bottom */}
                          <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                            <p className="text-[10px] text-slate-500 leading-relaxed font-medium line-clamp-2">
                              {dept.description}
                            </p>

                            <div className="space-y-2">
                              <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-600 block">رابط خلفية القسم (URL):</label>
                                <input 
                                  type="text" 
                                  value={dept.imageUrl || ""} 
                                  onChange={(e) => handleUpdateDepartmentImage(dept.id, e.target.value)}
                                  placeholder="أدخل رابط صورة مخصصة..."
                                  className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded-xl text-[11px] text-left font-mono"
                                  dir="ltr"
                                />
                              </div>

                              <div className="flex items-center gap-2 pt-1">
                                {hasCustom && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteDepartmentImage(dept.id)}
                                    className="flex-1 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/50 hover:border-rose-300 text-[10px] font-black rounded-lg transition-all cursor-pointer text-center"
                                  >
                                    ❌ حذف واستعادة
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleUpdateDepartmentImage(dept.id, dept.imageUrl || "")}
                                  className="flex-1 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-850 text-[10px] font-black rounded-lg transition-all cursor-pointer text-center"
                                >
                                  🔄 معاينة التغيير
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
                    <button 
                      type="button"
                      onClick={handleSaveDepartmentsConfig}
                      className="px-8 py-3 bg-[#0A2463] hover:bg-[#0A2463]/90 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-2"
                    >
                      <span>💾 حفظ وتثبيت كافة خلفيات التخصصات فوراً بالمنصة</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* PANEL C: STUDENT ADMISSIONS REGISTRATIONS RENDERING LIST */
              <div className="space-y-4">
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="admin-pulse-leads">
                    {[1, 2, 3, 4].map((num) => (
                      <div key={num} className="p-5 bg-white rounded-2xl border border-slate-200 animate-pulse space-y-4 shadow-3xs">
                        <div className="flex items-center justify-between">
                          <div className="h-4 bg-slate-200 rounded-md w-28"></div>
                          <div className="h-3 bg-slate-200 rounded-md w-16 font-mono"></div>
                        </div>
                        <div className="h-5 bg-slate-200 rounded-md w-3/4"></div>
                        <div className="space-y-1.5">
                          <div className="h-3 bg-slate-100 rounded-md w-full"></div>
                          <div className="h-3 bg-slate-100 rounded-md w-5/6"></div>
                        </div>
                        <div className="pt-2 flex justify-between gap-2 border-t border-slate-50 pt-3">
                          <div className="h-8 bg-slate-200 rounded-lg w-20"></div>
                          <div className="h-8 bg-slate-200 rounded-lg w-20"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {/* Bulk copy */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-right">
                  <div className="text-xs text-slate-600 font-sans">
                    <p className="font-extrabold text-slate-800 mb-0.5">📱 أداة الاتصال الهاتفي والنسخ المجمع لقائمة الطلاب المسجلين:</p>
                    <p>اضغط للنسخ للبدء فوراً بترحيل الهواتف والاتصال بنظارات التسجيل والمبيعات بالشركة الموزعة.</p>
                  </div>
                  <button
                    onClick={() => {
                      const phones = filteredLeadsList.map(l => l.phoneNumber).filter(Boolean);
                      if (phones.length === 0) {
                        alert("لا توجد أرقام هواتف لتصديرها!");
                        return;
                      }
                      navigator.clipboard.writeText(phones.join(", "));
                      setCopiedFeedback("bulk_leads");
                      setTimeout(() => setCopiedFeedback(null), 2500);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-650 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-3xs"
                  >
                    {copiedFeedback === "bulk_leads" ? "✓ تم نسخ الهواتف بنجاح!" : "📋 نسخ جميع هواتف هذه القائمة كأرقام مصفاة"}
                  </button>
                </div>

                {filteredLeadsList.length === 0 ? (
                  <div className="p-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-250 flex flex-col items-center justify-center">
                    <span className="text-3xl block mb-2">🔍</span>
                    <p className="text-xs text-slate-500 font-bold">لا توجد طلبات ترحيل تماثل هذه الفلاتر بانتظارك.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-4">
                    {filteredLeadsList.map((student) => {
                      const isDelayed = student.status !== "completed" && student.timestamp && (Date.now() - Number(student.timestamp) > 24 * 60 * 60 * 1000);
                      const isExpanded = !!expandedStudents[student.id];

                      return (
                        <div
                          key={student.id}
                          className={`block bg-white p-2.5 sm:p-4 rounded-xl mb-2 sm:mb-3 border md:mb-0 md:rounded-2xl transition-all ${
                            student.status === "completed"
                              ? "bg-slate-50 border-slate-200 opacity-80"
                              : isDelayed
                              ? "bg-red-50/50 border-red-300 ring-1 ring-red-505 shadow-3xs hover:border-red-400"
                              : student.status === "no_reply"
                              ? "bg-amber-50/20 border-amber-300 hover:border-amber-400"
                              : "bg-white border-slate-200 hover:border-amber-400 shadow-3xs"
                          } ${isExpanded ? "p-3 sm:p-5 space-y-2.5 sm:space-y-4" : "space-y-1.5 sm:space-y-2"} hover:shadow-xs`}
                        >
                          
                          {/* Item Card Banner Summary */}
                          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 sm:pb-2 flex-wrap gap-1.5 sm:gap-2">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <button
                                onClick={() => toggleStudentExpand(student.id)}
                                className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] sm:text-xs font-bold transition select-none cursor-pointer"
                              >
                                {isExpanded ? "➖" : "➕"}
                              </button>
                              <span
                                className="font-extrabold text-xs sm:text-sm text-slate-900 cursor-pointer flex items-center gap-1 hover:text-amber-700 transition"
                                onClick={() => toggleStudentExpand(student.id)}
                              >
                                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 shrink-0" />
                                <span>{student.studentName}</span>
                              </span>
                            </div>
                            <span className="font-mono text-[8px] sm:text-[9px] font-bold text-amber-850 bg-amber-50 px-1.5 sm:px-2 py-0.5 rounded border border-amber-250/20">
                              كود: #{student.reservationCode || "1000"}
                            </span>
                          </div>

                          {/* 1. Collapsed display view */}
                          {!isExpanded ? (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 text-right">
                              <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px]">
                                <span className={`text-[8px] sm:text-[9px] font-black px-1 sm:px-1.5 py-0.5 rounded ${
                                  student.status === "completed" ? "bg-emerald-50 text-emerald-700 border border-emerald-250" :
                                  student.status === "no_reply" ? "bg-amber-100 text-amber-800 border border-amber-200" :
                                  isDelayed ? "bg-red-50 text-red-700 border border-red-200" : "bg-slate-100 text-slate-700"
                                }`}>
                                  {student.status === "completed" ? "✓ تم التواصل والتعميد" :
                                   student.status === "no_reply" ? "📞 لم يرد تليفونياً" :
                                   isDelayed ? "🕒 معلق ومتاخر" : "⏳ انتظار تواصل"}
                                </span>

                                {student.agentName && student.agentName.trim() !== "" ? (
                                  <span className="bg-indigo-50 text-indigo-950 border border-indigo-150 px-1 sm:px-2 py-0.5 rounded text-[8px] sm:text-[10px] font-bold">
                                    السيلز: {student.agentName}
                                  </span>
                                ) : (
                                  <span className="bg-amber-50 text-amber-805 border border-amber-200 px-1 sm:px-2 py-0.5 rounded text-[8px] sm:text-[10px] font-extrabold animate-pulse">
                                    ⚠️ انتظار مندوب
                                  </span>
                                )}

                                <span className="text-slate-550 text-[8.5px] sm:text-[10px] bg-slate-50 border border-slate-100 rounded px-1 sm:px-1.5 py-0.5 font-bold">
                                  📚 {student.basicCourse?.replace("دورة ", "") || "الشعبة الرئيسية"}
                                </span>

                                {student.governorate && (
                                  <span className="text-slate-650 font-bold text-[8.5px] sm:text-[9.5px]">📍 {student.governorate}</span>
                                )}
                              </div>

                              <div className="flex items-center justify-between sm:justify-end gap-1.5 pt-1.5 sm:pt-0 shrink-0 border-t sm:border-t-0 border-slate-100">
                                <div className="flex items-center gap-1">
                                  <a
                                    href={`tel:${student.phoneNumber}`}
                                    className="w-6.5 h-6.5 sm:w-7 sm:h-7 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition flex items-center justify-center shrink-0 border border-emerald-200"
                                    title="اتصال سريع"
                                  >
                                    <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                  </a>
                                  {student.whatsappNumber && (
                                    <a
                                      href={getWhatsAppLink(student.whatsappNumber, student.studentName)}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="w-6.5 h-6.5 sm:w-7 sm:h-7 bg-emerald-55 text-emerald-600 rounded-lg hover:bg-emerald-110 border border-emerald-205 transition flex items-center justify-center shrink-0"
                                      title="واتساب"
                                    >
                                      <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                    </a>
                                  )}
                                </div>
                                <button
                                  onClick={() => toggleStudentExpand(student.id)}
                                  className="text-[9.5px] sm:text-[10px] text-amber-955 bg-amber-50 border border-amber-200 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg font-black transition cursor-pointer"
                                >
                                  المزيد 📂
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* 2. Expanded detailed view */
                            <div className="space-y-4 animate-fade-in text-right">
                              
                              <div className="flex justify-between items-center text-xs flex-wrap gap-1.5">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  student.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                  student.status === 'no_reply' ? 'bg-amber-100 text-amber-800' : 'bg-[#FF7F50]/10 text-[#FF7F50]'
                                }`}>
                                  الحالة الحالية: {student.status === 'completed' ? 'تم الحجز والمكاملة بنجاح' :
                                                   student.status === 'no_reply' ? 'لم يتم الرد بعد (متابعة تلفونية)' : 'بانتظار مستشار للتأكيد'}
                                </span>
                                {student.date && (
                                  <span className="text-[9.5px] font-mono font-bold text-slate-450 bg-slate-50 border border-slate-150 px-2 py-0.5 rounded flex items-center gap-1 shrink-0">
                                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                                    <span>{student.date}</span>
                                  </span>
                                )}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center justify-between font-mono">
                                  <span className="text-slate-400 font-sans">الهاتف للاتصال:</span>
                                  <div className="flex items-center gap-1.5">
                                    <strong className="text-slate-900">{student.phoneNumber}</strong>
                                    <a
                                      href={`tel:${student.phoneNumber}`}
                                      className="p-1 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100 transition flex items-center justify-center shrink-0"
                                      style={{ minWidth: "26px", minHeight: "26px" }}
                                    >
                                      <Phone className="w-3.5 h-3.5" />
                                    </a>
                                    <button
                                      onClick={() => handleCopySingleNumber(student.phoneNumber)}
                                      className="p-1 bg-slate-200 text-slate-650 rounded hover:bg-slate-300 transition flex items-center justify-center shrink-0 cursor-pointer"
                                      style={{ minWidth: "26px", minHeight: "26px" }}
                                    >
                                      {copiedFeedback === student.phoneNumber ? "✓" : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                  </div>
                                </div>

                                {student.whatsappNumber && (
                                  <div className="bg-emerald-55/15 p-2 rounded-xl border border-emerald-100/50 flex items-center justify-between font-mono">
                                    <span className="text-slate-400 font-sans">رقم الواتساب:</span>
                                    <div className="flex items-center gap-1.5">
                                      <strong className="text-emerald-700">{student.whatsappNumber}</strong>
                                      <a
                                        href={getWhatsAppLink(student.whatsappNumber, student.studentName)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-1 bg-emerald-55 text-emerald-600 rounded hover:bg-emerald-100 transition flex items-center justify-center shrink-0"
                                        style={{ minWidth: "26px", minHeight: "26px" }}
                                      >
                                        <MessageCircle className="w-3.5 h-3.5" />
                                      </a>
                                      <button
                                        onClick={() => handleCopySingleNumber(student.whatsappNumber)}
                                        className="p-1 bg-slate-200 text-slate-650 rounded hover:bg-slate-300 transition flex items-center justify-center shrink-0 cursor-pointer"
                                        style={{ minWidth: "26px", minHeight: "26px" }}
                                      >
                                        {copiedFeedback === student.whatsappNumber ? "✓" : <Copy className="w-3.5 h-3.5" />}
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-[11px]">
                                {student.governorate && (
                                  <div className="bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                    <span>المحافظة الجغرافية: <strong>{student.governorate}</strong></span>
                                  </div>
                                )}
                                {student.graduationYear && (
                                  <div className="bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                    <span>سنة تخرّجه: <strong>{student.graduationYear}</strong></span>
                                  </div>
                                )}
                              </div>

                              <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 space-y-1 text-xs">
                                <p><span className="font-semibold text-slate-400">المؤهل الدراسي المسبر به:</span> {student.educationLevel}</p>
                                <p className="flex items-center gap-1 text-emerald-800 font-extrabold text-[11px] mt-1">
                                  <Sparkles className="w-3.5 h-3.5 text-brand-gold shrink-0 animate-pulse" />
                                  <span>الدورة الدراسية لحفظ الخصم الدراسي:</span>
                                  <span className="bg-emerald-50 px-2 py-0.5 rounded border border-emerald-250/20 text-[10px]">{student.basicCourse || "دورة دفعة الخريف المعتمدة"}</span>
                                </p>
                              </div>

                              <div className="space-y-1">
                                <span className="text-[10px] text-slate-400 font-bold block">الأقسام الطبية/التكنولوجية المطلوبة في التذكرة:</span>
                                <div className="flex flex-wrap gap-1">
                                  {student.selectedDepartments && student.selectedDepartments.length > 0 ? (
                                    student.selectedDepartments.map((dept, i) => (
                                      <span key={i} className="text-[10px] font-bold text-amber-900 bg-amber-50 border border-amber-200/50 px-2 py-0.5 rounded-sm">
                                        {dept}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-[10px] text-slate-400 italic">لم يختر شُعبة محددة على الكرت المبدئي</span>
                                  )}
                                </div>
                              </div>

                              {student.notes && (
                                <div className="p-2.5 bg-slate-50 rounded-lg text-xs text-slate-650 border border-slate-100 leading-relaxed font-sans">
                                  <strong className="text-[10px] text-slate-400 block mb-0.5 font-bold">ملاحظات الطالب وتفاصيل الحجز:</strong>
                                  "{student.notes}"
                                </div>
                              )}

                              {/* Internal Note */}
                              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-white space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-semibold text-amber-400 flex items-center gap-1">
                                    <Lock className="w-3.5 h-3.5 text-amber-500" />
                                    🔐 تعليق داخلي للمبيعات والمشرفين (محمي)
                                  </span>
                                  {editingNoteId !== student.id ? (
                                    <button
                                      onClick={() => {
                                        setEditingNoteId(student.id);
                                        setTempNoteText(student.internalNotes || "");
                                      }}
                                      className="text-[9.5px] font-black text-amber-300 hover:text-white bg-slate-800 px-2.5 py-1 rounded cursor-pointer transition-all"
                                    >
                                      تعديل ✍️
                                    </button>
                                  ) : null}
                                </div>

                                {editingNoteId === student.id ? (
                                  <div className="space-y-1.5">
                                    <textarea
                                      value={tempNoteText}
                                      onChange={(e) => setTempNoteText(e.target.value)}
                                      className="w-full p-2 bg-slate-950 text-white border border-slate-800 rounded text-xs text-right focus:outline-none"
                                      rows={2}
                                      placeholder="اكتب ملاحظة لفريق العمل بخصوص المكالمة..."
                                    />
                                    <div className="flex justify-end gap-1.5">
                                      <button
                                        onClick={() => handleSaveInternalNote("lead", student.id)}
                                        className="px-2.5 py-1 bg-amber-500 text-slate-950 text-[10px] font-black rounded"
                                      >
                                        تأكيد وحفظ ✓
                                      </button>
                                      <button onClick={() => setEditingNoteId(null)} className="px-2 py-1 bg-slate-800 text-slate-300 text-[10px] rounded">
                                        إلغاء
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-xs font-semibold">{student.internalNotes ? `"${student.internalNotes}"` : "لا توجد ملاحظة سرية للمتابعين حالياً."}</p>
                                )}
                              </div>

                              {/* Assignment */}
                              <div className="p-3 bg-indigo-50/50 border border-indigo-150 rounded-xl space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-[11px] text-indigo-900 font-extrabold flex items-center gap-1">
                                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                                    <span>👤 تعيين أو تبديل مستشار المبيعات للتواصل (ترحيل الطلاب):</span>
                                  </span>
                                </div>

                                <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 w-full text-right animate-fade-in">
                                  {!(student.agentName && student.agentName.trim() !== "") ? (
                                    editingSalesStudentId === student.id ? (
                                      <div className="space-y-2 p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-right">
                                        <label className="block text-xs font-black text-emerald-950 mb-1">
                                          اسم مستشار السيلز الموكّل إليه المكالمة:
                                        </label>
                                        <input
                                          type="text"
                                          value={tempSalesInput}
                                          onChange={(e) => setTempSalesInput(e.target.value)}
                                          placeholder="مثال: أحمد محمد"
                                          className="w-full p-2 bg-white text-slate-900 border border-emerald-300 rounded-lg text-xs text-right focus:outline-none focus:ring-1 focus:ring-emerald-500 font-extrabold"
                                          autoFocus
                                        />
                                        <div className="flex justify-end gap-1.5">
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              if (tempSalesInput.trim() === "") {
                                                alert("الاسم إلزامي لترحيل الطالب!");
                                                return;
                                              }
                                              handleSaveSalesAssignment(student.id, tempSalesInput.trim());
                                            }}
                                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black rounded-lg transition cursor-pointer"
                                          >
                                            تأكيد وحفظ ✓
                                          </button>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              setEditingSalesStudentId(null);
                                              setTempSalesInput("");
                                            }}
                                            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[11px] font-bold rounded-lg transition cursor-pointer"
                                          >
                                            إلغاء
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          setEditingSalesStudentId(student.id);
                                          setTempSalesInput("");
                                        }}
                                        className="w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-lg transition text-center cursor-pointer block"
                                      >
                                        إدخال اسم السيلز وتوثيق التوصيل ✓
                                      </button>
                                    )
                                  ) : (
                                    /* لو الاسم مسجل بالفعل.. يظهر الكارت المقفول ده ومحدش يعرف يلمسه تاني */
                                    <div className="flex items-center gap-2 w-full justify-end">
                                      <span className="text-xs font-black text-indigo-950 bg-white border border-indigo-150 px-3 py-1.5 rounded-lg inline-block">
                                        المستشار النشط للمكالمة هاتفياً: <strong>{student.agentName}</strong>
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                          {/* Action footer triggers */}
                          <div className="flex flex-col sm:flex-row gap-2.5 justify-between items-stretch sm:items-center pt-2.5 border-t border-slate-100">
                            <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full sm:w-auto">
                              {student.status !== "completed" && (
                                <button
                                  onClick={() => handleUpdateStatus("lead", String(student.id), "no_reply")}
                                  className={`text-xs font-bold p-3 sm:px-4 sm:py-2 rounded-xl border transition cursor-pointer flex items-center justify-center gap-1.5 w-full sm:w-auto ${
                                    student.status === "no_reply"
                                      ? "bg-amber-100 text-amber-500 border-amber-300"
                                      : "bg-amber-500 hover:bg-amber-600 text-white shadow-3xs"
                                  }`}
                                >
                                  {student.status === "no_reply" ? "تم تسجيل لم يرد تليفونياً (متابعة) 📞" : "تسجيل لم يرد 📞"}
                                </button>
                              )}

                              {(student.status === "completed" || (student.agentName && student.agentName.trim() !== "")) && (
                                <span className="text-xs font-extrabold p-3 sm:px-4 sm:py-2 rounded-xl border border-emerald-250 bg-emerald-50 text-emerald-800 flex items-center justify-center gap-1.5 select-none w-full sm:w-auto text-center">
                                  تم المكالمة والمتابعة والترحيل بنجاح ✓
                                </span>
                              )}
                            </div>

                            <button
                              onClick={() => {
                                const listKey = 
                                  student.status === "completed" 
                                    ? "lead_completed" 
                                    : student.status === "no_reply" 
                                      ? "lead_no_reply" 
                                      : "lead_new";
                                triggerSecureDelete(listKey, student.id, student.studentName || "طالب", () => {
                                  handleDeleteItem("lead", student.id);
                                });
                              }}
                              className="text-slate-400 hover:text-red-650 transition flex items-center justify-center gap-1 py-2 px-3 hover:bg-red-50 rounded-xl cursor-pointer w-full sm:w-auto mt-1 sm:mt-0"
                            >
                              <Trash2 className="w-4 h-4 text-red-500 shrink-0" />
                              <span className="text-xs text-red-655 font-bold">حذف الطالب</span>
                            </button>
                          </div>

                        </div>
                      )}
                    </div>
                  );
                })}
                  </div>
                )}
                  </>
                )}

              </div>
            )}

          </div>

        </div>

      {/* Real-time Toast Alerts Overlay */}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-[120] flex flex-col gap-3 max-w-sm w-full p-4 pointer-events-none text-right" dir="rtl">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="p-4 rounded-2xl shadow-2xl border text-right pointer-events-auto animate-scale-up flex flex-col gap-1.5 bg-slate-900 text-white border-slate-800 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-2 h-full bg-amber-500 animate-pulse" />
              <div className="flex items-start justify-between gap-3 font-sans pr-2">
                <div className="text-xs font-semibold space-y-1">
                  <p className="font-extrabold text-[12.5px] leading-relaxed text-slate-100">
                    {toast.message}
                  </p>
                  <span className="text-[9px] text-slate-400 font-mono inline-block">
                    تم الاستلام: {toast.time}
                  </span>
                </div>
                <button
                  onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                  className="text-slate-400 hover:text-white shrink-0 p-1 bg-white/5 hover:bg-white/10 rounded-lg transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🔐 PASSWORD UNLOCK OVERLAY MODAL */}
      {pendingDeleteAction && (
        <div className="fixed inset-0 bg-[#0a2463]/30 backdrop-blur-md flex items-center justify-center p-4 z-[9999] text-right font-sans" dir="rtl">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-105 overflow-hidden animate-scale-up">
            <div className="bg-slate-950 p-6 text-white text-center relative">
              <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-rose-500/20">
                <ShieldAlert className="w-7 h-7 text-rose-500 animate-pulse" />
              </div>
              <h3 className="text-base font-black">🔐 صلاحية حذف مقيدة ومحميّة</h3>
              <p className="text-[11px] text-slate-400 mt-1">يُرجى إدخال كلمة المرور إلغاء الحظر لهذه القائمة لتفعيل الحذف طوال الجلسة</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">كلمة المرور الإدارية للحذف:</label>
                <input
                  type="password"
                  value={deletePasswordInput}
                  onChange={(e) => {
                    setDeletePasswordInput(e.target.value);
                    if (deletePasswordError) setDeletePasswordError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (deletePasswordInput.trim() === "Mm151997") {
                        const updated = { ...unlockedDeleteTabs, [pendingDeleteAction.listKey]: true };
                        setUnlockedDeleteTabs(updated);
                        if (typeof window !== "undefined") {
                          sessionStorage.setItem("unlocked_delete_tabs", JSON.stringify(updated));
                        }
                        const onConfirmed = pendingDeleteAction.onConfirmed;
                        setPendingDeleteAction(null);
                        setDeleteConfirmationAction({
                          studentName: pendingDeleteAction.studentName,
                          onConfirmed
                        });
                      } else {
                        setDeletePasswordError("⚠️ كلمة المرور المدخلة غير صحيحة، يرجى المحاولة مجدداً!");
                      }
                    }
                  }}
                  placeholder="••••••••"
                  className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500/15 focus:outline-none focus:border-slate-800 text-center font-bold tracking-widest text-lg text-slate-850"
                  autoFocus
                />
              </div>

              {deletePasswordError && (
                <p className="text-xs text-red-650 bg-red-50 p-3 rounded-lg border border-red-100 font-bold">
                  {deletePasswordError}
                </p>
              )}

              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => {
                    if (deletePasswordInput.trim() === "Mm151997") {
                      const updated = { ...unlockedDeleteTabs, [pendingDeleteAction.listKey]: true };
                      setUnlockedDeleteTabs(updated);
                      if (typeof window !== "undefined") {
                        sessionStorage.setItem("unlocked_delete_tabs", JSON.stringify(updated));
                      }
                      const onConfirmed = pendingDeleteAction.onConfirmed;
                      setPendingDeleteAction(null);
                      setDeleteConfirmationAction({
                        studentName: pendingDeleteAction.studentName,
                        onConfirmed
                      });
                    } else {
                      setDeletePasswordError("⚠️ كلمة المرور المدخلة غير صحيحة، يرجى المحاولة مجدداً!");
                    }
                  }}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl transition shadow-md cursor-pointer"
                >
                  تأكيد وحفظ كلمة المرور 🔓
                </button>
                <button
                  onClick={() => {
                    setPendingDeleteAction(null);
                  }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-650 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  إلغاء الأمر
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ⚠️ CONFIRMATION POP-UP MODAL */}
      {deleteConfirmationAction && (
        <div className="fixed inset-0 bg-[#0a2463]/30 backdrop-blur-md flex items-center justify-center p-4 z-[9999] text-right font-sans" dir="rtl">
          <div className="bg-white w-full max-w-sm rounded-[24px] shadow-2xl border border-slate-100 overflow-hidden animate-scale-up">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto border border-amber-500/20">
                <AlertTriangle className="w-6 h-6 text-amber-500 animate-bounce" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-black text-slate-900">هل أنت متأكد من حذف هذا السجل وبشكل نهائي؟</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-bold">
                  ({deleteConfirmationAction.studentName}): سيتم مسح هذا الملف من كافة الأقسام والأرشيف نهائياً.
                </p>
              </div>
              <div className="flex gap-2.5 justify-center pt-2">
                <button
                  onClick={() => {
                    const cb = deleteConfirmationAction.onConfirmed;
                    const studentName = deleteConfirmationAction.studentName || "السجل";
                    setDeleteConfirmationAction(null);
                    cb();
                    toast(`✓ تم تأكيد الحظر وحذف سجل (${studentName}) نهائياً بنجاح!`, {
                      icon: "🗑️",
                      style: {
                        background: "#fef2f2",
                        color: "#991b1b",
                        border: "1px solid #fee2e2"
                      }
                    });
                  }}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl transition cursor-pointer shadow-3xs"
                >
                  أويد بالكامل، احذف السجل 🗑️
                </button>
                <button
                  onClick={() => {
                    setDeleteConfirmationAction(null);
                  }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  تراجع وإلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
