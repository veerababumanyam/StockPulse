#!/usr/bin/env node

/**
 * Watchlist Test Runner
 * Comprehensive test execution for Story 2.4 - Watchlist Widget
 *
 * Usage: node tests/run-watchlist-tests.js [options]
 * Options:
 *   --component    Run only component tests
 *   --services     Run only service tests
 *   --e2e          Run only e2e tests
 *   --coverage     Generate coverage report
 *   --watch        Watch mode
 *   --verbose      Verbose output
 */

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

class WatchlistTestRunner {
  constructor() {
    this.args = process.argv.slice(2);
    this.options = this.parseArgs();
    this.results = {
      component: null,
      services: null,
      e2e: null,
      coverage: null,
    };
  }

  parseArgs() {
    const options = {
      component: this.args.includes("--component"),
      services: this.args.includes("--services"),
      e2e: this.args.includes("--e2e"),
      coverage: this.args.includes("--coverage"),
      watch: this.args.includes("--watch"),
      verbose: this.args.includes("--verbose"),
      all: !this.args.some((arg) =>
        ["--component", "--services", "--e2e"].includes(arg),
      ),
    };

    // If no specific test type is specified, run all
    if (options.all) {
      options.component = true;
      options.services = true;
      options.e2e = true;
    }

    return options;
  }

  log(message, type = "info") {
    const timestamp = new Date().toISOString();
    const colors = {
      info: "\x1b[36m", // Cyan
      success: "\x1b[32m", // Green
      error: "\x1b[31m", // Red
      warning: "\x1b[33m", // Yellow
      reset: "\x1b[0m", // Reset
    };

    const color = colors[type] || colors.info;
    console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
  }

