# StockPulse Scripts Directory

Enterprise-grade utility scripts organized by purpose and lifecycle for the StockPulse financial trading platform.

## 📁 Directory Structure

```
scripts/
├── README.md                    # This documentation
├── setup/                      # Initial setup and configuration
│   ├── activate_admin.py       # Admin user activation
│   └── create_admin_user.py    # Admin user creation
├── testing/                    # Testing utilities and data
│   ├── auth/                   # Authentication testing (integrated with src/types/auth.ts)
│   │   ├── README.md           # Auth testing documentation
│   │   ├── auth-testing-types.ts  # TypeScript testing types
│   │   ├── create_test_user.py    # API-based test user creation
│   │   ├── create_test_user.sql   # SQL test user creation
│   │   └── create_user_simple.py  # Simple database user creation
│   └── manual-widget-test.html # Widget system manual testing
├── deployment/                 # Deployment and infrastructure
│   ├── deploy-staging.sh       # Staging environment deployment
│   └── stop-staging.sh         # Stop staging environment
└── development/                # Development tools and utilities
    └── theme-build-optimizer.js # Theme optimization and validation
```

## 🎯 Script Categories

### 🔧 Setup Scripts (`setup/`)

**Purpose**: Initial system configuration and admin user management
**When to Use**: During initial deployment and admin user setup
**Dependencies**: Database connection, backend services

#### `setup/activate_admin.py`

- **Function**: Activates existing admin user directly via database
- **Use Case**: Fix admin user status when account becomes inactive
- **Safety**: Direct database manipulation with status verification

#### `setup/create_admin_user.py`

- **Function**: Creates new admin user with proper permissions
- **Use Case**: Initial admin user creation for new deployments
- **Features**: Auto-activation, role assignment, credential setup

### 🧪 Testing Scripts (`testing/`)

**Purpose**: Comprehensive testing utilities for all system components
**When to Use**: Development, CI/CD, and manual testing scenarios

#### Authentication Testing (`testing/auth/`)

**Purpose**: Authentication-specific testing integrated with `src/types/auth.ts`
**Type Safety**: Full TypeScript integration with testing-specific interfaces
**Coverage**: Login, registration, security, performance testing

Key Features:

- **Type-Safe Testing**: Extends `src/types/auth.ts` with testing types
- **Comprehensive Scenarios**: 13+ authentication test scenarios
- **Security Testing**: OWASP compliance testing
- **Performance Testing**: Load and concurrent user testing
- **Enterprise Integration**: CI/CD and automated testing support

#### Widget Testing (`testing/`)

- **`manual-widget-test.html`**: Manual testing interface for widget system
- **Use Case**: Interactive widget functionality verification
- **Features**: Visual testing, user interaction validation

### 🚀 Deployment Scripts (`deployment/`)

**Purpose**: Infrastructure deployment and environment management
**When to Use**: Staging deployments, environment provisioning

#### `deployment/deploy-staging.sh`

- **Function**: Complete staging environment deployment
- **Features**: Docker orchestration, health checks, service validation
- **Includes**: Database setup, Redis configuration, MCP services

#### `deployment/stop-staging.sh`

- **Function**: Clean shutdown of staging environment
- **Features**: Graceful service termination, resource cleanup

### 🎨 Development Scripts (`development/`)

**Purpose**: Development tools and build optimization
**When to Use**: Theme development, build processes, development workflow

#### `development/theme-build-optimizer.js`

- **Function**: Advanced theme validation and optimization
- **Features**: WCAG compliance, CSS optimization, performance analysis
- **Output**: Optimized CSS, accessibility reports, TypeScript definitions

## 🔗 Integration with Core Types

### Authentication Integration

The authentication testing scripts in `testing/auth/` are designed to work seamlessly with:

```typescript
// Core authentication types
import { User, LoginCredentials, AuthContextType } from "../src/types/auth";

// Extended testing types
import {
  TestUser,
  CreateTestUserRequest,
  TestScenario,
} from "./testing/auth/auth-testing-types";
```

This integration provides:

- **Type Safety**: Full TypeScript coverage for testing scenarios
- **Consistency**: Same interfaces used in production and testing
- **Extensibility**: Easy addition of new test scenarios
- **Maintainability**: Single source of truth for authentication types

### Widget System Integration

Widget testing scripts complement:

- `src/components/widgets/` - Widget implementations
- `tests/story-2.2/` - Automated widget tests
- `src/types/` - Widget type definitions

## 🚀 Getting Started

### Prerequisites

1. **Database**: PostgreSQL running on port 5432
2. **Backend**: StockPulse API running on port 8000
3. **Docker**: For deployment scripts
4. **Node.js**: For development scripts
5. **Python**: For setup and testing scripts

