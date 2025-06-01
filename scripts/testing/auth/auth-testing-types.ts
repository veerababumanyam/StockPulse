/**
 * Authentication Testing Type Definitions
 * Extends src/types/auth.ts for comprehensive testing scenarios
 * Enterprise-grade testing type safety for StockPulse authentication system
 */

import { User, LoginCredentials, RegisterCredentials, AuthError } from '../../../src/types/auth';

/**
 * Test User Creation Types
 */
export interface TestUser extends User {
  password: string; // Plain text password for testing
  isTestUser: boolean;
  testScenario: string;
  createdByScript: string;
}

export interface CreateTestUserRequest {
  email: string;
  password: string;
  name?: string;
  role?: "ADMIN" | "USER" | "MODERATOR";
  status?: "APPROVED" | "PENDING" | "REJECTED";
  isActive?: boolean;
  testScenario: string;
  metadata?: TestUserMetadata;
}

export interface TestUserMetadata {
  scenario: TestScenario;
  expectedBehavior: string[];
  validationRules: ValidationRule[];
  cleanup: boolean;
  expiresAt?: string;
}

/**
 * Test Scenarios for Authentication
 */
export type TestScenario = 
  | "successful_login"
  | "failed_login_invalid_credentials"
  | "failed_login_inactive_user"
  | "failed_login_locked_account"
  | "successful_registration"
  | "failed_registration_duplicate_email"
  | "failed_registration_weak_password"
  | "session_management"
  | "password_reset"
  | "account_lockout"
  | "role_based_access"
  | "csrf_protection"
  | "rate_limiting";

export interface ValidationRule {
  field: string;
  rule: string;
  expected: any;
  description: string;
}

/**
 * Test Credentials Collections
 */
export interface TestCredentialsSet {
  valid: LoginCredentials[];
  invalid: LoginCredentials[];
  locked: LoginCredentials[];
  inactive: LoginCredentials[];
  admin: LoginCredentials[];
}

export interface TestRegistrationSet {
  valid: RegisterCredentials[];
  invalid: RegisterCredentials[];
  duplicateEmail: RegisterCredentials[];
  weakPasswords: RegisterCredentials[];
}

/**
 * Authentication Test Results
 */
export interface AuthTestResult {
  testId: string;
  scenario: TestScenario;
  success: boolean;
  executionTime: number;
  response: any;
  expectedStatus: number;
  actualStatus: number;
  errors: AuthError[];
  warnings: string[];
  metadata: Record<string, any>;
}

export interface AuthTestSuite {
  suiteId: string;
  suiteName: string;
  tests: AuthTestResult[];
  summary: TestSuiteSummary;
  environment: TestEnvironment;
}

export interface TestSuiteSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  executionTime: number;
  coverage: TestCoverage;
}

export interface TestCoverage {
  endpoints: number;
  scenarios: number;
  edgeCases: number;
  securityTests: number;
}

/**
 * Test Environment Configuration
 */
export interface TestEnvironment {
  name: "local" | "staging" | "ci" | "integration";
  baseUrl: string;
  databaseUrl: string;
  redis?: string;
  apiKeys: TestApiKeys;
  timeouts: TestTimeouts;
  cleanup: CleanupConfig;
}

export interface TestApiKeys {
  fmp?: string;
  testOnly: boolean;
  encrypted: boolean;
}

export interface TestTimeouts {
  request: number;
  login: number;
  registration: number;
  cleanup: number;
}

export interface CleanupConfig {
  autoCleanup: boolean;
  preserveAdmin: boolean;
  cleanupDelay: number;
  strategies: CleanupStrategy[];
}

export type CleanupStrategy = 
  | "delete_test_users"
  | "reset_failed_attempts"
  | "clear_sessions"
  | "remove_test_data";

/**
 * Database Testing Types
 */
export interface DatabaseTestUser {
  id: string;
  email: string;
  password_hash: string;
  role: string;
  status: string;
  is_active: boolean;
  failed_attempts: number;
  locked_until: string | null;
  created_at: string;
  updated_at: string;
  test_metadata: string | null;
}

export interface DatabaseTestQuery {
  name: string;
  query: string;
  parameters: any[];
  expectedResults: number;
  cleanup: boolean;
}

/**
 * Security Testing Types
 */
export interface SecurityTestConfig {
  testBruteForce: boolean;
  testSqlInjection: boolean;
  testXss: boolean;
  testCsrf: boolean;
  testRateLimit: boolean;
  testSessionSecurity: boolean;
}

export interface SecurityTestResult extends AuthTestResult {
  securityLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  vulnerabilities: SecurityVulnerability[];
  recommendations: string[];
}

export interface SecurityVulnerability {
  type: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  description: string;
  location: string;
  remediation: string;
}

/**
 * Performance Testing Types
 */
export interface PerformanceTestConfig {
  concurrentUsers: number;
  requestsPerSecond: number;
  testDuration: number;
  rampUpTime: number;
  endpoints: string[];
}

export interface PerformanceTestResult {
  averageResponseTime: number;
  maxResponseTime: number;
  minResponseTime: number;
  successRate: number;
  errorRate: number;
  throughput: number;
  concurrency: number;
}

/**
 * Mock Data Types
 */
export interface MockUserData {
  users: TestUser[];
  credentials: TestCredentialsSet;
  registrations: TestRegistrationSet;
  scenarios: TestScenario[];
}

/**
 * Test Script Configuration
 */
export interface TestScriptConfig {
  name: string;
  description: string;
  version: string;
  environment: TestEnvironment;
  security: SecurityTestConfig;
  performance?: PerformanceTestConfig;
  mockData: MockUserData;
  reporting: ReportingConfig;
}

export interface ReportingConfig {
  format: "json" | "html" | "xml" | "console";
  outputPath: string;
  includeDetails: boolean;
  includeMetrics: boolean;
  includeLogs: boolean;
}

/**
 * Script Execution Types
 */
export interface ScriptExecutionContext {
  scriptName: string;
  startTime: string;
  environment: string;
  parameters: Record<string, any>;
  user: string;
  version: string;
}

export interface ScriptExecutionResult {
  context: ScriptExecutionContext;
  success: boolean;
  endTime: string;
  duration: number;
  results: any[];
  errors: Error[];
  logs: string[];
  metrics: ExecutionMetrics;
}

export interface ExecutionMetrics {
  usersCreated: number;
  usersDeleted: number;
  testsExecuted: number;
  apiCalls: number;
  databaseQueries: number;
  memoryUsage: number;
  cpuUsage: number;
}

/**
 * Utility Types for Testing
 */
export type TestUserRole = "ADMIN" | "USER" | "MODERATOR" | "TEST_ADMIN";
export type TestUserStatus = "APPROVED" | "PENDING" | "REJECTED" | "LOCKED" | "INACTIVE";

export interface TestConstants {
  DEFAULT_PASSWORD: string;
  ADMIN_EMAIL: string;
  TEST_EMAIL_DOMAIN: string;
  MAX_FAILED_ATTEMPTS: number;
  LOCKOUT_DURATION: number;
  SESSION_TIMEOUT: number;
}

/**
 * Integration with Main Auth Types
 */
export interface EnhancedLoginCredentials extends LoginCredentials {
  testContext?: {
    scenario: TestScenario;
    expectedResult: "success" | "failure";
    expectedError?: string;
  };
}

export interface EnhancedRegisterCredentials extends RegisterCredentials {
  testContext?: {
    scenario: TestScenario;
    validationTests: ValidationRule[];
    cleanup: boolean;
  };
}

/**
 * Export all testing utilities
 */
export * from '../../../src/types/auth'; 