#!/usr/bin/env node

/**
 * Comprehensive Authentication Test Runner for StockPulse
 *
 * This script runs all authentication tests in the correct order:
 * 1. Unit tests (AuthContext, Login Component)
 * 2. Integration tests (Complete auth flows)
 * 3. API tests (Backend authentication)
 * 4. Multi-role tests (Admin, User, Guest)
 * 5. E2E tests (Cross-browser, Mobile)
 *
 * Usage:
 *   node tests/run-all-auth-tests.js [options]
 *
 * Options:
 *   --unit-only      Run only unit tests
 *   --api-only       Run only API tests
 *   --e2e-only       Run only E2E tests
 *   --quick          Run quick test suite (Chrome only)
 *   --full           Run full test suite (all browsers)
 *   --debug          Run with debug output
 *   --headed         Run tests in headed mode
 *   --report         Generate comprehensive report
 */

const { execSync, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

// Configuration
const CONFIG = {
  baseDir: process.cwd(),
  testDir: path.join(process.cwd(), "tests"),
  resultsDir: path.join(process.cwd(), "test-results"),
  authDir: path.join(process.cwd(), "playwright", ".auth"),

  // Test suites
  testSuites: {
    unit: ["auth-unit-tests"],
    integration: ["auth-flow-tests"],
    api: ["api-auth-tests"],
    multiRole: ["multi-role-tests"],
    e2e: ["e2e-admin", "e2e-user", "e2e-guest"],
    crossBrowser: ["auth-firefox", "auth-webkit"],
    mobile: ["auth-mobile-chrome", "auth-mobile-safari"],
    performance: ["auth-performance"],
  },

  // Quick test suite (for development)
  quickSuite: ["auth-unit-tests", "auth-flow-tests", "api-auth-tests"],

  // Full test suite (for CI/CD)
  fullSuite: [
    "setup",
    "auth-unit-tests",
    "auth-flow-tests",
    "api-auth-tests",
    "multi-role-tests",
    "e2e-admin",
    "e2e-user",
    "e2e-guest",
    "auth-firefox",
    "auth-webkit",
    "auth-mobile-chrome",
    "auth-mobile-safari",
    "auth-performance",
  ],
};

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  unitOnly: args.includes("--unit-only"),
  apiOnly: args.includes("--api-only"),
  e2eOnly: args.includes("--e2e-only"),
  quick: args.includes("--quick"),
  full: args.includes("--full"),
  debug: args.includes("--debug"),
  headed: args.includes("--headed"),
  report: args.includes("--report"),
};

// Utility functions
function log(message, level = "info") {
  const timestamp = new Date().toISOString();
  const prefix =
    {
      info: "🔵",
      success: "✅",
      warning: "⚠️",
      error: "❌",
      debug: "🔍",
    }[level] || "ℹ️";

  console.log(`${prefix} [${timestamp}] ${message}`);
}

function ensureDirectories() {
  const dirs = [CONFIG.resultsDir, CONFIG.authDir];
  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      log(`Created directory: ${dir}`);
    }
  });
}

function checkPrerequisites() {
  log("Checking prerequisites...");

  // Check if package.json exists
  if (!fs.existsSync("package.json")) {
    log("package.json not found. Please run from project root.", "error");
    process.exit(1);
  }

  // Check if Playwright is installed
  try {
    execSync("npx playwright --version", { stdio: "pipe" });
    log("Playwright is installed ✓", "success");
  } catch (error) {
    log("Playwright not found. Installing...", "warning");
    execSync("npx playwright install", { stdio: "inherit" });
  }

  // Check if test files exist
  const requiredFiles = [
    "tests/auth.setup.ts",
    "tests/auth/complete-auth-flows.test.ts",
    "tests/auth/multi-role-auth.test.ts",
    "tests/auth/api-auth.test.ts",
    "playwright.config.ts",
  ];

  requiredFiles.forEach((file) => {
    if (!fs.existsSync(file)) {
      log(`Required test file missing: ${file}`, "error");
      process.exit(1);
    }
  });

  log("All prerequisites met ✓", "success");
}

