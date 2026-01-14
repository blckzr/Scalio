import { useState, useRef, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { User, LogOut, Settings } from "lucide-react";
import logo from "./logo.png"; 
import api from "../../lib/api"; // Import your Axios instance

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. Check Auth State
  const token = localStorage.getItem("token");
  const isConnected = !!token;

  // 2. Get User Info
  const userStr = localStorage.getItem("user");
  const userData = userStr ? JSON.parse(userStr) : null;
  const profileImage =
    userData?.profileImage || "https://i.imgur.com/V4RclNb.png"; // Default fallback

  // 3. Logout Method
  const handleLogout = async () => {
    try {
      // Call backend to invalidate session
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local storage keys
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");

      // Close dropdown
      setIsDropdownOpen(false);

      // Force redirect to login page
      window.location.href = "/login";
    }
  };

  // 4. Click Outside Handler (To close dropdown when clicking elsewhere)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helper for Link Styles
  const getLinkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "text-white font-medium"
      : "text-gray-300 hover:text-white transition-colors font-medium";

  return (
    <nav className="bg-transparent px-8 py-6 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        <Link to="/" className="flex items-center gap-3 group">
          <img 
            src={logo} 
            alt="Logo" 
            className="h-10 w-auto object-contain transition-transform group-hover:scale-105" 
          />
          <span className="text-2xl font-bold text-white tracking-tight">
            Scalio
          </span>
        </Link>

        {/* --- CENTER: Desktop Menu --- */}
        <div className="hidden md:flex gap-8 text-btn font-medium">
          <NavLink to="/" className={getLinkClass}>
            Home
          </NavLink>
          {isConnected && (
            <>
              <NavLink to="/dashboard" className={getLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/learn" className={getLinkClass}>
                Learn
              </NavLink>
            </>
          )}
          <NavLink to="/about" className={getLinkClass}>
            About
          </NavLink>
        </div>

        {/* --- RIGHT: Auth Section --- */}
        <div className="hidden md:flex items-center gap-4">
          {isConnected ? (
            // LOGGED IN: Profile Dropdown
            <div className="relative" ref={dropdownRef}>
              {/* Profile Trigger Button */}
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-10 h-10 rounded-full bg-[#222] border flex items-center justify-center overflow-hidden transition-. all ${
                  isDropdownOpen
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-white/10 hover:border-primary"
                }`}
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={20} className="text-accent" />
                )}
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-[#1e1e1e] border border-white/10 rounded-xl shadow-xl py-2 animate-fade-in z-50">
                  {/* Menu Header (User Name) */}
                  <div className="px-4 py-2 border-b border-white/5 mb-1">
                    <p className="text-sm font-bold text-secondary truncate">
                      {userData?.firstName || "User"}
                    </p>
                    <p className="text-xs text-accent truncate">
                      {userData?.email || "student@scalio.com"}
                    </p>
                  </div>

                  {/* Menu Items */}
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-accent hover:bg-white/5 hover:text-primary transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <User size={16} />
                    Profile
                  </Link>

                  <Link
                    to="/settings"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-accent hover:bg-white/5 hover:text-primary transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <Settings size={16} />
                    Settings
                  </Link>

                  <div className="my-1 border-t border-white/5"></div>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
                  >
                    <LogOut size={16} />
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            // LOGGED OUT STATE
            <>
              <Link
                to="/login"
                className="text-secondary font-medium px-4 py-2 rounded-full hover:bg-white/10 transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/registration"
                className="bg-secondary text-background font-bold px-4 py-2 rounded-full hover:bg-gray-200 transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Icon */}
        <button className="md:hidden text-secondary text-2xl">☰</button>
      </div>
    </nav>
  );
};

export default Navbar;