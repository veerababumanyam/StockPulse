/**
 * Protected Route Component
 * Ensures only authenticated users can access protected routes
 * Story 1.5: Authentication Security Hardening
 */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
}) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Development mode bypass for testing
  const isDevelopment = import.meta.env.MODE === 'development';
  const bypassAuth =
    isDevelopment && localStorage.getItem('dev-bypass-auth') === 'true';

  if (bypassAuth) {
    return <>{children}</>;
  }

  // Show loading state while authentication status is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-secondary-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Verifying authentication...
          </p>
          {isDevelopment && (
            <div className="text-center text-xs text-gray-500 mt-4">
              <p>Development Mode: To bypass auth for testing,</p>
              <button
                onClick={() => {
                  localStorage.setItem('dev-bypass-auth', 'true');
                  window.location.reload();
                }}
                className="underline text-blue-500 hover:text-blue-700"
              >
                Click here to bypass authentication
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    // Save the attempted location so we can redirect back after login
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Check admin requirement if specified
  if (requireAdmin && !user.role?.includes('ADMIN')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-secondary-900">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20">
            <svg
              className="h-6 w-6 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            Access Denied
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            You do not have permission to access this page.
          </p>
          <div className="mt-6">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated and authorized
  return <>{children}</>;
};

export default ProtectedRoute;
