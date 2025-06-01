import { test, expect } from '@playwright/test';

// Test configuration for different authentication scenarios
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  apiUrl: 'http://localhost:8000',
  credentials: {
    admin: { email: 'admin@sp.com', password: 'admin@123' },
    user: { email: 'user@sp.com', password: 'user@123' },
    invalid: { email: 'invalid@test.com', password: 'wrongpassword' }
  },
  timeouts: {
    navigation: 10000,
    response: 5000,
    element: 3000
  }
};

test.describe('Complete Authentication Flows', () => {
  
  test.describe('Login Flow - Success Cases', () => {
    
    test('should successfully login with admin credentials', async ({ page }) => {
      // Navigate to login page
      await page.goto(`${TEST_CONFIG.baseUrl}/auth/login`);
      
      // Verify login page loads correctly
      await expect(page.locator('h1')).toContainText('Welcome back');
      await expect(page.getByLabel('Email address')).toBeVisible();
      await expect(page.getByLabel('Password')).toBeVisible();
      
      // Fill credentials
      await page.getByLabel('Email address').fill(TEST_CONFIG.credentials.admin.email);
      await page.getByLabel('Password').fill(TEST_CONFIG.credentials.admin.password);
      
      // Setup response monitoring
      const loginResponsePromise = page.waitForResponse('**/api/v1/auth/login');
      
      // Submit login form
      await page.getByRole('button', { name: 'Sign in' }).click();
      
      // Verify API response
      const loginResponse = await loginResponsePromise;
      expect(loginResponse.status()).toBe(200);
      
      const responseData = await loginResponse.json();
      expect(responseData.user.email).toBe(TEST_CONFIG.credentials.admin.email);
      expect(responseData.user.role).toBe('admin');
      expect(responseData.message).toBe('Login successful');
      
      // Verify redirect to dashboard
      await page.waitForURL('**/dashboard', { timeout: TEST_CONFIG.timeouts.navigation });
      
      // Verify authenticated state
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      
      // Verify admin-specific content is accessible
      await expect(page.locator('text=Dashboard')).toBeVisible();
    });
    
    test('should successfully login with user credentials', async ({ page }) => {
      await page.goto(`${TEST_CONFIG.baseUrl}/auth/login`);
      
      await page.getByLabel('Email address').fill(TEST_CONFIG.credentials.user.email);
      await page.getByLabel('Password').fill(TEST_CONFIG.credentials.user.password);
      
      const loginResponsePromise = page.waitForResponse('**/api/v1/auth/login');
      await page.getByRole('button', { name: 'Sign in' }).click();
      
      const loginResponse = await loginResponsePromise;
      expect(loginResponse.status()).toBe(200);
      
      const responseData = await loginResponse.json();
      expect(responseData.user.email).toBe(TEST_CONFIG.credentials.user.email);
      expect(responseData.user.role).toBe('user');
      
      await page.waitForURL('**/dashboard', { timeout: TEST_CONFIG.timeouts.navigation });
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    });
    
    test('should remember user when "Remember me" is checked', async ({ page }) => {
      await page.goto(`${TEST_CONFIG.baseUrl}/auth/login`);
      
      await page.getByLabel('Email address').fill(TEST_CONFIG.credentials.admin.email);
      await page.getByLabel('Password').fill(TEST_CONFIG.credentials.admin.password);
      await page.getByLabel('Remember me').check();
      
      const loginResponsePromise = page.waitForResponse('**/api/v1/auth/login');
      await page.getByRole('button', { name: 'Sign in' }).click();
      
      await loginResponsePromise;
      await page.waitForURL('**/dashboard');
      
      // Verify persistent session by checking cookies
      const cookies = await page.context().cookies();
      const authCookie = cookies.find(cookie => cookie.name.includes('auth') || cookie.name.includes('session'));
      expect(authCookie).toBeDefined();
    });
  });
  
  test.describe('Login Flow - Error Cases', () => {
    
    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto(`${TEST_CONFIG.baseUrl}/auth/login`);
      
      await page.getByLabel('Email address').fill(TEST_CONFIG.credentials.invalid.email);
      await page.getByLabel('Password').fill(TEST_CONFIG.credentials.invalid.password);
      
      const loginResponsePromise = page.waitForResponse('**/api/v1/auth/login');
      await page.getByRole('button', { name: 'Sign in' }).click();
      
      const loginResponse = await loginResponsePromise;
      expect(loginResponse.status()).toBe(401);
      
      // Verify error message is displayed
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('text=Invalid credentials')).toBeVisible();
      
      // Verify user stays on login page
      expect(page.url()).toContain('/auth/login');
    });
    
    test('should show validation errors for empty form', async ({ page }) => {
      await page.goto(`${TEST_CONFIG.baseUrl}/auth/login`);
      
      // Try to submit empty form
      await page.getByRole('button', { name: 'Sign in' }).click();
      
      // Verify validation errors
      await expect(page.locator('text=Email is required')).toBeVisible();
      await expect(page.locator('text=Password is required')).toBeVisible();
    });
    
    test('should show validation error for invalid email format', async ({ page }) => {
      await page.goto(`${TEST_CONFIG.baseUrl}/auth/login`);
      
      await page.getByLabel('Email address').fill('invalid-email');
      await page.getByLabel('Password').fill('somepassword');
      await page.getByRole('button', { name: 'Sign in' }).click();
      
      await expect(page.locator('text=Please enter a valid email')).toBeVisible();
    });
    
    test('should handle network errors gracefully', async ({ page }) => {
      // Block network requests to simulate network error
      await page.route('**/api/v1/auth/login', route => route.abort());
      
      await page.goto(`${TEST_CONFIG.baseUrl}/auth/login`);
      
      await page.getByLabel('Email address').fill(TEST_CONFIG.credentials.admin.email);
      await page.getByLabel('Password').fill(TEST_CONFIG.credentials.admin.password);
      await page.getByRole('button', { name: 'Sign in' }).click();
      
      // Verify network error handling
      await expect(page.locator('text=Network error')).toBeVisible();
    });
  });
  
  test.describe('Logout Flow', () => {
    
    test('should successfully logout authenticated user', async ({ page }) => {
      // First login
      await page.goto(`${TEST_CONFIG.baseUrl}/auth/login`);
      await page.getByLabel('Email address').fill(TEST_CONFIG.credentials.admin.email);
      await page.getByLabel('Password').fill(TEST_CONFIG.credentials.admin.password);
      
      await page.getByRole('button', { name: 'Sign in' }).click();
      await page.waitForURL('**/dashboard');
      
      // Now logout
      const logoutResponsePromise = page.waitForResponse('**/api/v1/auth/logout');
      await page.getByTestId('user-menu').click();
      await page.getByRole('button', { name: 'Logout' }).click();
      
      const logoutResponse = await logoutResponsePromise;
      expect(logoutResponse.status()).toBe(200);
      
      // Verify redirect to landing page
      await page.waitForURL(TEST_CONFIG.baseUrl);
      
      // Verify user is logged out
      await expect(page.locator('text=Sign In')).toBeVisible();
      await expect(page.locator('[data-testid="user-menu"]')).not.toBeVisible();
    });
    
    test('should clear authentication state on logout', async ({ page }) => {
      // Login first
      await page.goto(`${TEST_CONFIG.baseUrl}/auth/login`);
      await page.getByLabel('Email address').fill(TEST_CONFIG.credentials.admin.email);
      await page.getByLabel('Password').fill(TEST_CONFIG.credentials.admin.password);
      await page.getByRole('button', { name: 'Sign in' }).click();
      await page.waitForURL('**/dashboard');
      
      // Logout
      await page.getByTestId('user-menu').click();
      await page.getByRole('button', { name: 'Logout' }).click();
      await page.waitForURL(TEST_CONFIG.baseUrl);
      
      // Try to access protected route
      await page.goto(`${TEST_CONFIG.baseUrl}/dashboard`);
      
      // Should redirect to login
      await page.waitForURL('**/auth/login');
    });
  });
  
  test.describe('Registration Flow', () => {
    
    test('should navigate to registration page', async ({ page }) => {
      await page.goto(`${TEST_CONFIG.baseUrl}/auth/login`);
      
      await page.getByText('Sign up for free').click();
      await page.waitForURL('**/auth/register');
      
      await expect(page.locator('h1')).toContainText('Create account');
    });
    
    test('should show registration form with all required fields', async ({ page }) => {
      await page.goto(`${TEST_CONFIG.baseUrl}/auth/register`);
      
      await expect(page.getByLabel('Full name')).toBeVisible();
      await expect(page.getByLabel('Email address')).toBeVisible();
      await expect(page.getByLabel('Password')).toBeVisible();
      await expect(page.getByLabel('Confirm password')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible();
    });
  });
  
  test.describe('Password Reset Flow', () => {
    
    test('should navigate to forgot password page', async ({ page }) => {
      await page.goto(`${TEST_CONFIG.baseUrl}/auth/login`);
      
      await page.getByText('Forgot password?').click();
      await page.waitForURL('**/auth/forgot-password');
      
      await expect(page.locator('h1')).toContainText('Reset password');
    });
  });
  
  test.describe('Security Features', () => {
    
    test('should not expose sensitive data in DOM', async ({ page }) => {
      await page.goto(`${TEST_CONFIG.baseUrl}/auth/login`);
      
      await page.getByLabel('Password').fill('secretpassword');
      
      // Check that password is not visible in DOM
      const passwordInput = page.getByLabel('Password');
      await expect(passwordInput).toHaveAttribute('type', 'password');
      
      // Verify password value is not exposed in page content
      const pageContent = await page.content();
      expect(pageContent).not.toContain('secretpassword');
    });
    
    test('should toggle password visibility', async ({ page }) => {
      await page.goto(`${TEST_CONFIG.baseUrl}/auth/login`);
      
      const passwordInput = page.getByLabel('Password');
      const toggleButton = page.getByTestId('password-toggle');
      
      // Initially password should be hidden
      await expect(passwordInput).toHaveAttribute('type', 'password');
      
      // Click toggle to show password
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'text');
      
      // Click toggle to hide password again
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'password');
    });
    
    test('should implement CSRF protection', async ({ page }) => {
      await page.goto(`${TEST_CONFIG.baseUrl}/auth/login`);
      
      await page.getByLabel('Email address').fill(TEST_CONFIG.credentials.admin.email);
      await page.getByLabel('Password').fill(TEST_CONFIG.credentials.admin.password);
      
      const loginResponsePromise = page.waitForResponse('**/api/v1/auth/login');
      await page.getByRole('button', { name: 'Sign in' }).click();
      
      const loginResponse = await loginResponsePromise;
      const responseData = await loginResponse.json();
      
      // Verify CSRF token is included in response
      expect(responseData.csrf_token).toBeDefined();
      expect(typeof responseData.csrf_token).toBe('string');
      expect(responseData.csrf_token.length).toBeGreaterThan(0);
    });
    
    test('should show loading state during login', async ({ page }) => {
      await page.goto(`${TEST_CONFIG.baseUrl}/auth/login`);
      
      await page.getByLabel('Email address').fill(TEST_CONFIG.credentials.admin.email);
      await page.getByLabel('Password').fill(TEST_CONFIG.credentials.admin.password);
      
      // Click submit and immediately check for loading state
      await page.getByRole('button', { name: 'Sign in' }).click();
      
      // Verify loading state is shown
      await expect(page.getByTestId('loading-spinner')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Signing in...' })).toBeVisible();
    });
  });
  
  test.describe('Accessibility', () => {
    
    test('should be keyboard navigable', async ({ page }) => {
      await page.goto(`${TEST_CONFIG.baseUrl}/auth/login`);
      
      // Tab through form elements
      await page.keyboard.press('Tab'); // Email field
      await expect(page.getByLabel('Email address')).toBeFocused();
      
      await page.keyboard.press('Tab'); // Password field
      await expect(page.getByLabel('Password')).toBeFocused();
      
      await page.keyboard.press('Tab'); // Remember me checkbox
      await expect(page.getByLabel('Remember me')).toBeFocused();
      
      await page.keyboard.press('Tab'); // Submit button
      await expect(page.getByRole('button', { name: 'Sign in' })).toBeFocused();
    });
    
    test('should have proper ARIA labels', async ({ page }) => {
      await page.goto(`${TEST_CONFIG.baseUrl}/auth/login`);
      
      // Check ARIA labels
      await expect(page.getByLabel('Email address')).toHaveAttribute('aria-label', 'Email address');
      await expect(page.getByLabel('Password')).toHaveAttribute('aria-label', 'Password');
      await expect(page.getByRole('button', { name: 'Sign in' })).toHaveAttribute('aria-label', 'Sign in to your account');
    });
    
    test('should work on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`${TEST_CONFIG.baseUrl}/auth/login`);
      
      // Verify mobile layout
      await expect(page.locator('form')).toBeVisible();
      await expect(page.getByLabel('Email address')).toBeVisible();
      await expect(page.getByLabel('Password')).toBeVisible();
      
      // Test mobile interaction
      await page.getByLabel('Email address').fill(TEST_CONFIG.credentials.admin.email);
      await page.getByLabel('Password').fill(TEST_CONFIG.credentials.admin.password);
      
      const loginResponsePromise = page.waitForResponse('**/api/v1/auth/login');
      await page.getByRole('button', { name: 'Sign in' }).click();
      
      const loginResponse = await loginResponsePromise;
      expect(loginResponse.status()).toBe(200);
    });
  });
  
  test.describe('Navigation', () => {
    
    test('should navigate to home page when clicking logo', async ({ page }) => {
      await page.goto(`${TEST_CONFIG.baseUrl}/auth/login`);
      
      await page.getByTestId('logo').click();
      await page.waitForURL(TEST_CONFIG.baseUrl);
      
      await expect(page.locator('h1')).toContainText('StockPulse');
    });
    
    test('should navigate to register page', async ({ page }) => {
      await page.goto(`${TEST_CONFIG.baseUrl}/auth/login`);
      
      await page.getByText('Sign up for free').click();
      await page.waitForURL('**/auth/register');
    });
  });
  
  test.describe('API Integration', () => {
    
    test('should handle API rate limiting', async ({ page }) => {
      await page.goto(`${TEST_CONFIG.baseUrl}/auth/login`);
      
      // Simulate multiple rapid login attempts
      for (let i = 0; i < 6; i++) {
        await page.getByLabel('Email address').fill(TEST_CONFIG.credentials.invalid.email);
        await page.getByLabel('Password').fill(TEST_CONFIG.credentials.invalid.password);
        await page.getByRole('button', { name: 'Sign in' }).click();
        
        if (i < 5) {
          await page.waitForResponse('**/api/v1/auth/login');
        }
      }
      
      // Should show rate limit error
      await expect(page.locator('text=Too many attempts')).toBeVisible();
    });
    
    test('should handle server errors gracefully', async ({ page }) => {
      // Mock server error
      await page.route('**/api/v1/auth/login', route => 
        route.fulfill({ status: 500, body: JSON.stringify({ detail: 'Internal server error' }) })
      );
      
      await page.goto(`${TEST_CONFIG.baseUrl}/auth/login`);
      
      await page.getByLabel('Email address').fill(TEST_CONFIG.credentials.admin.email);
      await page.getByLabel('Password').fill(TEST_CONFIG.credentials.admin.password);
      await page.getByRole('button', { name: 'Sign in' }).click();
      
      await expect(page.locator('text=Server error')).toBeVisible();
    });
  });
}); 