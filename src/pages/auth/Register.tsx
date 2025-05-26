import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import Logo from '@components/ui/Logo';
import { motion } from 'framer-motion';

const Register: React.FC = () => {
  const [step, setStep] = React.useState(1);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    tradingExperience: 'beginner',
    riskTolerance: 'moderate',
    termsAccepted: false
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  
  const { register } = useAuth();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const validateStep = () => {
    setError('');
    
    if (step === 1) {
      if (!formData.name.trim()) return setError('Name is required');
      if (!formData.email.trim()) return setError('Email is required');
      if (!/\S+@\S+\.\S+/.test(formData.email)) return setError('Email is invalid');
      if (!formData.password) return setError('Password is required');
      if (formData.password.length < 8) return setError('Password must be at least 8 characters');
      if (formData.password !== formData.confirmPassword) return setError('Passwords do not match');
      
      return true;
    }
    
    if (step === 2) {
      if (!formData.tradingExperience) return setError('Trading experience is required');
      if (!formData.riskTolerance) return setError('Risk tolerance is required');
      
      return true;
    }
    
    if (step === 3) {
      if (!formData.termsAccepted) return setError('You must accept the terms and conditions');
      
      return true;
    }
    
    return false;
  };
  
  const nextStep = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
    }
  };
  
  const prevStep = () => {
    setStep(prev => prev - 1);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep()) return;
    
    setIsLoading(true);
    
    try {
      await register(formData.email, formData.password, formData.name);
      // Registration successful, redirect happens in AuthContext
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-secondary-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Logo size="lg" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900 dark:text-white">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/auth/login" className="font-medium text-primary hover:text-primary-600">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div 
          className="bg-white dark:bg-secondary-800 py-8 px-4 shadow sm:rounded-lg sm:px-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                  1
                </div>
                <div className={`ml-2 text-sm font-medium ${step >= 1 ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>Account</div>
              </div>
              <div className={`flex-1 h-0.5 mx-4 ${step >= 2 ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                  2
                </div>
                <div className={`ml-2 text-sm font-medium ${step >= 2 ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>Profile</div>
              </div>
              <div className={`flex-1 h-0.5 mx-4 ${step >= 3 ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                  3
                </div>
                <div className={`ml-2 text-sm font-medium ${step >= 3 ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>Complete</div>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={step === 3 ? handleSubmit : (e) => e.preventDefault()}>
            {/* Step 1: Account Information */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Full Name
                  </label>
                  <div className="mt-1">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary dark:bg-secondary-700 dark:text-white sm:text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary dark:bg-secondary-700 dark:text-white sm:text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary dark:bg-secondary-700 dark:text-white sm:text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirm Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary dark:bg-secondary-700 dark:text-white sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 2: Trading Profile */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="tradingExperience" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Trading Experience
                  </label>
                  <div className="mt-1">
                    <select
                      id="tradingExperience"
                      name="tradingExperience"
                      required
                      value={formData.tradingExperience}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary dark:bg-secondary-700 dark:text-white sm:text-sm"
                    >
                      <option value="beginner">Beginner (0-1 years)</option>
                      <option value="intermediate">Intermediate (1-3 years)</option>
                      <option value="advanced">Advanced (3-5 years)</option>
                      <option value="expert">Expert (5+ years)</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="riskTolerance" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Risk Tolerance
                  </label>
                  <div className="mt-1">
                    <select
                      id="riskTolerance"
                      name="riskTolerance"
                      required
                      value={formData.riskTolerance}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary dark:bg-secondary-700 dark:text-white sm:text-sm"
                    >
                      <option value="conservative">Conservative</option>
                      <option value="moderate">Moderate</option>
                      <option value="aggressive">Aggressive</option>
                      <option value="very_aggressive">Very Aggressive</option>
                    </select>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-secondary-700 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    What are your primary trading goals?
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        id="goal-income"
                        name="goal-income"
                        type="checkbox"
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-700 rounded"
                      />
                      <label htmlFor="goal-income" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        Generate income
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="goal-growth"
                        name="goal-growth"
                        type="checkbox"
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-700 rounded"
                      />
                      <label htmlFor="goal-growth" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        Long-term growth
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="goal-trading"
                        name="goal-trading"
                        type="checkbox"
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-700 rounded"
                      />
                      <label htmlFor="goal-trading" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        Active trading
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="goal-speculation"
                        name="goal-speculation"
                        type="checkbox"
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-700 rounded"
                      />
                      <label htmlFor="goal-speculation" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        Speculation
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 3: Terms and Completion */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-secondary-700 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Terms and Conditions
                  </h3>
                  <div className="h-40 overflow-y-auto p-2 text-xs text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded mb-4">
                    <p className="mb-2">
                      By creating an account, you agree to the following terms and conditions:
                    </p>
                    <p className="mb-2">
                      1. StockPulse is a platform for stock analysis and trading information. We do not provide financial advice.
                    </p>
                    <p className="mb-2">
                      2. All investment decisions are made at your own risk. Past performance is not indicative of future results.
                    </p>
                    <p className="mb-2">
                      3. Your personal information will be handled in accordance with our Privacy Policy.
                    </p>
                    <p className="mb-2">
                      4. You are responsible for maintaining the confidentiality of your account credentials.
                    </p>
                    <p>
                      5. StockPulse reserves the right to modify, suspend, or terminate services at any time.
                    </p>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="termsAccepted"
                      name="termsAccepted"
                      type="checkbox"
                      required
                      checked={formData.termsAccepted}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-700 rounded"
                    />
                    <label htmlFor="termsAccepted" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      I agree to the terms and conditions
                    </label>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-secondary-700 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Preferences
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        id="email-updates"
                        name="email-updates"
                        type="checkbox"
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-700 rounded"
                      />
                      <label htmlFor="email-updates" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        Receive platform updates and news
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="email-alerts"
                        name="email-alerts"
                        type="checkbox"
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-700 rounded"
                      />
                      <label htmlFor="email-alerts" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        Receive price alerts and notifications
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-6 flex justify-between">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-secondary-700 hover:bg-gray-50 dark:hover:bg-secondary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Back
                </button>
              )}
              
              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
