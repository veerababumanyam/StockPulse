# Story 3.4: Implement Transaction History View

**Epic:** [Detailed Portfolio Management](../epic-3.md)
**Status:** Draft
**Priority:** Medium
**Points:** (Estimate)
**Assigned To:** 
**Sprint:** 

## 1. User Story

> As an authenticated user,
> I want to be able to view a chronological history of my transactions (e.g., buys, sells, dividends, deposits, withdrawals) within my portfolio, with options to filter by date range and transaction type,
> So I can track all account activity, verify trades, and understand cash flow.

## 2. Requirements

*   A new page or a dedicated section within the `PortfolioPage.tsx` (e.g., `/portfolio/transactions`) should display the transaction history.
*   Each transaction entry must display:
    *   Date and Time of transaction.
    *   Transaction Type (e.g., Buy, Sell, Dividend, Deposit, Withdrawal, Fee, Interest).
    *   Stock Symbol (if applicable, e.g., for Buy/Sell/Dividend).
    *   Company Name (if applicable and available).
    *   Quantity (if applicable, e.g., for Buy/Sell shares).
    *   Price per Share (if applicable, e.g., for Buy/Sell).
    *   Total Amount of the transaction (with currency).
    *   Status (e.g., Completed, Pending, Failed) - if applicable.
*   The list of transactions should be displayed in reverse chronological order by default (most recent first).
*   Users should be able to filter transactions by:
    *   Date Range (e.g., Last 30 days, Custom range).
    *   Transaction Type (e.g., show only Buys, or only Deposits & Withdrawals).
*   Pagination should be implemented if the number of transactions can be large.
*   The view should handle users with no transactions gracefully.
*   **AI-Powered Transaction Summary & Query (Optional):**
    *   Provide an option for the "AI Portfolio Analysis Agent" to generate a summary of transactions over a selected period (e.g., "Over the last 30 days, you made 5 buys totaling $X and 2 sells totaling $Y. Your net cash flow from trading was -$Z.").
    *   Allow users to ask natural language questions about their transactions (e.g., "Show me all my AAPL buys last month", "What was my largest sell transaction this year?") that the AI agent attempts to answer by querying/filtering the transaction data or providing a RAG-based interpretation.

## 3. Acceptance Criteria (ACs)

1.  **AC1:** Given an authenticated user navigates to the transaction history view, then a list of their transactions is displayed in reverse chronological order, showing Date/Time, Type, Symbol/Name (if any), Quantity (if any), Price (if any), and Total Amount for each.
2.  **AC2:** Given the transaction history is displayed, when the user applies a date range filter (e.g., "Last 7 days"), then only transactions within that date range are displayed.
3.  **AC3:** Given the transaction history is displayed, when the user applies a transaction type filter (e.g., "Sell"), then only transactions of that type are displayed.
4.  **AC4:** Given the user has many transactions, then pagination controls are available and allow the user to navigate through different pages of transactions.
5.  **AC5:** Given an authenticated user with no transactions navigates to the transaction history view, then a message like "You have no transactions yet" is displayed.
6.  **AC6:** Given the page is loading transaction data, then appropriate loading indicators are displayed.
7.  **AC7:** Given an error occurs while fetching transaction data, then a user-friendly error message is displayed.
8.  **AC8 (New - AI Transaction Summary):** Given the transaction history view is displayed and a date range is selected, when the user requests an AI summary, then the AI Portfolio Analysis Agent provides a textual summary of transaction activity within that period.
9.  **AC9 (New - AI Transaction Query):** Given the transaction history view is displayed, when the user enters a natural language query about their transactions, then the AI Portfolio Analysis Agent attempts to answer the query by analyzing the transaction data or providing a RAG-based interpretation, and displays the result.

## 4. Technical Guidance for Developer Agent

*   **Relevant PRD Sections:**
    *   `PRD.md#3.4.2` (Historical Performance and Reporting - transaction logs are part of this)
    *   `PRD.md#3.5.1` (Portfolio overview)
*   **Relevant Architecture Sections:**
    *   `architecture.md#3.1.1` (Frontend Architecture - potentially `src/pages/TransactionHistoryPage.tsx` or part of `PortfolioPage.tsx`)
    *   `architecture.md#3.2.2` (Portfolio Service or a dedicated Transaction Service)
    *   `docs/infrastructure_design.md#5.2` (AI Agent Architecture - AI Portfolio Analysis Agent)
    *   `docs/infrastructure_design.md#5.1` (RAG Pipeline - for the agent)
