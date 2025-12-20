import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect this to your Backend API later
    // Example: await api.post('/auth/forgot-password', { email });
    console.log("Reset link requested for:", email);

    // Simulate success for UI demo
    setIsSubmitted(true);
  };

  return (
    // 1. Global Dark Background (Matches Login)
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4 bg-background">
      {/* Decorative Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl"></div>
      </div>

      {/* 2. Main Card */}
      <div className="w-full max-w-md bg-[#1e1e1e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative z-10 p-8 md:p-10">
        {/* State 1: Success Message (After sending) */}
        {isSubmitted ? (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <div>
              <h2 className="text-heading font-bold text-secondary mb-2">
                Check your email
              </h2>
              <p className="text-accent text-sm">
                We've sent a password reset link to <br />
                <span className="text-secondary font-medium">{email}</span>
              </p>
            </div>
            <button
              onClick={() => setIsSubmitted(false)} // Reset to try again demo
              className="w-full bg-[#222] border border-white/10 text-secondary hover:bg-[#2a2a2a] font-medium py-3 rounded-lg transition-colors"
            >
              Resend email
            </button>
            <div className="pt-2">
              <Link
                to="/login"
                className="flex items-center justify-center text-sm text-accent hover:text-white transition-colors gap-2"
              >
                <ArrowLeft size={16} />
                Back to Login
              </Link>
            </div>
          </div>
        ) : (
          // State 2: Input Form (Default)
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-heading font-bold text-secondary mb-2">
                Forgot Password?
              </h1>
              <p className="text-accent text-sm">
                No worries, we'll send you reset instructions.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-xs font-medium text-accent uppercase tracking-wider"
                >
                  Email Address
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="input-field" // Uses your custom class
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-primary hover:bg-blue-400 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-primary/20 transition-all transform hover:-translate-y-0.5"
              >
                Send Reset Link
              </button>
            </form>

            {/* Back to Login Link */}
            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-sm text-accent hover:text-white transition-colors gap-2 hover:underline underline-offset-4"
              >
                <ArrowLeft size={16} />
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
