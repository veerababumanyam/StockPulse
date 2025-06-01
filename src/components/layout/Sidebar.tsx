import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  Menu,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import Logo from '../ui/Logo';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { cn } from '../../utils/cn';
import { useAuth } from '../../contexts/AuthContext';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  category: 'core' | 'trading' | 'ai' | 'mcp' | 'settings' | 'admin';
  roleRequired?: 'user' | 'trader' | 'admin' | 'analyst';
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
  'visible' | 'order' | 'icon'
> & { iconName: IconName })[] = [
  // Core
  {
    id: 'dashboard',
    label: 'Dashboard',
    iconName: 'home',
    path: '/dashboard',
    category: 'core',
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    iconName: 'briefcase',
    path: '/portfolio',
    category: 'core',
  },
  {
    id: 'screener',
    label: 'Stock Screener',
    iconName: 'search',
    path: '/screener',
    category: 'core',
  },
  {
    id: 'stock-analysis',
    label: 'Stock Analysis',
    iconName: 'pieChart',
    path: '/analysis/stocks',
    category: 'core',
    roleRequired: 'analyst',
  },

  // Trading
  {
    id: 'trading-dashboard',
    label: 'Trading Dashboard',
    iconName: 'barChart3',
    path: '/trading',
    category: 'trading',
    roleRequired: 'trader',
  },
  {
    id: 'intraday',
    label: 'Intraday Trading',
    iconName: 'clock',
    path: '/trading/intraday',
    category: 'trading',
    roleRequired: 'trader',
  },
  {
    id: 'options',
    label: 'Options Trading',
    iconName: 'target',
    path: '/trading/options',
    category: 'trading',
    roleRequired: 'trader',
  },
  {
    id: 'positional',
    label: 'Positional Trading',
    iconName: 'lineChart',
    path: '/trading/positional',
    category: 'trading',
    roleRequired: 'trader',
  },
  {
    id: 'long-term',
    label: 'Long Term Investing',
    iconName: 'trendingUp',
    path: '/trading/long-term',
    category: 'trading',
  },
  {
    id: 'workspace',
    label: 'Trading Workspace',
    iconName: 'workflow',
    path: '/trading/workspace',
    category: 'trading',
    roleRequired: 'trader',
  },

  // AI & Agents
  {
    id: 'ai-agents',
    label: 'AI Agents',
    iconName: 'bot',
    path: '/agents/ai-agents',
    category: 'ai',
  },
  {
    id: 'automation',
    label: 'Agent Automation',
    iconName: 'zap',
    path: '/agents/automation',
    category: 'ai',
  },
  {
    id: 'orchestration',
    label: 'Model Orchestration',
    iconName: 'gitBranch',
    path: '/agents/orchestration',
    category: 'ai',
  },
  {
    id: 'compliance',
    label: 'Compliance & Governance',
    iconName: 'fileCheck',
    path: '/agents/compliance',
    category: 'ai',
    roleRequired: 'admin',
  },

  // MCP Services
  {
    id: 'mcp-federation',
    label: 'MCP Federation Registry',
    iconName: 'globe',
    path: '/agents/federation',
    category: 'mcp',
    badge: 'New',
  },
  {
    id: 'mcp-setup',
    label: 'MCP Setup Wizard',
    iconName: 'settings',
    path: '/agents/setup',
    category: 'mcp',
    badge: 'New',
  },
  {
    id: 'mcp-capabilities',
    label: 'MCP Capability Mapping',
    iconName: 'map',
    path: '/agents/capabilities',
    category: 'mcp',
    badge: 'New',
  },
  {
    id: 'mcp-observability',
    label: 'MCP Observability',
    iconName: 'eye',
    path: '/agents/observability',
    category: 'mcp',
    badge: 'New',
  },
  {
    id: 'mcp-security',
    label: 'MCP Security',
    iconName: 'shield',
    path: '/agents/security',
    category: 'mcp',
    badge: 'New',
  },
  {
    id: 'mcp-mobile',
    label: 'MCP Mobile Management',
    iconName: 'smartphone',
    path: '/agents/mobile',
    category: 'mcp',
    badge: 'New',
  },

  // Settings
  {
    id: 'general-settings',
    label: 'General Settings',
    iconName: 'settings',
    path: '/settings',
    category: 'settings',
  },
  {
    id: 'api-keys',
    label: 'API Key Management',
    iconName: 'key',
    path: '/settings/api-keys',
    category: 'settings',
  },
  {
    id: 'llm-management',
    label: 'LLM Management',
    iconName: 'brain',
    path: '/settings/llm',
    category: 'settings',
  },
  {
    id: 'mcp-config',
    label: 'MCP Configuration',
    iconName: 'server',
    path: '/settings/mcp',
    category: 'settings',
  },

  // Admin
  {
    id: 'user-approval',
    label: 'User Approval',
    iconName: 'users',
    path: '/admin/user-approval',
    category: 'admin',
    roleRequired: 'admin',
  },
  {
    id: 'onboarding',
    label: 'Onboarding',
    iconName: 'userPlus',
    path: '/onboarding',
    category: 'admin',
  },
];