*   **Key Components/Modules to be affected/created:**
    *   New Page/Component: `src/pages/TransactionHistoryPage.tsx` or `src/components/portfolio/TransactionHistoryList.tsx`.
    *   Filtering Components: For date range and transaction type selection.
    *   Service: `src/services/transactionService.ts` (or `portfolioService.ts`) to fetch transactions with filter parameters.
    *   Service: (New or existing) `src/services/aiAgentService.ts` to interact with the AI Portfolio Analysis Agent for transaction summaries and queries.
    *   UI Elements: Button to trigger AI summary, input field for AI query, area to display AI responses.
*   **API Endpoints Involved:**
    *   `GET /api/v1/transactions` (or `/api/v1/portfolio/transactions`).
        *   Parameters: `startDate`, `endDate`, `type` (e.g., `BUY`, `SELL`, `DIVIDEND`), `page`, `pageSize`, `userId`.
        *   Expected Response: Paginated list of transaction objects, e.g.,
            `{ "transactions": [ { "id": "txn123", "dateTime": "2023-10-26T10:00:00Z", "type": "BUY", "symbol": "AAPL", "companyName": "Apple Inc.", "quantity": 10, "price": 170.00, "totalAmount": -1700.00, "status": "Completed" }, ... ], "pagination": { "currentPage": 1, "totalPages": 5, "totalCount": 48 } }`
    *   `POST /api/v1/agents/portfolio-analysis/transaction-summary` (Example for AI Agent)
        *   Request Body: `{ "userId": "uuid-user", "portfolioId": "uuid-user-portfolio", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD", "transactionData": [ ...filtered list of transactions... ] }` (Agent might re-fetch or use provided data)
        *   Expected Response: `{ "summaryText": "During this period, you primarily bought tech stocks...", "sources": [...] }`.
    *   `POST /api/v1/agents/portfolio-analysis/transaction-query` (Example for AI Agent)
        *   Request Body: `{ "userId": "uuid-user", "portfolioId": "uuid-user-portfolio", "queryText": "Show my AAPL buys last month", "transactionData": [ ...all user transactions or pre-filtered based on query... ] }`
        *   Expected Response: `{ "answerText": "You bought AAPL on YYYY-MM-DD (X shares) and YYYY-MM-DD (Y shares) last month.", "relevantTransactions": [ {...}, {...} ], "sources": [...] }` (Agent might return structured data or text).
*   **Styling/UI Notes:**
    *   Present transactions in a clear, tabular format. Refer to `StockPulse_Design.md`.
    *   Filters should be intuitive to use.
*   **Libraries:**
    *   Date picker library for custom date range selection.
    *   Table library (e.g., React Table, TanStack Table) if advanced features like sorting on columns (beyond default date) are desired.

## 5. Tasks / Subtasks

1.  **Task 1 (AC1, AC6, AC7):** Define API contract and implement `transactionService.ts` function to fetch transactions with filtering and pagination.
2.  **Task 2 (AC1, AC6, AC7, AC5):** Create `TransactionHistoryList.tsx` (or page). Implement data fetching, display of transactions in a table, and handling of loading, error, and empty states.
3.  **Task 3 (AC2):** Implement date range filter components and integrate with the service call.
4.  **Task 4 (AC3):** Implement transaction type filter components and integrate with the service call.
5.  **Task 5 (AC4):** Implement pagination controls and logic.
6.  **Task 6 (AC8, AC9):** Implement UI elements for AI transaction summary and query.
    *   Develop functions in `aiAgentService.ts` to interact with the AI Portfolio Analysis Agent for these features.
    *   Integrate these calls into the UI, displaying AI responses.
7.  **Task 7 (N/A):** Integrate the transaction history view into the application (e.g., link from portfolio page or main navigation).
8.  **Task 8 (N/A):** Style the page/component and filters according to `StockPulse_Design.md`.
9.  **Task 9 (N/A):** Write unit tests.

## 6. Definition of Done (DoD)

*   All Acceptance Criteria (AC1-AC9) met.
*   Users can view their transaction history with appropriate details.
*   Filtering by date range and transaction type functions correctly.
*   Pagination works for large sets of transactions.
*   Users can request and receive AI-generated summaries of their transactions for a period.
*   Users can ask natural language questions about their transactions and receive AI-generated answers.
*   Loading, error, and empty states are handled gracefully.
*   Code reviewed, merged, tests passing.

## 7. Notes / Questions

*   Confirm the full list of transaction types to be supported for filtering.
*   Clarify if any columns in the transaction list should also be sortable by the user (default is reverse chrono date).
*   Determine default date range if any (e.g., last 30 days).

## 8. Design / UI Mockup Links (If Applicable)

*   Refer to `docs/StockPulse_Design.md` for table styling and filter component design guidelines.

## Story Progress Notes

### Agent Model Used: `<Agent Model Name/Version>`

### Completion Notes List

{Any notes about implementation choices, difficulties, or follow-up needed}

### Change Log 