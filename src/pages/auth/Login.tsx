import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  TrendingUp,
  Shield,
  AlertCircle,
  Github,
  Chrome,
  Twitter,
  Sparkles,
} from "lucide-react";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect path from location state or default to dashboard
  const from = (location.state as any)?.from?.pathname || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError(null);

    try {
      await login(email.trim().toLowerCase(), password);
      // Redirect is handled by the login function
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        error?.message ||
        "Login failed. Please check your credentials and try again.";

      setLoginError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormLoading = isLoading || isSubmitting;

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

            {/* Auth Link */}
            <div className="flex items-center space-x-4">
              <Link
                to="/auth/register"
                className="text-white/70 hover:text-white transition-colors font-medium"
              >
                Don't have an account? Sign Up
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Login Content */}
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
              <TrendingUp className="w-10 h-10 text-white" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold mb-2"
            >
              Welcome back
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-white/70"
            >
              Sign in to your StockPulse account
            </motion.p>
          </div>

          {/* Error Display */}
          <AnimatePresence>
            {loginError && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-xl p-4"
              >
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-red-300 mb-1">
                      Authentication Failed
                    </h3>
                    <p className="text-sm text-red-200">{loginError}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-8"
          >
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email-address"
                    className="block text-sm font-medium text-white/80 mb-2"
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      id="email-address"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      disabled={isFormLoading}
                      className="block w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 disabled:opacity-50"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-white/80 mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      disabled={isFormLoading}
                      className="block w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 disabled:opacity-50"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                      disabled={isFormLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    disabled={isFormLoading}
                    className="h-4 w-4 text-cyan-500 focus:ring-cyan-500 border-white/20 rounded bg-white/5 disabled:opacity-50"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="ml-2 text-sm text-white/70">
                    Remember me
                  </span>
                </label>

                <Link
                  to="/auth/forgot-password"
                  className="text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                  tabIndex={isFormLoading ? -1 : 0}
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isFormLoading}
                className="group relative w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                whileHover={{ scale: isFormLoading ? 1 : 1.02 }}
                whileTap={{ scale: isFormLoading ? 1 : 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center justify-center">
                  {isFormLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </motion.button>
            </form>

            {/* Social Login */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-transparent text-white/60">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  { icon: Github, name: "GitHub" },
                  { icon: Chrome, name: "Google" },
                  { icon: Twitter, name: "Twitter" },
                ].map((provider, index) => (
                  <motion.button
                    key={provider.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="group relative bg-white/5 border border-white/10 rounded-xl py-3 px-4 hover:bg-white/10 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <provider.icon className="w-5 h-5 text-white/70 group-hover:text-white transition-colors mx-auto" />
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-sm text-white/60"
          >
            <p>
              Don't have an account?{" "}
              <Link
                to="/auth/register"
                className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Sign up for free
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
