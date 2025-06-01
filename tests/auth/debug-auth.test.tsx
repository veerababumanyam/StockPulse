import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

// Simple test component to debug auth flow
const DebugAuthComponent = () => {
  const { login, user, isLoading, isAuthenticated } = useAuth();
  const [error, setError] = React.useState<string | null>(null);
  
  const handleLogin = async () => {
    try {
      setError(null);
      console.log('🔐 Starting login with admin@sp.com / admin@123');
      await login('admin@sp.com', 'admin@123');
      console.log('✅ Login successful');
    } catch (err: any) {
      console.error('❌ Login failed:', err);
      setError(err.message);
    }
  };
  
  return (
    <div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'null'}</div>
      <div data-testid="loading">{isLoading.toString()}</div>
      <div data-testid="authenticated">{isAuthenticated.toString()}</div>
      <div data-testid="error">{error || 'no error'}</div>
      <button data-testid="login-btn" onClick={handleLogin}>
        Login
      </button>
    </div>
  );
};

describe('Debug Authentication Flow', () => {
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

  it('should debug successful login flow', async () => {
    console.log('🧪 Testing successful login flow...');
    
    const mockUser = {
      id: '1',
      email: 'admin@sp.com',
      name: 'Admin User',
      role: ['ADMIN'],
    };

    // Mock successful login response
    mockedAxios.post.mockResolvedValueOnce({
      data: { user: mockUser },
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <DebugAuthComponent />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Initial state
    expect(screen.getByTestId('user')).toHaveTextContent('null');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('error')).toHaveTextContent('no error');
    
    // Click login button
    const loginButton = screen.getByTestId('login-btn');
    fireEvent.click(loginButton);
    
    // Wait for login to complete
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/v1/auth/login', {
        email: 'admin@sp.com',
        password: 'admin@123',
      });
    });

    // Check if redirect happened
    await waitFor(() => {
      expect(mockLocation.href).toBe('/dashboard');
    });
    
    console.log('✅ Login flow test completed');
  });

  it('should debug failed login flow', async () => {
    console.log('🧪 Testing failed login flow...');
    
    // Mock failed login response
    const mockError = {
      response: {
        data: {
          detail: 'Invalid credentials',
        },
      },
    };
    
    mockedAxios.post.mockRejectedValueOnce(mockError);

    render(
      <BrowserRouter>
        <AuthProvider>
          <DebugAuthComponent />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Click login button
    const loginButton = screen.getByTestId('login-btn');
    fireEvent.click(loginButton);
    
    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Invalid credentials');
    });
    
    // Should not redirect
    expect(mockLocation.href).toBe('');
    
    console.log('✅ Failed login flow test completed');
  });

  it('should debug network error flow', async () => {
    console.log('🧪 Testing network error flow...');
    
    // Mock network error
    const networkError = new Error('Network Error');
    mockedAxios.post.mockRejectedValueOnce(networkError);

    render(
      <BrowserRouter>
        <AuthProvider>
          <DebugAuthComponent />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Click login button
    const loginButton = screen.getByTestId('login-btn');
    fireEvent.click(loginButton);
    
    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Login failed');
    });
    
    // Should not redirect
    expect(mockLocation.href).toBe('');
    
    console.log('✅ Network error flow test completed');
  });
}); 