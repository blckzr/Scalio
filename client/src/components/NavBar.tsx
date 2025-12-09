import { Link, NavLink } from "react-router-dom";

const Navbar = () => {
  // Helper to style active vs inactive links
  const getLinkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "text-primary font-bold" // Active color (Blue)
      : "text-secondary hover:text-primary transition-colors"; // Default (White) -> Hover (Blue)

  return (
    <nav className="bg-background border-b border-gray-800 px-6 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          className="text-heading font-bold text-primary tracking-tight"
        >
          Scalio
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 text-btn font-medium">
          <NavLink to="/" className={getLinkClass}>
            Home
          </NavLink>
          <NavLink to="/profile" className={getLinkClass}>
            Profile
          </NavLink>
          {/* Only show this if admin (You can add logic here later) */}
          <NavLink to="/admin" className={getLinkClass}>
            Admin
          </NavLink>
        </div>

        {/* Action Button (Logout) */}
        <button className="hidden md:block bg-primary text-secondary text-btn font-medium px-5 py-2 rounded-md hover:bg-opacity-90 transition">
          Logout
        </button>

        {/* Mobile Menu Icon (Placeholder) */}
        <button className="md:hidden text-secondary text-2xl">☰</button>
      </div>
    </nav>
  );
};

export default Navbar;
