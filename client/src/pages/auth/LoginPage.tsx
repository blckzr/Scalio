import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    // Outer Container: Uses the global #181818 background
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      {/* Decorative Background Elements (Subtle glows) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl"></div>
      </div>

      {/* Main Login Card */}
      {/* Added border-white/10 so the dark card stands out against the dark background */}
      <div className="w-full max-w-5xl flex flex-col md:flex-row rounded-2xl border border-white/10 bg-[#1e1e1e] shadow-2xl overflow-hidden z-10">
        {/* Left Side: Logo Section */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center items-center relative">
          <div className="relative z-10">
            <h1 className="text-heading font-bold tracking-[0.2em] mb-2 text-center text-secondary">
              SCALIO
            </h1>
            {/* Clean White Underline */}
            <div className="w-full h-1 bg-secondary rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
          </div>
        </div>

        {/* Right Side: Form Section */}
        <div className="w-full md:w-1/2 p-8 md:p-12 bg-background flex flex-col justify-center border-t md:border-t-0 md:border-l border-white/5">
          <form className="space-y-6 w-full max-w-md mx-auto">
            {/* Email Input */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-body text-accent block uppercase tracking-wider font-medium text-xs"
              >
                Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail
                    size={20}
                    className="text-accent group-focus-within:text-primary transition-colors"
                  />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#222] border border-accent/20 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-secondary placeholder:text-gray-600"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-body text-accent block uppercase tracking-wider font-medium text-xs"
              >
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock
                    size={20}
                    className="text-accent group-focus-within:text-primary transition-colors"
                  />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-3 rounded-lg bg-[#222] border border-accent/20 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-secondary placeholder:text-gray-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-accent hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm text-accent">
              <label className="flex items-center space-x-2 cursor-pointer hover:text-secondary transition-colors">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded bg-[#222] border-accent/20 text-primary focus:ring-primary focus:ring-offset-background"
                />
                <span>Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="hover:text-primary transition-colors hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Full Width Button */}
            <button
              type="submit"
              className="w-full bg-primary hover:bg-blue-400 text-white font-medium py-3 rounded-lg shadow-lg hover:shadow-blue-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Log-in
            </button>

            {/* Sign Up Link */}
            <div className="text-center text-accent mt-6 text-sm">
              Don't have an account?{" "}
              <Link
                to="/registration"
                className="text-primary font-medium hover:underline"
              >
                Sign up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
