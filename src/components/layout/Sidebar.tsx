import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  BarChart3,
  TrendingUp,
  Search,
  Settings,
  Bot,
  Clock,
  Target,
  LineChart,
  Shield,
  Globe,
  Eye,
  Zap,
  Server,
  Map,
  Smartphone,
  FileCheck,
  Workflow,
  Key,
  Brain,
  GitBranch,
  PieChart,
  Briefcase,
  Edit3,
  Save,
  X,
  GripVertical,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  MoreHorizontal,
  UserPlus,
  Users,
} from "lucide-react";
import Logo from "../ui/Logo";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { cn } from "../../utils/cn";
import { useAuth } from "../../contexts/AuthContext";

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  category:
    | "core"
    | "trading"
    | "analysis"
    | "ai"
    | "mcp"
    | "settings"
    | "other"
    | "admin";
  roleRequired?: "user" | "trader" | "admin" | "analyst";
  badge?: string;
  isNew?: boolean;
  visible: boolean;
  order: number;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

// Icon render functions with proper TypeScript support
const iconMap = {
  home: () => <Home className="w-5 h-5" />,
  briefcase: () => <Briefcase className="w-5 h-5" />,
  search: () => <Search className="w-5 h-5" />,
  barChart3: () => <BarChart3 className="w-5 h-5" />,
  clock: () => <Clock className="w-5 h-5" />,
  target: () => <Target className="w-5 h-5" />,
  lineChart: () => <LineChart className="w-5 h-5" />,
  trendingUp: () => <TrendingUp className="w-5 h-5" />,
  workflow: () => <Workflow className="w-5 h-5" />,
  pieChart: () => <PieChart className="w-5 h-5" />,
  bot: () => <Bot className="w-5 h-5" />,
  zap: () => <Zap className="w-5 h-5" />,
  gitBranch: () => <GitBranch className="w-5 h-5" />,
  fileCheck: () => <FileCheck className="w-5 h-5" />,
  globe: () => <Globe className="w-5 h-5" />,
  settings: () => <Settings className="w-5 h-5" />,
  map: () => <Map className="w-5 h-5" />,
  eye: () => <Eye className="w-5 h-5" />,
  shield: () => <Shield className="w-5 h-5" />,
  smartphone: () => <Smartphone className="w-5 h-5" />,
  key: () => <Key className="w-5 h-5" />,
  brain: () => <Brain className="w-5 h-5" />,
  server: () => <Server className="w-5 h-5" />,
  userPlus: () => <UserPlus className="w-5 h-5" />,
  users: () => <Users className="w-5 h-5" />,
} as const;

type IconName = keyof typeof iconMap;

