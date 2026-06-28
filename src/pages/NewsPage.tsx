import React, { useState, useEffect, useRef } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { toast } from "react-hot-toast";
import { 
  Calendar, 
  Clock, 
  Search, 
  Share2, 
  ChevronLeft,
  X,
  GraduationCap,
  TrendingUp,
  Megaphone,
  User,
  ExternalLink,
  Sliders
} from "lucide-react";
import SpeechButton from "../components/SpeechButton";

interface NewsPost {
  id: string;
  title: string;
  desc: string;
  category: string;
  readTime: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
}

const DEFAULT_NEWS_POSTS: NewsPost[] = [
  {
    id: "1",
    title: "حفل التخرج السنوي وتكريم المتفوقين برعاية وزارة التعليم العالي 🎓",
    desc: "أقامت الأكاديمية حفل التخرج المهيب لتكريم الدفعة الجديدة من الفنيين والمبرمجين والمؤهلين لسوق العمل مباشرة...",
    category: "أخبار الفعاليات والطلاب 🎓",
    readTime: "قراءة في ٤ دقائق",
    content: "شهدت قاعة الاحتفالات الكبرى انطلاق فعاليات التخرج السنوي بحضور لفيف من السادة المسؤولين ورجال الأعمال وممثلي كبرى الشركات الصناعية والتكنولوجية. وتم تسليم الدروع التذكارية وشهادات التقدير المعتمدة للطلاب الأوائل والمتميزين مع إعلان تعيينهم الفوري في الشركات الراعية تفعيلاً لبروتوكولات الشراكة والتوظيف المباشر.\n\nإن سعينا الدائم لتوطين التقنية وتأهيل الكوادر الشابة هو المحرك الأساسي وراء هذا التميز، ونتطلع لرؤية هؤلاء المهنيين يقودون سوق العمل بكل ثقة واقتدار.",
    imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop",
    createdAt: "2026-06-25T10:00:00.000Z"
  },
  {
    id: "2",
    title: "إطلاق منصة التوجيه المهني واختبار الشغف لطلاب الثانوية والدبلومات 🎯",
    desc: "تسهيلاً على الطلاب الجدد، أطلقت البوبة منصة التوجيه الأكاديمي الرقمية لمساعدتهم على اختيار التخصص المناسب...",
    category: "توجيه مهني 🧭",
    readTime: "قراءة في ٣ دقائق",
    content: "تتضمن المنصة الجديدة اختبارات تفاعلية مجانية بالكامل لتحليل ميول الطالب وقدراته الشخصية، ثم مطابقتها مع التخصصات المهنية والتقنية المتاحة كشعبة الأجهزة الطبية وتكنولوجيا الحاسبات والتحاليل الطبية والتربية. تهدف هذه الخطوة لتوجيه طاقات الطلاب نحو المجالات الأكثر طلباً بسوق العمل الإقليمي والمحلي.\n\nنهيب بأبنائنا الطلاب الاستفادة من هذه الأداة المجانية المتطورة لتحديد رغباتهم بدقة قبل تعبئة استمارة التقديم الإلكترونية.",
    imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=800&auto=format&fit=crop",
    createdAt: "2026-06-24T14:30:00.000Z"
  },
  {
    id: "3",
    title: "وزارة التعليم تمنح اعتمادات جودة جديدة لشعبة صيانة الأجهزة الطبية 🏥",
    desc: "أعلنت إدارة الجودة والاعتماد بوزارة التعليم العالي عن منح شعبة التكنولوجيا الحيوية الطبية شهادة الاعتماد والجودة القياسية...",
    category: "إعلانات رسمية 📣",
    readTime: "قراءة في ٥ دقائق",
    content: "في إنجاز ريادي جديد يعكس متانة المناهج الأكاديمية والتطبيقية، حصلت الأكاديمية على الاعتماد الأكاديمي الشامل لبرامج صيانة الأجهزة الطبية والمخبرية. يسهم هذا الاعتماد في تزويد المستشفيات والشركات بفنيين على أعلى درجات الجاهزية والاحترافية لتغطية العجز التكنولوجي وتطوير الخدمات التشخيصية والعلاجية بجميع المحافظات.",
    imageUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=800&auto=format&fit=crop",
    createdAt: "2026-06-23T09:15:00.000Z"
  },
  {
    id: "4",
    title: "فتح باب القبول والتقديم المبكر للعام الجامعي الجديد ٢٠٢٦/٢٠٢٧ 🏛️",
    desc: "تعلن المعاهد التابعة للأكاديمية عن فتح باب سحب ملفات التقديم والقبول المبدئي لطلاب الثانوية العامة والأزهرية والدبلومات الفنية...",
    category: "أخبار المعاهد 🏛️",
    readTime: "قراءة في دقيقتين",
    content: "تسهيلاً على أولياء الأمور والطلاب، تقرر استقبال طلبات الالتحاق المبدئية وسحب الكراسات إلكترونياً أو بمقر إدارة شؤون الطلاب المركزية. نوجه عناية المتقدمين بضرورة مراجعة شروط السن والحد الأدنى للقبول لكل شعبة، وتجهيز الأوراق المطلوبة (أصل شهادة التخرج، شهادة الميلاد المميكنة، وصور شخصية حديثة).",
    imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800&auto=format&fit=crop",
    createdAt: "2026-06-22T11:00:00.000Z"
  }
];

