import { aiAgentService } from './aiAgentService'; // Import the new AI agent service

// TODO: Define User and AuthResponse types based on actual API contract
interface UserRegistrationData {
  name: string;
  email: string;
  password: string;
  // Fields from existing Register.tsx step 2 & 3 - ensure these are included if service is called after all steps
  tradingExperience?: string; 
  riskTolerance?: string;
  termsAccepted?: boolean;
  ipAddress?: string; // Added for fraud check
  userAgent?: string; // Added for fraud check
}

interface AuthResponse {
  // Define based on what the backend /api/v1/auth/register returns
  userId: string;
  token: string;
  // ... other user details
  // Optional field to carry fraud assessment details if not blocking
  fraudContext?: {
    assessment: 'medium-risk'; // Specifically for non-blocking medium risk
    reason?: string;
  };
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const authService = {
  registerUser: async (userData: UserRegistrationData): Promise<AuthResponse> => {
    let fraudContextForResponse: AuthResponse['fraudContext'] | undefined = undefined;
    try {
      // Step 1: AI Fraud Detection Assessment
      // Consider collecting IP and UserAgent in the UI or backend-for-frontend if possible
      const fraudAssessment = await aiAgentService.assessRegistrationFraud({
        email: userData.email,
        ipAddress: userData.ipAddress, // Pass along if available
        userAgent: userData.userAgent, // Pass along if available
      });

      // Story 1.1 AC8: "Given the AI Fraud Detection Agent flags a registration attempt as high-risk,
      // then the registration may be blocked, or the user may be presented with an additional verification step
      // (specific behavior TBD by policy defined in Story 1.4)."
      // For now, we'll implement a simple block for high-risk.
      // A more sophisticated approach would involve policy from Story 1.4.
      if (fraudAssessment.assessment === 'high-risk' || (fraudAssessment.riskScore && fraudAssessment.riskScore > 0.75)) { 
        // Example threshold, this should be configurable or defined by policy
        throw new Error(
          `Registration blocked due to high fraud risk. Reason: ${fraudAssessment.reason || 'High risk score'}`
        );
      } else if (fraudAssessment.assessment === 'medium-risk') {
        // Store context for successful response, but DO NOT throw an error
        fraudContextForResponse = {
          assessment: 'medium-risk',
          reason: fraudAssessment.reason || 'Medium risk detected, account flagged for review.'
        };
        // Proceed with registration
      }
      // Low risk proceeds without specific fraudContext in response, unless we want to log it too

      // Step 2: Proceed with actual user registration
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send all relevant user data, excluding ipAddress/userAgent if not part of this specific endpoint's contract
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          password: userData.password,
          // Include other fields if your backend register endpoint expects them:
          // tradingExperience: userData.tradingExperience,
          // riskTolerance: userData.riskTolerance,
          // termsAccepted: userData.termsAccepted,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || `Registration failed with status: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      const authData: Omit<AuthResponse, 'fraudContext'> = await response.json();
      
      // Combine auth data with fraud context if any
      return {
        ...authData,
        ...(fraudContextForResponse && { fraudContext: fraudContextForResponse })
      };

    } catch (error) {
      // Log the error for server-side monitoring if applicable
      console.error("Error during registration process in authService:", error);
      // Ensure the error is re-thrown so UI can handle it
      if (error instanceof Error) {
        throw error; // Re-throw existing Error objects
      } else {
        throw new Error('An unknown error occurred during registration.'); // Wrap non-Error types
      }
    }
  },

  // TODO: Implement loginUser, logoutUser, etc. as needed
};

// Example of how it might be extended for fraud detection later:
/*
import { aiAgentService } from './aiAgentService'; // Assuming this service will be created

export const authService = {
  registerUser: async (userData: UserRegistrationData): Promise<AuthResponse> => {
    try {
      // Step 1: AI Fraud Detection Assessment
      const fraudAssessment = await aiAgentService.assessRegistration({
        email: userData.email,
        // ipAddress: collectedIpAddress, // This needs to be obtained
        // userAgent: navigator.userAgent,
      });

      if (fraudAssessment.riskScore > 0.75) { // Example threshold
        // Handle high-risk scenarios (block, require further verification, etc.)
        // This behavior might be defined in Story 1.4
        throw new Error(`Registration blocked due to high fraud risk: ${fraudAssessment.reason}`);
      }

      // Step 2: Proceed with actual user registration
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || `Registration failed with status: ${response.status}`;
        throw new Error(errorMessage);
      }
      return response.json();

    } catch (error) {
      console.error("Error during registration process:", error);
      // Ensure consistent error shape or re-throw specific error types
      throw error;
    }
  },
};
*/ 