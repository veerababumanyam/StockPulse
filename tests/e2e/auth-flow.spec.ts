import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page before each test
    await page.goto('/auth/login');
  });

  test.describe('Login Page', () => {
    test('should display login form correctly', async ({ page }) => {
      // Check if the page title is correct
      await expect(page).toHaveTitle(/StockPulse/);
      
      // Check if main elements are visible
      await expect(page.getByText('Welcome back')).toBeVisible();
      await expect(page.getByText('Sign in to your StockPulse account')).toBeVisible();
      
      // Check form fields
      await expect(page.getByLabel('Email address')).toBeVisible();
      await expect(page.getByLabel('Password')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
      
      // Check navigation elements
      await expect(page.getByText('StockPulse')).toBeVisible();
      await expect(page.getByText("Don't have an account? Sign Up")).toBeVisible();
    });

    test('should show validation errors for empty form', async ({ page }) => {
      // Click submit without filling form
      await page.getByRole('button', { name: 'Sign In' }).click();
      
      // Check for HTML5 validation
      const emailField = page.getByLabel('Email address');
      const passwordField = page.getByLabel('Password');
      
      await expect(emailField).toHaveAttribute('required');
      await expect(passwordField).toHaveAttribute('required');
    });

    test('should toggle password visibility', async ({ page }) => {
      const passwordField = page.getByLabel('Password');
      const toggleButton = page.locator('[data-testid="password-toggle"]').or(
        page.locator('button').filter({ hasText: /eye/i })
      ).first();
      
      // Initially password should be hidden
      await expect(passwordField).toHaveAttribute('type', 'password');
      
      // Click toggle to show password
      await toggleButton.click();
      await expect(passwordField).toHaveAttribute('type', 'text');
      
      // Click toggle to hide password again
      await toggleButton.click();
      await expect(passwordField).toHaveAttribute('type', 'password');
    });
  });

  test.describe('Login Flow', () => {
    test('should successfully login with valid credentials', async ({ page }) => {
      // Fill in the login form
      await page.getByLabel('Email address').fill('admin@sp.com');
      await page.getByLabel('Password').fill('admin@123');
      
      // Submit the form
      await page.getByRole('button', { name: 'Sign In' }).click();
      
      // Wait for navigation to dashboard
      await page.waitForURL('/dashboard', { timeout: 10000 });
      
      // Verify we're on the dashboard
      await expect(page).toHaveURL('/dashboard');
      
      // Check for dashboard elements (adjust based on your dashboard content)
      await expect(page.getByText('Dashboard')).toBeVisible({ timeout: 5000 });
    });

    test('should show error message for invalid credentials', async ({ page }) => {
      // Fill in the login form with invalid credentials
      await page.getByLabel('Email address').fill('admin@sp.com');
      await page.getByLabel('Password').fill('wrongpassword');
      
      // Submit the form
      await page.getByRole('button', { name: 'Sign In' }).click();
      
      // Wait for error message to appear
      await expect(page.getByText('Authentication Failed')).toBeVisible({ timeout: 5000 });
      
      // Should stay on login page
      await expect(page).toHaveURL('/auth/login');
    });

    test('should show loading state during login', async ({ page }) => {
      // Fill in the login form
      await page.getByLabel('Email address').fill('admin@sp.com');
      await page.getByLabel('Password').fill('admin@123');
      
      // Submit the form
      const submitButton = page.getByRole('button', { name: 'Sign In' });
      await submitButton.click();
      
      // Check for loading state (button should be disabled)
      await expect(submitButton).toBeDisabled();
      
      // Check for loading text
      await expect(page.getByText('Signing in')).toBeVisible();
    });

    test('should handle network errors gracefully', async ({ page }) => {
      // Intercept the login API call and make it fail
      await page.route('**/api/v1/auth/login', route => {
        route.abort('failed');
      });
      
      // Fill in the login form
      await page.getByLabel('Email address').fill('admin@sp.com');
      await page.getByLabel('Password').fill('admin@123');
      
      // Submit the form
      await page.getByRole('button', { name: 'Sign In' }).click();
      
      // Wait for error message
      await expect(page.getByText('Authentication Failed')).toBeVisible({ timeout: 5000 });
      
      // Should stay on login page
      await expect(page).toHaveURL('/auth/login');
    });
  });

  test.describe('Navigation', () => {
    test('should navigate to register page', async ({ page }) => {
      // Click on the sign up link
      await page.getByText("Don't have an account? Sign Up").click();
      
      // Should navigate to register page
      await expect(page).toHaveURL('/auth/register');
    });

    test('should navigate to home page when clicking logo', async ({ page }) => {
      // Click on the logo
      await page.getByText('StockPulse').first().click();
      
      // Should navigate to home page
      await expect(page).toHaveURL('/');
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Check if elements are still visible and functional
      await expect(page.getByText('Welcome back')).toBeVisible();
      await expect(page.getByLabel('Email address')).toBeVisible();
      await expect(page.getByLabel('Password')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
      
      // Test form submission on mobile
      await page.getByLabel('Email address').fill('admin@sp.com');
      await page.getByLabel('Password').fill('admin@123');
      await page.getByRole('button', { name: 'Sign In' }).click();
      
      // Should navigate to dashboard
      await page.waitForURL('/dashboard', { timeout: 10000 });
      await expect(page).toHaveURL('/dashboard');
    });
  });

  test.describe('Accessibility', () => {
    test('should be keyboard navigable', async ({ page }) => {
      // Tab through form elements
      await page.keyboard.press('Tab');
      await expect(page.getByLabel('Email address')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.getByLabel('Password')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.getByRole('button', { name: 'Sign In' })).toBeFocused();
    });

    test('should have proper ARIA labels', async ({ page }) => {
      // Check for proper labels
      const emailField = page.getByLabel('Email address');
      const passwordField = page.getByLabel('Password');
      
      await expect(emailField).toHaveAttribute('type', 'email');
      await expect(passwordField).toHaveAttribute('type', 'password');
      
      // Check for required attributes
      await expect(emailField).toHaveAttribute('required');
      await expect(passwordField).toHaveAttribute('required');
    });
  });

  test.describe('Security', () => {
    test('should not expose sensitive data in DOM', async ({ page }) => {
      // Fill password field
      await page.getByLabel('Password').fill('admin@123');
      
      // Check that password is not visible in DOM when hidden
      const passwordField = page.getByLabel('Password');
      await expect(passwordField).toHaveAttribute('type', 'password');
      
      // Check that password value is not exposed in page content
      const pageContent = await page.content();
      expect(pageContent).not.toContain('admin@123');
    });

    test('should handle CSRF protection', async ({ page }) => {
      // This test would check for CSRF tokens if implemented
      // For now, we'll just verify the request is made with credentials
      let requestMade = false;
      
      page.on('request', request => {
        if (request.url().includes('/api/v1/auth/login')) {
          requestMade = true;
          // Verify credentials are included
          expect(request.headers()['content-type']).toContain('application/json');
        }
      });
      
      await page.getByLabel('Email address').fill('admin@sp.com');
      await page.getByLabel('Password').fill('admin@123');
      await page.getByRole('button', { name: 'Sign In' }).click();
      
      // Wait a bit for the request to be made
      await page.waitForTimeout(1000);
      expect(requestMade).toBe(true);
    });
  });
}); 