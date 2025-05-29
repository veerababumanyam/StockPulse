# Story 3.5: Implement AI-Powered Natural Language Query for Portfolio

**Epic:** [Detailed Portfolio Management](../epic-3.md)
**Status:** To Do
**Priority:** High
**Points:** (Estimate - likely 8-13 due to AI complexity)
**Assigned To:**
**Sprint:**

## 1. User Story

> As an authenticated user,
> On my Portfolio page,
> I want to be able to ask natural language questions about my overall portfolio (e.g., "What are the main risks in my portfolio?", "How has my portfolio performed against the S&P 500 this year?", "Suggest diversification options for my current holdings.") and receive insightful, RAG-powered answers from an AI Portfolio Analysis Agent,
> So that I can gain a deeper understanding of my investments and make more informed decisions without needing to manually analyze all the data.

## 2. Requirements

*   A dedicated UI element (e.g., a chat-like input field or a prominent query box) should be available on the `PortfolioPage.tsx` for users to type their natural language questions.
*   User questions will be directed to the "AI Portfolio Analysis Agent".
*   The AI agent will:
    *   Analyze the user's question.
    *   Access relevant portfolio data (holdings, performance, transactions via `StockPulse_PostgreSQL` and `StockPulse_TimeSeriesDB`).
    *   Utilize its RAG pipeline with `StockPulse_VectorDB` (containing financial knowledge, market analysis, investment strategies, etc.) to generate comprehensive and contextually relevant answers.
    *   Formulate answers in clear, understandable natural language.
    *   Potentially provide supporting data, charts (if simple enough to generate or reference), or links to relevant sources/educational material alongside the textual answer.
*   The answers from the AI agent should be displayed clearly to the user within the portfolio page interface.
*   The system should handle ambiguous questions gracefully, perhaps by asking for clarification or offering suggestions.
*   Loading states should be displayed while the agent is processing the query.
*   Error states should be handled if the agent fails to process the query or an API error occurs.

## 3. Acceptance Criteria (ACs)

1.  **AC1:** Given an authenticated user is on the `/portfolio` page, then an input field or query area is visible for asking natural language questions about their portfolio.
2.  **AC2:** Given the user types a valid portfolio-related question (e.g., "What's my most volatile stock?") and submits it, then the query is sent to the AI Portfolio Analysis Agent, and a relevant, RAG-powered textual answer is displayed.
3.  **AC3:** Given the user asks a question requiring data analysis (e.g., "Which holding contributed most to my gains last month?"), then the AI agent accesses necessary portfolio data and provides an accurate answer.
4.  **AC4:** Given the user asks a question requiring general financial knowledge contextualized to their portfolio (e.g., "Is my portfolio well-diversified?"), then the AI agent uses its RAG capabilities to provide an insightful answer.
5.  **AC5:** Given the agent's answer includes references to external data or educational content, then these sources are appropriately cited or linked.
6.  **AC6:** Given the agent is processing a query, then a clear loading indicator is displayed.
7.  **AC7:** Given an error occurs while processing the query or communicating with the agent, then a user-friendly error message is displayed.
8.  **AC8:** Given the user asks an ambiguous question, the agent may respond by asking for clarification or offering common question suggestions.

## 4. Technical Guidance for Developer Agent

*   **Relevant PRD Sections:**
    *   `PRD.md#3.2` (AI and Analysis Engine - particularly NLP for queries)
    *   `PRD.md#1.3` (Key Value Propositions - Personalized Insights, AI-Powered Trading)
*   **Relevant Architecture Sections:**
    *   `architecture.md#3.1.1` (Frontend Architecture - `src/pages/PortfolioPage.tsx`)
    *   `architecture.md#3.2.2` (AI/ML Service - AI Portfolio Analysis Agent)
    *   `docs/infrastructure_design.md#5.1` (RAG Pipeline)
    *   `docs/infrastructure_design.md#5.2` (AI Agent Architecture - AI Portfolio Analysis Agent)
    *   `docs/infrastructure_design.md#4.1` (StockPulse_PostgreSQL)
    *   `docs/infrastructure_design.md#4.3` (StockPulse_VectorDB)
    *   `docs/infrastructure_design.md#4.4` (StockPulse_TimeSeriesDB)
