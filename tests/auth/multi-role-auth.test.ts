import { test, expect } from '@playwright/test';

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  apiUrl: 'http://localhost:8000'
};

test.describe('Multi-Role Authentication Tests', () => {
  
  test.describe('Admin Role Tests', () => {
    // Use admin authentication state
    test.use({ storageState: 'playwright/.auth/admin.json' });
    
    test('admin should access dashboard with admin privileges', async ({ page }) => {
      await page.goto(`${TEST_CONFIG.baseUrl}/dashboard`);
      
      // Verify admin is logged in
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      
      // Verify admin-specific content
      await expect(page.locator('text=Admin Panel')).toBeVisible();
      await expect(page.locator('[data-testid="admin-controls"]')).toBeVisible();
      
      // Verify admin can access user management
      await page.getByText('User Management').click();
      await expect(page.locator('text=Manage Users')).toBeVisible();
    });
    
    test('admin should access all trading features', async ({ page }) => {
      await page.goto(`${TEST_CONFIG.baseUrl}/trading`);
      
      // Verify access to all trading modules
      await expect(page.locator('[data-testid="intraday-trading"]')).toBeVisible();
      await expect(page.locator('[data-testid="longterm-trading"]')).toBeVisible();
      await expect(page.locator('[data-testid="options-trading"]')).toBeVisible();
      await expect(page.locator('[data-testid="positional-trading"]')).toBeVisible();
    });
    
    test('admin should access analytics and reports', async ({ page }) => {
      await page.goto(`${TEST_CONFIG.baseUrl}/analytics`);
      
      // Verify admin analytics access
      await expect(page.locator('[data-testid="system-analytics"]')).toBeVisible();
      await expect(page.locator('[data-testid="user-analytics"]')).toBeVisible();
      await expect(page.locator('[data-testid="trading-analytics"]')).toBeVisible();
    });
  });
  
  test.describe('User Role Tests', () => {
    // Use user authentication state
    test.use({ storageState: 'playwright/.auth/user.json' });
    
    test('user should access dashboard with limited privileges', async ({ page }) => {
      await page.goto(`${TEST_CONFIG.baseUrl}/dashboard`);
      
      // Verify user is logged in
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      
      // Verify user dashboard content
      await expect(page.locator('text=Portfolio Overview')).toBeVisible();
      await expect(page.locator('[data-testid="portfolio-summary"]')).toBeVisible();
      
      // Verify admin controls are NOT visible
      await expect(page.locator('[data-testid="admin-controls"]')).not.toBeVisible();
      await expect(page.locator('text=Admin Panel')).not.toBeVisible();
    });
    
    test('user should have limited trading access', async ({ page }) => {
      await page.goto(`${TEST_CONFIG.baseUrl}/trading`);
      
      // Verify basic trading access
      await expect(page.locator('[data-testid="basic-trading"]')).toBeVisible();
      await expect(page.locator('[data-testid="portfolio-view"]')).toBeVisible();
      
      // Verify advanced features are restricted
      await expect(page.locator('[data-testid="advanced-analytics"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="system-controls"]')).not.toBeVisible();
    });
    
    test('user should not access admin routes', async ({ page }) => {
      // Try to access admin route
      await page.goto(`${TEST_CONFIG.baseUrl}/admin`);
      
      // Should be redirected or show access denied
      await expect(page.locator('text=Access Denied')).toBeVisible();
    });
  });
  
  test.describe('Guest (Unauthenticated) Tests', () => {
    // Use guest (no auth) state
    test.use({ storageState: 'playwright/.auth/guest.json' });
    
    test('guest should only access public pages', async ({ page }) => {
      await page.goto(`${TEST_CONFIG.baseUrl}/`);
      
      // Verify public landing page access
      await expect(page.locator('h1')).toContainText('StockPulse');
      await expect(page.locator('text=Sign In')).toBeVisible();
      await expect(page.locator('text=Get Started')).toBeVisible();
    });
    
    test('guest should be redirected from protected routes', async ({ page }) => {
      // Try to access protected dashboard
      await page.goto(`${TEST_CONFIG.baseUrl}/dashboard`);
      
      // Should redirect to login
      await page.waitForURL('**/auth/login');
      await expect(page.locator('h1')).toContainText('Welcome back');
    });
    
    test('guest should access pricing page', async ({ page }) => {
      await page.goto(`${TEST_CONFIG.baseUrl}/auth/pricing`);
      
      // Verify pricing page access
      await expect(page.locator('h1')).toContainText('Choose Your Plan');
      await expect(page.locator('[data-testid="pricing-plans"]')).toBeVisible();
    });
    
    test('guest should access contact page', async ({ page }) => {
      await page.goto(`${TEST_CONFIG.baseUrl}/auth/contact`);
      
      // Verify contact page access
      await expect(page.locator('h1')).toContainText('Contact Us');
      await expect(page.locator('[data-testid="contact-form"]')).toBeVisible();
    });
  });
  
  test.describe('Role Switching Tests', () => {
    
    test('should handle role switching between admin and user', async ({ browser }) => {
      // Create admin context
      const adminContext = await browser.newContext({ 
        storageState: 'playwright/.auth/admin.json' 
      });
      const adminPage = await adminContext.newPage();
      
      // Create user context
      const userContext = await browser.newContext({ 
        storageState: 'playwright/.auth/user.json' 
      });
      const userPage = await userContext.newPage();
      
      // Test admin access
      await adminPage.goto(`${TEST_CONFIG.baseUrl}/dashboard`);
      await expect(adminPage.locator('[data-testid="admin-controls"]')).toBeVisible();
      
      // Test user access simultaneously
      await userPage.goto(`${TEST_CONFIG.baseUrl}/dashboard`);
      await expect(userPage.locator('[data-testid="admin-controls"]')).not.toBeVisible();
      await expect(userPage.locator('[data-testid="portfolio-summary"]')).toBeVisible();
      
      // Cleanup
      await adminContext.close();
      await userContext.close();
    });
    
    test('should maintain separate sessions for different roles', async ({ browser }) => {
      // Create multiple contexts with different auth states
      const adminContext = await browser.newContext({ 
        storageState: 'playwright/.auth/admin.json' 
      });
      const userContext = await browser.newContext({ 
        storageState: 'playwright/.auth/user.json' 
      });
      const guestContext = await browser.newContext({ 
        storageState: 'playwright/.auth/guest.json' 
      });
      
      const adminPage = await adminContext.newPage();
      const userPage = await userContext.newPage();
      const guestPage = await guestContext.newPage();
      
      // Test admin session
      await adminPage.goto(`${TEST_CONFIG.baseUrl}/admin`);
      await expect(adminPage.locator('text=Admin Dashboard')).toBeVisible();
      
      // Test user session
      await userPage.goto(`${TEST_CONFIG.baseUrl}/dashboard`);
      await expect(userPage.locator('[data-testid="portfolio-summary"]')).toBeVisible();
      
      // Test guest session
      await guestPage.goto(`${TEST_CONFIG.baseUrl}/dashboard`);
      await guestPage.waitForURL('**/auth/login');
      
      // Cleanup
      await adminContext.close();
      await userContext.close();
      await guestContext.close();
    });
  });
  
  test.describe('Permission Boundary Tests', () => {
    
    test('admin should access all API endpoints', async ({ page }) => {
      test.use({ storageState: 'playwright/.auth/admin.json' });
      
      await page.goto(`${TEST_CONFIG.baseUrl}/dashboard`);
      
      // Test admin API access
      const response = await page.request.get(`${TEST_CONFIG.apiUrl}/api/v1/admin/users`);
      expect(response.status()).toBe(200);
      
      const systemResponse = await page.request.get(`${TEST_CONFIG.apiUrl}/api/v1/admin/system`);
      expect(systemResponse.status()).toBe(200);
    });
    
    test('user should have restricted API access', async ({ page }) => {
      test.use({ storageState: 'playwright/.auth/user.json' });
      
      await page.goto(`${TEST_CONFIG.baseUrl}/dashboard`);
      
      // Test user API access
      const userResponse = await page.request.get(`${TEST_CONFIG.apiUrl}/api/v1/user/profile`);
      expect(userResponse.status()).toBe(200);
      
      // Test restricted admin API access
      const adminResponse = await page.request.get(`${TEST_CONFIG.apiUrl}/api/v1/admin/users`);
      expect(adminResponse.status()).toBe(403);
    });
    
    test('guest should have no API access to protected endpoints', async ({ page }) => {
      test.use({ storageState: 'playwright/.auth/guest.json' });
      
      // Test unauthenticated API access
      const userResponse = await page.request.get(`${TEST_CONFIG.apiUrl}/api/v1/user/profile`);
      expect(userResponse.status()).toBe(401);
      
      const adminResponse = await page.request.get(`${TEST_CONFIG.apiUrl}/api/v1/admin/users`);
      expect(adminResponse.status()).toBe(401);
    });
  });
  
  test.describe('Session Management Tests', () => {
    
    test('should maintain admin session across page reloads', async ({ page }) => {
      test.use({ storageState: 'playwright/.auth/admin.json' });
      
      await page.goto(`${TEST_CONFIG.baseUrl}/dashboard`);
      await expect(page.locator('[data-testid="admin-controls"]')).toBeVisible();
      
      // Reload page
      await page.reload();
      
      // Verify session persists
      await expect(page.locator('[data-testid="admin-controls"]')).toBeVisible();
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    });
    
    test('should maintain user session across navigation', async ({ page }) => {
      test.use({ storageState: 'playwright/.auth/user.json' });
      
      await page.goto(`${TEST_CONFIG.baseUrl}/dashboard`);
      await expect(page.locator('[data-testid="portfolio-summary"]')).toBeVisible();
      
      // Navigate to different pages
      await page.goto(`${TEST_CONFIG.baseUrl}/trading`);
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      
      await page.goto(`${TEST_CONFIG.baseUrl}/portfolio`);
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    });
    
    test('should handle session timeout gracefully', async ({ page }) => {
      test.use({ storageState: 'playwright/.auth/user.json' });
      
      await page.goto(`${TEST_CONFIG.baseUrl}/dashboard`);
      
      // Mock session timeout by clearing cookies
      await page.context().clearCookies();
      
      // Try to access protected resource
      await page.goto(`${TEST_CONFIG.baseUrl}/portfolio`);
      
      // Should redirect to login
      await page.waitForURL('**/auth/login');
      await expect(page.locator('text=Session expired')).toBeVisible();
    });
  });
}); 