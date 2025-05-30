<div align="center">
  <img src="public/logo.png" alt="StockPulse Logo" width="150" height="150" />
</div>

<div align="center">

# StockPulse - AI-Powered Financial Platform

[![Production-Grade](https://img.shields.io/badge/Production-Grade-green.svg)](https://github.com/user/stockpulse)
[![Docker](https://img.shields.io/badge/Docker-Enabled-blue.svg)](https://docker.com)
[![A2A Protocol](https://img.shields.io/badge/A2A-Protocol-orange.svg)](https://google-a2a.github.io/A2A/)
[![MCP](https://img.shields.io/badge/MCP-Enabled-purple.svg)](https://modelcontextprotocol.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

> **Enterprise-grade Agentic AI (AGI)-powered financial platform with hybrid Agent-to-Agent (A2A) and Model Context Protocol (MCP) architecture for institutional-grade portfolio management and trading intelligence.**

## 🚀 Revolutionary Hybrid AI Architecture

StockPulse implements a cutting-edge **A2A + MCP hybrid architecture + RAG ** following Google's vision for complementary AI protocols:

- **🤝 A2A Protocol**: High-level agent collaboration and multi-agent workflows
- **🔧 MCP Protocol**: Structured tool and resource access to databases and services
- **🌉 Cross-Protocol Integration**: A2A skills automatically exposed as MCP tools
- **🔄 Real-time Integration**: Live data flows between agents and specialized tools
- ** [📖 **Comprehensive A2A+MCP Documentation\*\*](docs/ai/a2a-mcp-integration.md)
- ** RAG** :

## ⚡ Quick Start

### Prerequisites

- **Docker & Docker Compose** (for backend services)
- **Node.js 18+** (for frontend development)
- **Python 3.11+** (for local development)

### 🐳 Start Backend Infrastructure (Recommended)

```bash
# Start all backend services (databases, MCP servers, A2A agents)
docker-compose -f docker-compose.dev.yml up -d

# Check service health
docker-compose -f docker-compose.dev.yml ps

# Initialize the database and create super admin user
cd services/backend
python init_admin.py

# Start the backend server
python main.py

# Verify all services are healthy
curl http://localhost:8000/health  # FastAPI Backend
curl http://localhost:9001/health  # User Assistant Agent (A2A)
curl http://localhost:9002/health  # Portfolio Manager Agent (A2A)
curl http://localhost:8003/health  # PostgreSQL MCP Server
```

````

### Production Deployment

```bash
# Production deployment
docker-compose -f docker-compose.yml up -d

# Staging environment
docker-compose -f docker-compose.yml -f docker-compose.staging.yml up -d
````

### 🌐 Start Frontend (Local Development)

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# ✅ Frontend: http://localhost:3000 or http://localhost:5173
```

### 🤖 Test AI Agent Integration

```bash
# Test A2A Portfolio Manager
curl -X POST http://localhost:9002/jsonrpc \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tasks/send",
    "params": {
      "skill_id": "portfolio_analysis",
      "input": {"data": {"user_id": "demo", "timeframe": "1M"}}
    },
    "id": "1"
  }'

# Test MCP Integration (A2A skills as MCP tools)
curl http://localhost:9002/mcp/capabilities
```

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
