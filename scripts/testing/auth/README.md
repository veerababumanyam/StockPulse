# Authentication Testing Scripts

This directory contains authentication-specific testing utilities for the StockPulse application, designed to work in conjunction with `src/types/auth.ts`.

## 📁 Directory Structure

```
scripts/testing/auth/
├── README.md                    # This documentation
├── auth-testing-types.ts        # TypeScript testing types
├── create_test_user.py         # API-based test user creation
├── create_test_user.sql        # Direct SQL test user creation
└── create_user_simple.py       # Simple database user creation
```

## 🔗 Integration with Auth Types

These testing scripts extend and complement the main authentication types defined in:
- `src/types/auth.ts` - Core authentication interfaces
- `auth-testing-types.ts` - Extended testing-specific types

The testing types provide comprehensive coverage for:
- Test user creation scenarios
- Authentication testing workflows
- Security testing configurations
- Performance testing parameters
- Mock data structures

## 🧪 Testing Scripts Overview

### `create_test_user.py`
**Purpose**: Create test users via StockPulse registration API
**Type Safety**: Uses `CreateTestUserRequest` and `TestUser` interfaces
**Usage**:
```bash
cd StockPulse
python scripts/testing/auth/create_test_user.py
```

**Features**:
- API-based user creation (realistic testing)
- Validates registration workflow
- Tests error handling
- Follows enterprise authentication patterns

**Test Scenarios**:
- Valid user registration
- API response validation
- Error handling verification

### `create_test_user.sql`
**Purpose**: Direct database test user creation for integration testing
**Type Safety**: Implements `DatabaseTestUser` interface
**Usage**:
```sql
psql -d stockpulse -f scripts/testing/auth/create_test_user.sql
```

**Features**:
- Direct database insertion
- Bypasses API validation (for specific test scenarios)
- Pre-hashed password creation
- Database constraint testing

**Test Scenarios**:
- Database integrity testing
- Constraint validation
- Direct data manipulation testing

### `create_user_simple.py`
**Purpose**: Simple database user creation utility
**Type Safety**: Uses `TestUser` and `DatabaseTestUser` interfaces  
**Usage**:
```bash
cd StockPulse
python scripts/testing/auth/create_user_simple.py
```

**Features**:
- Direct PostgreSQL connection
- Simple user creation workflow
- Password hashing with bcrypt
- Minimal dependencies

**Test Scenarios**:
- Quick test user setup
- Database connectivity testing
- Password security validation

## 🎯 Test Scenarios Supported

Based on `TestScenario` type definitions:

### Authentication Flow Testing
- ✅ `successful_login` - Valid credential authentication
- ✅ `failed_login_invalid_credentials` - Wrong password/email
- ✅ `failed_login_inactive_user` - Deactivated account
- ✅ `failed_login_locked_account` - Account lockout scenarios

### Registration Testing  
- ✅ `successful_registration` - Valid user creation
- ✅ `failed_registration_duplicate_email` - Email uniqueness
- ✅ `failed_registration_weak_password` - Password policies

### Security Testing
- ✅ `account_lockout` - Brute force protection
- ✅ `session_management` - Session security
- ✅ `csrf_protection` - CSRF token validation
- ✅ `rate_limiting` - API rate limits

### Access Control Testing
- ✅ `role_based_access` - Permission validation
- ✅ `password_reset` - Password recovery flow

## 🔒 Security Testing Configuration

The scripts support comprehensive security testing via `SecurityTestConfig`:

```typescript
interface SecurityTestConfig {
  testBruteForce: boolean;      // Account lockout testing
  testSqlInjection: boolean;    // SQL injection prevention
  testXss: boolean;             // XSS attack prevention  
  testCsrf: boolean;            // CSRF protection
  testRateLimit: boolean;       // Rate limiting validation
  testSessionSecurity: boolean; // Session management security
}
```

## 📊 Test Data Management

### Mock Users
The scripts create users following `TestUser` interface:
- Test-specific metadata
- Scenario identification
- Cleanup tracking
- Script attribution

