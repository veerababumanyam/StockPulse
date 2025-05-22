# StockPulse Code Quality Guide

This document outlines the code quality tools and standards used in the StockPulse project.

## Tools and Configuration

### 1. ESLint

ESLint is configured to enforce code quality rules, naming conventions, and best practices:

- **Configuration File**: `.eslintrc.js` at the root of the project
- **Key Features**:
  - TypeScript integration with strict type checking
  - React-specific rules for components and hooks
  - Import ordering and organization
  - Naming conventions for variables, functions, classes, and files
  - Folder structure validation

### 2. Prettier

Prettier handles code formatting to maintain consistent style:

- **Configuration File**: `.prettierrc` at the root of the project
- **Key Settings**:
  - 2 space indentation
  - 100 character line length
  - Single quotes
  - Semicolons required
  - Trailing commas for ES5 compatibility

### 3. EditorConfig

EditorConfig ensures consistent editor behavior across IDEs:

- **Configuration File**: `.editorconfig`
- **Key Settings**:
  - 2 space indentation
  - UTF-8 encoding
  - LF line endings
  - Trimming trailing whitespace

### 4. Git Hooks with Husky

Automated checks run before commits and when creating commit messages:

- **Pre-commit Hook**: Runs linting and formatting on staged files
- **Commit-msg Hook**: Enforces conventional commit message format

### 5. Lint-Staged

Only checks files that are staged for commit:

- **Configuration File**: `.lintstagedrc`
- **Key Features**:
  - ESLint and Prettier for JS/TS files
  - Prettier for JSON, MD, HTML, and CSS files
  - Image optimization for image files

## Naming Conventions

### Files and Folders

- **Component Files**: PascalCase (e.g., `Button.tsx`, `UserProfile.tsx`)
- **Component Folders**: kebab-case (e.g., `user-profile/`, `form-controls/`)
- **Utility Files**: kebab-case (e.g., `date-utils.ts`, `string-helpers.ts`)
- **Hook Files**: camelCase, prefixed with "use" (e.g., `useAuth.ts`, `useWindowSize.ts`)
- **Context Files**: PascalCase, suffixed with "Context" (e.g., `ThemeContext.tsx`)
- **Test Files**: Same name as the file being tested, with `.test.ts` or `.spec.ts` suffix

### Code Elements

- **Variables**: camelCase (e.g., `userName`, `isLoading`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_URL`, `MAX_RETRIES`)
- **Functions**: camelCase, verb-prefixed (e.g., `getUserData()`, `calculateTotal()`)
- **React Components**: PascalCase (e.g., `Button`, `UserProfile`)
- **Interfaces/Types**: PascalCase (e.g., `UserData`, `ButtonProps`)
- **Enums**: PascalCase (e.g., `Role`, `Status`)

## Folder Structure

The StockPulse project follows a monorepo structure with standardized folder organization:

```
stockpulse-ai/
├── packages/
│   ├── frontend/          # React application
│   │   ├── src/
│   │   │   ├── assets/    # Static assets
│   │   │   ├── components/# UI components
│   │   │   ├── contexts/  # React contexts
│   │   │   ├── hooks/     # Custom hooks
│   │   │   ├── lib/       # Libraries and utilities
│   │   │   ├── pages/     # Page components
│   │   │   └── utils/     # Utility functions
│   ├── backend/           # Node.js backend
│   └── shared/            # Shared code
├── tools/                 # Development tools
├── docs/                  # Documentation
└── config/                # Root configuration
```

## Code Quality Scripts

The following npm scripts are available to check and fix code quality issues:

- `npm run lint` - Run ESLint on all packages
- `npm run lint:fix` - Run ESLint and automatically fix issues
- `npm run format` - Run Prettier to format all files
- `npm run format:check` - Check formatting without changing files

## Recommended IDE Extensions

For the best development experience, install these extensions:

- **ESLint**: Real-time linting in your editor
- **Prettier**: Code formatting on save
- **EditorConfig**: Apply editor settings from .editorconfig

## Continuous Integration

All code quality checks run automatically in CI pipelines:

1. Code linting with ESLint
2. Code formatting with Prettier
3. Type checking with TypeScript

## Adding New Rules

To extend or modify code quality rules:

1. Update the appropriate configuration file (`.eslintrc.js`, `.prettierrc`, etc.)
2. Document the change in a pull request
3. Ensure all team members are aware of the change 