  async runCommand(command, args, options = {}) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        cwd: process.cwd(),
        stdio: this.options.verbose ? "inherit" : "pipe",
        shell: true,
        ...options,
      });

      let stdout = "";
      let stderr = "";

      if (!this.options.verbose) {
        child.stdout?.on("data", (data) => {
          stdout += data.toString();
        });

        child.stderr?.on("data", (data) => {
          stderr += data.toString();
        });
      }

      child.on("close", (code) => {
        if (code === 0) {
          resolve({ code, stdout, stderr });
        } else {
          reject({ code, stdout, stderr });
        }
      });

      child.on("error", (error) => {
        reject({ error, stdout, stderr });
      });
    });
  }

  async checkPrerequisites() {
    this.log("🔍 Checking prerequisites...", "info");

    // Check if test files exist
    const testFiles = [
      "tests/components/watchlist.test.tsx",
      "tests/services/watchlistService.test.ts",
      "tests/services/websocketService.test.ts",
      "tests/e2e/watchlist-integration.spec.ts",
    ];

    const missingFiles = testFiles.filter((file) => !fs.existsSync(file));

    if (missingFiles.length > 0) {
      this.log(`❌ Missing test files: ${missingFiles.join(", ")}`, "error");
      return false;
    }

    // Check if dependencies are installed
    if (!fs.existsSync("node_modules")) {
      this.log("❌ Node modules not found. Run npm install first.", "error");
      return false;
    }

    // Check package.json for test scripts
    const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
    const requiredScripts = ["test", "test:coverage", "test:e2e"];
    const missingScripts = requiredScripts.filter(
      (script) => !packageJson.scripts[script],
    );

    if (missingScripts.length > 0) {
      this.log(
        `⚠️  Missing package.json scripts: ${missingScripts.join(", ")}`,
        "warning",
      );
    }

    this.log("✅ Prerequisites check passed", "success");
    return true;
  }

  async runComponentTests() {
    if (!this.options.component) return;

    this.log("🧪 Running Component Tests...", "info");

    try {
      const testPattern = "tests/components/watchlist.test.tsx";
      const args = [
        "test",
        testPattern,
        this.options.coverage ? "--coverage" : "",
        this.options.watch ? "--watch" : "",
        "--reporter=verbose",
      ].filter(Boolean);

      const result = await this.runCommand("npm", ["run", ...args]);

      this.results.component = {
        success: true,
        output: result.stdout,
      };

      this.log("✅ Component tests passed", "success");
    } catch (error) {
      this.results.component = {
        success: false,
        error: error.stderr || error.stdout || error.message,
      };

      this.log("❌ Component tests failed", "error");
      if (this.options.verbose) {
        console.log(error.stderr || error.stdout);
      }
    }
  }

  async runServiceTests() {
    if (!this.options.services) return;

    this.log("⚙️  Running Service Tests...", "info");

    try {
      const testPattern = "tests/services/*.test.ts";
      const args = [
        "test",
        testPattern,
        this.options.coverage ? "--coverage" : "",
        this.options.watch ? "--watch" : "",
        "--reporter=verbose",
      ].filter(Boolean);

      const result = await this.runCommand("npm", ["run", ...args]);

      this.results.services = {
        success: true,
        output: result.stdout,
      };

      this.log("✅ Service tests passed", "success");
    } catch (error) {
      this.results.services = {
        success: false,
        error: error.stderr || error.stdout || error.message,
      };

      this.log("❌ Service tests failed", "error");
      if (this.options.verbose) {
        console.log(error.stderr || error.stdout);
      }
    }
  }

  async runE2ETests() {
    if (!this.options.e2e) return;

    this.log("🌐 Running End-to-End Tests...", "info");

    try {
      // Check if Playwright is installed
      if (!fs.existsSync("node_modules/@playwright/test")) {
        this.log("Installing Playwright...", "info");
        await this.runCommand("npm", ["install", "@playwright/test"]);
        await this.runCommand("npx", ["playwright", "install"]);
      }

      const args = [
        "test:e2e",
        "tests/e2e/watchlist-integration.spec.ts",
        this.options.verbose ? "--reporter=list" : "--reporter=dot",
      ].filter(Boolean);

      const result = await this.runCommand("npm", ["run", ...args]);

      this.results.e2e = {
        success: true,
        output: result.stdout,
      };

      this.log("✅ E2E tests passed", "success");
    } catch (error) {
      this.results.e2e = {
        success: false,
        error: error.stderr || error.stdout || error.message,
      };

      this.log("❌ E2E tests failed", "error");
      if (this.options.verbose) {
        console.log(error.stderr || error.stdout);
      }
    }
  }

  async generateCoverageReport() {
    if (!this.options.coverage) return;

    this.log("📊 Generating Coverage Report...", "info");

    try {
      await this.runCommand("npm", [
        "run",
        "test:coverage",
        "--",
        "tests/**/*.test.{ts,tsx}",
      ]);

      this.results.coverage = {
        success: true,
        reportPath: "coverage/lcov-report/index.html",
      };

      this.log(
        "✅ Coverage report generated at coverage/lcov-report/index.html",
        "success",
      );
    } catch (error) {
      this.results.coverage = {
        success: false,
        error: error.stderr || error.stdout || error.message,
      };

      this.log("❌ Coverage report generation failed", "error");
    }
  }

  generateSummaryReport() {
    this.log("\n📋 Test Summary Report", "info");
    this.log("=" * 50, "info");

    const tests = ["component", "services", "e2e", "coverage"];
    let totalTests = 0;
    let passedTests = 0;

    tests.forEach((testType) => {
      const result = this.results[testType];
      if (result !== null) {
        totalTests++;
        const status = result.success ? "✅ PASSED" : "❌ FAILED";
        const emoji = {
          component: "🧪",
          services: "⚙️",
          e2e: "🌐",
          coverage: "📊",
        }[testType];

        this.log(
          `${emoji} ${testType.toUpperCase()} Tests: ${status}`,
          result.success ? "success" : "error",
        );

        if (result.success) passedTests++;
      }
    });

    this.log("\n📈 Overall Results:", "info");
    this.log(`Tests Run: ${totalTests}`, "info");
    this.log(
      `Passed: ${passedTests}`,
      passedTests === totalTests ? "success" : "warning",
    );
    this.log(
      `Failed: ${totalTests - passedTests}`,
      totalTests === passedTests ? "info" : "error",
    );
    this.log(
      `Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`,
      "info",
    );

    if (passedTests === totalTests) {
      this.log(
        "\n🎉 All tests passed! Story 2.4 implementation is ready for production.",
        "success",
      );
    } else {
      this.log(
        "\n⚠️  Some tests failed. Please review the errors above.",
        "warning",
      );
    }
  }

  async run() {
    this.log("🚀 Starting Watchlist Widget Test Suite", "info");
    this.log(`Options: ${JSON.stringify(this.options, null, 2)}`, "info");

    const startTime = Date.now();

    try {
      // Check prerequisites
      const prerequisitesOk = await this.checkPrerequisites();
      if (!prerequisitesOk) {
        process.exit(1);
      }

      // Run tests in sequence
      await this.runComponentTests();
      await this.runServiceTests();
      await this.runE2ETests();
      await this.generateCoverageReport();

      // Generate summary
      this.generateSummaryReport();

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      this.log(`\n⏱️  Total execution time: ${duration}s`, "info");

      // Exit with appropriate code
      const hasFailures = Object.values(this.results).some(
        (result) => result !== null && !result.success,
      );

      process.exit(hasFailures ? 1 : 0);
    } catch (error) {
      this.log(`💥 Unexpected error: ${error.message}`, "error");
      if (this.options.verbose) {
        console.error(error);
      }
      process.exit(1);
    }
  }
}

