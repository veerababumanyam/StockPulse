# Story 3.1: Implement Detailed Portfolio Holdings View

**Epic:** [Detailed Portfolio Management](../epic-3.md)
**Status:** Draft
**Priority:** High
**Points:** (Estimate)
**Assigned To:** 
**Sprint:** 

## 1. User Story

> As an authenticated user,
> On my Portfolio page (`/portfolio`),
> I want to see a detailed list of all my current holdings, including symbol, company name (if available), quantity, average cost basis, current price, market value, today's price change (value and %), and total unrealized P&L for each position,
> So I can thoroughly understand the current status and performance of my individual investments.

## 2. Requirements

*   The `PortfolioPage.tsx` should display a table or a list of cards for detailed holdings.
*   Each holding entry must display:
    *   Stock Symbol (e.g., AAPL)
    *   Company Name (e.g., Apple Inc.) - if available from API.
    *   Quantity held.
    *   Average Cost Basis per share.
    *   Current Market Price per share (real-time or near real-time).
    *   Total Market Value of the position (Quantity * Current Price).
    *   Today's Price Change (absolute and percentage).
    *   Total Unrealized Profit/Loss for the position (Market Value - (Quantity * Average Cost)).
*   Data, especially Current Market Price and derived values (Market Value, Today's Change, Unrealized P&L), should update in real-time or near real-time.
*   The view should handle users with no holdings gracefully (e.g., display an appropriate message).
*   Columns in the table should be sortable (e.g., by symbol, market value, P&L).
*   Clicking on a stock symbol or row should navigate the user to the `StockDetailPage.tsx` for that symbol.
*   **AI-Powered Insights on Holdings (Optional):** Provide an option (e.g., an icon next to each holding or a contextual menu) for the user to ask the "AI Portfolio Analysis Agent" for more details or insights about a specific holding (e.g., "Explain recent news for AAPL", "What are the key risk factors for TSLA in my portfolio?").

## 3. Acceptance Criteria (ACs)

1.  **AC1:** Given an authenticated user with portfolio holdings navigates to the `/portfolio` page, then a table/list of their holdings is displayed, showing all required data fields (Symbol, Company Name, Quantity, Avg Cost, Current Price, Market Value, Today's Change, Unrealized P&L) for each position.
2.  **AC2:** Given the holdings view is displayed, when real-time market data updates, then the Current Price, Market Value, Today's Change, and Unrealized P&L for each position update automatically without requiring a page refresh.
3.  **AC3:** Given the holdings view is displayed, when a user clicks on a column header (e.g., Symbol, Market Value), then the list of holdings is sorted according to that column in ascending/descending order.
4.  **AC4:** Given the user clicks on a stock symbol or row in the holdings view, then they are navigated to the `StockDetailPage.tsx` for that specific stock.
5.  **AC5:** Given an authenticated user with no holdings navigates to the `/portfolio` page, then a message like "You currently have no holdings in your portfolio" is displayed.
6.  **AC6:** Given the page is loading holdings data, then appropriate loading indicators are displayed.
7.  **AC7:** Given an error occurs while fetching holdings data, then a user-friendly error message is displayed.
8.  **AC8 (New - AI Insights on Holding):** Given the holdings table is displayed, when the user selects an option to get AI insights for a specific holding, then a request is made to the AI Portfolio Analysis Agent with the context of that holding, and the agent's response (e.g., news summary, risk factors, explanation of recent performance) is displayed to the user (e.g., in a modal or an expandable section).

## 4. Technical Guidance for Developer Agent

*   **Relevant PRD Sections:**
    *   `PRD.md#3.5.1` (Portfolio overview)
    *   `PRD.md#3.5.2` (Position management)
*   **Relevant Architecture Sections:**
    *   `architecture.md#3.1.1` (Frontend Architecture - `src/pages/PortfolioPage.tsx`)
    *   `architecture.md#3.2.2` (Portfolio Service)
    *   `architecture.md#3.1.3` (Real-time Updates)
    *   `docs/infrastructure_design.md#5.2` (AI Agent Architecture - AI Portfolio Analysis Agent)
    *   `docs/infrastructure_design.md#5.1` (RAG Pipeline - for the agent)
*   **Key Components/Modules to be affected/created:**
    *   Page: `src/pages/PortfolioPage.tsx` (significant updates).
    *   Component: `src/components/portfolio/HoldingsTable.tsx` (or `HoldingsList.tsx`).
    *   Service: `src/services/portfolioService.ts` to include a function to fetch detailed portfolio holdings.
    *   Service: (New or existing) `src/services/aiAgentService.ts` to interact with the AI Portfolio Analysis Agent for specific holding insights.
    *   Real-time Integration: Logic to subscribe to WebSocket updates for price changes for all held symbols.
*   **API Endpoints Involved:**
    *   `GET /api/v1/portfolio/holdings` (Backend to confirm exact path).
        *   Expected Response: Array of holding objects, e.g.,
            `[ { "symbol": "AAPL", "companyName": "Apple Inc.", "quantity": 100, "averageCostBasis": 150.00, "currentPrice": 170.00, "todaysChange": 2.50, "todaysChangePercent": 1.49, "holdingId": "uuid-holding-1" }, ... ]`
    *   `POST /api/v1/agents/portfolio-analysis/holding-insight` (Example for AI Agent)
        *   Request Body: `{ "userId": "uuid-user", "holdingId": "uuid-holding-1", "symbol": "AAPL", "queryType": "recent_news_summary" | "risk_factors" | "custom_question", "customQuestionText": "Why did AAPL drop last week?" }`
        *   Expected Response: `{ "insightText": "Recent news for AAPL includes...", "sources": [...] }` or `{ "answerText": "AAPL's drop last week was likely due to..."}`.
    *   WebSocket endpoint for real-time price updates for multiple symbols.
*   **Styling/UI Notes:**
    *   Data should be presented clearly, likely in a sortable table. Refer to `StockPulse_Design.md`.
    *   Use appropriate formatting for currency, percentages, and quantities.
    *   Positive P&L/Change can be green, negative red.
*   **Libraries:**
    *   Consider a table library (e.g., React Table, TanStack Table) for sortable and potentially paginated data if the number of holdings can be large.

## 5. Tasks / Subtasks

1.  **Task 1 (AC1, AC6, AC7):** Update `portfolioService.ts` to add a function that fetches detailed portfolio holdings from the API.
2.  **Task 2 (AC1, AC6, AC7):** Create `HoldingsTable.tsx` component. Implement data fetching logic using the service. Handle loading and error states.
3.  **Task 3 (AC1):** Implement the table structure within `HoldingsTable.tsx` to display all required columns (Symbol, Company Name, Quantity, Avg Cost, Current Price, Market Value, Today's Change, Unrealized P&L).
4.  **Task 4 (AC2):** Integrate real-time updates for `currentPrice` and derived fields using WebSockets or polling.
5.  **Task 5 (AC3):** Implement client-side or server-assisted sorting for table columns.
6.  **Task 6 (AC4):** Implement navigation to `StockDetailPage.tsx` on row/symbol click.
7.  **Task 7 (AC5):** Handle the display of an empty state message if the user has no holdings.
8.  **Task 8 (AC8):** Implement UI elements (e.g., icon button per row) to trigger AI insights for a specific holding.
    *   On trigger, call `aiAgentService.ts` to query the AI Portfolio Analysis Agent.
    *   Display the agent's response in a user-friendly way (modal, expandable row section).
9.  **Task 9 (N/A):** Integrate `HoldingsTable.tsx` into `PortfolioPage.tsx`.
10. **Task 10 (N/A):** Style the table and page according to `StockPulse_Design.md`.
11. **Task 11 (N/A):** Write unit tests.

## 6. Definition of Done (DoD)

*   All Acceptance Criteria (AC1-AC8) met.
*   Portfolio page displays a detailed, sortable table of user's holdings with all specified data fields.
*   Users can request and view AI-generated insights for specific holdings.
*   Real-time data updates correctly reflect in the table.
*   Navigation to stock detail pages works.
*   Loading, error, and empty states are handled gracefully.
*   Code reviewed, merged, tests passing.

## 7. Notes / Questions

*   Confirm API endpoint and response structure for detailed holdings.
*   Clarify source for "Company Name" - is it part of the holdings API response or requires a separate lookup?
*   Determine if pagination is needed for the holdings table for users with many positions.
*   Real-time update strategy for multiple symbols (batch subscription vs. individual). Assume backend handles efficient broadcasting or frontend service manages subscriptions.

## 8. Design / UI Mockup Links (If Applicable)

*   Refer to `docs/StockPulse_Design.md` for table styling and data presentation guidelines.

## Story Progress Notes

### Agent Model Used: `<Agent Model Name/Version>`

### Completion Notes List

{Any notes about implementation choices, difficulties, or follow-up needed}

### Change Log 