// Category configuration for modern styling
const categoryConfig = {
  core: {
    label: 'Core',
    icon: <Layers className="w-4 h-4" />,
  },
  trading: {
    label: 'Trading',
    icon: <TrendingUp className="w-4 h-4" />,
  },
  ai: {
    label: 'AI & Agents',
    icon: <Bot className="w-4 h-4" />,
  },
  mcp: {
    label: 'MCP Services',
    icon: <Server className="w-4 h-4" />,
  },
  settings: {
    label: 'Settings',
    icon: <Settings className="w-4 h-4" />,
  },
  admin: {
    label: 'Admin',
    icon: <Shield className="w-4 h-4" />,
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
  const [focusedItemId, setFocusedItemId] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Map user role from auth context to navigation role type
  const getUserRole = (): 'user' | 'trader' | 'admin' | 'analyst' => {
    if (!user?.role) return 'user';

    switch (user.role.toLowerCase()) {
      case 'admin':
      case 'administrator':
        return 'admin';
      case 'trader':
        return 'trader';
      case 'analyst':
        return 'analyst';
      default:
        return 'user';
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
          userRole === 'admin' ||
          // Show admin items when user data isn't loaded yet (temporary fix)
          (item.roleRequired === 'admin' && !user),
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
      version: '1.2', // Increment this when navigation structure changes
      items: storableItems,
    };

    localStorage.setItem('sidebar-navigation', JSON.stringify(navigationData));
  }, [userRole, user]);

  useEffect(() => {
    const savedData = localStorage.getItem('sidebar-navigation');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);

        // Check if we have new versioned format
        if (parsedData.version && parsedData.items) {
          // Check version compatibility
          if (parsedData.version !== '1.2') {
            console.warn(
              'Navigation cache version mismatch, resetting to defaults.',
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
              'Invalid saved navigation schema, resetting to defaults.',
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
            'Old navigation cache format detected, resetting to defaults.',
          );
          initializeDefaultItems();
        }
      } catch (error) {
        console.warn('Failed to parse saved navigation items:', error);
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
      version: '1.2',
      items: storableItems,
    };

    localStorage.setItem('sidebar-navigation', JSON.stringify(navigationData));
  };

  const toggleItemVisibility = (itemId: string) => {
    const updatedItems = navigationItems.map((item) =>
      item.id === itemId ? { ...item, visible: !item.visible } : item,
    );
    saveNavigationItems(updatedItems);
  };

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
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

  // Keyboard navigation handlers
  const handleKeyDown = (e: React.KeyboardEvent, item: NavigationItem) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!isCustomizing) {
        handleNavigation(item.path);
      }
    }
  };

  const resetToDefaults = () => {
    localStorage.removeItem('sidebar-navigation');
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

  const sidebarWidth = isCollapsed ? 'w-16' : 'w-80';

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-black/50 backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full',
          'bg-background/95 backdrop-blur-xl',
          'border-r border-border/50',
          'shadow-xl',
          'transform transition-all duration-300 ease-out',
          'lg:translate-x-0 lg:static lg:inset-0',
          sidebarWidth,
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Header */}
        <header
          className={cn(
            'relative flex items-center justify-between h-16 px-4',
            'border-b border-border/30 bg-surface/30',
          )}
        >
          {!isCollapsed && (
            <button
              className="flex items-center space-x-3 cursor-pointer group p-2 -m-2 rounded-lg transition-all duration-200 hover:bg-surface/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
              onClick={() => handleNavigation('/dashboard')}
              aria-label="Go to dashboard"
            >
              <div className="relative">
                <Logo className="h-8 w-8 flex-shrink-0 transition-transform group-hover:scale-105" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-foreground leading-tight">
                  StockPulse
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  Pro Trading Suite
                </span>
              </div>
            </button>
          )}

          {isCollapsed && (
            <div className="flex justify-center w-full">
              <button
                className="relative group p-2 rounded-lg transition-all duration-200 hover:bg-surface/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                onClick={() => handleNavigation('/dashboard')}
                aria-label="Go to dashboard"
              >
                <Logo className="h-8 w-8 transition-transform group-hover:scale-105" />
              </button>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="hidden lg:flex p-2 h-auto w-auto rounded-lg transition-all duration-200 focus:ring-2 focus:ring-primary/50"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </Button>

            {!isCollapsed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCustomizing(!isCustomizing)}
                className={cn(
                  'p-2 h-auto w-auto rounded-lg transition-all duration-200 focus:ring-2 focus:ring-primary/50',
                  isCustomizing && 'bg-accent/20 text-accent',
                )}
                aria-label={
                  isCustomizing ? 'Exit customization' : 'Customize sidebar'
                }
                aria-pressed={isCustomizing}
              >
                {isCustomizing ? (
                  <X className="w-4 h-4" />
                ) : (
                  <Edit3 className="w-4 h-4" />
                )}
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden p-2 h-auto w-auto rounded-lg transition-all duration-200 focus:ring-2 focus:ring-primary/50"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Main content */}
        <div className="flex flex-col flex-1 h-[calc(100vh-4rem)] overflow-hidden">
          {/* Customization panel */}
          {isCustomizing && !isCollapsed && (
            <div className="mx-4 mt-4 mb-2 p-4 bg-accent/5 border border-accent/20 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <h3 className="text-sm font-semibold text-foreground">
                    Customize Navigation
                  </h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetToDefaults}
                  className="text-xs h-7 px-3 border-accent/30 hover:bg-accent/10 focus:ring-2 focus:ring-accent/50"
                >
                  Reset
                </Button>
              </div>

              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                Drag items to reorder • Toggle visibility with switches
              </p>

              {hiddenItems.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-foreground flex items-center">
                    <EyeOff className="w-3 h-3 mr-1.5" />
                    Hidden Items ({hiddenItems.length})
                  </h4>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {hiddenItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-xs p-2 bg-surface/60 rounded-lg"
                      >
                        <span className="text-muted-foreground truncate">
                          {item.label}
                        </span>
                        <Switch
                          checked={false}
                          onCheckedChange={() => toggleItemVisibility(item.id)}
                          className="scale-75"
                          aria-label={`Show ${item.label}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <nav
            className="flex-1 px-4 py-2 overflow-y-auto"
            role="list"
            aria-label="Navigation items"
          >
            <div className="space-y-6">
              {Object.entries(groupedItems).map(([category, items]) => {
                const config =
                  categoryConfig[category as keyof typeof categoryConfig];
                if (!config || items.length === 0) return null;

                return (
                  <div
                    key={category}
                    className="space-y-2"
                    role="group"
                    aria-labelledby={`category-${category}`}
                  >
                    {/* Category header */}
                    {!isCollapsed && (
                      <div
                        className="flex items-center space-x-3 px-4 py-3 mb-2 bg-muted/50 border border-border/30 rounded-lg"
                        id={`category-${category}`}
                      >
                        <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-foreground text-background">
                          {config.icon}
                        </div>
                        <span className="text-sm font-bold text-foreground uppercase tracking-wider">
                          {config.label}
                        </span>
                        <div className="flex-1 h-px bg-border/50" />
                      </div>
                    )}

                    {/* Navigation items */}
                    <div className="space-y-2 px-1">
                      {items.map((item) => {
                        const isActive = isActiveLink(item.path);
                        const isFocused = focusedItemId === item.id;

                        return (
                          <div
                            key={item.id}
                            draggable={isCustomizing && !isCollapsed}
                            onDragStart={(e) => handleDragStart(e, item.id)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, item.id)}
                            className={cn(
                              'relative group',
                              isCustomizing && !isCollapsed && 'cursor-move',
                              draggedItem === item.id && 'opacity-50 scale-95',
                            )}
                            role="listitem"
                          >
                            <div
                              onClick={() =>
                                !isCustomizing && handleNavigation(item.path)
                              }
                              onKeyDown={(e) => handleKeyDown(e, item)}
                              onFocus={() => setFocusedItemId(item.id)}
                              onBlur={() => setFocusedItemId(null)}
                              tabIndex={0}
                              role="button"
                              aria-label={`Navigate to ${item.label}${item.badge ? ` (${item.badge})` : ''}`}
                              aria-current={isActive ? 'page' : undefined}
                              className={cn(
                                'flex items-center w-full px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer relative overflow-hidden min-h-[44px]',
                                'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1',
                                isActive
                                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-[0.98] border-2 border-primary/30'
                                  : cn(
                                      'text-foreground border-2 border-transparent bg-background/50',
                                      'hover:bg-muted hover:text-foreground hover:border-border hover:shadow-md hover:scale-[0.99] hover:bg-muted/80',
                                      'active:scale-[0.97] active:bg-muted',
                                      'transition-all duration-150 ease-out',
                                    ),
                                isCustomizing &&
                                  !isCollapsed &&
                                  'hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive-foreground',
                                isCollapsed && 'justify-center px-2',
                                isFocused &&
                                  !isActive &&
                                  'ring-2 ring-primary/40 bg-muted/70 border-primary/20',
                                draggedItem === item.id &&
                                  'shadow-xl shadow-primary/20',
                              )}
                            >
                              {/* Drag handle */}
                              {isCustomizing && !isCollapsed && (
                                <GripVertical
                                  className="w-4 h-4 mr-3 text-muted-foreground opacity-60"
                                  aria-hidden="true"
                                />
                              )}

                              {/* Icon */}
                              <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                                {React.isValidElement(item.icon) ? (
                                  React.cloneElement(
                                    item.icon as React.ReactElement,
                                    {
                                      className: 'w-5 h-5',
                                      'aria-hidden': true,
                                    },
                                  )
                                ) : (
                                  <Home
                                    className="w-5 h-5"
                                    aria-hidden="true"
                                  />
                                )}
                              </div>

                              {/* Label and badges */}
                              {!isCollapsed && (
                                <>
                                  <span className="ml-3 flex-1 text-left truncate font-medium">
                                    {item.label}
                                  </span>

                                  <div className="flex items-center space-x-2 ml-2">
                                    {item.badge && (
                                      <span
                                        className={cn(
                                          'px-2 py-0.5 text-xs rounded-full font-semibold',
                                          isActive
                                            ? 'bg-primary-foreground/20 text-primary-foreground'
                                            : 'bg-accent text-accent-foreground',
                                        )}
                                        aria-label={`Badge: ${item.badge}`}
                                      >
                                        {item.badge}
                                      </span>
                                    )}

                                    {item.isNew && (
                                      <div
                                        className="relative"
                                        aria-label="New feature"
                                      >
                                        <span className="w-2 h-2 bg-accent rounded-full" />
                                        <span className="absolute inset-0 w-2 h-2 bg-accent rounded-full animate-ping opacity-75" />
                                      </div>
                                    )}

                                    {isCustomizing && (
                                      <Switch
                                        checked={item.visible}
                                        onCheckedChange={() =>
                                          toggleItemVisibility(item.id)
                                        }
                                        className="scale-75 flex-shrink-0"
                                        aria-label={`Toggle visibility of ${item.label}`}
                                      />
                                    )}
                                  </div>
                                </>
                              )}

                              {/* Active indicator */}
                              {isActive && (
                                <div
                                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-foreground rounded-r-full"
                                  aria-hidden="true"
                                />
                              )}

                              {/* Tooltip for collapsed state */}
                              {isCollapsed && (
                                <div className="absolute left-full ml-3 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 z-50 whitespace-nowrap shadow-xl border border-border">
                                  <div className="flex items-center space-x-2">
                                    <span>{item.label}</span>
                                    {item.badge && (
                                      <span className="px-1.5 py-0.5 bg-accent rounded text-xs font-medium text-accent-foreground">
                                        {item.badge}
                                      </span>
                                    )}
                                  </div>
                                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-popover rotate-45 border-l border-t border-border" />
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

            {/* Save button for customization */}
            {isCustomizing && !isCollapsed && (
              <div className="pt-6">
                <Button
                  onClick={() => setIsCustomizing(false)}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 focus:ring-2 focus:ring-primary/50"
                  size="sm"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
          </nav>

          {/* Footer */}
          {!isCollapsed && (
            <footer className="p-4 border-t border-border/30 bg-surface/30">
              <div className="text-center space-y-1">
                <div className="text-xs text-muted-foreground font-medium">
                  StockPulse v0.2.1
                </div>
                {isCustomizing && (
                  <div className="flex items-center justify-center space-x-1 text-xs text-muted-foreground">
                    <span>Role:</span>
                    <span className="px-2 py-0.5 bg-accent/20 text-accent rounded-full font-medium">
                      {userRole}
                    </span>
                  </div>
                )}
              </div>
            </footer>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
