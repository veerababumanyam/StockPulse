# Story 3.2: Display Portfolio Performance Metrics

**Epic:** [Detailed Portfolio Management](../epic-3.md)
**Status:** Draft
**Priority:** High
**Points:** (Estimate)
**Assigned To:** 
**Sprint:** 

## 1. User Story

> As an authenticated user,
> On my Portfolio page (`/portfolio`),
> I want to see key performance metrics for my overall portfolio, such as total portfolio value, total cost basis, overall unrealized P&L (value and percentage), today's overall P&L (value and percentage), and potentially some basic risk/return ratios (e.g., a simplified Sharpe ratio if feasible),
> So I can quickly assess the overall performance and health of my investments.

## 2. Requirements

*   The `PortfolioPage.tsx` should display a dedicated section or summary cards for overall portfolio performance metrics.
*   Metrics to display:
    *   Total Portfolio Value (sum of market values of all holdings + cash if applicable).
    *   Total Portfolio Cost Basis (sum of cost basis of all holdings).
    *   Overall Unrealized P&L (Total Portfolio Value - Total Portfolio Cost Basis).
    *   Overall Unrealized P&L Percentage ((Overall Unrealized P&L / Total Portfolio Cost Basis) * 100%).
    *   Today's Overall P&L (sum of today's P&L for all holdings).
    *   Today's Overall P&L Percentage ((Today's Overall P&L / Yesterday's Closing Portfolio Value) * 100%).
    *   *(Optional/Stretch)* Simplified Sharpe Ratio (e.g., (Average Daily Return - Risk-Free Rate) / Standard Deviation of Daily Returns over a period) - this may require significant backend support or historical data.
*   These metrics should update in real-time or near real-time as underlying holdings values change.
*   The display should be clear and visually distinct from the detailed holdings table.
*   **AI-Powered Explanations:** For each key metric, provide an option (e.g., an info icon) for the user to get a RAG-powered explanation from the "AI Portfolio Analysis Agent" (e.g., "What does Total Unrealized P&L mean?", "How is Sharpe Ratio calculated and what does my value indicate?").

## 3. Acceptance Criteria (ACs)

