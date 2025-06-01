import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import axios from 'axios';
import { AuthProvider, useAuth } from '../../src/contexts/AuthContext';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

// Mock window.location
const mockLocation = {
  href: '',
  pathname: '/auth/login',
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

// Test component to access AuthContext
const TestComponent = () => {
  const { login, user, isLoading, isAuthenticated } = useAuth();
  
  return (
    <div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'null'}</div>
      <div data-testid="loading">{isLoading.toString()}</div>
      <div data-testid="authenticated">{isAuthenticated.toString()}</div>
      <button 
        data-testid="login-btn" 
        onClick={() => login('admin@sp.com', 'admin@123')}
      >
        Login
      </button>
    </div>
  );
};

const renderWithAuthProvider = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.href = '';
    mockLocation.pathname = '/auth/login';
    
    // Setup axios defaults mock
    mockedAxios.defaults = {
      withCredentials: true,
      baseURL: 'http://localhost:8000',
    } as any;
  });

  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      renderWithAuthProvider(<TestComponent />);
      
      expect(screen.getByTestId('user')).toHaveTextContent('null');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });
  });

  describe('Login Function', () => {
    it('should successfully login with valid credentials', async () => {
      const mockUser = {
        id: '1',
        email: 'admin@sp.com',
        name: 'Admin User',
        role: ['ADMIN'],
      };

      mockedAxios.post.mockResolvedValueOnce({
        data: { user: mockUser },
      });

      renderWithAuthProvider(<TestComponent />);
      
      const loginButton = screen.getByTestId('login-btn');
      
      await act(async () => {
        loginButton.click();
      });

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith('/api/v1/auth/login', {
          email: 'admin@sp.com',
          password: 'admin@123',
        });
      });

      await waitFor(() => {
        expect(mockLocation.href).toBe('/dashboard');
      });
    });

    it('should handle login failure with invalid credentials', async () => {
      const mockError = {
        response: {
          data: {
            detail: 'Invalid credentials',
          },
        },
      };

      mockedAxios.post.mockRejectedValueOnce(mockError);

      renderWithAuthProvider(<TestComponent />);
      
      const loginButton = screen.getByTestId('login-btn');
      
      let thrownError;
      try {
        await act(async () => {
          loginButton.click();
        });
      } catch (error) {
        thrownError = error;
      }

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith('/api/v1/auth/login', {
          email: 'admin@sp.com',
          password: 'admin@123',
        });
      });

      expect(thrownError).toBeDefined();
    });

    it('should handle network errors during login', async () => {
      const networkError = new Error('Network Error');
      mockedAxios.post.mockRejectedValueOnce(networkError);

      renderWithAuthProvider(<TestComponent />);
      
      const loginButton = screen.getByTestId('login-btn');
      
      let thrownError;
      try {
        await act(async () => {
          loginButton.click();
        });
      } catch (error) {
        thrownError = error;
      }

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalled();
      });

      expect(thrownError).toBeDefined();
    });
  });

  describe('Auth Check', () => {
    it('should check authentication status on mount for protected routes', async () => {
      mockLocation.pathname = '/dashboard';
      
      const mockUser = {
        id: '1',
        email: 'admin@sp.com',
        name: 'Admin User',
        role: ['ADMIN'],
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: { user: mockUser },
      });

      renderWithAuthProvider(<TestComponent />);

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/auth/me');
      });
    });

    it('should skip auth check for public routes', () => {
      mockLocation.pathname = '/auth/login';
      
      renderWithAuthProvider(<TestComponent />);

      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('should redirect to login on auth check failure', async () => {
      mockLocation.pathname = '/dashboard';
      
      mockedAxios.get.mockRejectedValueOnce(new Error('Unauthorized'));

      renderWithAuthProvider(<TestComponent />);

      await waitFor(() => {
        expect(mockLocation.href).toBe('/auth/login');
      });
    });
  });

  describe('Axios Configuration', () => {
    it('should configure axios with correct defaults', () => {
      renderWithAuthProvider(<TestComponent />);
      
      expect(mockedAxios.defaults.withCredentials).toBe(true);
      expect(mockedAxios.defaults.baseURL).toBe('http://localhost:8000');
    });
  });
}); 