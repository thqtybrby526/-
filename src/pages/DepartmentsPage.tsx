import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DepartmentExplorer } from "../components/DepartmentExplorer";
import { ACADEMY_DEPARTMENTS, Department } from "../data";
import { BookOpen, ShieldAlert, CheckCircle } from "lucide-react";

export default function DepartmentsPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "تصفح الأقسام والتخصصات الدراسية المعتمدة | بوابة المعاهد الخاصة";
  }, []);

  const handleSelectDepartmentForBooking = (dept: Department) => {
    navigate(`/discounts?preselected=${dept.id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 md:px-8 font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main core content */}
        <div className="lg:col-span-8 space-y-6">
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs text-right">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#0A2463]/5 text-[#0A2463] flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-950">
                  تصفح الأقسام والتخصصات الدراسية المعتمدة
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  استكشف المستقبل المهني لكل قسم، المهارات المطلوبة، وفرص العمل الحقيقية المتاحة.
                </p>
              </div>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              انقر على أي بطاقة تخصص أدناه لقراءة الشروط والمستندات والتدريبات المخصصة بالتفصيل، ثم يمكنك بدء عملية التقديم الفوري وتثبيت خصومات دفعة العام الجاري بضغطة واحدة.
            </p>
          </div>

          <DepartmentExplorer 
            onSelectDepartment={handleSelectDepartmentForBooking} 
          />
        </div>

        {/* Sidebar panels */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Stats */}
          <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 space-y-4 text-right">
            <h3 className="font-extrabold text-sm text-amber-500 font-sans">إحصائيات الأقسام</h3>
            <div className="space-y-3 font-sans">
              <div className="flex justify-between items-center text-xs text-slate-300">
                <span>إجمالي الأقسام المتوفرة:</span>
                <span className="font-mono text-white font-bold">{ACADEMY_DEPARTMENTS.length} تخصصاً</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-300">
                <span>الاعتماد المهني:</span>
                <span className="text-emerald-400 font-bold">100% موثق ومعتمد</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-300">
                <span>فرص التدريب الميداني:</span>
                <span className="text-blue-400 font-bold">متاحة في كبرى الشركات</span>
              </div>
            </div>
          </div>

          {/* Ethics Policy Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 text-right">
            <h3 className="font-extrabold text-md text-[#0A2463] border-b border-slate-100 pb-3 flex items-center gap-2 justify-start">
              <span>ميثاق الحياد والصدق الأكاديمي</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-semibold">
              المعاهد والأكاديميات مرآة حقيقية لسوق العمل. لا توجد وعود تعيين كاذبة أو مبالغات وهمية:
            </p>
            <ul className="space-y-2.5">
              {[
                "تقييم دقيق للمؤهل المدرسي (عام، أزهري، دبلومات)",
                "مساواة كاملة في الدعم العملي لجميع فئات الطلاب المتقدمين",
                "نشرك الطلاب وأولياء أمورهم في صياغة الأهداف المهنية والواقعية"
              ].map((policy, idx) => (
                <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <CheckCircle className="w-4 h-4 text-emerald-650 shrink-0 mt-0.5" />
                  <span>{policy}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Enlistment Alert */}
          <div className="bg-red-50 rounded-3xl p-6 border border-red-150 space-y-3 text-right">
            <div className="flex items-center gap-2 text-red-800">
              <ShieldAlert className="w-5 h-5 text-red-650 shrink-0" />
              <h4 className="font-extrabold text-sm">توضيح التبعية والتجنيد متاح</h4>
            </div>
            <div className="text-xs text-slate-700 leading-relaxed space-y-2">
              <p>
                • الأكاديميات هنا مهنية تدريبية معتمدة لتأهيل الطلاب لسوق العمل والمشاريع لولاية الخبرة ومستقلة تماما عن التنسيق الحكومي المصري.
              </p>
              <p>
                • يتوفر تأجيل الموقف التجنيدي اختياراً للطلاب الذكور طوال فترة دراستهم بفرض رسوم إدارية مناسبة.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
