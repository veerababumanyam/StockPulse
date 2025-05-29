import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import { motion } from "framer-motion";
import {
  BarChart3,
  CheckCircle,
  User,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  Shield,
  Eye,
  EyeOff,
  Clock,
} from "lucide-react";
import { debugApiConfig } from "@config/api";

const Register: React.FC = () => {
  const [step, setStep] = React.useState(1);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    tradingExperience: "beginner",
    riskTolerance: "moderate",
    termsAccepted: false,
    emailPreferences: {
      platformUpdates: false,
      priceAlerts: false,
    },
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [advisoryMessage, setAdvisoryMessage] = React.useState("");

  const { register } = useAuth();
  const navigate = useNavigate();

  // Debug API configuration on component mount
  React.useEffect(() => {
    console.log("📱 Register component mounted");
    debugApiConfig();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    if (name.startsWith("emailPreferences.")) {
      const prefKey = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        emailPreferences: {
          ...prev.emailPreferences,
          [prefKey]: checked,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const validateStep = () => {
    setError("");

    if (step === 1) {
      if (!formData.name.trim()) return setError("Name is required");
      if (!formData.email.trim()) return setError("Email is required");
      if (!/\S+@\S+\.\S+/.test(formData.email))
        return setError("Email is invalid");
      if (!formData.password) return setError("Password is required");

      // Enhanced password validation
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        return setError(
          "Password must be at least 8 characters long, and include at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).",
        );
      }
      if (formData.password !== formData.confirmPassword)
        return setError("Passwords do not match");

      return true;
    }

    if (step === 2) {
      if (!formData.tradingExperience)
        return setError("Trading experience is required");
      if (!formData.riskTolerance)
        return setError("Risk tolerance is required");

      return true;
    }

    if (step === 3) {
      if (!formData.termsAccepted)
        return setError("You must accept the terms and conditions");

      return true;
    }

    return false;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep()) return;

    setIsLoading(true);
    setError("");
    setAdvisoryMessage("");

    console.log("🚀 Starting registration process...");
    console.log("Current URL:", window.location.href);
    console.log("Environment API URL:", import.meta.env.VITE_API_BASE_URL);

    try {
      const response = await register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        confirmPassword: formData.confirmPassword,
      });

      console.log("✅ Registration submitted:", response);

      // Show pending approval message instead of navigating to dashboard
      if (response.status === "pending") {
        setAdvisoryMessage(
          response.message || 
          "Registration submitted successfully! Your account is pending admin approval. You will receive an email once approved."
        );
        
        // Set step to show completion message
        setStep(4); // New completion step
      } else {
        // Fallback for other statuses
        setAdvisoryMessage("Registration completed successfully!");
      }

    } catch (err) {
      console.error("❌ Registration failed:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "An unexpected error occurred during registration. Please try again.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Modern Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="StockPulse" className="w-8 h-8" />
              <span className="text-xl font-bold text-text">StockPulse</span>
            </Link>

            {/* Auth Link */}
            <div className="flex items-center space-x-4">
              <Link
                to="/auth/login"
                className="text-text/70 hover:text-text transition-colors font-medium"
              >
                Already have an account? Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Registration Content */}
      <div className="pt-16 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <img src="/logo.png" alt="StockPulse" className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold text-text">
              Create your account
            </h2>
            <p className="mt-2 text-text/70">
              Join thousands of traders using AI-powered analytics
            </p>
          </motion.div>

          {/* Registration Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-surface rounded-xl border border-border shadow-lg p-8"
          >
            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? "bg-primary-600 text-white" : "bg-surface border border-border text-text/60"} font-semibold`}
                  >
                    1
                  </div>
                  <div
                    className={`ml-3 text-sm font-medium ${step >= 1 ? "text-text" : "text-text/60"}`}
                  >
                    Account
                  </div>
                </div>
                <div
                  className={`flex-1 h-1 mx-4 rounded-full ${step >= 2 ? "bg-primary-600" : "bg-border"}`}
                ></div>
                <div className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? "bg-primary-600 text-white" : "bg-surface border border-border text-text/60"} font-semibold`}
                  >
                    2
                  </div>
                  <div
                    className={`ml-3 text-sm font-medium ${step >= 2 ? "text-text" : "text-text/60"}`}
                  >
                    Profile
                  </div>
                </div>
                <div
                  className={`flex-1 h-1 mx-4 rounded-full ${step >= 3 ? "bg-primary-600" : "bg-border"}`}
                ></div>
                <div className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 3 ? "bg-primary-600 text-white" : "bg-surface border border-border text-text/60"} font-semibold`}
                  >
                    3
                  </div>
                  <div
                    className={`ml-3 text-sm font-medium ${step >= 3 ? "text-text" : "text-text/60"}`}
                  >
                    Complete
                  </div>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-4 rounded-lg text-sm"
              >
                <div className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 flex-shrink-0" />
                  {error}
                </div>
              </motion.div>
            )}

            {/* Advisory Message */}
            {advisoryMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 p-4 rounded-lg text-sm"
              >
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                  {advisoryMessage}
                </div>
              </motion.div>
            )}

            <form
              onSubmit={step === 3 ? handleSubmit : (e) => e.preventDefault()}
            >
              {/* Step 1: Account Information */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-text mb-2"
                    >
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text/40" />
                      <input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-4 py-3 border border-border rounded-lg shadow-sm placeholder:text-text/60 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-background text-text"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-text mb-2"
                    >
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text/40" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-4 py-3 border border-border rounded-lg shadow-sm placeholder:text-text/60 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-background text-text"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-text mb-2"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text/40" />
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-12 py-3 border border-border rounded-lg shadow-sm placeholder:text-text/60 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-background text-text"
                        placeholder="Create a strong password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text/40 hover:text-text/60"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-text mb-2"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text/40" />
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-12 py-3 border border-border rounded-lg shadow-sm placeholder:text-text/60 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-background text-text"
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text/40 hover:text-text/60"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={nextStep}
                    className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </motion.div>
              )}

              {/* Step 2: Trading Profile */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <label
                      htmlFor="tradingExperience"
                      className="block text-sm font-medium text-text mb-2"
                    >
                      Trading Experience
                    </label>
                    <select
                      id="tradingExperience"
                      name="tradingExperience"
                      value={formData.tradingExperience}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 border border-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-background text-text"
                    >
                      <option value="beginner">
                        Beginner (Less than 1 year)
                      </option>
                      <option value="intermediate">
                        Intermediate (1-5 years)
                      </option>
                      <option value="advanced">Advanced (5+ years)</option>
                      <option value="professional">Professional Trader</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="riskTolerance"
                      className="block text-sm font-medium text-text mb-2"
                    >
                      Risk Tolerance
                    </label>
                    <select
                      id="riskTolerance"
                      name="riskTolerance"
                      value={formData.riskTolerance}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 border border-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-background text-text"
                    >
                      <option value="conservative">Conservative</option>
                      <option value="moderate">Moderate</option>
                      <option value="aggressive">Aggressive</option>
                    </select>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex-1 flex items-center justify-center py-3 px-4 border border-border rounded-lg shadow-sm text-sm font-medium text-text bg-surface hover:bg-surface/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      className="flex-1 flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Terms and Preferences */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Terms and Conditions */}
                  <div>
                    <h3 className="text-lg font-semibold text-text mb-4">
                      Terms and Conditions
                    </h3>
                    <div className="bg-background border border-border rounded-lg p-4 max-h-40 overflow-y-auto text-sm text-text/70">
                      <p className="mb-3">
                        By creating an account, you agree to the following terms
                        and conditions:
                      </p>
                      <p className="mb-3">
                        1. StockPulse is a platform for stock analysis and
                        trading information. We do not provide financial advice.
                      </p>
                      <p className="mb-3">
                        2. All investment decisions are made at your own risk.
                        Past performance is not indicative of future results.
                      </p>
                      <p className="mb-3">
                        3. Your personal information will be handled in
                        accordance with our Privacy Policy.
                      </p>
                    </div>

                    <div className="mt-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="termsAccepted"
                          checked={formData.termsAccepted}
                          onChange={handleChange}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-border rounded"
                        />
                        <span className="ml-3 text-sm text-text">
                          I agree to the terms and conditions
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Email Preferences */}
                  <div>
                    <h3 className="text-lg font-semibold text-text mb-4">
                      Email Preferences
                    </h3>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="emailPreferences.platformUpdates"
                          checked={formData.emailPreferences.platformUpdates}
                          onChange={handleChange}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-border rounded"
                        />
                        <span className="ml-3 text-sm text-text">
                          Receive platform updates and news
                        </span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="emailPreferences.priceAlerts"
                          checked={formData.emailPreferences.priceAlerts}
                          onChange={handleChange}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-border rounded"
                        />
                        <span className="ml-3 text-sm text-text">
                          Receive price alerts and notifications
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex-1 flex items-center justify-center py-3 px-4 border border-border rounded-lg shadow-sm text-sm font-medium text-text bg-surface hover:bg-surface/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating Account...
                        </>
                      ) : (
                        <>
                          Create Account
                          <CheckCircle className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Registration Complete - Pending Approval */}
              {step === 4 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-6"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Clock className="w-10 h-10 text-white" />
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold text-text mb-3">
                      Registration Submitted
                    </h3>
                    <p className="text-text/70 text-lg mb-6">
                      Your account is pending admin approval for security.
                    </p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                    <div className="flex items-start space-x-3">
                      <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="text-left">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                          What happens next?
                        </h4>
                        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
                          <li className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                            Our admin team will review your registration
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                            You'll receive an email notification when approved
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                            Once approved, you can log in to access the platform
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Link
                      to="/auth/login"
                      className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                    >
                      Go to Login Page
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                    
                    <Link
                      to="/"
                      className="w-full flex items-center justify-center py-3 px-4 border border-border rounded-lg shadow-sm text-sm font-medium text-text bg-surface hover:bg-surface/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                    >
                      Return to Home
                    </Link>
                  </div>
                </motion.div>
              )}
            </form>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center text-sm text-text/60"
          >
            <p>
              Already have an account?{" "}
              <Link
                to="/auth/login"
                className="font-medium text-primary-600 hover:text-primary-700"
              >
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;
