<div align="center">
  <img src="public/logo.png" alt="StockPulse Logo" width="150" height="150" />
</div>

<div align="center">

# StockPulse - AI-Powered Financial Platform

[![Production-Grade](https://img.shields.io/badge/Production-Grade-green.svg)](https://github.com/user/stockpulse)
[![Version](https://img.shields.io/badge/Version-0.2.5-blue.svg)](https://github.com/user/stockpulse)
[![A2A Protocol](https://img.shields.io/badge/A2A-Protocol-orange.svg)](https://google-a2a.github.io/A2A/)
[![MCP](https://img.shields.io/badge/MCP-Enabled-purple.svg)](https://modelcontextprotocol.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

> **Enterprise-grade Agentic AI (AGI)-powered financial platform with hybrid Agent-to-Agent (A2A) and Model Context Protocol (MCP) architecture for institutional-grade portfolio management and trading intelligence.**

## 🚀 Revolutionary Hybrid AI Architecture

StockPulse implements a cutting-edge **A2A + MCP hybrid architecture + RAG** following Google's vision for complementary AI protocols:

- **🤝 A2A Protocol**: High-level agent collaboration and multi-agent workflows
- **🔧 MCP Protocol**: Structured tool and resource access to databases and services  
- **🌉 Cross-Protocol Integration**: A2A skills automatically exposed as MCP tools
- **🔄 Real-time Integration**: Live data flows between agents and specialized tools
- **🧠 RAG Pipeline**: Advanced retrieval-augmented generation for market insights
- **📖 [Comprehensive A2A+MCP Documentation](docs/ai/a2a-mcp-integration.md)**

## ⚡ Quick Start - Current Working Setup

### Prerequisites

- **Node.js 18+** (for frontend development)
- **Python 3.11+** (for backend and agents)
- **Docker & Docker Compose** (for database infrastructure - optional)

### 🚀 **Three-Service Architecture (Currently Working)**

StockPulse now runs as **three separate services** that need to be started independently:

#### **Service 1: Backend API Server**
```bash
# Terminal 1 - Backend (Port 8000)
npm run dev:backend
# ✅ Handles: Authentication, Database, Portfolio Management, API Gateway
```

#### **Service 2: Market Research Agent** 
```bash  
# Terminal 2 - AI Agent (Port 9003)
cd a2a-agents/market-researcher
python server.py
# ✅ Handles: Market Analysis, AI Insights, A2A Protocol, WebSocket Intelligence
```

#### **Service 3: Frontend Application**
```bash
# Terminal 3 - Frontend (Port 3000)
npm run dev  
# ✅ Handles: User Interface, Real-time Dashboard, WebSocket Client
```

### 🔄 **Service Communication Flow**
```
Frontend (3000) ←→ Backend API (8000) ←→ Market Research Agent (9003)
       ↓                    ↓                         ↓
   WebSocket Client    Database Gateway         A2A + WebSocket Server
```

### ✅ **Verification Commands**

After starting all services, verify they're running:

```bash
# Check all services are listening
netstat -an | findstr "3000\|8000\|9003"

# Should show:
# TCP    0.0.0.0:3000    (Frontend)
# TCP    0.0.0.0:8000    (Backend) 
# TCP    0.0.0.0:9003    (Agent)
```

## 🎯 **Current Feature Status - Version 0.2.5**

### ✅ **Completed Features (Story 2.5)**

#### **🤖 Market Research Agent (A2A Compliant)**
- ✅ **Full A2A Protocol Implementation** - Google A2A specification compliance
- ✅ **6 Specialized Skills**: market_analysis, news_research, company_analysis, trend_identification, sector_analysis, sentiment_analysis
- ✅ **Natural Language Query Interface** - Ask questions about markets in plain English
- ✅ **RAG Pipeline** - Advanced retrieval-augmented generation with fallbacks
- ✅ **AG-UI Components** - Dynamic UI component generation for insights
- ✅ **WebSocket Integration** - Real-time bidirectional communication
- ✅ **MCP Integration** - Structured database and tool access

#### **🔧 Backend Infrastructure**
- ✅ **Enterprise Authentication** - JWT + HttpOnly cookies, permission system
- ✅ **Market Research API Gateway** - Proxy between frontend and A2A agent  
- ✅ **Database Integration** - PostgreSQL with user management
- ✅ **WebSocket Proxy** - Bidirectional WebSocket communication
- ✅ **Error Handling** - Comprehensive error handling and logging

#### **🌐 Frontend Integration**
- ✅ **AI Insights Panel Widget** - Real-time market insights display
- ✅ **WebSocket Service** - Complete client-side WebSocket integration
- ✅ **Market Research Interface** - Natural language query UI
- ✅ **Responsive Design** - Mobile-first, accessible UI components

### 🔄 **In Development**

#### **📊 Portfolio Management (Story 2.6 - Next)**
- 🔄 **Real-time Portfolio Tracking** - Live portfolio valuation with P&L
- 🔄 **Performance Analytics** - Comprehensive performance metrics and attribution
- 🔄 **Risk Management Tools** - VaR, maximum drawdown, position sizing

#### **📈 Trading Intelligence (Story 2.7)**
- 🔄 **Technical Analysis Engine** - 100+ indicators and pattern recognition
- 🔄 **Options Analysis** - Options chain analysis with Greeks
- 🔄 **Automated Strategies** - Customizable trading algorithms

## 🤖 **AI Architecture - Current Implementation**

### 🎯 **A2A Agent (Agent-to-Agent Protocol)**

| Service | Port | Status | Capabilities |
|---------|------|--------|-------------|
| **Market Research Agent** | 9003 | ✅ **Active** | Market analysis, news research, company analysis, trends, sentiment, NLQ |

#### **Market Research Agent Skills:**
```json
{
  "skills": [
    "market_analysis",     // Market sentiment, trends, risk assessment
    "news_research",       // Financial news analysis and insights  
    "company_analysis",    // Company fundamentals and health
    "trend_identification", // Market trend detection and analysis
    "sector_analysis",     // Sector performance and comparison
    "sentiment_analysis"   // Market sentiment scoring and trends
  ],
  "natural_language_query": "Ask anything about markets in plain English",
  "ag_ui_components": "Dynamic UI generation for insights"
}
```

### 🔧 **MCP Servers (Planned - Docker Infrastructure)**

| Server | Port | Status | Purpose |
|--------|------|--------|---------|
| **PostgreSQL MCP** | 8003 | 🔄 Planned | Database operations, user management |
| **TimescaleDB MCP** | 8004 | 🔄 Planned | Time-series analytics, performance data |
| **Redis MCP** | 8005 | 🔄 Planned | Caching, session management |
| **Graphiti MCP** | 8006 | 🔄 Planned | Knowledge graph, relationship analysis |
| **Qdrant MCP** | 8007 | 🔄 Planned | Vector similarity search, embeddings |

## 🎯 Core Features

### 💼 Portfolio Management & Analytics

- **📊 Real-time Portfolio Tracking** - Live portfolio valuation with real-time P&L updates
- **📈 Performance Analytics** - Comprehensive performance metrics, risk analysis, and attribution
- **⚖️ Risk Management** - Value at Risk (VaR), maximum drawdown, and position sizing tools
- **🔄 Automated Rebalancing** - AI-driven portfolio optimization and rebalancing recommendations
- **🎯 Asset Allocation** - Strategic and tactical asset allocation optimization
- **📋 Position Management** - Individual holding tracking with tax-lot management
- **🔍 Portfolio Comparison** - Benchmark comparison and peer portfolio analysis

### 🤖 AI-Powered Trading Intelligence

- **🧠 Multi-Agent Collaboration** - Specialized AI agents working together for complex analysis
- **🔮 Predictive Analytics** - Machine learning-powered market forecasting and trend analysis
- **📊 Technical Analysis** - Advanced charting with 100+ technical indicators and pattern recognition
- **📰 Sentiment Analysis** - Real-time market sentiment from news, social media, and analyst reports
- **🎯 Smart Recommendations** - AI-generated trading signals and investment recommendations
- **⚡ Real-time Alerts** - Intelligent notifications for market opportunities and risks
- **🔍 Stock Screening** - Advanced multi-factor screening with natural language queries

### 🔒 Authentication & Security

- **🛡️ Enterprise Authentication** - Multi-factor authentication with JWT tokens and HttpOnly cookies
- **🔐 Zero Trust Architecture** - Every request verified with comprehensive audit trails
- **🔒 Data Encryption** - End-to-end encryption for sensitive financial data
- **📊 Comprehensive Logging** - Security event tracking and compliance reporting
- **🚧 Rate Limiting** - Advanced protection against brute force and DDoS attacks
- **👥 User Management** - Role-based access control and user administration

### 📱 Modern User Experience

- **🎨 Responsive Design** - Seamless experience across desktop, tablet, and mobile devices
- **🌙 Dark/Light Themes** - Multiple professional color themes with accessibility support
- **🎮 Interactive Charts** - Hardware-accelerated WebGL charts with real-time data visualization
- **🗣️ Voice Control** - Natural language queries and voice-controlled navigation
- **♿ Accessibility First** - WCAG 2.1 AA+ compliance with keyboard navigation and screen reader support
- **⚡ Performance Optimized** - Sub-second loading times with intelligent caching

### 📈 Advanced Market Analysis

- **📊 Real-time Market Data** - Live price feeds with millisecond precision
- **🔍 Fundamental Analysis** - Automated company research with financial statement analysis
- **📈 Technical Indicators** - Comprehensive technical analysis with custom indicators
- **📊 Pattern Recognition** - AI-powered identification of technical patterns and trends
- **📰 News Integration** - Real-time financial news with sentiment scoring
- **🌍 Global Markets** - Multi-asset class coverage including stocks, ETFs, and indices

### 🔧 Trading & Automation

- **⚡ Intraday Trading** - Real-time scalping tools with Level II order book data
- **📊 Options Analysis** - Options chain analysis with Greeks and volatility surface
- **📈 Long-term Investing** - Strategic investment tools and buy-and-hold analysis
- **🤖 Automated Strategies** - Customizable trading algorithms with backtesting
- **⏰ Scheduled Operations** - Automated trading and rebalancing on schedules
- **🎯 Risk Controls** - Position sizing, stop-loss automation, and exposure limits

### 📊 Data & Analytics

- **📈 Time-series Analysis** - Historical performance trends and seasonality analysis
- **🔍 Alternative Data** - ESG scoring, satellite data, and social sentiment integration
- **📊 Custom Dashboards** - Personalized analytics dashboards with drag-and-drop widgets
- **📈 Backtesting Framework** - Historical strategy validation with performance metrics
- **📊 Reporting Tools** - Professional-grade reports for compliance and analysis
- **🔄 Data Export** - Flexible data export in multiple formats (CSV, Excel, PDF)

## 🤖 AI Agents & Capabilities

### 🎯 A2A Agents (Agent-to-Agent Protocol)

| Agent                 | Port | Capabilities                                             | Specialization                       |
| --------------------- | ---- | -------------------------------------------------------- | ------------------------------------ |
| **User Assistant**    | 9001 | User interaction, task orchestration, session management | Main orchestrator and user interface |
| **Portfolio Manager** | 9002 | Portfolio analysis, performance tracking, rebalancing    | Specialized portfolio intelligence   |
| **A2A Registry**      | 9000 | Agent discovery & health monitoring                      | Service coordination                 |

### 🔧 MCP Servers (Model Context Protocol)

| Server              | Port | Purpose                        | Capabilities                                   |
| ------------------- | ---- | ------------------------------ | ---------------------------------------------- |
| **Auth MCP**        | 8002 | Authentication & authorization | User verification, permissions, security       |
| **PostgreSQL MCP**  | 8003 | Relational database operations | CRUD operations, complex queries, transactions |
| **TimescaleDB MCP** | 8004 | Time-series data operations    | Performance analytics, historical data         |
| **Redis MCP**       | 8005 | Caching & session management   | Real-time caching, session storage             |
| **Graphiti MCP**    | 8006 | Knowledge graph operations     | Relationship analysis, semantic search         |
| **Qdrant MCP**      | 8007 | Vector database operations     | Similarity search, embeddings                  |

## 🛠️ Technology Stack

### Frontend Technologies

- **⚛️ React 18+** with TypeScript for type-safe development
- **🎨 Tailwind CSS** for modern, responsive styling
- **📊 Recharts** for financial data visualization and charting
- **🎭 Framer Motion** for smooth animations and transitions
- **🔄 React Query** for efficient server state management
- **🚀 Vite** for lightning-fast development and building

### Backend Technologies

- **🐍 FastAPI** with Python 3.11+ for high-performance APIs
- **🗄️ PostgreSQL** for relational data storage
- **⏱️ TimescaleDB** for time-series financial data
- **🔄 Redis** for caching and session management
- **🕸️ Neo4j** for knowledge graph and relationship analysis
- **🔍 Qdrant** for vector similarity search and embeddings

### AI & Integration

- **🤝 A2A Protocol** for agent-to-agent communication
- **🔧 MCP Protocol** for structured tool and resource access
- **🤖 Multi-Agent Architecture** for specialized intelligence
- **📡 Real-time WebSocket** connections for live data
- **🔗 RESTful APIs** for third-party integrations

### Infrastructure & DevOps

- **🐳 Docker** containerization for consistent environments
- **🔧 Docker Compose** for multi-service orchestration
- **🔒 Enterprise Security** with JWT authentication and encryption
- **📊 Comprehensive Monitoring** with health checks and logging
- **🚀 Production Ready** with scaling and deployment automation

## 🛠️ Development Environment

### 📁 Project Structure

```
StockPulse/
├── 🎯 a2a-agents/              # Agent-to-Agent Protocol agents
│   ├── user-assistant/         # Main orchestrator agent
│   ├── portfolio-manager/      # Specialized portfolio agent
│   └── registry/              # Agent discovery service
├── 🔧 mcp-servers/            # Model Context Protocol servers
│   ├── auth-server/           # Authentication tools
│   ├── postgres-server/       # Database operations
│   ├── timescale-server/      # Time-series analytics
│   └── redis-server/          # Caching tools
├── 🌐 src/                    # Frontend React application
├── ⚙️ services/backend/       # FastAPI backend service
├── 🐳 docker-compose.dev.yml  # Development infrastructure
├── 📚 docs/                   # Comprehensive documentation
└── 🧪 tests/                  # Comprehensive testing suite
```

## 📖 Documentation

### 🎯 Core Documentation

- [**A2A+MCP Hybrid Architecture**](docs/ai/a2a-mcp-integration.md) - Complete integration guide
- [**Docker Infrastructure**](docs/docker-infrastructure.md) - Container orchestration
- [**Architecture Overview**](architecture.md) - System design principles
- [**Testing Strategy**](docs/testing/) - Comprehensive test documentation

### 🚀 Development Guides

- [**Setup Guide**](docs/setup.md) - Environment configuration
- [**API Documentation**](docs/api/) - Backend API reference
- [**Frontend Components**](docs/frontend/) - React component library
- [**Database Schema**](docs/database/) - Data model documentation

### 🔒 Security & Compliance

- [**Security Documentation**](docs/security/) - Security implementation
- [**Compliance Standards**](docs/compliance/) - Regulatory compliance

## 🧪 Testing & Quality Assurance

### Comprehensive Testing Strategy

```bash
tests/
├── unit/          # Unit tests for individual components
├── integration/   # Integration tests for service interactions
├── e2e/          # End-to-end tests for complete workflows
├── performance/   # Performance and load testing
└── security/     # Security vulnerability testing
```

### Running Tests

```bash
# Backend tests (requires Docker services)
pytest tests/

# Frontend tests
npm test

# Integration tests
pytest tests/integration/

# End-to-end tests with Playwright
npm run test:e2e

# Performance tests
npm run test:performance
```

### Quality Metrics

- **🎯 80%+ Code Coverage** across all critical paths
- **⚡ Performance Testing** with sub-second response times
- **🔒 Security Scanning** with automated vulnerability detection
- **♿ Accessibility Testing** for WCAG 2.1 AA+ compliance

## 🤝 Contributing

We welcome contributions from the community! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### 🏆 Built with Enterprise-Grade Standards

StockPulse follows industry best practices including:

- **🔒 OWASP Security Guidelines** for application security
- **📊 SOC 2 Compliance Patterns** for operational security
- **🔐 GDPR/CCPA Privacy Requirements** for data protection
- **♿ WCAG 2.1 AA+ Accessibility Standards** for inclusive design
- **📈 Financial Industry Standards** for regulatory compliance

**Ready for institutional use with hybrid AI architecture that scales to millions of users.**

🚀

### Development Standards

- ✅ **Enterprise-Grade Code** - Production-ready development standards
- 🧪 **Test-Driven Development** - Comprehensive test coverage (80%+ target)
- 📚 **Documentation First** - Clear documentation for all features
- 🔒 **Security-First Approach** - Security considerations in all development
- 🌐 **Accessibility Compliance** - WCAG 2.1 AA+ standards
- 🔄 **CI/CD Pipeline** - Automated testing, building, and deployment

### Code Quality

- **TypeScript** for type safety and better developer experience
- **ESLint & Prettier** for consistent code formatting
- **Husky** for pre-commit hooks and quality gates
- **Conventional Commits** for clear commit history
- **Automated Testing** for all new features and bug fixes

## 🏗️ Component Architecture: PortfolioOverview

We've completely revamped the PortfolioOverview component with a modern, maintainable, and performant architecture. Here are the key improvements:

### 🧩 Component Structure

```
src/
├── components/
│   ├── common/
│   │   └── ErrorBoundary.tsx      # Reusable error boundary with error recovery
│   └── widgets/
│       ├── PortfolioOverview.tsx  # Main component with container logic
│       ├── MetricCard.tsx         # Reusable metric card component
│       └── __tests__/             # Component tests
│           ├── PortfolioOverview.test.tsx
│           └── MetricCard.test.tsx
├── hooks/
│   ├── usePortfolioOverview.ts    # Custom hook for data fetching
│   └── __tests__/                 # Hook tests
│       └── usePortfolioOverview.test.ts
└── utils/
    └── common/
        ├── format.ts               # Formatting utilities
        └── __tests__/             # Utility tests
            └── format.test.ts
```

### 🚀 Key Improvements

1. **Modular Architecture**

   - Separated concerns with container/presentational components
   - Reusable `MetricCard` and `MetricItem` components
   - Custom hook for data fetching and state management

2. **Performance Optimizations**

   - Memoized expensive calculations
   - Efficient re-renders with React.memo
   - Optimized data fetching with caching

3. **Error Handling**

   - Comprehensive error boundaries
   - Graceful error states and recovery
   - Retry mechanisms for failed requests

4. **Testing**

   - Unit tests for all components and hooks
   - Integration tests for user flows
   - Test coverage for edge cases

5. **Code Quality**
   - TypeScript for type safety
   - Consistent code style with ESLint/Prettier
   - Comprehensive JSDoc documentation

### 🛠️ Usage

```tsx
import { PortfolioOverview } from "./components/widgets/PortfolioOverview";

// In your component:
<PortfolioOverview
  widgetId="portfolio-1"
  config={{
    title: "My Portfolio",
    refreshInterval: 30000, // 30 seconds
  }}
  isEditMode={false}
  onConfigChange={(config) => console.log("Config changed:", config)}
/>;
```

### 📊 Features

- Real-time portfolio metrics
- Responsive grid layout
- Loading and error states
- Configurable refresh interval
- Edit mode for customization
- Accessible UI components

### 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support & Community

- 📖 **Documentation**: [Complete documentation](docs/)
- 🐛 **Issues**: [GitHub Issues](https://github.com/user/stockpulse/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/user/stockpulse/discussions)
- 📧 **Email Support**: support@stockpulse.ai
- 💼 **Enterprise**: enterprise@stockpulse.ai

### Community

- 👥 **Discord**: Join our developer community
- 📱 **Twitter**: [@StockPulseAI](https://twitter.com/stockpulseai)
- 📺 **YouTube**: Video tutorials and demos
- 📝 **Blog**: Latest updates and technical insights

---

## Default Security Settings

The server comes with secure defaults:

### Allowed File Extensions

- Source code: `.ts`, `.tsx`, `.js`, `.jsx`, `.py`, `.sql`
- Documentation: `.md`, `.txt`, `.json`, `.yml`, `.yaml`
- Configuration: `.env.example`, `.gitignore`
- Assets: `.css`, `.html`, `.svg`, `.png`, `.jpg`

### Blocked Patterns

- Dependencies: `**/node_modules/**`, `**/dist/**`
- Version control: `**/.git/**`
- Secrets: `**/.env`, `**/*.key`, `**/*.pem`
- Logs: `**/*.log`
- Build artifacts: `**/build/**`, `**/.next/**`

### Size Limits

- Max file size: 50MB
- Max directory depth: 10 levels
- Max files per request: 100