*   **Key Components/Modules to be affected/created:**
    *   Page: `src/pages/PortfolioPage.tsx` (to include the NLQ interface).
    *   Component: `src/components/portfolio/PortfolioNLQInterface.tsx` (new component for query input and answer display).
    *   Service: `src/services/aiAgentService.ts` (new function to send NLQ to Portfolio Analysis Agent).
*   **API Endpoints Involved:**
    *   `POST /api/v1/agents/portfolio-analysis/query`
        *   Request Body: `{ "userId": "uuid-user", "portfolioId": "uuid-user-portfolio", "queryText": "What are the main risks in my current portfolio?" }`
        *   Expected Response: `{ "answerText": "Based on your holdings, the main risks include...", "supportingData": { ...optional structured data... }, "sources": [ { "title": "Source 1", "url": "..."} ] }`
*   **Styling/UI Notes:**
    *   Design a chat-like interface or a clear input/output area. Refer to `StockPulse_Design.md`.
    *   Answers should be well-formatted, potentially using markdown for readability.
*   **Error Handling Notes:**
    *   Handle API errors, agent processing errors, and scenarios where the agent cannot confidently answer.
*   **Security Considerations:**
    *   Ensure queries are sanitized.
    *   The agent should only access data for the authenticated user's portfolio.

## 5. Tasks / Subtasks

1.  **Task 1 (AC1, AC6, AC7):** Design and create the basic `PortfolioNLQInterface.tsx` component with an input field and an area for displaying answers.
2.  **Task 2 (AC2):** Implement a function in `aiAgentService.ts` to send the user's natural language query to the `/api/v1/agents/portfolio-analysis/query` endpoint.
3.  **Task 3 (AC2, AC6, AC7):** Integrate the service call into the `PortfolioNLQInterface.tsx`. Handle form submission, loading states, and display of the agent's textual response.
4.  **Task 4 (AC3, AC4):** Backend: Ensure the AI Portfolio Analysis Agent can correctly parse questions, fetch relevant portfolio data (holdings, performance, transactions), and use RAG to formulate answers. (This is primarily a backend task but has frontend implications for what data is sent/received).
5.  **Task 5 (AC5):** Frontend: If the agent's response includes structured supporting data or sources, implement logic to display these appropriately (e.g., simple charts, formatted lists, clickable links).
6.  **Task 6 (AC8):** Implement frontend and backend logic for handling ambiguous queries (e.g., displaying clarification prompts or suggestions).
7.  **Task 7 (N/A):** Integrate `PortfolioNLQInterface.tsx` into `PortfolioPage.tsx`.
8.  **Task 8 (N/A):** Style the NLQ interface components.
9.  **Task 9 (N/A):** Write unit and integration tests for the NLQ feature.

## 6. Definition of Done (DoD)

*   All Acceptance Criteria (AC1-AC8) met.
*   Users can ask natural language questions about their portfolio via the interface on the Portfolio Page.
*   The AI Portfolio Analysis Agent provides relevant, RAG-powered answers, utilizing portfolio data and its knowledge base.
*   Supporting data and sources are displayed where applicable.
*   Loading, error, and ambiguous query states are handled gracefully.
*   Code reviewed, merged, tests passing.

## 7. Notes / Questions

*   Define the initial scope of questions the agent should be able to handle.
*   How should the conversation history be handled (if at all within this story)? For V1, likely each query is standalone.
*   Complexity of "supporting data" or "charts" generated by AI. For V1, keep this simple (e.g., text-based tables, or references to existing chart components if relevant).

## 8. Design / UI Mockup Links (If Applicable)

*   Refer to `StockPulse_Design.md` for input field styling and general layout.

## Story Progress Notes

### Agent Model Used: `<Agent Model Name/Version>`

### Completion Notes List

{Any notes about implementation choices, difficulties, or follow-up needed}

### Change Log 