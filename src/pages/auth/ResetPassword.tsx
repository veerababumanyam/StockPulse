import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Shield,
} from "lucide-react";

const ResetPassword: React.FC = () => {
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState(false);

  const { resetPassword } = useAuth();

  // In a real app, we would get the token from the URL
  const token =
    new URLSearchParams(window.location.search).get("token") || "demo-token";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    if (password.length < 8) {
      return setError("Password must be at least 8 characters");
    }

    setIsLoading(true);

    try {
      await resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setError(
        "Failed to reset password. Please try again or request a new reset link.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-full blur-3xl"
          animate={{
            y: [-10, 10, -10],
            x: [-5, 5, -5],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
          animate={{
            y: [10, -10, 10],
            x: [5, -5, 5],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Animated grid */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent bg-[size:50px_50px] opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle, #06b6d4 1px, transparent 1px)",
          }}
        />
      </div>

      {/* Modern Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-0 w-full z-50 backdrop-blur-xl bg-white/5 border-b border-white/10 shadow-2xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center space-x-3 group cursor-pointer"
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <motion.div
                  className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl blur opacity-30"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                StockPulse
              </span>
            </Link>

            {/* Auth Links */}
            <div className="flex items-center space-x-4">
              <Link
                to="/auth/login"
                className="text-white/70 hover:text-white transition-colors font-medium"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Reset Password Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-md w-full space-y-8"
        >
          {/* Header */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
            >
              <Lock className="w-10 h-10 text-white" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold mb-2"
            >
              Create new password
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-white/70"
            >
              Enter your new password below
            </motion.p>
          </div>

          {/* Form Container */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-8"
          >
            {/* Error Display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  className="mb-6 bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-xl p-4"
                >
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" />
                    <p className="text-sm text-red-200">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
                >
                  <CheckCircle className="w-8 h-8 text-white" />
                </motion.div>

                <div className="bg-green-500/10 backdrop-blur-xl border border-green-500/20 rounded-xl p-4 mb-6">
                  <p className="text-sm text-green-200">
                    Your password has been successfully reset!
                  </p>
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to="/auth/login"
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 flex items-center justify-center group"
                  >
                    Return to login
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              </motion.div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-white/80 mb-2"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
                      placeholder="Enter your new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
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
                    className="block text-sm font-medium text-white/80 mb-2"
                  >
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
                      placeholder="Confirm your new password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Resetting...
                    </>
                  ) : (
                    <>
                      Reset Password
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </motion.button>
              </form>
            )}
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-sm text-white/60"
          >
            <p>
              Remember your password?{" "}
              <Link
                to="/auth/login"
                className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword;
