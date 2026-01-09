import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  ArrowLeft,
  CheckCircle,
  Lock,
  Key,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
} from "lucide-react";
import api from "../../lib/api";

const STEPS = {
  EMAIL: 0,
  OTP: 1,
  PASSWORD: 2,
  SUCCESS: 3,
};

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(STEPS.EMAIL);

  // Data State
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState(""); // The OTP
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Resend Timer State
  const [timer, setTimer] = useState(0);

  // Timer Countdown Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // --- ACTIONS ---

  // 1. Send Email
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/forgot-password", { email });
      setStep(STEPS.OTP);
      setTimer(60); // Start 60s cooldown for resend
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send code.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Resend
  const handleResend = async () => {
    if (timer > 0) return;
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/resend-otp", { email, type: "recovery" });
      setTimer(60);
      alert("Code resent!");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to resend.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Submit OTP (Move to Password Step)
  const handleSubmitOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (resetCode.length < 6) {
      setError("Code must be at least 6 digits");
      return;
    }
    setError("");
    setStep(STEPS.PASSWORD);
  };

  // 4. Final Submit (Verify Code + Update Password)
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // Call the endpoint we created in the previous step
      await api.post("/auth/reset-password", {
        email,
        token: resetCode, // The code from Step 2
        password: newPassword,
      });
      setStep(STEPS.SUCCESS);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Invalid code or failed to update."
      );
      // If code is wrong, maybe go back to OTP step?
      // For now, we stay here so they can see the error.
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4 bg-background">
      {/* Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md bg-[#1e1e1e] border border-white/10 rounded-2xl shadow-2xl p-8 md:p-10">
        {/* Error Banner */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg text-center mb-6">
            {error}
          </div>
        )}

        {/* ================= STAGE 1: EMAIL INPUT ================= */}
        {step === STEPS.EMAIL && (
          <form
            onSubmit={handleSendEmail}
            className="space-y-6 animate-fade-in"
          >
            <div className="text-center">
              <h1 className="text-2xl font-bold text-secondary mb-2">
                Forgot Password
              </h1>
              <p className="text-accent text-sm">
                Enter your email to receive a reset code.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-accent uppercase">
                Email
              </label>
              <div className="relative group">
                <Mail
                  size={18}
                  className="absolute left-3 top-3.5 text-accent"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-blue-400 text-white font-bold py-3 rounded-lg shadow-lg flex justify-center items-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin mx-auto" />
              ) : (
                "Send Code"
              )}
            </button>

            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-sm text-accent hover:text-white mt-4"
            >
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </form>
        )}

        {/* ================= STAGE 2: OTP INPUT ================= */}
        {step === STEPS.OTP && (
          <form
            onSubmit={handleSubmitOtp}
            className="space-y-6 animate-fade-in"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                <Mail size={24} />
              </div>
              <h2 className="text-xl font-bold text-secondary">
                Check your Email
              </h2>
              <p className="text-accent text-sm mt-1">
                We sent a code to <span className="text-white">{email}</span>
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-accent uppercase">
                Enter 8-Digit Code
              </label>
              <div className="relative group">
                <Key
                  size={18}
                  className="absolute left-3 top-3.5 text-accent"
                />
                <input
                  type="text"
                  required
                  maxLength={8} // 8 Digits max
                  value={resetCode}
                  onChange={(e) =>
                    setResetCode(e.target.value.replace(/\D/g, ""))
                  } // Numbers only
                  placeholder="e.g. 12345678"
                  className="input-field pl-10 tracking-[0.2em] font-mono text-center text-lg"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-blue-400 text-white font-bold py-3 rounded-lg shadow-lg flex justify-center items-center gap-2 transition-all disabled:opacity-50"
            >
              Verify Code
            </button>

            {/* Resend Button */}
            <button
              type="button"
              onClick={handleResend}
              disabled={timer > 0 || loading}
              className="w-full flex items-center justify-center gap-2 text-sm text-accent hover:text-primary disabled:text-gray-600 transition-colors"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )}
              {timer > 0 ? `Resend code in ${timer}s` : "Resend Code"}
            </button>
          </form>
        )}

        {/* ================= STAGE 3: PASSWORD INPUT ================= */}
        {step === STEPS.PASSWORD && (
          <form
            onSubmit={handleFinalSubmit}
            className="space-y-6 animate-fade-in"
          >
            <div className="text-center">
              <h2 className="text-xl font-bold text-secondary">
                Reset Password
              </h2>
              <p className="text-accent text-sm">
                Create a new strong password.
              </p>
            </div>

            <div className="space-y-4">
              {/* New Password */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-accent uppercase">
                  New Password
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-3 top-3.5 text-accent"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-field pl-10 pr-10"
                    placeholder="New password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-accent hover:text-white"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-accent uppercase">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-3 top-3.5 text-accent"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field pl-10"
                    placeholder="Confirm password"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-blue-400 text-white font-bold py-3 rounded-lg shadow-lg flex justify-center items-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin mx-auto" />
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        )}

        {/* ================= STAGE 4: SUCCESS ================= */}
        {step === STEPS.SUCCESS && (
          <div className="text-center space-y-6 animate-fade-in">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-500">
              <CheckCircle size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-secondary">All Set!</h2>
              <p className="text-accent text-sm mt-2">
                Your password has been successfully updated.
              </p>
            </div>
            <Link
              to="/login"
              className="w-full bg-primary hover:bg-blue-400 text-white font-bold py-3 rounded-lg shadow-lg flex justify-center items-center gap-2 transition-all disabled:opacity-50"
            >
              Go to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
