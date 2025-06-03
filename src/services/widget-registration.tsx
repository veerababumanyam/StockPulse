/**
 * Widget Registration Service
 * Registers all available widgets with the widget registry system
 */

import { lazy } from "react";
import {
  PieChart,
  TrendingUp,
  List,
  BarChart3,
  Brain,
  History,
  Gauge,
  AlertTriangle,
  Newspaper,
  Building2,
  Activity,
  Calendar,
} from "lucide-react";
import {
  widgetRegistry,
  WidgetMetadata,
  WidgetFactory,
} from "./widget-registry";
import { WidgetType, WidgetCategory, WIDGET_SIZES } from "../types/dashboard";

// Lazy load widget components for better performance
const PortfolioOverview = lazy(
  () => import("../components/widgets/PortfolioOverview"),
);
const PortfolioChart = lazy(
  () => import("../components/widgets/PortfolioChart"),
);
const Watchlist = lazy(() => import("../components/widgets/Watchlist"));
const MarketSummary = lazy(() => import("../components/widgets/MarketSummary"));
const AIInsights = lazy(() => import("../components/widgets/AIInsights"));
const RecentTransactions = lazy(
  () => import("../components/widgets/RecentTransactions"),
);
const PerformanceMetrics = lazy(
  () => import("../components/widgets/PerformanceMetrics"),
);
const Alerts = lazy(() => import("../components/widgets/Alerts"));
const NewsFeed = lazy(() => import("../components/widgets/NewsFeed"));
const SectorPerformance = lazy(
  () => import("../components/widgets/SectorPerformance"),
);
const TopMovers = lazy(() => import("../components/widgets/TopMovers"));
const EconomicCalendar = lazy(
  () => import("../components/widgets/EconomicCalendar"),
);

// Lazy load preview components (simplified versions for library preview)
const PortfolioOverviewPreview = lazy(
  () => import("../components/widgets/previews/PortfolioOverviewPreview"),
);
const PortfolioChartPreview = lazy(
  () => import("../components/widgets/previews/PortfolioChartPreview"),
);
const WatchlistPreview = lazy(
  () => import("../components/widgets/previews/WatchlistPreview"),
);
const MarketSummaryPreview = lazy(
  () => import("../components/widgets/previews/MarketSummaryPreview"),
);
const AIInsightsPreview = lazy(
  () => import("../components/widgets/previews/AIInsightsPreview"),
);
const RecentTransactionsPreview = lazy(
  () => import("../components/widgets/previews/RecentTransactionsPreview"),
);
const PerformanceMetricsPreview = lazy(
  () => import("../components/widgets/previews/PerformanceMetricsPreview"),
);
const AlertsPreview = lazy(
  () => import("../components/widgets/previews/AlertsPreview"),
);
const NewsFeedPreview = lazy(
  () => import("../components/widgets/previews/NewsFeedPreview"),
);
const SectorPerformancePreview = lazy(
  () => import("../components/widgets/previews/SectorPerformancePreview"),
);
const TopMoversPreview = lazy(
  () => import("../components/widgets/previews/TopMoversPreview"),
);
const EconomicCalendarPreview = lazy(
  () => import("../components/widgets/previews/EconomicCalendarPreview"),
);

