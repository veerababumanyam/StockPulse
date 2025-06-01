/**
 * AI Insights Widget - Merged & Enhanced Version
 * Combines the best of both implementations with performance optimizations
 */

import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  RefreshCw,
  ChevronRight,
  Activity,
  Clock,
  Filter,
  Sparkles,
  MessageSquare,
  Mic,
  Volume2,
  Target,
  AlertCircle,
  Info,
  Shield,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { ScrollArea } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '../ui/dropdown-menu';
import { cn } from '../../utils/theme/tailwind';
import { apiClient } from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';
import { formatDate, formatTimeAgo } from '../../utils/common/format';
import { debounce } from '../../utils/common/debounce';

// Types
interface AIInsightsWidgetProps {
  widgetId: string;
  className?: string;
  showHeader?: boolean;
  config?: {
    count?: number;
    refreshInterval?: number;
    enableRealTimeUpdates?: boolean;
    enableVoiceControl?: boolean;
    enableFiltering?: boolean;
  };
}

interface AIInsight {
  id: string;
  title: string;
  content: string;
  summary?: string;
  type: 'opportunity' | 'warning' | 'recommendation' | 'analysis';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  category: string;
  actionable: boolean;
  timestamp: Date;
  sentiment?: 'positive' | 'negative' | 'neutral' | 'mixed';
  referenceSymbol?: string;
  source?: string;
  tags?: string[];
  agentId?: string;
}

interface FilterState {
  types: string[];
  priorities: string[];
  sentiments: string[];
  showActionableOnly: boolean;
}

