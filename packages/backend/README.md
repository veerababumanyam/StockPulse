# StockPulse Backend

The backend service for the StockPulse AI-powered stock analysis platform. Built with Node.js and TypeScript.

## Overview

This package provides the server-side functionality for the StockPulse platform, including:

- RESTful API endpoints for stock data and analytics
- Mock data services for development
- AI insights generation (simulated for development)
- Authentication services

## Technology Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Development Tools**: Nodemon for hot-reloading
- **Type Validation**: Zod
- **API Documentation**: JSDoc comments
- **Dependencies**: Uses shared package for common types and utilities

## Directory Structure

```
backend/
├── dist/              # Compiled JavaScript output
├── src/
│   ├── controllers/   # Request handlers
│   ├── models/        # Data models
│   ├── routes/        # API route definitions
│   ├── services/      # Business logic
│   ├── utils/         # Helper utilities
│   └── index.ts       # Application entry point
├── config/            # Configuration files
└── tsconfig.json      # TypeScript configuration
```

## Getting Started

To run this package independently:

```bash
# From the project root
npm run dev:backend

# Or from this directory
npm run dev
```

The server will start at http://localhost:4000.

## API Endpoints

The backend exposes the following API endpoints:

- `GET /api/stocks` - Get a list of stocks
- `GET /api/stocks/:symbol` - Get details for a specific stock
- `GET /api/market` - Get market overview data
- `GET /api/insights` - Get AI insights for stocks
- `GET /api/insights/:symbol` - Get AI insights for a specific stock

## Build

To build the backend for production:

```bash
# From the project root
npm run build:backend

# Or from this directory
npm run build
```

## Development Notes

- The backend currently uses mock data instead of real market data
- AI insights are generated based on predefined patterns
- Authentication is simulated for the development environment

## Configuration

The backend can be configured using environment variables:

- `PORT`: Server port (default: 4000)
- `NODE_ENV`: Environment (development, production, test)

## Dependencies

This package depends on the `@stockpulse/shared` package for common types and utilities. 