// Widget factory for creating widget instances with validation
const createWidgetFactory = (type: WidgetType): WidgetFactory => ({
  create: (config: Record<string, any>) => {
    // Return the widget component with merged config
    return (props: any) => {
      const Component = getWidgetComponent(type);
      return Component ? <Component {...props} config={config} /> : null;
    };
  },

  validate: (config: Record<string, any>) => {
    // Basic validation - can be extended per widget type
    if (!config || typeof config !== "object") return false;

    // Widget-specific validation
    switch (type) {
      case "portfolio-overview":
      case "portfolio-chart":
        return true; // Portfolio widgets require no special config

      case "watchlist":
        return !config.symbols || Array.isArray(config.symbols);

      case "market-summary":
        return !config.indices || Array.isArray(config.indices);

      case "ai-insights":
        return !config.analysisType || typeof config.analysisType === "string";

      case "recent-transactions":
        return (
          !config.limit ||
          (typeof config.limit === "number" && config.limit > 0)
        );

      case "performance-metrics":
        return !config.timeframe || typeof config.timeframe === "string";

      case "alerts":
        return (
          !config.priority ||
          ["low", "medium", "high", "critical"].includes(config.priority)
        );

      case "news-feed":
        return !config.sources || Array.isArray(config.sources);

      case "sector-performance":
        return !config.sectors || Array.isArray(config.sectors);

      case "top-movers":
        return (
          !config.type || ["gainers", "losers", "active"].includes(config.type)
        );

      case "economic-calendar":
        return !config.importance || typeof config.importance === "string";

      default:
        return true;
    }
  },

  getDefaultConfig: () => {
    // Default configuration for each widget type
    switch (type) {
      case "portfolio-overview":
        return {
          showCash: true,
          showPositions: true,
          showDayChange: true,
          refreshInterval: 30000,
        };

      case "portfolio-chart":
        return {
          timeframe: "1M",
          chartType: "line",
          showVolume: false,
          refreshInterval: 60000,
        };

      case "watchlist":
        return {
          symbols: ["AAPL", "GOOGL", "MSFT", "TSLA"],
          showChange: true,
          showVolume: true,
          refreshInterval: 30000,
        };

      case "market-summary":
        return {
          indices: ["S&P 500", "NASDAQ", "DOW", "VIX"],
          showChange: true,
          refreshInterval: 30000,
        };

      case "ai-insights":
        return {
          analysisType: "portfolio",
          showConfidence: true,
          refreshInterval: 300000, // 5 minutes
        };

      case "recent-transactions":
        return {
          limit: 10,
          showDetails: true,
          refreshInterval: 60000,
        };

      case "performance-metrics":
        return {
          timeframe: "1Y",
          showBenchmark: true,
          refreshInterval: 300000,
        };

      case "alerts":
        return {
          priority: "medium",
          autoRefresh: true,
          refreshInterval: 30000,
        };

      case "news-feed":
        return {
          sources: ["reuters", "bloomberg", "cnbc"],
          limit: 10,
          refreshInterval: 180000, // 3 minutes
        };

      case "sector-performance":
        return {
          sectors: ["Technology", "Healthcare", "Financials", "Energy"],
          timeframe: "1D",
          refreshInterval: 300000,
        };

      case "top-movers":
        return {
          type: "gainers",
          limit: 10,
          refreshInterval: 60000,
        };

      case "economic-calendar":
        return {
          importance: "medium",
          timeframe: "1W",
          refreshInterval: 3600000, // 1 hour
        };

      default:
        return {};
    }
  },
});

// Helper function to get widget component
const getWidgetComponent = (type: WidgetType) => {
  switch (type) {
    case "portfolio-overview":
      return PortfolioOverview;
    case "portfolio-chart":
      return PortfolioChart;
    case "watchlist":
      return Watchlist;
    case "market-summary":
      return MarketSummary;
    case "ai-insights":
      return AIInsights;
    case "recent-transactions":
      return RecentTransactions;
    case "performance-metrics":
      return PerformanceMetrics;
    case "alerts":
      return Alerts;
    case "news-feed":
      return NewsFeed;
    case "sector-performance":
      return SectorPerformance;
    case "top-movers":
      return TopMovers;
    case "economic-calendar":
      return EconomicCalendar;
    default:
      return null;
  }
};