### Credentials Sets
Organized via `TestCredentialsSet` interface:
- Valid login combinations
- Invalid credential sets
- Locked account credentials
- Admin user credentials

## 🚀 Getting Started

### Prerequisites
1. **Database Running**: PostgreSQL on port 5432
2. **Backend Running**: StockPulse API on port 8000
3. **Dependencies**: Python packages and PostgreSQL client

### Quick Setup
```bash
# 1. Navigate to project root
cd StockPulse

# 2. Create a test user via API
python scripts/testing/auth/create_test_user.py

# 3. Create a simple test user via database
python scripts/testing/auth/create_user_simple.py

# 4. Verify users were created
psql -d stockpulse -c "SELECT email, role, status FROM users WHERE email LIKE '%test%';"
```

### Integration with Main Auth System
```typescript
// Import both main and testing types
import { User, LoginCredentials } from '../../../src/types/auth';
import { TestUser, CreateTestUserRequest } from './auth-testing-types';

// Create type-safe test user
const testUser: CreateTestUserRequest = {
  email: "test@example.com",
  password: "Test123!",
  testScenario: "successful_login",
  metadata: {
    scenario: "successful_login",
    expectedBehavior: ["login_success", "session_created"],
    validationRules: [],
    cleanup: true
  }
};
```

## 🧹 Cleanup and Maintenance

### Test Data Cleanup
The scripts support automatic cleanup via `CleanupConfig`:
- Auto-cleanup after test completion
- Preserve admin users
- Configurable cleanup delay
- Multiple cleanup strategies

### Cleanup Strategies
```typescript
type CleanupStrategy = 
  | "delete_test_users"     // Remove test users
  | "reset_failed_attempts" // Reset login attempts
  | "clear_sessions"        // Clear user sessions
  | "remove_test_data";     // Remove all test data
```

### Manual Cleanup
```sql
-- Remove test users (preserve admin)
DELETE FROM users 
WHERE email LIKE '%test%' 
AND role != 'ADMIN';

-- Reset failed login attempts
UPDATE users 
SET failed_attempts = 0, locked_until = NULL 
WHERE failed_attempts > 0;
```

## 📈 Performance Testing

The scripts support performance testing via `PerformanceTestConfig`:
- Concurrent user simulation
- Request rate testing  
- Load testing scenarios
- Response time measurement

## 🔍 Monitoring and Reporting

### Test Results
Results follow `AuthTestResult` interface:
- Test execution metrics
- Success/failure tracking
- Error collection
- Performance measurements

### Reporting Formats
- JSON reports for automation
- HTML reports for visualization
- Console output for development
- XML reports for CI/CD integration

## 🤝 Integration with CI/CD

The testing scripts are designed for:
- **Automated Testing**: CI/CD pipeline integration
- **Environment Testing**: Multi-environment support
- **Regression Testing**: Consistent test execution
- **Security Scanning**: Automated vulnerability testing

## 🛡️ Security Considerations

⚠️ **Important Security Notes**:
- Test users contain plain text passwords (for testing only)
- Scripts should only run in test environments
- Cleanup test data after execution
- Never use test credentials in production
- Review test user permissions regularly

## 📚 Related Documentation

- `src/types/auth.ts` - Core authentication types
- `docs/testing/admin-approval-testing-plan.md` - Admin approval testing
- `tests/story-1.2/` - Authentication integration tests
- `services/backend/scripts/` - Backend utility scripts

## 🚀 Enterprise Standards Compliance

✅ **Type Safety**: Full TypeScript integration
✅ **Security**: Comprehensive security testing
✅ **Documentation**: Enterprise-grade documentation
✅ **Maintainability**: Clear code organization
✅ **Scalability**: Multi-environment support
✅ **Compliance**: OWASP security standards

---

**Note**: These scripts extend the authentication system defined in `src/types/auth.ts` with comprehensive testing capabilities while maintaining enterprise-grade security and type safety standards. 