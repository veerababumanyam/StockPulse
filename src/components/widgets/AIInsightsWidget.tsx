/**
 * AI Insights Widget - Enhanced for Market Research Agent Integration
 * Integrates with A2A Market Research Agent via backend API
 */

import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
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
  Send,
  Loader2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { ScrollArea } from "../ui/scroll-area";
import { Skeleton } from "../ui/skeleton";
import { Input } from "../ui/input";
import { Alert, AlertDescription } from "../ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "../ui/dropdown-menu";
import { cn } from "../../utils/theme/tailwind";
import { aiAgentService } from "../../services/aiAgentService";
import { useTheme } from "../../contexts/ThemeContext";
import { formatDate, formatTimeAgo } from "../../utils/common/format";
import { debounce } from "../../utils/common/debounce";

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
    enableNLQ?: boolean;
  };
}

interface AIInsight {
  id: string;
  title: string;
  content: string;
  summary?: string;
  type: "opportunity" | "warning" | "recommendation" | "analysis";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  confidence: number;
  category: string;
  actionable: boolean;
  timestamp: Date;
  sentiment?: "positive" | "negative" | "neutral" | "mixed";
  referenceSymbol?: string;
  source?: string;
  tags?: string[];
  agentId?: string;
  agUiComponents?: Array<{
    type: string;
    props: Record<string, any>;
  }>;
}

interface NLQResponse {
  answer: string;
  sources: Array<{
    title: string;
    url?: string;
    snippet?: string;
  }>;
  confidence: number;
  agUiComponents?: Array<{
    type: string;
    props: Record<string, any>;
  }>;
  followUpQuestions: string[];
}

interface FilterState {
  types: string[];
  priorities: string[];
  sentiments: string[];
  showActionableOnly: boolean;
}

// Constants
const PRIORITY_CONFIG = {
  LOW: {
    color: "text-blue-600",
    bg: "bg-blue-100 dark:bg-blue-900",
    weight: 1,
  },
  MEDIUM: {
    color: "text-yellow-600",
    bg: "bg-yellow-100 dark:bg-yellow-900",
    weight: 2,
  },
  HIGH: {
    color: "text-orange-600",
    bg: "bg-orange-100 dark:bg-orange-900",
    weight: 3,
  },
  CRITICAL: {
    color: "text-red-600",
    bg: "bg-red-100 dark:bg-red-900",
    weight: 4,
  },
};

const TYPE_CONFIG = {
  opportunity: { icon: TrendingUp, color: "text-green-600" },
  warning: { icon: AlertTriangle, color: "text-orange-600" },
  recommendation: { icon: Lightbulb, color: "text-blue-600" },
  analysis: { icon: Brain, color: "text-purple-600" },
};

const SENTIMENT_CONFIG = {
  positive: {
    icon: TrendingUp,
    color: "text-green-600",
    bg: "bg-green-50 dark:bg-green-900/20",
  },
  negative: {
    icon: TrendingDown,
    color: "text-red-600",
    bg: "bg-red-50 dark:bg-red-900/20",
  },
  neutral: {
    icon: Activity,
    color: "text-gray-600",
    bg: "bg-gray-50 dark:bg-gray-900/20",
  },
  mixed: {
    icon: Zap,
    color: "text-yellow-600",
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
  },
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
  const color =
    percentage >= 80
      ? "bg-green-500"
      : percentage >= 60
        ? "bg-yellow-500"
        : "bg-orange-500";

  return (
    <div className="flex items-center gap-2">
      <Progress value={percentage} className="h-1 w-12" />
      <span className="text-xs font-medium">{percentage}%</span>
    </div>
  );
});

