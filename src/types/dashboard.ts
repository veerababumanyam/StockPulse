/**
 * StockPulse Dashboard Type System - Enterprise-Grade
 * Complete TypeScript definitions for customizable widget dashboard
 * Follows Story 2.2 requirements and central theme integration
 */

// ===============================================
// Core Widget System Types
// ===============================================

/**
 * Generic widget data structure
 */
export interface WidgetData {
  id: string;
  widgetId: string;
  type: WidgetType;
  data?: any;
  lastUpdated: string;
  error?: string;
}

/**
 * Widget library item for widget picker
 */
export interface WidgetLibraryItem {
  id: string;
  type: WidgetType;
  name: string;
  description: string;
  category: WidgetCategory;
  icon: string;
  tags: string[];
  isPremium?: boolean;
  isAvailable?: boolean;
  requiredPermissions?: string[];
  previewUrl?: string;
}

/**
 * Available widget types in the StockPulse dashboard
 * Each widget provides specific financial/trading functionality
 */
export type WidgetType =
  | "portfolio-overview" // Portfolio summary and metrics
  | "portfolio-chart" // Portfolio performance chart
  | "watchlist" // Stock watchlist and monitoring
  | "market-summary" // Market overview and indices
  | "ai-insights" // AI-powered trading insights
  | "recent-transactions" // Recent trading activity
  | "performance-metrics" // Performance analytics
  | "alerts" // Trading alerts and notifications
  | "news-feed" // Financial news feed
  | "sector-performance" // Sector analysis
  | "top-movers" // Top gaining/losing stocks
  | "economic-calendar"; // Economic events calendar

/**
 * Widget categories for organization and filtering
 */
export type WidgetCategory =
  | "portfolio" // Portfolio-related widgets
  | "market" // Market data and analysis
  | "trading" // Trading tools and activity
  | "analytics" // Performance and insights
  | "news"; // News and information

/**
 * Widget size configurations for responsive grid layout
 */
export interface WidgetSize {
  w: number; // Width in grid units
  h: number; // Height in grid units
  minW?: number; // Minimum width
  minH?: number; // Minimum height
  maxW?: number; // Maximum width
  maxH?: number; // Maximum height
}

/**
 * Widget position in grid layout
 */
export interface WidgetPosition {
  x: number; // X coordinate in grid
  y: number; // Y coordinate in grid
  w: number; // Width in grid units
  h: number; // Height in grid units
}

/**
 * Widget configuration and customization options
 */
export interface WidgetConfig {
  id: string; // Unique widget instance ID
  type: WidgetType; // Widget type identifier
  title?: string; // Custom widget title
  description?: string; // Widget description
  position: WidgetPosition; // Grid position and size
  config?: Record<string, any>; // Widget-specific configuration
  isVisible?: boolean; // Visibility toggle
  isLocked?: boolean; // Prevent repositioning
  refreshInterval?: number; // Auto-refresh interval (ms)
  customStyles?: Record<string, string>; // Custom CSS properties
  permissions?: string[]; // Required permissions
  lastUpdated?: string; // Last update timestamp
}

/**
 * Widget metadata and display information
 */
export interface WidgetMetadata {
  type: WidgetType;
  name: string; // Display name
  description: string; // Widget description
  category: WidgetCategory; // Category classification
  icon: string; // Icon identifier
  isResizable: boolean; // Can be resized
  isDraggable: boolean; // Can be repositioned
  defaultSize: WidgetSize; // Default dimensions
  supportedSizes: WidgetSize[]; // Available size options
  requiredPermissions?: string[]; // Access requirements
  isPremium?: boolean; // Premium feature flag
  tags?: string[]; // Search tags
}

// ===============================================
// Dashboard Layout System
// ===============================================

/**
 * Responsive breakpoint definitions
 */
export interface DashboardBreakpoints {
  xxs: number; // Extra extra small screens
  xs: number; // Extra small screens
  sm: number; // Small screens
  md: number; // Medium screens
  lg: number; // Large screens
  xl: number; // Extra large screens
}

/**
 * Grid layout configuration for each breakpoint
 */
