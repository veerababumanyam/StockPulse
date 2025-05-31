/**
 * AI Insights Widget
 * Displays AI-powered insights and recommendations
 */

import React, { useState, useMemo } from 'react';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, RefreshCw, ChevronRight, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { cn } from '../../utils/tailwind';

interface AIInsightsWidgetProps {
  widgetId: string;
  className?: string;
  showHeader?: boolean;
}

interface AIInsight {
  id: string;
  title: string;
  content: string;
  type: 'opportunity' | 'warning' | 'recommendation' | 'analysis';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  category: string;
  actionable: boolean;
  timestamp: Date;
}

const AIInsightsWidget: React.FC<AIInsightsWidgetProps> = ({
  widgetId,
  className,
  showHeader = true,
}) => {
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock AI insights data
  const insights = useMemo((): AIInsight[] => [
    {
      id: '1',
      title: 'Portfolio Rebalancing Opportunity',
      content: 'Your technology allocation is 15% above target. Consider reducing AAPL and GOOGL positions to maintain optimal diversification.',
      type: 'recommendation',
      priority: 'MEDIUM',
      confidence: 0.85,
      category: 'Portfolio Management',
      actionable: true,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: '2',
      title: 'Market Volatility Alert',
      content: 'Increased volatility expected in the next 5-7 trading days due to upcoming Fed announcement. Consider reducing position sizes.',
      type: 'warning',
      priority: 'HIGH',
      confidence: 0.78,
      category: 'Risk Management',
      actionable: true,
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
    {
      id: '3',
      title: 'Dividend Opportunity',
      content: 'AAPL ex-dividend date approaching (Dec 15). Current position size allows for optimal dividend capture strategy.',
      type: 'opportunity',
      priority: 'LOW',
      confidence: 0.92,
      category: 'Income Strategy',
      actionable: false,
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    },
    {
      id: '4',
      title: 'Sector Rotation Signal',
      content: 'Healthcare sector showing strong momentum. Consider increasing allocation to XLV or individual healthcare stocks.',
      type: 'analysis',
      priority: 'MEDIUM',
      confidence: 0.73,
      category: 'Sector Analysis',
      actionable: true,
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    },
  ], []);

  const priorityColors = {
    LOW: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  };

  const typeIcons = {
    opportunity: TrendingUp,
    warning: AlertTriangle,
    recommendation: Lightbulb,
    analysis: Brain,
  };

  const typeColors = {
    opportunity: 'text-green-600',
    warning: 'text-orange-600',
    recommendation: 'text-blue-600',
    analysis: 'text-purple-600',
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      {showHeader && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-medium flex items-center">
                <Brain className="h-4 w-4 mr-2" />
                AI Insights
              </CardTitle>
              <CardDescription className="text-xs">
                {insights.length} insights available
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-6 px-2 text-xs"
            >
              <RefreshCw className={cn("h-3 w-3", isRefreshing && "animate-spin")} />
            </Button>
          </div>
        </CardHeader>
      )}

      <CardContent className="flex-1 space-y-3 overflow-hidden">
        {/* Insights List */}
        <div className="space-y-2 flex-1 overflow-y-auto">
          <AnimatePresence>
            {insights.map((insight, index) => {
              const IconComponent = typeIcons[insight.type];
              const isSelected = selectedInsight === insight.id;
              
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-all",
                    isSelected ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                  )}
                  onClick={() => setSelectedInsight(isSelected ? null : insight.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={cn("p-1.5 rounded-full bg-muted", typeColors[insight.type])}>
                      <IconComponent className="h-3 w-3" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium truncate">{insight.title}</h4>
                        <ChevronRight className={cn(
                          "h-3 w-3 transition-transform",
                          isSelected && "rotate-90"
                        )} />
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge 
                          variant="secondary" 
                          className={cn("text-xs px-1 py-0", priorityColors[insight.priority])}
                        >
                          {insight.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {insight.category}
                        </span>
                      </div>

                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
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
                                <span className="font-medium">
                                  {(insight.confidence * 100).toFixed(0)}%
                                </span>
                              </div>
                              <Progress value={insight.confidence * 100} className="h-1" />
                              
                              {/* Action Button */}
                              {insight.actionable && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full h-7 text-xs mt-2"
                                >
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
                                {(insight.confidence * 100).toFixed(0)}% confidence
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
            })}
          </AnimatePresence>
        </div>

        {/* Summary Stats */}
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
};

export default AIInsightsWidget; 