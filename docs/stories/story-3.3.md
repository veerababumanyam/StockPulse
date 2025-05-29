# Story 3.3: Visualize Portfolio Asset Allocation

**Epic:** [Detailed Portfolio Management](../epic-3.md)
**Status:** Draft
**Priority:** Medium
**Points:** (Estimate)
**Assigned To:** 
**Sprint:** 

## 1. User Story

> As an authenticated user,
> On my Portfolio page (`/portfolio`),
> I want to see a visual representation (e.g., a pie chart or donut chart) of my portfolio's asset allocation by stock symbol and, if available, by sector,
> So I can quickly understand my diversification and concentration in different assets or market areas.

## 2. Requirements

*   The `PortfolioPage.tsx` should display a chart visualizing asset allocation.
*   The primary allocation view should be by stock symbol (e.g., AAPL: 25%, MSFT: 20%, GOOG: 15%, etc., based on current market value of holdings).
*   If sector information for each stock is available via API, a secondary view or toggle should allow visualization by sector (e.g., Technology: 40%, Financials: 30%, Healthcare: 20%).
*   Chart types to consider: Pie chart, Donut chart, or possibly a Treemap for many holdings.
*   The chart should be interactive (e.g., tooltips showing symbol/sector and percentage on hover).
*   The chart should represent allocation based on the current market value of each holding.
*   The chart should update if the underlying market values change (though real-time updates for the chart itself might be less critical than for numerical data, periodic refresh or on-demand refresh could be acceptable if real-time is too complex).
*   If there are too many small holdings, the chart should group them into an "Others" category to maintain readability.
*   **AI-Powered Commentary:** Below or alongside the chart, display a small section for concise AI-generated commentary on the asset allocation from the "AI Portfolio Analysis Agent" (e.g., "Your portfolio shows high concentration in the Technology sector (60%). Consider exploring diversification into other sectors like Healthcare or Consumer Staples to mitigate sector-specific risks."). This will use RAG for general diversification advice.

## 3. Acceptance Criteria (ACs)

1.  **AC1:** Given an authenticated user with portfolio holdings navigates to the `/portfolio` page, then a chart (e.g., pie chart) is displayed showing the allocation of their portfolio by stock symbol, based on current market values.
2.  **AC2:** Given the asset allocation chart is displayed, when the user hovers over a segment of the chart, then a tooltip appears showing the stock symbol and its percentage of the total portfolio value.
3.  **AC3 (If sector data available):** Given sector data is available and the user selects a "View by Sector" option, then the chart updates to show portfolio allocation by sector.
4.  **AC4 (If sector data available):** Given the "View by Sector" chart is displayed, when the user hovers over a sector segment, then a tooltip appears showing the sector name and its percentage of the total portfolio value.
5.  **AC5:** Given the user has many small holdings, then holdings below a certain threshold (e.g., <1% or <2% of portfolio value) are grouped into an "Others" category in the chart.
6.  **AC6:** Given the page is loading data for the chart, then appropriate loading indicators are displayed for the chart area.
7.  **AC7:** Given an error occurs while fetching data or rendering the chart, then a user-friendly error message is displayed in the chart area.
8.  **AC8:** Given a user has no holdings, then the chart area displays a message like "No allocation data to display" or is hidden.
9.  **AC9 (New - AI Commentary):** Given the asset allocation chart is displayed, the system attempts to fetch commentary from the AI Portfolio Analysis Agent based on the current allocation, and if relevant commentary is returned, it is displayed near the chart.

## 4. Technical Guidance for Developer Agent

*   **Relevant PRD Sections:**
    *   `PRD.md#3.3.1` (Portfolio Risk - diversification, heat maps - this is a basic form of visualizing concentration)
    *   `PRD.md#3.5.1` (Portfolio overview)
*   **Relevant Architecture Sections:**
    *   `architecture.md#3.1.1` (Frontend Architecture - `src/pages/PortfolioPage.tsx`)
    *   `architecture.md#3.2.2` (Portfolio Service - may need to provide sector data)
    *   `docs/infrastructure_design.md#5.2` (AI Agent Architecture - AI Portfolio Analysis Agent)
    *   `docs/infrastructure_design.md#5.1` (RAG Pipeline - for the agent)
