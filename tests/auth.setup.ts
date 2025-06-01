import { test as setup, expect } from '@playwright/test';
import path from 'path';

// Authentication files for different user roles
const adminAuthFile = path.join(__dirname, '../playwright/.auth/admin.json');
const userAuthFile = path.join(__dirname, '../playwright/.auth/user.json');
const guestAuthFile = path.join(__dirname, '../playwright/.auth/guest.json');

// Test credentials - these should match your backend test data
const TEST_CREDENTIALS = {
  admin: {
    email: 'admin@sp.com',
    password: 'admin@123'
  },
  user: {
    email: 'user@sp.com', 
    password: 'user@123'
  }
};

setup('authenticate as admin', async ({ page }) => {
  console.log('🔐 Setting up admin authentication...');
  
  // Navigate to login page
  await page.goto('http://localhost:3000/auth/login');
  
  // Wait for page to load
  await expect(page.locator('h1')).toContainText('Welcome back');
  
  // Fill login form
  await page.getByLabel('Email address').fill(TEST_CREDENTIALS.admin.email);
  await page.getByLabel('Password').fill(TEST_CREDENTIALS.admin.password);
  
  // Submit form and wait for navigation
  const responsePromise = page.waitForResponse('**/api/v1/auth/login');
  await page.getByRole('button', { name: 'Sign in' }).click();
  
  // Wait for successful login response
  const response = await responsePromise;
  expect(response.status()).toBe(200);
  
  // Wait for redirect to dashboard
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  
  // Verify we're logged in by checking for user-specific content
  await expect(page.locator('[data-testid="user-menu"]')).toBeVisible({ timeout: 5000 });
  
  // Save authentication state
  await page.context().storageState({ path: adminAuthFile });
  console.log('✅ Admin authentication saved');
});

setup('authenticate as user', async ({ page }) => {
  console.log('🔐 Setting up user authentication...');
  
  // Navigate to login page
  await page.goto('http://localhost:3000/auth/login');
  
  // Wait for page to load
  await expect(page.locator('h1')).toContainText('Welcome back');
  
  // Fill login form
  await page.getByLabel('Email address').fill(TEST_CREDENTIALS.user.email);
  await page.getByLabel('Password').fill(TEST_CREDENTIALS.user.password);
  
  // Submit form and wait for navigation
  const responsePromise = page.waitForResponse('**/api/v1/auth/login');
  await page.getByRole('button', { name: 'Sign in' }).click();
  
  // Wait for successful login response
  const response = await responsePromise;
  expect(response.status()).toBe(200);
  
  // Wait for redirect to dashboard
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  
  // Verify we're logged in
  await expect(page.locator('[data-testid="user-menu"]')).toBeVisible({ timeout: 5000 });
  
  // Save authentication state
  await page.context().storageState({ path: userAuthFile });
  console.log('✅ User authentication saved');
});

setup('setup guest state', async ({ page }) => {
  console.log('👤 Setting up guest (unauthenticated) state...');
  
  // Navigate to landing page to establish session
  await page.goto('http://localhost:3000/');
  
  // Wait for page to load
  await expect(page.locator('h1')).toBeVisible();
  
  // Save unauthenticated state
  await page.context().storageState({ path: guestAuthFile });
  console.log('✅ Guest state saved');
}); 