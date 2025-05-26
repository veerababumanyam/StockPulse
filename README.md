# StockPulse

A comprehensive AI-powered stock analysis platform with real-time data, advanced trading tools, and automated agents.

## Features

- Modern, responsive React TypeScript frontend
- Real-time stock data visualization
- AI-powered trading agents
- Specialized trading interfaces (intraday, options, positional, long-term)
- Portfolio management and analysis
- Stock screening and research tools

## Tech Stack

- React 18+ with TypeScript
- Tailwind CSS for styling
- React Query for state management
- React Router DOM for routing
- Recharts for financial data visualization
- Framer Motion for animations
- Financial Modeling Prep API for market data
- TAAPI.IO for technical indicators

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
```bash
git clone https://github.com/veerababumanyam/StockPulse.git
cd StockPulse
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Build for production
```bash
npm run build
```

## Project Structure

```
StockPulse/
├── public/             # Static assets
├── src/
│   ├── api/            # API services and utilities
│   ├── assets/         # Images, fonts, etc.
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React context providers
│   ├── hooks/          # Custom React hooks
│   ├── layouts/        # Page layout components
│   ├── pages/          # Page components
│   ├── utils/          # Utility functions
│   ├── App.tsx         # Main application component
│   ├── index.css       # Global styles
│   └── main.tsx        # Application entry point
├── index.html          # HTML template
├── package.json        # Project dependencies
├── tailwind.config.js  # Tailwind CSS configuration
├── tsconfig.json       # TypeScript configuration
└── vite.config.ts      # Vite configuration
```

## API Integration

The application integrates with:
- Financial Modeling Prep API for market data
- TAAPI.IO for technical indicators

## License

This project is licensed under the Apache License 2.0.
