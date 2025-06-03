import axios from "axios";
import {
  AIAgent,
  AgentCapability,
  AgentStatus,
  AgentMetrics,
  CreateAgentRequest,
  UpdateAgentRequest,
  AgentExecutionRequest,
  AgentExecutionResult,
} from "../types/aiAgent";
import { getEnvVar } from "../utils/common/env";
import { webSocketService, MarketInsightUpdate } from "./websocketService";

// TODO: Define precise request and response types based on AI Agent API contract
interface FraudAssessmentRequest {
  email: string;
  ipAddress?: string; // Optional, but recommended
  userAgent?: string; // Optional, but recommended
  // Potentially other fields like name, etc.
}

interface FraudAssessmentResponse {
  riskScore: number; // e.g., 0.0 to 1.0
  assessment: "low-risk" | "medium-risk" | "high-risk"; // More specific statuses
  reason?: string; // Explanation if high-risk or for certain assessments
  transactionId?: string; // For tracking/logging
}

// Market Research Agent Types
interface MarketInsight {
  id: string;
  title: string;
  content: string;
  summary?: string;
  insight_type: string;
  priority: string;
  confidence: number;
  sentiment?: string;
  reference_symbol?: string;
  source: string;
  tags: string[];
  agent_id: string;
  timestamp: string;
  actionable: boolean;
  ag_ui_components?: Array<{
    type: string;
    props: Record<string, any>;
  }>;
}

interface GenerateInsightsRequest {
  user_id: string;
  count?: number;
  context?: Record<string, any>;
}

interface GenerateInsightsResponse {
  success: boolean;
  data: {
    insights: MarketInsight[];
  };
  timestamp: string;
}

interface NLQRequest {
  query: string;
  user_id: string;
  context?: Record<string, any>;
  session_id?: string;
}

interface NLQResponse {
  success: boolean;
  data: {
    answer: string;
    sources: Array<{
      title: string;
      url?: string;
      snippet?: string;
    }>;
    confidence: number;
    ag_ui_components?: Array<{
      type: string;
      props: Record<string, any>;
    }>;
    follow_up_questions: string[];
  };
  timestamp: string;
}

// A2A Protocol Types
interface A2AMessage {
  jsonrpc: string;
  id: string;
  method: string;
  params: Record<string, any>;
  timestamp: string;
  source_agent?: string;
  target_agent?: string;
  session_id?: string;
  priority?: string;
}

interface A2AResponse {
  jsonrpc: string;
  id: string;
  result?: Record<string, any>;
  error?: {
    code: string | number;
    message: string;
    data?: Record<string, any>;
  };
  timestamp: string;
  source_agent?: string;
  execution_time_ms?: number;
}

// API Configuration
const API_BASE_URL = getEnvVar("VITE_API_BASE_URL", "/api/v1");
const MARKET_RESEARCH_AGENT_URL = getEnvVar("VITE_MARKET_RESEARCH_AGENT_URL", "http://localhost:9003");

export const aiAgentService = {
  // Existing fraud detection service
  assessRegistrationFraud: async (
    assessmentData: FraudAssessmentRequest,
  ): Promise<FraudAssessmentResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/agents/fraud-detection/assess-registration`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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

  // Market Research Agent Services
  generateInsights: async (
    request: GenerateInsightsRequest
  ): Promise<GenerateInsightsResponse> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/agents/market-insights/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: JSON.stringify({
            user_id: request.user_id,
            count: request.count || 5,
            context: request.context
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `Failed to generate insights: ${response.status}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error generating insights:', error);
      throw error;
    }
  },

  processNaturalLanguageQuery: async (
    request: NLQRequest
  ): Promise<NLQResponse> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/agents/market-insights/nlq`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `Failed to process query: ${response.status}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error processing NLQ:', error);
      throw error;
    }
  },

  // A2A Direct Communication (for advanced use cases)
  callMarketResearchAgentDirect: async (
    method: string,
    params: Record<string, any>
  ): Promise<A2AResponse> => {
    try {
      const message: A2AMessage = {
        jsonrpc: "2.0",
        id: `frontend-${Date.now()}`,
        method,
        params,
        timestamp: new Date().toISOString(),
        source_agent: "stockpulse-frontend",
        target_agent: "market-researcher"
      };

      const response = await fetch(
        `${MARKET_RESEARCH_AGENT_URL}/jsonrpc`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(message),
        }
      );

      if (!response.ok) {
        throw new Error(`A2A call failed: ${response.status}`);
      }

      const data: A2AResponse = await response.json();
      
      if (data.error) {
        throw new Error(`A2A Error: ${data.error.message}`);
      }

      return data;
    } catch (error) {
      console.error(`Error calling agent method ${method}:`, error);
      throw error;
    }
  },

  // WebSocket services for real-time updates using dedicated service
  subscribeToInsights: (callback: (insights: MarketInsight[]) => void) => {
    const handleMessage = (message: any) => {
      if (message.data && Array.isArray(message.data)) {
        // Transform the insights to match our interface
        const transformedInsights: MarketInsight[] = message.data.map((insight: MarketInsightUpdate) => ({
          id: insight.id,
          title: insight.title,
          content: insight.content,
          summary: insight.content,
          insight_type: insight.insight_type,
          priority: insight.priority,
          confidence: insight.confidence,
          sentiment: insight.sentiment,
          reference_symbol: insight.reference_symbol,
          source: insight.source,
          tags: insight.tags,
          agent_id: insight.agent_id,
          timestamp: insight.timestamp,
          actionable: insight.actionable,
          ag_ui_components: insight.ag_ui_components,
        }));
        
        callback(transformedInsights);
      }
    };

    webSocketService.subscribe('insights_update', handleMessage);
  },

  unsubscribeFromInsights: (callback: (insights: MarketInsight[]) => void) => {
    // Note: The WebSocket service doesn't support removing specific handlers,
    // so this is a placeholder. In practice, you'd store the handler reference
    // or implement a more sophisticated unsubscribe mechanism.
    console.log('Unsubscribing from insights - placeholder implementation');
  },

  // Utility methods
  getAgentHealth: async (): Promise<{ status: string; agent_id: string; timestamp: string }> => {
    try {
      const response = await fetch(`${MARKET_RESEARCH_AGENT_URL}/health`);
      return await response.json();
    } catch (error) {
      console.error('Error checking agent health:', error);
      throw error;
    }
  },

  getAgentCard: async (): Promise<any> => {
    try {
      const response = await fetch(`${MARKET_RESEARCH_AGENT_URL}/.well-known/agent.json`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching agent card:', error);
      throw error;
    }
  },

  // Rate limiting check (client-side helper)
  checkNLQRateLimit: (() => {
    const requests: number[] = [];
    const RATE_LIMIT = 5; // 5 requests per minute
    const WINDOW_MS = 60000; // 1 minute

    return (): boolean => {
      const now = Date.now();
      const windowStart = now - WINDOW_MS;
      
      // Remove requests outside the window
      while (requests.length > 0 && requests[0] < windowStart) {
        requests.shift();
      }
      
      if (requests.length >= RATE_LIMIT) {
        return false; // Rate limited
      }
      
      requests.push(now);
      return true;
    };
  })(),

  // WebSocket connection management
  connectWebSocket: () => {
    return webSocketService.connect();
  },

  disconnectWebSocket: () => {
    webSocketService.disconnect();
  },

  getWebSocketStatus: () => {
    return webSocketService.getStatus();
  },
};
