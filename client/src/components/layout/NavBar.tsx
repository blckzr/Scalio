import { Link, NavLink } from "react-router-dom";
import { User } from "lucide-react"; // Icon for profile placeholder

const Navbar = () => {
  // -----------------------------------------------------------------
  // MOCK STATE: Change 'isConnected' to true/false to test the UI
  // In the future, this will come from your global Auth Context
  // -----------------------------------------------------------------
  const user = {
    isConnected: true,
    profileImage: "https://i.imgur.com/V4RclNb.png", // Uncomment to test image
  };
  // -----------------------------------------------------------------

  const getLinkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "text-primary font-bold"
      : "text-secondary hover:text-primary transition-colors";

  return (
    <nav className="bg-background border-b border-gray-800 px-6 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* --- LEFT: Logo --- */}
        <Link
          to="/"
          className="text-heading font-bold text-primary tracking-tight"
        >
          Scalio
        </Link>

        {/* --- CENTER: Desktop Menu --- */}
        {/* Only show these navigation links if logged in, or keep public ones? 
            Usually, landing pages are for everyone. I'll leave them visible. */}
        <div className="hidden md:flex gap-8 text-btn font-medium">
          <NavLink to="/" className={getLinkClass}>
            Home
          </NavLink>
          {user.isConnected && (
            <NavLink to="/dashboard" className={getLinkClass}>
              Dashboard
            </NavLink>
          )}
          <NavLink to="/about" className={getLinkClass}>
            About
          </NavLink>
        </div>

        {/* --- RIGHT: Auth Section OR Profile --- */}
        <div className="hidden md:flex items-center gap-4">
          {user.isConnected ? (
            // STATE 1: LOGGED IN (Circular Profile Pic)
            <Link
              to="/profile"
              className="w-10 h-10 rounded-full bg-[#222] border border-white/10 flex items-center justify-center overflow-hidden hover:border-primary transition-colors"
              title="Go to Profile"
            >
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={20} className="text-accent" />
              )}
            </Link>
          ) : (
            // STATE 2: NOT LOGGED IN (Uber Style Buttons)
            <>
              {/* Login: Simple Text/Ghost Button */}
              <Link
                to="/login"
                className="text-secondary font-medium px-4 py-2 rounded-full hover:bg-white/10 transition-colors"
              >
                Log in
              </Link>

              {/* Sign Up: White Pill Button (Uber Style) */}
              <Link
                to="/registration"
                className="bg-secondary text-background font-bold px-4 py-2 rounded-full hover:bg-gray-200 transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Icon (Placeholder) */}
        <button className="md:hidden text-secondary text-2xl">☰</button>
      </div>
    </nav>
  );
};

export default Navbar;