*   **Key Components/Modules to be affected/created:**
    *   Page: `src/pages/PortfolioPage.tsx` (updates to include this new chart).
    *   Component: `src/components/portfolio/AssetAllocationChart.tsx` (new component).
    *   Service: `src/services/portfolioService.ts` and `src/services/marketDataService.ts` might need to ensure sector information is available for each holding if the "by sector" view is implemented.
    *   Service: (New or existing) `src/services/aiAgentService.ts` to interact with the AI Portfolio Analysis Agent for allocation commentary.
    *   Data Transformation: Logic to process holdings data into a format suitable for the charting library (e.g., `[{ name: 'AAPL', value: 5000 }, { name: 'MSFT', value: 4000 }]`).
*   **API Endpoints Involved:**
    *   Relies on `GET /api/v1/portfolio/holdings` (from Story 3.1).
    *   May need `GET /api/v1/market/stocks/{symbol}/details` or similar if sector data isn't part of the holdings response and needs to be fetched per symbol (consider performance implications).
    *   `POST /api/v1/agents/portfolio-analysis/allocation-commentary` (Example for AI Agent)
        *   Request Body: `{ "userId": "uuid-user", "portfolioId": "uuid-user-portfolio", "allocationData": { "bySymbol": [{"symbol": "AAPL", "percentage": 25}, ...], "bySector": [{"sector": "Technology", "percentage": 60}, ...] } }`
        *   Expected Response: `{ "commentaryText": "Your portfolio is heavily concentrated in Technology (60%). While this sector has performed well, consider diversifying...", "sources": [...] }` or `{ "commentaryText": null }`.
*   **Libraries:**
    *   A charting library (e.g., Recharts, Chart.js, Nivo) will be essential.
*   **Styling/UI Notes:**
    *   Choose clear, distinct colors for chart segments. Refer to `StockPulse_Design.md`.
    *   Ensure chart is responsive and legible on different screen sizes.
    *   A legend might be necessary if there are many segments.
*   **Considerations:**
    *   Fetching sector data for each holding individually could be slow. Ideally, it should be part of the holdings API response or fetched in a batch.
    *   The threshold for grouping into "Others" should be configurable or intelligently determined.

## 5. Tasks / Subtasks

1.  **Task 1 (AC1, AC6, AC7, AC8):** Design `AssetAllocationChart.tsx`. Implement logic to process holdings data (from Story 3.1) to calculate allocation by symbol.
2.  **Task 2 (AC1, AC2):** Integrate a charting library and render the initial pie/donut chart showing allocation by symbol with tooltips.
3.  **Task 3 (AC5):** Implement logic to group small holdings into an "Others" category.
4.  **Task 4 (AC3, AC4 - If sector data available):** If sector data can be reliably obtained, implement the "View by Sector" functionality, including data processing and chart update.
5.  **Task 5 (AC9):** Implement logic to call `aiAgentService.ts` to fetch AI-generated commentary on the current asset allocation.
    *   Display commentary if provided.
    *   Handle errors or lack of commentary gracefully.
6.  **Task 6 (N/A):** Ensure the chart updates (or can be refreshed) if underlying portfolio values change significantly.
7.  **Task 7 (N/A):** Integrate `AssetAllocationChart.tsx` into `PortfolioPage.tsx`.
8.  **Task 8 (N/A):** Style the chart and component according to `StockPulse_Design.md`.
9.  **Task 9 (N/A):** Write unit tests.

## 6. Definition of Done (DoD)

*   All core Acceptance Criteria (AC1, AC2, AC5, AC6, AC7, AC8, AC9) met.
*   If sector view implemented, AC3 and AC4 are also met.
*   Portfolio page displays a clear chart visualizing asset allocation by symbol (and optionally by sector).
*   AI-generated commentary on the asset allocation is displayed when relevant and available.
*   Chart is interactive with tooltips.
*   Small holdings are appropriately grouped.
*   Loading, error, and empty states are handled gracefully.
*   Code reviewed, merged, tests passing.

## 7. Notes / Questions

*   Confirm availability and source of stock sector information. Is it part of the holdings API, or does it require separate calls?
*   Decide on the charting library to be used.
*   Define the exact threshold for the "Others" category.
*   Real-time updates for the chart: how critical? Periodic refresh might be sufficient.

## 8. Design / UI Mockup Links (If Applicable)

*   Refer to `docs/StockPulse_Design.md` for chart styling and color palettes.

## Story Progress Notes

### Agent Model Used: `<Agent Model Name/Version>`

### Completion Notes List

{Any notes about implementation choices, difficulties, or follow-up needed}

### Change Log 