export interface DashboardLayout {
  breakpoint: keyof DashboardBreakpoints;
  cols: number; // Number of columns
  rowHeight: number; // Height of each row
  margin: [number, number]; // Horizontal, vertical margins
  containerPadding: [number, number]; // Container padding
  widgets: WidgetConfig[]; // Widget configurations
}

/**
 * Complete dashboard configuration
 */
export interface DashboardConfig {
  id: string; // Dashboard instance ID
  name: string; // Dashboard name
  description?: string; // Dashboard description
  layouts: Record<keyof DashboardBreakpoints, DashboardLayout>; // Responsive layouts
  version: string; // Configuration version
  isDefault?: boolean; // Default dashboard flag
  isPublic?: boolean; // Public sharing flag
  permissions?: string[]; // Access permissions
  metadata?: {
    createdAt: string; // Creation timestamp
    updatedAt: string; // Last update timestamp
    createdBy: string; // Creator user ID
    lastAccessedAt?: string; // Last access timestamp
    accessCount?: number; // Usage statistics
    tags?: string[]; // Organization tags
  };
}

// ===============================================
// Dashboard State Management
// ===============================================

/**
 * Dashboard edit mode state
 */
export interface DashboardEditState {
  isEditMode: boolean; // Edit mode toggle
  selectedWidgetId?: string; // Currently selected widget
  isDragging: boolean; // Drag operation active
  isResizing: boolean; // Resize operation active
  clipboardWidget?: WidgetConfig; // Copied widget
  hasUnsavedChanges: boolean; // Unsaved changes flag
  lastSavedAt?: string; // Last save timestamp
}

/**
 * Dashboard loading and error states
 */
export interface DashboardStatus {
  isLoading: boolean; // Loading state
  isSaving: boolean; // Save operation active
  error?: string; // Error message
  lastRefresh?: string; // Last data refresh
  syncStatus: "synced" | "syncing" | "error" | "offline"; // Sync status
}

/**
 * Dashboard context state
 */
export interface DashboardState {
  config: DashboardConfig; // Dashboard configuration
  editState: DashboardEditState; // Edit mode state
  status: DashboardStatus; // Loading/error states
  availableWidgets: WidgetMetadata[]; // Available widget types
  userPreferences: DashboardPreferences; // User preferences
}

/**
 * User dashboard preferences
 */
export interface DashboardPreferences {
  autoSave: boolean; // Auto-save changes
  autoRefresh: boolean; // Auto-refresh data
  refreshInterval: number; // Global refresh interval
  gridSnap: boolean; // Snap to grid
  showGrid: boolean; // Show grid lines
  compactMode: boolean; // Compact widget spacing
  animations: boolean; // Enable animations
  notifications: boolean; // Show notifications
  theme?: string; // Theme preference
  defaultView: "desktop" | "tablet" | "mobile"; // Default view mode
}

// ===============================================
// Widget Library System
// ===============================================

/**
 * Widget library category with widgets
 */
export interface WidgetLibraryCategory {
  category: WidgetCategory;
  name: string; // Display name
  description: string; // Category description
  icon: string; // Category icon
  widgets: WidgetMetadata[]; // Widgets in category
  isExpanded?: boolean; // Expansion state
}

/**
 * Widget search and filter options
 */
export interface WidgetLibraryFilters {
  searchQuery: string; // Search text
  categories: WidgetCategory[]; // Selected categories
  showPremiumOnly: boolean; // Premium widgets only
  showAvailableOnly: boolean; // Available widgets only
  sortBy: "name" | "category" | "popularity" | "recent"; // Sort option
  sortOrder: "asc" | "desc"; // Sort direction
}

// ===============================================
// Default Configurations
// ===============================================

/**
 * Standard responsive breakpoints
 */
export const DASHBOARD_BREAKPOINTS: DashboardBreakpoints = {
  xxs: 0, // 0px and up
  xs: 480, // 480px and up
  sm: 768, // 768px and up
  md: 996, // 996px and up
  lg: 1200, // 1200px and up
  xl: 1600, // 1600px and up
};

/**
 * Default widget sizes for different widget types
 */
