# StockPulse Shared

Common utilities, types, and constants shared between the frontend and backend packages of the StockPulse platform.

## Overview

This package serves as a central repository for code that needs to be used across both the frontend and backend services. This ensures type consistency, reduces code duplication, and improves maintainability.

## Contents

- **Type Definitions**: Common TypeScript interfaces and types
- **Constants**: Shared configuration values and enumerations
- **Utilities**: Helper functions used by multiple packages
- **API Schemas**: Shared API request/response definitions
- **Validation**: Schema validation using Zod

## Directory Structure

```
shared/
├── dist/              # Compiled JavaScript output
├── src/
│   ├── types/         # TypeScript interfaces and types
│   ├── constants/     # Shared constant values
│   ├── utils/         # Common utility functions
│   └── index.ts       # Package entry point
└── tsconfig.json      # TypeScript configuration
```

## Usage

This package is imported by both the frontend and backend packages. To use it in either package:

```typescript
// For using types
import { Stock, MarketIndex } from '@stockpulse/shared';

// For using utilities
import { formatCurrency, calculateChange } from '@stockpulse/shared';

// For using constants
import { TIME_FRAMES, SECTORS } from '@stockpulse/shared';
```

## Building

The shared package should be built before the other packages when making changes:

```bash
# From the project root
npm run build --filter=@stockpulse/shared

# Or from this directory
npm run build
```

## Development

When making changes to this package, you'll need to rebuild it for the changes to be reflected in the dependent packages. During development, you can use the watch mode:

```bash
# From this directory
npm run dev
```

This will continuously build the package as changes are made.

## Notes

- This package should not depend on either the frontend or backend packages
- Keep this package lightweight and focused on shared functionality
- Avoid adding dependencies unless absolutely necessary
- Maintain backward compatibility when making changes 