import React, { useState, useEffect } from "react";
import { Star, MessageSquare, Quote, CheckCircle2, Award, Calendar, ChevronLeft } from "lucide-react";

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

export function StudentReviews() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewsList, setReviewsList] = useState<Review[]>([]);

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
    },
    {
      id: 3,
      studentName: "أحمد كمال أبو العزم",
      department: "قسم المساحة والخرائط",
      governorate: "الجيزة",
      rating: 5,
      text: "سجلت في قسم المساحة لأن وظيفته مضمونة ومطلوب في كبرى شركات الإنشاءات والمقاولات. بندرس على أحدث الأجهزة المساحية والرفع الميداني الفعلي. بجد الأكاديمية التزام تام بالصداقة والنزاهة وبدون أي وعود كاذبة.",
      avatarColor: "bg-emerald-600 text-white",
      initials: "أ ك",
      date: "٢٠٢٦/٠٤/٢٨",
      verified: true
    },
    {
      id: 4,
      studentName: "روان محمود القاضي",
      department: "قسم مساعد خدمات صحية (تحاليل طبية)",
      governorate: "الشرقية",
      rating: 5,
      text: "ممتنة جداً لمستشار القبول والتوجيه الذي ساعدني على اجتياز اختبار تحديد التخصص واختيار القسم الذي يوافق مهاراتي. البوابة ساعدتني في تثبيت خصم بقيمة 3000 جنيه من أول يوم حجز.",
      avatarColor: "bg-amber-600 text-white",
      initials: "ر م",
      date: "٢٠٢٦/٠٥/٢٠",
      verified: true
    },
    {
      id: 5,
      studentName: "سيف النصر عادل",
      department: "قسم البترول",
      governorate: "القاهرة",
      rating: 5,
      text: "كنت خايف من موضوع التجنيد لكن الإدارة ساعدتني وقدمت أوراقي والتأجيل تم بسلاسة وبشكل رسمي معتمد طوال دراستي بالأكاديمية. أنصح كل الطلاب بالاستفادة من فرص التقديم والخصومات الحالية للتسجيل المبكر.",
      avatarColor: "bg-orange-600 text-white",
      initials: "س ع",
      date: "٢٠٢٦/٠٦/١٠",
      verified: true
    },
    {
      id: 6,
      studentName: "مريم يسري جاد",
      department: "قسم الضيافة الجوية",
      governorate: "الإسكندرية",
      rating: 5,
      text: "تلقيت تدريباً متميزاً على البروتوكول الدولي والإتيكيت وحل المشكلات من كابتن متخصص في الطيران. المرجع الشامل للبوابة وفر لنا معلومات في منتهى الدقة والشفافية بدون مبالغات.",
      avatarColor: "bg-indigo-600 text-white",
      initials: "م ي",
      date: "٢٠٢٦/٠٥/٠٥",
      verified: true
    }
  ];

  const loadReviews = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("custom_student_reviews");
      if (saved) {
        try {
          setReviewsList(JSON.parse(saved));
        } catch (e) {
          setReviewsList(defaultReviews);
          localStorage.setItem("custom_student_reviews", JSON.stringify(defaultReviews));
        }
      } else {
        setReviewsList(defaultReviews);
        localStorage.setItem("custom_student_reviews", JSON.stringify(defaultReviews));
      }
    }
  };

  useEffect(() => {
    loadReviews();

    const handleUpdate = () => {
      loadReviews();
    };

    window.addEventListener("student_reviews_updated", handleUpdate);
    return () => {
      window.removeEventListener("student_reviews_updated", handleUpdate);
    };
  }, []);

  const handleNext = () => {
    if (reviewsList.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % reviewsList.length);
  };

  const handlePrev = () => {
    if (reviewsList.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + reviewsList.length) % reviewsList.length);
  };

  const handleDotClick = (idx: number) => {
    setCurrentIndex(idx);
  };

  if (reviewsList.length === 0) return null;

  // Prepare a circular subset or just visible items based on screen size (we can show 1 on mobile, 3 on desktop)
  const activeReview = reviewsList[currentIndex < reviewsList.length ? currentIndex : 0];

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6 text-right" id="students-testimonials-section">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
            <Star className="w-5.5 h-5.5 text-amber-500 fill-amber-500" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
              آراء الطلاب وتقييمات خريجي الأكاديميات الاستكشافية ⭐
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              تجارب واقعية ملهمة لطلابنا عبر تخصصات المهن والتعليم الفني المتطور
            </p>
          </div>
        </div>

        {/* Aggregate badge */}
        <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-150 shrink-0">
          <Award className="w-4 h-4 text-emerald-600" />
          <span>التقييم العام: ممتاز ٤.٩/٥ 🏅</span>
        </div>
      </div>

      {/* Slider Viewport Container */}
      <div className="relative min-h-[220px] bg-slate-50/50 border border-slate-150 p-6 rounded-2xl flex flex-col justify-between hover:shadow-xs transition duration-200 overflow-hidden">
        
        {/* Decorative Quote mark */}
        <div className="absolute top-4 left-4 text-slate-200 pointer-events-none opacity-40">
          <Quote className="w-12 h-12 transform rotate-180" />
        </div>

        {/* Slider Card */}
        <div className="space-y-4 animate-fade-in z-10" key={activeReview.id}>
          {/* Rate Stars */}
          <div className="flex text-amber-450 gap-0.5 justify-start">
            {[...Array(activeReview.rating)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
          </div>

          {/* Testimonial Quote */}
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
            "{activeReview.text}"
          </p>

          {/* Student details */}
          <div className="flex items-center gap-3 border-t border-slate-200/50 pt-3 mt-4">
            <div className={`w-10 h-10 rounded-full ${activeReview.avatarColor} font-black text-xs flex items-center justify-center shrink-0 shadow-xs`}>
              {activeReview.initials}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-slate-900">{activeReview.studentName}</span>
                <CheckCircle2 className="w-4 h-4 text-blue-500" title="طالب موثق وحقيقي" />
              </div>
              <div className="text-[10px] sm:text-xs text-slate-500 font-bold space-x-1.5 space-x-reverse flex items-center flex-wrap">
                <span className="text-indigo-650">{activeReview.department}</span>
                <span>•</span>
                <span>محافظة {activeReview.governorate}</span>
              </div>
              <p className="text-[9px] text-slate-405 font-mono">تاريخ التقديم: {activeReview.date}</p>
            </div>
          </div>
        </div>

        {/* Navigation Buttons Layer */}
        <div className="absolute bottom-5 left-5 flex items-center gap-2 z-20">
          <button 
            onClick={handlePrev}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center shadow-xs hover:border-slate-350 active:scale-95 transition cursor-pointer"
            aria-label="التقييم السابق"
          >
            <ChevronLeft className="w-4 h-4 transform rotate-180" />
          </button>
          
          <button 
            onClick={handleNext}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center shadow-xs hover:border-slate-350 active:scale-95 transition cursor-pointer"
            aria-label="التقييم التالي"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center items-center gap-1.5 pt-1">
        {reviewsList.map((_, idx) => (
          <button
            key={idx}
            className={`h-2 rounded-full transition-all cursor-pointer ${currentIndex === idx ? 'w-6 bg-amber-500' : 'w-2 bg-slate-200 hover:bg-slate-300'}`}
            onClick={() => handleDotClick(idx)}
            aria-label={`تخطي للتقييم رقم ${idx + 1}`}
          />
        ))}
      </div>

    </div>
  );
}
