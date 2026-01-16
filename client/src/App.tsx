import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoutes";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import RegistrationPage from "./pages/auth/RegistrationPage";
import ForgotPasswordPage from "./pages/auth/ForgotPassword";
import AboutPage from "./pages/marketing/AboutPage";
import ContactPage from "./pages/marketing/ContactPage";
import PrivacyPage from "./pages/marketing/PrivacyPage";
import TermsPage from "./pages/marketing/TermPage";
import LearnPage from "./pages/LearnPage";
import CoursePage from "./pages/CoursePage";
import RecommendedRoadmapsPage from "./pages/RecommendedRoadmapsPage";
import LessonPage from "./pages/learn/learn";
// 1. IMPORT YOUR CERTIFICATE PAGE HERE
import CertificatePage from "./pages/learn/certificate";

const user = {
  isConnected: true,
  role: "user",
};

function App() {
  return (
    <Routes>
      {/* --- PUBLIC ROUTES --- */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registration" element={<RegistrationPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* --- PROTECTED ROUTES --- */}
      <Route element={<ProtectedRoute isAllowed={user.isConnected} />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />

          {/* --- LEARNING PATH SYSTEM --- */}
          <Route path="/learn" element={<LearnPage />} />
          <Route path="/learn/:courseId" element={<CoursePage />} />
          <Route
            path="/learn/:courseId/lesson/:lessonId"
            element={<LessonPage />}
          />

          <Route
            path="/recommended-roadmaps"
            element={<RecommendedRoadmapsPage />}
          />

          {/* --- USER & INFO ROUTES --- */}
          <Route
            path="/profile"
            element={<h1 className="text-heading">User Profile</h1>}
          />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/term" element={<TermsPage />} />

          {/* --- ADMIN ONLY ROUTES --- */}
          <Route
            element={
              <ProtectedRoute
                isAllowed={!!user.isConnected && user.role === "admin"}
                redirectPath="/"
              />
            }
          >
            <Route
              path="/admin"
              element={
                <h1 className="text-heading text-red-500">Admin Dashboard</h1>
              }
            />
          </Route>
        </Route>
      </Route>

      {/* This is what was sending you to landing page before because the route was missing */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
