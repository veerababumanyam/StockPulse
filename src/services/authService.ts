/**
 * Authentication Service
 * Handles API communication for authentication with MCP Auth Server
 * Adapted to work with MCP protocol while maintaining REST interface
 */
import axios, { AxiosError } from 'axios';
import { LoginCredentials, LoginResponse, User, RegisterCredentials } from '../types/auth';

// API Client Configuration - Updated for MCP Auth Server
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_MCP_AUTH_URL || 'http://localhost:8002',
  withCredentials: true, // Essential for HttpOnly cookies
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// CSRF Token Management
let csrfToken: string | null = null;

class AuthService {
  /**
   * Set CSRF token for future requests
   */
  setCsrfToken(token: string): void {
    csrfToken = token;
  }

  /**
   * Clear CSRF token
   */
  clearCsrfToken(): void {
    csrfToken = null;
  }

  /**
   * Get current CSRF token
   */
  getCsrfToken(): string | null {
    return csrfToken;
  }

  /**
   * Login user with email and password via MCP Auth Server
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      // Call MCP auth server using tools/call endpoint
      const response = await apiClient.post('/tools/call', {
        tool: 'authenticate_user',
        parameters: {
          email: credentials.email,
          password: credentials.password
        },
        timestamp: new Date().toISOString()
      });

      // Extract user data from MCP response
      const mcpResult = response.data;
      
      if (!mcpResult.success) {
        throw new Error(mcpResult.error || 'Authentication failed');
      }

      // Transform MCP response to expected LoginResponse format
      const loginResponse: LoginResponse = {
        user: {
          id: mcpResult.user_id,
          email: credentials.email,
          name: mcpResult.email, // Use email as name for now
          createdAt: mcpResult.created_at || new Date().toISOString(),
          lastLogin: new Date().toISOString()
        },
        message: 'Login successful',
        csrf_token: mcpResult.session_token // Use session token as CSRF token
      };

      // Store session token as CSRF token
      if (loginResponse.csrf_token) {
        this.setCsrfToken(loginResponse.csrf_token);
      }
      
      return loginResponse;
    } catch (error) {
      this.handleAuthError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Get current authenticated user information via MCP server
   */
  async getCurrentUser(): Promise<User> {
    try {
      // First validate the current session token
      if (!csrfToken) {
        throw new Error('No active session');
      }

      const response = await apiClient.post('/tools/call', {
        tool: 'validate_token',
        parameters: {
          token: csrfToken
        },
        timestamp: new Date().toISOString()
      });

      const mcpResult = response.data;
      
      if (!mcpResult.success || !mcpResult.valid) {
        throw new Error('Invalid session');
      }

      // Get user profile using the validated user ID
      const profileResponse = await apiClient.post('/tools/call', {
        tool: 'get_user_profile',
        parameters: {
          user_id: mcpResult.user_id
        },
        timestamp: new Date().toISOString()
      });

      const profileResult = profileResponse.data;
      
      if (!profileResult.success) {
        throw new Error('Failed to get user profile');
      }

      // Transform MCP response to User format
      const user: User = {
        id: profileResult.user_id || mcpResult.user_id,
        email: profileResult.email,
        name: profileResult.email, // Use email as name for now
        createdAt: profileResult.created_at || new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };

      return user;
    } catch (error) {
      this.handleAuthError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Logout current user via MCP server
   */
  async logout(): Promise<void> {
    try {
      if (csrfToken) {
        await apiClient.post('/tools/call', {
          tool: 'invalidate_session',
          parameters: {
            session_token: csrfToken
          },
          timestamp: new Date().toISOString()
        });
      }
      this.clearCsrfToken();
    } catch (error) {
      // Don't throw logout errors to prevent UX issues
      console.error('Logout error:', error);
      this.clearCsrfToken();
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<void> {
    try {
      // MCP server handles token refresh automatically
      // Just validate current token
      if (csrfToken) {
        const response = await apiClient.post('/tools/call', {
          tool: 'validate_token',
          parameters: {
            token: csrfToken
          },
          timestamp: new Date().toISOString()
        });

        if (!response.data.success || !response.data.valid) {
          throw new Error('Token refresh failed');
        }
      }
    } catch (error) {
      this.handleAuthError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Register new user via MCP server
   */
  async register(credentials: RegisterCredentials): Promise<LoginResponse> {
    try {
      const response = await apiClient.post('/tools/call', {
        tool: 'create_user',
        parameters: {
          email: credentials.email,
          password: credentials.password,
          name: credentials.name
        },
        timestamp: new Date().toISOString()
      });

      const mcpResult = response.data;
      
      if (!mcpResult.success) {
        throw new Error(mcpResult.error || 'Registration failed');
      }

      // After successful registration, authenticate the user
      return this.login({
        email: credentials.email,
        password: credentials.password
      });
    } catch (error) {
      this.handleAuthError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Get authentication headers including session token
   */
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    
    if (csrfToken) {
      headers['X-Session-Token'] = csrfToken;
    }
    
    return headers;
  }

  /**
   * Handle authentication errors
   */
  private handleAuthError(error: AxiosError): void {
    if (error.response?.status === 401) {
      // Clear session token on authentication failure
      this.clearCsrfToken();
      
      // Dispatch event for AuthContext to handle
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
  }
}

// Request Interceptor - Add session token to MCP requests
apiClient.interceptors.request.use(
  (config) => {
    // Add session token to MCP tool calls that need authentication
    if (config.url === '/tools/call' && csrfToken) {
      // For MCP calls that need authentication, add token to parameters
      if (config.data?.tool && ['get_user_profile', 'update_user_profile', 'invalidate_session'].includes(config.data.tool)) {
        config.data.parameters = config.data.parameters || {};
        config.data.parameters.session_token = csrfToken;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor - Handle MCP authentication errors
apiClient.interceptors.response.use(
  (response) => {
    // Check for MCP-level authentication failures
    if (response.data && !response.data.success && response.data.error?.includes('Invalid token')) {
      csrfToken = null;
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return response;
  },
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear session token
      csrfToken = null;
      
      // Dispatch unauthorized event
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    
    return Promise.reject(error);
  }
);

// Export singleton instance
export const authService = new AuthService();
export default authService; 