1.  **AC1:** Given an authenticated user with portfolio holdings navigates to the `/portfolio` page, then a summary section displays the Total Portfolio Value, Total Cost Basis, Overall Unrealized P&L (value & %), and Today's Overall P&L (value & %). 
2.  **AC2:** Given the portfolio performance metrics are displayed, when real-time market data updates, then all displayed metrics (Total Portfolio Value, Unrealized P&L, Today's P&L) update automatically without requiring a page refresh.
3.  **AC3:** Given an authenticated user with no holdings navigates to the `/portfolio` page, then the performance metrics section either displays zero values or an appropriate message indicating no data to calculate.
4.  **AC4:** Given the page is loading portfolio summary data, then appropriate loading indicators are displayed for the metrics section.
5.  **AC5:** Given an error occurs while fetching or calculating portfolio summary data, then a user-friendly error message is displayed for the metrics section.
6.  **AC6 (New - AI Explanations):** Given portfolio metrics are displayed, when the user requests an explanation for a specific metric, then the AI Portfolio Analysis Agent provides a RAG-powered explanation of that metric, potentially contextualized to the user's portfolio values if appropriate, displayed in a modal or tooltip.

## 4. Technical Guidance for Developer Agent

*   **Relevant PRD Sections:**
    *   `PRD.md#3.4` (Performance Monitoring)
    *   `PRD.md#3.5.1` (Portfolio overview)
*   **Relevant Architecture Sections:**
    *   `architecture.md#3.1.1` (Frontend Architecture - `src/pages/PortfolioPage.tsx`)
    *   `architecture.md#3.2.2` (Portfolio Service)
    *   `architecture.md#3.1.3` (Real-time Updates)
    *   `docs/infrastructure_design.md#5.2` (AI Agent Architecture - AI Portfolio Analysis Agent)
    *   `docs/infrastructure_design.md#5.1` (RAG Pipeline - for the agent)
*   **Key Components/Modules to be affected/created:**
    *   Page: `src/pages/PortfolioPage.tsx` (updates to include this new section).
    *   Component: `src/components/portfolio/PortfolioPerformanceSummary.tsx` (new component).
    *   Service: `src/services/portfolioService.ts` may need a new function to fetch aggregated portfolio summary data, or the frontend will calculate it from detailed holdings.
    *   Service: (New or existing) `src/services/aiAgentService.ts` to interact with the AI Portfolio Analysis Agent for metric explanations.
    *   Calculations: Logic to aggregate data from individual holdings to compute overall metrics.
*   **API Endpoints Involved:**
    *   Potentially `GET /api/v1/portfolio/summary` if the backend provides aggregated data.
        *   Expected Response: `{ "totalPortfolioValue": 25000.00, "totalCostBasis": 22000.00, "overallUnrealizedPnL": 3000.00, "overallUnrealizedPnLPercent": 13.63, "todaysOverallPnL": 150.00, "todaysOverallPnLPercent": 0.60, "portfolioId": "uuid-user-portfolio" }`
    *   `POST /api/v1/agents/portfolio-analysis/explain-metric` (Example for AI Agent)
        *   Request Body: `{ "userId": "uuid-user", "portfolioId": "uuid-user-portfolio", "metricName": "SharpeRatio", "metricValue": 1.2, "portfolioContext": { ...full summary... } }`
        *   Expected Response: `{ "explanationText": "Sharpe Ratio measures risk-adjusted return. A value of 1.2 indicates...", "sources": [...] }`.
    *   Alternatively, these can be calculated client-side from the `GET /api/v1/portfolio/holdings` response used in Story 3.1.
*   **Styling/UI Notes:**
    *   Present metrics clearly, perhaps using cards or a prominent summary bar. Refer to `StockPulse_Design.md`.
    *   Use color-coding for P&L values (green for positive, red for negative).
*   **Considerations:**
    *   For percentages (like Today's Overall P&L %), the denominator (e.g., yesterday's closing value) needs to be available or derivable.
    *   If calculating client-side, ensure performance is not impacted for large portfolios. Backend aggregation is preferred for complex metrics.

## 5. Tasks / Subtasks

1.  **Task 1 (AC1, AC4, AC5):** Design `PortfolioPerformanceSummary.tsx`. Determine if data will be fetched via a new API endpoint or calculated client-side. Implement data fetching/calculation logic.
2.  **Task 2 (AC1):** Implement the display of all required metrics (Total Portfolio Value, Total Cost Basis, Overall Unrealized P&L (value & %), Today's Overall P&L (value & %)) in the component.
3.  **Task 3 (AC6):** For each displayed metric, add a UI element (e.g., info icon) to trigger a call to the `aiAgentService.ts` to fetch an explanation from the AI Portfolio Analysis Agent.
    *   Display the returned explanation in a modal or tooltip.
4.  **Task 4 (AC2):** Ensure real-time updates for all displayed metrics based on underlying data changes.
5.  **Task 5 (AC3):** Handle the display for users with no holdings (zero values or message).
6.  **Task 6 (N/A):** Integrate `PortfolioPerformanceSummary.tsx` into `PortfolioPage.tsx`.
7.  **Task 7 (N/A):** Style the component according to `StockPulse_Design.md`.
8.  **Task 8 (N/A):** Write unit tests.

## 6. Definition of Done (DoD)

*   All Acceptance Criteria (AC1-AC6) met.
*   Portfolio page displays an accurate summary of overall portfolio performance metrics.
*   Users can request and view AI-generated explanations for key performance metrics.
*   Metrics update in real-time.
*   Loading, error, and empty states are handled gracefully.
*   Code reviewed, merged, tests passing.

## 7. Notes / Questions

*   Confirm if a dedicated `/portfolio/summary` API endpoint will be provided, or if frontend calculation is expected.
*   Clarify the exact formula and data source for "Today's Overall P&L Percentage" (denominator: previous day close or start of day value?).
*   Feasibility of a simplified Sharpe Ratio for initial release (consider data requirements like risk-free rate and historical returns).

## 8. Design / UI Mockup Links (If Applicable)

*   Refer to `docs/StockPulse_Design.md` for guidelines on displaying summary data and financial metrics.

## Story Progress Notes

### Agent Model Used: `<Agent Model Name/Version>`

### Completion Notes List

{Any notes about implementation choices, difficulties, or follow-up needed}

### Change Log 