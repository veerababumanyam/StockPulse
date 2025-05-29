# Test Plan: Story 1.2 - User Login Flow

**Version:** 1.0
**Author:** Timmy (Architect Agent)
**Date:** May 29, 2025

## 1. Introduction

This document outlines the test plan for Story 1.2: "Implement User Login Flow," which includes client-side validation, HttpOnly cookie-based authentication, rate limiting, security features, and integration with the backend authentication API.

## 2. Scope

*   Testing the login form in `src/pages/auth/LoginPage.tsx` and `src/components/auth/LoginForm.tsx`.
*   Client-side input validations.
*   Integration with backend authentication API via `authService.login`.
*   HttpOnly cookie session management without localStorage dependency.
*   AuthContext state management and authentication persistence.
*   Security features: rate limiting, account lockout, CSRF protection.
*   Error handling for various failure scenarios.

## 3. Prerequisites

*   Backend authentication API must be running at `http://localhost:8000/api/v1/auth/`.
*   PostgreSQL database with user accounts for testing.
*   Redis for session storage and rate limiting.
*   Mock users created for testing various scenarios.
*   Frontend application running with proper CORS configuration.

## 4. Test Scenarios

### 4.1. Client-Side Validations
| Test Case ID | Description                                                                 | Expected Result                                                       |
|--------------|-----------------------------------------------------------------------------|-----------------------------------------------------------------------|
| TC_LOGIN_001 | Submit form with empty "Email address" field.                               | Error message: "Email is required". Form not submitted.                |
| TC_LOGIN_002 | Submit form with invalid email format (e.g., "test@test").                  | Error message: "Email is invalid". Form not submitted.               |
| TC_LOGIN_003 | Submit form with empty "Password" field.                                    | Error message: "Password is required". Form not submitted.            |
| TC_LOGIN_004 | Enter password and verify it's obscured/hidden as typed.                    | Password characters should be masked with dots/asterisks.            |
| TC_LOGIN_005 | Verify "Forgot Password?" link is present and clickable.                    | Link should navigate to `/forgot-password` page.                     |

### 4.2. Authentication Flow - Success Scenarios
| Test Case ID | Description                                                       | Expected Result                                                           |
|--------------|-------------------------------------------------------------------|---------------------------------------------------------------------------|
| TC_LOGIN_006 | Login with valid email and password for active user account.      | User logged in successfully, redirected to dashboard, AuthContext updated. |
| TC_LOGIN_007 | Login success should set HttpOnly cookies (access + refresh).     | Cookies set in browser with HttpOnly, Secure, SameSite attributes.     |
| TC_LOGIN_008 | Login success should set CSRF token for subsequent requests.      | CSRF token stored and included in future API requests.                 |
| TC_LOGIN_009 | After successful login, navigation to `/login` should redirect.   | Authenticated user redirected to dashboard when accessing login page.   |
| TC_LOGIN_010 | AuthContext `isAuthenticated` should be `true` after login.       | Authentication state properly reflected in context.                    |

### 4.3. Authentication Flow - Error Scenarios
| Test Case ID | Description                                                       | Expected Result                                                           |
|--------------|-------------------------------------------------------------------|---------------------------------------------------------------------------|
| TC_LOGIN_011 | Login with incorrect email address.                               | Error: "Invalid email or password". User not authenticated.            |
| TC_LOGIN_012 | Login with incorrect password.                                    | Error: "Invalid email or password". User not authenticated.            |
| TC_LOGIN_013 | Login with email of non-existent user.                           | Error: "Invalid email or password". User not authenticated.            |
| TC_LOGIN_014 | Login attempt with deactivated user account.                     | Error: "Account is deactivated". User not authenticated.               |
| TC_LOGIN_015 | Backend server error (500) during login.                         | Error: "Login failed. Please try again later." User not authenticated. |
| TC_LOGIN_016 | Network timeout during login request.                            | Error: "Login failed. Please try again." User not authenticated.       |

### 4.4. Security Features
| Test Case ID | Description                                                       | Expected Result                                                           |
|--------------|-------------------------------------------------------------------|---------------------------------------------------------------------------|
| TC_LOGIN_017 | Attempt 6 login requests within 1 minute from same IP.           | 6th request blocked with "Rate limit exceeded" error (5/minute limit).  |
| TC_LOGIN_018 | Multiple failed login attempts should trigger account lockout.    | Account locked with "Account temporarily locked" error.                |
| TC_LOGIN_019 | Login attempt from blocked IP address.                           | Error: "IP address temporarily blocked due to suspicious activity".     |
| TC_LOGIN_020 | Verify CSRF token is included in login request headers.          | X-CSRF-Token header present in login API call.                         |

### 4.5. Session Management & Persistence
| Test Case ID | Description                                                       | Expected Result                                                           |
|--------------|-------------------------------------------------------------------|---------------------------------------------------------------------------|
| TC_LOGIN_021 | Page refresh after successful login maintains authentication.     | User remains authenticated, AuthContext retains user data.             |
| TC_LOGIN_022 | Browser restart with valid session cookies.                      | User automatically authenticated on app load via `/auth/me` call.       |
| TC_LOGIN_023 | Session expiration handling (invalid/expired cookies).           | User logged out, redirected to login, error message displayed.         |
| TC_LOGIN_024 | Manual logout clears authentication state and cookies.           | User logged out, cookies cleared, AuthContext reset.                   |