// Helper function to get preview component
const getPreviewComponent = (type: WidgetType) => {
  switch (type) {
    case "portfolio-overview":
      return PortfolioOverviewPreview;
    case "portfolio-chart":
      return PortfolioChartPreview;
    case "watchlist":
      return WatchlistPreview;
    case "market-summary":
      return MarketSummaryPreview;
    case "ai-insights":
      return AIInsightsPreview;
    case "recent-transactions":
      return RecentTransactionsPreview;
    case "performance-metrics":
      return PerformanceMetricsPreview;
    case "alerts":
      return AlertsPreview;
    case "news-feed":
      return NewsFeedPreview;
    case "sector-performance":
      return SectorPerformancePreview;
    case "top-movers":
      return TopMoversPreview;
    case "economic-calendar":
      return EconomicCalendarPreview;
    default:
      return null;
  }
};

// Widget definitions with metadata
const WIDGET_DEFINITIONS: Record<
  WidgetType,
  Omit<WidgetMetadata, "component" | "previewComponent">
> = {
  "portfolio-overview": {
    type: "portfolio-overview",
    config: {
      id: "portfolio-overview",
      type: "portfolio-overview",
      title: "Portfolio Overview",
      description:
        "Complete portfolio summary with total value, day change, and key metrics",
      icon: "PieChart",
      category: "portfolio",
      isEnabled: true,
    },
    libraryItem: {
      type: "portfolio-overview",
      title: "Portfolio Overview",
      description:
        "Track your portfolio's total value, daily performance, and key metrics at a glance",
      icon: PieChart,
      category: "portfolio",
      isAvailable: true,
      isPremium: false,
      tags: ["portfolio", "overview", "metrics", "performance"],
    },
    permissions: ["portfolio.read"],
    dataRequirements: ["portfolio_data", "market_data"],
  },

  "portfolio-chart": {
    type: "portfolio-chart",
    config: {
      id: "portfolio-chart",
      type: "portfolio-chart",
      title: "Portfolio Chart",
      description: "Interactive chart showing portfolio performance over time",
      icon: "TrendingUp",
      category: "portfolio",
      isEnabled: true,
    },
    libraryItem: {
      type: "portfolio-chart",
      title: "Portfolio Chart",
      description:
        "Visualize your portfolio performance with interactive charts and multiple timeframes",
      icon: TrendingUp,
      category: "portfolio",
      isAvailable: true,
      isPremium: false,
      tags: ["portfolio", "chart", "performance", "visualization"],
    },
    permissions: ["portfolio.read"],
    dataRequirements: ["portfolio_history", "market_data"],
  },

  watchlist: {
    type: "watchlist",
    config: {
      id: "watchlist",
      type: "watchlist",
      title: "Watchlist",
      description:
        "Monitor your favorite stocks and track their real-time performance",
      icon: "List",
      category: "market",
      isEnabled: true,
    },
    libraryItem: {
      type: "watchlist",
      title: "Watchlist",
      description:
        "Keep track of your favorite stocks with real-time prices and performance metrics",
      icon: List,
      category: "market",
      isAvailable: true,
      isPremium: false,
      tags: ["watchlist", "stocks", "real-time", "monitoring"],
    },
    permissions: ["market.read"],
    dataRequirements: ["stock_prices", "market_data"],
  },

  "market-summary": {
    type: "market-summary",
    config: {
      id: "market-summary",
      type: "market-summary",
      title: "Market Summary",
      description: "Key market indices and their current performance",
      icon: "BarChart3",
      category: "market",
      isEnabled: true,
    },
    libraryItem: {
      type: "market-summary",
      title: "Market Summary",
      description:
        "Stay updated with major market indices including S&P 500, NASDAQ, and DOW",
      icon: BarChart3,
      category: "market",
      isAvailable: true,
      isPremium: false,
      tags: ["market", "indices", "summary", "performance"],
    },
    permissions: ["market.read"],
    dataRequirements: ["market_indices", "market_data"],
  },

  "ai-insights": {
    type: "ai-insights",
    config: {
      id: "ai-insights",
      type: "ai-insights",
      title: "AI Insights",
      description: "AI-powered analysis and recommendations for your portfolio",
      icon: "Brain",
      category: "analysis",
      isEnabled: true,
    },
    libraryItem: {
      type: "ai-insights",
      title: "AI Insights",
      description:
        "Get AI-powered analysis, recommendations, and market insights for better decision making",
      icon: Brain,
      category: "analysis",
      isAvailable: true,
      isPremium: true,
      tags: ["ai", "insights", "analysis", "recommendations", "premium"],
    },
    permissions: ["ai.read", "portfolio.read"],
    dataRequirements: ["portfolio_data", "market_data", "ai_analysis"],
  },

  "recent-transactions": {
    type: "recent-transactions",
    config: {
      id: "recent-transactions",
      type: "recent-transactions",
      title: "Recent Transactions",
      description: "Latest portfolio transactions and trading activity",
      icon: "History",
      category: "portfolio",
      isEnabled: true,
    },
    libraryItem: {
      type: "recent-transactions",
      title: "Recent Transactions",
      description:
        "View your latest trades, orders, and transaction history with detailed information",
      icon: History,
      category: "portfolio",
      isAvailable: true,
      isPremium: false,
      tags: ["transactions", "trades", "history", "orders"],
    },
    permissions: ["transactions.read"],
    dataRequirements: ["transaction_history", "order_data"],
  },

  "performance-metrics": {
    type: "performance-metrics",
    config: {
      id: "performance-metrics",
      type: "performance-metrics",
      title: "Performance Metrics",
      description: "Key performance indicators and portfolio analytics",
      icon: "Gauge",
      category: "performance",
      isEnabled: true,
    },
    libraryItem: {
      type: "performance-metrics",
      title: "Performance Metrics",
      description:
        "Track important portfolio metrics like Sharpe ratio, alpha, beta, and more",
      icon: Gauge,
      category: "performance",
      isAvailable: true,
      isPremium: false,
      tags: ["performance", "metrics", "analytics", "kpi"],
    },
    permissions: ["portfolio.read", "analytics.read"],
    dataRequirements: ["portfolio_performance", "benchmark_data"],
  },

  alerts: {
    type: "alerts",
    config: {
      id: "alerts",
      type: "alerts",
      title: "Alerts",
      description: "Price alerts, news alerts, and important notifications",
      icon: "AlertTriangle",
      category: "alerts",
      isEnabled: true,
    },
    libraryItem: {
      type: "alerts",
      title: "Alerts",
      description:
        "Stay informed with price alerts, news notifications, and important market events",
      icon: AlertTriangle,
      category: "alerts",
      isAvailable: true,
      isPremium: false,
      tags: ["alerts", "notifications", "price", "news"],
    },
    permissions: ["alerts.read"],
    dataRequirements: ["alert_data", "notification_data"],
  },

  "news-feed": {
    type: "news-feed",
    config: {
      id: "news-feed",
      type: "news-feed",
      title: "News Feed",
      description: "Latest financial news and market updates",
      icon: "Newspaper",
      category: "news",
      isEnabled: true,
    },
    libraryItem: {
      type: "news-feed",
      title: "News Feed",
      description:
        "Stay updated with the latest financial news from trusted sources like Reuters and Bloomberg",
      icon: Newspaper,
      category: "news",
      isAvailable: true,
      isPremium: false,
      tags: ["news", "financial", "updates", "market"],
    },
    permissions: ["news.read"],
    dataRequirements: ["news_data", "market_news"],
  },

  "sector-performance": {
    type: "sector-performance",
    config: {
      id: "sector-performance",
      type: "sector-performance",
      title: "Sector Performance",
      description: "Performance comparison across different market sectors",
      icon: "Building2",
      category: "analysis",
      isEnabled: true,
    },
    libraryItem: {
      type: "sector-performance",
      title: "Sector Performance",
      description:
        "Compare performance across market sectors like Technology, Healthcare, and Financials",
      icon: Building2,
      category: "analysis",
      isAvailable: true,
      isPremium: false,
      tags: ["sector", "performance", "comparison", "analysis"],
    },
    permissions: ["market.read"],
    dataRequirements: ["sector_data", "market_data"],
  },

  "top-movers": {
    type: "top-movers",
    config: {
      id: "top-movers",
      type: "top-movers",
      title: "Top Movers",
      description: "Biggest gainers, losers, and most active stocks",
      icon: "Activity",
      category: "market",
      isEnabled: true,
    },
    libraryItem: {
      type: "top-movers",
      title: "Top Movers",
      description:
        "Discover the biggest gainers, losers, and most actively traded stocks in the market",
      icon: Activity,
      category: "market",
      isAvailable: true,
      isPremium: false,
      tags: ["movers", "gainers", "losers", "active", "stocks"],
    },
    permissions: ["market.read"],
    dataRequirements: ["stock_data", "market_activity"],
  },

  "economic-calendar": {
    type: "economic-calendar",
    config: {
      id: "economic-calendar",
      type: "economic-calendar",
      title: "Economic Calendar",
      description: "Important economic events and earnings announcements",
      icon: "Calendar",
      category: "news",
      isEnabled: true,
    },
    libraryItem: {
      type: "economic-calendar",
      title: "Economic Calendar",
      description:
        "Track important economic events, earnings releases, and market-moving announcements",
      icon: Calendar,
      category: "news",
      isAvailable: true,
      isPremium: false,
      tags: ["economic", "calendar", "events", "earnings"],
    },
    permissions: ["market.read", "news.read"],
    dataRequirements: ["economic_events", "earnings_data"],
  },
};

