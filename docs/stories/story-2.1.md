# Story 2.1: Implement Basic Dashboard Layout and Portfolio Snapshot

**Epic:** [Dashboard Core Functionality](../epic-2.md)
**Status:** Draft
**Priority:** High
**Points:** (Estimate)
**Assigned To:**
**Sprint:**

## 1. User Story

> As an authenticated user,
> When I navigate to the dashboard (e.g., after login or by clicking a dashboard link),
> I want to see a basic, non-customizable layout that includes a snapshot of my current overall portfolio value and today's performance (e.g., overall gain/loss for the day),
> So I can quickly understand my financial standing at a glance.

## 2. Requirements

*   The main dashboard page (`/dashboard` route) should display a clear, well-organized static layout.
*   A prominent section should display the user's total portfolio value (fetched from backend).
*   Another section should display today's overall portfolio performance (e.g., "Today's P&L: +$X.XX (+Y.YY%)" or similar, fetched/calculated from backend data).
*   **AI-Generated Summary (Optional):** An additional small section displaying a concise, AI-generated textual summary of the day's performance or key portfolio highlights (e.g., "Portfolio up slightly today, driven by gains in Tech Sector. Consider reviewing your recent AAPL purchase."). This will be powered by the "AI Portfolio Analysis Agent".
*   This initial view is not customizable; it provides a standard overview.
*   Appropriate loading states should be shown while data is being fetched.
*   Error states should be handled gracefully if portfolio data cannot be fetched, displaying user-friendly messages.
*   The dashboard should be the default page redirected to after successful login.

## 3. Acceptance Criteria (ACs)

1.  **AC1:** Given an authenticated user navigates to the `/dashboard` route, then the basic dashboard layout is rendered, showing placeholders or loading indicators for portfolio value and today's performance.
2.  **AC2:** Given the dashboard page is loaded, when portfolio data is successfully fetched from the backend, then the total portfolio value is accurately displayed.
3.  **AC3:** Given the dashboard page is loaded, when portfolio performance data for the day is successfully fetched/calculated, then today's P&L (absolute and percentage change) is accurately displayed.
4.  **AC4:** Given there is an error fetching portfolio data (e.g., API error), then a user-friendly error message is displayed in the relevant sections, and no incorrect or stale data is shown.
5.  **AC5:** Given a user successfully logs in, they are redirected to the `/dashboard` page as the primary landing page.
6.  **AC6 (New - AI Summary):** Given portfolio data is loaded, the system makes a call to the AI Portfolio Analysis Agent, and if successful, then a concise textual summary of portfolio performance/highlights is displayed (if the agent returns relevant content).

## 4. Technical Guidance for Developer Agent

*   **Relevant PRD Sections:**
    *   `PRD.md#3.5.1` (Dashboard - Portfolio overview)
    *   `PRD.md#3.4.1` (Real-time Analytics - Live P&L tracking)
*   **Relevant Architecture Sections:**
    *   `architecture.md#3.1.1` (Frontend Architecture - `src/pages/Dashboard.tsx`)
    *   `architecture.md#3.2.2` (Portfolio Service - for fetching data)
    *   `docs/infrastructure_design.md#5.2` (AI Agent Architecture - Portfolio Analysis AI Agent)
*   **Key Components/Modules to be affected/created:**
    *   Page: `src/pages/Dashboard.tsx` will be the main container.
    *   Components: 
        *   `src/components/dashboard/PortfolioSummary.tsx` (or similar, to display total value and P&L).
        *   Potentially reusable components from `src/components/ui/` for displaying financial figures or cards.
    *   Service: `src/services/portfolioService.ts` (or similar) to have functions for fetching portfolio summary/performance data.
    *   Service: (New or existing) `src/services/aiAgentService.ts` to include a function for fetching the AI portfolio summary.
    *   Context: `AuthContext` will be used to ensure the user is authenticated.
*   **API Endpoints Involved:**
    *   `GET /api/v1/portfolio/summary` (Backend to confirm exact path and response structure)
        *   Expected Response: `{ "totalValue": 12345.67, "todaysPnl": 150.25, "todaysPnlPercent": 1.23, "portfolioId": "uuid-user-portfolio" }`
    *   `POST /api/v1/agents/portfolio-analysis/snapshot-summary` (Example endpoint for AI Agent)
        *   Expected Request Body: `{ "portfolioId": "uuid-user-portfolio", "currentSummary": { "totalValue": 12345.67, "todaysPnl": 150.25 } }` (Agent might need current data to contextualize its summary)
        *   Expected Response: `{ "summaryText": "Your portfolio is showing modest gains today, primarily driven by your tech holdings." }` or `{ "summaryText": null }` if no specific insight.
*   **Styling/UI Notes:**
    *   Refer to `StockPulse_Design.md` for overall dashboard layout concepts, typography, and card styling.
    *   Ensure values are formatted correctly as currency and percentages.
    *   Maintain a clean and uncluttered initial view.
*   **Error Handling Notes:**
    *   Clearly indicate loading states.
    *   Provide specific error messages if parts of the data fail to load.

## 5. Tasks / Subtasks

1.  **Task 1 (AC1):** Structure the `Dashboard.tsx` page to include distinct areas for portfolio summary.
2.  **Task 2 (AC2, AC3, AC4):** Create/Update `portfolioService.ts` to include a function to fetch the portfolio summary (total value, today's P&L).
3.  **Task 3 (AC2, AC3, AC4):** Create `PortfolioSummary.tsx` component to fetch (via the service) and display the total portfolio value and today's P&L.
    *   Implement loading and error states within this component.
4.  **Task 4 (AC6):** Enhance `PortfolioSummary.tsx` (or a new sub-component) to call the `aiAgentService.ts` to fetch the AI-generated textual summary for the portfolio snapshot.
    *   Display the summary if provided by the agent.
    *   Handle cases where the agent returns no summary or if the call fails gracefully.
5.  **Task 5 (AC2, AC3):** Integrate the `PortfolioSummary.tsx` component into `Dashboard.tsx`.
6.  **Task 6 (AC5):** Ensure redirection to `/dashboard` after successful login (verify Story 1.2/1.3 implementation).
7.  **Task 7 (N/A):** Write unit tests for the `PortfolioSummary.tsx` component and relevant service functions, including AI agent interaction.
8.  **Task 8 (N/A):** Style the components according to `StockPulse_Design.md`.

## 6. Definition of Done (DoD)

*   All Acceptance Criteria (AC1-AC6) met.
*   Dashboard displays accurate portfolio snapshot data fetched from the backend.
*   A concise AI-generated summary is displayed if available from the Portfolio Analysis Agent.
*   Loading and error states are handled gracefully for both portfolio data and AI summary.
*   Users are directed to the dashboard after login.
*   Code reviewed, merged, unit tests passing.

## 7. Notes / Questions

*   Confirm exact API endpoint and response structure for portfolio summary.
*   Clarify if "today's performance" calculation is done backend or if frontend needs to derive it from raw data (assume backend for now).

## 8. Design / UI Mockup Links (If Applicable)

*   Refer to `docs/StockPulse_Design.md` for dashboard layout concepts.

## Story Progress Notes

### Agent Model Used: `<Agent Model Name/Version>`

### Completion Notes List

{Any notes about implementation choices, difficulties, or follow-up needed}

### Change Log 