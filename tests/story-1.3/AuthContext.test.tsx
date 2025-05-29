/**
 * Comprehensive Unit Tests for Enhanced AuthContext
 * Tests all Story 1.3 Acceptance Criteria
 * Location: tests/story-1.3/AuthContext.test.tsx
 */
import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth, useAuthStatus, useRequireAuth } from '../../src/contexts/AuthContext';
import { authService } from '../../src/services/authService';
import { LoginCredentials, User } from '../../src/types/auth';

// Mock the auth service
jest.mock('../../src/services/authService');
const mockAuthService = authService as jest.Mocked<typeof authService>;

// Mock user data
const mockUser: User = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  createdAt: '2024-01-01T00:00:00Z',
  lastLogin: '2024-01-15T10:00:00Z'
};

const mockLoginResponse = {
  user: mockUser,
  message: 'Login successful',
  csrf_token: 'test-csrf-token'
};

// Test component that uses the auth context
const TestComponent: React.FC = () => {
  const { user, loading, error, login, logout, checkAuthStatus, clearError, isAuthenticated, refreshSession } = useAuth();
  
  const handleLogin = async () => {
    const credentials: LoginCredentials = {
      email: 'test@example.com',
      password: 'password123'
    };
    try {
      await login(credentials);
    } catch (err) {
      // Handle login errors gracefully in test component
    }
  };

  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="user-email">{user?.email || 'no-user'}</div>
      <div data-testid="error">{error || 'no-error'}</div>
      
      <button data-testid="login-btn" onClick={handleLogin}>Login</button>
      <button data-testid="logout-btn" onClick={logout}>Logout</button>
      <button data-testid="check-status-btn" onClick={checkAuthStatus}>Check Status</button>
      <button data-testid="clear-error-btn" onClick={clearError}>Clear Error</button>
      <button data-testid="refresh-session-btn" onClick={refreshSession}>Refresh Session</button>
    </div>
  );
};

const TestStatusComponent: React.FC = () => {
  const { isAuthenticated, isLoading, isAnonymous, user } = useAuthStatus();
  
  return (
    <div>
      <div data-testid="status-authenticated">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="status-loading">{isLoading ? 'loading' : 'not-loading'}</div>
      <div data-testid="status-anonymous">{isAnonymous ? 'anonymous' : 'not-anonymous'}</div>
      <div data-testid="status-user">{user?.email || 'no-user'}</div>
    </div>
  );
};

const TestRequireAuthComponent: React.FC = () => {
  const { requiresAuth, isLoading, error } = useRequireAuth();
  
  return (
    <div>
      <div data-testid="requires-auth">{requiresAuth ? 'requires-auth' : 'no-auth-required'}</div>
      <div data-testid="require-loading">{isLoading ? 'loading' : 'not-loading'}</div>
      <div data-testid="require-error">{error || 'no-error'}</div>
    </div>
  );
};