/**
 * Register all widgets with the widget registry
 */
export const registerAllWidgets = (): void => {
  console.log("🔄 Starting widget registration...");

  Object.entries(WIDGET_DEFINITIONS).forEach(([type, definition]) => {
    const widgetType = type as WidgetType;

    try {
      const metadata: WidgetMetadata = {
        ...definition,
        component: getWidgetComponent(widgetType)!,
        previewComponent: getPreviewComponent(widgetType),
      };

      const factory = createWidgetFactory(widgetType);

      widgetRegistry.register(metadata, factory);
      console.log(`✅ Registered widget: ${type}`);
    } catch (error) {
      console.error(`❌ Failed to register widget: ${type}`, error);
    }
  });

  console.log("🎉 Widget registration completed!");
  console.log(`📊 Total widgets registered: ${widgetRegistry.getAll().length}`);

  // Log category statistics
  const categories = widgetRegistry.getCategoriesWithCounts();
  categories.forEach(({ category, count }) => {
    console.log(`📂 ${category}: ${count} widgets`);
  });
};

/**
 * Preload essential widgets for better performance
 */
export const preloadEssentialWidgets = async (): Promise<void> => {
  const essentialWidgets: WidgetType[] = [
    "portfolio-overview",
    "market-summary",
    "watchlist",
    "portfolio-chart",
  ];

  console.log("🚀 Preloading essential widgets...");
  await widgetRegistry.preloadWidgets(essentialWidgets);
  console.log("✅ Essential widgets preloaded");
};

/**
 * Get widget by type with error handling
 */
export const getRegisteredWidget = (type: WidgetType) => {
  const widget = widgetRegistry.get(type);
  if (!widget) {
    console.warn(`⚠️ Widget not found: ${type}`);
    return null;
  }
  return widget;
};

/**
 * Check if widget is available for user
 */
export const isWidgetAvailable = (
  type: WidgetType,
  userPermissions: string[] = [],
): boolean => {
  return (
    widgetRegistry.isAvailable(type) &&
    widgetRegistry.checkPermissions(type, userPermissions)
  );
};

/**
 * Get available widgets for user
 */
export const getAvailableWidgets = (userPermissions: string[] = []) => {
  return widgetRegistry
    .getAll()
    .filter((widget) => isWidgetAvailable(widget.type, userPermissions))
    .map((widget) => widget.libraryItem);
};

// Auto-register widgets when module is imported
registerAllWidgets();
