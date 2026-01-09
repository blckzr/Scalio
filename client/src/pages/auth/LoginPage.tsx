import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Added useNavigate
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react"; // Added Loader2
import api from "../../lib/api"; // Import the Axios client we created

const LoginPage = () => {
  const navigate = useNavigate();

  // 1. Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // 2. UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 3. The Login Logic
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    setLoading(true);

    try {
      // Send the request exactly as shown in your request example
      const response = await api.post("/auth/signin", {
        email,
        password,
      });

      // 4. Handle the specific Response Structure you provided
      const { access_token, refresh_token, user } = response.data;

      // Save tokens and user info to LocalStorage
      localStorage.setItem("token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("user", JSON.stringify(user));

      // 5. Redirect User
      // You can add logic here if admins go to a different page
      navigate("/");
    } catch (err: any) {
      console.error("Login Error:", err);
      // specific error message or generic fallback
      setError(
        err.response?.data?.message ||
          "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4 bg-[#181818]">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl"></div>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-5xl flex flex-col md:flex-row rounded-2xl border border-white/10 bg-[#1e1e1e] shadow-2xl overflow-hidden z-10">
        {/* Left Side: Logo Section */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center items-center relative">
          <div className="relative z-10">
            <h1 className="text-heading font-bold tracking-[0.2em] mb-2 text-center text-secondary">
              SCALIO
            </h1>
            <div className="w-full h-1 bg-secondary rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
          </div>
        </div>

        {/* Right Side: Form Section */}
        <div className="w-full md:w-1/2 p-8 md:p-12 bg-background flex flex-col justify-center border-t md:border-t-0 md:border-l border-white/5">
          {/* Bind the form to handleLogin */}
          <form
            onSubmit={handleLogin}
            className="space-y-6 w-full max-w-md mx-auto"
          >
            {/* Error Message Display */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg text-center animate-pulse">
                {error}
              </div>
            )}

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
                  required
                  value={email} // Bind state
                  onChange={(e) => setEmail(e.target.value)} // Update state
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
                  required
                  value={password} // Bind state
                  onChange={(e) => setPassword(e.target.value)} // Update state
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

            {/* Submit Button with Loading State */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-blue-400 text-white font-medium py-3 rounded-lg shadow-lg hover:shadow-blue-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Logging in...
                </>
              ) : (
                "Log-in"
              )}
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
