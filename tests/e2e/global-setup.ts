import { chromium, FullConfig } from "@playwright/test";

async function globalSetup(config: FullConfig) {
  console.log("🚀 Starting global setup for authentication tests...");

  // Launch browser for setup
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Check if the frontend is running
    console.log("📡 Checking if frontend is running...");
    await page.goto("http://localhost:3000", { timeout: 30000 });
    console.log("✅ Frontend is running");

    // Check if the backend API is accessible
    console.log("🔧 Checking backend API...");
    const response = await page.request
      .get("http://localhost:8000/api/v1/health", {
        timeout: 10000,
      })
      .catch(() => null);

    if (response && response.ok()) {
      console.log("✅ Backend API is running");
    } else {
      console.log("⚠️  Backend API not accessible - tests may fail");
      console.log("   Make sure the backend server is running on port 8000");
    }

    // Verify login endpoint is accessible
    console.log("🔐 Testing authentication endpoint...");
    const authResponse = await page.request
      .post("http://localhost:8000/api/v1/auth/login", {
        data: {
          email: "test@example.com",
          password: "testpassword",
        },
        timeout: 5000,
      })
      .catch(() => null);

    if (authResponse) {
      console.log("✅ Authentication endpoint is accessible");
    } else {
      console.log("⚠️  Authentication endpoint not accessible");
    }
  } catch (error) {
    console.error("❌ Global setup failed:", error);
    console.log(
      "   Please ensure both frontend and backend servers are running",
    );
    console.log("   Frontend: npm run dev (port 3000)");
    console.log(
      "   Backend: python -m uvicorn app.main:app --reload (port 8000)",
    );
  } finally {
    await browser.close();
  }

  console.log("🏁 Global setup completed");
}

export default globalSetup;