const getFrameClass = (styleName: string = "default", hasFrame: boolean = true) => {
  if (!hasFrame || styleName === "no_frame") {
    return "border-0 bg-transparent p-0 shadow-none text-center space-y-3";
  }
  switch (styleName) {
    case "dotted":
      return "border-3 border-dotted border-[#0A2463] bg-slate-50/50 rounded-2xl p-3 text-center space-y-3 transition-all";
    case "dashed":
      return "border-2 border-dashed border-orange-500 bg-orange-50/40 rounded-2xl p-3 text-center space-y-3 transition-all";
    case "double":
      return "border-4 border-double border-[#0A2463] bg-blue-50/30 rounded-2xl p-3 text-center space-y-3 transition-all";
    case "neon_glow":
      return "border-2 border-cyan-400 bg-cyan-950/10 shadow-[0_0_20px_rgba(34,211,238,0.6)] rounded-2xl p-3 text-center space-y-3 transition-all";
    case "royal_gold":
      return "border-2 border-amber-500 bg-amber-500/5 shadow-[0_10px_25px_rgba(245,158,11,0.35)] rounded-2xl p-3 text-center space-y-3 transition-all";
    case "rounded_navy":
      return "border-4 border-[#0A2463] bg-[#0A2463]/5 rounded-[32px] p-4 text-center space-y-3 transition-all";
    case "glassmorphic":
      return "border border-white/40 bg-white/10 backdrop-blur-md shadow-lg rounded-2xl p-3 text-center space-y-3 transition-all";
    case "smooth_3d":
      return "border-b-4 border-r-4 border-t border-l border-slate-350 bg-slate-100 rounded-2xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_4px_6px_rgba(0,0,0,0.06)] p-3 text-center space-y-3 transition-all";
    case "gradient_borders":
      return "border-2 border-transparent bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 rounded-2xl p-3 text-center space-y-3 text-white transition-all shadow-md";
    case "thick_classic":
      return "border-6 border-slate-800 bg-white rounded-xl p-3 text-center space-y-3 shadow-md transition-all";
    case "floating_shadows":
      return "border border-slate-100 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.12)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.2)] -translate-y-1 hover:-translate-y-2 rounded-2xl p-4 text-center space-y-3 transition-all duration-300";
    case "sharp_minimal":
      return "border-2 border-slate-900 bg-white rounded-none p-3 text-center space-y-3 shadow-none transition-all";
    case "vintage_wave":
      return "border-2 border-amber-900/50 bg-[#FDFBF7] p-3 shadow-inner rounded-3xl text-center space-y-3 transition-all";
    case "super_elegant":
      return "border border-amber-200 bg-slate-950 text-amber-100 rounded-2xl shadow-[0_4px_25px_rgba(217,119,6,0.2)] p-4 text-center space-y-3 transition-all";
    case "gold_glow":
      return "border-2 border-amber-400 bg-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.4)] rounded-2xl p-3 text-center space-y-3 transition-all";
    case "neon_blue":
      return "border-2 border-blue-500 bg-blue-500/5 shadow-[0_0_15px_rgba(59,130,246,0.45)] rounded-2xl p-3 text-center space-y-3 transition-all";
    case "neon_red":
      return "border-2 border-rose-500 bg-rose-500/5 shadow-[0_0_15px_rgba(244,63,94,0.45)] rounded-2xl p-3 text-center space-y-3 transition-all";
    case "dashed_coral":
      return "border-2 border-dashed border-orange-500 bg-orange-50/50 rounded-2xl p-4 text-center space-y-3 transition-all";
    case "double_indigo":
      return "border-4 border-double border-indigo-600 bg-indigo-50/40 rounded-2xl p-3 text-center space-y-3 transition-all";
    case "brutalist":
      return "border-3 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl p-3 text-center space-y-3 transition-all";
    case "soft_shadow":
      return "border-0 bg-white shadow-[0_10px_35px_rgba(0,0,0,0.12)] rounded-2xl p-4 text-center space-y-3 transition-all";
    case "gradient_fire":
      return "border-2 border-transparent bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 shadow-lg rounded-2xl p-3 text-center space-y-3 text-white transition-all";
    case "glassmorphism":
      return "border border-white/30 bg-white/20 backdrop-blur-md shadow-lg rounded-2xl p-3 text-center space-y-3 transition-all";
    case "retro_dotted":
      return "border-2 border-dotted border-slate-800 bg-slate-50 rounded-2xl p-3 text-center space-y-3 transition-all";
    case "playful_yellow":
      return "border-4 border-yellow-400 bg-amber-50 rounded-2xl shadow-[2px_2px_0px_rgba(0,0,0,0.15)] p-3 text-center space-y-3 transition-all";
    case "emerald_tech":
      return "border-2 border-emerald-500 bg-slate-900 text-emerald-300 rounded-2xl shadow-[0_0_10px_rgba(16,185,129,0.2)] p-3 text-center space-y-3 transition-all";
    case "vintage_paper":
      return "border-2 border-amber-900/40 bg-[#FDFBF7] p-3 shadow-inner rounded-md text-center space-y-3 transition-all";
    case "royal_purple":
      return "border-2 border-purple-600 bg-purple-500/5 shadow-[0_5px_15px_rgba(124,58,237,0.3)] rounded-2xl p-3 text-center space-y-3 transition-all";
    case "default":
    default:
      return "bg-[#0A2463]/5 border-2 border-dashed border-[#0a2463]/15 rounded-2xl p-3 text-center space-y-3 shadow-xs transition-all";
  }
};

interface AdConfigType {
  visible: boolean;
  title: string;
  description: string;
  linkUrl: string;
  imageUrl: string;
  btnText: string;
  hasFrame?: boolean;
  mode?: string;
  textPosition?: string;
  frameStyle?: string;
}

