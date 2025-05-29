# Epic 7: AI Agent Interaction & Personalization

**Status:** To Do

**Parent PRD Sections:**
*   `PRD.md#3.2.5` (AI Agent Transparency and Control - new section)
*   `PRD.md#1.3` (Key Value Propositions - Transparency, Personalization)

**Goal:** To provide users with transparency into how AI agents are assisting them, allow for some level of personalization of agent behavior, and build trust in the AI capabilities of the platform.

**Scope:**
*   **AI Agent Hub/Dashboard:** A dedicated section where users can see which AI agents are active on their account (e.g., Portfolio Analysis Agent, Market Insights Agent, Trade Advisor Agent, Fraud Detection Agent).
*   **Agent Activity Log (Simplified):** For each agent, display a simplified, user-friendly log of recent key actions or insights provided (e.g., "Market Insights Agent provided a new summary for AAPL at 10:15 AM", "Trade Advisor Agent flagged a high-risk order at 02:30 PM").
*   **Agent-Specific Settings (Basic):** Allow users to enable/disable certain high-level functionalities of specific agents if desired (e.g., "Turn off AI-suggested order parameters from Trade Advisor Agent"). This should be limited to non-critical functions.
*   **Feedback Mechanism for AI Insights:** Allow users to provide feedback (e.g., thumbs up/down, simple comments) on the quality and relevance of AI-generated insights or suggestions. This feedback will be used to improve agent performance (MCP for feedback loop).
*   **Explanation of Agent Roles:** Provide clear, simple explanations of what each AI agent does, what data it uses (at a high level), and how it aims to help the user.

**AI Integration Points:**
*   This epic is meta-level, focusing on the user's interaction *with* the AI agents themselves.
*   **AI Meta-Agent/Orchestrator (Backend):** Manages logging of agent activities in a user-digestible format and handles user feedback for AI outputs, potentially using MCP to route feedback to appropriate model training/fine-tuning pipelines.
*   Individual agents need to expose APIs for their settings and log their key actions in a structured way for the AI Agent Hub.

**Key Business Value:**
*   Builds user trust and transparency in AI functionalities.
*   Allows users a degree of control and personalization over AI assistance.
*   Provides a feedback loop for improving AI agent performance.
*   Differentiates the platform through clear and manageable AI integration.

## Stories Under this Epic:

1.  **7.1: Develop AI Agent Hub Dashboard**
    *   **User Story:** As a user, I want to access a dedicated AI Agent Hub where I can see all active AI agents on my account, their current status, and a brief overview of what each agent does for me.
    *   **Status:** To Do

2.  **7.2: Implement Agent Activity Feed with User-Friendly Logging**
    *   **User Story:** As a user, I want to see a chronological activity feed showing recent key actions and insights from my AI agents in simple, understandable language, so I can track how they're helping me.
    *   **Status:** To Do

3.  **7.3: Create Agent-Specific Settings and Preferences**
    *   **User Story:** As a user, I want to customize certain behaviors of my AI agents (e.g., notification frequency, suggestion aggressiveness) while maintaining their core functionality, so I can tailor the experience to my preferences.
    *   **Status:** To Do

4.  **7.4: Implement AI Insight Feedback System**
    *   **User Story:** As a user, I want to provide feedback (thumbs up/down, comments) on AI-generated insights and suggestions, so the system can learn my preferences and improve over time.
    *   **Status:** To Do

5.  **7.5: Develop Agent Education Center**
    *   **User Story:** As a user, I want access to clear explanations of what each AI agent does, what data it uses, and how it helps me, so I can understand and trust the AI assistance I'm receiving.
    *   **Status:** To Do

6.  **7.6: Build AI Agent Performance Dashboard**
    *   **User Story:** As a user, I want to see how my AI agents are performing (e.g., accuracy of predictions, usefulness ratings) over time, so I can understand their value and reliability.
    *   **Status:** To Do

7.  **7.7 (New): Develop AI Meta-Agent/Orchestrator Backend**
    *   **User Story:** As a platform developer, I need a backend AI Meta-Agent that manages agent activity logging, processes user feedback, and coordinates agent interactions for the Agent Hub interface.
    *   **Status:** To Do

## Dependencies:
*   All other epics that define specific AI agents.
*   Backend infrastructure for storing user preferences for AI agents (`StockPulse_PostgreSQL`).
*   Logging framework for AI agent activities.
*   MCP for feedback loops if external models are fine-tuned.

## Notes & Assumptions:
*   Initial agent settings will be high-level to avoid overwhelming users.
*   Activity logs are simplified and not raw technical logs.
*   Focus is on transparency and basic control, not deep customization of agent algorithms.

## Future Scope:
*   More granular control over agent behavior and parameters.
*   Personalized dashboards showing the most impactful AI contributions for the user.
*   "Explain this AI decision" feature for specific agent actions. 