/**
 * StockPulse Utilities - Enterprise-Grade
 * Centralized utility exports with organized structure
 * Maintains backward compatibility while providing better organization
 */

// ===============================================
// Organized Exports by Domain
// ===============================================

// Theme utilities
export * from './theme';

// Portfolio utilities  
export * from './portfolio';

// Dashboard utilities
export * from './dashboard';

// Common utilities
export * from './common';

// ===============================================
// Backward Compatibility Exports
// ===============================================

// Direct exports for existing imports (maintains compatibility)
export { cn } from './theme/cn';
export { debounce } from './common/debounce';
export { getEnvVar, isProduction, isDevelopment } from './common/env';

// ===============================================
// Convenience Re-exports
// ===============================================

// Most commonly used utilities for easy access
// Note: Only re-export functions that actually exist
// Portfolio functions would come from './portfolio' not './theme'
// Screenshot function would come from './common' not './theme'

// Re-export from appropriate modules when they exist
// export { calculatePortfolioValue, calculateDayChange, calculateTotalReturn } from './portfolio';
// export { takeScreenshot } from './common';

// Note: Specific function exports depend on actual implementations
// This structure provides both organization and backward compatibility 