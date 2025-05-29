# 🚀 StockPulse - AGI-Powered Trading Platform

<strong>Version 0.1.0</strong>

StockPulse is a next-generation financial platform that combines artificial general intelligence (AGI) with sophisticated trading tools to provide retail and institutional investors with professional-grade market analysis and trading capabilities.

## ✨ Features

### 🔐 Authentication & User Management

- **Secure User Registration** - Multi-step registration with email validation and strong password requirements
- **HttpOnly Cookie Authentication** - Enterprise-grade security with JWT tokens
- **Rate Limiting & Account Protection** - Advanced security measures against brute force attacks
- **Automatic Session Management** - Seamless login/logout with proper session handling

### 📊 Trading & Analytics

- **Real-time Market Data** - Live price feeds with millisecond precision
- **AGI Trading Signals** - Advanced machine learning algorithms for pattern recognition
- **Portfolio Analytics** - Comprehensive tracking with performance metrics and risk analysis
- **Smart Stock Screeners** - Customizable filters with technical and fundamental data

### 🛡️ Security & Compliance

- **Enterprise Security** - Bank-grade encryption and multi-factor authentication
- **Audit Logging** - Comprehensive security event tracking
- **Regulatory Compliance** - Built for financial industry standards
- **Risk Management** - Advanced position sizing and drawdown protection

### 🎨 User Experience

- **Modern Landing Page** - Professional marketing site with pricing and features
- **Responsive Design** - Works seamlessly across all devices
- **Intuitive Navigation** - Easy-to-use interface with consistent routing
- **Motion Graphics** - Smooth animations powered by Framer Motion

### 🤖 AI & Automation

- **MCP Integration** - Model Context Protocol for AI agent communication
- **A2A Protocol** - Agent-to-Agent communication for automated workflows
- **Real-time Processing** - Sub-second execution with optimized algorithms

## 🚀 Features

### 📊 Advanced Trading Interfaces

- **Intraday Trading**

  - Real-time scalping charts with tick-by-tick data
  - Level II order book visualization
  - Time and sales analysis with volume profiling
  - Momentum indicators and real-time alerts

- **Options Trading**

  - Complete options chain visualization
  - Greeks display (Delta, Gamma, Theta, Vega, Rho)
  - Payoff diagrams for complex strategies
  - Volatility surface analysis

- **Positional Trading**

  - Trend indicators with multi-timeframe analysis
  - Sector rotation visualization
  - Support/resistance identification
  - Pattern recognition with AI assistance

- **Long-term Investing**
  - Discounted Cash Flow (DCF) calculator
  - Dividend analysis and projection charts
  - Fundamental ratio comparison
  - Long-term trend visualization

### 🤖 AI-Powered Automation

- **Agent Trading Configuration**

  - Customizable trading strategies
  - Performance backtesting
  - Risk parameter configuration
  - Market condition adaptation

- **Risk Management Framework**

  - Position sizing recommendations
  - Stop-loss automation
  - Portfolio exposure analysis
  - Drawdown protection mechanisms

- **Automation Controls**
  - Scheduled trading operations
  - Conditional execution based on market events
  - Manual override capabilities
  - Performance monitoring dashboards

### 🎨 Customizable Themes

- **Five Premium Color Themes**

  - Tropical Jungle (Vibrant Greens)
  - Ocean Sunset (Blues + Corals)
  - Desert Storm (Warm Neutrals)
  - Berry Fields (Purples + Pinks)
  - Arctic Moss (Cool Grays + Greens)

- **Responsive Design**
  - Optimized for desktop, tablet, and mobile
  - Dark and light mode support
  - Accessibility-focused UI elements
  - Customizable layouts

### 📱 User Experience

- **Multi-step Onboarding**

  - Personalized setup process
  - Trading experience assessment
  - Risk tolerance evaluation
  - Theme and preference configuration

- **Portfolio Management**

  - Real-time portfolio valuation
  - Performance analytics
  - Asset allocation visualization
  - Tax-lot tracking

- **Stock Screening**
  - Multi-factor screening engine
  - Technical and fundamental filters
  - Saved screen templates
  - Results comparison

## 🛠️ Tech Stack

