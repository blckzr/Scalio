import { useState } from "react";
import { Link } from "react-router-dom";
import {
  User,
  Calendar,
  Phone,
  Mail,
  Lock,
  Linkedin,
  Globe,
  EyeOff,
  Eye,
} from "lucide-react";

const RegistrationPage = () => {
  // We use this to toggle password visibility if needed (reusing logic from Login)
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    // 1. Global Dark Background Container
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4 bg-background">
      {/* Decorative Glows (Consistent with Login Page) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-10 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-accent/5 rounded-full blur-3xl"></div>
      </div>

      {/* 2. Main Registration Card */}
      {/* We use max-w-2xl because this form is wider than the login form */}
      <div className="w-full max-w-2xl bg-[#1e1e1e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative z-10">
        {/* Header Section */}
        <div className="px-8 pt-8 pb-4 text-center">
          <h1 className="text-heading font-bold text-secondary tracking-tight mb-2">
            Create Account
          </h1>
          <p className="text-accent text-sm">
            Join Scalio to master your tech career
          </p>
        </div>

        {/* Form Section */}
        <div className="p-8 pt-4">
          <form className="space-y-5">
            {/* --- Row 1: First Name & Middle Name --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* First Name */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-accent uppercase tracking-wider">
                  First Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User
                      size={18}
                      className="text-accent group-focus-within:text-primary transition-colors"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="John"
                    className="input-field"
                  />
                </div>
              </div>

              {/* Middle Name */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-accent uppercase tracking-wider">
                  Middle Name
                </label>
                <input
                  type="text"
                  placeholder="D."
                  className="input-field pl-4"
                />
                {/* No icon needed for middle name usually, keeping it clean */}
              </div>
            </div>

            {/* --- Row 2: Last Name & Birthday --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Last Name */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-accent uppercase tracking-wider">
                  Last Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User
                      size={18}
                      className="text-accent group-focus-within:text-primary transition-colors"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Doe"
                    className="input-field"
                  />
                </div>
              </div>

              {/* Birthday */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-accent uppercase tracking-wider">
                  Birthday
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar
                      size={18}
                      className="text-accent group-focus-within:text-primary transition-colors"
                    />
                  </div>
                  <input type="date" className="input-field text-accent" />
                </div>
              </div>
            </div>

            {/* --- Row 3: Age (Small) & Contact Number (Wide) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Contact Number - Takes remaining space */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-accent uppercase tracking-wider">
                  Contact Number
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone
                      size={18}
                      className="text-accent group-focus-within:text-primary transition-colors"
                    />
                  </div>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-accent uppercase tracking-wider">
                  Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail
                      size={18}
                      className="text-accent group-focus-within:text-primary transition-colors"
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="john.doe@example.com"
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* --- Row 4: Password --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Password Field */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-accent uppercase tracking-wider">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock
                      size={18}
                      className="text-accent group-focus-within:text-primary transition-colors"
                    />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    className="input-field"
                  />
                  {/* ADD THIS BUTTON to use setShowPassword */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)} // <--- Used here!
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-accent hover:text-white cursor-pointer"
                  >
                    {/* Import Eye/EyeOff from lucide-react first */}
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-accent uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock
                      size={18}
                      className="text-accent group-focus-within:text-primary transition-colors"
                    />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    className="input-field"
                  />
                  {/* ADD THIS BUTTON to use setShowPassword */}
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)} // <--- Used here!
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-accent hover:text-white cursor-pointer"
                  >
                    {/* Import Eye/EyeOff from lucide-react first */}
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-primary hover:bg-blue-400 text-white font-bold py-3.5 rounded-lg shadow-lg hover:shadow-primary/20 transition-all transform hover:-translate-y-0.5 mt-2"
            >
              Create Account
            </button>

            {/* --- Social Login Divider --- */}
            <div className="relative flex py-2 items-center">
              <div className="grow border-t border-white/10"></div>
              <span className="shrink-0 mx-4 text-xs text-accent uppercase">
                Or sign up with
              </span>
              <div className="grow border-t border-white/10"></div>
            </div>

            {/* Social Buttons (LinkedIn & Google) */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className="flex items-center justify-center gap-2 bg-[#222] border border-white/10 hover:bg-[#2a2a2a] text-secondary py-2.5 rounded-lg transition-colors"
              >
                <Linkedin size={20} className="text-[#0077b5]" />
                <span className="text-sm font-medium">LinkedIn</span>
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 bg-[#222] border border-white/10 hover:bg-[#2a2a2a] text-secondary py-2.5 rounded-lg transition-colors"
              >
                {/* Using Globe as placeholder for Google G icon */}
                <Globe size={20} className="text-red-500" />
                <span className="text-sm font-medium">Google</span>
              </button>
            </div>

            {/* Footer */}
            <div className="text-center text-accent text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary font-medium hover:underline"
              >
                Log In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;
