// API configuration for Financial Modeling Prep
// Use environment variables in production
export const FMP_API_KEY = process.env.FMP_API_KEY || "YOUR_FMP_API_KEY";
export const FMP_BASE_URL = "https://financialmodelingprep.com/api/v3";

// API configuration for TAAPI.IO
// Use environment variables in production
export const TAAPI_API_KEY = process.env.TAAPI_API_KEY || "YOUR_TAAPI_API_KEY";
export const TAAPI_BASE_URL = "https://api.taapi.io";

// GitHub configuration
// These should be configured in your CI/CD pipeline, not in source code
export const GITHUB_REPO = "https://github.com/veerababumanyam/StockPulse.git";
export const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ""; // Never hardcode tokens
