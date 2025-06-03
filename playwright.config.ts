import { defineConfig, devices } from "@playwright/test";

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./tests",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ["html", { outputFolder: "test-results/html-report" }],
    ["json", { outputFile: "test-results/results.json" }],
    ["junit", { outputFile: "test-results/junit.xml" }],
    ["line"],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "http://localhost:3000",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",

    /* Take screenshot on failure */
    screenshot: "only-on-failure",

    /* Record video on failure */
    video: "retain-on-failure",

    /* Global timeout for each test */
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  /* Configure projects for major browsers */
  projects: [
    // Setup project - runs authentication setup before all tests
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
      teardown: "cleanup",
    },

    // Cleanup project
    {
      name: "cleanup",
      testMatch: /global-teardown\.ts/,
    },

    // Authentication tests (no dependencies, run fresh)
    {
      name: "auth-unit-tests",
      testDir: "./tests/auth",
      testMatch:
        /auth-context\.test\.tsx|login-component\.test\.tsx|debug-auth\.test\.tsx/,
      use: { ...devices["Desktop Chrome"] },
    },

    // Complete authentication flow tests (depends on setup)
    {
      name: "auth-flow-tests",
      testDir: "./tests/auth",
      testMatch: /complete-auth-flows\.test\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        // Don't use stored auth state for these tests - they test the login flow itself
      },
      dependencies: ["setup"],
    },

    // Multi-role authentication tests (uses stored auth states)
    {
      name: "multi-role-tests",
      testDir: "./tests/auth",
      testMatch: /multi-role-auth\.test\.ts/,
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup"],
    },

    // API authentication tests
    {
      name: "api-auth-tests",
      testDir: "./tests/auth",
      testMatch: /api-auth\.test\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },

    // E2E tests with admin authentication
    {
      name: "e2e-admin",
      testDir: "./tests/e2e",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/admin.json",
      },
      dependencies: ["setup"],
    },

    // E2E tests with user authentication
    {
      name: "e2e-user",
      testDir: "./tests/e2e",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
    },

    // E2E tests without authentication (guest)
    {
      name: "e2e-guest",
      testDir: "./tests/e2e",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/guest.json",
      },
      dependencies: ["setup"],
    },

    // Cross-browser testing for critical auth flows
    {
      name: "auth-firefox",
      testDir: "./tests/auth",
      testMatch: /complete-auth-flows\.test\.ts/,
      use: { ...devices["Desktop Firefox"] },
      dependencies: ["setup"],
    },

    {
      name: "auth-webkit",
      testDir: "./tests/auth",
      testMatch: /complete-auth-flows\.test\.ts/,
      use: { ...devices["Desktop Safari"] },
      dependencies: ["setup"],
    },

    // Mobile testing for auth flows
    {
      name: "auth-mobile-chrome",
      testDir: "./tests/auth",
      testMatch: /complete-auth-flows\.test\.ts/,
      use: { ...devices["Pixel 5"] },
      dependencies: ["setup"],
    },

    {
      name: "auth-mobile-safari",
      testDir: "./tests/auth",
      testMatch: /complete-auth-flows\.test\.ts/,
      use: { ...devices["iPhone 12"] },
      dependencies: ["setup"],
    },

    // Performance testing
    {
      name: "auth-performance",
      testDir: "./tests/auth",
      testMatch: /api-auth\.test\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        // Enable performance metrics
        trace: "on",
      },
    },
  ],

  /* Global setup and teardown */
  globalSetup: require.resolve("./tests/e2e/global-setup.ts"),
  globalTeardown: require.resolve("./tests/e2e/global-teardown.ts"),

  /* Run your local dev server before starting the tests */
  webServer: [
    {
      command: "npm run dev",
      port: 3000,
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
    {
      command:
        "cd services/backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload",
      port: 8000,
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
  ],

  /* Expect options */
  expect: {
    /* Maximum time expect() should wait for the condition to be met. */
    timeout: 10000,

    /* Threshold for pixel difference in visual comparisons */
    threshold: 0.2,

    /* Take screenshot on assertion failure */
    toHaveScreenshot: {
      threshold: 0.2,
      maxDiffPixels: 1000,
    },
  },

  /* Output directory for test artifacts */
  outputDir: "test-results/",

  /* Timeout for each test */
  timeout: 60000,
});
