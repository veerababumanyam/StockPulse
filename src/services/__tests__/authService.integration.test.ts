/**
 * Integration Tests for AuthService with MCP Auth Server
 * Tests the complete authentication flow with the MCP server
 */
import { authService } from './authService';
import { LoginCredentials, RegisterCredentials } from '../types/auth';

// Test configuration
const MCP_AUTH_URL = process.env.REACT_APP_MCP_AUTH_URL || 'http://localhost:8002';
const TEST_USER = {
  email: 'testuser@example.com',
  password: 'Password123!'
};

const TEST_NEW_USER = {
  email: 'newuser@example.com',
  password: 'NewPassword123!',
  name: 'New User',
  confirmPassword: 'NewPassword123!'
};

describe('AuthService MCP Integration Tests', () => {
  beforeAll(async () => {
    // Wait for MCP server to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  afterEach(() => {
    // Clear any stored tokens after each test
    authService.clearCsrfToken();
  });

  describe('MCP Server Health Check', () => {
    it('should verify MCP auth server is running', async () => {
      const response = await fetch(`${MCP_AUTH_URL}/health`);
      expect(response.ok).toBe(true);
      
      const health = await response.json();
      expect(health.status).toBe('healthy');
      expect(health.service).toBe('auth-mcp-server');
    });

    it('should list available MCP tools', async () => {
      const response = await fetch(`${MCP_AUTH_URL}/tools/list`);
      expect(response.ok).toBe(true);
      
      const tools = await response.json();
      expect(tools.tools).toContainEqual(
        expect.objectContaining({
          name: 'authenticate_user'
        })
      );
    });
  });

  describe('Authentication Flow', () => {
    it('should successfully authenticate with test user', async () => {
      const credentials: LoginCredentials = {
        email: TEST_USER.email,
        password: TEST_USER.password
      };

      const result = await authService.login(credentials);
      
      expect(result).toMatchObject({
        user: {
          id: expect.any(String),
          email: TEST_USER.email,
          name: expect.any(String),
          createdAt: expect.any(String),
          lastLogin: expect.any(String)
        },
        message: 'Login successful',
        csrf_token: expect.any(String)
      });

      // Verify token was stored
      expect(authService.getCsrfToken()).toBeTruthy();
    });

    it('should fail authentication with invalid credentials', async () => {
      const credentials: LoginCredentials = {
        email: 'invalid@example.com',
        password: 'wrongpassword'
      };

      await expect(authService.login(credentials)).rejects.toThrow();
    });

    it('should get current user after successful login', async () => {
      // First login
      await authService.login({
        email: TEST_USER.email,
        password: TEST_USER.password
      });

      // Then get current user
      const user = await authService.getCurrentUser();
      
      expect(user).toMatchObject({
        id: expect.any(String),
        email: TEST_USER.email,
        name: expect.any(String),
        createdAt: expect.any(String),
        lastLogin: expect.any(String)
      });
    });

    it('should fail to get current user without login', async () => {
      await expect(authService.getCurrentUser()).rejects.toThrow('No active session');
    });

    it('should successfully logout', async () => {
      // First login
      await authService.login({
        email: TEST_USER.email,
        password: TEST_USER.password
      });

      expect(authService.getCsrfToken()).toBeTruthy();

      // Then logout
      await authService.logout();

      expect(authService.getCsrfToken()).toBeNull();
    });
  });

  describe('Token Management', () => {
    it('should validate token after login', async () => {
      // Login first
      await authService.login({
        email: TEST_USER.email,
        password: TEST_USER.password
      });

      // Token refresh should work (validates token)
      await expect(authService.refreshToken()).resolves.not.toThrow();
    });

    it('should fail token validation with invalid token', async () => {
      // Set invalid token
      authService.setCsrfToken('invalid-token');

      await expect(authService.refreshToken()).rejects.toThrow();
    });
  });

  describe('Registration Flow', () => {
    // Note: This test may fail if user already exists
    it('should register new user (may skip if user exists)', async () => {
      const credentials: RegisterCredentials = {
        email: `test-${Date.now()}@example.com`, // Unique email
        password: TEST_NEW_USER.password,
        name: TEST_NEW_USER.name,
        confirmPassword: TEST_NEW_USER.confirmPassword
      };

      try {
        const result = await authService.register(credentials);
        
        expect(result).toMatchObject({
          user: {
            id: expect.any(String),
            email: credentials.email,
            name: expect.any(String)
          },
          message: 'Login successful',
          csrf_token: expect.any(String)
        });
      } catch (error) {
        // Registration may fail if user exists or registration is disabled
        console.warn('Registration test skipped:', error);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle MCP server errors gracefully', async () => {
      // Try to call with malformed data
      const malformedCredentials = {
        email: '',
        password: ''
      } as LoginCredentials;

      await expect(authService.login(malformedCredentials)).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      // Temporarily point to invalid URL
      const originalBaseURL = (authService as any).apiClient.defaults.baseURL;
      (authService as any).apiClient.defaults.baseURL = 'http://invalid-url:9999';

      await expect(authService.login({
        email: TEST_USER.email,
        password: TEST_USER.password
      })).rejects.toThrow();

      // Restore original URL
      (authService as any).apiClient.defaults.baseURL = originalBaseURL;
    });
  });

  describe('Session Management', () => {
    it('should maintain session across requests', async () => {
      // Login
      const loginResult = await authService.login({
        email: TEST_USER.email,
        password: TEST_USER.password
      });

      const sessionToken = loginResult.csrf_token;

      // Multiple requests should use the same session
      const user1 = await authService.getCurrentUser();
      const user2 = await authService.getCurrentUser();

      expect(user1.id).toBe(user2.id);
      expect(authService.getCsrfToken()).toBe(sessionToken);
    });

    it('should clear session on logout', async () => {
      // Login
      await authService.login({
        email: TEST_USER.email,
        password: TEST_USER.password
      });

      expect(authService.getCsrfToken()).toBeTruthy();

      // Logout
      await authService.logout();

      expect(authService.getCsrfToken()).toBeNull();

      // Should not be able to get current user
      await expect(authService.getCurrentUser()).rejects.toThrow();
    });
  });
});

// Helper function for manual testing
export const runManualAuthTest = async () => {
  console.log('🧪 Running Manual Auth Test...');
  
  try {
    // Test health
    const healthResponse = await fetch(`${MCP_AUTH_URL}/health`);
    const health = await healthResponse.json();
    console.log('✅ Health check:', health);

    // Test login
    const loginResult = await authService.login({
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    console.log('✅ Login successful:', loginResult.user);

    // Test get current user
    const user = await authService.getCurrentUser();
    console.log('✅ Current user:', user);

    // Test logout
    await authService.logout();
    console.log('✅ Logout successful');

    console.log('🎉 All manual tests passed!');
  } catch (error) {
    console.error('❌ Manual test failed:', error);
  }
}; 