export const WIDGET_SIZES: Record<WidgetType, WidgetSize> = {
  "portfolio-overview": { w: 6, h: 4, minW: 4, minH: 3, maxW: 12, maxH: 6 },
  "portfolio-chart": { w: 8, h: 6, minW: 6, minH: 4, maxW: 12, maxH: 8 },
  watchlist: { w: 4, h: 6, minW: 3, minH: 4, maxW: 6, maxH: 8 },
  "market-summary": { w: 6, h: 4, minW: 4, minH: 3, maxW: 8, maxH: 5 },
  "ai-insights": { w: 6, h: 5, minW: 4, minH: 4, maxW: 8, maxH: 7 },
  "recent-transactions": { w: 5, h: 5, minW: 4, minH: 4, maxW: 7, maxH: 6 },
  "performance-metrics": { w: 4, h: 4, minW: 3, minH: 3, maxW: 6, maxH: 5 },
  alerts: { w: 3, h: 4, minW: 3, minH: 3, maxW: 5, maxH: 6 },
  "news-feed": { w: 4, h: 6, minW: 3, minH: 5, maxW: 6, maxH: 8 },
  "sector-performance": { w: 5, h: 4, minW: 4, minH: 3, maxW: 7, maxH: 5 },
  "top-movers": { w: 4, h: 5, minW: 3, minH: 4, maxW: 6, maxH: 6 },
  "economic-calendar": { w: 5, h: 5, minW: 4, minH: 4, maxW: 7, maxH: 7 },
};

/**
 * Widget metadata library
 */
