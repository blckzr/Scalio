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
    userData?.profileImage || "https://i.imgur.com/V4RclNb.png";

  // 3. Logout Method
  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      setIsDropdownOpen(false);
      window.location.href = "/login";
    }
  };

  // 4. Click Outside Handler
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

  // --- STYLING LOGIC ---
  const getLinkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "bg-[#222] text-white px-5 py-2 rounded-lg font-black text-sm tracking-widest uppercase transition-all"
      : "text-gray-500 hover:text-white px-5 py-2 font-eblack text-sm tracking-widest uppercase transition-colors";

  return (
    <nav className="bg-background px-8 py-5 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* --- LEFT: LOGO --- */}
        <Link to="/" className="flex items-center gap-3 group">
          <img src={logo} alt="Logo" className="h-10 w-auto object-contain" />
          <span className="text-2xl font-bold text-white tracking-tight">
            Scalio
          </span>
        </Link>

        {/* --- CENTER: DESKTOP MENU --- */}
        {/* Matches the uppercase, widely spaced look in your image */}
        <div className="hidden md:flex items-center gap-4">
          <NavLink to="/" className={getLinkClass}>
            Home
          </NavLink>
          {isConnected && (
            <>
              <NavLink to="/recommended-roadmaps" className={getLinkClass}>
                Recommended
              </NavLink>
              {/* <NavLink to="/learn" className={getLinkClass}>
                Learn
              </NavLink>{" "} */}
            </>
          )}
          <NavLink to="/about" className={getLinkClass}>
            About
          </NavLink>
        </div>

        {/* --- RIGHT: AUTH SECTION --- */}
        <div className="hidden md:flex items-center gap-6">
          {isConnected ? (
            // LOGGED IN: Profile Dropdown (Kept existing logic)
            <div className="relative" ref={dropdownRef}>
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

              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-[#1e1e1e] border border-white/10 rounded-xl shadow-xl py-2 animate-fade-in z-50">
                  <div className="px-4 py-2 border-b border-white/5 mb-1">
                    <p className="text-sm font-bold text-secondary truncate">
                      {userData?.firstName || "User"}
                    </p>
                    <p className="text-xs text-accent truncate">
                      {userData?.email || "student@scalio.com"}
                    </p>
                  </div>

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
            // Matching the "SIGN IN" Blue Button look from your image
            <div className="flex items-center gap-4">
              {/* Optional: Simple Login Text Link if you want it less prominent */}
              <Link
                to="/login"
                className="text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-white transition-colors"
              >
                Log In
              </Link>

              {/* Main CTA Button - Matches the blue button in your screenshot */}
              <Link
                to="/registration"
                className="bg-primary hover:bg-blue-600 text-white font-extrabold text-sm px-6 py-2.5 rounded-lg uppercase tracking-wide transition-all shadow-lg shadow-blue-500/20"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Icon */}
        <button className="md:hidden text-secondary text-2xl">☰</button>
      </div>
    </nav>
  );
};

export default Navbar;
