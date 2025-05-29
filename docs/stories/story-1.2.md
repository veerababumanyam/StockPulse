# Story 1.2: Implement User Login Flow

**Epic:** [Core User Authentication and Account Setup](../epic-1.md)
**Status:** Draft
**Priority:** High
**Points:** (Estimate)
**Assigned To:**
**Sprint:**

## 1. User Story

> As an existing user,
> I want to be able to log in to my StockPulse account using my email and password,
> So that I can access my portfolio and trading tools.

## 2. Requirements

*   Provide a user login form accessible via a dedicated route (e.g., `/login`).
*   The form must collect:
    *   Email address
    *   Password
*   Implement client-side validation for:
    *   Email format (must be a valid email structure).
    *   Password (must not be empty).
*   On form submission, securely transmit user credentials to the backend login API endpoint.
*   Upon successful login (as indicated by the backend API):
    *   Store session information (e.g., JWT token) securely on the client-side (e.g., HttpOnly cookie managed by backend, or secure local storage if appropriate for the auth model).
    *   Redirect the user to their main dashboard (e.g., `/dashboard`).
*   Display clear, user-friendly error messages for:
    *   Client-side validation failures.
    *   API-side errors (e.g., invalid credentials, account locked, server error).
*   Input field for password should obscure the entered text.
*   Include a "Forgot Password?" link (functionality to be implemented in a separate story).

## 3. Acceptance Criteria (ACs)

1.  **AC1:** Given a user is on the login page (`/login`), when they enter their correct registered email and password and submit the form, then the login is successful via the backend API, session information is stored, and the user is redirected to the dashboard page (`/dashboard`).
2.  **AC2:** Given a user is on the login page, when they attempt to submit the form with an invalid email format, then a client-side validation error message is displayed for the email field, and the form is not submitted.
3.  **AC3:** Given a user is on the login page, when they attempt to submit the form with an empty password field, then a client-side validation error message is displayed for the password field, and the form is not submitted.
4.  **AC4:** Given a user attempts to log in with an incorrect email or password, when the form is submitted, then an appropriate error message (e.g., "Invalid email or password.") is displayed, sourced from the backend API response.
5.  **AC5:** Given a user is on the login page, the password input field must obscure the characters as they are typed.
6.  **AC6:** Given any server-side error occurs during the login API call (other than invalid credentials), then a generic but user-friendly error message (e.g., "Login failed. Please try again later.") is displayed.
7.  **AC7:** A "Forgot Password?" link is visible on the login page, though it may initially link to a placeholder page or show a "Coming Soon" message until the password reset feature (Story 1.x) is implemented.

## 4. Technical Guidance for Developer Agent

*   **Relevant PRD Sections:** (Same as Story 1.1 initially)
    *   `PRD.md#3.5.1`
    *   `PRD.md#4.3`
*   **Relevant Architecture Sections:**
    *   `architecture.md#3.1.1` (Frontend Architecture)
    *   `architecture.md#3.1.2` (State Management, Auth Context)
    *   `architecture.md#5.1` (Authentication & Authorization - JWT)
*   **Key Components/Modules to be affected/created:**
    *   New Page: `src/pages/auth/LoginPage.tsx`
    *   Router update: Add route for `/login`.
    *   New Components: Potentially `src/components/auth/LoginForm.tsx`.
    *   Service: `src/services/authService.ts` to include a `loginUser` function and potentially functions to manage session/token.
    *   Context: `src/contexts/AuthContext.tsx` will likely be used to manage and provide authentication state (user object, token, isAuthenticated status) to the rest of the application.
*   **API Endpoints Involved:**
    *   `POST /api/v1/auth/login` (Backend to confirm exact path and payload structure)
        *   Expected Request Body: `{ "email": "user@example.com", "password": "Password123!" }`
        *   Expected Success Response (200): `{ "token": "jwt.token.string", "user": { "id": "uuid", "email": "..." } }`
        *   Expected Error Responses (400, 401, 500): `{ "error": "Descriptive error message" }`
*   **Styling/UI Notes:**
    *   Refer to `StockPulse_Design.md` for auth screen layouts, form styling.
    *   Ensure consistency with the `RegisterPage` styling.
*   **Error Handling Notes:**
    *   Client-side validation before API call.
    *   User-friendly messages for API errors.
*   **Security Considerations:**
    *   Secure storage and handling of JWT token (e.g., if using localStorage, be aware of XSS risks; HttpOnly cookies are generally preferred if backend sets them).
    *   Prevent credential stuffing (e.g., rate limiting on backend).

## 5. Tasks / Subtasks

1.  **Task 1 (AC1, AC5):** Create `LoginPage.tsx` and `LoginForm.tsx` component structure.
    *   Add form fields (email, password).
    *   Ensure password field obscures text.
2.  **Task 2 (AC2, AC3):** Implement client-side validation for email and password.
3.  **Task 3 (AC1, AC4, AC6):** Implement `authService.ts` function to call backend login API.
    *   Handle API responses, including storing token and user data upon success (e.g., in AuthContext and secure storage).
4.  **Task 4 (AC1):** Integrate API call into `LoginForm.tsx` submission handler.
    *   On successful login, update AuthContext and redirect to dashboard.
5.  **Task 5 (AC1, AC4, AC6):** Display API-sourced error messages.
6.  **Task 6 (N/A):** Add routing for `/login`.
7.  **Task 7 (AC7):** Add "Forgot Password?" link to the form.
8.  **Task 8 (N/A):** Write unit tests.
9.  **Task 9 (N/A):** Style page and form according to `StockPulse_Design.md`.

## 6. Definition of Done (DoD)

*   All Acceptance Criteria (AC1-AC7) met.
*   Code implemented, reviewed, merged.
*   Unit tests written, >80% coverage for new code.
*   Integrated with functional backend login endpoint.
*   Login page responsive and aligns with design.
*   No console errors/warnings.
*   Session information (e.g., token) is securely stored and used to maintain login state across application (via AuthContext).

## 7. Notes / Questions

*   Confirm JWT storage strategy (HttpOnly cookie vs. localStorage/sessionStorage).
*   Confirm exact API endpoint and payload/response for login.
*   "Forgot Password?" link will initially be a placeholder.

## 8. Design / UI Mockup Links (If Applicable)

*   Refer to `docs/StockPulse_Design.md` for general auth screen layouts.

## Story Progress Notes

### Agent Model Used: `<Agent Model Name/Version>`

### Completion Notes List

{Any notes about implementation choices, difficulties, or follow-up needed}

### Change Log 