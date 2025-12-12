const Footer = () => {
  return (
    <footer className="bg-background border-t border-gray-800 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <p className="text-accent text-btn">
          © {new Date().getFullYear()} Scalio. All rights reserved.
        </p>
        <div className="flex justify-center gap-6 mt-4 text-btn text-secondary">
          <a href="#" className="hover:text-primary transition">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-primary transition">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
