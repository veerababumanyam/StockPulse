import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
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
  TrendingUp,
  AlertCircle,
  Github,
  Chrome,
  Twitter,
  Sparkles
} from 'lucide-react';
import { debugApiConfig } from '@config/api';

const Register: React.FC = () => {
  const [step, setStep] = React.useState(1);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    tradingExperience: 'beginner',
    riskTolerance: 'moderate',
    termsAccepted: false,
    emailPreferences: {
      platformUpdates: false,
      priceAlerts: false,
    },
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [advisoryMessage, setAdvisoryMessage] = React.useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  // Debug API configuration on component mount
  React.useEffect(() => {
    console.log('📱 Register component mounted');
    debugApiConfig();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    if (name.startsWith('emailPreferences.')) {
      const prefKey = name.split('.')[1];
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
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const validateStep = () => {
    setError('');

    if (step === 1) {
      if (!formData.name.trim()) return setError('Name is required');
      if (!formData.email.trim()) return setError('Email is required');
      if (!/\S+@\S+\.\S+/.test(formData.email))
        return setError('Email is invalid');
      if (!formData.password) return setError('Password is required');

      // Enhanced password validation
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        return setError(
          'Password must be at least 8 characters long, and include at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).',
        );
      }
      if (formData.password !== formData.confirmPassword)
        return setError('Passwords do not match');

      return true;
    }

    if (step === 2) {
      if (!formData.tradingExperience)
        return setError('Trading experience is required');
      if (!formData.riskTolerance)
        return setError('Risk tolerance is required');

      return true;
    }

    if (step === 3) {
      if (!formData.termsAccepted)
        return setError('You must accept the terms and conditions');

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
    setError('');
    setAdvisoryMessage('');

    console.log('🚀 Starting registration process...');
    console.log('Current URL:', window.location.href);
    console.log('Environment API URL:', import.meta.env.VITE_API_BASE_URL);

    try {
      const response = await register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        confirmPassword: formData.confirmPassword,
      });

      console.log('✅ Registration submitted:', response);

      // Show pending approval message instead of navigating to dashboard
      if (response.status === 'pending') {
        setAdvisoryMessage(
          response.message || 
          'Registration submitted successfully! Your account is pending admin approval. You will receive an email once approved.'
        );
        
        // Set step to show completion message
        setStep(4); // New completion step
      } else {
        // Fallback for other statuses
        setAdvisoryMessage('Registration completed successfully!');
      }

    } catch (err) {
      console.error('❌ Registration failed:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          'An unexpected error occurred during registration. Please try again.',
        );
      }
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
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
          animate={{
            y: [10, -10, 10],
            x: [5, -5, 5],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        
        {/* Animated grid */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent bg-[size:50px_50px] opacity-20" 
             style={{ backgroundImage: 'radial-gradient(circle, #06b6d4 1px, transparent 1px)' }} />
      </div>

      {/* Modern Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="fixed top-0 w-full z-50 backdrop-blur-xl bg-white/5 border-b border-white/10 shadow-2xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group cursor-pointer">
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
                to="/auth/login"
                className="text-white/70 hover:text-white transition-colors font-medium"
              >
                Already have an account? Sign In
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Registration Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
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
              Create your account
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-white/70"
            >
              Join thousands of traders using AI-powered analytics
            </motion.p>
          </div>

          {/* Registration Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-8"
          >
            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <motion.div
                    className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all duration-300 ${
                      step >= 1 
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg' 
                        : 'bg-white/10 border border-white/20 text-white/60'
                    }`}
                    whileHover={{ scale: 1.05 }}
                  >
                    1
                  </motion.div>
                  <div className={`ml-3 text-sm font-medium transition-colors ${step >= 1 ? 'text-white' : 'text-white/60'}`}>
                    Account
                  </div>
                </div>
                <div className={`flex-1 h-1 mx-4 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-gradient-to-r from-cyan-500 to-purple-500' : 'bg-white/10'}`}></div>
                <div className="flex items-center">
                  <motion.div
                    className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all duration-300 ${
                      step >= 2 
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg' 
                        : 'bg-white/10 border border-white/20 text-white/60'
                    }`}
                    whileHover={{ scale: 1.05 }}
                  >
                    2
                  </motion.div>
                  <div className={`ml-3 text-sm font-medium transition-colors ${step >= 2 ? 'text-white' : 'text-white/60'}`}>
                    Profile
                  </div>
                </div>
                <div className={`flex-1 h-1 mx-4 rounded-full transition-all duration-500 ${step >= 3 ? 'bg-gradient-to-r from-cyan-500 to-purple-500' : 'bg-white/10'}`}></div>
                <div className="flex items-center">
                  <motion.div
                    className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all duration-300 ${
                      step >= 3 
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg' 
                        : 'bg-white/10 border border-white/20 text-white/60'
                    }`}
                    whileHover={{ scale: 1.05 }}
                  >
                    3
                  </motion.div>
                  <div className={`ml-3 text-sm font-medium transition-colors ${step >= 3 ? 'text-white' : 'text-white/60'}`}>
                    Complete
                  </div>
                </div>
              </div>
            </div>

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

            {/* Advisory Message */}
            <AnimatePresence>
              {advisoryMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  className="mb-6 bg-yellow-500/10 backdrop-blur-xl border border-yellow-500/20 rounded-xl p-4"
                >
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-yellow-400 mr-3 flex-shrink-0" />
                    <p className="text-sm text-yellow-200">{advisoryMessage}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
                      className="block text-sm font-medium text-white/80 mb-2"
                    >
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-white/80 mb-2"
                    >
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

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
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
                        placeholder="Create a strong password"
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
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
                        placeholder="Confirm your password"
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
                    type="button"
                    onClick={nextStep}
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 flex items-center justify-center group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Continue
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
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
                      className="block text-sm font-medium text-white/80 mb-2"
                    >
                      Trading Experience
                    </label>
                    <select
                      id="tradingExperience"
                      name="tradingExperience"
                      value={formData.tradingExperience}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
                    >
                      <option value="beginner" className="bg-slate-800">
                        Beginner (Less than 1 year)
                      </option>
                      <option value="intermediate" className="bg-slate-800">
                        Intermediate (1-5 years)
                      </option>
                      <option value="advanced" className="bg-slate-800">Advanced (5+ years)</option>
                      <option value="professional" className="bg-slate-800">Professional Trader</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="riskTolerance"
                      className="block text-sm font-medium text-white/80 mb-2"
                    >
                      Risk Tolerance
                    </label>
                    <select
                      id="riskTolerance"
                      name="riskTolerance"
                      value={formData.riskTolerance}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
                    >
                      <option value="conservative" className="bg-slate-800">Conservative</option>
                      <option value="moderate" className="bg-slate-800">Moderate</option>
                      <option value="aggressive" className="bg-slate-800">Aggressive</option>
                    </select>
                  </div>

                  <div className="flex space-x-4">
                    <motion.button
                      type="button"
                      onClick={prevStep}
                      className="flex-1 bg-white/5 border border-white/10 text-white font-semibold py-3 px-4 rounded-xl hover:bg-white/10 transition-all duration-300 flex items-center justify-center group"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                      Back
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={nextStep}
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 flex items-center justify-center group"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Continue
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
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
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Terms and Conditions
                    </h3>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 max-h-40 overflow-y-auto text-sm text-white/70">
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
                          className="h-4 w-4 text-cyan-500 focus:ring-cyan-500 border-white/20 rounded bg-white/5"
                        />
                        <span className="ml-3 text-sm text-white/80">
                          I agree to the terms and conditions
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Email Preferences */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Email Preferences
                    </h3>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="emailPreferences.platformUpdates"
                          checked={formData.emailPreferences.platformUpdates}
                          onChange={handleChange}
                          className="h-4 w-4 text-cyan-500 focus:ring-cyan-500 border-white/20 rounded bg-white/5"
                        />
                        <span className="ml-3 text-sm text-white/80">
                          Receive platform updates and news
                        </span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="emailPreferences.priceAlerts"
                          checked={formData.emailPreferences.priceAlerts}
                          onChange={handleChange}
                          className="h-4 w-4 text-cyan-500 focus:ring-cyan-500 border-white/20 rounded bg-white/5"
                        />
                        <span className="ml-3 text-sm text-white/80">
                          Receive price alerts and notifications
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <motion.button
                      type="button"
                      onClick={prevStep}
                      className="flex-1 bg-white/5 border border-white/10 text-white font-semibold py-3 px-4 rounded-xl hover:bg-white/10 transition-all duration-300 flex items-center justify-center group"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                      Back
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
                      whileHover={{ scale: isLoading ? 1 : 1.02 }}
                      whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Creating Account...
                        </>
                      ) : (
                        <>
                          Create Account
                          <CheckCircle className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
                        </>
                      )}
                    </motion.button>
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
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
                  >
                    <Clock className="w-10 h-10 text-white" />
                  </motion.div>
                  
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-3">
                      Registration Submitted
                    </h3>
                    <p className="text-white/70 text-lg mb-6">
                      Your account is pending admin approval for security.
                    </p>
                  </div>

                  <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-500/20 rounded-xl p-6">
                    <div className="flex items-start space-x-3">
                      <Shield className="w-6 h-6 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="text-left">
                        <h4 className="font-semibold text-blue-200 mb-2">
                          What happens next?
                        </h4>
                        <ul className="space-y-2 text-sm text-blue-300">
                          <li className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                            Our admin team will review your registration
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                            You'll receive an email notification when approved
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                            Once approved, you can log in to access the platform
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link
                        to="/auth/login"
                        className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 flex items-center justify-center group"
                      >
                        Go to Login Page
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </motion.div>
                    
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link
                        to="/"
                        className="w-full bg-white/5 border border-white/10 text-white font-semibold py-3 px-4 rounded-xl hover:bg-white/10 transition-all duration-300 flex items-center justify-center"
                      >
                        Return to Home
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </form>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-sm text-white/60"
          >
            <p>
              Already have an account?{' '}
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

export default Register;
