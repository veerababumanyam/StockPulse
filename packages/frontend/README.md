# StockPulse Frontend

The frontend package for the StockPulse AI-powered stock analysis platform. Built with React, TypeScript, and Tailwind CSS.

## Overview

This package contains the user interface components for the StockPulse platform, including:

- Modern, responsive UI with neumorphic design elements
- Real-time stock charts and visualization components
- User authentication interface
- Dashboard and analytics views
- Stock watchlist and search functionality
- AI insights display

## Technology Stack

- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **Component Library**: Custom components with shadcn/ui primitives
- **State Management**: React Context API
- **Data Fetching**: Custom hooks and API clients
- **Charts**: Recharts
- **Authentication**: JWT-based auth (mocked for development)

## Directory Structure

```
frontend/
├── public/            # Static assets
├── src/
│   ├── components/    # Reusable UI components
│   │   ├── ui/        # shadcn/ui components
│   │   └── ...        # Application-specific components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utilities and helpers
│   ├── pages/         # Page components
│   ├── store/         # State management
│   ├── utils/         # Utility functions
│   ├── App.tsx        # Main application component
│   └── main.tsx       # Application entry point
├── tailwind.config.ts # Tailwind CSS configuration
├── postcss.config.js  # PostCSS configuration
└── vite.config.ts     # Vite configuration
```

## Getting Started

To run this package independently:

```bash
# From the project root
npm run dev:frontend

# Or from this directory
npm run dev
```

The development server will start at http://localhost:3000.

## Build

To build the frontend for production:

```bash
# From the project root
npm run build:frontend

# Or from this directory
npm run build
```

## Styling 

The application uses a custom Tailwind CSS configuration with:

- Custom color palette for StockPulse branding
- Extended animation and transition utilities
- Neumorphic shadow effects
- Custom components via shadcn/ui

## Available Components

Key components include:

- `Navbar`: Main navigation component
- `StockCard`: Displays stock information in card format
- `StockChart`: Interactive stock price chart
- `MarketOverview`: Summary of market indices
- `StockSearch`: Search interface for finding stocks
- `AIInsights`: Displays AI-generated insights for stocks

## Notes

- The application uses mock data for development purposes
- Authentication is simulated for the development environment 