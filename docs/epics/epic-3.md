# Epic 3: Detailed Portfolio Management

**Status:** To Do

**Parent PRD Sections:**

- 3.3.1 Portfolio Risk (Position sizing, heat maps, correlation, stress testing, dynamic hedging)
- 3.4 Performance Monitoring (Real-time P&L, performance attribution, risk metrics)
- 3.5.1 Dashboard (Portfolio overview - to be expanded here)
- 3.5.2 Trading Interface (Position management)
- 5.3 Portfolio Manager User Stories

**Goal:** To provide users with comprehensive tools to view, analyze, and manage their investment portfolios, including detailed position tracking, performance analytics, risk assessment, and basic portfolio operations.

**Scope:**

- Detailed view of all current positions (symbol, quantity, average price, current price, unrealized P&L, market value, cost basis, today's P&L).
  - **AI Consideration:** AI Portfolio Analysis Agent can provide context or insights on individual positions.
- Ability to view historical transactions for the portfolio.
  - **AI Consideration:** AI Portfolio Analysis Agent can summarize transaction patterns or highlight significant transactions.
- Display of key portfolio performance metrics (e.g., total return, Sharpe ratio (simplified initially), max drawdown (simplified initially)).
  - **AI Consideration:** AI Portfolio Analysis Agent to explain these metrics and their implications using RAG.
- Visualization of asset allocation (e.g., pie chart by asset type or sector, if data available).
  - **AI Consideration:** AI Portfolio Analysis Agent to comment on diversification and allocation using RAG.
- Basic risk indicators (e.g., portfolio volatility if calculable).
  - **AI Consideration:** AI Portfolio Analysis Agent to explain risk indicators using RAG.
- **Natural Language Query (NLQ) for Portfolio:** Allow users to ask questions about their portfolio to the AI Portfolio Analysis Agent (e.g., "Why did my portfolio value change significantly yesterday?").
- (Future Scope/Separate Epics: Advanced risk modeling, stress testing, tax lot accounting, portfolio optimization tools, direct rebalancing actions).

**AI Integration Points:**

- **AI Portfolio Analysis Agent:** This agent will be central to Epic 3, providing:
  - RAG-powered explanations of financial metrics and portfolio concepts.
  - Contextual insights on holdings, performance, allocation, and risk.
  - Summaries of transaction history.
  - Answers to natural language questions about the user's portfolio.
  - It will heavily utilize `StockPulse_VectorDB` for its knowledge base and `StockPulse_PostgreSQL` / `StockPulse_TimeSeriesDB` for portfolio data.

**Key Business Value:**

- Empowers users to understand their investment performance in detail.
- Provides insights into portfolio composition and risk.
- Facilitates informed decision-making regarding portfolio adjustments.

## Stories Under this Epic:

1.  **3.1: Implement Detailed Portfolio Holdings View**

    - **User Story:** As an authenticated user, on my Portfolio page, I want to see a detailed list of all my current holdings, including symbol, quantity, average cost, current price, market value, and unrealized P&L for each, so I can understand the status of my investments.
    - **Status:** To Do

2.  **3.2: Display Portfolio Performance Metrics**

    - **User Story:** As an authenticated user, on my Portfolio page, I want to see key performance metrics for my overall portfolio, such as total return, and today's P&L, so I can quickly assess its performance.
    - **Status:** To Do

3.  **3.3: Visualize Portfolio Asset Allocation**

    - **User Story:** As an authenticated user, on my Portfolio page, I want to see a visual representation (e.g., a pie chart) of my portfolio's asset allocation (e.g., by stock, or by sector if available), so I can understand my diversification.
    - **Status:** To Do

4.  **3.4: Implement Transaction History View**
    - **User Story:** As an authenticated user, I want to be able to view a history of my transactions (buys, sells, dividends, deposits, withdrawals) within my portfolio, so I can track all account activity.
    - **Status:** To Do

_More stories for advanced performance analytics, risk metrics, or portfolio adjustment tools can be added later._

## Dependencies:

- Core User Authentication (Epic 1) must be complete.
- Backend APIs for fetching detailed portfolio positions, historical transactions, performance data, and asset metadata (e.g., sector information).
- UI component library for tables, charts, and data display.
- `PortfolioPage.tsx` as the main container for these views.

## Notes & Assumptions:

- This epic focuses on the display and analysis of portfolio data. Actual trading/execution will be handled in separate epics related to the Trading Interface.
- Calculation of some complex metrics (e.g., Sharpe Ratio, Max Drawdown) might be simplified initially or rely on backend calculations.
- Real-time updates for position values will be important.
