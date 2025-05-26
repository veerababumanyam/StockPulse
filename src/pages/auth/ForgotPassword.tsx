import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import Logo from '@components/ui/Logo';
import { motion } from 'framer-motion';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState(false);
  
  const { forgotPassword } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);
    
    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError('Failed to send password reset email. Please try again.');
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
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div 
          className="bg-white dark:bg-secondary-800 py-8 px-4 shadow sm:rounded-lg sm:px-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {success ? (
            <div className="text-center">
              <div className="mb-4 bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 p-3 rounded-md text-sm">
                Password reset email sent! Check your inbox for further instructions.
              </div>
              <Link to="/auth/login" className="text-primary hover:text-primary-600">
                Return to login
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary dark:bg-secondary-700 dark:text-white sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Sending...' : 'Send reset link'}
                </button>
              </div>
              
              <div className="text-center">
                <Link to="/auth/login" className="text-sm text-primary hover:text-primary-600">
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;