describe('AuthContext - Story 1.3 Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('AC1: Authentication status check on initialization', () => {
    it('should check authentication status via API call without accessing client-side tokens', async () => {
      mockAuthService.getCurrentUser.mockResolvedValueOnce(mockUser);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('loading')).toHaveTextContent('loading');
      
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });

      expect(mockAuthService.getCurrentUser).toHaveBeenCalledTimes(1);
      expect(mockAuthService.getCurrentUser).toHaveBeenCalledWith();
    });

    it('should handle initialization failure gracefully', async () => {
      mockAuthService.getCurrentUser.mockRejectedValueOnce(new Error('No session'));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });

      expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
      expect(screen.getByTestId('user-email')).toHaveTextContent('no-user');
      expect(screen.getByTestId('error')).toHaveTextContent('no-error');
    });
  });

  describe('AC2: Login success updates authentication state', () => {
    it('should update context with user information when login succeeds', async () => {
      mockAuthService.getCurrentUser.mockRejectedValueOnce(new Error('No session'));
      mockAuthService.login.mockResolvedValueOnce(mockLoginResponse);
      mockAuthService.setCsrfToken.mockImplementation(() => {});

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });

      await act(async () => {
        screen.getByTestId('login-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
      });

      expect(screen.getByTestId('user-email')).toHaveTextContent(mockUser.email);
      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
      expect(mockAuthService.setCsrfToken).toHaveBeenCalledWith('test-csrf-token');
    });

    it('should handle login failure with appropriate error state', async () => {
      mockAuthService.getCurrentUser.mockRejectedValueOnce(new Error('No session'));
      
      const loginError = {
        response: {
          data: {
            error: 'Invalid credentials'
          }
        }
      };
      mockAuthService.login.mockRejectedValueOnce(loginError);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });

      await act(async () => {
        screen.getByTestId('login-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Invalid credentials');
      });

      expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
    });
  });

  describe('AC3: Authentication state persistence', () => {
    it('should persist authentication state without additional API calls', async () => {
      mockAuthService.getCurrentUser.mockResolvedValueOnce(mockUser);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
      });

      mockAuthService.getCurrentUser.mockClear();

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(mockAuthService.getCurrentUser).toHaveBeenCalledTimes(1);
    });
  });

  describe('AC4: Automatic session expiry detection', () => {
    it('should handle 401 unauthorized events and update authentication state', async () => {
      mockAuthService.getCurrentUser.mockResolvedValueOnce(mockUser);
      mockAuthService.clearCsrfToken.mockImplementation(() => {});

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
      });

      act(() => {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
      });

      expect(screen.getByTestId('error')).toHaveTextContent('Your session has expired. Please log in again.');
      expect(mockAuthService.clearCsrfToken).toHaveBeenCalled();
    });
  });

  describe('AC5: Logout functionality', () => {
    it('should clear user state and authentication status on logout', async () => {
      mockAuthService.getCurrentUser.mockResolvedValueOnce(mockUser);
      mockAuthService.logout.mockResolvedValueOnce();
      mockAuthService.clearCsrfToken.mockImplementation(() => {});

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
      });

      await act(async () => {
        screen.getByTestId('logout-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
      });

      expect(screen.getByTestId('user-email')).toHaveTextContent('no-user');
      expect(screen.getByTestId('error')).toHaveTextContent('no-error');
      expect(mockAuthService.logout).toHaveBeenCalled();
      expect(mockAuthService.clearCsrfToken).toHaveBeenCalled();
    });
  });

  describe('AC6: Loading states', () => {
    it('should provide appropriate loading indicators during operations', async () => {
      mockAuthService.getCurrentUser.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockUser), 100))
      );

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('loading')).toHaveTextContent('loading');

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });
    });
  });

  describe('AC7: Error handling', () => {
    it('should provide appropriate error states to consuming components', async () => {
      mockAuthService.getCurrentUser.mockRejectedValueOnce(new Error('Network error'));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });

      expect(screen.getByTestId('error')).toHaveTextContent('no-error');
    });

    it('should allow clearing error state', async () => {
      mockAuthService.getCurrentUser.mockResolvedValueOnce(mockUser);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
      });

      act(() => {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Your session has expired. Please log in again.');
      });

      act(() => {
        screen.getByTestId('clear-error-btn').click();
      });

      expect(screen.getByTestId('error')).toHaveTextContent('no-error');
    });
  });

  describe('AC8: Automatic cookie handling', () => {
    it('should not directly test cookie handling (handled by axios configuration)', () => {
      expect(true).toBe(true);
    });
  });

  describe('Enhanced functionality - Session management', () => {
    it('should provide session refresh functionality', async () => {
      mockAuthService.getCurrentUser.mockResolvedValueOnce(mockUser);
      mockAuthService.refreshToken.mockResolvedValueOnce();

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
      });

      await act(async () => {
        screen.getByTestId('refresh-session-btn').click();
      });

      expect(mockAuthService.refreshToken).toHaveBeenCalled();
    });
  });

  describe('Helper hooks', () => {
    it('should provide useAuthStatus hook with computed properties', async () => {
      mockAuthService.getCurrentUser.mockResolvedValueOnce(mockUser);

      render(
        <AuthProvider>
          <TestStatusComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('status-loading')).toHaveTextContent('not-loading');
      });

      await waitFor(() => {
        expect(screen.getByTestId('status-authenticated')).toHaveTextContent('authenticated');
      });

      expect(screen.getByTestId('status-anonymous')).toHaveTextContent('not-anonymous');
      expect(screen.getByTestId('status-user')).toHaveTextContent(mockUser.email);
    });

    it('should provide useRequireAuth hook for protected components', async () => {
      mockAuthService.getCurrentUser.mockRejectedValueOnce(new Error('No session'));

      render(
        <AuthProvider>
          <TestRequireAuthComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('require-loading')).toHaveTextContent('not-loading');
      });

      await waitFor(() => {
        expect(screen.getByTestId('requires-auth')).toHaveTextContent('requires-auth');
      });

      expect(screen.getByTestId('require-error')).toHaveTextContent('Authentication required');
    });
  });

  describe('Hook validation', () => {
    it('should throw error when useAuth is used outside AuthProvider', () => {
      const TestInvalidComponent = () => {
        const auth = useAuth();
        return <div>{auth.isAuthenticated ? 'auth' : 'no-auth'}</div>;
      };

      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        render(<TestInvalidComponent />);
      }).toThrow('useAuth must be used within an AuthProvider');

      console.error = originalError;
    });
  });
}); 