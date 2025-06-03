/**
 * StockPulse Widget Registry - Enterprise-Grade
 * Centralized registry for managing widget types, metadata, and registration
 * Follows Story 2.2 requirements and enterprise architecture patterns
 */

import {
  WidgetType,
  WidgetMetadata,
  WidgetCategory,
  WidgetSize,
  WidgetComponentProps,
} from "../types/dashboard";
import { ComponentType, lazy } from "react";

// ===============================================
// Widget Registry Interface
// ===============================================

export interface WidgetRegistryEntry {
  type: WidgetType;
  metadata: WidgetMetadata;
  component: ComponentType<WidgetComponentProps>;
  previewComponent?: ComponentType<any>;
  isEnabled: boolean;
  permissions?: string[];
  version: string;
  lastUpdated: string;
}

export interface WidgetRegistry {
  [key: string]: WidgetRegistryEntry;
}

// ===============================================
// Widget Component Lazy Loading
// ===============================================

const WIDGET_COMPONENTS: Record<
  WidgetType,
  ComponentType<WidgetComponentProps>
> = {
  "portfolio-overview": lazy(
    () => import("../components/widgets/PortfolioOverview"),
  ),
  "portfolio-chart": lazy(() => import("../components/widgets/PortfolioChart")),
  watchlist: lazy(() => import("../components/widgets/Watchlist")),
  "market-summary": lazy(() => import("../components/widgets/MarketSummary")),
  "ai-insights": lazy(() => import("../components/widgets/AIInsightsWidget")),
  "recent-transactions": lazy(
    () => import("../components/widgets/RecentTransactions"),
  ),
  "performance-metrics": lazy(
    () => import("../components/widgets/PerformanceMetrics"),
  ),
  alerts: lazy(() => import("../components/widgets/Alerts")),
  "news-feed": lazy(() => import("../components/widgets/NewsFeed")),
  "sector-performance": lazy(
    () => import("../components/widgets/SectorPerformance"),
  ),
  "top-movers": lazy(() => import("../components/widgets/TopMovers")),
  "economic-calendar": lazy(
    () => import("../components/widgets/EconomicCalendar"),
  ),
};

// ===============================================
// Widget Metadata Definitions
// ===============================================

