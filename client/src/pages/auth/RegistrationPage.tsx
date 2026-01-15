import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Added useNavigate
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
  Loader2, // Added Loader for button
} from "lucide-react";
import { usePasswordValidation } from "../../hooks/usePasswordValidation";
import RequirementItem from "../../components/ui/RequirementItem";
import api from "../../lib/api"; // Import your Axios client

const RegistrationPage = () => {
  const navigate = useNavigate();

  // --- 1. Form State (For fields not handled by the hook) ---
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  // Note: 'password' and 'confirmPassword' are handled by the hook below

  // --- 2. UI State ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // --- 3. Custom Hook for Password Logic ---
  const {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    validations,
    isFormValid,
  } = usePasswordValidation();

  // --- 4. Registration Logic ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Double check form validity
    if (!isFormValid) {
      setError("Please ensure all fields are valid.");
      setLoading(false);
      return;
    }

    try {
      // Construct the payload using snake_case as per your request
      const payload = {
        email: email,
        password: password,
        first_name: firstName,
        last_name: lastName,
        middle_name: middleName,
        birthday: birthday,
        contact_number: contactNumber,
      };

      // Call the API (Assuming endpoint is /auth/signup based on context)
      // If your endpoint is different (e.g., /auth/register), change it here.
      const response = await api.post("/auth/signup", payload);

      if (response.data.status === "success") {
        // Redirect to Login Page on success
        navigate("/login");
      }
    } catch (err: any) {
      console.error("Registration failed:", err);
      setError(
        err.response?.data?.message ||
          "Failed to create account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4 bg-background">
      {/* Decorative Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-10 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-accent/5 rounded-full blur-3xl"></div>
      </div>

      {/* Main Registration Card */}
      <div className="w-full max-w-2xl bg-[#1e1e1e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative z-10">
        {/* Header */}
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
          <form className="space-y-5" onSubmit={handleRegister}>
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg text-center animate-pulse">
                {error}
              </div>
            )}

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
                    required
                    placeholder="John"
                    className="input-field"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
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
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                />
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
                    required
                    placeholder="Doe"
                    className="input-field"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
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
                  <input
                    type="date"
                    required
                    className="input-field text-accent"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* --- Row 3: Contact Number & Email --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Contact Number */}
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
                    required
                    placeholder="09123456789"
                    className="input-field"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                  />
                </div>
              </div>

              {/* Email */}
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
                    required
                    placeholder="john.doe@example.com"
                    className="input-field"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    required
                    placeholder="Create a strong password"
                    className="input-field"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-accent hover:text-white cursor-pointer"
                  >
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
                      className={`transition-colors ${
                        confirmPassword && !validations.isMatching
                          ? "text-red-500"
                          : "text-accent group-focus-within:text-primary"
                      }`}
                    />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="Confirm your password"
                    className={`input-field ${
                      confirmPassword && !validations.isMatching
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                        : ""
                    }`}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-accent hover:text-white cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Password Requirements Checklist */}
            {password.length > 0 && (
              <div className="bg-background p-3 rounded-lg border border-white/5 grid grid-cols-2 gap-2 text-xs">
                <RequirementItem
                  met={validations.minLength}
                  text="Min. 8 characters"
                />
                <RequirementItem
                  met={validations.hasUppercase}
                  text="Uppercase letter"
                />
                <RequirementItem
                  met={validations.hasLowercase}
                  text="Lowercase letter"
                />
                <RequirementItem met={validations.hasNumber} text="Number" />
                <RequirementItem
                  met={validations.isMatching}
                  text="Passwords match"
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className={`w-full font-bold py-3.5 rounded-lg shadow-lg transition-all transform mt-2 flex justify-center items-center gap-2 ${
                isFormValid
                  ? "bg-primary hover:bg-blue-400 text-white hover:-translate-y-0.5"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>

            {/* Social Divider & Footer ... (Same as before) */}
            <div className="relative flex py-2 items-center">
              <div className="grow border-t border-white/10"></div>
              <span className="shrink-0 mx-4 text-xs text-accent uppercase">
                Or sign up with
              </span>
              <div className="grow border-t border-white/10"></div>
            </div>

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
                <Globe size={20} className="text-red-500" />
                <span className="text-sm font-medium">Google</span>
              </button>
            </div>

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
