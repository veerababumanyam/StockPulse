# Story 2.4: Develop Watchlist Widget

**Epic:** [Dashboard Core Functionality](../epic-2.md)
**Status:** Draft
**Priority:** High
**Points:** (Estimate)
**Assigned To:** 
**Sprint:** 

## 1. User Story

> As a user,
> I want a "Watchlist" widget on my dashboard where I can add, view, and remove stocks I'm interested in, displaying key real-time metrics (e.g., current price, today's change, today's volume),
> So I can easily track potential investments and market movements for stocks I care about.

## 2. Requirements

*   The widget must be selectable and placeable on the dashboard via the Customizable Widget System (Story 2.2).
*   Users must be able to add stock symbols to their personal watchlist associated with this widget.
*   Users must be able to remove stock symbols from their watchlist.
*   The watchlist should display a list of user-added stock symbols along with:
    *   Company Name (optional, if easily available).
    *   Current Market Price (real-time or near real-time).
    *   Today's Price Change (absolute and percentage).
    *   Today's Volume (optional, but useful).
*   Data for watchlisted stocks should update in real-time or near real-time.
*   The user's list of watchlisted stocks must be persisted on the backend per user.
*   The widget should handle empty states (no stocks in watchlist) gracefully.
*   Provide a clear interface within the widget to add new stock symbols (e.g., a search/input field).
*   Clicking on a stock symbol in the watchlist should navigate the user to the `StockDetailPage.tsx` for that symbol.
*   **AI-Powered Insights (Optional):** For each stock in the watchlist, or for the watchlist as a whole, display concise AI-generated insights or alerts (e.g., "TSLA just crossed its 50-day moving average," "Recent significant news for AAPL"). This will be powered by the "AI Watchlist Monitoring Agent."

## 3. Acceptance Criteria (ACs)

1.  **AC1:** Given the "Watchlist" widget is added to the dashboard, when the user has no stocks in their watchlist, then an empty state message (e.g., "Your watchlist is empty. Add symbols to start tracking.") and an input field/button to add symbols are displayed.
2.  **AC2:** Given the user enters a valid stock symbol in the widget's add interface and confirms, then the stock symbol is added to their watchlist, persisted via a backend API, and displayed in the widget with its real-time data (price, change).
3.  **AC3:** Given stocks are displayed in the watchlist, when real-time market data updates, then the displayed price and change for each stock in the widget update accordingly without requiring a page refresh.
4.  **AC4:** Given the user chooses to remove a stock from the watchlist (e.g., clicks a remove icon next to a stock), then the stock is removed from the display, and the change is persisted via a backend API.
5.  **AC5:** Given the user clicks on a stock symbol or row in the watchlist, then they are navigated to the `StockDetailPage.tsx` for that specific stock.
6.  **AC6:** Given an error occurs while fetching data for a stock or managing the watchlist, then a user-friendly error message is displayed within the widget.
7.  **AC7:** The widget displays columns for Symbol, Price, Change (Value & %), and optionally Volume and Company Name.
8.  **AC8 (New - AI Insights):** Given a stock is in the watchlist, the system attempts to fetch relevant AI-generated insights or smart alerts from the AI Watchlist Monitoring Agent for that stock, and if available, these are displayed near the stock or in a dedicated section within the widget.

## 4. Technical Guidance for Developer Agent

*   **Relevant PRD Sections:**
    *   `PRD.md#3.5.1` (Dashboard - Customizable widgets)
    *   `PRD.md#3.2.2` (Market Analysis - Real-time data for display)
*   **Relevant Architecture Sections:**
    *   `architecture.md#3.1.1` (Frontend Architecture)
    *   `architecture.md#3.1.3` (Real-time Updates - WebSocket connections)
    *   `docs/infrastructure_design.md#5.2` (AI Agent Architecture - AI Watchlist Monitoring Agent)
*   **Key Components/Modules to be affected/created:**
    *   New Widget Component: `src/components/widgets/WatchlistWidget.tsx`.
    *   Service: `src/services/userService.ts` or `watchlistService.ts` for CRUD operations on the user's watchlist stocks.
    *   Service: (New or existing) `src/services/aiAgentService.ts` to include functions for fetching insights from the AI Watchlist Monitoring Agent.
    *   Real-time Integration: Logic to subscribe to WebSocket updates for symbols in the watchlist.
