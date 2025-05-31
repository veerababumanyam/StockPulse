import { http, HttpResponse, RequestHandler } from 'msw'; // Mock Service Worker v2 syntax
import { getEnvVar } from '../utils/env';

const API_BASE_URL = getEnvVar('VITE_API_BASE_URL', '/api/v1');

// --- Control flags for mock responses (you would set these in your tests) ---
// Example:
// let mockFraudAssessmentScenario = 'low-risk'; // 'low-risk', 'medium-risk', 'high-risk', 'error'
// let mockRegistrationScenario = 'success'; // 'success', 'emailExists', 'error'

// Define a type for our fraud assessment request if needed for req.json()
// interface FraudRequestBody { email?: string; /* other fields */ }

// Define a type for our registration request if needed for req.json()
interface RegistrationRequestBody { email?: string; name?: string; password?: string; /* other fields */ }

export const handlers: RequestHandler[] = [
  // Mock for AI Fraud Detection Agent
  http.post(
    `${API_BASE_URL}/agents/fraud-detection/assess-registration`,
    async ({ request }) => { // MSW v2 uses { request } or individual destructured props
      // const body = await request.json() as FraudRequestBody; // Example if you need to read body

      const scenario = sessionStorage.getItem('MOCK_FRAUD_SCENARIO') || 'low-risk';

      if (scenario === 'high-risk') {
        return HttpResponse.json({
          riskScore: 0.9,
          assessment: 'high-risk',
          reason: 'Mock: Blocked due to suspicious activity pattern.',
        }, { status: 200 });
      }
      if (scenario === 'medium-risk') {
        return HttpResponse.json({
          riskScore: 0.6,
          assessment: 'medium-risk',
          reason: 'Mock: This account requires standard monitoring.',
        }, { status: 200 });
      }
      if (scenario === 'error') {
        return HttpResponse.json(
          { message: 'Mock: AI Fraud Detection Agent unavailable.' },
          { status: 500 }
        );
      }
      // Default: low-risk
      return HttpResponse.json({
        riskScore: 0.1,
        assessment: 'low-risk',
      }, { status: 200 });
    }
  ),

  // Mock for Main User Registration API
  http.post(`${API_BASE_URL}/auth/register`, async ({ request }) => {
    const reqBody = await request.json() as RegistrationRequestBody;
    const email = reqBody.email;

    const scenario = sessionStorage.getItem('MOCK_REGISTRATION_SCENARIO') || 'success';
    const userEmailForTesting = sessionStorage.getItem('MOCK_REGISTRATION_EMAIL') || email;

    if (scenario === 'emailExists' || userEmailForTesting === 'exists@example.com') {
      return HttpResponse.json(
        { message: 'Mock: Email already in use. Please try logging in.' },
        { status: 409 } // Conflict
      );
    }
    if (scenario === 'error') {
      return HttpResponse.json(
        { message: 'Mock: An internal server error occurred during registration.' },
        { status: 500 }
      );
    }

    // Default: success
    return HttpResponse.json({
      userId: `mock-user-${Date.now()}`,
      token: 'mock-jwt-token-string',
    }, { status: 201 }); // Created
  }),
];

// --- Helper for tests to control mock scenarios ---
// You can call these in your test setup (e.g., beforeEach)
export const setMockFraudScenario = (scenario: 'low-risk' | 'medium-risk' | 'high-risk' | 'error' | null) => {
  if (scenario === null) sessionStorage.removeItem('MOCK_FRAUD_SCENARIO');
  else sessionStorage.setItem('MOCK_FRAUD_SCENARIO', scenario);
};

export const setMockRegistrationScenario = (scenario: 'success' | 'emailExists' | 'error' | null, email?: string) => {
  if (scenario === null) sessionStorage.removeItem('MOCK_REGISTRATION_SCENARIO');
  else sessionStorage.setItem('MOCK_REGISTRATION_SCENARIO', scenario);

  if (email === null) sessionStorage.removeItem('MOCK_REGISTRATION_EMAIL');
  else if (email) sessionStorage.setItem('MOCK_REGISTRATION_EMAIL', email);
};

// To use these handlers with MSW:
// 1. Setup MSW: `npm install msw --save-dev` or `yarn add msw --dev`
// 2. Create `src/mocks/browser.ts`:
//    import { setupWorker } from 'msw'
//    import { handlers } from './handlers'
//    export const worker = setupWorker(...handlers)
// 3. In your main app entry point (e.g., main.tsx or index.tsx):
//    if (process.env.NODE_ENV === 'development') { // Or a specific mock environment variable
//      const { worker } = require('./mocks/browser')
//      worker.start()
//    }
// 4. For Jest tests, create `src/mocks/server.ts`:
//    import { setupServer } from 'msw/node'
//    import { handlers } from './handlers'
//    export const server = setupServer(...handlers)
//    And in your Jest setup file (e.g., setupTests.ts):
//    import { server } from './mocks/server.js'
//    beforeAll(() => server.listen())
//    afterEach(() => server.resetHandlers())
//    afterAll(() => server.close()) 