// Constants
const PRIORITY_CONFIG = {
  LOW: { color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900', weight: 1 },
  MEDIUM: { color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900', weight: 2 },
  HIGH: { color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900', weight: 3 },
  CRITICAL: { color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900', weight: 4 },
};

const TYPE_CONFIG = {
  opportunity: { icon: TrendingUp, color: 'text-green-600' },
  warning: { icon: AlertTriangle, color: 'text-orange-600' },
  recommendation: { icon: Lightbulb, color: 'text-blue-600' },
  analysis: { icon: Brain, color: 'text-purple-600' },
};

const SENTIMENT_CONFIG = {
  positive: { icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
  negative: { icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
  neutral: { icon: Activity, color: 'text-gray-600', bg: 'bg-gray-50 dark:bg-gray-900/20' },
  mixed: { icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
};

// Helper components
const InsightSkeleton = memo(() => (
  <div className="space-y-3">
    {[...Array(3)].map((_, i) => (
      <Skeleton key={i} className="h-24 rounded-lg" />
    ))}
  </div>
));

const ConfidenceIndicator = memo(({ confidence }: { confidence: number }) => {
  const percentage = Math.round(confidence * 100);
  const color = percentage >= 80 ? 'bg-green-500' : percentage >= 60 ? 'bg-yellow-500' : 'bg-orange-500';
  
  return (
    <div className="flex items-center gap-2">
      <Progress value={percentage} className="h-1 w-12" />
      <span className="text-xs font-medium">{percentage}%</span>
    </div>
  );
});

// Main component
const AIInsightsWidget: React.FC<AIInsightsWidgetProps> = memo(({
  widgetId,
  className,
  showHeader = true,
  config = {},
}) => {
  const { isDarkMode } = useTheme();
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    types: [],
    priorities: [],
    sentiments: [],
    showActionableOnly: false,
  });

  // Configuration
  const insightCount = config.count || 5;
  const refreshInterval = config.refreshInterval || 60000;
  const enableRealTime = config.enableRealTimeUpdates ?? true;
  const enableFiltering = config.enableFiltering ?? true;

  // Fetch insights from API
  const fetchInsights = useCallback(async (silent = false) => {
    if (!silent) {
      setIsLoading(true);
      setError(null);
    }
    
    try {
      const response = await apiClient.getAIInsightsData(insightCount);
      if (response.success && response.data) {
        // Transform API data to match our interface
        const transformedInsights: AIInsight[] = response.data.insights.map((insight: any) => ({
          id: insight.id,
          title: insight.title,
          content: insight.summary,
          summary: insight.summary,
          type: mapInsightType(insight.insightType),
          priority: determinePriority(insight),
          confidence: insight.confidenceScore || 0.75,
          category: insight.insightType,
          actionable: determineActionability(insight),
          timestamp: new Date(insight.timestamp),
          sentiment: insight.sentiment,
          referenceSymbol: insight.referenceSymbol,
          source: insight.source,
          tags: insight.tags,
          agentId: insight.agentId,
        }));
        
        setInsights(transformedInsights);
      }
    } catch (err: any) {
      console.error(`[${widgetId}] Error fetching insights:`, err);
      setError(err.message || 'Failed to load insights');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [widgetId, insightCount]);

  // Helper functions
  const mapInsightType = (apiType: string): AIInsight['type'] => {
    const typeMap: Record<string, AIInsight['type']> = {
      'market_trend': 'analysis',
      'stock_signal': 'opportunity',
      'portfolio_tip': 'recommendation',
      'risk_alert': 'warning',
      'economic_event': 'analysis',
      'news_summary': 'analysis',
    };
    return typeMap[apiType] || 'analysis';
  };

  const determinePriority = (insight: any): AIInsight['priority'] => {
    if (insight.insightType === 'risk_alert') return 'CRITICAL';
    if (insight.sentiment === 'negative' && insight.confidenceScore > 0.8) return 'HIGH';
    if (insight.confidenceScore > 0.9) return 'HIGH';
    if (insight.confidenceScore > 0.7) return 'MEDIUM';
    return 'LOW';
  };

  const determineActionability = (insight: any): boolean => {
    const actionableTypes = ['stock_signal', 'portfolio_tip', 'risk_alert'];
    return actionableTypes.includes(insight.insightType) && insight.confidenceScore > 0.7;
  };

  // Initial load and refresh interval
  useEffect(() => {
    fetchInsights();
    
    if (refreshInterval > 0) {
      const interval = setInterval(() => fetchInsights(true), refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchInsights, refreshInterval]);

  // WebSocket for real-time updates
  useEffect(() => {
    if (!enableRealTime) return;

    // This is a placeholder for WebSocket integration
    // In production, you'd connect to your WebSocket service
    const mockRealtimeUpdate = () => {
      // Simulate occasional real-time updates
      const shouldUpdate = Math.random() > 0.8;
      if (shouldUpdate && insights.length > 0) {
        const newInsight: AIInsight = {
          id: `rt-${Date.now()}`,
          title: 'Real-time Market Alert',
          content: 'New market movement detected',
          type: 'opportunity',
          priority: 'HIGH',
          confidence: 0.85,
          category: 'Real-time',
          actionable: true,
          timestamp: new Date(),
          sentiment: 'positive',
        };
        
        setInsights(prev => [newInsight, ...prev.slice(0, -1)]);
      }
    };

    const rtInterval = setInterval(mockRealtimeUpdate, 10000);
    return () => clearInterval(rtInterval);
  }, [enableRealTime, insights.length]);

  // Handlers
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchInsights();
  }, [fetchInsights]);

  const debouncedRefresh = useMemo(
    () => debounce(handleRefresh, 1000),
    [handleRefresh]
  );

  const handleFilterChange = useCallback((filterType: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  }, []);

  // Filtered insights
  const filteredInsights = useMemo(() => {
    return insights.filter(insight => {
      if (filters.types.length > 0 && !filters.types.includes(insight.type)) {
        return false;
      }
      if (filters.priorities.length > 0 && !filters.priorities.includes(insight.priority)) {
        return false;
      }
      if (filters.sentiments.length > 0 && insight.sentiment && !filters.sentiments.includes(insight.sentiment)) {
        return false;
      }
      if (filters.showActionableOnly && !insight.actionable) {
        return false;
      }
      return true;
    });
  }, [insights, filters]);

  // Sort insights by priority and timestamp
  const sortedInsights = useMemo(() => {
    return [...filteredInsights].sort((a, b) => {
      const priorityDiff = PRIORITY_CONFIG[b.priority].weight - PRIORITY_CONFIG[a.priority].weight;
      if (priorityDiff !== 0) return priorityDiff;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  }, [filteredInsights]);

  // Render functions
  const renderInsight = useCallback((insight: AIInsight, index: number) => {
    const IconComponent = TYPE_CONFIG[insight.type].icon;
    const isSelected = selectedInsight === insight.id;
    const sentimentConfig = insight.sentiment ? SENTIMENT_CONFIG[insight.sentiment] : null;

    return (
      <motion.div
        key={insight.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ delay: index * 0.05 }}
        className={cn(
          'p-3 rounded-lg border cursor-pointer transition-all',
          sentimentConfig?.bg || 'bg-background',
          isSelected ? 'border-primary ring-2 ring-primary/20' : 'hover:bg-muted/50',
          insight.priority === 'CRITICAL' && 'border-red-500'
        )}
        onClick={() => setSelectedInsight(isSelected ? null : insight.id)}
      >
        {/* Priority indicator for critical items */}
        {insight.priority === 'CRITICAL' && (
          <div className="absolute -top-2 -right-2">
            <Badge variant="destructive" className="text-xs animate-pulse">
              <AlertCircle className="h-3 w-3 mr-1" />
              Critical
            </Badge>
          </div>
        )}

        <div className="flex items-start space-x-3">
          <div className={cn('p-1.5 rounded-full bg-muted', TYPE_CONFIG[insight.type].color)}>
            <IconComponent className="h-3 w-3" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-medium truncate">{insight.title}</h4>
              <ChevronRight className={cn(
                'h-3 w-3 transition-transform flex-shrink-0',
                isSelected && 'rotate-90'
              )} />
            </div>

            <div className="flex items-center space-x-2 mb-2">
              <Badge
                variant="secondary"
                className={cn('text-xs px-1 py-0', PRIORITY_CONFIG[insight.priority].bg)}
              >
                {insight.priority}
              </Badge>
              {insight.sentiment && (
                <Badge variant="outline" className="text-xs px-1 py-0">
                  {insight.sentiment}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {insight.category}
              </span>
              {insight.referenceSymbol && (
                <Badge variant="outline" className="text-xs px-1 py-0">
                  {insight.referenceSymbol}
                </Badge>
              )}
            </div>

            <AnimatePresence>
              {isSelected && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <p className="text-xs text-muted-foreground mb-3">
                    {insight.content}
                  </p>

                  <div className="space-y-2">
                    {/* Confidence Score */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Confidence</span>
                      <ConfidenceIndicator confidence={insight.confidence} />
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatTimeAgo(insight.timestamp)}</span>
                      {insight.source && <span>Source: {insight.source}</span>}
                    </div>

                    {/* Tags */}
                    {insight.tags && insight.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-2">
                        {insight.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Action Button */}
                    {insight.actionable && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-7 text-xs mt-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Taking action on insight:', insight.id);
                        }}
                      >
                        <Target className="h-3 w-3 mr-1" />
                        Take Action
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!isSelected && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <div className="w-1 h-1 rounded-full bg-primary" />
                    <span className="text-xs text-muted-foreground">
                      {Math.round(insight.confidence * 100)}% confidence
                    </span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatTimeAgo(insight.timestamp)}
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }, [selectedInsight]);

  // Loading state
  if (isLoading) {
    return (
      <Card className={cn('h-full flex flex-col', className)}>
        {showHeader && (
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Brain className="h-4 w-4 mr-2" />
              AI Insights
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className="flex-1">
          <InsightSkeleton />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={cn('h-full flex flex-col', className)}>
        {showHeader && (
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center text-red-600">
              <AlertCircle className="h-4 w-4 mr-2" />
              AI Insights
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className="flex-1 flex flex-col items-center justify-center text-center">
          <AlertCircle className="h-8 w-8 text-red-600 mb-2" />
          <p className="text-sm text-muted-foreground mb-2">{error}</p>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-3 w-3 mr-1" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Main render
  return (
    <Card className={cn('h-full flex flex-col', className)}>
      {showHeader && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-medium flex items-center">
                <Brain className="h-4 w-4 mr-2" />
                AI Insights
                {enableRealTime && (
                  <div className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                )}
              </CardTitle>
              <CardDescription className="text-xs">
                {sortedInsights.length} insights available
              </CardDescription>
            </div>
            <div className="flex items-center gap-1">
              {/* Filter dropdown */}
              {enableFiltering && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-xs"
                    >
                      <Filter className="h-3 w-3 mr-1" />
                      Filter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Filter Insights</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuLabel className="text-xs">By Type</DropdownMenuLabel>
                    {Object.keys(TYPE_CONFIG).map(type => (
                      <DropdownMenuCheckboxItem
                        key={type}
                        checked={filters.types.includes(type)}
                        onCheckedChange={(checked: boolean) => {
                          const newTypes = checked
                            ? [...filters.types, type]
                            : filters.types.filter(t => t !== type);
                          handleFilterChange('types', newTypes);
                        }}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </DropdownMenuCheckboxItem>
                    ))}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                      checked={filters.showActionableOnly}
                      onCheckedChange={(checked: boolean) => handleFilterChange('showActionableOnly', checked)}
                    >
                      Actionable Only
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              {/* Refresh button */}
              <Button
                variant="outline"
                size="sm"
                onClick={debouncedRefresh}
                disabled={isRefreshing}
                className="h-6 px-2 text-xs"
              >
                <RefreshCw className={cn('h-3 w-3', isRefreshing && 'animate-spin')} />
              </Button>
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent className="flex-1 space-y-3 overflow-hidden">
        {/* Insights List */}
        <ScrollArea className="h-full pr-3">
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {sortedInsights.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-8 text-center"
                >
                  <Brain className="h-8 w-8 text-muted-foreground mb-2 opacity-50" />
                  <p className="text-sm text-muted-foreground">
                    {insights.length === 0 ? 'No insights available' : 'No insights match your filters'}
                  </p>
                  {insights.length > 0 && filters.types.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters({
                        types: [],
                        priorities: [],
                        sentiments: [],
                        showActionableOnly: false,
                      })}
                      className="mt-2"
                    >
                      Clear Filters
                    </Button>
                  )}
                </motion.div>
              ) : (
                sortedInsights.map((insight, index) => renderInsight(insight, index))
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>

        {/* Summary Stats */}
        {insights.length > 0 && (
          <div className="pt-2 border-t">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs font-medium">
                  {insights.filter(i => i.priority === 'HIGH' || i.priority === 'CRITICAL').length}
                </p>
                <p className="text-xs text-muted-foreground">High Priority</p>
              </div>
              <div>
                <p className="text-xs font-medium">
                  {insights.filter(i => i.actionable).length}
                </p>
                <p className="text-xs text-muted-foreground">Actionable</p>
              </div>
              <div>
                <p className="text-xs font-medium">
                  {Math.round(insights.reduce((acc, i) => acc + i.confidence, 0) / insights.length * 100)}%
                </p>
                <p className="text-xs text-muted-foreground">Avg Confidence</p>
              </div>
            </div>
          </div>
        )}

        {/* AI Status */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">AI Analysis</span>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-green-600 font-medium">Active</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

AIInsightsWidget.displayName = 'AIInsightsWidget';

export default AIInsightsWidget;
