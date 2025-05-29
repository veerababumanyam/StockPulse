<!--
Epic: Trading & Order Management
Epic Link: [Epic 5: Trading & Order Management](../epic-5.md)
Story ID: 5.2
Story Title: Add Support for Stop & Stop-Limit Orders with Optional AI Parameter Suggestion
Persona: User (Active Trader, Risk-Conscious Investor)
Reporter: Jimmy (Product Owner)
Assignee: TBD (Development Team / AI Specialist)
Status: To Do
Estimate: TBD (e.g., 5 Story Points)
Sprint: TBD
Release: TBD
-->

# Story 5.2: Add Support for Stop & Stop-Limit Orders with Optional AI Parameter Suggestion

**As a** user (active trader or risk-conscious investor),
**I want** to be able to select "Stop" and "Stop-Limit" as order types in the order entry form, input the necessary stop (and limit) prices, and optionally get AI suggestions for these trigger/limit prices based on current volatility and my risk profile,
**So that** I can more effectively manage my risk and automate entries or exits with AI-assisted price setting.

## Description
This story extends the Order Entry Form (Story 5.1) to include Stop and Stop-Limit order types. A key feature is the integration of the AI Trade Advisor Agent to optionally suggest optimal stop and/or limit prices based on market conditions and user preferences (if available).

Key features include:
-   Adding "Stop" and "Stop-Limit" to the Order Type selector in the form.
-   Conditional input fields:
    -   For "Stop" orders: Stop Price input.
    -   For "Stop-Limit" orders: Stop Price and Limit Price inputs.
-   Time-in-Force selection (e.g., Day, GTC) for these order types.
-   **Optional AI Suggestion for Stop/Limit Prices:**
    -   A mechanism (e.g., a button or an auto-suggestion) for the user to request/receive AI-suggested values for Stop Price and/or Limit Price.
    -   AI suggestions will be based on factors like current stock volatility, recent price action, support/resistance levels (if identifiable by AI), and potentially user-defined risk tolerance (future enhancement).
-   Continuation of AI Pre-Trade Insights (from Story 5.1) relevant to these order types.
-   Client-side validations, including logical checks for stop/limit prices relative to market price (with warnings).

## Acceptance Criteria

1.  **AC1: New Order Types Available:** "Stop" and "Stop-Limit" options are added to the Order Type selector in the Order Entry Form.
2.  **AC2: Conditional Fields for Stop Orders:** When "Stop" is selected, a "Stop Price" input field becomes visible and required. Time-in-Force is also applicable.
3.  **AC3: Conditional Fields for Stop-Limit Orders:** When "Stop-Limit" is selected, both "Stop Price" and "Limit Price" input fields become visible and required. Time-in-Force is also applicable.
4.  **AC4: AI Price Suggestion (Optional):** A clear way for users to request or see AI-suggested Stop Price (for Stop/Stop-Limit) and Limit Price (for Stop-Limit) is available. Users can choose to use these suggestions or input their own values.
5.  **AC5: Relevance of AI Suggestions:** AI-suggested prices are logical (e.g., based on recent volatility, not random) and accompanied by a brief explanation if possible (e.g., "Suggested based on 2x Average True Range").
6.  **AC6: Logical Price Warnings:** If a user manually enters a Stop Price (or Limit Price) that seems illogical given the current market price and order direction (e.g., Buy Stop far below market), a non-blocking warning is displayed.
7.  **AC7: Validations:** Client-side validations ensure Stop Price and Limit Price (if applicable) are positive numbers and required when their order types are selected.
8.  **AC8: Proceed to Preview:** Submitting a valid Stop or Stop-Limit order (with manually entered or AI-suggested prices) proceeds to the Order Preview stage (Story 5.3), including all relevant price fields.

## Definition of Done (DoD)

-   All Acceptance Criteria met.
-   Order Entry Form updated to handle Stop and Stop-Limit types with conditional fields.
-   Integration with AI Trade Advisor Agent for optional stop/limit price suggestions is functional.
-   Client-side validations and warnings for these order types are implemented.
-   Code reviewed, merged, and unit/integration tests passed.
-   Product Owner (Jimmy) has reviewed and approved the functionality, including the AI suggestion feature.

## AI Integration Details

-   **Agent:** AI Trade Advisor Agent.
-   **Task:** Optionally suggest optimal Stop Price and/or Limit Price for Stop and Stop-Limit orders.
-   **Models:** Could use statistical models for volatility (e.g., ATR - Average True Range), simple rule-based systems, or more complex models looking at chart patterns/support-resistance if available.
-   **Data Sources for AI Suggestions:**
    -   `StockPulse_TimeSeriesDB`: Historical price/volume data to calculate volatility, ATR, identify recent highs/lows.
    -   Real-time market data APIs for current price.
    -   (Future) User profile: Risk tolerance settings.
-   **Flow for AI Price Suggestions:**
    1.  User selects Stop or Stop-Limit order type and may request AI suggestions.
    2.  Frontend sends current stock symbol, order direction (Buy/Sell), and possibly a reference to user's risk profile to AI Trade Advisor Agent.
    3.  Agent fetches necessary data (historical prices, current price).
    4.  Agent calculates/determines suggested Stop Price and/or Limit Price.
    5.  Agent returns suggested price(s) and possibly a brief rationale to the frontend.
    6.  Frontend displays suggestions, allowing user to accept or ignore them.

## UI/UX Considerations

-   Clear indication of how to get AI suggestions for prices.
-   Easy for users to override AI suggestions.
-   Brief, understandable explanations for AI-suggested prices, if provided.
-   Warnings for manual price entries should be helpful, not obstructive.

## Dependencies

-   Story 5.1 (Implement Order Entry Form with AI Pre-Trade Insights) - this story builds upon it.
-   AI Trade Advisor Agent (backend logic - Story 5.7, but specific endpoint for price suggestion needed).
-   Services for market data (historical and real-time).

## Open Questions/Risks

-   Defining the initial logic/sophistication for AI price suggestions (e.g., simple ATR-based, or more complex?).
-   How to best present optional AI suggestions without confusing users or slowing down the workflow.
-   User understanding and trust in AI-suggested stop/limit levels.
-   Ensuring AI suggestions are genuinely helpful and not just noise.

## Non-Functional Requirements (NFRs)

-   **Performance:** AI price suggestions should be generated quickly.
-   **Reliability:** AI suggestion feature should be reliable; if it fails, manual input must still be seamless.

---
*This story contributes to Epic 5: Trading & Order Management. Refer to the epic for overall goals and context.*
*Checklist: [Story Draft Checklist](../../../bmad-agent/checklists/story-draft-checklist.md)*
*Template: [Story Template](../../../bmad-agent/templates/story-tmpl.md)* 