import React, { useState } from "react";
import { Star, MessageSquare, Quote, CheckCircle2, Award, Calendar } from "lucide-react";

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
  const [filterType, setFilterType] = useState<"all" | "high">("all");

  const reviewsList: Review[] = [
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
      text: "حلم حياتي كان دراسة التمريض والدخول لمجال الرعاية والمساعدة. مستشاري القبول تواصلوا معي هاتفياً ووضحوا كل الأمور وشرحوا الرسوم والخصم الحصري. التدريب العملي في المستشفيات ممتاز وبدأت أستفيد وأتعلم بجدية.",
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
      text: "ممتنة جداً لمستشار القبول والتوجيه الذي ساعدني على اجتياز كويز التوجيه وتقييم مستوى الطالب للوصول للقسم الذي يوافق مهاراتي. البوابة ساعدتني في تثبيت خصم بقيمة 3000 جنيه من أول يوم حجز.",
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
      rating: 4,
      text: "تلقيت تدريباً متميزاً على البروتوكول الدولي والإتيكيت وحل المشكلات من كابتن متخصص في الطيران. المرجع الشامل للبوابة وفر لنا معلومات في منتهى الدقة والشفافية بدون مبالغات.",
      avatarColor: "bg-indigo-600 text-white",
      initials: "م ي",
      date: "٢٠٢٦/٠٥/٠٥",
      verified: true
    }
  ];

  const filteredReviews = filterType === "high" 
    ? reviewsList.filter(r => r.rating === 5) 
    : reviewsList;

  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-250/90 shadow-sm space-y-5" id="students-testimonials-section">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
              آراء الطلاب وتقييمات خريجي الأكاديمية ⭐
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              تجارب واقعية ملهمة لطلابنا عبر تخصصات المهن والتعليم الفني المتطور
            </p>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex bg-slate-100 p-1 rounded-xl self-start sm:self-center border border-slate-200">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1 text-[10px] font-extrabold rounded-lg transition ${filterType === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
          >
            الكل ({reviewsList.length})
          </button>
          <button
            onClick={() => setFilterType("high")}
            className={`px-3 py-1 text-[10px] font-extrabold rounded-lg transition ${filterType === "high" ? "bg-white text-amber-600 shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
          >
            تقييم ممتاز (٥/٥) ★
          </button>
        </div>
      </div>

      {/* Aggregate Score Bar */}
      <div className="bg-slate-50 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 border border-slate-150">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-black text-slate-900 font-mono">4.9</span>
          <div className="space-y-0.5">
            <div className="flex text-amber-500 gap-0.5">
              <Star className="w-4 h-4 fill-amber-500" />
              <Star className="w-4 h-4 fill-amber-500" />
              <Star className="w-4 h-4 fill-amber-500" />
              <Star className="w-4 h-4 fill-amber-500" />
              <Star className="w-4 h-4 fill-amber-500" />
            </div>
            <span className="text-[10px] text-slate-500 block">بناءً على تقييم أكثر من ٢,٥٠٠ طالب وطالبة</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
          <Award className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>التقييم العام المعتمد للأكاديميات: ممتاز 🏅</span>
        </div>
      </div>

      {/* Testimonials Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredReviews.map((review) => (
          <div 
            key={review.id}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-500/40 hover:shadow-md transition duration-300 flex flex-col justify-between space-y-4 relative group"
            id={`student-review-card-${review.id}`}
          >
            {/* Top quote decorative asset */}
            <Quote className="absolute top-4 left-4 w-10 h-10 text-slate-100 transform rotate-180 pointer-events-none group-hover:text-slate-200/60 transition" />

            <div className="space-y-2.5 relative">
              {/* Stars layout */}
              <div className="flex text-amber-450 gap-0.5">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-xs text-slate-700 leading-relaxed font-sans text-right relative">
                "{review.text}"
              </p>
            </div>

            {/* Student Info Footer */}
            <div className="flex items-center gap-3 border-t border-slate-100 pt-3">
              <div className={`w-9 h-9 rounded-full ${review.avatarColor} font-black font-mono text-xs flex items-center justify-center shrink-0`}>
                {review.initials}
              </div>
              <div className="text-right overflow-hidden">
                <div className="flex items-center gap-1">
                  <strong className="text-xs font-extrabold text-slate-900 truncate">
                    {review.studentName}
                  </strong>
                  {review.verified && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" title="هوية طالب متحقق منها ✓" />
                  )}
                </div>
                <div className="text-[10px] text-slate-500 font-medium space-x-1 space-x-reverse flex items-center flex-wrap leading-tight">
                  <span className="text-slate-650 font-bold">{review.department}</span>
                  <span className="text-slate-350">•</span>
                  <span>{review.governorate}</span>
                </div>
                <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                  تاريخ التسجيل: {review.date}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