### 4.6. Cross-Browser & Responsive Testing
| Test Case ID | Description                                                       | Expected Result                                                           |
|--------------|-------------------------------------------------------------------|---------------------------------------------------------------------------|
| TC_LOGIN_025 | Login functionality in Chrome, Firefox, Safari, Edge.            | Consistent behavior across all browsers.                               |
| TC_LOGIN_026 | Mobile responsive design (phone/tablet views).                   | Login form properly displayed and functional on mobile devices.        |
| TC_LOGIN_027 | Keyboard navigation (Tab, Enter) for accessibility.              | Form navigable and submittable using keyboard only.                    |

### 4.7. Integration Testing
| Test Case ID | Description                                                       | Expected Result                                                           |
|--------------|-------------------------------------------------------------------|---------------------------------------------------------------------------|
| TC_LOGIN_028 | Login flow integration with AuthContext provider.                | AuthContext properly updated with user data and authentication state.  |
| TC_LOGIN_029 | Protected route access after successful login.                   | User can access protected routes after authentication.                 |
| TC_LOGIN_030 | API interceptor handling of 401 unauthorized responses.          | Automatic logout and redirect to login on 401 errors.                 |
| TC_LOGIN_031 | CSRF protection integration across API calls.                    | CSRF token automatically included in state-changing requests.          |

## 5. Test Environment

*   **Frontend:** React application running on `http://localhost:3000`
*   **Backend:** FastAPI application running on `http://localhost:8000`
*   **Database:** PostgreSQL with test user accounts
*   **Cache:** Redis for session storage and rate limiting
*   **Browsers:** Latest Chrome, Firefox, Safari, Edge
*   **Devices:** Desktop, tablet, mobile viewports

## 6. Test Data

### 6.1. Test User Accounts
```sql
-- Active test user
INSERT INTO users (email, password_hash, is_active) VALUES 
('testuser@example.com', '$2b$12$...', true);

-- Inactive test user  
INSERT INTO users (email, password_hash, is_active) VALUES 
('inactive@example.com', '$2b$12$...', false);

-- User for lockout testing
INSERT INTO users (email, password_hash, is_active, failed_login_attempts, locked_until) VALUES 
('locked@example.com', '$2b$12$...', true, 5, NOW() + INTERVAL '30 minutes');
```

### 6.2. Test Credentials
| Purpose | Email | Password | Expected Result |
|---------|--------|----------|-----------------|
| Valid Login | testuser@example.com | Password123! | Success |
| Invalid Password | testuser@example.com | wrongpassword | Failure |
| Inactive Account | inactive@example.com | Password123! | Account Deactivated |
| Non-existent | nobody@example.com | Password123! | Invalid Credentials |

## 7. Test Execution

### 7.1. Manual Testing
*   Execute test scenarios manually using browser developer tools.
*   Verify network requests, cookie settings, and error responses.
*   Test responsive design across different screen sizes.

### 7.2. Automated Testing
*   **Unit Tests:** Jest/RTL for component rendering and validation logic.
*   **Integration Tests:** Testing Library for AuthContext integration.
*   **E2E Tests:** Playwright for full login flow testing.
*   **API Tests:** Jest for authService functions and error handling.

## 8. Success Criteria

✅ **All 31 test cases pass**  
✅ **Security features (rate limiting, CSRF) functional**  
✅ **HttpOnly cookie authentication working**  
✅ **Cross-browser compatibility verified**  
✅ **Mobile responsive design confirmed**  
✅ **Accessibility standards met (WCAG 2.1 AA)**  
✅ **Error handling robust and user-friendly**  
✅ **Session persistence working correctly**  

## 9. Test Results Documentation

| Test Case ID | Status | Date Tested | Tester | Notes | Issues Found |
|--------------|--------|-------------|--------|-------|--------------|
| TC_LOGIN_001 | ⏳ Pending | - | - | - | - |
| TC_LOGIN_002 | ⏳ Pending | - | - | - | - |
| ... | ... | ... | ... | ... | ... |

## 10. Known Issues & Limitations

*   **MCP Agent Integration:** Story 1.2 mentions MCP agent notifications but current implementation has placeholder code (TODO comments).
*   **Production HTTPS:** Secure cookie attributes need production HTTPS setup.
*   **Rate Limiting:** Redis-based rate limiting implemented but needs stress testing.

## 11. Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Session Security | High | HttpOnly cookies + CSRF protection implemented |
| Rate Limiting Bypass | Medium | Multiple layers: IP + account-based limiting |
| Authentication State Sync | Medium | API-based state checking via `/auth/me` |
| Cross-Browser Cookie Issues | Low | Standard cookie attributes used |

---

This test plan provides comprehensive coverage for the User Login Flow implementation. Execute tests in sequence and document results for each test case to ensure quality and security standards are met. 