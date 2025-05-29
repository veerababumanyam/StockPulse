# Story 2.6: Develop Alert Management and Display Widget

**Epic:** [Dashboard Core Functionality](../epic-2.md)
**Status:** Draft
**Priority:** Medium
**Points:** (Estimate)
**Assigned To:** 
**Sprint:** 

## 1. User Story

> As a user,
> I want to be able to define custom alerts for specific stocks or market conditions, and see a summary of my active or recently triggered alerts in an "Alerts" widget on my dashboard,
> So that I am promptly notified of important market events relevant to my interests and can take timely action.

## 2. Requirements

*   The "Alerts" widget must be selectable and placeable on the dashboard via the Customizable Widget System (Story 2.2).
*   The widget should display a summary of active or recently triggered alerts for the user.
*   Users need a separate interface (e.g., a dedicated "Alerts Management Page" or section in "Settings") to:
    *   Create new alerts (e.g., stock price reaches X, % change > Y, volume > Z for a specific symbol).
    *   **AI-Powered Alert Suggestions (Optional):** Within the alert creation interface, the "AI Alert Suggestion Agent" can propose relevant alerts based on the user's portfolio, watchlist, common trading strategies, or currently viewed stock. This would use RAG.
    *   View all their configured alerts (active, inactive, triggered).
    *   Edit existing alert parameters.
    *   Delete alerts.
    *   Enable/disable alerts.
*   The dashboard widget should primarily be for display of active/triggered alerts; management might occur elsewhere.
*   When an alert condition is met (detected by backend), the user should be notified. The dashboard widget could highlight triggered alerts.
*   Alert configurations and their status must be persisted on the backend per user.
*   Clicking on a triggered alert in the widget could navigate to the relevant stock or provide more details.

## 3. Acceptance Criteria (ACs)

1.  **AC1:** Given the "Alerts" widget is added to the dashboard, when the user has active or recently triggered alerts, then these alerts are listed in the widget, showing key information (e.g., stock symbol, condition, status/triggered time).
2.  **AC2:** Given a user navigates to the "Alerts Management Page", then they can successfully create a new alert for a stock with specific conditions (e.g., price > $100), and this alert is persisted.
3.  **AC3:** Given a user is on the "Alerts Management Page", then they can view a list of all their configured alerts with their current status.
4.  **AC4:** Given a user is on the "Alerts Management Page", then they can edit the parameters of an existing, non-triggered alert.
5.  **AC5:** Given a user is on the "Alerts Management Page", then they can delete an alert.
6.  **AC6:** Given an alert's conditions are met (as determined by the backend), then the alert is visibly highlighted or marked as "triggered" in the dashboard widget and/or on the Alerts Management Page.
7.  **AC7:** Given the widget or management page is loading alert data, then appropriate loading indicators are displayed.
8.  **AC8:** Given an error occurs while fetching or managing alerts, then a user-friendly error message is displayed.
9.  **AC9 (New - AI Suggestions):** While creating/managing alerts, if the AI Alert Suggestion Agent identifies relevant suggestions, these are presented to the user, and the user can choose to accept a suggestion to pre-fill the alert creation form.

## 4. Technical Guidance for Developer Agent

*   **Relevant PRD Sections:**
    *   `PRD.md#3.5.1` (Dashboard - Alert management)
    *   `PRD.md#3.3.2` (Trade Risk - could tie into alert types)
*   **Relevant Architecture Sections:**
    *   `architecture.md#3.2.2` (Application Services - potential for a dedicated Alerting Service backend)
    *   `architecture.md#3.1.3` (Real-time Updates - for alert notifications)
    *   `docs/infrastructure_design.md#5.2` (AI Agent Architecture - AI Alert Suggestion Agent)
    *   `docs/infrastructure_design.md#5.1` (RAG Pipeline - for the suggestion agent)
*   **Key Components/Modules to be affected/created:**
    *   New Widget Component: `src/components/widgets/AlertsWidget.tsx`.
    *   New Page: `src/pages/AlertsManagementPage.tsx` (or `src/pages/settings/AlertsSettingsPage.tsx`).
    *   Service: `src/services/alertService.ts` for CRUD operations on alerts and fetching their status.
    *   Service: (New or existing) `src/services/aiAgentService.ts` to interact with the AI Alert Suggestion Agent.
    *   UI Elements: Forms for creating/editing alerts, list display for alerts, and a section for displaying AI alert suggestions.