// Enhanced navigation items with proper icon mapping
const defaultNavigationItems: (Omit<
  NavigationItem,
  "visible" | "order" | "icon"
> & { iconName: IconName })[] = [
  // Core
  {
    id: "dashboard",
    label: "Dashboard",
    iconName: "home",
    path: "/dashboard",
    category: "core",
  },
  {
    id: "portfolio",
    label: "Portfolio",
    iconName: "briefcase",
    path: "/portfolio",
    category: "core",
  },
  {
    id: "screener",
    label: "Stock Screener",
    iconName: "search",
    path: "/screener",
    category: "core",
  },

  // Trading
  {
    id: "trading-dashboard",
    label: "Trading Dashboard",
    iconName: "barChart3",
    path: "/trading",
    category: "trading",
    roleRequired: "trader",
  },
  {
    id: "intraday",
    label: "Intraday Trading",
    iconName: "clock",
    path: "/trading/intraday",
    category: "trading",
    roleRequired: "trader",
  },
  {
    id: "options",
    label: "Options Trading",
    iconName: "target",
    path: "/trading/options",
    category: "trading",
    roleRequired: "trader",
  },
  {
    id: "positional",
    label: "Positional Trading",
    iconName: "lineChart",
    path: "/trading/positional",
    category: "trading",
    roleRequired: "trader",
  },
  {
    id: "long-term",
    label: "Long Term Investing",
    iconName: "trendingUp",
    path: "/trading/long-term",
    category: "trading",
  },
  {
    id: "workspace",
    label: "Trading Workspace",
    iconName: "workflow",
    path: "/trading/workspace",
    category: "trading",
    roleRequired: "trader",
  },

  // Analysis
  {
    id: "stock-analysis",
    label: "Stock Analysis",
    iconName: "pieChart",
    path: "/analysis/stocks",
    category: "analysis",
    roleRequired: "analyst",
  },

  // AI & Agents
  {
    id: "ai-agents",
    label: "AI Agents",
    iconName: "bot",
    path: "/agents/ai-agents",
    category: "ai",
  },
  {
    id: "automation",
    label: "Agent Automation",
    iconName: "zap",
    path: "/agents/automation",
    category: "ai",
  },
  {
    id: "orchestration",
    label: "Model Orchestration",
    iconName: "gitBranch",
    path: "/agents/orchestration",
    category: "ai",
  },
  {
    id: "compliance",
    label: "Compliance & Governance",
    iconName: "fileCheck",
    path: "/agents/compliance",
    category: "ai",
    roleRequired: "admin",
  },

  // MCP Services
  {
    id: "mcp-federation",
    label: "MCP Federation Registry",
    iconName: "globe",
    path: "/agents/federation",
    category: "mcp",
    badge: "New",
  },
  {
    id: "mcp-setup",
    label: "MCP Setup Wizard",
    iconName: "settings",
    path: "/agents/setup",
    category: "mcp",
    badge: "New",
  },
  {
    id: "mcp-capabilities",
    label: "MCP Capability Mapping",
    iconName: "map",
    path: "/agents/capabilities",
    category: "mcp",
    badge: "New",
  },
  {
    id: "mcp-observability",
    label: "MCP Observability",
    iconName: "eye",
    path: "/agents/observability",
    category: "mcp",
    badge: "New",
  },
  {
    id: "mcp-security",
    label: "MCP Security",
    iconName: "shield",
    path: "/agents/security",
    category: "mcp",
    badge: "New",
  },
  {
    id: "mcp-mobile",
    label: "MCP Mobile Management",
    iconName: "smartphone",
    path: "/agents/mobile",
    category: "mcp",
    badge: "New",
  },

  // Settings
  {
    id: "general-settings",
    label: "General Settings",
    iconName: "settings",
    path: "/settings",
    category: "settings",
  },
  {
    id: "api-keys",
    label: "API Key Management",
    iconName: "key",
    path: "/settings/api-keys",
    category: "settings",
  },
  {
    id: "llm-management",
    label: "LLM Management",
    iconName: "brain",
    path: "/settings/llm",
    category: "settings",
  },
  {
    id: "mcp-config",
    label: "MCP Configuration",
    iconName: "server",
    path: "/settings/mcp",
    category: "settings",
  },

  // Admin
  {
    id: "user-approval",
    label: "User Approval",
    iconName: "users",
    path: "/admin/user-approval",
    category: "admin",
    roleRequired: "admin",
  },

  // Other
  {
    id: "onboarding",
    label: "Onboarding",
    iconName: "userPlus",
    path: "/onboarding",
    category: "other",
  },
];

