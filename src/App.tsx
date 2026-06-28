import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ScrollToTop from "./components/ScrollToTop";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import NewsPage from "./pages/NewsPage";
import About from "./pages/About";
import Admin from "./pages/Admin";
import DepartmentsPage from "./pages/DepartmentsPage";
import TrendingPage from "./pages/TrendingPage";
import GuidancePage from "./pages/GuidancePage";
import AccreditationPage from "./pages/AccreditationPage";
import DiscountsPage from "./pages/DiscountsPage";
import ComplaintsPage from "./pages/ComplaintsPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ThankYou from "./pages/ThankYou";
import FormExtraction from "./pages/FormExtraction";
import RegistrationGuide from "./pages/RegistrationGuide";
import Footer from "./components/Footer";
import { AIAcademicAdvisorWidget } from "./components/InteractiveMarketingSuite";
import { RealtimeNotificationToast } from "./components/RealtimeNotificationToast";
import ProgressBar from "./components/ProgressBar";

function AppContent() {
  const location = useLocation();
  const showFooter = location.pathname !== "/admin";
  const showChatbot = location.pathname !== "/news";

React.useEffect(() => {
    const titlesMap: Record<string, string> = {
      "/": "البوابة الإلكترونية الموحدة | حجز التخصصات والدبلومات المهنية",
      "/news": "أحدث الأخبار والتنبيهات العامة | البوابة الموحدة",
      "/registration-guide": "دليل الخطوات الرسمية للتسجيل الإلكتروني",
      "/departments": "تصفح الأقسام والتخصصات المهنية والفنية المتاحة",
      "/trending": "الأقسام الأكثر طلباً والمهارات المتوقعة في سوق العمل",
      "/guidance": "اكتشف مجال شغفك | اختبار تحديد الميول المهنية",
      "/accreditation": "الشهادات المهنية وإجراءات التوثيق والتسجيل المعتادة",
      "/discounts": "المنح الجزئية وخصومات التسجيل المبكر المتاحة حالياً",
      "/complaints": "بوابة الاستفسارات والدعم المباشر للمسجلين",
      "/about": "حول البوابة الموحدة للتسجيل والدعم الأكاديمي",
      "/privacy": "سياسة الخصوصية وشروط الاستخدام للمنصة",
      "/thank-you": "تم تأكيد طلبك بنجاح | يرجى الاحتفاظ برمز الحجز المركزي",
      "/form-extraction": "استخراج وطباعة استمارة الحجز الإلكتروني الموحدة",
      "/admin": "لوحة الإدارة والمطور"
    };

    const currentTitle = titlesMap[location.pathname] || "البوابة الموحدة للتسجيل الإلكتروني المهني";
    document.title = currentTitle;
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-cover bg-center bg-fixed bg-no-repeat" style={{ backgroundImage: "url('/bg.jpg')" }}>
      {/* Global Toast Notifications */}
      <Toaster 
        position="top-center" 
        reverseOrder={false} 
        toastOptions={{
          style: {
            fontFamily: "Inter, sans-serif",
            fontSize: "13px",
            fontWeight: "bold",
            borderRadius: "12px",
            direction: "rtl"
          }
        }}
      />
      
      {/* Global Progress Bar */}
      <ProgressBar />
      
      {/* Global sticky navbar at the top */}
      <Navbar />
      
      {/* Router mapping screens */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/registration-guide" element={<RegistrationGuide />} />
          <Route path="/departments" element={<DepartmentsPage />} />
          <Route path="/trending" element={<TrendingPage />} />
          <Route path="/guidance" element={<GuidancePage />} />
          <Route path="/accreditation" element={<AccreditationPage />} />
          <Route path="/discounts" element={<DiscountsPage />} />
          <Route path="/complaints" element={<ComplaintsPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/form-extraction" element={<FormExtraction />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>

      {showFooter && <Footer />}

      {/* Floating Chat bot widget helper */}
      {showChatbot && <AIAcademicAdvisorWidget />}
      
      {/* Real-time live enrollment popups */}
      <RealtimeNotificationToast />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
}