### Quick Start Guide

#### 1. Initial Setup

```bash
# Create admin user (run once)
cd StockPulse
python scripts/setup/create_admin_user.py

# Verify admin is active
python scripts/setup/activate_admin.py
```

#### 2. Testing Setup

```bash
# Create test users for authentication testing
python scripts/testing/auth/create_test_user.py

# Run widget manual testing
# Open scripts/testing/manual-widget-test.html in browser
```

#### 3. Development Workflow

```bash
# Optimize themes for production
node scripts/development/theme-build-optimizer.js

# Deploy to staging
./scripts/deployment/deploy-staging.sh

# Stop staging when done
./scripts/deployment/stop-staging.sh
```

## 🛡️ Security Standards

### Enterprise Security Compliance

All scripts follow enterprise security standards:

✅ **Input Validation**: All user inputs validated
✅ **SQL Injection Prevention**: Parameterized queries only
✅ **Password Security**: Proper hashing with bcrypt
✅ **Access Control**: Role-based permissions verification
✅ **Audit Logging**: Comprehensive execution logging
✅ **Error Handling**: Secure error messages without information leakage

### Testing Security

Authentication testing scripts include:

- **OWASP Top 10 Testing**: Comprehensive security vulnerability testing
- **Brute Force Protection**: Account lockout testing
- **Session Security**: Session management validation
- **CSRF Protection**: Token validation testing
- **Rate Limiting**: API rate limit verification

## 📊 Performance & Optimization

### Theme Optimization

The theme build optimizer provides:

- **CSS Minification**: Production-ready CSS output
- **Accessibility Validation**: WCAG 2.1 AA+ compliance
- **Performance Analysis**: Load time optimization
- **Browser Compatibility**: Cross-browser CSS generation

### Deployment Optimization

Staging deployment scripts include:

- **Health Checks**: Service availability verification
- **Resource Management**: Optimal resource allocation
- **Service Dependencies**: Proper startup order
- **Monitoring Integration**: Built-in status monitoring

## 🧹 Maintenance & Cleanup

### Test Data Management

Testing scripts include automatic cleanup:

- **Auto-cleanup**: Test data removal after execution
- **Preserve Production**: Admin and production data protection
- **Configurable Retention**: Adjustable cleanup policies

### Development Cleanup

Development scripts provide:

- **Build Artifacts**: Automatic cleanup of temporary files
- **Cache Management**: Development cache clearing
- **Log Rotation**: Automated log file management

## 📈 Monitoring & Reporting

### Execution Monitoring

All scripts provide:

- **Execution Metrics**: Performance and timing data
- **Success/Failure Tracking**: Comprehensive result reporting
- **Error Collection**: Detailed error information
- **Audit Trails**: Complete execution history

### Integration with CI/CD

Scripts are designed for:

- **Automated Execution**: CI/CD pipeline integration
- **Environment Testing**: Multi-environment support
- **Regression Testing**: Consistent test execution
- **Security Scanning**: Automated vulnerability assessment

## 🔄 Script Lifecycle Management

### Development Phase

- Theme optimization and validation
- Manual testing interfaces
- Development environment setup

### Testing Phase

- Comprehensive authentication testing
- Widget system validation
- Security vulnerability testing
- Performance testing

### Deployment Phase

- Staging environment provisioning
- Production deployment preparation
- Infrastructure validation

### Maintenance Phase

- Admin user management
- Data cleanup and maintenance
- System health monitoring

## 📚 Related Documentation

### Core Application

- `src/types/auth.ts` - Authentication type definitions
- `src/components/widgets/` - Widget implementations
- `services/backend/scripts/` - Backend utility scripts

### Testing Documentation

- `tests/story-2.2/` - Widget system tests
- `tests/story-1.2/` - Authentication tests
- `docs/testing/` - Testing documentation

### Deployment Documentation

- `docker-compose.staging.yml` - Staging configuration
- `docs/deployment/` - Deployment guides

## 🏆 Enterprise Standards Compliance

✅ **Architecture**: Layered, modular script organization
✅ **Type Safety**: Full TypeScript integration where applicable
✅ **Security**: Enterprise-grade security standards
✅ **Documentation**: Comprehensive documentation for all scripts
✅ **Maintainability**: Clear code organization and commenting
✅ **Scalability**: Multi-environment and enterprise deployment ready
✅ **Compliance**: OWASP, WCAG, and enterprise security standards

---

**Note**: This script directory follows enterprise architecture principles with clear separation of concerns, comprehensive type safety, and integration with the core StockPulse application types and interfaces.