export const WIDGET_LIBRARY: WidgetMetadata[] = [
  {
    type: "portfolio-overview",
    name: "Portfolio Overview",
    description:
      "Comprehensive portfolio summary with key metrics and performance indicators",
    category: "portfolio",
    icon: "TrendingUp",
    isResizable: true,
    isDraggable: true,
    defaultSize: WIDGET_SIZES["portfolio-overview"],
    supportedSizes: [
      { w: 4, h: 3 },
      { w: 6, h: 4 },
      { w: 8, h: 4 },
      { w: 12, h: 5 },
    ],
    tags: ["portfolio", "metrics", "overview", "performance"],
  },
  {
    type: "portfolio-chart",
    name: "Portfolio Chart",
    description:
      "Interactive portfolio performance chart with historical data and analysis",
    category: "portfolio",
    icon: "BarChart3",
    isResizable: true,
    isDraggable: true,
    defaultSize: WIDGET_SIZES["portfolio-chart"],
    supportedSizes: [
      { w: 6, h: 4 },
      { w: 8, h: 6 },
      { w: 12, h: 6 },
      { w: 12, h: 8 },
    ],
    tags: ["portfolio", "chart", "performance", "analytics"],
  },
  {
    type: "watchlist",
    name: "Stock Watchlist",
    description:
      "Monitor your favorite stocks with real-time prices and alerts",
    category: "market",
    icon: "Eye",
    isResizable: true,
    isDraggable: true,
    defaultSize: WIDGET_SIZES["watchlist"],
    supportedSizes: [
      { w: 3, h: 4 },
      { w: 4, h: 6 },
      { w: 6, h: 6 },
      { w: 6, h: 8 },
    ],
    tags: ["watchlist", "stocks", "monitoring", "real-time"],
  },
  {
    type: "market-summary",
    name: "Market Summary",
    description: "Overview of major market indices and market sentiment",
    category: "market",
    icon: "Globe",
    isResizable: true,
    isDraggable: true,
    defaultSize: WIDGET_SIZES["market-summary"],
    supportedSizes: [
      { w: 4, h: 3 },
      { w: 6, h: 4 },
      { w: 8, h: 4 },
      { w: 8, h: 5 },
    ],
    tags: ["market", "indices", "summary", "sentiment"],
  },
  {
    type: "ai-insights",
    name: "AI Insights",
    description:
      "AI-powered trading insights and recommendations based on market analysis",
    category: "analytics",
    icon: "Brain",
    isResizable: true,
    isDraggable: true,
    defaultSize: WIDGET_SIZES["ai-insights"],
    supportedSizes: [
      { w: 4, h: 4 },
      { w: 6, h: 5 },
      { w: 8, h: 5 },
      { w: 8, h: 7 },
    ],
    isPremium: true,
    tags: ["ai", "insights", "recommendations", "analysis"],
  },
  {
    type: "recent-transactions",
    name: "Recent Transactions",
    description: "Your latest trading activity and transaction history",
    category: "trading",
    icon: "Receipt",
    isResizable: true,
    isDraggable: true,
    defaultSize: WIDGET_SIZES["recent-transactions"],
    supportedSizes: [
      { w: 4, h: 4 },
      { w: 5, h: 5 },
      { w: 6, h: 5 },
      { w: 7, h: 6 },
    ],
    tags: ["transactions", "trading", "history", "activity"],
  },
  {
    type: "performance-metrics",
    name: "Performance Metrics",
    description:
      "Detailed performance analytics and key performance indicators",
    category: "analytics",
    icon: "Target",
    isResizable: true,
    isDraggable: true,
    defaultSize: WIDGET_SIZES["performance-metrics"],
    supportedSizes: [
      { w: 3, h: 3 },
      { w: 4, h: 4 },
      { w: 6, h: 4 },
      { w: 6, h: 5 },
    ],
    tags: ["performance", "metrics", "analytics", "kpi"],
  },
  {
    type: "alerts",
    name: "Trading Alerts",
    description:
      "Important trading alerts and notifications for your portfolio",
    category: "trading",
    icon: "Bell",
    isResizable: true,
    isDraggable: true,
    defaultSize: WIDGET_SIZES["alerts"],
    supportedSizes: [
      { w: 3, h: 3 },
      { w: 3, h: 4 },
      { w: 4, h: 4 },
      { w: 5, h: 6 },
    ],
    tags: ["alerts", "notifications", "trading", "monitoring"],
  },
  {
    type: "news-feed",
    name: "Financial News",
    description:
      "Latest financial news and market updates relevant to your investments",
    category: "news",
    icon: "Newspaper",
    isResizable: true,
    isDraggable: true,
    defaultSize: WIDGET_SIZES["news-feed"],
    supportedSizes: [
      { w: 3, h: 5 },
      { w: 4, h: 6 },
      { w: 6, h: 6 },
      { w: 6, h: 8 },
    ],
    tags: ["news", "financial", "updates", "market"],
  },
  {
    type: "sector-performance",
    name: "Sector Performance",
    description: "Performance analysis across different market sectors",
    category: "market",
    icon: "PieChart",
    isResizable: true,
    isDraggable: true,
    defaultSize: WIDGET_SIZES["sector-performance"],
    supportedSizes: [
      { w: 4, h: 3 },
      { w: 5, h: 4 },
      { w: 6, h: 4 },
      { w: 7, h: 5 },
    ],
    tags: ["sectors", "performance", "analysis", "comparison"],
  },
  {
    type: "top-movers",
    name: "Top Movers",
    description: "Top gaining and losing stocks in the market today",
    category: "market",
    icon: "TrendingDown",
    isResizable: true,
    isDraggable: true,
    defaultSize: WIDGET_SIZES["top-movers"],
    supportedSizes: [
      { w: 3, h: 4 },
      { w: 4, h: 5 },
      { w: 5, h: 5 },
      { w: 6, h: 6 },
    ],
    tags: ["movers", "gainers", "losers", "trending"],
  },
  {
    type: "economic-calendar",
    name: "Economic Calendar",
    description:
      "Important economic events and announcements affecting the markets",
    category: "news",
    icon: "Calendar",
    isResizable: true,
    isDraggable: true,
    defaultSize: WIDGET_SIZES["economic-calendar"],
    supportedSizes: [
      { w: 4, h: 4 },
      { w: 5, h: 5 },
      { w: 6, h: 5 },
      { w: 7, h: 7 },
    ],
    tags: ["economic", "calendar", "events", "announcements"],
  },
];

/**
 * Default dashboard layouts for different breakpoints
 */
export const DEFAULT_LAYOUTS: Record<
  keyof DashboardBreakpoints,
  DashboardLayout
