import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { StudentReviews } from "../components/StudentReviews";
import Hero from "../components/Hero";
import { ACADEMY_DEPARTMENTS } from "../data";
import { 
  GraduationCap, 
  BookOpen, 
  CheckCircle, 
  Ticket, 
  Award, 
  ChevronLeft, 
  Compass, 
  Sparkles,
  BookMarked,
  ShieldCheck,
  TrendingUp,
  X,
  Calendar,
  Layers,
  FileCheck,
  Share2,
  Copy,
  Check
} from "lucide-react";
import { 
  LiveJobVacanciesTicker, 
  AIAcademicAdvisorWidget, 
  ROIProfessionalCalculator, 
  CorporateHiringGate, 
  FreeShadowingTicketBooking, 
  InteractiveMajorSimulator, 
  CareerPathRoadmap, 
  ParentsVIPAssurance, 
  LiveApplicationTrackAndTrace 
} from "../components/InteractiveMarketingSuite";

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

export default function Home() {
  const navigate = useNavigate();
  const [simulatedStudentsCount, setSimulatedStudentsCount] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("academy_simulated_count_v1");
      return saved ? parseInt(saved, 10) : 4872;
    }
    return 4872;
  });

  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);
  const [activeHomeTab, setActiveHomeTab] = useState<string>("tab1");
  const [isLoadingPosts, setIsLoadingPosts] = useState<boolean>(true);
  const [newsPosts, setNewsPosts] = useState<any[]>([]);
  const [sharedCopiedId, setSharedCopiedId] = useState<string | null>(null);

  const handleCopyShare = (postId: string, title: string) => {
    const shareUrl = `${window.location.origin}/?post=${postId}&source=organic_student_share`;
    const text = `اقرأ هذا المنشور الهام من بوابة المعاهد والأكاديميات المهنية المعتمدة دفعة 2026: "${title}"\n${shareUrl}`;
    navigator.clipboard.writeText(text);
    setSharedCopiedId(postId);
    setTimeout(() => setSharedCopiedId(null), 2500);
  };

  const getWhatsAppShareUrl = (postId: string, title: string) => {
    const shareUrl = `${window.location.origin}/?post=${postId}&source=whatsapp_share`;
    const text = `بوابة المعاهد والأكاديميات المهنية المعتمدة 🎓\nانظر المادة التثقيفية المنشورة: "${title}"\nرابط القبول والتسجيل المباشر:\n${shareUrl}`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  };

  const getFacebookShareUrl = (postId: string) => {
    const shareUrl = `${window.location.origin}/?post=${postId}&source=facebook_share`;
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  };

  // Sync news posts with localStorage and simulate mounting skeleton placeholders
  useEffect(() => {
    document.title = "بوابة المعاهد والأكاديميات الخاصة - الرئيسية";
    
    const loadNews = () => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("custom_news_posts_v1");
        if (saved) {
          try {
            setNewsPosts(JSON.parse(saved));
          } catch (e) {
            setNewsPosts(DEFAULT_NEWS_POSTS);
          }
        } else {
          localStorage.setItem("custom_news_posts_v1", JSON.stringify(DEFAULT_NEWS_POSTS));
          setNewsPosts(DEFAULT_NEWS_POSTS);
        }
      } else {
        setNewsPosts(DEFAULT_NEWS_POSTS);
      }
    };

    loadNews();

    // Trigger local update listener
    const handleNewsUpdate = () => {
      loadNews();
    };
    window.addEventListener("news_posts_updated", handleNewsUpdate);

    // Simulate skeleton loader integration for mounting news feed
    const timer = setTimeout(() => {
      setIsLoadingPosts(false);
    }, 700);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("news_posts_updated", handleNewsUpdate);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" dir="rtl" id="homepage-root">
      
      {/* 1. Hero Showcase Section */}
      <Hero />

      {/* 1.5 Live Job Vacancies Ticker Feed */}
      <LiveJobVacanciesTicker />

      {/* 2. Live Metrics Banner Overview */}
      <section className="bg-white border-b border-slate-200 py-8 px-4 md:px-8" id="live-metrics-banner">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Item 1 */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-150 flex items-center gap-4 hover:border-indigo-650/30 transition shadow-xs" id="metric-card-1">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-black">الدليل الأكاديمي</span>
              <strong className="text-sm font-extrabold text-slate-900 font-sans">
                ١٧ تخصصاً وشعبة معتمدة
              </strong>
              <p className="text-[10px] text-slate-500 font-medium font-sans">مغطي ببيانات تفصيلية حية بالمرجع</p>
            </div>
          </div>

          {/* Item 2 */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-150 flex items-center gap-4 hover:border-emerald-650/30 transition shadow-xs" id="metric-card-2">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-black">النزاهة الأكاديمية</span>
              <strong className="text-sm font-extrabold text-slate-900 font-sans">معايير صدق ١٠٠٪</strong>
              <p className="text-[10px] text-emerald-600 font-bold font-sans">توجيه صريح ضد مبالغات التوظيف المباشر</p>
            </div>
          </div>

          {/* Item 3 */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-150 flex items-center gap-4 hover:border-amber-650/30 transition shadow-xs" id="metric-card-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#FF7F50] flex items-center justify-center shrink-0">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-black">خصومات المصروفات</span>
              <strong className="text-sm font-extrabold text-[#FF7F50] font-sans">حفظ خصومات الدفعة</strong>
              <p className="text-[10px] text-slate-500 font-medium font-sans">حجز المقاعد مجاني ومثبت للعام الجديد</p>
            </div>
          </div>

          {/* Item 4 */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-150 flex items-center gap-4 hover:border-blue-650/30 transition shadow-xs" id="metric-card-4">
            <div className="w-12 h-12 rounded-xl bg-[#0A2463]/5 text-[#0A2463] flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-black">الاعتمادات والتأجيل</span>
              <strong className="text-sm font-extrabold text-slate-900 font-sans">شهادات مهنية معتمدة</strong>
              <p className="text-[10px] text-indigo-600 font-bold font-sans">تأجيل الموقف التجنيدي للذكور متاح</p>
            </div>
          </div>

        </div>
      </section>

      {/* 2.5 Tabbed component container restoring screenshots exact content */}
      <section className="bg-slate-100 py-10 px-4 md:px-8 border-b border-slate-200" id="homepage-tabs-section">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="text-center md:text-right space-y-2">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
              <span className="text-xs font-black text-amber-600 tracking-wider">التفاصيل التنظيمية المعتمدة</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0A2463] font-sans leading-tight">
              الاعتمادات، المصروفات الرسمية، وملفات القبول لدفعة 2026 🏛️
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold max-w-3xl">
              تصفح التبويبات الفورية بالأسفل للاطلاع على كافة الوثائق القانونية، والملاحظات المالية، وكشوف الأوراق والملفات المطلوبة لتثبيت المقعد التعليمي بالأكاديميات.
            </p>
          </div>

          {/* Tab buttons rows */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border-b border-slate-205 pb-3 font-sans" id="home-tabs-bar">
            {[
              { id: "tab1", label: "الشهادات والاعتمادات القانونية", icon: "⚖️" },
              { id: "tab2", label: "المصروفات والتقسيط الرسمي", icon: "💰" },
              { id: "tab3", label: "تأجيل التجنيد والأنشطة الطلابية", icon: "🪖" },
              { id: "tab4", label: "الأوراق والمستندات المطلوبة (دفعة 2026)", icon: "📁" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveHomeTab(tab.id)}
                className={`py-3.5 px-3 rounded-xl border text-xs font-bold leading-tight transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5 shadow-3xs ${
                  activeHomeTab === tab.id
                    ? "bg-[#0A2463] text-white border-[#0A2463] shadow-md transform -translate-y-0.5"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
                id={`home-trigger-${tab.id}`}
              >
                <span className="text-sm shrink-0">{tab.icon}</span>
                <span className="truncate">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab content cards matching literal Arabic text */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-3xs text-right leading-relaxed" id="home-tabs-content">
            
            {/* Tab 1 content */}
            {activeHomeTab === "tab1" && (
              <div className="space-y-6 animate-fade-in" id="content-tab1">
                {/* Warning Banner */}
                <div className="bg-red-50 border-r-4 border-red-500 p-4 rounded-r-xl rounded-l-lg text-red-900 text-xs sm:text-sm font-black flex items-start gap-2 leading-relaxed">
                  <span className="text-lg leading-none shrink-0">⚠️</span>
                  <p>توضيح وإقرار قانوني هام جداً للكل: جميع البرامج التعليمية، الأكاديميات، والتخصصات المدرجة في هذه البوابة غير خاضعة للتعليم العالي المصري و لا تتبع المجلس الأعلى للجامعات المصرية.</p>
                </div>

                {/* Accreditation Bullets */}
                <div className="space-y-3.5">
                  <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-150 text-xs text-slate-705 leading-relaxed font-semibold">
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <p>الدراسة بهذه البرامج هي دراسة مهنية، تطبيقية، وتدريبية بحتة تهدف فقط لتأهيل الطلاب لسوق العمل واكتساب المهارات اليدوية والتقنية اللازمة للتوظيف في الشركات أو العيادات أو المعامل الخاصة.</p>
                  </div>
                  <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-150 text-xs text-slate-705 leading-relaxed font-semibold">
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <p>لا تمنح هذه المعاهد والأكاديميات تخصصات أكاديمية معادلة لدرجة البكالوريوس أو الليسانس أو الدبلوم الأكاديمي الصادر عن الجامعات الحكومية الخاضعة للمجلس الأعلى للجامعات.</p>
                  </div>
                </div>

                {/* Grid Cards section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                  <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl hover:border-amber-500/30 transition shadow-3xs text-right">
                    <span className="text-xl block mb-2">🦅</span>
                    <h4 className="font-extrabold text-xs sm:text-sm text-[#0A2463] mb-1">اعتماد جامعة حكومية + ختم النسر</h4>
                    <p className="text-[11px] text-slate-500 leading-normal">معتمد مع ختم النسر الرسمي والتوثيق القانوني للملفات.</p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl hover:border-amber-500/30 transition shadow-3xs text-right">
                    <span className="text-xl block mb-2">🌍</span>
                    <h4 className="font-extrabold text-xs sm:text-sm text-[#0A2463] mb-1">توثيق الخارجية المصرية متاح رسمياً للراغبين بالسفر</h4>
                    <p className="text-[11px] text-slate-500 leading-normal">توثيق واستخراج قانوني متاح بالتنسيق مع الجهات السيادية للسفر الخارجي.</p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl hover:border-amber-500/30 transition shadow-3xs text-right">
                    <span className="text-xl block mb-2">📜</span>
                    <h4 className="font-extrabold text-xs sm:text-sm text-[#0A2463] mb-1">شهادة الدبلوم التدريبي المعتمد</h4>
                    <p className="text-[11px] text-slate-500 leading-normal">شهادة تخرج مهنية تسلم للطلاب تثبت تدرجه وتجيز العمل بالقطاعات الخاصة المتنوعة.</p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl hover:border-amber-500/30 transition shadow-3xs text-right">
                    <span className="text-xl block mb-2">🩺</span>
                    <h4 className="font-extrabold text-xs sm:text-sm text-[#0A2463] mb-1">شهادة تدريب وخبرة عملية ميدانية (إثبات تدريب ميداني حقيقي)</h4>
                    <p className="text-[11px] text-slate-500 leading-normal">بيان فترات الإيداع والنزول الميداني بالتدريبات بالمستشفيات والشركاء لتوكيد المهارة.</p>
                  </div>
                </div>

                {/* Rules of Professional Eligibility Card */}
                <div className="border border-amber-500/20 bg-amber-500/5 p-4 rounded-xl mt-4 space-y-2 text-right">
                  <h5 className="text-sm font-black text-amber-800 flex items-center gap-1.5 justify-start">
                    <span>⚠️</span>
                    <span>قواعد الاستحقاق المهني:</span>
                  </h5>
                  <p className="text-xs text-slate-700 font-bold leading-relaxed">
                    يطلب من الطلاب الحضور الفعلي والملتزم بالمعامل والمواقع للحصول على شهادات الخبرة.
                  </p>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    الأكاديمية تركز على جعل السيرة الذاتية الخاصة بك مبهرة للعمل مباشرة دون عثرات وبمصداقية واقعية 100%.
                  </p>
                </div>
              </div>
            )}

            {/* Tab 2 content */}
            {activeHomeTab === "tab2" && (
              <div className="space-y-6 animate-fade-in" id="content-tab2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Card 1 */}
                  <div className="p-5 bg-amber-500/5 border border-amber-500/10 rounded-2xl text-right flex flex-col justify-between shadow-3xs space-y-3">
                    <div>
                      <span className="bg-amber-100 text-[#D49800] px-3 py-1 rounded-xl text-[10.5px] font-black block w-fit mb-2.5">
                        الرسوم الدراسية المعتمدة 💰
                      </span>
                      <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                        تتراوح المصروفات السنوية المعتمدة لكافة تخصصات المعاهد والأكاديميات من 10 آلاف إلى 17 ألف جنيه مصري فقط في السنة (حسب القسم المختار، شاملة جميع المختبرات والنزول الميداني).
                      </p>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="p-5 bg-emerald-550/5 border border-emerald-500/10 rounded-2xl text-right flex flex-col justify-between shadow-3xs space-y-3">
                    <div>
                      <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-xl text-[10.5px] font-black block w-fit mb-2.5">
                        خصومات دفعة العام الجديد حالياً 🎁
                      </span>
                      <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                        متاح حالياً خصم حصري معتمد يبدأ من 2,000 جنيه مصري ويصل حتى 6,000 جنيه مصري كاملة عند إتمام الحجز المبدئي وتأكيد الملف اليوم (متاحة للتقديم المبكر حالياً).
                      </p>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="p-5 bg-blue-500/5 border border-blue-500/10 rounded-2xl text-right flex flex-col justify-between shadow-3xs space-y-3">
                    <div>
                      <span className="bg-blue-105 text-[#0A2463] px-3 py-1 rounded-xl text-[10.5px] font-black block w-fit mb-2.5 font-sans">
                        خصومات الكاش ونظام التقسيط المريح 📉
                      </span>
                      <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                        خصومات الكاش ونظام التقسيط المريح: خصم مميز وخاص جداً في حالة الدفع كاش بالكامل. نظام التقسيط المريح بصورة كل شهر أو بصورة كل ترم دبلوم تيسيراً لظروف الطلاب المادية، وذلك بعد التنسيق والاتفاق مع الإدارة المعنية.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Alert */}
                <div className="p-4 bg-slate-950 text-amber-400 rounded-xl text-xs font-semibold leading-relaxed border border-slate-900 shadow-3xs">
                  ⚠️ <strong className="font-sans font-black">الملاحظات التنظيمية والمالية الهامة:</strong> يتم إبلاغ وتدليغ ولي الأمر من قبل خدمة العملاء المتعلقة بالمصاريف. تشمل الإجراءات: فتح الملف وتأكيد التقديم وحجز مقعد وطباعة الكتب الخاصة بالطالب لضمان الجاهزية التامة طوال فترة دراستك.
                </div>
              </div>
            )}

            {/* Tab 3 content */}
            {activeHomeTab === "tab3" && (
              <div className="space-y-6 animate-fade-in" id="content-tab3">
                {/* Main Tagnid Box */}
                <div className="p-5 bg-indigo-50/50 border border-indigo-200/65 rounded-2xl text-right">
                  <div className="flex items-center gap-2 mb-2 text-[#0A2463]">
                    <span className="text-lg">🪖</span>
                    <h4 className="font-black text-xs sm:text-sm font-sans">تأجيل التجنيد والخدمة العسكرية للطلاب (هام) 🪖</h4>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                    إيماناً منا بضرورة تيسير الظروف لطلبتنا لاستكمال دراستهم التطبيقية، يتوفر خيار تأجيل التجنيد العسكري للطلاب الذكور الراغبين في ذلك، والذين ينطبق عليهم السن والضوابط القانونية. تفاصيل وتكاليف الخدمة: يخضع تأجيل التجنيد لـ سداد رسوم إضافية تفرضها العيادات والمعاهد بصفة إدارية وتنظيمية لتجهيز المستندات الرسمية المعتمدة ودفاتر استمارات التأجيل وربطها مع الجهات المعنية لتأمين تأجيل التجنيد القانوني للطالب طوال سنين دراسته.
                  </p>
                </div>

                {/* Extra Perks Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl text-right hover:border-indigo-100 transition shadow-3xs space-y-2">
                    <span className="text-lg block">🎉</span>
                    <h5 className="font-extrabold text-xs text-[#0A2463] font-sans">حفلات استقبال وفعاليات حية للطلبة (بناء بيئة جامعية دافئة)</h5>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      نؤمن بأهمية الجانب النفسي للطلاب، لذلك نقوم بتنظيم حفلات استقبال ترحيبية ضخمة للطلبة الجدد مع بداية كل موسم دراسي بهدف كسر حواجز الرهبة، وتعديل العلاقات الاجتماعية بين الطلاب والدكاترة، بالإضافة لرحلات ترفيهية دورية ممتعة.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl text-right hover:border-indigo-100 transition shadow-3xs space-y-2">
                    <span className="text-lg block">🎓</span>
                    <h5 className="font-extrabold text-xs text-[#0A2463] font-sans">عرض الدورات الإضافية والورش المجانية (دورات مكملة مجاناً)</h5>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      يحصل الطلاب الملتحقون بالتخصصات على باقة من الدورات المهنية الموازية (كورسات مكثفة في اللغات، الحاسب الآلي، برمجيات المبيعات، والإسعافات الأولية)، وهي مدمجة داخل الخطة ومقدمة لدعم جودة سيرتك الذاتية في التوظيف مجاناً وبلا رسوم دراسية إضافية.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl text-right hover:border-indigo-100 transition shadow-3xs space-y-2">
                    <span className="text-lg block">🆔</span>
                    <h5 className="font-extrabold text-xs text-[#0A2463] font-sans">كارنيه العضوية والانتساب للأكاديمية</h5>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                      بطاقة الدخول الرسمية والانتساب للطالب، لتنظيم الدخول وتأكيد تواجده في غرف المحاضرات والمختبرات طوال مدة البرنامج.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4 content */}
            {activeHomeTab === "tab4" && (
              <div className="space-y-4 animate-fade-in" id="content-tab4">
                <div className="bg-emerald-50/20 border border-emerald-500/15 rounded-2xl p-5" id="tab4-checklist">
                  <h4 className="font-black text-emerald-950 text-xs sm:text-sm mb-4">الأوراق والمستندات المطلوبة للتقديم (دفعة 2026) 📁:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      "صورة من شهادة ميلاد الطالب / الطالبة",
                      "صورة من البطاقة الشخصية للطالب",
                      "صورة من بطاقة ولي الأمر (الأب / الأم)",
                      "أربع صور شخصية مكتوب عليها اسم الطالب/ة",
                      "صورة من الشهادة المؤهلة (الشهادة الإعدادية، الدبلوم، الثانوية، إلخ)",
                      "دوسيه أبيض شفاف"
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-white border border-slate-150 p-4 rounded-xl hover:border-emerald-450 transition hover:shadow-3xs">
                        <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                          <CheckCircle className="w-4 h-4 text-emerald-600 stroke-[3]" />
                        </div>
                        <span className="text-xs text-slate-800 font-extrabold font-sans select-none">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* 2.8 Interactive Marketing & Operational Showroom */}
      <section className="bg-slate-50 py-10 px-4 md:px-8 border-b border-slate-205" id="home-interactive-suite">
        <div className="max-w-7xl mx-auto space-y-10">
          
          {/* Centered Ticket & Cohesion Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full uppercase tracking-wider">
              مفاجأة دفعة 2026 الحصرية للزيارات 🔬
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[#0A2463]">
              يوم المعايشة التجريبي المجاني والنزول الفعلي للمعامل 🏫
            </h2>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              افتح أبواب التجربة الواقعية! يمكنك الآن تأكيد حجزك المجاني والانتقال للمعامل الرئيسية لمعاينة التجهيزات والاندماج مع طلبة الدفعة قبل اتخاذ أي قرار نهائي بالدفع.
            </p>
            <div className="flex justify-center pt-2">
              <FreeShadowingTicketBooking />
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Grid stack for Simulator & Track Tool */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <InteractiveMajorSimulator />
            <LiveApplicationTrackAndTrace />
          </div>

          <hr className="border-slate-200" />

          {/* Careers timeline & Return on Investment Calculator */}
          <div className="space-y-8">
            <ROIProfessionalCalculator />
            <CareerPathRoadmap />
          </div>

        </div>
      </section>

      {/* 3. Main Body Split */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 my-2" id="home-split-container">
        
        {/* Left Column (8 cols): Article Feed + Testimonials */}
        <div className="lg:col-span-8 space-y-8 text-right" id="home-left-rail">
          
          {/* ARTICLE CONTENT FEED SECTION */}
          <div className="space-y-4" id="news-section-feed">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3 justify-start">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                <BookMarked className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-black text-slate-950 font-sans">
                دليل النجاح والتثقيف الأكاديمي الرقمي 📚
              </h2>
            </div>

            {/* Skeleton Loader Integration for Mounting State */}
            {isLoadingPosts ? (
              <div className="space-y-4 font-sans" id="news-skeletons">
                {[1, 2, 3].map((num) => (
                  <div key={num} className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 animate-pulse space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-4 bg-slate-200 rounded-md w-24"></div>
                      <div className="h-3 bg-slate-200 rounded-md w-16"></div>
                    </div>
                    <div className="h-5 bg-slate-200 rounded-md w-3/4"></div>
                    <div className="h-4 bg-slate-200 rounded-md w-full"></div>
                    <div className="h-4 bg-slate-200 rounded-md w-5/6"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4" id="news-posts-grid">
                {newsPosts.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 font-bold bg-white border border-slate-150 rounded-2xl">
                    📪 لا توجد مقالات مسجلة حالياً بالمنصة.
                  </div>
                ) : (
                  newsPosts.map((art) => {
                    const isOpen = activeArticleId === art.id;
                    return (
                      <div 
                        key={art.id}
                        className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 hover:border-amber-500/20 hover:shadow-xs transition duration-200 space-y-3 relative overflow-hidden"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2.5">
                          <span className="bg-indigo-50 text-[#0A2463] px-2.5 py-0.5 rounded-md text-[10px] font-black border border-indigo-100">
                            {art.category}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono font-bold">
                            {art.readTime || "قراءة في ٣ دقائق"}
                          </span>
                        </div>

                        <h3 className="text-sm sm:text-base font-black text-slate-900 font-sans hover:text-amber-500 transition duration-150 leading-snug">
                          {art.title}
                        </h3>
                        
                        <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                          {art.desc}
                        </p>

                        {/* Expandable detailed content */}
                        {isOpen ? (
                          <div className="p-4 bg-slate-50 rounded-xl border border-slate-150 mt-3 animate-fade-in text-[11.5px] text-slate-700 leading-relaxed font-sans font-medium">
                            {art.content}
                          </div>
                        ) : null}

                        <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-100 mt-3 pt-3">
                          <button
                            onClick={() => setActiveArticleId(isOpen ? null : art.id)}
                            className="text-xs text-[#0A2463] hover:text-amber-500 font-black flex items-center gap-1 transition-all cursor-pointer select-none inline-flex"
                            id={`read-article-btn-${art.id}`}
                          >
                            <span>{isOpen ? "إخفاء التفاصيل 📖" : "اقرأ الدليل والمقال بالكامل 📖"}</span>
                            <ChevronLeft className={`w-3.5 h-3.5 transform transition-transform ${isOpen ? "rotate-90" : "rotate-0"}`} />
                          </button>

                          {/* Social Sharing bar */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-black text-slate-400 ml-1">مشاركة المنشور:</span>
                            
                            {/* WhatsApp Share Button */}
                            <a
                              href={getWhatsAppShareUrl(art.id, art.title)}
                              target="_blank"
                              rel="noreferrer referrer"
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 border border-emerald-100 rounded-lg text-[10px] font-bold transition flex items-center gap-1"
                              title="مشاركة عبر واتساب"
                            >
                              <span>واتساب</span>
                            </a>

                            {/* Facebook Share Button */}
                            <a
                              href={getFacebookShareUrl(art.id)}
                              target="_blank"
                              rel="noreferrer referrer"
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-105 text-blue-700 hover:text-blue-800 border border-blue-100 rounded-lg text-[10px] font-bold transition flex items-center gap-1"
                              title="مشاركة عبر فيسبوك"
                            >
                              <span>فيسبوك</span>
                            </a>

                            {/* Copy Link Button with trigger feedback */}
                            <button
                              type="button"
                              onClick={() => handleCopyShare(art.id, art.title)}
                              className={`px-2.5 py-1 border rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                                sharedCopiedId === art.id
                                  ? "bg-emerald-500 text-white border-emerald-500"
                                  : "bg-slate-50 hover:bg-slate-100 text-slate-705 border-slate-205"
                              }`}
                              title="نسخ رابط المقال"
                            >
                              {sharedCopiedId === art.id ? (
                                <>
                                  <Check className="w-3 h-3 stroke-[3]" />
                                  <span>تم النسخ!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>نسخ الرابط</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* STUDENT REVIEW LIST SECTION */}
          <div className="space-y-4" id="home-reviews-slider-box">
            <StudentReviews />
          </div>

        </div>

        {/* Right Sidebar Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6 text-right" id="home-right-rail">
          
          {/* Quick Guidance Portal Promo */}
          <div className="bg-gradient-to-br from-[#0A2463] to-slate-900 text-white p-6 rounded-3xl border border-slate-800 space-y-4 shadow-sm" id="home-sidebar-guidance-card">
            <div className="flex items-center gap-2.5 text-amber-400">
              <Compass className="w-5.5 h-5.5 text-amber-400 animate-pulse" />
              <h3 className="font-extrabold text-sm sm:text-base font-sans">مستشار التوجيه الذكي</h3>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              إذا كنت في حيرة من أمرك ولم تستقر بعد على شعبة معينة، تتيح لك البوابة أداة ذكاء توجيهي معتمدة لتحليل ميولك وتقييم رغباتك وترشيح القسم الملائم لك.
            </p>

            <Link 
              to="/guidance"
              className="inline-flex w-full items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white py-3 px-4 rounded-xl text-xs font-black transition shadow-md"
            >
              <span>ابدأ اختبار تحديد تخصصك الدراسي الآن 💯</span>
              <ChevronLeft className="w-4 h-4 animate-bounce-short" />
            </Link>
          </div>

          {/* Ethics guidelines */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4" id="home-ethics-card">
            <h3 className="font-extrabold text-md text-[#0A2463] border-b border-slate-100 pb-2.5 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>ميثاق النزاهة والحياد الأكاديمي</span>
            </h3>
            
            <p className="text-xs text-slate-650 leading-relaxed font-semibold">
              تلتزم بوابة المعاهد والأكاديميات بالوقوف كشريك تعليمي حقيقي للطالب دون إثقال كاهله بوعود تعيين فوري أو نسب توظيف خيالية ومزيفة:
            </p>

            <ul className="space-y-2.5">
              {[
                "تقييم دقيق للمؤهل الدراسي (كعام، أزهري، دبلومات تكنولوجية)",
                "مساواة كاملة في الدعم العملي لجميع فئات الطلاب المتقدمين",
                "نشرك الطلاب وأولياء أمورهم في صياغة الأهداف المهنية والواقعية"
              ].map((policy, idx) => (
                <li key={idx} className="text-xs text-slate-755 flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <CheckCircle className="w-4 h-4 text-emerald-650 shrink-0 mt-0.5" />
                  <span>{policy}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick departments navigation list */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4" id="home-depts-mini-list">
            <h3 className="font-extrabold text-md text-[#0A2463] border-b border-slate-100 pb-3">
              دليل حجز الشعب والتخصصات 🗺️
            </h3>
            
            <div className="grid grid-cols-1 gap-2">
              {ACADEMY_DEPARTMENTS.slice(0, 7).map((dept) => (
                <Link
                  key={dept.id}
                  to={`/discounts?preselected=${dept.id}`}
                  className="w-full text-right p-2.5 hover:bg-slate-50 text-xs font-semibold text-slate-700 rounded-lg transition border border-slate-100 hover:border-slate-300 flex items-center justify-between cursor-pointer font-sans"
                >
                  <span>{dept.name}</span>
                  <ChevronLeft className="w-4 h-4 text-slate-400" />
                </Link>
              ))}
            </div>
            
            <Link 
              to="/departments"
              className="text-xs text-[#0A2463] hover:text-amber-500 font-extrabold text-center block pt-2 underline underline-offset-4"
            >
              عرض وتصفح كافة الشعب الدراسية (١٧ شعبة) ←
            </Link>
          </div>

        </div>

      </main>

      {/* 4. Strategic Bottom Trust-Building Enclosures */}
      <section className="bg-slate-100 py-10 px-4 md:px-8 border-t border-slate-200" id="trust-building-showroom">
        <div className="max-w-7xl mx-auto space-y-8">
          <ParentsVIPAssurance />
          <CorporateHiringGate />
        </div>
      </section>

      {/* Floating Chat bot widget helper */}
      <AIAcademicAdvisorWidget />

    </div>
  );
}