const WIDGET_METADATA: Record<WidgetType, WidgetMetadata> = {
  "portfolio-overview": {
    type: "portfolio-overview",
    name: "Portfolio Overview",
    description:
      "Comprehensive overview of portfolio performance and key metrics",
    category: "portfolio",
    icon: "PieChart",
    isResizable: true,
    isDraggable: true,
    defaultSize: { w: 3, h: 3, minW: 2, minH: 2, maxW: 6, maxH: 4 },
    supportedSizes: [
      { w: 2, h: 2, minW: 2, minH: 2 },
      { w: 3, h: 3, minW: 2, minH: 2 },
      { w: 4, h: 3, minW: 2, minH: 2 },
    ],
    tags: ["portfolio", "overview", "performance", "metrics"],
    isPremium: false,
  },
  "portfolio-chart": {
    type: "portfolio-chart",
    name: "Portfolio Chart",
    description: "Interactive chart showing portfolio performance over time",
    category: "portfolio",
    icon: "TrendingUp",
    isResizable: true,
    isDraggable: true,
    defaultSize: { w: 4, h: 3, minW: 3, minH: 2, maxW: 8, maxH: 6 },
    supportedSizes: [
      { w: 3, h: 2, minW: 3, minH: 2 },
      { w: 4, h: 3, minW: 3, minH: 2 },
      { w: 6, h: 4, minW: 3, minH: 2 },
    ],
    tags: ["portfolio", "chart", "performance", "visualization"],
    isPremium: false,
  },
  watchlist: {
    type: "watchlist",
    name: "Watchlist",
    description: "Monitor your favorite stocks and track their performance",
    category: "market",
    icon: "List",
    isResizable: true,
    isDraggable: true,
    defaultSize: { w: 3, h: 4, minW: 2, minH: 3, maxW: 6, maxH: 8 },
    supportedSizes: [
      { w: 2, h: 3, minW: 2, minH: 3 },
      { w: 3, h: 4, minW: 2, minH: 3 },
      { w: 4, h: 5, minW: 2, minH: 3 },
    ],
    tags: ["stocks", "watchlist", "monitoring", "market"],
    isPremium: false,
  },
  "market-summary": {
    type: "market-summary",
    name: "Market Summary",
    description: "Overview of major market indices and their performance",
    category: "market",
    icon: "BarChart3",
    isResizable: true,
    isDraggable: true,
    defaultSize: { w: 3, h: 2, minW: 2, minH: 2, maxW: 6, maxH: 4 },
    supportedSizes: [
      { w: 2, h: 2, minW: 2, minH: 2 },
      { w: 3, h: 2, minW: 2, minH: 2 },
      { w: 4, h: 3, minW: 2, minH: 2 },
    ],
    tags: ["market", "indices", "summary", "overview"],
    isPremium: false,
  },
  "ai-insights": {
    type: "ai-insights",
    name: "AI Insights",
    description: "AI-powered trading insights and recommendations",
    category: "analytics",
    icon: "Brain",
    isResizable: true,
    isDraggable: true,
    defaultSize: { w: 3, h: 3, minW: 2, minH: 2, maxW: 6, maxH: 5 },
    supportedSizes: [
      { w: 2, h: 2, minW: 2, minH: 2 },
      { w: 3, h: 3, minW: 2, minH: 2 },
      { w: 4, h: 4, minW: 2, minH: 2 },
    ],
    tags: ["ai", "insights", "recommendations", "analytics"],
    isPremium: true,
  },
  "recent-transactions": {
    type: "recent-transactions",
    name: "Recent Transactions",
    description: "View your latest trading activity and transaction history",
    category: "trading",
    icon: "History",
    isResizable: true,
    isDraggable: true,
    defaultSize: { w: 3, h: 3, minW: 2, minH: 2, maxW: 6, maxH: 6 },
    supportedSizes: [
      { w: 2, h: 2, minW: 2, minH: 2 },
      { w: 3, h: 3, minW: 2, minH: 2 },
      { w: 4, h: 4, minW: 2, minH: 2 },
    ],
    tags: ["transactions", "trading", "history", "activity"],
    isPremium: false,
  },
  "performance-metrics": {
    type: "performance-metrics",
    name: "Performance Metrics",
    description: "Key performance indicators and portfolio analytics",
    category: "analytics",
    icon: "Gauge",
    isResizable: true,
    isDraggable: true,
    defaultSize: { w: 3, h: 2, minW: 2, minH: 2, maxW: 6, maxH: 4 },
    supportedSizes: [
      { w: 2, h: 2, minW: 2, minH: 2 },
      { w: 3, h: 2, minW: 2, minH: 2 },
      { w: 4, h: 3, minW: 2, minH: 2 },
    ],
    tags: ["performance", "metrics", "analytics", "kpi"],
    isPremium: false,
  },
  alerts: {
    type: "alerts",
    name: "Alerts",
    description: "Trading alerts, notifications, and important updates",
    category: "trading",
    icon: "AlertTriangle",
    isResizable: true,
    isDraggable: true,
    defaultSize: { w: 3, h: 3, minW: 2, minH: 2, maxW: 6, maxH: 5 },
    supportedSizes: [
      { w: 2, h: 2, minW: 2, minH: 2 },
      { w: 3, h: 3, minW: 2, minH: 2 },
      { w: 4, h: 4, minW: 2, minH: 2 },
    ],
    tags: ["alerts", "notifications", "trading", "updates"],
    isPremium: false,
  },
  "news-feed": {
    type: "news-feed",
    name: "News Feed",
    description: "Latest financial news and market updates",
    category: "news",
    icon: "Newspaper",
    isResizable: true,
    isDraggable: true,
    defaultSize: { w: 3, h: 4, minW: 2, minH: 3, maxW: 6, maxH: 8 },
    supportedSizes: [
      { w: 2, h: 3, minW: 2, minH: 3 },
      { w: 3, h: 4, minW: 2, minH: 3 },
      { w: 4, h: 5, minW: 2, minH: 3 },
    ],
    tags: ["news", "financial", "market", "updates"],
    isPremium: false,
  },
  "sector-performance": {
    type: "sector-performance",
    name: "Sector Performance",
    description: "Performance analysis across different market sectors",
    category: "market",
    icon: "Building2",
    isResizable: true,
    isDraggable: true,
    defaultSize: { w: 3, h: 3, minW: 2, minH: 2, maxW: 6, maxH: 5 },
    supportedSizes: [
      { w: 2, h: 2, minW: 2, minH: 2 },
      { w: 3, h: 3, minW: 2, minH: 2 },
      { w: 4, h: 4, minW: 2, minH: 2 },
    ],
    tags: ["sectors", "performance", "analysis", "market"],
    isPremium: false,
  },
  "top-movers": {
    type: "top-movers",
    name: "Top Movers",
    description: "Stocks with the biggest gains and losses today",
    category: "market",
    icon: "Activity",
    isResizable: true,
    isDraggable: true,
    defaultSize: { w: 3, h: 3, minW: 2, minH: 2, maxW: 6, maxH: 5 },
    supportedSizes: [
      { w: 2, h: 2, minW: 2, minH: 2 },
      { w: 3, h: 3, minW: 2, minH: 2 },
      { w: 4, h: 4, minW: 2, minH: 2 },
    ],
    tags: ["movers", "gainers", "losers", "market"],
    isPremium: false,
  },
  "economic-calendar": {
    type: "economic-calendar",
    name: "Economic Calendar",
    description: "Important economic events and their market impact",
    category: "news",
    icon: "Calendar",
    isResizable: true,
    isDraggable: true,
    defaultSize: { w: 4, h: 3, minW: 3, minH: 2, maxW: 8, maxH: 6 },
    supportedSizes: [
      { w: 3, h: 2, minW: 3, minH: 2 },
      { w: 4, h: 3, minW: 3, minH: 2 },
      { w: 6, h: 4, minW: 3, minH: 2 },
    ],
    tags: ["economic", "calendar", "events", "news"],
    isPremium: true,
  },
};

