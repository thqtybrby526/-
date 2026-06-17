import React, { useState } from "react";
import { ACADEMY_DEPARTMENTS, Department } from "../data";
import * as Icons from "lucide-react";

interface DepartmentExplorerProps {
  onSelectDepartment: (dept: Department) => void;
}

export function DepartmentExplorer({ onSelectDepartment }: DepartmentExplorerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);

  // Group departments logically for high-level filtering
  const getCategory = (id: string) => {
    if (id.includes("health") || id === "dental_dental" || id === "special_education" || id === "clinical_nutrition") return "medical";
    if (id === "programming" || id === "wireless_telecom" || id === "petroleum" || id === "surveying" || id === "construction") return "technical";
    if (id === "aviation" || id === "tourism" || id === "systems_admin") return "hospitality_admin";
    if (id === "digital_marketing" || id === "journalism_media" || id === "fine_arts" || id === "languages") return "comms_creative";
    return "other";
  };

  const getCategoryLabel = (id: string) => {
    const cat = getCategory(id);
    switch (cat) {
      case "medical": return "الخدمات الصحية والتربية ⚕️";
      case "technical": return "تقني وهندسي ⚙️";
      case "hospitality_admin": return "الضيافة والإدارة 🏢";
      case "comms_creative": return "الإعلام واللغات والإبداع 🎨";
      default: return "تخصص معتمد 🎓";
    }
  };

  const getDepartmentBgImage = (id: string) => {
    switch (id) {
      case "petroleum":
        return "https://images.unsplash.com/photo-1518745918487-69ef1530a568?auto=format&fit=crop&w=600&q=80";
      case "surveying":
        return "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80";
      case "construction":
        return "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=600&q=80";
      case "clinical_nutrition":
        return "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=600&q=80";
      case "aviation":
        return "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80";
      case "health_analysis":
        return "https://images.unsplash.com/photo-1579154204601-01588f351167?auto=format&fit=crop&w=600&q=80";
      case "nursing_assistant":
        return "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=600&q=80";
      case "programming":
        return "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80";
      case "systems_admin":
        return "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80";
      case "digital_marketing":
        return "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80";
      case "journalism_media":
        return "https://images.unsplash.com/photo-1495020689067-958852a6565d?auto=format&fit=crop&w=600&q=80";
      case "fine_arts":
        return "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80";
      case "languages":
        return "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80";
      case "special_education":
        return "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80";
      case "tourism":
        return "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80";
      case "wireless_telecom":
        return "https://images.unsplash.com/photo-1551703599-6b3dbb57da45?auto=format&fit=crop&w=600&q=80";
      case "dental_dental":
        return "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=600&q=80";
      default:
        return "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80";
    }
  };

  const filteredDepts = ACADEMY_DEPARTMENTS.filter((dept) => {
    const matchesSearch =
      dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      dept.careers.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));

    const category = getCategory(dept.id);
    const matchesCategory = selectedCategory === "all" || category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getIcon = (name: string) => {
    const IconComponent = (Icons as any)[name];
    return IconComponent ? <IconComponent className="w-6 h-6" /> : <Icons.BookOpen className="w-6 h-6" />;
  };

  return (
    <div className="space-y-6" id="dept-explorer-container">
      {/* Dynamic Filter Panel */}
      <div className="p-5 bg-white rounded-2xl shadow-xs border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between" id="dept-filters">
        <div className="relative w-full md:max-w-md">
          <input
            type="text"
            id="dept-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن تخصص، مهارة، أو فرصة عمل..."
            className="w-full pl-4 pr-11 py-3 bg-slate-55 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition text-right"
            dir="rtl"
          />
          <Icons.Search className="absolute right-3.5 top-3.5 text-slate-400 w-5 h-5 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute left-3 top-3.5 text-slate-400 hover:text-slate-600 transition"
              id="clear-search-btn"
            >
              <Icons.X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Tab filters */}
        <div className="flex flex-wrap gap-1.5 justify-center md:justify-end w-full md:w-auto" id="category-tabs" dir="rtl">
          {[
            { id: "all", label: "الكل" },
            { id: "technical", label: "تقني وهندسي" },
            { id: "medical", label: "الخدمات الصحية والتربية" },
            { id: "hospitality_admin", label: "الضيافة والإدارة" },
            { id: "comms_creative", label: "الإعلام واللغات والإبداع" }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 text-sm rounded-xl font-medium transition cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-brand-navy text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count & Warning Tip */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 text-right px-1" dir="rtl">
        <p className="text-sm text-slate-500 font-medium font-sans">
          تم العثور على <span className="font-bold text-brand-navy">{filteredDepts.length}</span> تخصص دراسي معتمد
        </p>
        <div className="flex items-center gap-1.5 text-xs text-brand-coral bg-brand-coral/5 px-3 py-1.5 rounded-lg border border-brand-coral/10 w-fit">
          <Icons.Info className="w-4 h-4 shrink-0" />
          <span>تنبيه: جميع تخصصاتنا مصممة لتأهيلك العملي لسوق العمل دون وعود تعيين مبالغ فيها.</span>
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="depts-grid" dir="rtl">
        {filteredDepts.length > 0 ? (
          filteredDepts.map((dept) => {
            const isExpanded = selectedDeptId === dept.id;
            return (
              <div
                key={dept.id}
                id={`dept-card-${dept.id}`}
                className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col ${
                  isExpanded
                    ? "border-brand-navy ring-4 ring-brand-navy/5 shadow-md scale-102"
                    : "border-slate-200 hover:border-slate-300 hover:shadow-xs hover:translate-y-[-2px]"
                }`}
              >
                {/* Visual Specialty Background Banner */}
                <div className="h-36 w-full relative overflow-hidden bg-slate-900 shrink-0">
                  <img
                    src={getDepartmentBgImage(dept.id)}
                    alt={dept.name}
                    className="w-full h-full object-cover opacity-75 transition-transform duration-500 hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent"></div>
                  
                  {/* Floating category badge */}
                  <span className="absolute top-3 right-3 bg-brand-navy/90 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg backdrop-blur-xs border border-white/5">
                    {getCategoryLabel(dept.id)}
                  </span>

                  {/* Floating mini status badge */}
                  <span className="absolute top-3 left-3 bg-emerald-600/90 text-white text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-500/10">
                    متاح للحجز ✓
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col relative">
                  {/* Title & Floating Icon Header - overlapping the image bottom line */}
                  <div className="flex items-start justify-between gap-3 mb-4 -mt-10 relative z-10">
                    <div className="flex items-end gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-white text-brand-navy flex items-center justify-center shrink-0 shadow-md border border-slate-100">
                        {getIcon(dept.iconName)}
                      </div>
                      <div className="pb-1 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-xl shadow-xs border border-slate-50">
                        <h3 className="font-extrabold text-sm md:text-[15px] text-slate-900 font-sans tracking-tight">
                          {dept.name}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Core Description - Strictly honest facts */}
                  <p className="text-slate-600 text-sm leading-relaxed mb-4 flex-1">
                    {dept.description}
                  </p>

                  {/* Skills Mini-List */}
                  <div className="mb-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                      <Icons.BookOpen className="w-3.5 h-3.5 text-brand-navy" />
                      المهارات التي ستكتسبها:
                    </h4>
                    <ul className="space-y-1.5">
                      {dept.skills.map((skill, index) => (
                        <li key={index} className="text-xs text-slate-600 flex items-center gap-1.5">
                          <Icons.Check className="w-3.5 h-3.5 text-brand-turquoise shrink-0" />
                          <span>{skill}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Collapsible Career Opportunities & Direct Actions */}
                  {isExpanded && (
                    <div className="mb-4 bg-emerald-50/40 p-4 rounded-xl border border-emerald-100/60 animate-fade-in">
                      <h4 className="text-xs font-bold text-emerald-800 mb-2 flex items-center gap-1.5">
                        <Icons.Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                        فرص ومواقع العمل المتوقعة:
                      </h4>
                      <ul className="space-y-1.5">
                        {dept.careers.map((career, index) => (
                          <li key={index} className="text-xs text-slate-700 flex items-baseline gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5"></span>
                            <span>{career}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Card Actions */}
                  <div className="mt-auto pt-4 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => setSelectedDeptId(isExpanded ? null : dept.id)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        isExpanded
                          ? "bg-slate-100 text-slate-700 border-slate-200"
                          : "bg-white text-brand-navy border-slate-200 hover:bg-slate-50"
                      }`}
                      style={{ minHeight: "44px" }}
                      id={`expand-btn-${dept.id}`}
                    >
                      {isExpanded ? (
                        <>
                          <span>عرض أقل</span>
                          <Icons.ChevronUp className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          <span>فرص العمل والمهارات</span>
                          <Icons.ChevronDown className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => onSelectDepartment(dept)}
                      className="px-4 py-2 bg-brand-navy text-white text-xs font-semibold rounded-xl hover:bg-brand-navy/90 hover:shadow-xs transition cursor-pointer flex items-center justify-center gap-1"
                      style={{ minHeight: "44px" }}
                      title="احجز مقعدك بالقسم الآن للاستفادة من الخصومات"
                      id={`reserve-btn-${dept.id}`}
                    >
                      <span>احجز الآن</span>
                      <Icons.ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 bg-white rounded-2xl border border-slate-200 text-center flex flex-col items-center justify-center p-6 space-y-3" id="no-depts-found">
            <Icons.FolderOpen className="w-12 h-12 text-slate-300" />
            <h3 className="font-bold text-slate-800 text-lg">لم نعثر على نتائج مطابقة</h3>
            <p className="text-slate-500 text-sm max-w-md">
              جرب تغيير الكلمات المفتاحية في شريط البحث أو اختر تصنيفاً آخر لمشاهدة التخصصات المعتمدة.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-brand-navy rounded-xl cursor-pointer"
            >
              إعادة تهيئة التصفية
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
