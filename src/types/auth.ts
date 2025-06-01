/**
 * Authentication Type Definitions
 * Type-safe interfaces for authentication system
 * Enhanced for Story 1.3: Frontend AuthContext Implementation
 */

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: 'ADMIN' | 'USER' | 'MODERATOR';
  preferences?: UserPreferences;
  createdAt: string;
  lastLogin: string;
}

export interface UserPreferences {
  theme?: 'light' | 'dark';
  tradingPreferences?: {
    riskTolerance: 'low' | 'medium' | 'high';
    preferredSectors: string[];
    tradingStyle: 'conservative' | 'moderate' | 'aggressive';
  };
  notifications?: {
    email: boolean;
    push: boolean;
    priceAlerts: boolean;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  message: string;
  csrf_token: string;
}

/**
 * Enhanced AuthContext interface for Story 1.3
 * Includes comprehensive authentication state management
 */
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<any>;
  forgotPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  clearError: () => void;
  isAuthenticated: boolean;
  refreshSession: () => Promise<void>; // New in Story 1.3
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
}

export interface AuthError {
  message: string;
  field?: string;
  code?: string;
}

export interface SessionInfo {
  expiresAt: string;
  isActive: boolean;
  lastActivity: string;
}

/**
 * Authentication status helper types for enhanced UX
 */
export interface AuthStatusInfo {
  isAuthenticated: boolean;
  isLoading: boolean;
  isAnonymous: boolean;
  user: User | null;
}

export interface RequireAuthInfo {
  requiresAuth: boolean;
  isLoading: boolean;
  error: string | null;
}
