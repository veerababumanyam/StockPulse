/**
 * Authentication Service
 * Handles API communication for authentication with MCP Auth Server
 * Adapted to work with MCP protocol while maintaining REST interface
 */
import axios, { AxiosError } from "axios";
import {
  LoginCredentials,
  LoginResponse,
  User,
  RegisterCredentials,
} from "../types/auth";
import { API_CONFIG, API_ENDPOINTS, debugApiConfig } from "../config/api";

// API Client Configuration - Updated for MCP Auth Server
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  withCredentials: API_CONFIG.WITH_CREDENTIALS, // Essential for HttpOnly cookies
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.DEFAULT_HEADERS,
});

// Debug configuration on service initialization
debugApiConfig();

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
   * Login user with email and password via FastAPI Auth Server
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      // Call FastAPI auth endpoint using proper API endpoint
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
        email: credentials.email,
        password: credentials.password,
      });

      const loginResponse: LoginResponse = response.data;

      // Store CSRF token if provided
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
   * Get current authenticated user information via FastAPI server
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.AUTH.ME);
      const userData = response.data;

      // Transform FastAPI response to User format
      const user: User = {
        id: userData.id,
        email: userData.email,
        name: userData.email, // Use email as name for now
        role: userData.role, // Include role for authorization
        createdAt: userData.created_at,
        lastLogin: userData.last_login || new Date().toISOString(),
      };

      return user;
    } catch (error) {
      this.handleAuthError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Logout current user via FastAPI server
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
      this.clearCsrfToken();
    } catch (error) {
      // Don't throw logout errors to prevent UX issues
      console.error("Logout error:", error);
      this.clearCsrfToken();
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<void> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH);
      // Token refresh is handled via HTTP-only cookies
      // No need to manually store tokens
    } catch (error) {
      this.handleAuthError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Register new user via FastAPI Auth Server
   * Now creates user in pending approval status
   */
  async register(credentials: RegisterCredentials): Promise<{ 
    message: string; 
    status: string; 
    user_id: string; 
  }> {
    try {
      console.log("🚀 Registration Debug Info:");
      console.log("API Base URL:", apiClient.defaults.baseURL);
      console.log("Full URL:", `${apiClient.defaults.baseURL}${API_ENDPOINTS.AUTH.REGISTER}`);
      console.log("Credentials:", {
        ...credentials,
        password: "[HIDDEN]",
        confirmPassword: "[HIDDEN]",
      });

      // Call FastAPI auth registration endpoint using proper API endpoint
      const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, {
        email: credentials.email,
        password: credentials.password,
        name: credentials.name,
        confirm_password: credentials.confirmPassword,
      });

      console.log("✅ Registration successful (pending approval):", response.data);

      // Return the registration response (no auto-login anymore)
      return response.data;
    } catch (error) {
      console.error("❌ Registration error:", error);
      if (error instanceof AxiosError) {
        console.error("Response data:", error.response?.data);
        console.error("Response status:", error.response?.status);
        console.error("Request URL:", error.config?.url);
        console.error(
          "Full Request URL:",
          `${error.config?.baseURL || apiClient.defaults.baseURL}${error.config?.url}`,
        );
      }
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
      headers["X-Session-Token"] = csrfToken;
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
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }
  }
}

// Request Interceptor - Add session token to MCP requests
apiClient.interceptors.request.use(
  (config) => {
    // Add session token to MCP tool calls that need authentication
    if (config.url === "/tools/call" && csrfToken) {
      // For MCP calls that need authentication, add token to parameters
      if (
        config.data?.tool &&
        [
          "get_user_profile",
          "update_user_profile",
          "invalidate_session",
        ].includes(config.data.tool)
      ) {
        config.data.parameters = config.data.parameters || {};
        config.data.parameters.session_token = csrfToken;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor - Handle MCP authentication errors
apiClient.interceptors.response.use(
  (response) => {
    // Check for MCP-level authentication failures
    if (
      response.data &&
      !response.data.success &&
      response.data.error?.includes("Invalid token")
    ) {
      csrfToken = null;
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }
    return response;
  },
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear session token
      csrfToken = null;

      // Dispatch unauthorized event
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }

    return Promise.reject(error);
  },
);

// Export singleton instance
export const authService = new AuthService();
export default authService;
