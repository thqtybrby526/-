import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ScrollToTop from "./components/ScrollToTop";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
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
import Footer from "./components/Footer";

function AppContent() {
  const location = useLocation();
  const showFooter = location.pathname !== "/admin";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
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
      
      {/* Global sticky navbar at the top */}
      <Navbar />
      
      {/* Router mapping screens */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
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