// Helper function to create package.json test scripts if missing
function ensureTestScripts() {
  const packageJsonPath = "package.json";
  if (!fs.existsSync(packageJsonPath)) {
    console.log("⚠️  package.json not found");
    return;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  const requiredScripts = {
    test: "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:watchlist": "node tests/run-watchlist-tests.js",
  };

  let updated = false;

  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }

  Object.entries(requiredScripts).forEach(([script, command]) => {
    if (!packageJson.scripts[script]) {
      packageJson.scripts[script] = command;
      updated = true;
    }
  });

  if (updated) {
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log("✅ Updated package.json with missing test scripts");
  }
}

// Show help
function showHelp() {
  console.log(`
Watchlist Test Runner - Story 2.4 Test Suite

Usage: node tests/run-watchlist-tests.js [options]

Options:
  --component    Run only component tests (React components)
  --services     Run only service tests (API services, WebSocket)
  --e2e          Run only end-to-end tests (Playwright)
  --coverage     Generate code coverage report
  --watch        Run tests in watch mode
  --verbose      Show detailed output
  --help         Show this help message

Examples:
  node tests/run-watchlist-tests.js                    # Run all tests
  node tests/run-watchlist-tests.js --component        # Run only component tests
  node tests/run-watchlist-tests.js --coverage         # Run all tests with coverage
  node tests/run-watchlist-tests.js --e2e --verbose    # Run E2E tests with detailed output

Test Files:
  tests/components/watchlist.test.tsx                 - React component tests
  tests/services/watchlistService.test.ts            - Watchlist service tests
  tests/services/websocketService.test.ts            - WebSocket service tests
  tests/e2e/watchlist-integration.spec.ts            - End-to-end integration tests

For more information, see: docs/stories/story-2.4.md
  `);
}

// Main execution
if (require.main === module) {
  if (process.argv.includes("--help")) {
    showHelp();
    process.exit(0);
  }

  // Ensure test scripts exist
  ensureTestScripts();

  // Run the test suite
  const runner = new WatchlistTestRunner();
  runner.run();
}

module.exports = WatchlistTestRunner;
