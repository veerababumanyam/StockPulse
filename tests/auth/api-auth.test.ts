import { test, expect } from "@playwright/test";

// API Test configuration
const API_CONFIG = {
  baseUrl: "http://localhost:8000",
  endpoints: {
    login: "/api/v1/auth/login",
    logout: "/api/v1/auth/logout",
    register: "/api/v1/auth/register",
    me: "/api/v1/auth/me",
    refresh: "/api/v1/auth/refresh",
    adminPendingUsers: "/api/v1/auth/admin/pending-users",
    adminApproveUser: "/api/v1/auth/admin/approve-user",
    health: "/health",
  },
  credentials: {
    admin: { email: "admin@sp.com", password: "admin@123" },
    user: { email: "user@sp.com", password: "user@123" },
    invalid: { email: "invalid@test.com", password: "wrongpassword" },
    newUser: {
      email: "newuser@test.com",
      password: "newpassword123",
      full_name: "New Test User",
    },
  },
  delays: {
    betweenRequests: 1000,
    afterFailedRequest: 2000,
  },
};

// Helper function to add delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

test.describe("API Authentication Tests", () => {
  test.describe("Health Check", () => {
    test("should respond to health check", async ({ request }) => {
      const response = await request.get(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.health}`,
      );
      expect(response.status()).toBe(200);
    });
  });

  test.describe("Login API Endpoint", () => {
    test("should successfully login with valid admin credentials", async ({
      request,
    }) => {
      await delay(API_CONFIG.delays.betweenRequests);

      const response = await request.post(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.login}`,
        {
          data: {
            email: API_CONFIG.credentials.admin.email,
            password: API_CONFIG.credentials.admin.password,
          },
        },
      );

      expect(response.status()).toBe(200);

      const responseData = await response.json();
      expect(responseData.user.email).toBe(API_CONFIG.credentials.admin.email);
      expect(responseData.user.role).toBe("admin");
      expect(responseData.user.status).toBe("APPROVED");
      expect(responseData.message).toBe("Login successful");

      // Verify response headers
      const headers = response.headers();
      expect(headers["content-type"]).toContain("application/json");

      // Verify cookies are set
      const cookies = headers["set-cookie"];
      expect(cookies).toBeDefined();
    });

    test("should successfully login with valid user credentials", async ({
      request,
    }) => {
      await delay(API_CONFIG.delays.betweenRequests);

      const response = await request.post(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.login}`,
        {
          data: {
            email: API_CONFIG.credentials.user.email,
            password: API_CONFIG.credentials.user.password,
          },
        },
      );

      expect(response.status()).toBe(200);

      const responseData = await response.json();
      expect(responseData.user.email).toBe(API_CONFIG.credentials.user.email);
      expect(responseData.user.role).toBe("user");
      expect(responseData.message).toBe("Login successful");
    });

    test("should reject invalid credentials", async ({ request }) => {
      await delay(API_CONFIG.delays.betweenRequests);

      const response = await request.post(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.login}`,
        {
          data: {
            email: API_CONFIG.credentials.invalid.email,
            password: API_CONFIG.credentials.invalid.password,
          },
        },
      );

      expect(response.status()).toBe(401);

      const responseData = await response.json();
      expect(responseData.detail).toContain("Invalid credentials");

      await delay(API_CONFIG.delays.afterFailedRequest);
    });

    test("should validate required fields", async ({ request }) => {
      await delay(API_CONFIG.delays.betweenRequests);

      // Test missing email
      const responseNoEmail = await request.post(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.login}`,
        {
          data: {
            password: API_CONFIG.credentials.admin.password,
          },
        },
      );

      expect(responseNoEmail.status()).toBe(422);

      await delay(API_CONFIG.delays.betweenRequests);

      // Test missing password
      const responseNoPassword = await request.post(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.login}`,
        {
          data: {
            email: API_CONFIG.credentials.admin.email,
          },
        },
      );

      expect(responseNoPassword.status()).toBe(422);

      await delay(API_CONFIG.delays.betweenRequests);

      // Test empty request
      const responseEmpty = await request.post(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.login}`,
        {
          data: {},
        },
      );

      expect(responseEmpty.status()).toBe(422);
    });

    test("should validate email format", async ({ request }) => {
      await delay(API_CONFIG.delays.betweenRequests);

      const response = await request.post(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.login}`,
        {
          data: {
            email: "invalid-email-format",
            password: API_CONFIG.credentials.admin.password,
          },
        },
      );

      expect(response.status()).toBe(422);

      const responseData = await response.json();
      expect(responseData.detail[0].msg).toContain(
        "value is not a valid email address",
      );
    });
  });

  test.describe("Registration API Endpoint", () => {
    test("should register new user with valid data", async ({ request }) => {
      await delay(API_CONFIG.delays.betweenRequests);

      const uniqueEmail = `test-${Date.now()}@example.com`;

      const response = await request.post(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.register}`,
        {
          data: {
            email: uniqueEmail,
            password: API_CONFIG.credentials.newUser.password,
            full_name: API_CONFIG.credentials.newUser.full_name,
          },
        },
      );

      // Registration might return 201 or 200 depending on implementation
      expect([200, 201]).toContain(response.status());

      const responseData = await response.json();
      expect(responseData.user.email).toBe(uniqueEmail);
      expect(responseData.user.full_name).toBe(
        API_CONFIG.credentials.newUser.full_name,
      );
      expect(responseData.user.role).toBe("user");
      expect(responseData.user.status).toBe("PENDING");
    });

    test("should reject duplicate email registration", async ({ request }) => {
      await delay(API_CONFIG.delays.betweenRequests);

      // Try to register with existing admin email
      const response = await request.post(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.register}`,
        {
          data: {
            email: API_CONFIG.credentials.admin.email,
            password: API_CONFIG.credentials.newUser.password,
            full_name: API_CONFIG.credentials.newUser.full_name,
          },
        },
      );

      // Could be 400 or 422 depending on validation implementation
      expect([400, 422]).toContain(response.status());

      const responseData = await response.json();
      // Check for either error message format
      const errorText = JSON.stringify(responseData);
      expect(errorText.toLowerCase()).toMatch(
        /email.*already|duplicate|exists/,
      );
    });

    test("should validate password strength", async ({ request }) => {
      await delay(API_CONFIG.delays.betweenRequests);

      const response = await request.post(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.register}`,
        {
          data: {
            email: "test@example.com",
            password: "123", // Weak password
            full_name: "Test User",
          },
        },
      );

      expect(response.status()).toBe(422);

      const responseData = await response.json();
      const errorText = JSON.stringify(responseData);
      expect(errorText.toLowerCase()).toMatch(
        /password.*8.*character|ensure.*value.*least/,
      );
    });
  });

  test.describe("Protected Endpoints", () => {
    test("should access user profile with valid authentication", async ({
      request,
    }) => {
      await delay(API_CONFIG.delays.betweenRequests);

      // Login first
      const loginResponse = await request.post(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.login}`,
        {
          data: {
            email: API_CONFIG.credentials.user.email,
            password: API_CONFIG.credentials.user.password,
          },
        },
      );

      expect(loginResponse.status()).toBe(200);

      // Extract cookies from login response
      const setCookieHeader = loginResponse.headers()["set-cookie"];
      let cookies = "";
      if (Array.isArray(setCookieHeader)) {
        cookies = setCookieHeader
          .map((cookie) => cookie.split(";")[0])
          .join("; ");
      } else if (setCookieHeader) {
        cookies = setCookieHeader.split(";")[0];
      }

      await delay(API_CONFIG.delays.betweenRequests);

      // Access profile using /me endpoint
      const profileResponse = await request.get(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.me}`,
        {
          headers: {
            Cookie: cookies,
          },
        },
      );

      expect(profileResponse.status()).toBe(200);

      const profileData = await profileResponse.json();
      expect(profileData.email).toBe(API_CONFIG.credentials.user.email);
      expect(profileData.role).toBe("user");
    });

    test("should reject access to user profile without authentication", async ({
      request,
    }) => {
      await delay(API_CONFIG.delays.betweenRequests);

      const response = await request.get(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.me}`,
      );

      expect(response.status()).toBe(401);
    });

    test("should access admin endpoints with admin authentication", async ({
      request,
    }) => {
      await delay(API_CONFIG.delays.betweenRequests);

      // Login as admin
      const loginResponse = await request.post(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.login}`,
        {
          data: {
            email: API_CONFIG.credentials.admin.email,
            password: API_CONFIG.credentials.admin.password,
          },
        },
      );

      expect(loginResponse.status()).toBe(200);

      // Extract cookies
      const setCookieHeader = loginResponse.headers()["set-cookie"];
      let cookies = "";
      if (Array.isArray(setCookieHeader)) {
        cookies = setCookieHeader
          .map((cookie) => cookie.split(";")[0])
          .join("; ");
      } else if (setCookieHeader) {
        cookies = setCookieHeader.split(";")[0];
      }

      await delay(API_CONFIG.delays.betweenRequests);

      // Access admin endpoint
      const adminResponse = await request.get(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.adminPendingUsers}`,
        {
          headers: {
            Cookie: cookies,
          },
        },
      );

      expect(adminResponse.status()).toBe(200);

      const adminData = await adminResponse.json();
      expect(Array.isArray(adminData)).toBe(true);
    });

    test("should reject user access to admin endpoints", async ({
      request,
    }) => {
      await delay(API_CONFIG.delays.betweenRequests);

      // Login as regular user
      const loginResponse = await request.post(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.login}`,
        {
          data: {
            email: API_CONFIG.credentials.user.email,
            password: API_CONFIG.credentials.user.password,
          },
        },
      );

      expect(loginResponse.status()).toBe(200);

      // Extract cookies
      const setCookieHeader = loginResponse.headers()["set-cookie"];
      let cookies = "";
      if (Array.isArray(setCookieHeader)) {
        cookies = setCookieHeader
          .map((cookie) => cookie.split(";")[0])
          .join("; ");
      } else if (setCookieHeader) {
        cookies = setCookieHeader.split(";")[0];
      }

      await delay(API_CONFIG.delays.betweenRequests);

      // Try to access admin endpoint
      const adminResponse = await request.get(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.adminPendingUsers}`,
        {
          headers: {
            Cookie: cookies,
          },
        },
      );

      expect(adminResponse.status()).toBe(403);
    });
  });

  test.describe("Logout API Endpoint", () => {
    test("should successfully logout authenticated user", async ({
      request,
    }) => {
      await delay(API_CONFIG.delays.betweenRequests);

      // First login to get session
      const loginResponse = await request.post(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.login}`,
        {
          data: {
            email: API_CONFIG.credentials.admin.email,
            password: API_CONFIG.credentials.admin.password,
          },
        },
      );

      expect(loginResponse.status()).toBe(200);

      // Extract cookies from login response
      const setCookieHeader = loginResponse.headers()["set-cookie"];
      let cookies = "";
      if (Array.isArray(setCookieHeader)) {
        cookies = setCookieHeader
          .map((cookie) => cookie.split(";")[0])
          .join("; ");
      } else if (setCookieHeader) {
        cookies = setCookieHeader.split(";")[0];
      }

      await delay(API_CONFIG.delays.betweenRequests);

      // Now logout
      const logoutResponse = await request.post(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.logout}`,
        {
          headers: {
            Cookie: cookies,
          },
        },
      );

      expect(logoutResponse.status()).toBe(200);

      const responseData = await logoutResponse.json();
      expect(responseData.message).toBe("Logout successful");
    });

    test("should handle logout without authentication", async ({ request }) => {
      await delay(API_CONFIG.delays.betweenRequests);

      const response = await request.post(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.logout}`,
      );

      expect(response.status()).toBe(401);
    });
  });

  test.describe("Security Features", () => {
    test("should set secure HTTP-only cookies", async ({ request }) => {
      await delay(API_CONFIG.delays.betweenRequests);

      const response = await request.post(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.login}`,
        {
          data: {
            email: API_CONFIG.credentials.admin.email,
            password: API_CONFIG.credentials.admin.password,
          },
        },
      );

      const cookies = response.headers()["set-cookie"];
      expect(cookies).toBeDefined();

      // Check for HttpOnly flag
      const cookieString = Array.isArray(cookies)
        ? cookies.join("; ")
        : cookies;
      expect(cookieString).toContain("HttpOnly");
    });

    test("should not expose sensitive data in error responses", async ({
      request,
    }) => {
      await delay(API_CONFIG.delays.betweenRequests);

      const response = await request.post(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.login}`,
        {
          data: {
            email: API_CONFIG.credentials.invalid.email,
            password: API_CONFIG.credentials.invalid.password,
          },
        },
      );

      const responseData = await response.json();
      const responseText = JSON.stringify(responseData);

      // Should not contain sensitive information
      expect(responseText).not.toContain("password");
      expect(responseText).not.toContain("hash");
      expect(responseText).not.toContain("salt");
      expect(responseText).not.toContain("secret");

      await delay(API_CONFIG.delays.afterFailedRequest);
    });

    test("should handle malformed JSON gracefully", async ({ request }) => {
      await delay(API_CONFIG.delays.betweenRequests);

      try {
        const response = await request.post(
          `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.login}`,
          {
            data: '{"email": "test@test.com", "password":}', // Malformed JSON
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        expect(response.status()).toBe(422);
      } catch (error) {
        // Playwright might throw an error for malformed JSON, which is also acceptable
        expect(error.message).toContain("JSON");
      }
    });
  });

  test.describe("Error Handling", () => {
    test("should return proper error format for validation errors", async ({
      request,
    }) => {
      await delay(API_CONFIG.delays.betweenRequests);

      const response = await request.post(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.login}`,
        {
          data: {
            email: "invalid-email",
            password: "",
          },
        },
      );

      expect(response.status()).toBe(422);

      const responseData = await response.json();
      expect(responseData.detail).toBeDefined();
      expect(Array.isArray(responseData.detail)).toBe(true);

      // Check error structure
      const error = responseData.detail[0];
      expect(error.loc).toBeDefined();
      expect(error.msg).toBeDefined();
      expect(error.type).toBeDefined();
    });

    test("should return consistent error format across endpoints", async ({
      request,
    }) => {
      await delay(API_CONFIG.delays.betweenRequests);

      // Test login endpoint error
      const loginError = await request.post(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.login}`,
        {
          data: { email: "invalid" },
        },
      );

      await delay(API_CONFIG.delays.betweenRequests);

      // Test register endpoint error
      const registerError = await request.post(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.register}`,
        {
          data: { email: "invalid" },
        },
      );

      const loginData = await loginError.json();
      const registerData = await registerError.json();

      // Both should have consistent error structure
      expect(loginData.detail).toBeDefined();
      expect(registerData.detail).toBeDefined();
      expect(typeof loginData.detail).toBe(typeof registerData.detail);
    });
  });

  test.describe("API Documentation Compliance", () => {
    test("should match OpenAPI specification", async ({ request }) => {
      const specResponse = await request.get(
        `${API_CONFIG.baseUrl}/openapi.json`,
      );
      expect(specResponse.status()).toBe(200);

      const spec = await specResponse.json();

      // Verify login endpoint exists in spec
      expect(spec.paths[API_CONFIG.endpoints.login]).toBeDefined();
      expect(spec.paths[API_CONFIG.endpoints.login].post).toBeDefined();

      // Verify response schemas
      const loginPost = spec.paths[API_CONFIG.endpoints.login].post;
      expect(loginPost.responses["200"]).toBeDefined();
      expect(loginPost.responses["422"]).toBeDefined();
    });

    test("should provide proper API documentation", async ({ request }) => {
      const docsResponse = await request.get(`${API_CONFIG.baseUrl}/docs`);
      expect(docsResponse.status()).toBe(200);

      const docsContent = await docsResponse.text();
      expect(docsContent).toContain("StockPulse API");
      expect(docsContent).toContain("swagger-ui");
    });
  });
});
