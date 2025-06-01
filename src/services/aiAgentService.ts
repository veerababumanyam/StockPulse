import axios from 'axios';
import {
  AIAgent,
  AgentCapability,
  AgentStatus,
  AgentMetrics,
  CreateAgentRequest,
  UpdateAgentRequest,
  AgentExecutionRequest,
  AgentExecutionResult,
} from '../types/aiAgent';
import { getEnvVar } from '../utils/env';

// TODO: Define precise request and response types based on AI Agent API contract
interface FraudAssessmentRequest {
  email: string;
  ipAddress?: string; // Optional, but recommended
  userAgent?: string; // Optional, but recommended
  // Potentially other fields like name, etc.
}

interface FraudAssessmentResponse {
  riskScore: number; // e.g., 0.0 to 1.0
  assessment: 'low-risk' | 'medium-risk' | 'high-risk'; // More specific statuses
  reason?: string; // Explanation if high-risk or for certain assessments
  transactionId?: string; // For tracking/logging
}

// API Configuration
const API_BASE_URL = getEnvVar('VITE_API_BASE_URL', '/api/v1');

export const aiAgentService = {
  assessRegistrationFraud: async (
    assessmentData: FraudAssessmentRequest,
  ): Promise<FraudAssessmentResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/agents/fraud-detection/assess-registration`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Potentially an API key or auth token if the agent endpoint is protected
          // 'Authorization': `Bearer ${getAgentAuthToken()}`,
        },
        body: JSON.stringify(assessmentData),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage =
        errorData?.message ||
        `Fraud assessment failed with status: ${response.status}`;
      // TODO: Define specific error types/codes for better handling
      throw new Error(errorMessage);
    }

    return response.json();
  },
};
