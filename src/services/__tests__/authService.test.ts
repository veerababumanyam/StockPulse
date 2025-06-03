import { authService } from "./authService";
import { aiAgentService } from "./aiAgentService";
import { server } from "../mocks/server"; // Assuming MSW server setup is in src/mocks/server.ts
import { http, HttpResponse } from "msw";
import { LoginCredentials, RegisterCredentials } from "../types/auth";
import { getEnvVar } from "../utils/env";

// Helper to control mock responses for aiAgentService directly for some tests if needed,
// or rely on MSW handlers via setMockFraudScenario / setMockRegistrationScenario from handlers.ts
// For service tests, directly mocking the imported service (aiAgentService) is often cleaner.

jest.mock("./aiAgentService", () => ({
  aiAgentService: {
    assessRegistrationFraud: jest.fn(),
  },
}));

// Mock API configuration for tests
const API_BASE_URL = getEnvVar("VITE_API_BASE_URL", "/api/v1");

describe("authService.registerUser", () => {
  const mockUserData = {
    name: "Test User",
    email: "test@example.com",
    password: "Password123!",
    userAgent: "test-agent",
  };

  beforeAll(() => server.listen()); // MSW server listen
  afterEach(() => {
    server.resetHandlers(); // Reset MSW handlers
    jest.clearAllMocks(); // Clear Jest mocks
  });
  afterAll(() => server.close()); // MSW server close

  it("should register user successfully with low-risk fraud assessment", async () => {
    // Mock aiAgentService directly for this specific service test
    (aiAgentService.assessRegistrationFraud as jest.Mock).mockResolvedValueOnce(
      {
        riskScore: 0.1,
        assessment: "low-risk",
      },
    );

    // MSW mock for the main registration call
    server.use(
      http.post(`${API_BASE_URL}/auth/register`, () => {
        return HttpResponse.json(
          { userId: "123", token: "abc" },
          { status: 201 },
        );
      }),
    );

    const result = await authService.registerUser(mockUserData);
    expect(result).toEqual({ userId: "123", token: "abc" });
    expect(aiAgentService.assessRegistrationFraud).toHaveBeenCalledWith({
      email: mockUserData.email,
      ipAddress: undefined, // as per current AuthContext logic
      userAgent: mockUserData.userAgent,
    });
  });

  it("should register user successfully with medium-risk fraud assessment and return fraudContext", async () => {
    const mediumRiskReason = "Medium risk detected for testing";
    (aiAgentService.assessRegistrationFraud as jest.Mock).mockResolvedValueOnce(
      {
        riskScore: 0.6,
        assessment: "medium-risk",
        reason: mediumRiskReason,
      },
    );
    server.use(
      http.post(`${API_BASE_URL}/auth/register`, () => {
        return HttpResponse.json(
          { userId: "124", token: "def" },
          { status: 201 },
        );
      }),
    );

    const result = await authService.registerUser(mockUserData);
    expect(result).toEqual({
      userId: "124",
      token: "def",
      fraudContext: {
        assessment: "medium-risk",
        reason: mediumRiskReason,
      },
    });
  });

  it("should throw error and block registration for high-risk fraud assessment", async () => {
    (aiAgentService.assessRegistrationFraud as jest.Mock).mockResolvedValueOnce(
      {
        riskScore: 0.9,
        assessment: "high-risk",
        reason: "High risk detected",
      },
    );

    // Main registration call should not be made, so no need to mock it here specifically for success

    await expect(authService.registerUser(mockUserData)).rejects.toThrow(
      "Registration blocked due to high fraud risk. Reason: High risk detected",
    );
  });

  it("should throw error if aiAgentService.assessRegistrationFraud fails", async () => {
    (aiAgentService.assessRegistrationFraud as jest.Mock).mockRejectedValueOnce(
      new Error("Fraud agent network error"),
    );

    await expect(authService.registerUser(mockUserData)).rejects.toThrow(
      "Fraud agent network error",
    );
  });

  it("should throw error if main registration API call fails (e.g., email exists)", async () => {
    (aiAgentService.assessRegistrationFraud as jest.Mock).mockResolvedValueOnce(
      {
        riskScore: 0.2,
        assessment: "low-risk",
      },
    );
    server.use(
      http.post(`${API_BASE_URL}/auth/register`, () => {
        return HttpResponse.json(
          { message: "Email already exists" },
          { status: 409 },
        );
      }),
    );

    await expect(authService.registerUser(mockUserData)).rejects.toThrow(
      "Email already exists",
    );
  });

  it("should throw error for an unknown error during the process", async () => {
    // Simulate a non-Error object being thrown by one of the mocked functions
    (aiAgentService.assessRegistrationFraud as jest.Mock).mockRejectedValueOnce(
      "some string error", // Not an instance of Error
    );

    await expect(authService.registerUser(mockUserData)).rejects.toThrow(
      "An unknown error occurred during registration.", // As wrapped by authService
    );
  });
});