// ===============================================
// Widget Registry Implementation
// ===============================================

class WidgetRegistryService {
  private registry: WidgetRegistry = {};
  private initialized = false;

  constructor() {
    this.initializeRegistry();
  }

  /**
   * Initialize the widget registry with all available widgets
   */
  private initializeRegistry(): void {
    if (this.initialized) return;

    Object.entries(WIDGET_METADATA).forEach(([type, metadata]) => {
      this.registry[type] = {
        type: type as WidgetType,
        metadata,
        component: WIDGET_COMPONENTS[type as WidgetType],
        isEnabled: true,
        version: "1.0.0",
        lastUpdated: new Date().toISOString(),
      };
    });

    this.initialized = true;
  }

  /**
   * Get all registered widgets
   */
  getAllWidgets(): WidgetRegistryEntry[] {
    return Object.values(this.registry);
  }

  /**
   * Get widgets by category
   */
  getWidgetsByCategory(category: WidgetCategory): WidgetRegistryEntry[] {
    return Object.values(this.registry).filter(
      (entry) => entry.metadata.category === category,
    );
  }

  /**
   * Get widget by type
   */
  getWidget(type: WidgetType): WidgetRegistryEntry | undefined {
    return this.registry[type];
  }

  /**
   * Get widget metadata
   */
  getWidgetMetadata(type: WidgetType): WidgetMetadata | undefined {
    return this.registry[type]?.metadata;
  }

  /**
   * Get widget component
   */
  getWidgetComponent(
    type: WidgetType,
  ): ComponentType<WidgetComponentProps> | undefined {
    return this.registry[type]?.component;
  }

  /**
   * Check if widget is available for user
   */
  isWidgetAvailable(type: WidgetType, userPermissions: string[] = []): boolean {
    const widget = this.registry[type];
    if (!widget || !widget.isEnabled) return false;

    if (widget.permissions && widget.permissions.length > 0) {
      return widget.permissions.some((permission) =>
        userPermissions.includes(permission),
      );
    }

    return true;
  }

  /**
   * Get available widgets for user
   */
  getAvailableWidgets(userPermissions: string[] = []): WidgetRegistryEntry[] {
    return Object.values(this.registry).filter((widget) =>
      this.isWidgetAvailable(widget.type, userPermissions),
    );
  }

  /**
   * Register a new widget (for extensibility)
   */
  registerWidget(entry: WidgetRegistryEntry): void {
    this.registry[entry.type] = entry;
  }

  /**
   * Unregister a widget
   */
  unregisterWidget(type: WidgetType): void {
    delete this.registry[type];
  }

  /**
   * Enable/disable a widget
   */
  setWidgetEnabled(type: WidgetType, enabled: boolean): void {
    if (this.registry[type]) {
      this.registry[type].isEnabled = enabled;
    }
  }

  /**
   * Get widget statistics
   */
  getRegistryStats(): {
    totalWidgets: number;
    enabledWidgets: number;
    categoryCounts: Record<WidgetCategory, number>;
    premiumWidgets: number;
  } {
    const widgets = Object.values(this.registry);
    const categoryCounts: Record<WidgetCategory, number> = {
      portfolio: 0,
      market: 0,
      trading: 0,
      analytics: 0,
      news: 0,
    };

    widgets.forEach((widget) => {
      categoryCounts[widget.metadata.category]++;
    });

    return {
      totalWidgets: widgets.length,
      enabledWidgets: widgets.filter((w) => w.isEnabled).length,
      categoryCounts,
      premiumWidgets: widgets.filter((w) => w.metadata.isPremium).length,
    };
  }
}

// ===============================================
// Singleton Instance
// ===============================================

export const widgetRegistry = new WidgetRegistryService();

// ===============================================
// Utility Functions
// ===============================================

/**
 * Get all available widget types
 */
export const getAvailableWidgetTypes = (): WidgetType[] => {
  return widgetRegistry.getAllWidgets().map((widget) => widget.type);
};

/**
 * Get widget metadata by type
 */
export const getWidgetMetadata = (
  type: WidgetType,
): WidgetMetadata | undefined => {
  return widgetRegistry.getWidgetMetadata(type);
};

/**
 * Get widget component by type
 */
export const getWidgetComponent = (
  type: WidgetType,
): ComponentType<WidgetComponentProps> | undefined => {
  return widgetRegistry.getWidgetComponent(type);
};

/**
 * Check if widget type is valid
 */
export const isValidWidgetType = (type: string): type is WidgetType => {
  return widgetRegistry.getWidget(type as WidgetType) !== undefined;
};

/**
 * Get default widget configuration
 */
export const getDefaultWidgetConfig = (
  type: WidgetType,
): Partial<WidgetSize> | undefined => {
  const metadata = widgetRegistry.getWidgetMetadata(type);
  return metadata?.defaultSize;
};

export default widgetRegistry;
