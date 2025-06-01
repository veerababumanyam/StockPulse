# Test info

- Name: authenticate as user
- Location: C:\Users\admin\Desktop\StockPulse\tests\auth.setup.ts:53:6

# Error details

```
Error: Timed out 10000ms waiting for expect(locator).toContainText(expected)

Locator: locator('h1')
Expected string: "Welcome back"
Received: <element(s) not found>
Call log:
  - expect.toContainText with timeout 10000ms
  - waiting for locator('h1')

    at C:\Users\admin\Desktop\StockPulse\tests\auth.setup.ts:60:36
```

# Page snapshot

```yaml
- navigation:
  - link "StockPulse":
    - /url: /
    - img
    - text: StockPulse
  - link "Don't have an account? Sign Up":
    - /url: /auth/register
- img
- heading "Welcome back" [level=2]
- paragraph: Sign in to your StockPulse account
- text: Email address
- img
- textbox "Email address"
- text: Password
- img
- textbox "Password"
- button:
  - img
- checkbox "Remember me"
- text: Remember me
- link "Forgot password?":
  - /url: /auth/forgot-password
- button "Sign in":
  - text: Sign in
  - img
- text: Or continue with
- button:
  - img
- button:
  - img
- button:
  - img
- paragraph:
  - text: Don't have an account?
  - link "Sign up for free":
    - /url: /auth/register
```

# Test source

```ts
   1 | import { test as setup, expect } from '@playwright/test';
   2 | import path from 'path';
   3 |
   4 | // Authentication files for different user roles
   5 | const adminAuthFile = path.join(__dirname, '../playwright/.auth/admin.json');
   6 | const userAuthFile = path.join(__dirname, '../playwright/.auth/user.json');
   7 | const guestAuthFile = path.join(__dirname, '../playwright/.auth/guest.json');
   8 |
   9 | // Test credentials - these should match your backend test data
  10 | const TEST_CREDENTIALS = {
  11 |   admin: {
  12 |     email: 'admin@sp.com',
  13 |     password: 'admin@123'
  14 |   },
  15 |   user: {
  16 |     email: 'user@sp.com', 
  17 |     password: 'user@123'
  18 |   }
  19 | };
  20 |
  21 | setup('authenticate as admin', async ({ page }) => {
  22 |   console.log('🔐 Setting up admin authentication...');
  23 |   
  24 |   // Navigate to login page
  25 |   await page.goto('http://localhost:3000/auth/login');
  26 |   
  27 |   // Wait for page to load
  28 |   await expect(page.locator('h1')).toContainText('Welcome back');
  29 |   
  30 |   // Fill login form
  31 |   await page.getByLabel('Email address').fill(TEST_CREDENTIALS.admin.email);
  32 |   await page.getByLabel('Password').fill(TEST_CREDENTIALS.admin.password);
  33 |   
  34 |   // Submit form and wait for navigation
  35 |   const responsePromise = page.waitForResponse('**/api/v1/auth/login');
  36 |   await page.getByRole('button', { name: 'Sign in' }).click();
  37 |   
  38 |   // Wait for successful login response
  39 |   const response = await responsePromise;
  40 |   expect(response.status()).toBe(200);
  41 |   
  42 |   // Wait for redirect to dashboard
  43 |   await page.waitForURL('**/dashboard', { timeout: 10000 });
  44 |   
  45 |   // Verify we're logged in by checking for user-specific content
  46 |   await expect(page.locator('[data-testid="user-menu"]')).toBeVisible({ timeout: 5000 });
  47 |   
  48 |   // Save authentication state
  49 |   await page.context().storageState({ path: adminAuthFile });
  50 |   console.log('✅ Admin authentication saved');
  51 | });
  52 |
  53 | setup('authenticate as user', async ({ page }) => {
  54 |   console.log('🔐 Setting up user authentication...');
  55 |   
  56 |   // Navigate to login page
  57 |   await page.goto('http://localhost:3000/auth/login');
  58 |   
  59 |   // Wait for page to load
> 60 |   await expect(page.locator('h1')).toContainText('Welcome back');
     |                                    ^ Error: Timed out 10000ms waiting for expect(locator).toContainText(expected)
  61 |   
  62 |   // Fill login form
  63 |   await page.getByLabel('Email address').fill(TEST_CREDENTIALS.user.email);
  64 |   await page.getByLabel('Password').fill(TEST_CREDENTIALS.user.password);
  65 |   
  66 |   // Submit form and wait for navigation
  67 |   const responsePromise = page.waitForResponse('**/api/v1/auth/login');
  68 |   await page.getByRole('button', { name: 'Sign in' }).click();
  69 |   
  70 |   // Wait for successful login response
  71 |   const response = await responsePromise;
  72 |   expect(response.status()).toBe(200);
  73 |   
  74 |   // Wait for redirect to dashboard
  75 |   await page.waitForURL('**/dashboard', { timeout: 10000 });
  76 |   
  77 |   // Verify we're logged in
  78 |   await expect(page.locator('[data-testid="user-menu"]')).toBeVisible({ timeout: 5000 });
  79 |   
  80 |   // Save authentication state
  81 |   await page.context().storageState({ path: userAuthFile });
  82 |   console.log('✅ User authentication saved');
  83 | });
  84 |
  85 | setup('setup guest state', async ({ page }) => {
  86 |   console.log('👤 Setting up guest (unauthenticated) state...');
  87 |   
  88 |   // Navigate to landing page to establish session
  89 |   await page.goto('http://localhost:3000/');
  90 |   
  91 |   // Wait for page to load
  92 |   await expect(page.locator('h1')).toBeVisible();
  93 |   
  94 |   // Save unauthenticated state
  95 |   await page.context().storageState({ path: guestAuthFile });
  96 |   console.log('✅ Guest state saved');
  97 | }); 
```