import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-gray-800 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <p className="text-accent text-btn">
          © {new Date().getFullYear()} Scalio. All rights reserved.
        </p>
        <div className="flex justify-center gap-6 mt-4 text-btn text-secondary">
          <Link to="/privacy" className="hover:text-primary transition">
            Privacy Policy
          </Link>
          <Link to="/term" className="hover:text-primary transition">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