function RenderAd({ ad }: { ad: AdConfigType }) {
  if (!ad.visible) return null;

  const hasFrame = ad.hasFrame !== false;
  const mode = ad.mode || "image_and_text";
  const textPosition = ad.textPosition || "below";
  const frameStyle = ad.frameStyle || "default";

  const frameClasses = getFrameClass(frameStyle, hasFrame);

  const imageElement = ad.imageUrl ? (
    <div className={`overflow-hidden h-72 bg-slate-50 transition-all duration-300 ${hasFrame ? "rounded-xl border border-slate-200" : "rounded-none w-full"}`}>
      <LazyLoadImage 
        src={ad.imageUrl} 
        alt={ad.title} 
        className="w-full h-full object-cover transition-transform duration-550 hover:scale-105" 
        referrerPolicy="no-referrer"
        effect="opacity"
        wrapperClassName="w-full h-full block"
      />
    </div>
  ) : (
    <div className="h-60 bg-gradient-to-b from-[#0a2463] to-slate-900 rounded-xl flex items-center justify-center text-white text-xs p-3 font-bold">
      إعلان البوابة المعتمد 📣
    </div>
  );

  const textElement = (
    <div className="space-y-2 text-right">
      <h4 className={`text-[11px] font-black leading-normal ${ad.frameStyle === "gradient_fire" ? "text-white" : ad.frameStyle === "emerald_tech" ? "text-emerald-400" : "text-slate-900"}`}>{ad.title}</h4>
      <p className={`text-[9.5px] font-semibold leading-relaxed line-clamp-3 ${ad.frameStyle === "gradient_fire" ? "text-white/85" : ad.frameStyle === "emerald_tech" ? "text-emerald-350" : "text-slate-650"}`}>{ad.description}</p>
      <a 
        href={ad.linkUrl}
        className="block text-center py-2 bg-[#FF7F50] hover:bg-[#FF7F50]/90 text-white font-extrabold text-[10px] rounded-lg transition-all shadow-sm cursor-pointer"
      >
        {ad.btnText || "تواصل معنا 📞"}
      </a>
    </div>
  );

  if (mode === "image_only") {
    return (
      <div className={frameClasses}>
        {hasFrame && (
          <span className="text-[9px] font-black text-white bg-amber-600 px-3 py-1 rounded-full uppercase tracking-wider block w-fit mx-auto mb-1">
            مساحة إعلانية
          </span>
        )}
        <a href={ad.linkUrl} className="block hover:opacity-95 transition-opacity w-full">
          {imageElement}
        </a>
      </div>
    );
  }

  let adContentLayout = null;

  if (textPosition === "above") {
    adContentLayout = (
      <div className="space-y-3">
        {textElement}
        {imageElement}
      </div>
    );
  } else if (textPosition === "right") {
    adContentLayout = (
      <div className="flex flex-col gap-3">
        <div className="w-full">{textElement}</div>
        <div className="w-full">{imageElement}</div>
      </div>
    );
  } else if (textPosition === "left") {
    adContentLayout = (
      <div className="flex flex-col gap-3">
        <div className="w-full">{imageElement}</div>
        <div className="w-full">{textElement}</div>
      </div>
    );
  } else {
    // default/below
    adContentLayout = (
      <div className="space-y-3">
        {imageElement}
        {textElement}
      </div>
    );
  }

  return (
    <div className={frameClasses}>
      {hasFrame && (
        <div className="text-center mb-1">
          <span className="text-[9px] font-black text-white bg-amber-600 px-3 py-1 rounded-full uppercase tracking-wider inline-block">
            مساحة إعلانية
          </span>
          <p className={`text-[9px] font-black leading-snug mt-1 ${ad.frameStyle === "gradient_fire" ? "text-white" : ad.frameStyle === "emerald_tech" ? "text-emerald-400" : "text-[#0a2463]"}`}>رعاية رسمية للبوابة</p>
        </div>
      )}
      {adContentLayout}
    </div>
  );
}