- **Frontend**

  - React 18+ with TypeScript
  - Tailwind CSS for styling
  - React Query for state management
  - React Router DOM for routing
  - Recharts for financial data visualization
  - Framer Motion for animations

- **Backend**

  - FastAPI with Python 3.9+
  - PostgreSQL database
  - Redis for caching
  - JWT authentication with HttpOnly cookies
  - SQLAlchemy ORM with async support

- **Data Integration**
  - Financial Modeling Prep API for market data
  - TAAPI.IO for technical indicators
  - Yahoo Finance for supplementary data

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+ (for backend services)
- PostgreSQL database
- Redis server

### Installation

1. Clone the repository

```bash
git clone https://github.com/veerababumanyam/StockPulse.git
cd StockPulse
```

2. Install frontend dependencies

```bash
npm install
```

3. Install backend dependencies

```bash
cd services/backend
pip install -r requirements.txt
```

4. Create a `.env` file in the root directory with your API keys:

```
VITE_FMP_API_KEY=your_financial_modeling_prep_api_key
VITE_TAAPI_API_KEY=your_taapi_io_api_key
```

5. Initialize the database and create super admin user

```bash
cd services/backend
python init_admin.py
```

6. Start the backend server

```bash
python main.py
```

7. Start the frontend development server

```bash
npm run dev
```

8. Build for production

```bash
npm run build
```

### 🔐 Default Admin Credentials

After running the initialization script, you can login with the following default super admin credentials:

**Email:** `admin@sp.com`
**Password:** `admin@123`

⚠️ **IMPORTANT SECURITY NOTICE:** Change the default password immediately after first login!

### 🌐 Application Access

- **Frontend:** http://localhost:5173 (development) or http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs (when DEBUG=True)
- **Health Check:** http://localhost:8000/health

### 🔑 Authentication Endpoints

- **Login:** `POST /api/v1/auth/login`
- **Logout:** `POST /api/v1/auth/logout`
- **User Info:** `GET /api/v1/auth/me`
- **Token Refresh:** `POST /api/v1/auth/refresh`

## 📁 Project Structure

```
StockPulse/
├── public/             # Static assets
├── src/
│   ├── api/            # API services and utilities
│   ├── assets/         # Images, fonts, etc.
│   ├── components/     # Reusable UI components
│   │   ├── automation/ # Agent automation components
│   │   ├── layout/     # Layout components
│   │   ├── trading/    # Trading-specific components
│   │   │   ├── intraday/   # Intraday trading components
│   │   │   ├── options/    # Options trading components
│   │   │   ├── positional/ # Positional trading components
│   │   │   └── longterm/   # Long-term investing components
│   │   ├── ui/         # Generic UI components
│   │   └── performance/ # Performance-optimized components
│   ├── contexts/       # React context providers
│   ├── hooks/          # Custom React hooks
│   ├── layouts/        # Page layout components
│   ├── pages/          # Page components
│   │   ├── agents/     # Agent management pages
│   │   ├── analysis/   # Stock analysis pages
│   │   ├── auth/       # Authentication pages
│   │   ├── onboarding/ # User onboarding flow
│   │   └── trading/    # Trading interface pages
│   ├── utils/          # Utility functions
│   ├── config/         # Configuration files
│   ├── App.tsx         # Main application component
│   ├── index.css       # Global styles
│   └── main.tsx        # Application entry point
├── index.html          # HTML template
├── package.json        # Project dependencies
├── tailwind.config.js  # Tailwind CSS configuration
├── tsconfig.json       # TypeScript configuration
└── vite.config.ts      # Vite configuration
```

## 🔌 API Integration

The application integrates with:

- **Financial Modeling Prep API** for market data, financial statements, and company profiles
- **TAAPI.IO** for technical indicators and chart pattern recognition
- **Yahoo Finance API** for supplementary data including insider trading and stock insights

## 📱 Screenshots

<div align="center">
  <img src="public/screenshots/dashboard.webp" alt="Dashboard" width="45%" />
  <img src="public/screenshots/trading.webp" alt="Trading Interface" width="45%" />
</div>

## 📄 License

This project is licensed under the Apache License 2.0.

---

<div align="center">
  <p>Built with ❤️ by the StockPulse team</p>
</div>