// Natural Language Query Component
const NLQInterface = memo(({
  onQuery,
  isLoading,
  response,
  onClear
}: {
  onQuery: (query: string) => void;
  isLoading: boolean;
  response: NLQResponse | null;
  onClear: () => void;
}) => {
  const [query, setQuery] = useState("");
  const [canSubmit, setCanSubmit] = useState(true);

  const handleSubmit = useCallback(() => {
    if (!query.trim() || isLoading || !canSubmit) return;
    
    // Check rate limit
    if (!aiAgentService.checkNLQRateLimit()) {
      alert("Rate limit exceeded. Please wait before making another query.");
      return;
    }
    
    onQuery(query.trim());
    setQuery("");
    setCanSubmit(false);
    
    // Re-enable after 1 second to prevent spam
    setTimeout(() => setCanSubmit(true), 1000);
  }, [query, isLoading, canSubmit, onQuery]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Ask the Market Research Agent
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Ask a financial question (e.g., 'What caused the market dip yesterday?')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={handleSubmit}
            disabled={!query.trim() || isLoading || !canSubmit}
            size="sm"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {response && (
          <div className="mt-3 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-sm">Agent Response</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClear}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {response.answer}
            </p>
            <div className="flex items-center gap-2 mb-2">
              <ConfidenceIndicator confidence={response.confidence} />
              <span className="text-xs text-muted-foreground">
                Confidence
              </span>
            </div>
            {response.sources.length > 0 && (
              <div className="mb-2">
                <p className="text-xs font-medium mb-1">Sources:</p>
                <div className="space-y-1">
                  {response.sources.map((source, idx) => (
                    <div key={idx} className="text-xs text-muted-foreground">
                      • {source.title}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {response.followUpQuestions.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-1">Follow-up questions:</p>
                <div className="flex flex-wrap gap-1">
                  {response.followUpQuestions.map((question, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      className="text-xs h-6"
                      onClick={() => onQuery(question)}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

// Main component
const AIInsightsWidget: React.FC<AIInsightsWidgetProps> = memo(
  ({ widgetId, className, showHeader = true, config = {} }) => {
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
    
    // NLQ state
    const [nlqResponse, setNlqResponse] = useState<NLQResponse | null>(null);
    const [isNlqLoading, setIsNlqLoading] = useState(false);
    const [showNlqInterface, setShowNlqInterface] = useState(false);

    // Configuration
    const insightCount = config.count || 5;
    const refreshInterval = config.refreshInterval || 60000;
    const enableRealTime = config.enableRealTimeUpdates ?? true;
    const enableFiltering = config.enableFiltering ?? true;
    const enableNLQ = config.enableNLQ ?? true;

    // Get current user ID (from auth context or localStorage)
    const getCurrentUserId = useCallback(() => {
      // This should come from your auth context
      return localStorage.getItem('userId') || 'anonymous';
    }, []);

    // Fetch insights from Market Research Agent
    const fetchInsights = useCallback(
      async (silent = false) => {
        if (!silent) {
          setIsLoading(true);
          setError(null);
        }

        try {
          const response = await aiAgentService.generateInsights({
            user_id: getCurrentUserId(),
            count: insightCount,
            context: {
              widget_id: widgetId,
              dashboard_context: "main_dashboard"
            }
          });

          if (response.success && response.data) {
            // Transform API data to match our interface
            const transformedInsights: AIInsight[] = response.data.insights.map(
              (insight: any) => ({
                id: insight.id,
                title: insight.title,
                content: insight.content || insight.summary,
                summary: insight.summary,
                type: mapInsightType(insight.insight_type),
                priority: insight.priority as AIInsight["priority"],
                confidence: insight.confidence || 0.75,
                category: insight.insight_type,
                actionable: insight.actionable,
                timestamp: new Date(insight.timestamp),
                sentiment: insight.sentiment,
                referenceSymbol: insight.reference_symbol,
                source: insight.source,
                tags: insight.tags || [],
                agentId: insight.agent_id,
                agUiComponents: insight.ag_ui_components,
              }),
            );

            setInsights(transformedInsights);
          }
        } catch (err: any) {
          console.error(`[${widgetId}] Error fetching insights:`, err);
          setError(err.message || "Failed to load insights");
        } finally {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      },
      [widgetId, insightCount, getCurrentUserId],
    );

    // Process Natural Language Query
    const handleNLQuery = useCallback(async (query: string) => {
      setIsNlqLoading(true);
      try {
        const response = await aiAgentService.processNaturalLanguageQuery({
          query,
          user_id: getCurrentUserId(),
          context: {
            widget_id: widgetId,
            current_insights: insights.slice(0, 3).map(i => i.title)
          }
        });

        if (response.success && response.data) {
          setNlqResponse({
            answer: response.data.answer,
            sources: response.data.sources,
            confidence: response.data.confidence,
            agUiComponents: response.data.ag_ui_components,
            followUpQuestions: response.data.follow_up_questions
          });
        }
      } catch (err: any) {
        console.error(`[${widgetId}] Error processing NLQ:`, err);
        setError(err.message || "Failed to process query");
      } finally {
        setIsNlqLoading(false);
      }
    }, [widgetId, getCurrentUserId, insights]);

    // Helper functions
    const mapInsightType = (apiType: string): AIInsight["type"] => {
      const typeMap: Record<string, AIInsight["type"]> = {
        market_trend: "analysis",
        stock_signal: "opportunity",
        portfolio_tip: "recommendation",
        risk_alert: "warning",
        economic_event: "analysis",
        news_summary: "analysis",
        opportunity: "opportunity",
        warning: "warning",
        recommendation: "recommendation",
        analysis: "analysis",
      };
      return typeMap[apiType] || "analysis";
    };

    // Real-time WebSocket updates
    useEffect(() => {
      if (!enableRealTime) return;

      const handleInsightsUpdate = (newInsights: any[]) => {
        const transformedInsights = newInsights.map(insight => ({
          id: insight.id,
          title: insight.title,
          content: insight.content || insight.summary,
          summary: insight.summary,
          type: mapInsightType(insight.insight_type),
          priority: insight.priority as AIInsight["priority"],
          confidence: insight.confidence || 0.75,
          category: insight.insight_type,
          actionable: insight.actionable,
          timestamp: new Date(insight.timestamp),
          sentiment: insight.sentiment,
          referenceSymbol: insight.reference_symbol,
          source: insight.source,
          tags: insight.tags || [],
          agentId: insight.agent_id,
          agUiComponents: insight.ag_ui_components,
        }));

        setInsights(prev => {
          // Merge new insights with existing ones, avoiding duplicates
          const existingIds = new Set(prev.map(i => i.id));
          const newUniqueInsights = transformedInsights.filter(i => !existingIds.has(i.id));
          return [...newUniqueInsights, ...prev].slice(0, insightCount);
        });
      };

      aiAgentService.subscribeToInsights(handleInsightsUpdate);

      return () => {
        aiAgentService.unsubscribeFromInsights(handleInsightsUpdate);
      };
    }, [enableRealTime, insightCount]);

    // Initial load and refresh interval
    useEffect(() => {
      fetchInsights();

      if (refreshInterval > 0) {
        const interval = setInterval(
          () => fetchInsights(true),
          refreshInterval,
        );
        return () => clearInterval(interval);
      }
    }, [fetchInsights, refreshInterval]);

    // Handlers
    const handleRefresh = useCallback(async () => {
      setIsRefreshing(true);
      await fetchInsights();
    }, [fetchInsights]);

    const debouncedRefresh = useMemo(
      () => debounce(handleRefresh, 1000),
      [handleRefresh],
    );

    const handleFilterChange = useCallback(
      (filterType: keyof FilterState, value: any) => {
        setFilters((prev) => ({ ...prev, [filterType]: value }));
      },
      [],
    );

    // Filtered insights
    const filteredInsights = useMemo(() => {
      return insights.filter((insight) => {
        if (filters.types.length > 0 && !filters.types.includes(insight.type)) {
          return false;
        }
        if (
          filters.priorities.length > 0 &&
          !filters.priorities.includes(insight.priority)
        ) {
          return false;
        }
        if (
          filters.sentiments.length > 0 &&
          insight.sentiment &&
          !filters.sentiments.includes(insight.sentiment)
        ) {
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
        const priorityDiff =
          PRIORITY_CONFIG[b.priority].weight -
          PRIORITY_CONFIG[a.priority].weight;
        if (priorityDiff !== 0) return priorityDiff;
        return b.timestamp.getTime() - a.timestamp.getTime();
      });
    }, [filteredInsights]);

    // Render functions
    const renderInsight = useCallback(
      (insight: AIInsight, index: number) => {
        const IconComponent = TYPE_CONFIG[insight.type].icon;
        const isSelected = selectedInsight === insight.id;
        const sentimentConfig = insight.sentiment
          ? SENTIMENT_CONFIG[insight.sentiment]
          : null;

        return (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              "p-3 rounded-lg border cursor-pointer transition-all",
              sentimentConfig?.bg || "bg-background",
              isSelected
                ? "border-primary ring-2 ring-primary/20"
                : "hover:bg-muted/50",
              insight.priority === "CRITICAL" && "border-red-500",
            )}
            onClick={() => setSelectedInsight(isSelected ? null : insight.id)}
          >
            {/* Priority indicator for critical items */}
            {insight.priority === "CRITICAL" && (
              <div className="absolute -top-2 -right-2">
                <Badge variant="destructive" className="text-xs animate-pulse">
                  CRITICAL
                </Badge>
              </div>
            )}

            <div className="flex items-start gap-3">
              <div className={cn("p-1.5 rounded", PRIORITY_CONFIG[insight.priority].bg)}>
                <IconComponent 
                  className={cn("h-4 w-4", TYPE_CONFIG[insight.type].color)} 
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-medium text-sm truncate">
                    {insight.title}
                  </h4>
                  <div className="flex items-center gap-1 ml-2">
                    <ConfidenceIndicator confidence={insight.confidence} />
                    {insight.actionable && (
                      <Target className="h-3 w-3 text-green-600" />
                    )}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {insight.content}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {insight.category}
                    </Badge>
                    {insight.sentiment && (
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs", SENTIMENT_CONFIG[insight.sentiment].color)}
                      >
                        {insight.sentiment}
                      </Badge>
                    )}
                    {insight.referenceSymbol && (
                      <Badge variant="secondary" className="text-xs">
                        {insight.referenceSymbol}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatTimeAgo(insight.timestamp)}
                  </div>
                </div>

                {isSelected && insight.agUiComponents && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 pt-3 border-t"
                  >
                    <p className="text-sm mb-2">Additional Details:</p>
                    <div className="space-y-2">
                      {insight.agUiComponents.map((component, idx) => (
                        <div key={idx} className="p-2 bg-muted/50 rounded text-xs">
                          <strong>{component.type}:</strong> {JSON.stringify(component.props)}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              <ChevronRight 
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform",
                  isSelected && "rotate-90"
                )} 
              />
            </div>
          </motion.div>
        );
      },
      [selectedInsight],
    );

    if (isLoading) {
      return (
        <Card className={className}>
          {showHeader && (
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Market Insights
              </CardTitle>
            </CardHeader>
          )}
          <CardContent>
            <InsightSkeleton />
          </CardContent>
        </Card>
      );
    }

    if (error) {
      return (
        <Card className={className}>
          {showHeader && (
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Market Insights
              </CardTitle>
            </CardHeader>
          )}
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button 
              onClick={handleRefresh} 
              className="mt-3" 
              variant="outline"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className={className}>
        {showHeader && (
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Market Insights
                {isRefreshing && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </CardTitle>
              
              <div className="flex items-center gap-2">
                {enableNLQ && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNlqInterface(!showNlqInterface)}
                    className={cn(
                      "transition-colors",
                      showNlqInterface && "bg-primary/10 border-primary"
                    )}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                )}
                
                {enableFiltering && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Filter Insights</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuCheckboxItem
                        checked={filters.showActionableOnly}
                        onCheckedChange={(checked) =>
                          handleFilterChange("showActionableOnly", checked)
                        }
                      >
                        Actionable Only
                      </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={debouncedRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                </Button>
              </div>
            </div>
            
            <CardDescription>
              RAG-powered insights from Market Research Agent
              {enableRealTime && (
                <span className="ml-2 inline-flex items-center gap-1">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                  Live
                </span>
              )}
            </CardDescription>
          </CardHeader>
        )}
        
        <CardContent className="space-y-4">
          {enableNLQ && showNlqInterface && (
            <NLQInterface
              onQuery={handleNLQuery}
              isLoading={isNlqLoading}
              response={nlqResponse}
              onClear={() => setNlqResponse(null)}
            />
          )}
          
          {sortedInsights.length === 0 ? (
            <div className="text-center py-6">
              <Brain className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No insights available. Check back soon!
              </p>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <AnimatePresence>
                <div className="space-y-3">
                  {sortedInsights.map((insight, index) => 
                    renderInsight(insight, index)
                  )}
                </div>
              </AnimatePresence>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    );
  }
);

AIInsightsWidget.displayName = "AIInsightsWidget";

export default AIInsightsWidget;