// Category configuration for modern styling
const categoryConfig = {
  core: {
    label: "Core",
    color: "from-primary to-primary-600",
    bgColor: "bg-gradient-to-r from-primary/10 to-primary/20",
    icon: <Layers className="w-4 h-4" />,
  },
  trading: {
    label: "Trading",
    color: "from-secondary to-secondary-600",
    bgColor: "bg-gradient-to-r from-secondary/10 to-secondary/20",
    icon: <TrendingUp className="w-4 h-4" />,
  },
  analysis: {
    label: "Analysis",
    color: "from-accent to-accent-600",
    bgColor: "bg-gradient-to-r from-accent/10 to-accent/20",
    icon: <BarChart3 className="w-4 h-4" />,
  },
  ai: {
    label: "AI & Agents",
    color: "from-primary to-accent",
    bgColor: "bg-gradient-to-r from-primary/10 to-accent/20",
    icon: <Bot className="w-4 h-4" />,
  },
  mcp: {
    label: "MCP Services",
    color: "from-secondary to-primary",
    bgColor: "bg-gradient-to-r from-secondary/10 to-primary/20",
    icon: <Server className="w-4 h-4" />,
  },
  settings: {
    label: "Settings",
    color: "from-text/60 to-text/80",
    bgColor: "bg-gradient-to-r from-surface to-surface/80",
    icon: <Settings className="w-4 h-4" />,
  },
  admin: {
    label: "Admin",
    color: "from-accent to-accent-600",
    bgColor: "bg-gradient-to-r from-accent/10 to-accent/20",
    icon: <Shield className="w-4 h-4" />,
  },
  other: {
    label: "Other",
    color: "from-accent to-secondary",
    bgColor: "bg-gradient-to-r from-accent/10 to-secondary/20",
    icon: <MoreHorizontal className="w-4 h-4" />,
  },
};

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([]);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Map user role from auth context to navigation role type
  const getUserRole = (): "user" | "trader" | "admin" | "analyst" => {
    if (!user?.role) return "user";

    switch (user.role.toLowerCase()) {
      case "admin":
      case "administrator":
        return "admin";
      case "trader":
        return "trader";
      case "analyst":
        return "analyst";
      default:
        return "user";
    }
  };

  const userRole = getUserRole();

  const initializeDefaultItems = React.useCallback(() => {
    const items = defaultNavigationItems
      .map((item, index) => ({
        ...item,
        icon: iconMap[item.iconName](),
        visible:
          !item.roleRequired ||
          item.roleRequired === userRole ||
          userRole === "admin" ||
          // Show admin items when user data isn't loaded yet (temporary fix)
          (item.roleRequired === "admin" && !user),
        order: index,
      }))
      .sort((a, b) => a.order - b.order);

    setNavigationItems(items);

    const storableItems = items.map((item) => {
      const defaultItem = defaultNavigationItems.find(
        (defaultItem) => defaultItem.id === item.id,
      );
      return {
        ...item,
        icon: undefined,
        iconName: defaultItem?.iconName,
      };
    });

    // Include version to force cache refresh when navigation structure changes
    const navigationData = {
      version: "1.1", // Increment this when navigation structure changes
      items: storableItems,
    };

    localStorage.setItem("sidebar-navigation", JSON.stringify(navigationData));
  }, [userRole, user]);

  useEffect(() => {
    const savedData = localStorage.getItem("sidebar-navigation");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);

        // Check if we have new versioned format
        if (parsedData.version && parsedData.items) {
          // Check version compatibility
          if (parsedData.version !== "1.1") {
            console.warn(
              "Navigation cache version mismatch, resetting to defaults.",
            );
            initializeDefaultItems();
            return;
          }

          const parsedItems = parsedData.items;
          const isValid =
            Array.isArray(parsedItems) &&
            parsedItems.every(
              (item: any) =>
                item.iconName && iconMap[item.iconName as IconName],
            );
          if (!isValid) {
            console.warn(
              "Invalid saved navigation schema, resetting to defaults.",
            );
            initializeDefaultItems();
            return;
          }
          const itemsWithIcons = parsedItems.map((item: any) => ({
            ...item,
            icon: iconMap[item.iconName as IconName](),
          }));
          setNavigationItems(itemsWithIcons);
        } else {
          // Old format without version, reset to defaults
          console.warn(
            "Old navigation cache format detected, resetting to defaults.",
          );
          initializeDefaultItems();
        }
      } catch (error) {
        console.warn("Failed to parse saved navigation items:", error);
        initializeDefaultItems();
      }
    } else {
      initializeDefaultItems();
    }
  }, [initializeDefaultItems]);

  const saveNavigationItems = (items: NavigationItem[]) => {
    setNavigationItems(items);
    const storableItems = items.map((item) => ({
      ...item,
      icon: undefined,
      iconName: defaultNavigationItems.find(
        (defaultItem) => defaultItem.id === item.id,
      )?.iconName,
    }));

    const navigationData = {
      version: "1.1",
      items: storableItems,
    };

    localStorage.setItem("sidebar-navigation", JSON.stringify(navigationData));
  };

  const toggleItemVisibility = (itemId: string) => {
    const updatedItems = navigationItems.map((item) =>
      item.id === itemId ? { ...item, visible: !item.visible } : item,
    );
    saveNavigationItems(updatedItems);
  };

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetId) return;

    const draggedIndex = navigationItems.findIndex(
      (item) => item.id === draggedItem,
    );
    const targetIndex = navigationItems.findIndex(
      (item) => item.id === targetId,
    );

    const newItems = [...navigationItems];
    const [draggedItemData] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, draggedItemData);

    const updatedItems = newItems.map((item, index) => ({
      ...item,
      order: index,
    }));
    saveNavigationItems(updatedItems);
    setDraggedItem(null);
  };

  const isActiveLink = (path: string) => {
    return location.pathname === path;
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const resetToDefaults = () => {
    localStorage.removeItem("sidebar-navigation");
    initializeDefaultItems();
    setIsCustomizing(false);
  };

  const visibleItems = navigationItems
    .filter((item) => item.visible)
    .sort((a, b) => a.order - b.order);

  const hiddenItems = navigationItems
    .filter((item) => !item.visible)
    .sort((a, b) => a.order - b.order);

  const groupedItems = visibleItems.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, NavigationItem[]>,
  );

  const sidebarWidth = isCollapsed ? "w-16" : "w-72";

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <div
        className={cn(
          "fixed top-0 left-0 z-50 h-full",
          "bg-background/95 backdrop-blur-xl",
          "border-r border-border/50",
          "shadow-2xl shadow-black/10",
          "transform transition-all duration-300 ease-in-out",
          "lg:translate-x-0 lg:static lg:inset-0",
          sidebarWidth,
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent opacity-10" />
          <div className="relative flex items-center justify-between h-16 px-4 border-b border-border/30">
            {!isCollapsed && (
              <div
                className="flex items-center space-x-3 cursor-pointer group"
                onClick={() => handleNavigation("/dashboard")}
              >
                <div className="relative">
                  <Logo className="h-9 w-9 flex-shrink-0 transition-transform group-hover:scale-110" />
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-full opacity-20 blur-sm group-hover:opacity-30 transition-opacity" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold bg-gradient-to-r from-text to-text/70 bg-clip-text text-transparent">
                    StockPulse
                  </span>
                  <span className="text-xs text-text/60 font-medium">
                    Pro Trading Suite
                  </span>
                </div>
              </div>
            )}

            {isCollapsed && (
              <div className="flex justify-center w-full">
                <div className="relative group">
                  <Logo className="h-9 w-9 transition-transform group-hover:scale-110" />
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-full opacity-20 blur-sm group-hover:opacity-30 transition-opacity" />
                </div>
              </div>
            )}

            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleCollapse}
                className="hidden lg:flex p-2 hover:bg-surface/80 transition-all duration-200 rounded-lg"
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4 text-text/60" />
                ) : (
                  <ChevronLeft className="w-4 h-4 text-text/60" />
                )}
              </Button>

              {!isCollapsed && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCustomizing(!isCustomizing)}
                  className={cn(
                    "p-2 rounded-lg transition-all duration-200",
                    isCustomizing
                      ? "bg-accent/20 text-accent"
                      : "hover:bg-surface/80 text-text/60",
                  )}
                  title="Customize sidebar"
                >
                  {isCustomizing ? (
                    <X className="w-4 h-4" />
                  ) : (
                    <Edit3 className="w-4 h-4" />
                  )}
                </Button>
              )}

              <button
                onClick={onClose}
                className="lg:hidden p-2 rounded-lg hover:bg-surface/80 text-text/60 transition-all duration-200"
                title="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col flex-1 h-[calc(100vh-4rem)]">
          <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-text/20 scrollbar-track-transparent hover:scrollbar-thumb-text/30">
            {isCustomizing && !isCollapsed && (
              <div className="mb-6 p-4 bg-gradient-to-br from-accent/10 to-accent/20 rounded-xl border border-accent/30 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <h3 className="text-sm font-semibold text-text">
                      Customize Sidebar
                    </h3>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetToDefaults}
                    className="text-xs px-3 py-1 h-auto border-accent/30 hover:bg-accent/10"
                  >
                    Reset
                  </Button>
                </div>
                <p className="text-xs text-text/60 mb-4 leading-relaxed">
                  Drag items to reorder • Toggle visibility with switches
                </p>

                {hiddenItems.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-text/80 flex items-center">
                      <EyeOff className="w-3 h-3 mr-1" />
                      Hidden Items ({hiddenItems.length})
                    </h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-accent/30">
                      {hiddenItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-xs p-2 bg-surface/60 rounded-lg"
                        >
                          <span className="text-text/60 truncate">
                            {item.label}
                          </span>
                          <Switch
                            checked={false}
                            onCheckedChange={() =>
                              toggleItemVisibility(item.id)
                            }
                            className="scale-75"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-6">
              {Object.entries(groupedItems).map(([category, items]) => {
                const config =
                  categoryConfig[category as keyof typeof categoryConfig];
                if (!config || items.length === 0) return null;

                return (
                  <div key={category} className="space-y-2">
                    {!isCollapsed && (
                      <div
                        className={cn(
                          "flex items-center space-x-2 px-3 py-2 rounded-lg",
                          config.bgColor,
                        )}
                      >
                        <div
                          className={cn(
                            "flex items-center justify-center w-6 h-6 rounded-md bg-gradient-to-r text-white shadow-sm",
                            config.color,
                          )}
                        >
                          {config.icon}
                        </div>
                        <span className="text-xs font-semibold text-text/80 uppercase tracking-wider">
                          {config.label}
                        </span>
                        <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
                      </div>
                    )}

                    <div className="space-y-1">
                      {items.map((item) => {
                        const isActive = isActiveLink(item.path);

                        return (
                          <div
                            key={item.id}
                            draggable={isCustomizing && !isCollapsed}
                            onDragStart={(e) => handleDragStart(e, item.id)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, item.id)}
                            className={cn(
                              "group relative",
                              isCustomizing && !isCollapsed
                                ? "cursor-move"
                                : "",
                              draggedItem === item.id ? "opacity-50" : "",
                            )}
                          >
                            <div
                              onClick={() =>
                                !isCustomizing && handleNavigation(item.path)
                              }
                              className={cn(
                                "flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer relative overflow-hidden",
                                "backdrop-blur-sm",
                                isActive
                                  ? "bg-gradient-to-r from-primary to-primary-600 text-white shadow-lg shadow-primary/25 scale-[0.98] border border-primary/50"
                                  : "text-text hover:bg-surface/70 hover:shadow-md hover:scale-[0.99] border border-transparent hover:border-border/50",
                                isCustomizing && !isCollapsed
                                  ? "hover:bg-accent/10 hover:border-accent/20"
                                  : "",
                                isCollapsed ? "justify-center" : "",
                              )}
                              title={isCollapsed ? item.label : undefined}
                            >
                              {isCustomizing && !isCollapsed && (
                                <GripVertical className="w-4 h-4 mr-2 text-text/40 flex-shrink-0 opacity-60" />
                              )}

                              <div
                                className={cn(
                                  "flex-shrink-0 w-5 h-5 flex items-center justify-center transition-all duration-200",
                                  isActive
                                    ? "text-white"
                                    : "text-text/60 group-hover:text-text",
                                )}
                              >
                                {React.isValidElement(item.icon) ? (
                                  React.cloneElement(
                                    item.icon as React.ReactElement,
                                    {
                                      className: "w-5 h-5",
                                    },
                                  )
                                ) : (
                                  <Home className="w-5 h-5" />
                                )}
                              </div>

                              {!isCollapsed && (
                                <>
                                  <span className="ml-3 flex-1 text-left truncate font-medium">
                                    {item.label}
                                  </span>

                                  <div className="flex items-center space-x-2 ml-2">
                                    {item.badge && (
                                      <span
                                        className={cn(
                                          "px-2 py-0.5 text-xs rounded-full font-medium shadow-sm",
                                          isActive
                                            ? "bg-white/20 text-white"
                                            : "bg-gradient-to-r from-primary/10 to-primary/20 text-primary",
                                        )}
                                      >
                                        {item.badge}
                                      </span>
                                    )}

                                    {item.isNew && (
                                      <div className="relative">
                                        <span className="w-2 h-2 bg-gradient-to-r from-secondary to-accent rounded-full shadow-sm" />
                                        <span className="absolute inset-0 w-2 h-2 bg-gradient-to-r from-secondary to-accent rounded-full animate-ping opacity-75" />
                                      </div>
                                    )}

                                    {isCustomizing && (
                                      <Switch
                                        checked={item.visible}
                                        onCheckedChange={() =>
                                          toggleItemVisibility(item.id)
                                        }
                                        className="scale-75 flex-shrink-0"
                                      />
                                    )}
                                  </div>
                                </>
                              )}

                              {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-sm" />
                              )}

                              {isCollapsed && (
                                <div className="absolute left-full ml-3 px-3 py-2 bg-surface text-text text-sm rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 z-50 whitespace-nowrap shadow-xl">
                                  <div className="flex items-center space-x-2">
                                    <span>{item.label}</span>
                                    {item.badge && (
                                      <span className="px-1.5 py-0.5 bg-primary rounded text-xs font-medium text-white">
                                        {item.badge}
                                      </span>
                                    )}
                                  </div>
                                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-surface rotate-45" />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {isCustomizing && !isCollapsed && (
              <div className="pt-6">
                <Button
                  onClick={() => setIsCustomizing(false)}
                  className="w-full bg-gradient-to-r from-secondary to-accent hover:from-secondary-600 hover:to-accent-600 text-white shadow-lg shadow-secondary/25 transition-all duration-200 hover:scale-[0.99]"
                  size="sm"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
          </nav>

          {!isCollapsed && (
            <div className="p-4 border-t border-border/50 shrink-0 bg-gradient-to-r from-surface/50 to-surface/80">
              <div className="text-center space-y-1">
                <div className="text-xs text-text/60 font-medium">
                  StockPulse v0.1.0
                </div>
                {isCustomizing && (
                  <div className="flex items-center justify-center space-x-1 text-xs text-text/60">
                    <span>Role:</span>
                    <span className="px-2 py-0.5 bg-gradient-to-r from-primary/10 to-primary/20 text-primary rounded-full font-medium">
                      {userRole}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
