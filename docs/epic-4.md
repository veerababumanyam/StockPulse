# Epic 4: Stock Discovery & Analysis

**Status:** To Do

**Parent PRD Sections:**
*   `PRD.md#3.1` Market Data Access (real-time quotes, historical prices)
*   `PRD.md#3.2` Stock Analysis (technical indicators, metrics, AI-driven analysis)
*   `PRD.md#3.5.3` Research & News Feeds (AI-summarized and curated)
*   `PRD.md#5.1` Active Trader User Stories
*   `PRD.md#5.2` Casual Investor User Stories

**Goal:**
Enable users to discover new investment opportunities through AI-enhanced search, view AI-summarized and detailed stock data, interact with advanced charts, access RAG-powered research, and utilize an AI Stock Screener Agent.

**Scope:**
*   **AI-Enhanced Symbol Search:** Search with autocomplete, suggestions, and potential for natural language queries (e.g., "show me tech stocks with high growth potential").
*   **AI-Summarized Stock Detail Page:** Real-time quote, fundamental metrics, company profile, and an **AI-generated summary** of the stock's current standing, recent news, and outlook (using RAG).
*   Interactive price charts (intraday, historical) with zoom and technical overlays.
*   **RAG-Powered News & Research Feed:** Aggregated news, analyst reports, and press releases for each symbol, with AI-generated summaries and sentiment analysis. Users can ask clarifying questions about the research via an AI agent.
*   Watchlist integration (add/remove) directly from search or detail views.
*   **AI Stock Screener Agent:** A dedicated agent allowing users to define complex screening criteria (potentially using natural language) to find stocks matching their investment profile. The agent explains its findings.
*   **AI Comparative Analysis:** Allow users to select multiple stocks and receive an AI-generated comparison of their key metrics, pros/cons, and potential fit for different investment styles.

**AI Integration Points:**
*   **AI Market Insights Agent (extended or new specialized agent):**
    *   Powers AI-enhanced search and natural language understanding for stock discovery.
    *   Generates stock summaries for detail pages using RAG (`StockPulse_VectorDB` with company filings, news, analyst reports, financial statements).
    *   Provides summaries and sentiment for news feeds.
    *   Answers user questions about research content.
*   **AI Stock Screener Agent:**
    *   Interprets user screening criteria (structured or NL).
    *   Queries `StockPulse_PostgreSQL` (for fundamental/price data) and `StockPulse_VectorDB` (for qualitative data) to find matching stocks.
    *   Presents results with explanations.
*   **AI Comparative Analysis Agent (or feature of Market Insights Agent):**
    *   Fetches data for selected stocks.
    *   Uses RAG to generate comparative insights.

**Key Business Value:**
*   Significantly accelerates stock discovery and research through AI assistance.
*   Provides deeper, more accessible insights than traditional data displays.
*   Personalizes the discovery process through AI-driven screening and analysis.
*   Helps users identify and evaluate new stocks quickly and with more confidence.
*   Supports research-driven decision making for both active traders and long-term investors.

## Stories Under this Epic:

1.  **4.1: Implement AI-Enhanced Stock Search & Autocomplete**
    *   **User Story:** As a user, I want to search for stocks by symbol, company name, or natural language queries (e.g., "find undervalued tech stocks") with real-time autocomplete and AI-powered suggestions, so I can quickly and intuitively find relevant instruments.
    *   **Status:** To Do

2.  **4.2: Develop Stock Detail Page with AI Summary & Real-Time Data**
    *   **User Story:** As a user, when I select a symbol, I want to view a detail page with real-time price, fundamental metrics, company profile, and an AI-generated summary of the stock's key information, recent events, and outlook, so I can quickly assess the company.
    *   **Status:** To Do

3.  **4.3: Integrate Interactive Price Charts**
    *   **User Story:** As a user, on the Stock Detail Page, I want interactive price charts for intraday and historical data with zoom and technical overlays (e.g., moving averages), so I can analyze price trends.
    *   **Status:** To Do

4.  **4.4: Display RAG-Powered News & Research Feed with AI Summaries**
    *   **User Story:** As a user, on the Stock Detail Page, I want to see a feed of recent news articles, analyst reports, and press releases related to the symbol, with AI-generated summaries and sentiment indicators, and be able to ask clarifying questions about the content, so I can stay efficiently informed.
    *   **Status:** To Do

5.  **4.5: Develop AI Stock Screener Agent**
    *   **User Story:** As an investor, I want an AI Stock Screener Agent where I can define criteria (using forms or natural language like "find healthcare stocks with P/E below 15 and strong revenue growth") to discover stocks that match my specific investment strategy, with the AI explaining its choices.
    *   **Status:** To Do

6.  **4.6: Implement AI-Powered Comparative Stock Analysis**
    *   **User Story:** As an investor, I want to select multiple stocks and receive an AI-generated comparative analysis (metrics, pros/cons, news sentiment, analyst ratings) to help me decide between them.
    *   **Status:** To Do

## Dependencies:
*   MarketDataService API for symbol search, quotes, historical data.
*   `StockPulse_PostgreSQL` for structured stock data.
*   `StockPulse_VectorDB` for RAG (news, reports, filings, financial education content).
*   AI Agents: Market Insights Agent (or specialized versions), AI Stock Screener Agent.
*   Charting library (e.g., Recharts, Chart.js).
*   News API or RSS aggregation service (data to be fed into RAG).
*   UI components for autocomplete, charts, lists, and AI interaction.

## Notes & Assumptions:
*   AI-enhanced search will require robust NLP capabilities on the backend.
*   AI summaries need to be clearly marked as AI-generated with disclaimers.
*   RAG knowledge base for financial news and reports needs to be kept up-to-date.
*   Watchlist backend endpoints exist (`POST/DELETE /api/v1/users/me/watchlist`).

## Future Scope:
*   AI-detected chart patterns and suggested technical indicators.
*   Personalized stock recommendations based on portfolio and screener history.
*   AI-generated investment theses for selected stocks.

---
*Parent: [Epics Index](index.md)*
*Version: 1.0* 