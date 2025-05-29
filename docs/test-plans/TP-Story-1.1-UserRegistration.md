# Test Plan: Story 1.1 - User Registration Flow

**Version:** 1.0
**Author:** James (Full Stack Dev Agent)
**Date:** (Today's Date)

## 1. Introduction

This document outlines the test plan for Story 1.1: "Implement User Registration Flow," which includes client-side validation, integration with a mocked AI Fraud Detection Agent, and handling responses from a mocked main User Registration API.

## 2. Scope

*   Testing the multi-step registration form in `src/pages/auth/Register.tsx`.
*   Client-side input validations.
*   Interaction with mocked `aiAgentService.assessRegistrationFraud`.
*   Interaction with mocked main registration API via `authService.registerUser`.
*   UI feedback for success, errors, and advisory messages (medium fraud risk).

## 3. Prerequisites

*   Mock API handlers for `/api/v1/agents/fraud-detection/assess-registration` and `/api/v1/auth/register` must be implemented and configurable to return different scenarios (as defined in the "Mock API Setup Definition").
*   The application should be running in a development environment where these mocks are active.

## 4. Test Scenarios

### 4.1. Client-Side Validations (Step 1: Account Information)
| Test Case ID | Description                                                                 | Expected Result                                                       |
|--------------|-----------------------------------------------------------------------------|-----------------------------------------------------------------------|
| TC_REG_001   | Submit Step 1 with empty "Full Name".                                       | Error message: "Name is required". Form not submitted.                |
| TC_REG_002   | Submit Step 1 with empty "Email address".                                   | Error message: "Email is required". Form not submitted.               |
| TC_REG_003   | Submit Step 1 with an invalid email format (e.g., "test@test").             | Error message: "Email is invalid". Form not submitted.                |
| TC_REG_004   | Submit Step 1 with an empty "Password".                                     | Error message: "Password is required". Form not submitted.            |
| TC_REG_005   | Submit Step 1 with a password less than 8 characters.                       | Error message detailing password strength requirements. Form not submitted. |
| TC_REG_006   | Submit Step 1 with a password missing an uppercase letter.                  | Error message detailing password strength requirements. Form not submitted. |
| TC_REG_007   | Submit Step 1 with a password missing a lowercase letter.                  | Error message detailing password strength requirements. Form not submitted. |
| TC_REG_008   | Submit Step 1 with a password missing a number.                             | Error message detailing password strength requirements. Form not submitted. |
| TC_REG_009   | Submit Step 1 with a password missing a special character.                  | Error message detailing password strength requirements. Form not submitted. |
| TC_REG_010   | Submit Step 1 with "Password" and "Confirm Password" not matching.          | Error message: "Passwords do not match". Form not submitted.          |

### 4.2. Client-Side Validations (Step 2: Trading Profile)
| Test Case ID | Description                                                       | Expected Result                                                           |
|--------------|-------------------------------------------------------------------|---------------------------------------------------------------------------|
| TC_REG_011   | Progress to Step 2, submit with "Trading Experience" not selected.  | Error message: "Trading experience is required". Form not submitted.    |
| TC_REG_012   | Progress to Step 2, submit with "Risk Tolerance" not selected.      | Error message: "Risk tolerance is required". Form not submitted.        |

### 4.3. Client-Side Validations (Step 3: Terms and Completion)
| Test Case ID | Description                                                       | Expected Result                                                           |
|--------------|-------------------------------------------------------------------|---------------------------------------------------------------------------|
| TC_REG_013   | Progress to Step 3, submit without accepting "Terms and Conditions".| Error message: "You must accept the terms and conditions". Form not submitted. |

### 4.4. End-to-End Registration Flows (All steps valid client-side)

| Test Case ID | Fraud Agent Mock                                  | Main Reg API Mock      | Expected UI Outcome                                                                                             | Expected Auth State |
|--------------|---------------------------------------------------|------------------------|-----------------------------------------------------------------------------------------------------------------|---------------------|
| TC_REG_E2E_001 | Returns "low-risk"                                | Returns Success        | No error/advisory. Redirection/login occurs (simulated by AuthContext update).                                  | User authenticated  |
| TC_REG_E2E_002 | Returns "medium-risk" (reason: "Needs review")  | Returns Success        | Yellow advisory: "Needs review". Redirection/login occurs.                                                      | User authenticated  |
| TC_REG_E2E_003 | Returns "high-risk" (reason: "Blocked pattern") | (Not Called)           | Red error: "Registration blocked due to high fraud risk. Reason: Blocked pattern". No redirection.            | User NOT auth.    |
| TC_REG_E2E_004 | Returns "low-risk"                                | Returns Email Exists   | Red error: "Error: Email already in use. Please try logging in.". No redirection.                             | User NOT auth.    |
| TC_REG_E2E_005 | Returns "medium-risk"                             | Returns Email Exists   | Red error: "Error: Email already in use. Please try logging in.". (Advisory might appear briefly then error). | User NOT auth.    |
| TC_REG_E2E_006 | Returns "low-risk"                                | Returns Server Error   | Red error: "Registration failed with status: 500" (or similar). No redirection.                                | User NOT auth.    |
| TC_REG_E2E_007 | Returns API Error (e.g., HTTP 500)                | (Not Called)           | Red error: "Fraud assessment failed..." (or similar). No redirection.                                           | User NOT auth.    |

## 5. Test Environment

*   Browser: Latest Chrome/Firefox/Edge
*   Local development server with mock API handlers active.

## 6. Test Execution

*   Manual execution of scenarios by QA or developer.
*   Automated unit tests (Jest/RTL) will cover component rendering, validation logic, and service interactions with mocks.

## 7. Reporting

*   Test results will be logged with pass/fail status.
*   Any defects found will be reported in the project's issue tracker.

---
This test plan provides a good overview. The next step would be to actually implement the mock handlers and then execute these tests, both manually and by writing corresponding automated unit/integration tests. 