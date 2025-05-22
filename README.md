# StockPulse: AI-Powered Stock Analysis Platform

StockPulse is an advanced stock analysis platform leveraging specialized AI agents to provide comprehensive insights for traders and investors. It offers 360-degree analysis, including technical, fundamental, sentiment, and alternative data, across various trading timeframes and strategies.

## Key Features

- **Comprehensive Analysis**: Integrates technical, fundamental, sentiment, and alternative data.
- **AI Agent Ecosystem**: Specialized agents for diverse analytical tasks (e.g., TechnicalAnalysisAgent, FundamentalAnalysisAgent, NewsAnalysisAgent).
- **Multi-Timeframe Trading Modules**: Dedicated modules for Day Trading, Positional Trading, Short-Term Investments, and Long-Term Investments.
- **Advanced Options Strategies**: Sophisticated options trading intelligence and analysis.
- **Real-Time Processing**: Low-latency signal generation and market monitoring.
- **LightRAG Integration**: Enhances LLM responses with relevant financial data for accuracy and reduced hallucination.
- **Stock Screener**: Powerful filtering with both technical parameters and natural language queries.
- **Trading Platform Integration**: Connects with various broker APIs for direct execution.
- **Customizable UI**: Responsive and adaptable interface with feature toggles for personalization.

## Technical Details

### Offline-First Architecture
- **Local Asset Management**: All assets (fonts, icons, styles) are bundled with the application
- **No External CDN Dependencies**: Self-hosted libraries and frameworks
- **Service Worker Implementation**: Caches application shell and critical assets
- **Offline Data Access**: Client-side storage with synchronization capabilities

### Theme System
- **Dynamic Theming**: Supports multiple color themes with consistent design language
- **Custom Theme Components**: Reusable themed components (ThemeCard, ThemeSwatch)
- **CSS Variables**: Theme colors defined via CSS custom properties
- **Brand Colors**: Dedicated StockPulse brand color palette

### Icon System
- **SVG-Based Icons**: Inline SVG icons for optimal performance
- **Local Icon Utils**: Custom icon component system with TypeScript support
- **Consistent Styling**: Standardized visual style across all icons
- **No External Dependencies**: All icons packaged within the application


## Team

### Core Development Team

- **Veera Babu Manyam** - Lead Developer & Project Architect
  - Architecture design and implementation
  - Core AI agent development
  - Technical leadership

### SAWAS Organization

SAWAS (Software Applications With Advanced Systems) is a technology organization focused on building intelligent financial systems. The organization brings together expertise in:

- Artificial Intelligence & Machine Learning
- Financial Markets Analysis
- High-Performance Computing
- Enterprise Software Architecture

### Contributing

We welcome contributions from the community! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### Contact

For questions or support:
- Email: support@sawas.org
- GitHub Issues: [Create an issue](https://github.com/sawas/stockpulse-ai/issues)
- Discord: [Join our community](https://discord.gg/sawas)


Author: Veera Babu Manyam
Organization: SAWAS


## Project Structure

The project follows a monorepo structure using npm workspaces, organized into three main packages:

```
stockpulse-ai/
├── packages/
│   ├── frontend/          # React application (UI components, pages, state management)
│   ├── backend/           # Node.js backend (API, services, agent implementations)
│   └── shared/            # Shared code (types, constants, utilities)
├── tools/                # Development tools and scripts
├── docs/                 # Project documentation
└── config/               # Root configuration (ESLint, Jest, TypeScript)
```

## Technologies Used

This project is built with a comprehensive, modern technology stack:

### Frontend
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Context API, React Query
- **Charts**: Recharts
- **Build Tools**: Vite

### Backend
- **Runtime**: Node.js with TypeScript
- **API**: Express/NestJS
- **Data Models**: Zod for validation

### DevOps & Tools
- **Monorepo Management**: npm workspaces
- **Build Orchestration**: Turborepo
- **Development Standards**: ESLint, TypeScript, Prettier

## Getting Started

The primary requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository
git clone https://github.com/your-username/stockpulse-ai.git

# Step 2: Navigate to the project directory
cd stockpulse-ai

# Step 3: Install the necessary dependencies
npm install

# Step 4: Start the development servers
# Run everything:
npm run dev
# Or run specific packages:
npm run dev:frontend  # Frontend only
npm run dev:backend   # Backend only
```

The servers will start at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

## Brand Assets and Logo

StockPulse includes a complete set of logo assets in various dimensions for different use cases:

### Logo Assets

All logo assets are stored in the `packages/frontend/public/assets/logo/` directory and include:

- **Favicon Assets**: Various sizes for browser tabs and bookmarks
- **Apple Touch Icons**: For iOS devices
- **Android Icons**: For Android devices and PWA
- **Microsoft Tile Icons**: For Windows devices
- **General Purpose Icons**: For various other use cases
- **Logo Variations**: Horizontal and square formats in standard and retina resolutions

### Using the Logo Component

The application includes a `<Logo />` React component for consistent branding:

```tsx
import Logo from '@/components/Logo';

// Default usage
<Logo />

// With specific size
<Logo size="small" />
<Logo size="medium" />
<Logo size="large" />

// With specific variant
<Logo variant="square" />
<Logo variant="horizontal" />

// With custom dimensions
<Logo width={120} height={40} />
```

### Regenerating Logo Assets

If you need to regenerate all logo assets from the source file:

```sh
# Run the logo generation script
npm run generate:logo
```

This will create all necessary sizes and formats from the source logo file, saving them to the appropriate directory.

## Package Configuration Notes

### Frontend Package
- Uses Vite for fast development experience
- Styled with Tailwind CSS and shadcn/ui component library
- Features a responsive design with neumorphic UI elements

### Backend Package
- Built with Node.js and TypeScript
- Includes mock data for development purposes
- Provides API endpoints for stock data and AI insights

### Shared Package
- Contains common types, utilities, and constants
- Used by both frontend and backend packages

## Troubleshooting

If you encounter styling issues:
1. Ensure postcss.config.js exists in the frontend package
2. Verify tailwind.config.ts includes all necessary paths in the content section
3. Check that all dependencies are installed: `cd packages/frontend && npm install -D tailwindcss-animate postcss autoprefixer`

For path alias issues:
- Check the tsconfig.json files for proper path mappings
- Verify import statements use the correct alias format (e.g., @/components/...)

## Deployment

The project can be built for production using:

```sh
npm run build
```

This will compile all packages in the correct order using Turborepo's pipeline.

## How can I deploy this project?

Deployment instructions will be updated based on the chosen infrastructure (e.g., Kubernetes, cloud provider specifics). The project is designed for self-hosted infrastructure.

## Can I connect a custom domain to my Lovable project?

This section may not be relevant if the project is self-hosted. For custom domain configurations on self-hosted deployments, standard DNS and web server configurations will apply.
