# Story 2.3: Develop Portfolio Value Chart Widget

**Epic:** [Dashboard Core Functionality](../epic-2.md)
**Status:** Draft
**Priority:** Medium
**Points:** (Estimate)
**Assigned To:** 
**Sprint:** 

## 1. User Story

> As a user,
> I want a "Portfolio Value Chart" widget on my dashboard that displays a historical chart of my total portfolio value over different timeframes (e.g., 1D, 1W, 1M, 3M, 1Y, YTD, All),
> So I can track my investment performance visually and identify trends.

## 2. Requirements

*   The widget must be selectable and placeable on the dashboard via the Customizable Widget System (Story 2.2).
*   It must fetch historical portfolio value data from a backend API.
*   The chart should display portfolio value on the Y-axis and time on the X-axis.
*   Users must be able to select different timeframes for the chart (e.g., buttons or dropdown for 1D, 1W, 1M, 3M, 1Y, YTD, All).
*   The chart should update dynamically when a new timeframe is selected.
*   Display appropriate loading states while chart data is being fetched.
*   Handle error states gracefully if data cannot be fetched or an error occurs during chart rendering.
*   The chart should be interactive (e.g., tooltips showing specific value and date on hover).
*   The chart should be visually appealing and easy to read, consistent with `StockPulse_Design.md`.
*   **AI-Powered Context (Optional):** Below or alongside the chart, display a small section for concise AI-generated insights related to the displayed chart data (e.g., "Notable increase on YYYY-MM-DD coincided with positive market news for your key holdings."). This would be powered by the "AI Portfolio Analysis Agent."

## 3. Acceptance Criteria (ACs)

1.  **AC1:** Given the "Portfolio Value Chart" widget is added to the dashboard, when data is successfully fetched for the default timeframe (e.g., 1M), then a line chart is displayed showing historical portfolio values over time.
2.  **AC2:** Given the chart is displayed, when a user selects a different timeframe (e.g., 1D, 1W, 1M, 3M, 1Y, YTD, All), then the chart updates to display data for the newly selected timeframe.
3.  **AC3:** Given the chart is displayed, when the user hovers over a data point on the chart, then a tooltip appears showing the exact portfolio value and corresponding date/time.
4.  **AC4:** Given the widget is loading data, then a clear loading indicator (e.g., spinner, skeleton screen) is displayed within the widget boundaries.
5.  **AC5:** Given an error occurs while fetching chart data, then a user-friendly error message is displayed within the widget boundaries, and no chart is rendered.
6.  **AC6:** Given no historical data is available for the selected timeframe, then an appropriate message (e.g., "No data available for this period") is displayed.
7.  **AC7 (New - AI Context):** Given chart data is displayed, the system attempts to fetch contextual insights from the AI Portfolio Analysis Agent based on the current view (timeframe, significant changes), and if relevant insights are returned, they are displayed near the chart.

## 4. Technical Guidance for Developer Agent

*   **Relevant PRD Sections:**
    *   `PRD.md#3.5.1` (Dashboard - Portfolio overview, Customizable widgets)
    *   `PRD.md#3.4.2` (Historical Analysis - Portfolio performance tracking)
*   **Relevant Architecture Sections:**
    *   `architecture.md#3.1.1` (Frontend Architecture - for component structure)
    *   `architecture.md#3.2.2` (Portfolio Service - for data fetching logic)
    *   `docs/infrastructure_design.md#5.2` (AI Agent Architecture - Portfolio Analysis AI Agent)
*   **Key Components/Modules to be affected/created:**
    *   New Widget Component: `src/components/widgets/PortfolioValueChartWidget.tsx`.
    *   Service: `src/services/portfolioService.ts` (or `chartService.ts`) to include a function for fetching historical portfolio value data, accepting timeframe as a parameter.
    *   Service: (New or existing) `src/services/aiAgentService.ts` to include a function for fetching AI insights related to the portfolio chart data.
    *   Charting Library Integration: A chosen charting library (e.g., Recharts, Chart.js, Nivo) will be used within this widget.
