/**
 * Enhanced Authentication Context for StockPulse
 * Manages authentication state without client-side token storage.
 * Uses HttpOnly cookies for secure session management.
 * 
 * Story 1.3: Frontend AuthContext Implementation
 */
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { authService } from '../services/authService';
import { User, AuthContextType, LoginCredentials } from '../types/auth';

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const initializationAttempted = useRef<boolean>(false);
  const sessionCheckInterval = useRef<NodeJS.Timeout | null>(null);

  /**
   * AC1: Check authentication status via API call without accessing client-side tokens
   * AC6: Provide appropriate loading indicators
   */
  const checkAuthStatus = useCallback(async () => {
    try {
      setLoading(true);
      const userData = await authService.getCurrentUser();
      setUser(userData);
      setError(null);
      console.log('✅ Authentication status verified:', userData.email);
    } catch (err: any) {
      setUser(null);
      
      // Only set error if user was previously authenticated (session expired)
      if (user !== null) {
        setError('Session expired. Please log in again.');
        console.warn('⚠️ Session expired during status check');
      } else if (initializationAttempted.current) {
        // Silent failure on initial check - user is not authenticated
        console.info('ℹ️ No active session found');
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * AC2: Login function that updates AuthContext with user information
   * AC6: Provide loading states during authentication operations
   * AC7: Handle authentication errors with appropriate error states
   */
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔐 Attempting login for:', credentials.email);
      const response = await authService.login(credentials);
      setUser(response.user);
      
      // Store CSRF token for future requests
      if (response.csrf_token) {
        authService.setCsrfToken(response.csrf_token);
      }
      
      console.log('✅ Login successful for:', response.user.email);
      
      // Start session monitoring after successful login
      startSessionMonitoring();
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.detail || 
                          err.message || 
                          'Login failed. Please try again.';
      setError(errorMessage);
      console.error('❌ Login failed:', errorMessage);
      throw err; // Re-throw for component error handling
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * AC5: Logout function that clears user state and authentication status
   * AC6: Provide loading states during logout operations
   */
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🚪 Logging out user:', user?.email);
      
      await authService.logout();
    } catch (err) {
      // Log error but don't prevent logout UX
      console.error('⚠️ Logout error (non-blocking):', err);
    } finally {
      setUser(null);
      setError(null);
      setLoading(false);
      authService.clearCsrfToken();
      stopSessionMonitoring();
      
      console.log('✅ Logout completed');
    }
  }, [user?.email]);

  /**
   * AC7: Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Start periodic session monitoring for authenticated users
   * AC3: Maintain authentication state without additional API calls until validation needed
   */
  const startSessionMonitoring = useCallback(() => {
    // Clear existing interval
    if (sessionCheckInterval.current) {
      clearInterval(sessionCheckInterval.current);
    }

    // Check session every 15 minutes
    sessionCheckInterval.current = setInterval(() => {
      if (user) {
        console.log('🔍 Performing periodic session check');
        checkAuthStatus();
      }
    }, 15 * 60 * 1000); // 15 minutes
  }, [user, checkAuthStatus]);

  /**
   * Stop session monitoring
   */
  const stopSessionMonitoring = useCallback(() => {
    if (sessionCheckInterval.current) {
      clearInterval(sessionCheckInterval.current);
      sessionCheckInterval.current = null;
    }
  }, []);

  /**
   * AC4: Handle 401 unauthorized events from API interceptor
   * Automatically detect session expiry and update authentication state
   */
  useEffect(() => {
    const handleUnauthorized = () => {
      console.warn('🚨 Unauthorized event received - clearing session');
      setUser(null);
      setError('Your session has expired. Please log in again.');
      authService.clearCsrfToken();
      stopSessionMonitoring();
    };

    // AC8: Listen for unauthorized events from API interceptor
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [stopSessionMonitoring]);

  /**
   * AC1: Initial authentication check on app load
   * Only perform once to avoid infinite loops
   */
  useEffect(() => {
    if (!initializationAttempted.current) {
      initializationAttempted.current = true;
      console.log('🚀 Initializing AuthContext - checking authentication status');
      checkAuthStatus();
    }
  }, [checkAuthStatus]);

  /**
   * Start session monitoring when user becomes authenticated
   */
  useEffect(() => {
    if (user) {
      startSessionMonitoring();
    } else {
      stopSessionMonitoring();
    }

    // Cleanup on unmount
    return () => {
      stopSessionMonitoring();
    };
  }, [user, startSessionMonitoring, stopSessionMonitoring]);

  /**
   * AC2, AC5: Computed authentication status
   */
  const isAuthenticated = user !== null;

  /**
   * Session refresh function for manual session extension
   */
  const refreshSession = useCallback(async () => {
    try {
      await authService.refreshToken();
      console.log('✅ Session refreshed successfully');
    } catch (err) {
      console.error('❌ Session refresh failed:', err);
      // Don't throw - let normal session expiry handling take over
    }
  }, []);

  const contextValue: AuthContextType = {
    user,
    loading,
    error,
    login,
    logout,
    checkAuthStatus,
    clearError,
    isAuthenticated,
    refreshSession, // Enhanced functionality for Story 1.3
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Enhanced useAuth hook with validation
 * Throws error if used outside AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

/**
 * Helper hook for authentication status checking
 */
export const useAuthStatus = () => {
  const { isAuthenticated, loading, user } = useAuth();
  
  return {
    isAuthenticated,
    isLoading: loading,
    isAnonymous: !isAuthenticated && !loading,
    user,
  };
};

/**
 * Helper hook for protected components
 * Returns null during loading, renders children when authenticated
 */
export const useRequireAuth = () => {
  const { isAuthenticated, loading, error } = useAuth();
  
  if (loading) {
    return { requiresAuth: true, isLoading: true, error: null };
  }
  
  if (!isAuthenticated) {
    return { requiresAuth: true, isLoading: false, error: error || 'Authentication required' };
  }
  
  return { requiresAuth: false, isLoading: false, error: null };
};
