<!--
Epic: Trading & Order Management
Epic Link: [Epic 5: Trading & Order Management](../epic-5.md)
Story ID: 5.3
Story Title: Implement Order Preview & Confirmation with AI Insight Summary
Persona: User (Active Trader, Casual Investor)
Reporter: Jimmy (Product Owner)
Assignee: TBD (Development Team / AI Specialist)
Status: To Do
Estimate: TBD (e.g., 5 Story Points)
Sprint: TBD
Release: TBD
-->

# Story 5.3: Implement Order Preview & Confirmation with AI Insight Summary

**As a** user (active trader or casual investor),
**I want** to see a clear summary of my intended order details (symbol, action, quantity, order type, prices, time-in-force, estimated cost/proceeds) and a consolidated summary of any AI insights or warnings generated during order entry,
**So that** I can review everything meticulously, understand potential AI-flagged considerations, and then explicitly confirm to place the order or go back to edit it.

## Description
This story is critical as it's the final step before an order is placed. It involves presenting all order details clearly to the user, along with a summary of AI insights (from Stories 5.1 and 5.2) and any critical pre-trade check warnings. The user must explicitly confirm the order here.

Key features include:
-   Display of all order parameters from the Order Entry Form (Stories 5.1, 5.2).
-   **Consolidated AI Insight Summary Section:** A dedicated area that summarizes key AI-generated insights presented earlier, such as:
    -   Pre-trade risk assessment highlights.
    -   Goal alignment notes.
    -   Market context summary.
    -   Rationale for any AI-suggested stop/limit prices if they were used.
-   Clear display of estimated total cost (for Buy) or proceeds (for Sell), with disclaimers about estimate nature.
-   Display of any critical warnings (e.g., insufficient funds, no shares to sell) that might block order placement.
-   "Confirm & Place Order" button: Submits the order to the backend for execution.
-   "Edit Order" (or "Back") button: Returns the user to the Order Entry Form with their data pre-filled.
-   Handling of successful order placement (e.g., success notification, navigation).
-   Handling of failed order placement (e.g., error message, option to retry or edit).

## Acceptance Criteria

1.  **AC1: Comprehensive Order Detail Display:** The preview screen clearly displays all critical order parameters: Action, Symbol, Company Name, Quantity, Order Type, Limit Price (if any), Stop Price (if any), Time-in-Force, and Estimated Cost/Proceeds.
2.  **AC2: AI Insight Summary Display:** A section clearly presents a summary of the AI insights/warnings that were generated in the order entry steps (from Story 5.1 & 5.2). This summary should be concise and highlight key AI takeaways.
3.  **AC3: Critical Warnings & Order Blocking:** If critical issues exist (e.g., insufficient buying power, no shares for selling), these are prominently displayed, and the "Confirm & Place Order" button is disabled or clearly indicates it cannot proceed.
4.  **AC4: Non-Critical Warnings:** Any non-critical AI warnings (e.g., "AI suggests a different stop price due to volatility") are displayed for user consideration, but do not block order placement.
5.  **AC5: "Edit Order" Functionality:** Clicking "Edit Order" returns the user to the Order Entry Form (Story 5.1/5.2) with all previously entered data (including AI suggestions if they were part of the state) repopulated.
6.  **AC6: "Confirm & Place Order" - Success:** When "Confirm & Place Order" is clicked (and no critical warnings exist), the order is submitted to the backend. On successful API response:
    a.  A clear success notification (e.g., toast message) is displayed (e.g., "Order for 100 AAPL Buy Market Submitted Successfully. Order ID: XXXXX").
    b.  The preview screen is closed/user is navigated appropriately (e.g., to portfolio or order history page).
7.  **AC7: "Confirm & Place Order" - Failure:** If the backend API call fails (e.g., market closed, broker rejection, technical error), an appropriate error message is displayed on the preview screen, and the user is allowed to go back to edit or potentially retry (if applicable).
8.  **AC8: Clarity of Information:** All information, especially financial figures and AI insights, is presented in an unambiguous, easy-to-understand manner.

## Definition of Done (DoD)

-   All Acceptance Criteria met.
-   Order preview UI implemented, displaying all order details and the AI insight summary.
-   Logic for handling critical vs. non-critical warnings is in place.
-   Order submission to backend API is functional, with robust success and error handling.
-   Navigation for "Edit Order" and post-submission (success/failure) is correctly implemented.
-   Code reviewed, merged, and unit/integration tests passed.
-   Product Owner (Jimmy) has reviewed and approved the functionality, especially the presentation of AI insights and the overall confirmation flow.

## AI Integration Details

-   **Agent:** Primarily consumes insights generated by the AI Trade Advisor Agent in previous steps (5.1, 5.2).
-   **Task:** Display a *summary* or *reiteration* of previously generated AI insights. No new AI analysis is typically performed at this specific preview stage, but the information must be passed and presented effectively.
-   **Data Flow:** Order details and AI insights data gathered in Stories 5.1 and 5.2 are passed to this preview component.

## UI/UX Considerations

-   This is a high-stakes screen; clarity and preventing accidental orders are paramount.
-   "Confirm & Place Order" button should be very distinct and require a deliberate action.
-   AI Insight Summary should be concise and reinforce key points without adding new complex information at this final stage.
-   Consider a final explicit confirmation checkbox like "I understand the risks and AI suggestions" if compliance requires or if deemed useful.

## Dependencies

-   Story 5.1 (Implement Order Entry Form with AI Pre-Trade Insights)
-   Story 5.2 (Add Support for Stop & Stop-Limit Orders with Optional AI Parameter Suggestion)
-   Backend Order Management Service API for placing orders (POST /api/v1/orders).
-   Backend services for pre-trade checks if not handled by the order placement API itself (e.g., final buying power check).

## Open Questions/Risks

-   How to best summarize diverse AI insights (from risk, goal alignment, parameter suggestions) into a concise preview?
-   Exact payload and response structure for the order placement API.
-   Handling of potential race conditions (e.g., market price changes significantly between order entry and confirmation).
-   Specific wording for disclaimers, especially around estimated costs and AI suggestions, to meet compliance.

## Non-Functional Requirements (NFRs)

-   **Security:** The order confirmation step must be secure.
-   **Reliability:** Order placement API calls must be highly reliable. Failures should provide clear feedback.
-   **Auditability:** All confirmed orders (and attempts) should be logged securely.

---
*This story contributes to Epic 5: Trading & Order Management. Refer to the epic for overall goals and context.*
*Checklist: [Story Draft Checklist](../../../bmad-agent/checklists/story-draft-checklist.md)*
*Template: [Story Template](../../../bmad-agent/templates/story-tmpl.md)* 