*   **API Endpoints Involved:**
    *   `GET /api/v1/users/me/alerts` (Fetch all user alerts).
        *   Response: `[ { "id": "alertId1", "symbol": "AAPL", "condition_type": "price_above", "value": 150, "status": "active" }, ... ]`
    *   `POST /api/v1/users/me/alerts` (Create new alert).
        *   Request: `{ "symbol": "AAPL", "condition_type": "price_above", "value": 155 }`
    *   `PUT /api/v1/users/me/alerts/{alertId}` (Update alert).
    *   `DELETE /api/v1/users/me/alerts/{alertId}` (Delete alert).
    *   `POST /api/v1/agents/alert-suggestion/suggest` (Example endpoint for AI Agent)
        *   Request Body: `{ "userId": "uuid-user", "context": { "currentSymbol": "AAPL", "portfolioSymbols": ["MSFT", "GOOG"], "watchlistSymbols": ["TSLA"] } }`
        *   Expected Response: `{ "suggestions": [ { "displayText": "Set price alert if AAPL drops below $160?", "alertParams": { "symbol": "AAPL", "condition_type": "price_below", "value": 160 } }, ... ] }`
    *   WebSocket endpoint for receiving real-time notifications of triggered alerts.
*   **Styling/UI Notes:**
    *   Align with `StockPulse_Design.md`. Ensure alert creation form is intuitive.
    *   Clearly differentiate between active, inactive, and triggered alerts visually.
*   **Error Handling Notes:**
    *   Handle API errors for alert management operations.

## 5. Tasks / Subtasks

1.  **Task 1 (AC2, AC3, AC4, AC5):** Design and implement the `AlertsManagementPage.tsx` with forms for creating/editing alerts and a list to display all alerts.
2.  **Task 2 (AC9):** Integrate the AI Alert Suggestion Agent:
    *   Call `aiAgentService.ts` to fetch alert suggestions based on user context (e.g., on page load, or when viewing a specific stock for alert creation).
    *   Display these suggestions to the user.
    *   Allow users to click a suggestion to pre-fill the alert creation form.
3.  **Task 3 (AC2, AC3, AC4, AC5, AC8):** Implement service functions in `alertService.ts` for CRUD operations on alerts.
4.  **Task 4 (AC1, AC7):** Create the `AlertsWidget.tsx` to display a summary of active/recently triggered alerts fetched from the service.
5.  **Task 5 (AC6):** Implement logic for highlighting or updating displayed alerts in the widget and management page when a trigger notification is received (e.g., via WebSocket).
6.  **Task 6 (N/A):** Add routing for the `AlertsManagementPage.tsx`.
7.  **Task 7 (N/A):** Style all new components and pages.
8.  **Task 8 (N/A):** Write unit tests.

## 6. Definition of Done (DoD)

*   All Acceptance Criteria (AC1-AC9) met.
*   Users can create, view, edit, and delete alerts via the Alerts Management Page.
*   AI Alert Suggestion Agent provides relevant, actionable suggestions for creating alerts.
*   The Alerts widget on the dashboard displays relevant active/triggered alerts.
*   Alerts are highlighted or updated when triggered.
*   Loading and error states are handled gracefully.
*   Widget integrates correctly with the customizable dashboard system.
*   Code reviewed, merged, tests passing.

## 7. Notes / Questions

*   Confirm exact API endpoints and payload/response structures for alert management and real-time trigger notifications.
*   Define the initial set of alert condition types to be supported (e.g., price above/below, % change, volume).
*   Clarify how users will be notified beyond the dashboard widget (e.g., browser notifications, email - these might be separate stories).
*   Consider pagination for the Alerts Management Page if a user can have many alerts.

## 8. Design / UI Mockup Links (If Applicable)

*   Refer to `docs/StockPulse_Design.md` for widget styling, form design, and list display guidelines.

## Story Progress Notes

### Agent Model Used: `<Agent Model Name/Version>`

### Completion Notes List

{Any notes about implementation choices, difficulties, or follow-up needed}

### Change Log 