*   **Libraries:**
    *   A JavaScript charting library (e.g., Recharts, Chart.js, Nivo). Ensure it's responsive and customizable.
*   **API Endpoints Involved:**
    *   `GET /api/v1/portfolio/historical-value?timeframe={timeframe}&portfolioId={id}`
        *   Expected Response: An array of data points, e.g., `[ { "date": "YYYY-MM-DDTHH:mm:ssZ", "value": 12345.67 }, ... ]`.
    *   `POST /api/v1/agents/portfolio-analysis/chart-insights` (Example endpoint for AI Agent)
        *   Request Body: `{ "portfolioId": "uuid-user-portfolio", "chartData": [ ... ], "timeframe": "1M" }` (Agent needs chart data and timeframe)
        *   Expected Response: `{ "insightsText": "Your portfolio saw a significant dip around YYYY-MM-DD, which correlated with a broader market downturn. Recovery started around YYYY-MM-DD." }` or `{ "insightsText": null }`.
*   **Styling/UI Notes:**
    *   Chart colors, fonts, and tooltips should align with `StockPulse_Design.md`.
    *   Timeframe selection UI (buttons or dropdown) should be clear and easy to use.
    *   Ensure the chart is responsive and adapts to the widget's container size.
*   **Error Handling Notes:**
    *   Handle API errors and display messages within the widget.
    *   Handle cases with empty or insufficient data for charting.

## 5. Tasks / Subtasks

1.  **Task 1 (Research & Setup):** If not already chosen, select and install a suitable charting library. Familiarize with its API.
2.  **Task 2 (AC1):** Create the basic structure for `PortfolioValueChartWidget.tsx`.
3.  **Task 3 (AC1, AC4, AC5):** Implement the service function in `portfolioService.ts` to fetch historical portfolio data based on a timeframe parameter.
4.  **Task 4 (AC1, AC4, AC5, AC6):** Integrate the data fetching logic into the widget. Implement loading, error, and no-data states.
5.  **Task 5 (AC1):** Implement the chart rendering using the chosen library, displaying the fetched data.
6.  **Task 6 (AC2):** Add UI elements for timeframe selection (e.g., buttons or a dropdown).
7.  **Task 7 (AC2):** Implement logic to refetch data and update the chart when a new timeframe is selected.
8.  **Task 8 (AC3):** Configure chart interactivity, including tooltips on hover.
9.  **Task 9 (AC7):** Implement logic to call the `aiAgentService.ts` to fetch AI-generated contextual insights for the displayed chart data.
    *   Display these insights if provided.
    *   Handle errors or lack of insights gracefully.
10. **Task 10 (N/A):** Style the widget and chart according to `StockPulse_Design.md`.
11. **Task 11 (N/A):** Write unit tests for the widget, service function, and AI agent interaction.

## 6. Definition of Done (DoD)

*   All Acceptance Criteria (AC1-AC7) met.
*   The Portfolio Value Chart widget correctly fetches and displays historical portfolio data for various timeframes.
*   AI-generated contextual insights are displayed alongside the chart when relevant and available.
*   Chart is interactive (tooltips) and visually aligned with design specifications.
*   Loading, error, and no-data states are handled gracefully.
*   The widget integrates correctly with the customizable dashboard system (Story 2.2).
*   Code reviewed, merged, tests passing.

## 7. Notes / Questions

*   Confirm the exact API endpoint and data structure for historical portfolio values.
*   Define the default timeframe for the chart when it first loads.
*   Clarify specific formatting for dates and currency values in tooltips and axes.

## 8. Design / UI Mockup Links (If Applicable)

*   Refer to `docs/StockPulse_Design.md` for chart styling guidelines and dashboard widget aesthetics.

## Story Progress Notes

### Agent Model Used: `<Agent Model Name/Version>`

### Completion Notes List

{Any notes about implementation choices, difficulties, or follow-up needed}

### Change Log 