> = {
  lg: {
    breakpoint: "lg",
    cols: 12,
    rowHeight: 60,
    margin: [16, 16],
    containerPadding: [16, 16],
    widgets: [
      {
        id: "portfolio-overview-1",
        type: "portfolio-overview",
        position: { x: 0, y: 0, w: 6, h: 4 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "portfolio-chart-1",
        type: "portfolio-chart",
        position: { x: 6, y: 0, w: 6, h: 6 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "watchlist-1",
        type: "watchlist",
        position: { x: 0, y: 4, w: 4, h: 6 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "market-summary-1",
        type: "market-summary",
        position: { x: 4, y: 6, w: 4, h: 4 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "ai-insights-1",
        type: "ai-insights",
        position: { x: 8, y: 6, w: 4, h: 5 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "recent-transactions-1",
        type: "recent-transactions",
        position: { x: 0, y: 10, w: 5, h: 5 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "performance-metrics-1",
        type: "performance-metrics",
        position: { x: 5, y: 10, w: 4, h: 4 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "alerts-1",
        type: "alerts",
        position: { x: 9, y: 11, w: 3, h: 4 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "news-feed-1",
        type: "news-feed",
        position: { x: 0, y: 15, w: 4, h: 6 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "sector-performance-1",
        type: "sector-performance",
        position: { x: 4, y: 14, w: 5, h: 4 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "top-movers-1",
        type: "top-movers",
        position: { x: 9, y: 15, w: 3, h: 5 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "economic-calendar-1",
        type: "economic-calendar",
        position: { x: 4, y: 18, w: 5, h: 5 },
        isVisible: true,
        isLocked: false,
      },
    ],
  },
  md: {
    breakpoint: "md",
    cols: 8,
    rowHeight: 60,
    margin: [12, 12],
    containerPadding: [12, 12],
    widgets: [
      {
        id: "portfolio-overview-1",
        type: "portfolio-overview",
        position: { x: 0, y: 0, w: 4, h: 4 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "portfolio-chart-1",
        type: "portfolio-chart",
        position: { x: 4, y: 0, w: 4, h: 6 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "watchlist-1",
        type: "watchlist",
        position: { x: 0, y: 4, w: 4, h: 6 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "market-summary-1",
        type: "market-summary",
        position: { x: 0, y: 10, w: 4, h: 4 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "ai-insights-1",
        type: "ai-insights",
        position: { x: 4, y: 6, w: 4, h: 5 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "recent-transactions-1",
        type: "recent-transactions",
        position: { x: 4, y: 11, w: 4, h: 5 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "performance-metrics-1",
        type: "performance-metrics",
        position: { x: 0, y: 14, w: 4, h: 4 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "alerts-1",
        type: "alerts",
        position: { x: 4, y: 16, w: 4, h: 4 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "news-feed-1",
        type: "news-feed",
        position: { x: 0, y: 18, w: 4, h: 6 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "sector-performance-1",
        type: "sector-performance",
        position: { x: 4, y: 20, w: 4, h: 4 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "top-movers-1",
        type: "top-movers",
        position: { x: 0, y: 24, w: 4, h: 5 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "economic-calendar-1",
        type: "economic-calendar",
        position: { x: 4, y: 24, w: 4, h: 5 },
        isVisible: true,
        isLocked: false,
      },
    ],
  },
  sm: {
    breakpoint: "sm",
    cols: 6,
    rowHeight: 60,
    margin: [8, 8],
    containerPadding: [8, 8],
    widgets: [
      {
        id: "portfolio-overview-1",
        type: "portfolio-overview",
        position: { x: 0, y: 0, w: 6, h: 4 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "portfolio-chart-1",
        type: "portfolio-chart",
        position: { x: 0, y: 4, w: 6, h: 6 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "watchlist-1",
        type: "watchlist",
        position: { x: 0, y: 10, w: 6, h: 6 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "market-summary-1",
        type: "market-summary",
        position: { x: 0, y: 16, w: 6, h: 4 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "ai-insights-1",
        type: "ai-insights",
        position: { x: 0, y: 20, w: 6, h: 5 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "recent-transactions-1",
        type: "recent-transactions",
        position: { x: 0, y: 25, w: 6, h: 5 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "performance-metrics-1",
        type: "performance-metrics",
        position: { x: 0, y: 30, w: 6, h: 4 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "alerts-1",
        type: "alerts",
        position: { x: 0, y: 34, w: 6, h: 4 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "news-feed-1",
        type: "news-feed",
        position: { x: 0, y: 38, w: 6, h: 6 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "sector-performance-1",
        type: "sector-performance",
        position: { x: 0, y: 44, w: 6, h: 4 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "top-movers-1",
        type: "top-movers",
        position: { x: 0, y: 48, w: 6, h: 5 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "economic-calendar-1",
        type: "economic-calendar",
        position: { x: 0, y: 53, w: 6, h: 5 },
        isVisible: true,
        isLocked: false,
      },
    ],
  },
  xs: {
    breakpoint: "xs",
    cols: 4,
    rowHeight: 60,
    margin: [8, 8],
    containerPadding: [8, 8],
    widgets: [
      {
        id: "portfolio-overview-1",
        type: "portfolio-overview",
        position: { x: 0, y: 0, w: 4, h: 4 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "portfolio-chart-1",
        type: "portfolio-chart",
        position: { x: 0, y: 4, w: 4, h: 6 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "watchlist-1",
        type: "watchlist",
        position: { x: 0, y: 10, w: 4, h: 6 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "market-summary-1",
        type: "market-summary",
        position: { x: 0, y: 16, w: 4, h: 4 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "ai-insights-1",
        type: "ai-insights",
        position: { x: 0, y: 20, w: 4, h: 5 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "recent-transactions-1",
        type: "recent-transactions",
        position: { x: 0, y: 25, w: 4, h: 5 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "performance-metrics-1",
        type: "performance-metrics",
        position: { x: 0, y: 30, w: 4, h: 4 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "alerts-1",
        type: "alerts",
        position: { x: 0, y: 34, w: 4, h: 4 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "news-feed-1",
        type: "news-feed",
        position: { x: 0, y: 38, w: 4, h: 6 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "sector-performance-1",
        type: "sector-performance",
        position: { x: 0, y: 44, w: 4, h: 4 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "top-movers-1",
        type: "top-movers",
        position: { x: 0, y: 48, w: 4, h: 5 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "economic-calendar-1",
        type: "economic-calendar",
        position: { x: 0, y: 53, w: 4, h: 5 },
        isVisible: true,
        isLocked: false,
      },
    ],
  },
  xxs: {
    breakpoint: "xxs",
    cols: 2,
    rowHeight: 60,
    margin: [4, 4],
    containerPadding: [4, 4],
    widgets: [
      {
        id: "portfolio-overview-1",
        type: "portfolio-overview",
        position: { x: 0, y: 0, w: 2, h: 4 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "portfolio-chart-1",
        type: "portfolio-chart",
        position: { x: 0, y: 4, w: 2, h: 6 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "watchlist-1",
        type: "watchlist",
        position: { x: 0, y: 10, w: 2, h: 6 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "market-summary-1",
        type: "market-summary",
        position: { x: 0, y: 16, w: 2, h: 4 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "ai-insights-1",
        type: "ai-insights",
        position: { x: 0, y: 20, w: 2, h: 5 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "recent-transactions-1",
        type: "recent-transactions",
        position: { x: 0, y: 25, w: 2, h: 5 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "performance-metrics-1",
        type: "performance-metrics",
        position: { x: 0, y: 30, w: 2, h: 4 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "alerts-1",
        type: "alerts",
        position: { x: 0, y: 34, w: 2, h: 4 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "news-feed-1",
        type: "news-feed",
        position: { x: 0, y: 38, w: 2, h: 6 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "sector-performance-1",
        type: "sector-performance",
        position: { x: 0, y: 44, w: 2, h: 4 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "top-movers-1",
        type: "top-movers",
        position: { x: 0, y: 48, w: 2, h: 5 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "economic-calendar-1",
        type: "economic-calendar",
        position: { x: 0, y: 53, w: 2, h: 5 },
        isVisible: true,
        isLocked: false,
      },
    ],
  },
  xl: {
    breakpoint: "xl",
    cols: 16,
    rowHeight: 60,
    margin: [20, 20],
    containerPadding: [20, 20],
    widgets: [
      {
        id: "portfolio-overview-1",
        type: "portfolio-overview",
        position: { x: 0, y: 0, w: 8, h: 4 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "portfolio-chart-1",
        type: "portfolio-chart",
        position: { x: 8, y: 0, w: 8, h: 6 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "watchlist-1",
        type: "watchlist",
        position: { x: 0, y: 4, w: 5, h: 6 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "market-summary-1",
        type: "market-summary",
        position: { x: 5, y: 6, w: 5, h: 4 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "ai-insights-1",
        type: "ai-insights",
        position: { x: 10, y: 6, w: 6, h: 5 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "recent-transactions-1",
        type: "recent-transactions",
        position: { x: 0, y: 10, w: 6, h: 5 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "performance-metrics-1",
        type: "performance-metrics",
        position: { x: 6, y: 10, w: 5, h: 4 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "alerts-1",
        type: "alerts",
        position: { x: 11, y: 11, w: 5, h: 4 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "news-feed-1",
        type: "news-feed",
        position: { x: 0, y: 15, w: 5, h: 6 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "sector-performance-1",
        type: "sector-performance",
        position: { x: 5, y: 14, w: 6, h: 4 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "top-movers-1",
        type: "top-movers",
        position: { x: 11, y: 15, w: 5, h: 5 },
        isVisible: true,
        isLocked: false,
      },
      {
        id: "economic-calendar-1",
        type: "economic-calendar",
        position: { x: 5, y: 18, w: 6, h: 5 },
        isVisible: true,
        isLocked: false,
      },
    ],
  },
};

/**
 * Default dashboard configuration for new users
 */
export const DEFAULT_DASHBOARD_CONFIG: DashboardConfig = {
  id: "default-dashboard",
  name: "My Dashboard",
  description: "Default StockPulse trading dashboard",
  layouts: DEFAULT_LAYOUTS,
  version: "1.0.0",
  isDefault: true,
  metadata: {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "system",
    accessCount: 0,
    tags: ["default", "trading", "portfolio"],
  },
};

/**
 * Default user preferences
 */
export const DEFAULT_DASHBOARD_PREFERENCES: DashboardPreferences = {
  autoSave: true,
  autoRefresh: true,
  refreshInterval: 30000, // 30 seconds
  gridSnap: true,
  showGrid: false,
  compactMode: false,
  animations: true,
  notifications: true,
  defaultView: "desktop",
};

// ===============================================
// Utility Types
// ===============================================

/**
 * Widget component props interface
 */
export interface WidgetComponentProps {
  widgetId: string;
  config: WidgetConfig;
  isEditMode: boolean;
  onConfigChange?: (config: Partial<WidgetConfig>) => void;
  onRemove?: () => void;
  className?: string;
}

/**
 * Dashboard event types
 */
export type DashboardEvent =
  | { type: "WIDGET_ADDED"; payload: { widget: WidgetConfig } }
  | { type: "WIDGET_REMOVED"; payload: { widgetId: string } }
  | {
      type: "WIDGET_MOVED";
      payload: { widgetId: string; position: WidgetPosition };
    }
  | {
      type: "WIDGET_RESIZED";
      payload: { widgetId: string; size: { w: number; h: number } };
    }
  | {
      type: "WIDGET_CONFIGURED";
      payload: { widgetId: string; config: WidgetConfig };
    }
  | { type: "LAYOUT_CHANGED"; payload: { layout: DashboardLayout } }
  | { type: "EDIT_MODE_TOGGLED"; payload: { isEditMode: boolean } }
  | { type: "DASHBOARD_SAVED"; payload: { config: DashboardConfig } }
  | { type: "DASHBOARD_LOADED"; payload: { config: DashboardConfig } };

/**
 * Dashboard API response types
 */
export interface DashboardAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}
