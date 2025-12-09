import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoutes";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegistrationPage from "./pages/RegistrationPage";

// ---------------------------------------------
// MOCK AUTH STATE (Replace this with real logic later)
// ---------------------------------------------
const user = {
  isConnected: true, // Change to 'false' to test Login redirect
  role: "user", // Change to 'admin' to test Admin route
};
// ---------------------------------------------

function App() {
  return (
    <Routes>
      {/* --- PUBLIC ROUTES (Login/Register) --- */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registration" element={<RegistrationPage />} />

      {/* --- PROTECTED ROUTES (Must be logged in) --- */}
      <Route element={<ProtectedRoute isAllowed={user.isConnected} />}>
        {/* Wrap these pages in the MainLayout (Header/Footer) */}
        <Route element={<MainLayout />}>
          {/* Common Pages */}
          <Route path="/" element={<HomePage />} />
          <Route
            path="/profile"
            element={<h1 className="text-heading">User Profile</h1>}
          />

          {/* --- ADMIN ONLY ROUTES --- */}
          {/* Double Check: Must be logged in AND have role 'admin' */}
          <Route
            element={
              <ProtectedRoute
                isAllowed={!!user.isConnected && user.role === "admin"}
                redirectPath="/" // Redirect normal users to Home, not Login
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

      {/* Catch all - Redirect to Home */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
