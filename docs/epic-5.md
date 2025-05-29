# Epic 5: Trading & Order Management

**Status:** To Do

**Parent PRD Sections:**
*   `PRD.md#3.5.2` (Trading Interface)
*   `PRD.md#3.6` (Order Management)
*   `PRD.md#3.7` (Trade Execution & Confirmation)
*   `PRD.md#3.2.4` (AI-Assisted Trading - new section)
*   `PRD.md#5.1` (Active Trader User Stories)

**Goal:** To enable users to execute trades securely and efficiently, manage orders, and review trade history, all augmented by AI-driven insights and risk assessment.

**Scope:**
*   Order entry form supporting Market, Limit, Stop, and Stop-Limit orders for Buy/Sell actions.
*   **AI Pre-Trade Analysis & Risk Assessment:** Before order submission, an "AI Trade Advisor Agent" provides insights on potential risks, alignment with portfolio goals (if defined), and market conditions. This uses RAG and real-time data.
*   **AI-Suggested Order Parameters (Optional):** The AI Trade Advisor Agent might suggest optimal limit prices or stop-loss levels based on volatility and user's risk profile.
*   Pre-trade validations (e.g., buying power, sufficient shares for selling).
*   Order preview and confirmation step, incorporating AI insights.
*   Real-time status updates for open orders.
*   Ability to view, modify, and cancel open orders.
*   Detailed view of trade execution history.
*   Notifications for order fills and status changes.
*   **AI Post-Trade Analysis:** After a trade executes, the AI Trade Advisor Agent can provide a brief analysis of the trade's impact on the portfolio and whether it achieved its intended outcome (e.g., if it was a limit order filled at a good price).

**AI Integration Points:**
*   **AI Trade Advisor Agent:**
    *   Provides pre-trade analysis (risk, market conditions, goal alignment) using RAG (`StockPulse_VectorDB` with market news, risk management principles, trading strategies) and real-time market data.
    *   Optionally suggests order parameters (limit prices, stop levels).
    *   Provides post-trade analysis (impact on portfolio, outcome assessment).
    *   Utilizes `StockPulse_PostgreSQL` for portfolio data and `StockPulse_TimeSeriesDB` for price history.
*   **A2A Communication:** The AI Trade Advisor Agent might communicate with the AI Portfolio Analysis Agent (Epic 3) to understand portfolio context for its advice, and with the Market Insights Agent (Epic 2 & 4) for broader market context.

**Key Business Value:**
*   Empowers users to make more informed trading decisions with AI-driven insights.
*   Helps manage risk more effectively through pre-trade analysis.
*   Enhances the trading experience by providing context and suggestions.
*   Offers transparency into order lifecycle and trade executions, augmented by AI review.

## Stories Under this Epic:

1.  **5.1: Implement Order Entry Form with AI Pre-Trade Insights**
    *   **User Story:** As a user, I want an order entry form where I can select a stock, specify buy/sell, quantity, and choose order types, and see AI-generated pre-trade insights (risk, market context) before I proceed.
    *   **Status:** To Do

2.  **5.2: Add Support for Stop & Stop-Limit Orders with Optional AI Parameter Suggestion**
    *   **User Story:** As a user, in the order entry form, I want to place Stop and Stop-Limit orders, and optionally get AI suggestions for trigger/limit prices based on current volatility and my risk profile.
    *   **Status:** To Do

3.  **5.3: Implement Order Preview & Confirmation with AI Insight Summary**
    *   **User Story:** As a user, before submitting an order, I want a preview summarizing my order details and any key AI insights/warnings, and I need to confirm it, so I can make a final informed decision.
    *   **Status:** To Do

4.  **5.4: Develop Open Orders Management View**
    *   **User Story:** As a user, I want a view where I can see all my open/pending orders with their current status, and have options to attempt to modify or cancel them, so I can manage my active orders.
    *   **Status:** To Do

5.  **5.5: Implement Trade Execution History View with AI Post-Trade Analysis**
    *   **User Story:** As a user, I want to see a historical list of my filled orders, and for each, an optional AI-generated summary of the trade's impact and outcome.
    *   **Status:** To Do

6.  **5.6: Implement Real-time Order Status Updates & Notifications**
    *   **User Story:** As a user, I want to receive real-time updates on the status of my orders (e.g., filled, cancelled) and notifications for these events, so I am promptly informed.
    *   **Status:** To Do

7.  **5.7 (New): Develop AI Trade Advisor Agent Backend Logic**
    *   **User Story:** As a platform developer, I need the backend AI Trade Advisor Agent fully implemented, capable of analyzing trade requests, accessing necessary data (portfolio, market, RAG KB), and generating pre-trade insights, parameter suggestions, and post-trade analysis.
    *   **Status:** To Do

## Dependencies:

*   User Authentication (Epic 1).
*   Portfolio Service (for buying power, position checks - Epic 3).
*   Brokerage/Exchange API integration for order placement, status updates, and trade history.
*   Real-time notification system (WebSockets).
*   Secure handling of order data.
*   Market Insights Agent (Epic 2 & 4) for market context.
*   `StockPulse_PostgreSQL`, `StockPulse_VectorDB`, `StockPulse_TimeSeriesDB`.
*   A2A communication protocols defined and implemented.

## Notes & Assumptions:

*   Order modification capabilities depend heavily on what the backend brokerage API supports.
*   Assumes a robust backend for order routing, execution, and compliance checks.
*   Estimated costs in order preview are indicative and may not include all fees until execution.
*   AI suggestions are advisory and users retain full control.
*   Accuracy of AI insights depends on data quality and agent sophistication.
*   Clear disclaimers for AI-generated advice are crucial.

## Future Scope:
*   AI-driven order routing for best execution.
*   Fully automated AI trading strategies based on user-defined parameters.
*   AI agent for tax-loss harvesting suggestions.
*   Advanced order types (e.g., Trailing Stop, OCO - One-Cancels-the-Other).
*   Algorithmic trading options.
*   Batch order entry. 