function runPlaywrightTests(projects, options = {}) {
  return new Promise((resolve, reject) => {
    const cmd = "npx";
    const args = ["playwright", "test"];

    // Add project filters
    if (projects && projects.length > 0) {
      projects.forEach((project) => {
        args.push("--project", project);
      });
    }

    // Add options
    if (options.headed) args.push("--headed");
    if (options.debug) args.push("--debug");
    if (options.reporter) args.push("--reporter", options.reporter);

    log(`Running: ${cmd} ${args.join(" ")}`);

    const child = spawn(cmd, args, {
      stdio: "inherit",
      shell: true,
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Tests failed with exit code ${code}`));
      }
    });

    child.on("error", (error) => {
      reject(error);
    });
  });
}

async function runTestSuite(suiteName, projects) {
  log(`\n🚀 Running ${suiteName} tests...`);
  log(`Projects: ${projects.join(", ")}`);

  const startTime = Date.now();

  try {
    await runPlaywrightTests(projects, {
      headed: options.headed,
      debug: options.debug,
      reporter: "line",
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    log(`${suiteName} tests completed in ${duration}s ✓`, "success");

    return { success: true, duration: parseFloat(duration) };
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    log(
      `${suiteName} tests failed after ${duration}s: ${error.message}`,
      "error",
    );

    return {
      success: false,
      duration: parseFloat(duration),
      error: error.message,
    };
  }
}

async function generateReport(results) {
  log("\n📊 Generating comprehensive test report...");

  const totalTests = results.length;
  const passedTests = results.filter((r) => r.success).length;
  const failedTests = totalTests - passedTests;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

  const report = {
    summary: {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      passRate: ((passedTests / totalTests) * 100).toFixed(2),
      totalDuration: totalDuration.toFixed(2),
      timestamp: new Date().toISOString(),
    },
    results: results,
    environment: {
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      cwd: process.cwd(),
    },
  };

  // Write JSON report
  const reportPath = path.join(CONFIG.resultsDir, "auth-test-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // Write HTML report
  const htmlReport = generateHtmlReport(report);
  const htmlPath = path.join(CONFIG.resultsDir, "auth-test-report.html");
  fs.writeFileSync(htmlPath, htmlReport);

  // Console summary
  console.log("\n" + "=".repeat(60));
  console.log("🎯 AUTHENTICATION TEST SUMMARY");
  console.log("=".repeat(60));
  console.log(`📊 Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📈 Pass Rate: ${report.summary.passRate}%`);
  console.log(`⏱️  Total Duration: ${totalDuration.toFixed(2)}s`);
  console.log(`📄 Report: ${reportPath}`);
  console.log(`🌐 HTML Report: ${htmlPath}`);
  console.log("=".repeat(60));

  if (failedTests > 0) {
    console.log("\n❌ FAILED TESTS:");
    results
      .filter((r) => !r.success)
      .forEach((r) => {
        console.log(`  • ${r.suite}: ${r.error}`);
      });
  }

  return report;
}

function generateHtmlReport(report) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>StockPulse Authentication Test Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .content { padding: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #667eea; }
        .metric-value { font-size: 2em; font-weight: bold; color: #333; }
        .metric-label { color: #666; margin-top: 5px; }
        .results { margin-top: 30px; }
        .result { padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #ddd; }
        .result.success { background: #d4edda; border-left-color: #28a745; }
        .result.failure { background: #f8d7da; border-left-color: #dc3545; }
        .result-title { font-weight: bold; margin-bottom: 5px; }
        .result-duration { color: #666; font-size: 0.9em; }
        .footer { text-align: center; padding: 20px; color: #666; border-top: 1px solid #eee; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 StockPulse Authentication Test Report</h1>
            <p>Generated on ${new Date(report.summary.timestamp).toLocaleString()}</p>
        </div>

        <div class="content">
            <div class="summary">
                <div class="metric">
                    <div class="metric-value">${report.summary.total}</div>
                    <div class="metric-label">Total Tests</div>
                </div>
                <div class="metric">
                    <div class="metric-value" style="color: #28a745">${report.summary.passed}</div>
                    <div class="metric-label">Passed</div>
                </div>
                <div class="metric">
                    <div class="metric-value" style="color: #dc3545">${report.summary.failed}</div>
                    <div class="metric-label">Failed</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${report.summary.passRate}%</div>
                    <div class="metric-label">Pass Rate</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${report.summary.totalDuration}s</div>
                    <div class="metric-label">Duration</div>
                </div>
            </div>

            <div class="results">
                <h2>Test Results</h2>
                ${report.results
                  .map(
                    (result) => `
                    <div class="result ${result.success ? "success" : "failure"}">
                        <div class="result-title">${result.suite}</div>
                        <div class="result-duration">Duration: ${result.duration}s</div>
                        ${result.error ? `<div style="color: #dc3545; margin-top: 5px;">${result.error}</div>` : ""}
                    </div>
                `,
                  )
                  .join("")}
            </div>
        </div>

        <div class="footer">
            <p>StockPulse Enterprise Authentication Testing Suite</p>
            <p>Environment: ${report.environment.platform} ${report.environment.arch} | Node.js ${report.environment.node}</p>
        </div>
    </div>
</body>
</html>
  `;
}

async function main() {
  console.log("🚀 StockPulse Authentication Test Runner");
  console.log("==========================================\n");

  // Setup
  ensureDirectories();
  checkPrerequisites();

  const results = [];

  try {
    if (options.unitOnly) {
      log("Running unit tests only...");
      const result = await runTestSuite("Unit", CONFIG.testSuites.unit);
      results.push({ suite: "Unit Tests", ...result });
    } else if (options.apiOnly) {
      log("Running API tests only...");
      const result = await runTestSuite("API", CONFIG.testSuites.api);
      results.push({ suite: "API Tests", ...result });
    } else if (options.e2eOnly) {
      log("Running E2E tests only...");
      const result = await runTestSuite("E2E", CONFIG.testSuites.e2e);
      results.push({ suite: "E2E Tests", ...result });
    } else if (options.quick) {
      log("Running quick test suite...");

      // Run setup first
      const setupResult = await runTestSuite("Setup", ["setup"]);
      results.push({ suite: "Setup", ...setupResult });

      if (setupResult.success) {
        for (const project of CONFIG.quickSuite) {
          const result = await runTestSuite(project, [project]);
          results.push({ suite: project, ...result });
        }
      }
    } else if (options.full) {
      log("Running full test suite...");

      for (const project of CONFIG.fullSuite) {
        const result = await runTestSuite(project, [project]);
        results.push({ suite: project, ...result });

        // Stop if setup fails
        if (project === "setup" && !result.success) {
          log("Setup failed, stopping test execution", "error");
          break;
        }
      }
    } else {
      // Default: run core authentication tests
      log("Running core authentication tests...");

      // Setup
      const setupResult = await runTestSuite("Setup", ["setup"]);
      results.push({ suite: "Setup", ...setupResult });

      if (setupResult.success) {
        // Core tests
        const coreTests = [
          { name: "Unit", projects: CONFIG.testSuites.unit },
          { name: "Integration", projects: CONFIG.testSuites.integration },
          { name: "API", projects: CONFIG.testSuites.api },
          { name: "Multi-Role", projects: CONFIG.testSuites.multiRole },
        ];

        for (const test of coreTests) {
          const result = await runTestSuite(test.name, test.projects);
          results.push({ suite: test.name, ...result });
        }
      }
    }

    // Generate report if requested or if there are results
    if (options.report || results.length > 0) {
      await generateReport(results);
    }

    // Exit with appropriate code
    const hasFailures = results.some((r) => !r.success);
    process.exit(hasFailures ? 1 : 0);
  } catch (error) {
    log(`Test runner failed: ${error.message}`, "error");
    process.exit(1);
  }
}

// Handle process signals
process.on("SIGINT", () => {
  log("Test runner interrupted", "warning");
  process.exit(130);
});

process.on("SIGTERM", () => {
  log("Test runner terminated", "warning");
  process.exit(143);
});

// Run the main function
if (require.main === module) {
  main().catch((error) => {
    log(`Unhandled error: ${error.message}`, "error");
    process.exit(1);
  });
}

module.exports = { main, CONFIG };
