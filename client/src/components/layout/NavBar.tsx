import { Link, NavLink } from "react-router-dom";
import { User } from "lucide-react";
import logo from "./logo.png"; 

const Navbar = () => {
  const user = { isConnected: false };

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

        <div className="hidden md:flex items-center gap-10">
          <div className="flex gap-10 text-lg mr-4">
            <NavLink to="/" className={getLinkClass}>Home</NavLink>
            <NavLink to="/learn" className={getLinkClass}>Learn</NavLink>
            <NavLink to="/about" className={getLinkClass}>About</NavLink>
          </div>

          <Link
            to="/login"
            className="border-2 border-white text-white font-bold px-6 py-2 rounded-xl hover:bg-white hover:text-black transition-all"
          >
            Log-In
          </Link>
        </div>

        <button className="md:hidden text-white text-2xl">☰</button>
      </div>
    </nav>
  );
};

export default Navbar;