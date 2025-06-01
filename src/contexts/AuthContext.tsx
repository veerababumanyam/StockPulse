/**
 * Enhanced Authentication Context for StockPulse
 * Manages authentication state without client-side token storage.
 * Uses HttpOnly cookies for secure session management.
 *
 * Story 1.3: Frontend AuthContext Implementation
 */
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  User,
  AuthContextType,
  LoginCredentials,
  RegisterCredentials,
} from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define public routes where initial auth check is not needed
const PUBLIC_ROUTES = [
  '/',
  '/landing',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/about',
  '/features',
  '/pricing',
  '/contact',
];

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Check if current route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    location.pathname === route || location.pathname.startsWith(route)
  );

  // Configure axios defaults
  useEffect(() => {
    axios.defaults.withCredentials = true;
    axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  }, []);

  // Check authentication status on mount and route changes
  useEffect(() => {
    // Skip auth check for public routes
    if (isPublicRoute) {
      setIsLoading(false);
      return;
    }

    checkAuthStatus();
  }, [location.pathname, isPublicRoute]);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/v1/auth/me');
      setUser(response.data.user);
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      // Only redirect if not on a public route
      if (!isPublicRoute && location.pathname !== '/auth/login') {
        navigate('/auth/login', { replace: true });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await axios.post('/api/v1/auth/login', {
        email,
        password,
      });
      
      setUser(response.data.user);
      
      // Use React Router navigation instead of hard redirect
      // Get redirect path from location state or default to dashboard
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error('Login failed:', error);
      throw new Error(error.response?.data?.detail || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      const response = await axios.post('/api/v1/auth/register', {
        email,
        password,
        name,
      });
      
      setUser(response.data.user);
      
      // Use React Router navigation instead of hard redirect
      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      console.error('Registration failed:', error);
      throw new Error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/v1/auth/logout');
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      setUser(null);
      navigate('/', { replace: true });
    }
  };

  const refreshAuth = async () => {
    await checkAuthStatus();
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
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

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

/**
 * Helper hook for authentication status checking
 */
export const useAuthStatus = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  return {
    isAuthenticated,
    isLoading,
    isAnonymous: !isAuthenticated && !isLoading,
    user,
  };
};

/**
 * Helper hook for protected components
 * Returns null during loading, renders children when authenticated
 */
export const useRequireAuth = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return { requiresAuth: true, isLoading: true, error: null };
  }

  if (!isAuthenticated) {
    return {
      requiresAuth: true,
      isLoading: false,
      error: null,
    };
  }

  return { requiresAuth: false, isLoading: false, error: null };
};