*   **API Endpoints Involved:**
    *   `GET /api/v1/users/me/watchlist` (To fetch user's current watchlist symbols).
        *   Expected Response: `{ "symbols": ["AAPL", "MSFT", "GOOG"] }`.
    *   `POST /api/v1/users/me/watchlist` (To add a symbol).
        *   Expected Request Body: `{ "symbol": "TSLA" }`.
    *   `DELETE /api/v1/users/me/watchlist/{symbol}` (To remove a symbol).
    *   Backend API for fetching real-time quote data for a list of symbols (if not purely WebSocket driven for updates), or WebSocket endpoint details for subscribing to symbol updates.
    *   `POST /api/v1/agents/watchlist-monitoring/insights` (Example endpoint for AI Agent)
        *   Request Body: `{ "userId": "uuid-user", "symbols": ["AAPL", "TSLA"] }` (Agent might need user context and current watchlist)
        *   Expected Response: `{ "insights": [ { "symbol": "AAPL", "insightText": "Recent analyst upgrade for AAPL.", "type": "news_positive" }, { "symbol": "TSLA", "insightText": "TSLA approaching key resistance level.", "type": "technical_alert"} ] }` or `{ "insights": [] }`.
*   **Styling/UI Notes:**
    *   Align with `StockPulse_Design.md`. Display data clearly in a tabular or list format.
    *   Ensure interactive elements like add/remove buttons are intuitive.
*   **Error Handling Notes:**
    *   Handle errors for invalid symbol addition, API failures for watchlist management, and data fetching issues.

## 5. Tasks / Subtasks

1.  **Task 1 (AC1):** Create the basic structure for `WatchlistWidget.tsx`.
2.  **Task 2 (AC1, AC2):** Implement service functions for fetching, adding, and removing watchlist symbols from the backend.
3.  **Task 3 (AC1, AC2, AC4):** Integrate watchlist CRUD operations into the widget. Implement UI for adding and removing symbols.
4.  **Task 4 (AC1, AC2, AC7):** Implement display of watchlisted stocks in a list/table format, including columns for Symbol, Price, Change.
5.  **Task 5 (AC3):** Implement real-time data updates for displayed stocks (via WebSocket subscription or polling mechanism coordinated with backend).
6.  **Task 6 (AC5):** Implement navigation to `StockDetailPage.tsx` when a stock is clicked.
7.  **Task 7 (AC6):** Implement loading and error states within the widget.
8.  **Task 8 (AC8):** Implement logic to call the `aiAgentService.ts` to fetch AI-generated insights for watchlisted stocks.
    *   Display these insights appropriately within the widget (e.g., next to each stock, or in a summary area).
    *   Handle errors or lack of insights gracefully.
9.  **Task 9 (N/A):** Style the widget according to `StockPulse_Design.md`.
10. **Task 10 (N/A):** Write unit tests.

## 6. Definition of Done (DoD)

*   All Acceptance Criteria (AC1-AC8) met.
*   Users can add, view, and remove stocks from their watchlist within the widget.
*   Watchlist displays real-time (or near real-time) price, change for each stock.
*   Relevant AI-generated insights or smart alerts are displayed for watchlisted stocks when available.
*   User's watchlist is persisted.
*   Navigation to stock detail page works.
*   Widget integrates correctly with the customizable dashboard system.
*   Code reviewed, merged, tests passing.

## 7. Notes / Questions

*   Confirm exact API endpoints and payload/response structures for watchlist management and real-time data feeds.
*   Clarify how company names and other detailed data (if not part of the basic quote) should be fetched/displayed.
*   Determine the strategy for handling a large number of symbols in the watchlist regarding real-time updates (e.g., batch subscriptions, backend aggregation).

## 8. Design / UI Mockup Links (If Applicable)

*   Refer to `docs/StockPulse_Design.md` for widget styling and data display guidelines.

## Story Progress Notes

### Agent Model Used: `<Agent Model Name/Version>`

### Completion Notes List

{Any notes about implementation choices, difficulties, or follow-up needed}

### Change Log 