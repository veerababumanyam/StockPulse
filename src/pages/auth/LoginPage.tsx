/**
 * Enhanced Login Page - Story 1.3 Implementation
 * Demonstrates the improved AuthContext with enhanced error handling,
 * loading states, and user experience improvements.
 */
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { LoginForm } from '../../components/auth/LoginForm';
import { useAuth, useAuthStatus } from '../../contexts/AuthContext';
import { LoginCredentials } from '../../types/auth';

export const LoginPage: React.FC = () => {
  const { login, loading, error, clearError } = useAuth();
  const { isAuthenticated, isLoading } = useAuthStatus();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear any existing errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Handle login form submission
  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      setIsSubmitting(true);
      await login(credentials);
      // Successful login will trigger redirect via Navigate component
    } catch (error) {
      // Error is handled by AuthContext, just stop submitting state
      console.error('Login failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect if already authenticated
  if (isAuthenticated) {
    const from = (location.state as any)?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  // Show loading spinner during initial authentication check
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="text-gray-600">Checking authentication status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <div className="mx-auto h-12 w-12 text-purple-600">
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to StockPulse
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access your trading dashboard and portfolio analytics
          </p>
        </div>

        {/* Session Status Information */}
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Authentication Error
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={clearError}
                    className="text-sm bg-red-50 text-red-800 hover:bg-red-100 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-red-50 rounded-md px-2 py-1 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Login Form */}
        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <LoginForm
            onSubmit={handleLogin}
            isLoading={loading || isSubmitting}
            disabled={loading || isSubmitting}
          />
        </div>

        {/* Development/Test User Information */}
        {process.env.NODE_ENV === 'development' && (
          <div className="rounded-md bg-blue-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Development Mode
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Test credentials:</p>
                  <ul className="list-disc list-inside mt-1">
                    <li>Email: testuser@example.com</li>
                    <li>Password: Password123!</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Authentication Features */}
        <div className="text-center">
          <div className="text-sm text-gray-600">
            <h4 className="font-medium mb-2">Secure Authentication Features:</h4>
            <ul className="space-y-1">
              <li>✅ HttpOnly cookies for secure session management</li>
              <li>✅ Automatic session monitoring and refresh</li>
              <li>✅ CSRF protection enabled</li>
              <li>✅ No sensitive tokens stored in browser</li>
            </ul>
          </div>
        </div>

        {/* Links */}
        <div className="text-center space-y-2">
          <div>
            <a href="#" className="text-sm text-purple-600 hover:text-purple-500">
              Forgot your password?
            </a>
          </div>
          <div className="text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="#" className="text-purple-600 hover:text-purple-500">
              Sign up for StockPulse
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our{' '}
            <a href="#" className="text-purple-600 hover:text-purple-500">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-purple-600 hover:text-purple-500">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}; 