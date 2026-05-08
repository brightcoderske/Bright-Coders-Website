import React from "react";
import { HelmetProvider } from "react-helmet-async";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Navbar from "./Layout/Navbar";
import Footer from "./Components/Footer";
import ScrollToTop from "./helper/ScrollToTop";
import DashboardLayout from "./Layout/DashboardLayout";
import About from "./Pages/About";
import Programs from "./Pages/Programs";
import Register from "./Pages/Register";
import Contact from "./Pages/Contact";
import Founder from "./Components/Founder";
import FAQs from "./Components/FAQs";
import Blog from "./Pages/BlogPage";
import StudentWork from "./Pages/StudentWork";
import LearnerLogin from "./Pages/LearnerLogin";
import LearnerDashboard from "./Pages/LearnerDashboard";
import LearnerCourse from "./Pages/LearnerCourse";
import LearnerLesson from "./Pages/LearnerLesson";
import TeacherLogin from "./Pages/TeacherLogin";
import TeacherDashboard from "./Pages/TeacherDashboard";
import PortalForgotPassword, {
  PortalResetPassword,
} from "./Pages/PortalForgotPassword";
import CourseDetail from "./Components/CourseDetail";
import TestimonialPage from "./Components/Testimonials/TestimonialPage";
import CertificateVerify from "./Components/CertificateVerify/CertificateVerify";

function AppRoutes() {
  return (
    <Routes>
      {/* <Route path="/" element={<Navigate to="/home" replace />} /> */}

      <Route path="/" element={<DashboardLayout />} />
      <Route path="/about" element={<About />} />
      <Route path="/programs" element={<Programs />} />
      <Route path="/course-detail" element={<CourseDetail />} />
      <Route path="/register" element={<Register />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/faqs" element={<FAQs />} />
      <Route path="/blogs" element={<Blog />} />
      <Route path="/blog/:id" element={<Blog />} />
      <Route path="/student-work" element={<StudentWork />} />
      <Route path="/learn/login" element={<LearnerLogin />} />
      <Route path="/learn/forgot-password" element={<PortalForgotPassword portal="learner" />} />
      <Route path="/learn/reset-password/:token" element={<PortalResetPassword portal="learner" />} />
      <Route path="/learn/dashboard" element={<LearnerDashboard />} />
      <Route path="/learn/course/:slug" element={<LearnerCourse />} />
      <Route path="/learn/lesson/:id" element={<LearnerLesson />} />
      <Route path="/teacher/login" element={<TeacherLogin />} />
      <Route path="/teacher/forgot-password" element={<PortalForgotPassword portal="teacher" />} />
      <Route path="/teacher/reset-password/:token" element={<PortalResetPassword portal="teacher" />} />
      <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
      <Route path="/founder" element={<Founder />} />
      <Route path="/testimonials" element={<TestimonialPage />} />
      {/* 1. This handles clicking "Verify" from the Navbar (Search Mode) */}
      <Route path="/verify" element={<CertificateVerify />} />

      {/* 2. This handles the QR Code scan (Direct Verification Mode) */}
      <Route path="/verify/:regNumber" element={<CertificateVerify />} />
    </Routes>
  );
}

function AppShell() {
  const location = useLocation();
  const isPortal =
    location.pathname.startsWith("/learn") ||
    location.pathname.startsWith("/teacher");

  return (
    <>
      <ScrollToTop />
      {!isPortal && <Navbar />}
      <div className="main-content">
        <AppRoutes />
      </div>
      {!isPortal && <Footer />}
    </>
  );
}

function App() {
  return (
    <HelmetProvider>
      {" "}
      <Router>
        <AppShell />
      </Router>
    </HelmetProvider>
  );
}

export default App;