export default function NewsPage() {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>("default");
  const prevPostsRef = useRef<NewsPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<NewsPost | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("الكل");
  
  // Custom headers editable via developer dashboard
  const [pageTitle, setPageTitle] = useState("📰 المركز الإعلامي والأخبار الحصرية");
  const [pageSubtitle, setPageSubtitle] = useState("تابع آخر أخبار التنسيق والقبول بالمعاهد الفنية المعتمدة، فعاليات التخرج، والندوات الإرشادية والتوعوية لضمان اختيار مستقبلك الأكاديمي الأنسب.");

  // Featured Carousel Slide Index
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);

  // Right Ad Config
  const [rightAdConfig, setRightAdConfig] = useState({
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
  });

  // Left Ad Config
  const [leftAdConfig, setLeftAdConfig] = useState({
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
  });

  // Header Left / Right Custom Content
  const [headerRightType, setHeaderRightType] = useState("none"); // none, text, image, both
  const [headerRightText, setHeaderRightText] = useState("");
  const [headerRightImage, setHeaderRightImage] = useState("");
  const [headerRightHasFrame, setHeaderRightHasFrame] = useState(true);
  const [headerRightTextPosition, setHeaderRightTextPosition] = useState("below"); // below, above, right, left
  const [headerRightFrameStyle, setHeaderRightFrameStyle] = useState("default");

  const [headerLeftType, setHeaderLeftType] = useState("none"); // none, text, image, both
  const [headerLeftText, setHeaderLeftText] = useState("");
  const [headerLeftImage, setHeaderLeftImage] = useState("");
  const [headerLeftHasFrame, setHeaderLeftHasFrame] = useState(true);
  const [headerLeftTextPosition, setHeaderLeftTextPosition] = useState("below"); // below, above, right, left
  const [headerLeftFrameStyle, setHeaderLeftFrameStyle] = useState("default");

  // Ticker Custom State
  const [tickerType, setTickerType] = useState("auto"); // auto, custom
  const [tickerCustomText, setTickerCustomText] = useState("تنبيه هام: فتح باب سحب ملفات التقديم والقبول المبدئي لجميع الشعب والقبول لدفعة ٢٠٢٦ • استخرج استمارتك الإلكترونية الآن برقم الهاتف بسهولة •");

  // Left Sidebar Custom Widget State (replaces Newsletter)
  const [customBoxVisible, setCustomBoxVisible] = useState(true);
  const [customBoxEmoji, setCustomBoxEmoji] = useState("📢");
  const [customBoxTitle, setCustomBoxTitle] = useState("تنويه هام للطلاب");
  const [customBoxText, setCustomBoxText] = useState("يمكنك كتابة أي إشعار أو تنويه أو إعلان هنا وتعديله فورياً من لوحة المطور لتنظيم حركة التواصل مع الطلاب.");
  const [customBoxBtnText, setCustomBoxBtnText] = useState("دليل التقديم والمستندات 📄");
  const [customBoxBtnUrl, setCustomBoxBtnUrl] = useState("/registration-guide");

  const loadData = () => {
    // Load News Posts
    const saved = localStorage.getItem("custom_news_posts_v1");
    let currentPosts: NewsPost[] = [];
    if (saved) {
      try {
        currentPosts = JSON.parse(saved);
      } catch (e) {
        currentPosts = DEFAULT_NEWS_POSTS;
      }
    } else {
      currentPosts = DEFAULT_NEWS_POSTS;
      localStorage.setItem("custom_news_posts_v1", JSON.stringify(DEFAULT_NEWS_POSTS));
    }

    setPosts(currentPosts);

    // If there's a previously loaded set of posts, check for newly added posts to trigger browser push notifications
    if (prevPostsRef.current.length > 0) {
      const prevIds = prevPostsRef.current.map(p => p.id);
      const newPosts = currentPosts.filter(p => !prevIds.includes(p.id));
      if (newPosts.length > 0) {
        newPosts.forEach(post => {
          if ("Notification" in window && Notification.permission === "granted") {
            try {
              new Notification(`خبر عاجل جديد: ${post.category || "المركز الإعلامي"} 📣`, {
                body: post.title,
                icon: post.imageUrl || "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=80&auto=format&fit=crop"
              });
            } catch (err) {
              console.error("Failed to trigger browser push notification:", err);
            }
          }
        });
      }
    }
    prevPostsRef.current = currentPosts;

    // Load Right Ad Config
    const savedRightAd = localStorage.getItem("custom_news_ad_right_v2");
    if (savedRightAd) {
      try {
        const parsed = JSON.parse(savedRightAd);
        setRightAdConfig({
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
        });
      } catch (e) {}
    } else {
      // Legacy fallback
      const savedAd = localStorage.getItem("custom_news_ad_v1");
      if (savedAd) {
        try {
          const parsed = JSON.parse(savedAd);
          setRightAdConfig({
            visible: parsed.visible !== false,
            title: "مساحة إعلانية",
            description: parsed.description || "سجل الآن لضمان مقعدك الدراسي في التخصصات الأكثر طلباً بسوق العمل والحصول على المزايا الخاصة.",
            linkUrl: parsed.linkUrl || "/registration-guide",
            imageUrl: parsed.imageUrl || "https://images.unsplash.com/photo-1525921429571-473b94195b9d?q=80&w=600&auto=format&fit=crop",
            btnText: "تواصل معنا 📞",
            hasFrame: true,
            mode: "image_and_text",
            textPosition: "below",
            frameStyle: "default"
          });
        } catch (e) {}
      }
    }

    // Load Left Ad Config
    const savedLeftAd = localStorage.getItem("custom_news_ad_left_v2");
    if (savedLeftAd) {
      try {
        const parsed = JSON.parse(savedLeftAd);
        setLeftAdConfig({
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
        });
      } catch (e) {}
    } else {
      // Legacy fallback
      const savedAd = localStorage.getItem("custom_news_ad_v1");
      if (savedAd) {
        try {
          const parsed = JSON.parse(savedAd);
          setLeftAdConfig({
            visible: parsed.visible !== false,
            title: "مساحة إعلانية",
            description: parsed.description || "سجل الآن لضمان مقعدك الدراسي في التخصصات الأكثر طلباً بسوق العمل والحصول على المزايا الخاصة.",
            linkUrl: parsed.linkUrl || "/registration-guide",
            imageUrl: parsed.imageUrl || "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800&auto=format&fit=crop",
            btnText: "الموقع الرسمي 🔗",
            hasFrame: true,
            mode: "image_and_text",
            textPosition: "below",
            frameStyle: "default"
          });
        } catch (e) {}
      }
    }

    // Header Right
    setHeaderRightType(localStorage.getItem("news_header_right_type_v1") || "none");
    setHeaderRightText(localStorage.getItem("news_header_right_text_v1") || "");
    setHeaderRightImage(localStorage.getItem("news_header_right_image_v1") || "");
    setHeaderRightHasFrame(localStorage.getItem("news_header_right_has_frame_v1") !== "false");
    setHeaderRightTextPosition(localStorage.getItem("news_header_right_text_position_v1") || "below");
    setHeaderRightFrameStyle(localStorage.getItem("news_header_right_frame_style_v1") || "default");

    // Header Left
    setHeaderLeftType(localStorage.getItem("news_header_left_type_v1") || "none");
    setHeaderLeftText(localStorage.getItem("news_header_left_text_v1") || "");
    setHeaderLeftImage(localStorage.getItem("news_header_left_image_v1") || "");
    setHeaderLeftHasFrame(localStorage.getItem("news_header_left_has_frame_v1") !== "false");
    setHeaderLeftTextPosition(localStorage.getItem("news_header_left_text_position_v1") || "below");
    setHeaderLeftFrameStyle(localStorage.getItem("news_header_left_frame_style_v1") || "default");

    // Ticker Type & Content
    setTickerType(localStorage.getItem("news_ticker_type_v1") || "auto");
    setTickerCustomText(localStorage.getItem("news_ticker_custom_text_v1") || "تنبيه هام: فتح باب سحب ملفات التقديم والقبول المبدئي لجميع الشعب والقبول لدفعة ٢٠٢٦ • استخرج استمارتك الإلكترونية الآن برقم الهاتف بسهولة •");

    // Custom Box (replaces Newsletter)
    setCustomBoxVisible(localStorage.getItem("news_custom_box_visible_v1") !== "false");
    setCustomBoxEmoji(localStorage.getItem("news_custom_box_emoji_v1") || "📢");
    setCustomBoxTitle(localStorage.getItem("news_custom_box_title_v1") || "تنويه هام للطلاب");
    setCustomBoxText(localStorage.getItem("news_custom_box_text_v1") || "يمكنك كتابة أي إشعار أو تنويه أو إعلان هنا وتعديله فورياً من لوحة المطور لتنظيم حركة التواصل مع الطلاب.");
    setCustomBoxBtnText(localStorage.getItem("news_custom_box_btn_text_v1") || "دليل التقديم والمستندات 📄");
    setCustomBoxBtnUrl(localStorage.getItem("news_custom_box_btn_url_v1") || "/registration-guide");

    // Load custom page title & subtitle
    const savedTitle = localStorage.getItem("news_page_title_v1");
    if (savedTitle) {
      setPageTitle(savedTitle);
    } else {
      setPageTitle("📰 المركز الإعلامي والأخبار الحصرية");
    }

    const savedSubtitle = localStorage.getItem("news_page_subtitle_v1");
    if (savedSubtitle) {
      setPageSubtitle(savedSubtitle);
    } else {
      setPageSubtitle("تابع آخر أخبار التنسيق والقبول بالمعاهد الفنية المعتمدة، فعاليات التخرج، والندوات الإرشادية والتوعوية لضمان اختيار مستقبلك الأكاديمي الأنسب.");
    }
  };

  useEffect(() => {
    loadData();

    if ("Notification" in window) {
      setNotifPermission(Notification.permission);
    }

    const handleNewsUpdate = () => {
      loadData();
    };

    window.addEventListener("news_posts_updated", handleNewsUpdate);
    window.addEventListener("news_ad_updated", handleNewsUpdate);
    window.addEventListener("news_page_meta_updated", handleNewsUpdate);

    return () => {
      window.removeEventListener("news_posts_updated", handleNewsUpdate);
      window.removeEventListener("news_ad_updated", handleNewsUpdate);
      window.removeEventListener("news_page_meta_updated", handleNewsUpdate);
    };
  }, []);

  const requestNotifPermission = async () => {
    if (!("Notification" in window)) {
      toast.error("⚠️ عذراً، متصفحك لا يدعم إشعارات المتصفح.");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotifPermission(permission);
      if (permission === "granted") {
        toast.success("🔔 تم تفعيل إشعارات المتصفح الفورية بنجاح!");
        new Notification("بوابة الأخبار الرسمية 🔔", {
          body: "شكراً لتفعيل الإشعارات! ستصلك تنبيهات فورية عند ظهور أخبار أو قرارات جديدة.",
          icon: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=80&auto=format&fit=crop"
        });
      } else if (permission === "denied") {
        toast.error("❌ لقد قمت برفض تفعيل الإشعارات. يرجى تفعيلها يدوياً من إعدادات المتصفح لضمان وصول التحديثات.");
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    }
  };

  const testNotification = () => {
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification("بوابة الأخبار الرسمية 🔔", {
          body: "هذا إشعار تجريبي ناجح من نظام الإشعارات الفورية للأكاديميات الفنية!",
          icon: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=80&auto=format&fit=crop"
        });
        toast.success("📣 تم إرسال إشعار تجريبي بنجاح!");
      } catch (err) {
        toast.error("⚠️ فشل إرسال الإشعار. تحقق من صلاحيات المتصفح.");
      }
    } else {
      toast.error("⚠️ يرجى تفعيل صلاحية الإشعارات أولاً.");
    }
  };

  // Filter posts
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "الكل" || post.category.includes(activeCategory.replace("الكل", ""));
    return matchesSearch && matchesCategory;
  });

  // Featured stories for the main "Youm7-style" top carousel (first 4 posts)
  const featuredPosts = posts.slice(0, 4);

  const categories = [
    { name: "الكل", icon: "✨" },
    { name: "إعلانات رسمية 📣", icon: "📣" },
    { name: "توجيه مهني 🧭", icon: "🧭" },
    { name: "أخبار المعاهد 🏛️", icon: "🏛️" },
    { name: "أخبار الفعاليات والطلاب 🎓", icon: "🎓" }
  ];

  const handleShare = (post: NewsPost, platform: "whatsapp" | "telegram") => {
    const text = `اقرأ هذا الخبر الهام على بوابة التوجيه الأكاديمي المعتمدة:\n\n*${post.title}*\n${post.desc}\n\nتابع القراءة وتفاصيل التقديم عبر هذا الرابط الإلكتروني:`;
    const url = window.location.href;
    const encodedText = encodeURIComponent(text + "\n" + url);
    
    if (platform === "whatsapp") {
      window.open(`https://api.whatsapp.com/send?text=${encodedText}`, "_blank");
    } else if (platform === "telegram") {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post.title)}`, "_blank");
    }
  };

  const renderCustomHeaderBlock = (
    type: string, 
    text: string, 
    img: string, 
    hasFrame: boolean, 
    textPosition: string, 
    frameStyle: string
  ) => {
    if (type === "none" || !type) return null;

    const frameClasses = getFrameClass(frameStyle, hasFrame);

    const imageNode = (type === "image" || type === "both") && img ? (
      <img 
        src={img} 
        alt="إعلان مخصص" 
        className="w-full h-full object-cover rounded-xl border border-white/10" 
        referrerPolicy="no-referrer"
      />
    ) : null;

    const textNode = (type === "text" || type === "both") && text ? (
      <p className="text-[11px] font-bold leading-relaxed text-white drop-shadow-xs">
        {text}
      </p>
    ) : null;

    let contentNode;
    if (type === "both" && imageNode && textNode) {
      if (textPosition === "above") {
        contentNode = (
          <div className="flex flex-col gap-2 text-right">
            {textNode}
            <div className="w-full aspect-[16/10] md:aspect-[4/3] rounded-xl overflow-hidden">{imageNode}</div>
          </div>
        );
      } else if (textPosition === "right") {
        contentNode = (
          <div className="flex flex-row items-center gap-2 text-right">
            <div className="flex-1">{textNode}</div>
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 shrink-0 rounded-xl overflow-hidden">{imageNode}</div>
          </div>
        );
      } else if (textPosition === "left") {
        contentNode = (
          <div className="flex flex-row-reverse items-center gap-2 text-right">
            <div className="flex-1">{textNode}</div>
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 shrink-0 rounded-xl overflow-hidden">{imageNode}</div>
          </div>
        );
      } else { // default below
        contentNode = (
          <div className="flex flex-col gap-2 text-right">
            <div className="w-full aspect-[16/10] md:aspect-[4/3] rounded-xl overflow-hidden">{imageNode}</div>
            {textNode}
          </div>
        );
      }
    } else {
      contentNode = (
        <div className="space-y-2 w-full">
          {imageNode && <div className="w-full aspect-[16/10] md:aspect-[4/3] rounded-xl overflow-hidden">{imageNode}</div>}
          {textNode}
        </div>
      );
    }

    return (
      <div className={`${frameClasses} max-w-xs mx-auto overflow-hidden h-auto`}>
        {contentNode}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa]" dir="rtl">
      
      {/* 1. SEPARATE HEADER SECTION: Dark Golden Background with White Title & Dark Navy Subtitle */}
      <header className="bg-gradient-to-r from-[#7c5b1d] via-[#a38038] to-[#6b4e15] border-b border-amber-600 py-10 px-4 sm:px-6 shadow-md text-center">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Right custom block on desktop */}
          <div className="md:col-span-3 text-right hidden md:block">
            {renderCustomHeaderBlock(
              headerRightType, 
              headerRightText, 
              headerRightImage, 
              headerRightHasFrame, 
              headerRightTextPosition, 
              headerRightFrameStyle
            )}
          </div>

          {/* Center title (6 cols) */}
          <div className="md:col-span-6 space-y-3.5 text-center">
            <span className="inline-block bg-[#0A2463] text-white text-[10px] font-black tracking-widest px-4 py-1.5 rounded-full uppercase shadow-xs">
              بوابة المعاهد والأكاديميات الخاصة 📰
            </span>
            <div className="flex flex-col items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white drop-shadow-md tracking-tight leading-none animate-fade-in">
                {pageTitle}
              </h1>
              <SpeechButton 
                textToSpeak={`${pageTitle}. ${pageSubtitle}`}
                className="bg-white/10 text-amber-300 border-white/20 hover:bg-amber-500 hover:text-white"
              />
            </div>
            {/* Subtitle is Dark Navy/Blue, high-contrast, premium styling as explicitly requested */}
            <div className="bg-white/95 backdrop-blur-sm p-4 rounded-2xl border border-white/40 max-w-xl mx-auto shadow-sm">
              <p className="text-xs sm:text-sm text-[#0a2463] font-black leading-relaxed">
                {pageSubtitle}
              </p>
            </div>
          </div>

          {/* Left custom block on desktop */}
          <div className="md:col-span-3 text-left hidden md:block">
            {renderCustomHeaderBlock(
              headerLeftType, 
              headerLeftText, 
              headerLeftImage, 
              headerLeftHasFrame, 
              headerLeftTextPosition, 
              headerLeftFrameStyle
            )}
          </div>

          {/* Mobile visible fallback blocks if customized */}
          {(headerRightType !== "none" || headerLeftType !== "none") && (
            <div className="md:hidden col-span-1 grid grid-cols-2 gap-2 mt-2">
              {headerRightType !== "none" && (
                <div className="p-2 bg-white/10 rounded-xl text-white text-right text-[10px] font-bold">
                  {renderCustomHeaderBlock(
                    headerRightType, 
                    headerRightText, 
                    headerRightImage, 
                    headerRightHasFrame, 
                    headerRightTextPosition, 
                    headerRightFrameStyle
                  )}
                </div>
              )}
              {headerLeftType !== "none" && (
                <div className="p-2 bg-white/10 rounded-xl text-white text-left text-[10px] font-bold">
                  {renderCustomHeaderBlock(
                    headerLeftType, 
                    headerLeftText, 
                    headerLeftImage, 
                    headerLeftHasFrame, 
                    headerLeftTextPosition, 
                    headerLeftFrameStyle
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </header>

      {/* 2. BREAKING NEWS TICKER BAR (شريط الأخبار العاجلة) */}
      <div className="bg-[#dc2626] text-white py-2.5 px-4 overflow-hidden shadow-xs border-b border-red-700 flex items-center gap-3">
        <span className="bg-white text-red-600 font-black text-xs px-3 py-1 rounded-md shrink-0 uppercase animate-pulse flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-600"></span>
          عاجل
        </span>
        <div className="relative flex-1 min-w-0 overflow-hidden h-5">
          {tickerType === "custom" ? (
            <div className="absolute flex gap-10 whitespace-nowrap animate-marquee font-bold text-xs text-white/95 leading-normal">
              <span>⚡ {tickerCustomText}</span>
            </div>
          ) : (
            <div className="absolute flex gap-10 whitespace-nowrap animate-marquee font-bold text-xs text-white/95 leading-normal">
              {posts.map((post, index) => (
                <span key={post.id} className="hover:underline cursor-pointer flex items-center gap-1.5" onClick={() => setSelectedPost(post)}>
                  <span>⚡ {post.title}</span>
                  <span className="text-yellow-300 font-black">|</span>
                </span>
              ))}
            </div>
          )}
        </div>
        <span className="text-[10px] text-white/70 font-mono shrink-0 hidden sm:inline">تحديث ٢٠٢٦ ⏱️</span>
      </div>

      {/* MAIN CONTAINER WITH FLANKING AD MARGINS (النمط الإعلاني الحقيقي لليوم السابع) */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          
          {/* A. RIGHT VERTICAL AD MARGIN (Visible on all screens, sticky on desktop - 2 cols) */}
          <aside className="xl:col-span-2 space-y-4 xl:sticky xl:top-6 w-full">
            <RenderAd ad={rightAdConfig} />
            
            <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-3.5 text-center space-y-2">
              <span className="text-xl">🏆</span>
              <h5 className="text-[11px] font-black text-amber-900">سجل استمارتك اليوم</h5>
              <p className="text-[9.5px] font-bold text-slate-600">احصل على فرصة الالتحاق المباشر بأفضل برامج التعليم الفني.</p>
            </div>
          </aside>

          {/* B. CENTER MAIN FEED AREA (8 cols on xl, full width otherwise) */}
          <main className="xl:col-span-8 space-y-8">

            {/* 🔔 BROWSER PUSH NOTIFICATIONS SYSTEM CARD */}
            <div className="bg-gradient-to-r from-[#0A2463] to-[#0d2a75] rounded-3xl p-5 border border-[#0A2463]/25 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -translate-x-4 -translate-y-4"></div>
              <div className="flex items-center gap-4 relative z-10 text-right">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
                  <span className="text-2xl animate-bounce">🔔</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs sm:text-sm font-black text-amber-400">نظام إشعارات المتصفح الفورية للأخبار ⏱️</h3>
                  <p className="text-[10px] sm:text-[11px] font-bold text-slate-200">
                    فعّل الإشعارات لتصلك تنبيهات حية فورية على جهازك بمجرد صدور أي قرارات رسمية أو أخبار عاجلة جديدة.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 relative z-10 w-full md:w-auto justify-end">
                {notifPermission === "granted" ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10.5px] font-black">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                      الإشعارات مفعلة 🟢
                    </span>
                    <button
                      onClick={testNotification}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-black transition active:scale-95 cursor-pointer border border-white/10"
                    >
                      تجربة إشعار تجريبي 📣
                    </button>
                  </div>
                ) : notifPermission === "denied" ? (
                  <span className="text-red-300 text-[10px] font-bold bg-red-950/40 border border-red-900/30 px-3 py-1.5 rounded-xl">
                    ⚠️ الإشعارات محظورة بالمتصفح. يرجى تفعيلها من إعدادات المتصفح.
                  </span>
                ) : (
                  <button
                    onClick={requestNotifPermission}
                    className="px-4 py-2 bg-[#FF7F50] hover:bg-[#FF7F50]/90 active:scale-95 text-white font-black text-[11px] rounded-xl transition shadow-md cursor-pointer animate-pulse"
                  >
                    تفعيل الإشعارات الآن 🔔
                  </button>
                )}
              </div>
            </div>
            
            {/* 1. THE YOUM7 SLIDER (كارت السلايدر الرئيسي بالأرقام - زى اليوم السابع تماماً) */}
            {featuredPosts.length > 0 && (
              <section className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-12">
                  
                  {/* Slide Image with Gradient Overlay & Metadata (7 cols) */}
                  <div className="md:col-span-8 relative h-64 sm:h-80 md:h-[380px] bg-slate-900 overflow-hidden group">
                    {featuredPosts[activeSlideIdx].imageUrl ? (
                      <LazyLoadImage 
                        src={featuredPosts[activeSlideIdx].imageUrl} 
                        alt={featuredPosts[activeSlideIdx].title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                        referrerPolicy="no-referrer"
                        effect="opacity"
                        wrapperClassName="w-full h-full block"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-indigo-900 text-indigo-200">
                        <GraduationCap className="w-16 h-16" />
                      </div>
                    )}
                    
                    {/* Bottom-to-Top Dark Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>

                    {/* Badge Overlay */}
                    <span className="absolute top-4 right-4 bg-[#dc2626] text-white text-[10.5px] font-black px-3 py-1 rounded-lg shadow-md animate-bounce">
                      {featuredPosts[activeSlideIdx].category}
                    </span>

                    {/* Slide content overlay */}
                    <div className="absolute bottom-0 right-0 left-0 p-6 space-y-2 text-right">
                      <div className="flex items-center gap-3 text-[10.5px] text-yellow-400 font-extrabold">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(featuredPosts[activeSlideIdx].createdAt).toLocaleDateString("ar-EG")}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-200">
                          <Clock className="w-3.5 h-3.5" />
                          {featuredPosts[activeSlideIdx].readTime}
                        </span>
                      </div>
                      <h2 
                        className="text-lg sm:text-xl md:text-2xl font-black text-white leading-tight hover:text-yellow-400 cursor-pointer drop-shadow-md"
                        onClick={() => setSelectedPost(featuredPosts[activeSlideIdx])}
                      >
                        {featuredPosts[activeSlideIdx].title}
                      </h2>
                      <p className="text-xs text-slate-300 font-bold leading-relaxed line-clamp-2">
                        {featuredPosts[activeSlideIdx].desc}
                      </p>
                    </div>
                  </div>

                  {/* Numbered Index Navigation Sidebar (4 cols) - Matches Youm7 layout completely! */}
                  <div className="md:col-span-4 bg-slate-50 border-r border-slate-100 flex flex-col justify-between">
                    <div className="p-4 border-b border-slate-100 bg-slate-100/50">
                      <h3 className="text-xs font-black text-[#0A2463] flex items-center gap-1.5 justify-start">
                        <TrendingUp className="w-4 h-4 text-[#FF7F50]" />
                        <span>الأخبار الأكثر قراءة الآن 📈</span>
                      </h3>
                    </div>

                    <div className="divide-y divide-slate-100 max-h-[300px] md:max-h-none overflow-y-auto">
                      {featuredPosts.map((post, idx) => (
                        <button
                          key={post.id}
                          onClick={() => setActiveSlideIdx(idx)}
                          className={`w-full p-3.5 text-right flex gap-3 items-start transition-all duration-300 ${
                            activeSlideIdx === idx 
                              ? "bg-amber-500/10 border-r-4 border-amber-600" 
                              : "hover:bg-slate-100/80"
                          }`}
                        >
                          <span className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-mono font-black ${
                            activeSlideIdx === idx 
                              ? "bg-[#dc2626] text-white" 
                              : "bg-slate-200 text-slate-750"
                          }`}>
                            {idx + 1}
                          </span>
                          <span className="text-[11.5px] font-black text-slate-800 leading-snug line-clamp-2">
                            {post.title}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="p-3 bg-slate-100/80 border-t border-slate-150 text-center">
                      <button
                        onClick={() => setSelectedPost(featuredPosts[activeSlideIdx])}
                        className="text-[10.5px] font-black text-indigo-650 hover:text-[#0A2463] inline-flex items-center gap-1 transition"
                      >
                        قراءة القصة الكاملة للخبر الفائز 🔗
                      </button>
                    </div>
                  </div>

                </div>
              </section>
            )}

            {/* 2. CATEGORY SELECTORS & SEARCH */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="ابحث في أرشيف الأخبار والقرارات الرسمية بالكلمة..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 rounded-2xl pr-11 pl-4 py-3 text-xs sm:text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 text-right"
                  />
                  <Search className="absolute right-4 top-3.5 w-5 h-5 text-slate-400" />
                </div>

                <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl self-start shrink-0">
                  <Sliders className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-[10px] font-black text-slate-600">تصفية سريعة</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-50">
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setActiveCategory(cat.name)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all duration-300 flex items-center gap-1.5 cursor-pointer border ${
                      activeCategory === cat.name
                        ? "bg-[#0A2463] text-white border-transparent shadow-xs scale-102"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. MAIN NEWSPAPER FEED LISTING */}
            {filteredPosts.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center text-slate-500 border border-slate-200">
                <span className="text-5xl block mb-2">🔍</span>
                <p className="text-sm font-black text-slate-800">لا يوجد أخبار أو تقارير صحفية تطابق المعايير المحددة.</p>
                <p className="text-xs text-slate-400 mt-1">تأكد من عدم وجود أخطاء إملائية أو اختر تصنيفاً آخر.</p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Section title */}
                <div className="border-b-4 border-[#dc2626] pb-1 flex justify-between items-center">
                  <h3 className="bg-[#dc2626] text-white font-black text-xs px-4 py-1.5 rounded-t-xl flex items-center gap-1.5">
                    <span>📰 أحدث العناوين والتغطيات الإخبارية</span>
                  </h3>
                  <span className="text-[11px] font-mono font-black text-slate-400">العدد المتاح: {filteredPosts.length} خبر</span>
                </div>

                {/* News Cards list */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredPosts.map((post) => (
                    <article 
                      key={post.id}
                      className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between element-reveal"
                    >
                      <div>
                        {/* Image Frame with category tag */}
                        <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                          {post.imageUrl ? (
                            <LazyLoadImage 
                              src={post.imageUrl} 
                              alt={post.title} 
                              className="w-full h-full object-cover transition-transform duration-500 hover:scale-103"
                              referrerPolicy="no-referrer"
                              effect="opacity"
                              wrapperClassName="w-full h-full block"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 text-amber-600">
                              <GraduationCap className="w-14 h-14" />
                            </div>
                          )}
                          <span className="absolute top-3 right-3 bg-[#0a2463] text-white text-[9.5px] font-black px-2.5 py-1 rounded-md shadow-xs">
                            {post.category}
                          </span>
                        </div>

                        {/* Metadata */}
                        <div className="p-5 pb-1.5 flex items-center gap-4 text-[10px] text-slate-400 font-extrabold">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-amber-600" />
                            {new Date(post.createdAt).toLocaleDateString("ar-EG")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-indigo-500" />
                            {post.readTime}
                          </span>
                        </div>

                        {/* Headline & Abstract */}
                        <div className="px-5 space-y-2">
                          <h4 
                            className="text-xs sm:text-sm font-black text-slate-900 leading-snug line-clamp-2 hover:text-[#dc2626] cursor-pointer"
                            onClick={() => setSelectedPost(post)}
                          >
                            {post.title}
                          </h4>
                          <p className="text-[11.5px] text-slate-550 font-bold leading-relaxed line-clamp-3">
                            {post.desc}
                          </p>
                        </div>
                      </div>

                      {/* Read More button & Sharing tools */}
                      <div className="p-5 pt-3.5 mt-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <button
                          onClick={() => setSelectedPost(post)}
                          className="text-xs font-black text-[#dc2626] hover:text-[#0a2463] flex items-center gap-1 cursor-pointer transition-all"
                        >
                          <span>قراءة التقرير بالكامل</span>
                          <ChevronLeft className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleShare(post, "whatsapp")}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg cursor-pointer transition-all border border-emerald-150 text-[10px] font-black"
                            title="مشاركة على واتساب"
                          >
                            واتساب 💬
                          </button>
                          <button
                            onClick={() => handleShare(post, "telegram")}
                            className="p-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg cursor-pointer transition-all border border-sky-150 text-[10px] font-black"
                            title="مشاركة على تيليجرام"
                          >
                            تيليجرام ✈️
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

              </div>
            )}
          </main>

          {/* C. LEFT VERTICAL AD MARGIN & WIDGETS (Visible on all screens, sticky on desktop - 2 cols) */}
          <aside className="xl:col-span-2 space-y-4 xl:sticky xl:top-6 w-full">
            
            <RenderAd ad={leftAdConfig} />

            {/* Custom customizable block (Replaces Newsletter) */}
            {customBoxVisible && (
              <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-3 shadow-xs text-right">
                <span className="text-xl">{customBoxEmoji}</span>
                <h5 className="text-[11px] font-black text-[#0A2463]">{customBoxTitle}</h5>
                <p className="text-[10px] text-slate-600 leading-relaxed font-bold whitespace-pre-line">{customBoxText}</p>
                {customBoxBtnText && (
                  <a 
                    href={customBoxBtnUrl}
                    className="block w-full py-2 bg-[#dc2626] hover:bg-red-700 text-white font-black text-center text-[10px] rounded-lg transition"
                  >
                    {customBoxBtnText}
                  </a>
                )}
              </div>
            )}

          </aside>

        </div>
      </div>

      {/* FULL POST DETAIL MODAL (بوابة قراءة تفاصيل الخبر - زى اليوم السابع بالظبط) */}
      {selectedPost && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up text-right">
            
            {/* Modal Hero Image */}
            <div className="relative h-64 sm:h-72 w-full bg-slate-100 shrink-0">
              {selectedPost.imageUrl ? (
                <LazyLoadImage 
                  src={selectedPost.imageUrl} 
                  alt={selectedPost.title} 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                  effect="opacity"
                  wrapperClassName="w-full h-full block"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-400">
                  <GraduationCap className="w-16 h-16" />
                </div>
              )}
              
              {/* Close Button */}
              <button
                onClick={() => setSelectedPost(null)}
                className="absolute top-4 left-4 bg-slate-950/60 hover:bg-slate-950/85 text-white p-2 rounded-full cursor-pointer transition-all border border-white/20"
              >
                <X className="w-5 h-5" />
              </button>

              <span className="absolute bottom-4 right-4 bg-[#dc2626] text-white text-xs font-black px-3 py-1 rounded-lg shadow-sm">
                {selectedPost.category}
              </span>
            </div>

            {/* Modal Body Scroll */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="flex items-center gap-4 text-xs text-slate-400 font-extrabold border-b border-slate-100 pb-3">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  {new Date(selectedPost.createdAt).toLocaleDateString("ar-EG")}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  {selectedPost.readTime}
                </span>
                <span className="flex items-center gap-1 text-slate-500">
                  <User className="w-4 h-4 text-[#0a2463]" />
                  محرر بوابة التوجيه
                </span>
              </div>

              <h2 className="text-base sm:text-lg md:text-xl font-black text-slate-900 leading-snug">
                {selectedPost.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-750 leading-relaxed font-bold font-sans whitespace-pre-wrap">
                {selectedPost.content}
              </p>
            </div>

            {/* Modal Footer shares */}
            <div className="p-4 bg-slate-50 border-t border-slate-150 flex flex-wrap gap-3 items-center justify-between shrink-0">
              <span className="text-[11px] font-black text-slate-500 flex items-center gap-1.5">
                <Megaphone className="w-4 h-4 text-[#dc2626]" />
                مشاركة الخبر لمساعدة زملائك:
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleShare(selectedPost, "whatsapp")}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl cursor-pointer transition"
                >
                  واتساب 💬
                </button>
                <button
                  onClick={() => handleShare(selectedPost, "telegram")}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-black rounded-xl cursor-pointer transition"
                >
                  تيليجرام ✈️
                </button>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-black rounded-xl cursor-pointer transition"
                >
                  إغلاق نافذة الخبر
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
