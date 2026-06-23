import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { 
  X, 
  Lock, 
  Briefcase, 
  Plus, 
  Trash2, 
  Save, 
  Sparkles, 
  Star, 
  Award, 
  HeartHandshake, 
  BookOpen,
  Check
} from "lucide-react";
import { ACADEMY_DEPARTMENTS } from "../data";
import { supabase, hasSupabase } from "../supabaseClient";

interface ROIDepartment {
  id: string;
  name: string;
  salary: number;
  careerPct: string;
  role: string;
  demandBadge?: string;
}

interface Review {
  id: number;
  studentName: string;
  department: string;
  governorate: string;
  rating: number;
  text: string;
  avatarColor: string;
  initials: string;
  date: string;
  verified: boolean;
}

interface DeveloperFeederModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DeveloperFeederModal({ isOpen, onClose }: DeveloperFeederModalProps) {
  // Job announcements ticker
  const [jobVacancies, setJobVacancies] = useState<string[]>([]);
  const [newJobText, setNewJobText] = useState("");

  // ROI Calculator dynamically mapped Array
  const [roiDepartments, setRoiDepartments] = useState<ROIDepartment[]>([]);
  
  // States to add new department
  const [showAddDeptForm, setShowAddDeptForm] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptSalary, setNewDeptSalary] = useState(10050);
  const [newDeptPct, setNewDeptPct] = useState("95%");
  const [newDeptRole, setNewDeptRole] = useState("");
  const [newDeptDemandBadge, setNewDeptDemandBadge] = useState("🔥 طلب شديد جداً - مقاعد محدودة متبقية");

  // Academic Departments (General "تصفح الأقسام")
  const [academyDepartmentsList, setAcademyDepartmentsList] = useState<any[]>([]);
  const [adminLeads, setAdminLeads] = useState<any[]>([]);
  const [showAddAcademyForm, setShowAddAcademyForm] = useState(false);
  const [newAcademyId, setNewAcademyId] = useState("");
  const [newAcademyName, setNewAcademyName] = useState("");
  const [newAcademyIcon, setNewAcademyIcon] = useState("BookOpen");
  const [newAcademyDesc, setNewAcademyDesc] = useState("");
  const [newAcademySkills, setNewAcademySkills] = useState("");
  const [newAcademyCareers, setNewAcademyCareers] = useState("");
  const [newAcademyMaxCapacity, setNewAcademyMaxCapacity] = useState<number>(100);

  // Student Testimonials
  const [studentTestimonials, setStudentTestimonials] = useState<Review[]>([]);
  const [newReviewName, setNewReviewName] = useState("");
  const [newReviewDept, setNewReviewDept] = useState("");
  const [newReviewGov, setNewReviewGov] = useState("الدقهلية");
  const [newReviewStars, setNewReviewStars] = useState(5);
  const [newReviewText, setNewReviewText] = useState("");

  // AI Knowledge Prompt
  const [aiAdvisorTrainingText, setAiAdvisorTrainingText] = useState("");

  // Dynamic PDF Library File Manager States
  const [pdfLibraryList, setPdfLibraryList] = useState<any[]>([]);
  const [libraryFormId, setLibraryFormId] = useState<string>("");
  const [libraryFormName, setLibraryFormName] = useState<string>("");
  const [libraryFormUrl, setLibraryFormUrl] = useState<string>("");
  const [libraryFormSpecialization, setLibraryFormSpecialization] = useState<string>("الدليل الشامل 2026");
  const [libraryUploadProgress, setLibraryUploadProgress] = useState<string>("");
  const [libraryIsSaving, setLibraryIsSaving] = useState<boolean>(false);

  // Password-Protected Security Deletion Modal States
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<"department" | "file">("department");
  const [securityPassword, setSecurityPassword] = useState("");
  const [securityError, setSecurityError] = useState("");

  // System Feeder Sub-Tab States
  const [feederSubTab, setFeederSubTab] = useState<"database" | "leads">("database");
  const [exportPassword, setExportPassword] = useState("");

  // Load ROI departments from back-end server REST API using dynamic fetch calls (satisfies Network Tab deletion constraints)
  const fetchRoiDepartments = async () => {
    try {
      const res = await fetch("/api/roi-departments");
      const data = await res.json();
      if (data.success && Array.isArray(data.departments)) {
        setRoiDepartments(data.departments);
        localStorage.setItem("custom_roi_calculator_constants_v2", JSON.stringify(data.departments));
        syncLegacyV1(data.departments);
      }
    } catch (e) {
      console.warn("Failed to load ROI departments from API", e);
    }
  };

  // Load everything from localStorage/API on mount/open
  const loadAllDataFromStorage = () => {
    if (typeof window === "undefined") return;

    // 1. Ticker Jobs
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
      try {
        setJobVacancies(JSON.parse(savedJobs));
      } catch (e) {
        setJobVacancies(defaultAnnouncements);
      }
    } else {
      setJobVacancies(defaultAnnouncements);
    }

    // 2. Dynamic ROI Departments
    fetchRoiDepartments();

    // 5. General Academy Departments (for DepartmentExplorer)
    const savedAcademyDepts = localStorage.getItem("custom_academy_departments_v1");
    if (savedAcademyDepts) {
      try {
        const parsed = JSON.parse(savedAcademyDepts);
        if (Array.isArray(parsed)) {
          const migrated = parsed.map(d => ({
            ...d,
            maxCapacity: d.maxCapacity !== undefined ? Number(d.maxCapacity) : 120
          }));
          setAcademyDepartmentsList(migrated);
        } else {
          const migrated = ACADEMY_DEPARTMENTS.map(d => ({ ...d, maxCapacity: d.maxCapacity || 120 }));
          setAcademyDepartmentsList(migrated);
        }
      } catch (e) {
        const migrated = ACADEMY_DEPARTMENTS.map(d => ({ ...d, maxCapacity: d.maxCapacity || 120 }));
        setAcademyDepartmentsList(migrated);
      }
    } else {
      const migrated = ACADEMY_DEPARTMENTS.map(d => ({ ...d, maxCapacity: d.maxCapacity || 120 }));
      setAcademyDepartmentsList(migrated);
      localStorage.setItem("custom_academy_departments_v1", JSON.stringify(migrated));
    }
    // Dynamic ROI Departments are loaded asynchronously via fetchRoiDepartments()
    
    // 3. Reviews
    const savedReviews = localStorage.getItem("custom_student_reviews");
    const defaultReviews: Review[] = [
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
    if (savedReviews) {
      try {
        setStudentTestimonials(JSON.parse(savedReviews));
      } catch (e) {
        setStudentTestimonials(defaultReviews);
      }
    } else {
      setStudentTestimonials(defaultReviews);
    }

    // 4. AI Prompt
    const savedPrompt = localStorage.getItem("academy_ai_advisor_training") || "التحق الآن بالدبلومات المهنية الرائدة والمعتمدة في تكنولوجيا الحاسب والبرمجة، وصيانة الأجهزة الطبية، والسجل الطبي والسكرتارية، والتحاليل الطبية والخدمات الصحية المساعدة، والمساحة والخرائط والمقاولات. نظام الدراسة يعتمد على تقسيط شهري مريح، وتدريب نقدي وعملي بالمستشفيات والشركات الكبرى لضمان التوظيف الفوري.";
    setAiAdvisorTrainingText(savedPrompt);

    // 6. Dynamic PDF Library File Manager
    const savedPdfLibrary = localStorage.getItem("custom_pdf_library_v1");
    if (savedPdfLibrary) {
      try {
        setPdfLibraryList(JSON.parse(savedPdfLibrary));
      } catch (er) {
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

  const fetchAdminLeads = async () => {
    try {
      const res = await fetch("/api/admin/data");
      const data = await res.json();
      if (data.success && Array.isArray(data.leads)) {
        setAdminLeads(data.leads);
      }
    } catch (e) {
      console.warn("Failed to load admin leads in DeveloperFeederModal", e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAllDataFromStorage();
      fetchAdminLeads();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleUpdate = () => {
      fetchAdminLeads();
    };
    window.addEventListener("admin_data_updated", handleUpdate);
    window.addEventListener("academy_leads_updated", handleUpdate);

    let channel: any = null;
    if (hasSupabase) {
      channel = supabase
        .channel("feeder-student-updates")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "students",
          },
          () => {
            fetchAdminLeads();
          }
        )
        .subscribe();
    }

    return () => {
      window.removeEventListener("admin_data_updated", handleUpdate);
      window.removeEventListener("academy_leads_updated", handleUpdate);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [isOpen]);

  // Export Database configuration payload to JSON file
  const handleExportDatabase = () => {
    try {
      const dbPayload = {
        jobs: localStorage.getItem("custom_job_announcements") || "[]",
        roiV2: localStorage.getItem("custom_roi_calculator_constants_v2") || "[]",
        roiV1: localStorage.getItem("custom_roi_calculator_constants_v1") || "{}",
        reviews: localStorage.getItem("custom_student_reviews") || "[]",
        aiTraining: localStorage.getItem("academy_ai_advisor_training") || "",
        leads: localStorage.getItem("academy_student_leads") || "[]",
        parents: localStorage.getItem("academy_parent_inquiries") || "[]",
        exportTimestamp: new Date().toISOString()
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dbPayload, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `academy_database_backup_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      toast("✓ تم تصدير قاعدة بيانات المنصة بالكامل وحفظ ملف الـ JSON بنجاح!", {
        icon: "💾",
        style: {
          border: '1px solid #3b82f6',
          background: '#eff6ff',
          color: '#1e3a8a'
        }
      });
    } catch (e) {
      toast.error("عذراً، فشل تصدير البيانات: " + String(e));
    }
  };

  // Secure CSV Export Engine for Student Leads
  const handleExportLeadsCSV = () => {
    // Security check: Verify password before allowing export download
    if (exportPassword !== "Mm151997") {
      toast.error("رمز المصادقة الأمنية غير صحيح! يُرجى إدخال الباسوورد الصحيح Mm151997 للتصدير.");
      return;
    }

    try {
      if (adminLeads.length === 0) {
        toast.error("عذراً، لا توجد بيانات للطلاب لتصديرها حالياً!");
        return;
      }

      // Headers: اسم الطالب, رقم الهاتف, التخصص المحدد, تاريخ التسجيل
      const headers = ["اسم الطالب", "رقم الهاتف", "الشعبة الدراسية / الرغبات المحددة", "تاريخ وقوت التسجيل"];
      
      const rows = adminLeads.map(lead => {
        const dateStr = lead.createdAt 
          ? new Date(lead.createdAt).toLocaleString("ar-EG") 
          : (lead.consentTimestamp ? new Date(lead.consentTimestamp).toLocaleString("ar-EG") : "غير محدد");
          
        const deptStr = Array.isArray(lead.selectedDepartments) 
          ? lead.selectedDepartments.join(" | ") 
          : (lead.selectedDepartments || lead.basicCourse || "شعبة عامة غير مبوبة");
          
        return [
          `"${(lead.studentName || "").replace(/"/g, '""')}"`,
          `"${(lead.phoneNumber || "").replace(/"/g, '""')}"`,
          `"${(deptStr).replace(/"/g, '""')}"`,
          `"${(dateStr).replace(/"/g, '""')}"`
        ];
      });

      // Unified CSV payload with UTF-8 BOM indicator for Excel Arabic support
      const csvContent = "\ufeff" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `student_leads_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("🏆 تم رصد التحقق الأمني! تم تنزيل كشف CSV منسق بالكامل ببيانات الطلاب المسجلين!");
    } catch (err: any) {
      toast.error("فشل تصدير الكشف الفني: " + err.message);
    }
  };

  // Import Database configuration payload from uploaded JSON file
  const handleImportDatabase = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = e.target.files;
    if (!files || files.length === 0) return;

    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed) {
          if (parsed.jobs) {
            localStorage.setItem("custom_job_announcements", parsed.jobs);
          }
          if (parsed.roiV2) {
            localStorage.setItem("custom_roi_calculator_constants_v2", parsed.roiV2);
          }
          if (parsed.roiV1) {
            localStorage.setItem("custom_roi_calculator_constants_v1", parsed.roiV1);
          }
          if (parsed.reviews) {
            localStorage.setItem("custom_student_reviews", parsed.reviews);
          }
          if (parsed.aiTraining) {
            localStorage.setItem("academy_ai_advisor_training", parsed.aiTraining);
            localStorage.setItem("academy_ai_prompt_base", parsed.aiTraining);
          }
          if (parsed.leads) {
            localStorage.setItem("academy_student_leads", parsed.leads);
          }
          if (parsed.parents) {
            localStorage.setItem("academy_parent_inquiries", parsed.parents);
          }

          // Force state re-sync in developer panel
          loadAllDataFromStorage();

          // Notify public views of update
          window.dispatchEvent(new Event("roi_constants_updated"));
          window.dispatchEvent(new Event("job_announcements_updated"));
          window.dispatchEvent(new Event("reviews_updated"));
          window.dispatchEvent(new Event("academy_prompt_updated"));

          toast.success("🏆 تهانينا! تم استيراد واستعادة قاعدة بيانات المنصة بالكامل بنجاح تام، وتجاوبت كافة المرئيات فوراً!");
        }
      } catch (err) {
        toast.error("فشل استيراد الملف، تأكد من اختيار ملف JSON صحيح. " + String(err));
      }
    };
    fileReader.readAsText(files[0]);
  };

  // Handle addition of a new ROI major - sends real REST API POST request (Network Tab verification helper)
  const handleAddNewDepartment = async () => {
    if (!newDeptName.trim()) {
      toast.error("الرجاء كتابة اسم شعبة أو تخصص دراسي!");
      return;
    }
    const newId = "dept_" + Date.now();
    const newObj: ROIDepartment = {
      id: newId,
      name: newDeptName.trim(),
      salary: Number(newDeptSalary) || 10000,
      careerPct: newDeptPct.trim().includes("%") ? newDeptPct.trim() : `طلب بنسبة %${newDeptPct.trim()} في السوق`,
      role: newDeptRole.trim() || "فني متخصص معتمد",
      demandBadge: newDeptDemandBadge || "🔥 طلب شديد جداً - مقاعد محدودة متبقية"
    };

    try {
      const res = await fetch("/api/roi-departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newObj)
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.departments)) {
        setRoiDepartments(data.departments);
        localStorage.setItem("custom_roi_calculator_constants_v2", JSON.stringify(data.departments));
        syncLegacyV1(data.departments);
        window.dispatchEvent(new Event("roi_constants_updated"));
        toast.success("✓ تم إضافة التخصص المالي الجديد في قاعدة البيانات بنجاح تام وسرعة فائقة!");
      }
    } catch (e) {
      console.warn("API Add Failed, falling back to local only", e);
      const nextList = [...roiDepartments, newObj];
      setRoiDepartments(nextList);
      localStorage.setItem("custom_roi_calculator_constants_v2", JSON.stringify(nextList));
      syncLegacyV1(nextList);
      window.dispatchEvent(new Event("roi_constants_updated"));
      toast.success("✓ تم إضافة التخصص المالي الجديد محلياً بنجاح!");
    }

    // Reset inputs
    setNewDeptName("");
    setNewDeptSalary(10050);
    setNewDeptPct("95%");
    setNewDeptRole("");
    setShowAddDeptForm(false);
  };

  // Keep legacy v1 structure synced so no breakages occur anywhere
  const syncLegacyV1 = (list: ROIDepartment[]) => {
    try {
      const legacyObj: any = {};
      list.forEach((dept) => {
        // Map back to key style used in calculators
        let key = dept.id;
        legacyObj[key] = {
          name: dept.name,
          salary: dept.salary,
          careerPct: dept.careerPct,
          role: dept.role
        };
      });
      // Store back to legacy key as well
      localStorage.setItem("custom_roi_calculator_constants_v1", JSON.stringify(legacyObj));
    } catch (e) {
      console.warn("Legacy sync warn", e);
    }
  };

  // Delete a department - makes actual REST API DELETE call (guarantees real Network Tab activity)
  const handleDeleteDepartment = async (id: string) => {
    if (roiDepartments.length <= 1) {
      toast.error("عذراً، يجب إبقاء تخصص واحد على الأقل في قائمة الحاسبة لتفادي انهيار الواجهة!");
      return;
    }
    if (confirm("هل أنت متأكد من حذف هذا التخصص وحذفه نهائياً من حاسبة العائد المالي بقاعدة البيانات والصفحة الرئيسية؟")) {
      try {
        const res = await fetch(`/api/roi-departments/${id}`, {
          method: "DELETE"
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.departments)) {
          setRoiDepartments(data.departments);
          localStorage.setItem("custom_roi_calculator_constants_v2", JSON.stringify(data.departments));
          syncLegacyV1(data.departments);
          window.dispatchEvent(new Event("roi_constants_updated"));
          toast("✓ تم حذف التخصص المالي بنجاح من قاعدة البيانات في الوقت الفعلي!", {
            icon: "🗑️",
            style: {
              border: "1px solid #bfdbfe",
              background: "#eff6ff",
              color: "#1e40af"
            }
          });
        }
      } catch (e) {
        console.warn("API Delete Failed, falling back to local only", e);
        const nextList = roiDepartments.filter(d => d.id !== id);
        setRoiDepartments(nextList);
        localStorage.setItem("custom_roi_calculator_constants_v2", JSON.stringify(nextList));
        syncLegacyV1(nextList);
        window.dispatchEvent(new Event("roi_constants_updated"));
        toast("✓ تم حذف التخصص المالي محلياً!", {
          icon: "🗑️",
          style: {
            border: "1px solid #bfdbfe",
            background: "#eff6ff",
            color: "#1e40af"
          }
        });
      }
    }
  };

  // Save edits of department
  const handleUpdateDepartmentField = (id: string, field: keyof ROIDepartment, value: any) => {
    const nextList = roiDepartments.map((dept) => {
      if (dept.id === id) {
        return { ...dept, [field]: value };
      }
      return dept;
    });
    setRoiDepartments(nextList);
  };

  const handleBulkSaveDepartments = async () => {
    try {
      const res = await fetch("/api/roi-departments/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ departments: roiDepartments })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.departments)) {
        setRoiDepartments(data.departments);
        localStorage.setItem("custom_roi_calculator_constants_v2", JSON.stringify(data.departments));
        syncLegacyV1(data.departments);
        window.dispatchEvent(new Event("roi_constants_updated"));
        toast.success("✓ تم حفظ تعديلات وتغييرات الأقسام في قاعدة البيانات بنجاح!");
      }
    } catch (e) {
      console.warn("Bulk save API failed, saving locally", e);
      localStorage.setItem("custom_roi_calculator_constants_v2", JSON.stringify(roiDepartments));
      syncLegacyV1(roiDepartments);
      window.dispatchEvent(new Event("roi_constants_updated"));
      toast.success("✓ تم حفظ تعديلات وتغييرات الأقسام محلياً وبنجاح!");
    }
  };

  // --- ACADEMIC DEPARTMENTS CRUD ACTIONS ---
  const handleAddAcademyDept = () => {
    if (!newAcademyName.trim() || !newAcademyDesc.trim()) {
      toast.error("الرجاء كتابة اسم التخصص ووصفه الفعلي!");
      return;
    }
    const id = newAcademyId.trim() || "dept_acad_" + Date.now();
    const skillsArray = newAcademySkills.split("\n").map(s => s.trim()).filter(Boolean);
    const careersArray = newAcademyCareers.split("\n").map(c => c.trim()).filter(Boolean);

    const newObj = {
      id,
      name: newAcademyName.trim(),
      iconName: newAcademyIcon.trim() || "BookOpen",
      description: newAcademyDesc.trim(),
      skills: skillsArray.length > 0 ? skillsArray : ["فهم تخصصات المسار", "التعلم والتطبيق المستمر"],
      careers: careersArray.length > 0 ? careersArray : ["العمل الحر أو في شركات متميزة"],
      maxCapacity: Number(newAcademyMaxCapacity) || 120
    };

    const nextList = [...academyDepartmentsList, newObj];
    setAcademyDepartmentsList(nextList);
    localStorage.setItem("custom_academy_departments_v1", JSON.stringify(nextList));
    window.dispatchEvent(new Event("departments_updated"));

    // Reset inputs
    setNewAcademyId("");
    setNewAcademyName("");
    setNewAcademyIcon("BookOpen");
    setNewAcademyDesc("");
    setNewAcademySkills("");
    setNewAcademyCareers("");
    setNewAcademyMaxCapacity(100);
    setShowAddAcademyForm(false);
    toast.success("✓ تم إضافة التخصص المالي الجديد وتحديث واجهة تصفح الأقسام بالكامل!");
  };

  const handleDeleteAcademyDept = (id: string) => {
    if (academyDepartmentsList.length <= 1) {
      toast.error("يجب إبقاء قسم دراسي واحد على الأقل لتفادي الفراغ التام!");
      return;
    }
    setDeleteId(id);
    setDeleteType("department");
    setSecurityPassword("");
    setSecurityError("");
    setShowSecurityModal(true);
  };

  const handleUpdateAcademyField = (id: string, field: string, value: any) => {
    const nextList = academyDepartmentsList.map((dept) => {
      if (dept.id === id) {
        if (field === "skills") {
          return { ...dept, skills: typeof value === "string" ? value.split("\n").map((s: string) => s.trim()).filter(Boolean) : value };
        }
        if (field === "careers") {
          return { ...dept, careers: typeof value === "string" ? value.split("\n").map((c: string) => c.trim()).filter(Boolean) : value };
        }
        return { ...dept, [field]: value };
      }
      return dept;
    });
    setAcademyDepartmentsList(nextList);
  };

  const handleBulkSaveAcademyDepts = () => {
    localStorage.setItem("custom_academy_departments_v1", JSON.stringify(academyDepartmentsList));
    window.dispatchEvent(new Event("departments_updated"));
    toast.success("✓ تم حفظ تعديلات وتغييرات التخصصات الدراسية (تصفح الأقسام) بنجاح فوري!");
  };

  // --- PASSWORD-PROTECTED CONFIRMATION FOR DELETES ---
  const handleSecurityConfirm = () => {
    if (securityPassword !== "Mm151997") {
      setSecurityError("كلمة المرور غير صحيحة! يرجى إدخال باسوورد المطور الصحيح.");
      return;
    }

    if (deleteType === "department") {
      const nextList = academyDepartmentsList.filter(d => d.id !== deleteId);
      setAcademyDepartmentsList(nextList);
      localStorage.setItem("custom_academy_departments_v1", JSON.stringify(nextList));
      window.dispatchEvent(new Event("departments_updated"));
      toast("✓ تم التحقق وحذف التخصص الدراسي من الموقع بالكامل!", {
        icon: "⚙️",
        style: {
          border: '1px solid #bfdbfe',
          background: '#eff6ff',
          color: '#1e40af'
        }
      });
    } else if (deleteType === "file") {
      const updatedList = pdfLibraryList.filter(f => f.id !== deleteId);
      setPdfLibraryList(updatedList);
      localStorage.setItem("custom_pdf_library_v1", JSON.stringify(updatedList));
      window.dispatchEvent(new Event("pdf_library_updated"));
      toast("✓ تم التحقق وحذف الملف وإلغاء بوابات تحميله النشطة بالكامل!", {
        icon: "⚙️",
        style: {
          border: '1px solid #bfdbfe',
          background: '#eff6ff',
          color: '#1e40af'
        }
      });
    }

    setShowSecurityModal(false);
    setDeleteId(null);
    setSecurityPassword("");
    setSecurityError("");
  };

  // --- DYNAMIC PDF LIBRARY CRUD ACTIONS ---
  const handleLibraryFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    
    setLibraryUploadProgress("جاري تجهيز الملف للرفع...");
    
    const formData = new FormData();
    formData.append("pdf", file);
    
    try {
      setLibraryUploadProgress("جاري رفع الملف وحفظه على السيرفر...");
      const res = await fetch("/api/pdf-library/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setLibraryFormUrl(data.fileUrl);
        if (!libraryFormName) {
          setLibraryFormName(file.name.replace(/\.[^/.]+$/, ""));
        }
        setLibraryUploadProgress("تم رفع الملف بنجاح وحفظه على السيرفر! ✓");
      } else {
        setLibraryUploadProgress(`فشل الرفع: ${data.error || "خطأ مجهول"}`);
      }
    } catch (err) {
      console.error(err);
      setLibraryUploadProgress("فشل في الاتصال بالسيرفر أثناء عملية الرفع.");
    }
  };

  const handleSaveLibraryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!libraryFormName.trim() || !libraryFormUrl.trim() || !libraryFormSpecialization) {
      alert("الرجاء ملء جميع خانات الاسم والرابط واختيار القسم المرتبط!");
      return;
    }
    
    setLibraryIsSaving(true);
    try {
      const updatedList = [...pdfLibraryList];
      if (libraryFormId) {
        const index = updatedList.findIndex(item => item.id === libraryFormId);
        if (index !== -1) {
          updatedList[index] = {
            id: libraryFormId,
            name: libraryFormName.trim(),
            url: libraryFormUrl.trim(),
            specialization: libraryFormSpecialization
          };
        }
      } else {
        updatedList.push({
          id: "file_" + Date.now(),
          name: libraryFormName.trim(),
          url: libraryFormUrl.trim(),
          specialization: libraryFormSpecialization
        });
      }
      
      setPdfLibraryList(updatedList);
      localStorage.setItem("custom_pdf_library_v1", JSON.stringify(updatedList));
      window.dispatchEvent(new Event("pdf_library_updated"));
      
      // Reset inputs
      setLibraryFormId("");
      setLibraryFormName("");
      setLibraryFormUrl("");
      setLibraryUploadProgress("");
      setLibraryIsSaving(false);
      alert("✓ تم حفظ كراسة الدليل/التخصص وربطه وبوابات التحميل بنجاح تام!");
    } catch (err) {
      setLibraryIsSaving(false);
      alert("فشل في الحفظ.");
    }
  };

  const handleEditLibraryItem = (item: any) => {
    setLibraryFormId(item.id);
    setLibraryFormName(item.name);
    setLibraryFormUrl(item.url);
    setLibraryFormSpecialization(item.specialization);
    setLibraryUploadProgress("تم استدعاء بيانات ومستندات الملف لتعديلها الحاسم.");
  };

  const triggerDeleteLibraryItem = (id: string) => {
    setDeleteId(id);
    setDeleteType("file");
    setSecurityPassword("");
    setSecurityError("");
    setShowSecurityModal(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[99999] flex items-center justify-center p-2 sm:p-4 text-slate-800 overflow-y-auto" dir="rtl">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-right flex flex-col my-8 max-h-[90vh]">
        
        {/* HEADER BLOCK - CRITICAL Visibility rule: STARK WHITE ON DARK NAVY */}
        <div className="bg-[#0a2463] text-white p-5 flex justify-between items-center sm:px-6 shrink-0 border-b border-indigo-950">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 text-slate-950 p-2 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white">بوابة التحقق من المطور - System Feeder 🤖🛠️</h3>
              <p className="text-[10px] text-amber-300 font-bold block mt-0.5">لوحة التغذية والتحكم المشددة بنظم المرئيات العامة وقيم الاستثمار لعام 2026</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all cursor-pointer"
            title="إغلاق لوحة المطور"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8 font-sans">
          
          <div className="p-3 bg-indigo-50 border border-indigo-150 rounded-2xl flex items-start gap-3 text-xs text-indigo-900 leading-relaxed font-sans font-bold">
            <span className="text-lg">💡</span>
            <p>مرحباً بك في بوابتك كـ Developer. هذه الواجهة آمنة ومخفية تماماً عن المستخدمين العاديين، تتيح لك تغذية المنصة ببيانات حقيقية وتخطيط قيم حاسبة العائد المالي، وشريط التوظيف، وتلقين التوجيه الذكي ومراجعات الطلاب.</p>
          </div>

          {/* MODERN SUB-TAB SELECTOR GRID */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl shrink-0" dir="rtl">
            <button
              type="button"
              onClick={() => setFeederSubTab("database")}
              className={`py-3 text-center text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                feederSubTab === "database"
                  ? "bg-[#0a2463] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <span>⚙️ إعدادات وتلقين قاعدة البيانات</span>
            </button>
            <button
              type="button"
              onClick={() => setFeederSubTab("leads")}
              className={`py-3 text-center text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                feederSubTab === "leads"
                  ? "bg-[#0a2463] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <span>📋 تبويب طلبات الطلاب والتصدير</span>
              {adminLeads.length > 0 && (
                <span className="bg-amber-500 text-slate-950 font-sans text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {adminLeads.length}
                </span>
              )}
            </button>
          </div>

          {feederSubTab === "database" ? (
            <>
              {/* SECTION 0: DATABASE BACKUP AND RESTORE FACILITY */}
          <div className="bg-gradient-to-r from-slate-900 via-[#0A2463] to-slate-950 text-white rounded-2xl p-5 border border-slate-800 shadow-md space-y-4 text-right" dir="rtl">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">💾</span>
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-slate-100">نسخة احتياطية آمنة واستعادة قاعدة بيانات البوابة 🏛️ (Backup & Restore Facility)</h4>
                <p className="text-[10px] text-slate-400 font-bold block mt-0.5">تصدير لوحة الإعدادات والمصروفات والوظيفة ومراجعات الطلاب كملف JSON مشفر، أو استعادته فورياً على أي كمبيوتر آخر لتفادي فقدان البيانات.</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleExportDatabase}
                className="px-4 py-2 bg-[#FF7F50] hover:bg-[#FF7F50]/90 text-white font-extrabold text-[11px] rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <span>تصدير قاعدة بيانات المنصة 📥</span>
              </button>
              
              <label className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95">
                <span>استيراد قاعدة بيانات المنصة 📤</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportDatabase}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* SECTION 1: DYNAMIC CRUD ROI CALCULATOR */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 sm:p-6 space-y-6">
            
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-200 pb-4">
              <div className="space-y-1">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-650 shrink-0" />
                  <span>تعديل وحوكمة حاسبة العائد المهني واستعادة الاستثمار (Dynamic ROI CRUD)</span>
                </h4>
                <p className="text-[10.5px] text-slate-500 font-bold">يمكنك إنشاء شعب دراسية لا نهائية وتحديد رواتبها ونسب الطلب وتعديل المحتوى بكل أريحية.</p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddDeptForm(!showAddDeptForm)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl flex items-center gap-1.5 self-start cursor-pointer transition-all shadow-sm"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>➕ إضافة مجال دراسي جديد</span>
              </button>
            </div>

            {/* Hidden Addition Form */}
            {showAddDeptForm && (
              <div className="p-4 bg-white border border-indigo-200 rounded-2xl space-y-4 animate-scale-up border-r-4 border-r-indigo-600">
                <h5 className="text-xs font-black text-indigo-950 flex items-center gap-1">
                  <span>✨ نموذج إضافة شعبة/تخصص دراسي جديد بالمنظومة والاستثمار:</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-700 mb-1">اسم التخصص / الشعبة مع إيموجي مميز:</label>
                    <input
                      type="text"
                      value={newDeptName}
                      onChange={(e) => setNewDeptName(e.target.value)}
                      placeholder="مثال: شعبة صيانة الشبكات والذكاء الاصطناعي 💻"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-700 mb-1">متوسط المرتب المتوقع فورا للتخرج (جنيه):</label>
                    <input
                      type="number"
                      value={newDeptSalary}
                      onChange={(e) => setNewDeptSalary(Number(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-700 mb-1">نسبة الطلب الإحصائي بالسوق للمسار:</label>
                    <input
                      type="text"
                      value={newDeptPct}
                      onChange={(e) => setNewDeptPct(e.target.value)}
                      placeholder="مثال: %95 أو طلب بنسبة %95 في السوق"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-700 mb-1">الدور الفني والتوصيف الوظيفي الموجز المعتمد:</label>
                    <input
                      type="text"
                      value={newDeptRole}
                      onChange={(e) => setNewDeptRole(e.target.value)}
                      placeholder="مثال: مساعد فني شبكات ونمذجة سحابية بالشركات"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-700 mb-1">مؤشر نبض سوق العمل والطلب الحالي:</label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={newDeptDemandBadge}
                        onChange={(e) => setNewDeptDemandBadge(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                      />
                      <select
                        onChange={(e) => setNewDeptDemandBadge(e.target.value)}
                        className="bg-slate-50 border border-slate-300 rounded-xl px-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="🔥 طلب شديد جداً - مقاعد محدودة متبقية">🔥 طلب شديد - مقاعد محدودة</option>
                        <option value="⚡ الأعلى نمواً في الرواتب هذا الأسبوع">⚡ الأعلى نمواً في الرواتب</option>
                        <option value="✨ نسبة توظيف فورية مضمونة %100">✨ توظيف فوري مضمون</option>
                        <option value="📈 طلب نشط جداً في المستشفيات">📈 طلب نشط في المستشفيات</option>
                        <option value="💎 التخصص الأكثر رغبة لدى أولياء الأمور">💎 الأكثر رغبة لدى العوائل</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddDeptForm(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    onClick={handleAddNewDepartment}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl cursor-pointer"
                  >
                    تأكيد وإدراج الشعبة ➕
                  </button>
                </div>
              </div>
            )}

            {/* List and Fields for existing departments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roiDepartments.map((dept) => (
                <div 
                  key={dept.id} 
                  className="bg-white border border-slate-200 shadow-3xs p-4 rounded-2xl relative space-y-3 shrink-0 flex flex-col justify-between"
                >
                  {/* Delete button wrapper */}
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md font-mono">
                      كود فريد: {dept.id}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteDepartment(dept.id)}
                      className="text-xs text-rose-600 hover:text-red-700 flex items-center gap-1 font-bold bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg cursor-pointer transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>إزالة الشعبة ❌</span>
                    </button>
                  </div>

                  {/* Form inputs with dark text on light backgrounds for perfect legibility */}
                  <div className="space-y-2.5 text-right">
                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold mb-0.5">اسم القسم الإرشادي والرموز:</label>
                      <input
                        type="text"
                        value={dept.name}
                        onChange={(e) => handleUpdateDepartmentField(dept.id, "name", e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold mb-0.5">المرتب (ج.م):</label>
                        <input
                          type="number"
                          value={dept.salary}
                          onChange={(e) => handleUpdateDepartmentField(dept.id, "salary", Number(e.target.value) || 0)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold mb-0.5">نسبة الطلب %:</label>
                        <input
                          type="text"
                          value={dept.careerPct}
                          onChange={(e) => handleUpdateDepartmentField(dept.id, "careerPct", e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold mb-0.5">الدور الوظيفي وخلاصة المسار:</label>
                      <input
                        type="text"
                        value={dept.role}
                        onChange={(e) => handleUpdateDepartmentField(dept.id, "role", e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold mb-0.5">مؤشر نبض سوق العمل والطلب الحالي:</label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={dept.demandBadge || "🔥 طلب شديد جداً - مقاعد محدودة متبقية"}
                          onChange={(e) => handleUpdateDepartmentField(dept.id, "demandBadge", e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                        />
                        <select
                          value={dept.demandBadge || "🔥 طلب شديد جداً - مقاعد محدودة متبقية"}
                          onChange={(e) => handleUpdateDepartmentField(dept.id, "demandBadge", e.target.value)}
                          className="bg-slate-50 border border-slate-300 rounded-lg px-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500 max-w-[120px]"
                        >
                          <option value="🔥 طلب شديد جداً - مقاعد محدودة متبقية">🔥 طلب شديد - مقاعد وبقاي</option>
                          <option value="⚡ الأعلى نمواً في الرواتب هذا الأسبوع">⚡ الأعلى نمواً في الرواتب</option>
                          <option value="✨ نسبة توظيف فورية مضمونة %100">✨ توظيف فوري مضمون</option>
                          <option value="📈 طلب نشط جداً في المستشفيات">📈 طلب نشط في المستشفيات</option>
                          <option value="💎 التخصص الأكثر رغبة لدى أولياء الأمور">💎 الأكثر رغبة لدى العوائل</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleBulkSaveDepartments}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-4.5 h-4.5" />
                <span>حفظ وتثبيت تعديلات أقسام الحاسبة المترابطة 💾</span>
              </button>
            </div>

          </div>

          {/* SECTION 1.5: GENERAL ACADEMIC DEPARTMENTS SYSTEM FEEDER */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 sm:p-6 space-y-6">
            
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-200 pb-4">
              <div className="space-y-1 text-right">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2 justify-start">
                  <BookOpen className="w-5 h-5 text-indigo-650 shrink-0" />
                  <span>التحكم في التخصصات الدراسية وتصفح الأقسام (Academic Departments Feeder) 🩺💻</span>
                </h4>
                <p className="text-[10.5px] text-slate-500 font-bold">حوكمة التخصصات المعروضة في صفحة تصفح الأقسام والتقديم، مما يحولها من وضع ثابت إلى وضع ديناميكي تفاعلي بالكامل.</p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddAcademyForm(!showAddAcademyForm)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl flex items-center gap-1.5 self-start cursor-pointer transition-all shadow-sm"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>➕ إضافة قسم دراسي جديد للموقع</span>
              </button>
            </div>

            {/* Unified Seat Capacity and Availability Monitoring Table */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 overflow-hidden shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-extrabold text-slate-950 flex items-center gap-1.5 justify-start">
                  <span>📊 لوحة مراقبة قدرة الاستيعاب والمقاعد الحية (Real-time Capacity Meter)</span>
                </h5>
                <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  تحديث فوري تلقائي ✓
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs border-collapse" dir="rtl">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-205 text-slate-600 font-extrabold">
                      <th className="p-2.5">اسم التخصص الدراسي</th>
                      <th className="p-2.5 text-center">الحد الأقصى للمقاعد</th>
                      <th className="p-2.5 text-center">المحجوز الفعلي (Leads)</th>
                      <th className="p-2.5 text-center">المقاعد المتبقية</th>
                      <th className="p-2.5 text-center">مؤشر نطاق التوافر (3 أثلاث)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {academyDepartmentsList.map((dept) => {
                      const maxCap = dept.maxCapacity !== undefined ? dept.maxCapacity : 120;
                      const count = adminLeads.filter(lead => {
                        if (lead.selectedDepartments && Array.isArray(lead.selectedDepartments)) {
                          return lead.selectedDepartments.includes(dept.name);
                        }
                        return lead.selectedDepartments === dept.name;
                      }).length;
                      
                      const remaining = maxCap - count;
                      
                      let tierColor = "";
                      let tierLabel = "";
                      let dotColor = "";
                      
                      // 3-Tier classification:
                      if (remaining > (2 / 3) * maxCap) {
                        tierColor = "text-emerald-700 bg-emerald-50 border-emerald-250";
                        tierLabel = "أخضر (نطاق آمن)";
                        dotColor = "bg-emerald-500 animate-pulse";
                      } else if (remaining > (1 / 3) * maxCap) {
                        tierColor = "text-amber-800 bg-amber-50 border-amber-200";
                        tierLabel = "أصفر (تنبيه مسبق)";
                        dotColor = "bg-amber-500 animate-pulse";
                      } else {
                        tierColor = "text-rose-700 bg-rose-50 border-rose-250";
                        tierLabel = "أحمر (استعجال حاد)";
                        dotColor = "bg-rose-500 animate-ping";
                      }
                      
                      return (
                        <tr key={dept.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-2.5 font-bold text-slate-900">{dept.name}</td>
                          <td className="p-2.5 text-center font-bold text-slate-600">{maxCap}</td>
                          <td className="p-2.5 text-center font-bold text-slate-600">{count}</td>
                          <td className="p-2.5 text-center font-black">
                            <span className={remaining <= 0 ? "text-rose-600 line-through font-extrabold" : remaining <= 10 ? "text-rose-600 font-extrabold" : "text-emerald-750"}>
                              {remaining <= 0 ? "مكتمل (0)" : `${remaining} مقعد`}
                            </span>
                          </td>
                          <td className="p-2.5 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black border ${tierColor}`}>
                              <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`}></span>
                              <span>{tierLabel}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Hidden Add Academy Form */}
            {showAddAcademyForm && (
              <div className="p-4 bg-white border border-indigo-200 rounded-2xl space-y-4 animate-scale-up border-r-4 border-r-indigo-600 text-right">
                <h5 className="text-xs font-black text-indigo-950 flex items-center gap-1 justify-start">
                  <span>✨ نموذج إضافة قسم دراسي جديد (لتصفح الأقسام):</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-700 mb-1">كود القسم الفريد (ID) - إنجليزي بدون مسافات:</label>
                    <input
                      type="text"
                      value={newAcademyId}
                      onChange={(e) => setNewAcademyId(e.target.value)}
                      placeholder="مثال: custom_nursing_dept"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-700 mb-1">اسم التخصص الدراسي الكلي:</label>
                    <input
                      type="text"
                      value={newAcademyName}
                      onChange={(e) => setNewAcademyName(e.target.value)}
                      placeholder="مثال: شعبة العلوم الصحية ومساعد ممرض"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-700 mb-1">اسم أيقونة الـ Lucide (إنجليزي):</label>
                    <input
                      type="text"
                      value={newAcademyIcon}
                      onChange={(e) => setNewAcademyIcon(e.target.value)}
                      placeholder="مثال: Heart or BookOpen or Award or Briefcase"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-700 mb-1">الحد الأقصى للمقاعد (maxCapacity):</label>
                    <input
                      type="number"
                      value={newAcademyMaxCapacity}
                      onChange={(e) => setNewAcademyMaxCapacity(Number(e.target.value) || 0)}
                      placeholder="مثال: 120"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10.5px] font-bold text-slate-700 mb-1">وصف موجز ومقنع للقسم والمستقبل الدراسي:</label>
                    <textarea
                      value={newAcademyDesc}
                      onChange={(e) => setNewAcademyDesc(e.target.value)}
                      placeholder="اكتب بالتفصيل أهمية التخصص وسنوات الدراسة والخصومات..."
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-700 mb-1">المهارات والخبرات المكتسبة (سطر جديد لكل مهارة):</label>
                    <textarea
                      value={newAcademySkills}
                      onChange={(e) => setNewAcademySkills(e.target.value)}
                      placeholder="مثال:&#10;الإسعافات الأولية الأساسية&#10;قراءة تخطيط رسم القلب&#10;العناية المركزة للأطفال"
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-700 mb-1">الوظائف ومجالات العمل السريعة (سطر جديد لكل وظيفة):</label>
                    <textarea
                      value={newAcademyCareers}
                      onChange={(e) => setNewAcademyCareers(e.target.value)}
                      placeholder="مثال:&#10;مساعد خدمات تمريضية بالمستشفيات&#10;مختص استقبال طوارئ وعناية حيوية&#10;فني بمراكز الأشعة والتحاليل"
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddAcademyForm(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    onClick={handleAddAcademyDept}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl cursor-pointer"
                  >
                    تأكيد وإدراج القسم الدراسي ➕
                  </button>
                </div>
              </div>
            )}

            {/* Grid of Existing Academy Departments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {academyDepartmentsList.map((dept) => (
                <div 
                  key={dept.id} 
                  className="bg-white border border-slate-200 shadow-3xs p-4 rounded-2xl relative space-y-3 shrink-0 flex flex-col justify-between text-right"
                >
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-[10px] font-extrabold text-blue-850 bg-blue-50 px-2 py-0.5 rounded-md font-mono">
                      كود القسم: {dept.id}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteAcademyDept(dept.id)}
                      className="text-xs text-rose-600 hover:text-red-700 flex items-center gap-1 font-bold bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg cursor-pointer transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف التخصص ❌</span>
                    </button>
                  </div>

                  <div className="space-y-2.5 text-right">
                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold mb-0.5">اسم التخصص الدراسي بالكامل:</label>
                      <input
                        type="text"
                        value={dept.name}
                        onChange={(e) => handleUpdateAcademyField(dept.id, "name", e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold mb-0.5">الحد الأقصى للمقاعد (maxCapacity):</label>
                        <input
                          type="number"
                          value={dept.maxCapacity !== undefined ? dept.maxCapacity : 120}
                          onChange={(e) => handleUpdateAcademyField(dept.id, "maxCapacity", Number(e.target.value) || 0)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold mb-0.5">اسم الأيقونة (Lucide):</label>
                        <input
                          type="text"
                          value={dept.iconName || "BookOpen"}
                          onChange={(e) => handleUpdateAcademyField(dept.id, "iconName", e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold mb-0.5">الوصف الدراسي الكامل:</label>
                      <textarea
                        value={dept.description}
                        onChange={(e) => handleUpdateAcademyField(dept.id, "description", e.target.value)}
                        rows={2}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold mb-0.5">المهارات (سطر سطر):</label>
                        <textarea
                          value={Array.isArray(dept.skills) ? dept.skills.join("\n") : dept.skills || ""}
                          onChange={(e) => handleUpdateAcademyField(dept.id, "skills", e.target.value)}
                          rows={2}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-[11px] font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold mb-0.5">الوظائف (سطر سطر):</label>
                        <textarea
                          value={Array.isArray(dept.careers) ? dept.careers.join("\n") : dept.careers || ""}
                          onChange={(e) => handleUpdateAcademyField(dept.id, "careers", e.target.value)}
                          rows={2}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-[11px] font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleBulkSaveAcademyDepts}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-4.5 h-4.5" />
                <span>حفظ وتثبيت تعديلات صفحة تصفح الأقسام 💾</span>
              </button>
            </div>

          </div>

          {/* SECTION 1.6: DYNAMIC PDF LIBRARY & FILE BOOKLET MANAGER */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 sm:p-6 space-y-4 text-right" id="developer-feeder-pdf-library-section">
            <h4 className="font-extrabold text-sm text-slate-950 flex items-center justify-start gap-1.5 font-sans">
              <span className="text-lg">📁</span>
              <span>إدارة كراسات وكتيبات التثبيت وبوابات التحميل الديناميكية 📚 (Dynamic File Manager)</span>
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed font-bold">
              يتحكم هذا القسم بجميع الملفات التي يستطيع الطلاب تنزيلها مباشرة من الموقع. يمكنك ربط كل كتيب بتخصص دراسي محدد، وتختفي خانة التحميل تلقائياً من صفحة التخصص الدراسي إذا تم مسح المستند، وتظهر فور الرفع.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Add/Edit Form Panel */}
              <div className="md:col-span-5 bg-white p-4 rounded-2xl border border-slate-200 space-y-3.5">
                <h5 className="text-xs font-black text-[#0A2463]">
                  {libraryFormId ? "✍️ تعديل كتيب معتمد حالي:" : "➕ إضافة وربط كتيب جديد للمنصة:"}
                </h5>

                <form onSubmit={handleSaveLibraryItem} className="space-y-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold mb-0.5">اسم مسمى الكتيب (للطلاب):</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: كتيب وخطة شعبة البرمجة لعام 2026"
                      value={libraryFormName}
                      onChange={(e) => setLibraryFormName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-505"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold mb-0.5">القسم أو الشعبة المرتبطة بالكتيب:</label>
                    <select
                      value={libraryFormSpecialization}
                      onChange={(e) => setLibraryFormSpecialization(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-505"
                    >
                      <option value="الدليل الرسمي الشامل 2026">📙 الدليل الرسمي الشامل (الرئيسية)</option>
                      {academyDepartmentsList.map((dept) => (
                        <option key={dept.id} value={dept.name}>
                          ⭐ {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold mb-0.5">ملف الكتيب المحلي (رفع مباشر للسيرفر):</label>
                    <div className="border border-dashed border-slate-300 rounded-lg p-3 bg-slate-50/50 flex flex-col items-center justify-center text-center">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleLibraryFileUpload}
                        id="developer-feeder-file-uploader"
                        className="hidden"
                      />
                      <label
                        htmlFor="developer-feeder-file-uploader"
                        className="px-3 py-1.5 bg-[#0a2463] text-white text-[10px] rounded-lg cursor-pointer font-black hover:bg-slate-900 transition flex items-center gap-1 shadow-sm"
                      >
                        <span>اختر ملف الكتيب لرفعه ⬆️</span>
                      </label>
                      {libraryUploadProgress && (
                        <p className="text-[10px] text-slate-600 font-semibold mt-2 animate-pulse leading-normal">
                          {libraryUploadProgress}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold mb-0.5">أو رابط الملف المباشر (URL):</label>
                    <input
                      type="url"
                      required
                      placeholder="https://example.com/file.pdf"
                      value={libraryFormUrl}
                      onChange={(e) => setLibraryFormUrl(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-550"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={libraryIsSaving}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl transition shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>💾 {libraryFormId ? "تحديث التعديلات" : "حفظ وربط وتثبيت"}</span>
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
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl cursor-pointer"
                      >
                        إلغاء
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* PDF Library List Display */}
              <div className="md:col-span-7 bg-white p-4 rounded-2xl border border-slate-200 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <h5 className="text-xs font-black text-slate-900">📑 الكتيبات المسجلة حالياً بالمحلية:</h5>
                    <span className="text-[10px] font-mono font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                      العدد: {pdfLibraryList.length}
                    </span>
                  </div>

                  <div className="space-y-2 max-h-[320px] overflow-y-auto pt-2">
                    {pdfLibraryList.length === 0 ? (
                      <p className="text-center text-slate-400 text-xs font-bold py-12">
                        لا توجد مستندات مسجلة حالياً بالمنصة.
                      </p>
                    ) : (
                      pdfLibraryList.map((file) => (
                        <div
                          key={file.id}
                          className="p-3 bg-slate-50 hover:bg-slate-100/85 border border-slate-150 rounded-xl text-right flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 font-sans"
                        >
                          <div className="space-y-1">
                            <strong className="text-xs text-slate-900 block font-extrabold leading-tight">
                              {file.name}
                            </strong>
                            <div className="flex flex-wrap items-center gap-1.5 text-[9.5px]">
                              <span className="bg-indigo-50 text-[#0a2463] px-1.5 py-0.2 rounded-md font-extrabold">
                                مرتبط بـ: {file.specialization}
                              </span>
                              <a
                                href={file.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-teal-600 hover:underline font-mono truncate max-w-[150px]"
                              >
                                {file.url}
                              </a>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <button
                              type="button"
                              onClick={() => handleEditLibraryItem(file)}
                              className="px-2 py-1 bg-white hover:bg-slate-200 border border-slate-250 text-slate-700 text-[10px] font-bold rounded-lg cursor-pointer transition-all"
                            >
                              تعديل
                            </button>
                            <button
                              type="button"
                              onClick={() => triggerDeleteLibraryItem(file.id)}
                              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-250 text-[10px] font-bold rounded-lg cursor-pointer transition-all flex items-center gap-0.5"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>حذف ❌</span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-bold leading-normal">
                  💡 تلميح أمني: عند حذف أي ملف، يختفي فوراً زر التحميل المطابق من واجهة الطالب، مما يزيل مخاطر الروابط المعطلة نهائياً.
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: JOB VACANCIES TICKEY MANAGEMENT */}
          <div className="bg-white border border-slate-205 rounded-3xl p-4 sm:p-6 space-y-4">
            <h4 className="font-extrabold text-sm text-slate-950 flex items-center justify-start gap-1.5 font-sans">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              <span>١. إدارة فرص التوظيف النشطة (شريط الماركي المتحرك بالرئيسية)</span>
            </h4>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={newJobText}
                onChange={(e) => setNewJobText(e.target.value)}
                placeholder="مثال: مستشفيات الشرطة تعلن عن حاجتها لفنيين صيانه أجهزة طبية براتب 12000 ج..."
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => {
                  if (!newJobText.trim()) return;
                  const updated = [newJobText.trim(), ...jobVacancies];
                  setJobVacancies(updated);
                  localStorage.setItem("custom_job_announcements", JSON.stringify(updated));
                  window.dispatchEvent(new Event("job_announcements_updated"));
                  setNewJobText("");
                  alert("تمت إضافة الفرصة لشريط التوظيف بنجاح!");
                }}
                className="px-5 py-2.5 bg-[#0a2463] hover:bg-indigo-900 text-white font-black rounded-xl text-xs shrink-0 cursor-pointer"
              >
                إضافة فرصة ➕
              </button>
            </div>

            <div className="space-y-2 max-h-[160px] overflow-y-auto border border-slate-100 rounded-xl p-2 bg-slate-50/50">
              {jobVacancies.map((job, index) => (
                <div key={index} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-150 text-xs text-slate-800 font-bold font-sans">
                  <span className="truncate flex-1 pl-4 text-right">{job}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = jobVacancies.filter((_, i) => i !== index);
                      setJobVacancies(updated);
                      localStorage.setItem("custom_job_announcements", JSON.stringify(updated));
                      window.dispatchEvent(new Event("job_announcements_updated"));
                    }}
                    className="text-rose-600 hover:text-red-700 font-extrabold px-1 text-[11px] cursor-pointer"
                  >
                    إزالة ❌
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: REVIEWS DIRECT ENTRY */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 sm:p-6 space-y-4">
            <h4 className="font-extrabold text-sm text-slate-950 flex items-center justify-start gap-1.5 font-sans">
              <Star className="w-5 h-5 text-amber-500" />
              <span>٢. إدارة آراء وتقييمات خريجي الأكاديميات (الشهادات الموثقة بالصفحة الرئيسية)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Form panel */}
              <div className="md:col-span-5 bg-white p-4 rounded-2xl border border-slate-200 space-y-3.5 text-right shrink-0">
                <h5 className="text-xs font-black text-[#0A2463]">✍️ إضافة مراجعة خريج جديدة:</h5>
                
                <div className="space-y-2 text-right">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold">اسم الطالب الكريم:</label>
                    <input
                      type="text"
                      value={newReviewName}
                      onChange={(e) => setNewReviewName(e.target.value)}
                      placeholder="يوسف ماجد القاضي"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold">التخصص / المسار الدراسي:</label>
                    <input
                      type="text"
                      value={newReviewDept}
                      onChange={(e) => setNewReviewDept(e.target.value)}
                      placeholder="قسم الحاسب أو البرمجة"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold">المحافظة الجغرافية:</label>
                    <input
                      type="text"
                      value={newReviewGov}
                      onChange={(e) => setNewReviewGov(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold">النجوم:</label>
                    <select
                      value={newReviewStars}
                      onChange={(e) => setNewReviewStars(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (ممتاز وموثق)</option>
                      <option value={4}>⭐⭐⭐⭐ (جيد جداً)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold">نص المراجعة والشهادة الصادقة:</label>
                    <textarea
                      value={newReviewText}
                      onChange={(e) => setNewReviewText(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-medium text-slate-900 text-right"
                      placeholder="اكتب التقييم والنص المتميز للطالب هنا..."
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!newReviewName.trim() || !newReviewText.trim()) {
                        alert("يرجى تعبئة الاسم ونص الشهادة الصادقة!");
                        return;
                      }
                      const initials = newReviewName.trim().split(" ").slice(0, 2).map(n => n[0]).join(" ");
                      const colors = ["bg-blue-600", "bg-rose-600", "bg-emerald-600", "bg-amber-600", "bg-indigo-600"];
                      const randomCol = colors[Math.floor(Math.random() * colors.length)] + " text-white";

                      const newRevObj: Review = {
                        id: Date.now(),
                        studentName: newReviewName.trim(),
                        department: newReviewDept.trim() || "تخصص الأكاديمية التطبيقي",
                        governorate: newReviewGov.trim() || "غير مدون",
                        rating: newReviewStars,
                        text: newReviewText.trim(),
                        avatarColor: randomCol,
                        initials: initials || "ط ج",
                        date: new Date().toLocaleDateString("ar-EG"),
                        verified: true
                      };

                      const nextArr = [newRevObj, ...studentTestimonials];
                      setStudentTestimonials(nextArr);
                      localStorage.setItem("custom_student_reviews", JSON.stringify(nextArr));
                      window.dispatchEvent(new Event("student_reviews_updated"));

                      setNewReviewName("");
                      setNewReviewDept("");
                      setNewReviewText("");
                      alert("✓ تم حفظ وإدراج تقييم الطالب بنجاح!");
                    }}
                    className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-750 text-white font-black text-xs rounded-lg cursor-pointer"
                  >
                    إضافة التقييم بنجاح 🌸
                  </button>
                </div>
              </div>

              {/* List panel */}
              <div className="md:col-span-7 space-y-2 max-h-[380px] overflow-y-auto border border-slate-200 rounded-2xl p-3 bg-white">
                {studentTestimonials.map((item) => (
                  <div key={item.id} className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1 relative text-right">
                    <div className="flex justify-between items-center text-[10.5px]">
                      <strong className="text-indigo-900">{item.studentName} ({item.governorate})</strong>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = studentTestimonials.filter(r => r.id !== item.id);
                          setStudentTestimonials(updated);
                          localStorage.setItem("custom_student_reviews", JSON.stringify(updated));
                          window.dispatchEvent(new Event("student_reviews_updated"));
                        }}
                        className="text-rose-600 hover:text-red-700 font-extrabold inline text-[10px] cursor-pointer"
                      >
                        إزالة ❌
                      </button>
                    </div>
                    <p className="text-[9px] text-slate-400 font-bold">{item.department} • {"⭐".repeat(item.rating)}</p>
                    <p className="text-xs text-slate-700 font-sans leading-relaxed">"{item.text}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 4: AI KNOWLEDGE TRANSMISSION BASE */}
          <div className="bg-white border border-slate-205 rounded-3xl p-4 sm:p-6 space-y-4">
            <h4 className="font-extrabold text-sm text-slate-950 flex items-center justify-start gap-1.5 font-sans">
              <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
              <span>٣. تغذية مساعد القبول الاستشاري والذكاء الاصطناعي (AI Prompt Base)</span>
            </h4>

            <p className="text-xs text-slate-600 font-bold leading-relaxed">
              قم بصياغة البنود والأسئلة الشائعة والقواعد الأكاديمية والشروط السنوية ليحفظها مستشارك الذكي بالدردشة الالية:
            </p>

            <textarea
              value={aiAdvisorTrainingText}
              onChange={(e) => setAiAdvisorTrainingText(e.target.value)}
              rows={4}
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-xs text-slate-900 leading-relaxed text-right focus:outline-none focus:border-indigo-500 font-bold"
              placeholder="شريط معزز للتوجيه"
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem("academy_ai_advisor_training", aiAdvisorTrainingText);
                  localStorage.setItem("academy_ai_prompt_base", aiAdvisorTrainingText);
                  
                  // Dispatch window events
                  window.dispatchEvent(new Event("academy_prompt_updated"));
                  window.dispatchEvent(new StorageEvent("storage", { key: "academy_ai_prompt_base", newValue: aiAdvisorTrainingText }));
                  window.dispatchEvent(new StorageEvent("storage", { key: "academy_ai_advisor_training", newValue: aiAdvisorTrainingText }));
                  
                  toast.success("✓ تم تحديث وتزويد تكنولوجيا المساعد الذكي بتغذية البيانات بنجاح ممتاز!");
                }}
                className="px-5 py-2.5 bg-indigo-650 bg-[#0a2463] hover:bg-slate-900 text-white font-black text-xs rounded-xl cursor-pointer shadow-xs"
              >
                تأكيد ومزامنة تغذية المساعد الذكي 🤖✓
              </button>
            </div>
          </div>
          </>
        ) : (
          <div className="space-y-6 pt-2 animate-fade-in" dir="rtl">
            
            {/* Header inside Tab */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 text-right flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                  <span className="text-lg">📋</span>
                  <span>كشوفات ومستندات طلبات الطلاب المسجلين بالمنصة</span>
                </h4>
                <p className="text-[11px] text-slate-500 font-bold">
                  إدارة بيانات الطلاب المسجلين واستخراج تقارير التوزيع مباشرةً للمؤسسة الراعية والموزعين.
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-600 bg-slate-200 px-3 py-1.5 rounded-lg">
                  العدد الإجمالي بالخلاصة: <strong className="text-indigo-650 font-mono text-sm">{adminLeads.length}</strong> طالب
                </span>
              </div>
            </div>

            {/* SECURE CSV EXPORT PANEL */}
            <div className="bg-[#0A2463] text-white rounded-3xl p-5 border border-indigo-950 shadow-md space-y-4 text-right">
              <div className="flex items-start gap-3">
                <span className="text-xl">📊</span>
                <div className="space-y-0.5">
                  <h5 className="font-extrabold text-xs sm:text-sm text-amber-300">مصدّر البيانات المركزي وتأكيد الهوية (CSV Export Engine)</h5>
                  <p className="text-[10px] text-slate-200 font-bold leading-normal">
                    لضمان التوافق الأمني والخصوصية الكاملة لبيانات أولياء الأمور والطلاب بموجب القانون، تتطلب دالة التصدير باسوورد الإدارة الرئيسي لتشغيل ملف الـ CSV وتنزيله بجودة Excel تدعم اللغة العربية.
                  </p>
                </div>
              </div>

              <div className="bg-white/10 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="w-full sm:max-w-xs space-y-1">
                  <label className="block text-[10px] text-indigo-200 font-black">أدخل كود المرتبة الإدارية (Verify Password):</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={exportPassword}
                      onChange={(e) => setExportPassword(e.target.value)}
                      placeholder="أدخل باسوورد المطور هنا..."
                      className="w-full bg-white/15 border border-white/20 rounded-xl px-3 py-2.5 text-xs text-white placeholder-indigo-200/50 font-mono font-bold tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleExportLeadsCSV}
                    disabled={exportPassword !== "Mm151997"}
                    className={`w-full sm:w-auto px-5 py-3 rounded-xl font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      exportPassword === "Mm151997"
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse"
                        : "bg-white/10 text-white/40 cursor-not-allowed"
                    }`}
                  >
                    <span>تصدير كشوفات الطلاب (Export to CSV) 📥</span>
                  </button>
                  {exportPassword === "Mm151997" ? (
                    <span className="text-[9px] text-emerald-400 font-bold">✓ تم التحقق الأمني - زر التصدير نشط الآن!</span>
                  ) : (
                    <span className="text-[9px] text-indigo-200 font-bold">🔒 يرجى كتابة الرمز الصحيح لفك قفل التصدير</span>
                  )}
                </div>
              </div>
            </div>

            {/* STUDENTS LEAD TABLE PREVIEW */}
            <div className="bg-white border border-slate-205 rounded-3xl overflow-hidden shadow-xs">
              <div className="p-4 bg-slate-50 border-b border-rose-100 flex items-center justify-between">
                <span className="text-xs font-black text-slate-800">📋 السجلات الحالية بقاعدة البيانات (مأخوذة من مراميز leads_db)</span>
                <span className="text-[10px] text-slate-500 font-mono">آخر تحديث مباشر</span>
              </div>
              
              {adminLeads.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs font-bold leading-relaxed">
                  <span className="text-3xl block mb-2">📥</span>
                  لم يتم رصد تسجيلات دخول بمحاكاة السيرفر المحلي حالياً.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-250">
                      <tr>
                        <th className="p-3.5 pr-4">اسم الطالب</th>
                        <th className="p-3.5">رقم الهاتف</th>
                        <th className="p-3.5">التخصص / الشعب المطلوبة</th>
                        <th className="p-3.5 pl-4">تاريخ التسجيل بالبوابة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {adminLeads.map((lead, idx) => {
                        const dateStr = lead.createdAt 
                          ? new Date(lead.createdAt).toLocaleDateString("ar-EG") 
                          : (lead.consentTimestamp ? new Date(lead.consentTimestamp).toLocaleDateString("ar-EG") : "غير محدد");
                        
                        const deptStr = Array.isArray(lead.selectedDepartments) 
                          ? lead.selectedDepartments.join(" | ") 
                          : (lead.selectedDepartments || lead.basicCourse || "عامة");

                        return (
                          <tr key={lead.id || idx} className="hover:bg-slate-50/80 transition-all font-sans">
                            <td className="p-3.5 pr-4 font-black text-slate-900">{lead.studentName || "مجهول الاسم"}</td>
                            <td className="p-3.5 font-mono font-bold text-slate-600">{lead.phoneNumber || "بلا هاتف"}</td>
                            <td className="p-3.5 text-indigo-650 font-bold">
                              <span className="inline-block bg-indigo-50 text-[#0f172a] text-[10px] px-2 py-1 rounded-md">
                                {deptStr}
                              </span>
                            </td>
                            <td className="p-3.5 pl-4 text-[10.5px] text-slate-400 font-bold">{dateStr}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

      </div>

        {/* MODAL FOOTER */}
        <div className="bg-slate-50 border-t border-slate-150 p-4 shrink-0 flex justify-end gap-2 px-6">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-black transition-all cursor-pointer"
          >
            إغلاق اللوحة 닫기
          </button>
        </div>

      </div>

      {/* 🏛️ CRITICAL SECURITY MODAL OVERLAY FOR PASSWORDS */}
      {showSecurityModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100000] flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-2xl shadow-2xl border border-slate-205 p-6 space-y-4 text-right animate-scale-up" dir="rtl">
            <div className="flex items-center gap-2.5 text-rose-650 border-b border-slate-100 pb-3">
              <span className="text-xl">🔐</span>
              <strong className="text-sm font-black text-slate-950">المصادقة الأمنية للمطور</strong>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-600 font-extrabold leading-relaxed">
                {deleteType === "department" 
                  ? "⚠️ تنبيه حرج: أنت على وشك حذف تخصص دراسي بأكمله من قاعدة البيانات وبوابات الحجز للطلاب. يُرجى تأكيد العملية بإدخال كلمة مرور الحماية:"
                  : "⚠️ تنبيه حرج: أنت على وشك حذف مستند كراسة تحميل وإلغاء خيار تنزيلها وبوابات مطابقتها فوراً. يُرجى تأكيد العملية بإدخال كلمة مرور الحماية:"
                }
              </p>

              <input
                type="password"
                required
                placeholder="أدخل باسوورد المطور (Mm151997)..."
                value={securityPassword}
                onChange={(e) => setSecurityPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSecurityConfirm();
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-center text-xs font-mono font-bold tracking-widest text-[#0a2463] focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
              />

              {securityError && (
                <p className="text-[10px] text-rose-600 font-extrabold text-center leading-normal">
                  ❌ {securityError}
                </p>
              )}
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleSecurityConfirm}
                className="flex-1 py-2.5 bg-[#dc2626] hover:bg-red-700 text-white font-extrabold text-xs rounded-xl cursor-pointer transition shadow-md"
              >
                تأكيد الحذف 🗑️
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSecurityModal(false);
                  setDeleteId(null);
                  setSecurityPassword("");
                  setSecurityError("");
                }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-750 font-bold text-xs rounded-xl cursor-pointer transition"
              >
                تراجع
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
