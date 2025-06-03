#!/usr/bin/env node

const { spawn } = require("child_process");
const path = require("path");

console.log("🚀 Starting StockPulse Authentication Test Suite");
console.log("================================================");

async function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`\n📋 Running: ${command} ${args.join(" ")}`);

    const child = spawn(command, args, {
      stdio: "inherit",
      shell: true,
      ...options,
    });

    child.on("close", (code) => {
      if (code === 0) {
        console.log(`✅ ${command} completed successfully`);
        resolve(code);
      } else {
        console.log(`❌ ${command} failed with code ${code}`);
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    child.on("error", (error) => {
      console.error(`❌ Error running ${command}:`, error);
      reject(error);
    });
  });
}

async function checkServers() {
  console.log("\n🔍 Checking if servers are running...");

  try {
    // Check frontend
    const frontendResponse = await fetch("http://localhost:3000");
    if (frontendResponse.ok) {
      console.log("✅ Frontend server is running on port 3000");
    }
  } catch (error) {
    console.log("❌ Frontend server not running on port 3000");
    console.log("   Please start with: npm run dev");
    process.exit(1);
  }

  try {
    // Check backend
    const backendResponse = await fetch("http://localhost:8000/api/v1/health");
    if (backendResponse.ok) {
      console.log("✅ Backend server is running on port 8000");
    }
  } catch (error) {
    console.log("⚠️  Backend server not running on port 8000");
    console.log("   Authentication tests may fail");
    console.log("   Please start backend server if needed");
  }
}

async function runTests() {
  try {
    // Check if servers are running
    await checkServers();

    console.log("\n🧪 Phase 1: Running Unit Tests (Jest)");
    console.log("=====================================");

    // Run Jest tests for authentication
    await runCommand("npm", [
      "test",
      "--",
      "--testPathPattern=tests/auth",
      "--verbose",
    ]);

    console.log("\n🎭 Phase 2: Running E2E Tests (Playwright)");
    console.log("==========================================");

    // Install Playwright browsers if needed
    try {
      await runCommand("npx", ["playwright", "install", "--with-deps"]);
    } catch (error) {
      console.log(
        "⚠️  Playwright install failed, continuing with existing browsers",
      );
    }

    // Run Playwright tests
    await runCommand("npx", ["playwright", "test", "--reporter=html"]);

    console.log("\n🎉 All Authentication Tests Completed Successfully!");
    console.log("==================================================");
    console.log("📊 Test reports:");
    console.log("   - Jest: Check console output above");
    console.log("   - Playwright: Open playwright-report/index.html");
  } catch (error) {
    console.error("\n❌ Test suite failed:", error.message);
    console.log("\n🔧 Troubleshooting:");
    console.log("   1. Ensure frontend is running: npm run dev");
    console.log("   2. Ensure backend is running (if needed)");
    console.log("   3. Check test credentials: admin@sp.com / admin@123");
    console.log("   4. Review error logs above");
    process.exit(1);
  }
}

// Handle script arguments
const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  console.log(`
Usage: node run-auth-tests.js [options]

Options:
  --unit-only     Run only unit tests (Jest)
  --e2e-only      Run only E2E tests (Playwright)
  --help, -h      Show this help message

Examples:
  node run-auth-tests.js              # Run all tests
  node run-auth-tests.js --unit-only  # Run only Jest tests
  node run-auth-tests.js --e2e-only   # Run only Playwright tests
`);
  process.exit(0);
}

if (args.includes("--unit-only")) {
  console.log("🧪 Running Unit Tests Only");
  runCommand("npm", ["test", "--", "--testPathPattern=tests/auth", "--verbose"])
    .then(() => console.log("✅ Unit tests completed"))
    .catch(() => process.exit(1));
} else if (args.includes("--e2e-only")) {
  console.log("🎭 Running E2E Tests Only");
  checkServers()
    .then(() => runCommand("npx", ["playwright", "test", "--reporter=html"]))
    .then(() => console.log("✅ E2E tests completed"))
    .catch(() => process.exit(1));
} else {
  runTests();
}
