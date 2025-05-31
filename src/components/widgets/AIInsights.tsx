/**
 * AIInsights Widget
 * Displays AI-generated market insights and tips.
 * Part of Story 2.2: Customizable Widget System
 */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { WidgetComponentProps } from '../../types/dashboard';
import { AIInsightsData, AIInsightItem, AIInsightSentiment, AIInsightType } from '../../types/widget-data';
import { useTheme } from '../../contexts/ThemeContext';
import { apiClient } from '../../services/api';
import { Brain, RefreshCw, AlertCircle, Zap, TrendingUp, TrendingDown, Lightbulb, Newspaper, Link as LinkIcon, Landmark } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '../../utils/tailwind';

const getSentimentStyles = (sentiment?: AIInsightSentiment, isDarkMode?: boolean) => {
  switch (sentiment) {
    case 'positive':
      return { icon: <TrendingUp className="h-4 w-4 text-success-fg" />, bgColor: 'bg-success-muted', textColor: 'text-success-fg', borderColor: 'border-success-emphasis' };
    case 'negative':
      return { icon: <TrendingDown className="h-4 w-4 text-danger-fg" />, bgColor: 'bg-danger-muted', textColor: 'text-danger-fg', borderColor: 'border-danger-emphasis' };
    case 'neutral':
      return { icon: <Zap className="h-4 w-4 text-info-fg" />, bgColor: 'bg-info-muted', textColor: 'text-info-fg', borderColor: 'border-info-emphasis' };
    case 'mixed':
      return { icon: <Zap className="h-4 w-4 text-warning-fg" />, bgColor: 'bg-warning-muted', textColor: 'text-warning-fg', borderColor: 'border-warning-emphasis' };
    default:
      return { icon: <Lightbulb className="h-4 w-4 text-muted-foreground" />, bgColor: 'bg-muted/50', textColor: 'text-foreground', borderColor: 'border-border' };
  }
};

const getInsightTypeIcon = (insightType: AIInsightType) => {
    switch(insightType) {
        case 'market_trend': return <TrendingUp className="h-4 w-4" />;
        case 'stock_signal': return <Zap className="h-4 w-4" />;
        case 'portfolio_tip': return <Lightbulb className="h-4 w-4" />;
        case 'economic_event': return <Landmark className="h-4 w-4" />; // Need to import Landmark if used
        case 'news_summary': return <Newspaper className="h-4 w-4" />;
        default: return <Lightbulb className="h-4 w-4" />;
    }
}

const AIInsights: React.FC<WidgetComponentProps> = ({
  widgetId,
  config,
  isEditMode,
  // onConfigChange, // For future settings like number of insights
}) => {
  const { isDarkMode } = useTheme();
  const [insightsData, setInsightsData] = useState<AIInsightsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const insightsCount = config.config?.count || 3; // Default to 3 insights

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.getAIInsightsData(insightsCount);
      if (response.success && response.data) {
        setInsightsData(response.data);
      } else {
        setError(response.message || 'Failed to fetch AI insights.');
      }
    } catch (err: any) {
      console.error(`[${widgetId}] Error fetching AI insights:`, err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [widgetId, insightsCount]);

  useEffect(() => {
    fetchData();
    // Optional: Refresh interval
  }, [fetchData]);

  const renderInsightItem = (insight: AIInsightItem) => {
    const sentimentStyle = getSentimentStyles(insight.sentiment, isDarkMode);
    const typeIcon = getInsightTypeIcon(insight.insightType);

    return (
      <Card key={insight.id} className={cn("mb-3", sentimentStyle.bgColor, `border-l-4 ${sentimentStyle.borderColor}`)}>
        <CardHeader className="pb-2 pt-3 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className={cn("text-sm font-semibold flex items-center", sentimentStyle.textColor)}>
              {sentimentStyle.icon} 
              <span className="ml-1.5">{insight.title}</span>
            </CardTitle>
            {insight.confidenceScore && (
                <Badge variant="outline" className={cn("text-xs font-normal border", sentimentStyle.borderColor, sentimentStyle.textColor, `${sentimentStyle.bgColor.replace('bg-','bg-opacity-50 hover:bg-')}`)}>
                    Conf: {(insight.confidenceScore * 100).toFixed(0)}%
                </Badge>
            )}
          </div>
           <CardDescription className="text-xs text-muted-foreground pt-0.5">
            {typeIcon} <span className="ml-1">{insight.insightType.replace('_', ' ')} &bull; {new Date(insight.timestamp).toLocaleDateString()} {new Date(insight.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="text-xs px-4 pb-3">
          <p className={cn("leading-relaxed", sentimentStyle.textColor?.replace('-fg', '-muted-fg'))}>{insight.summary}</p>
          {insight.referenceSymbol && (
             <Badge variant="secondary" className="mt-1.5 text-xs font-normal">{insight.referenceSymbol}</Badge>
          )}
          {insight.source && <p className="text-xs text-muted-foreground mt-1.5">Source: {insight.source}</p>}
        </CardContent>
        {insight.tags && insight.tags.length > 0 && (
            <CardFooter className="px-4 py-2 border-t border-border/50">
                <div className="flex flex-wrap gap-1">
                    {insight.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs font-normal">{tag}</Badge>
                    ))}
                </div>
            </CardFooter>
        )}
      </Card>
    );
  };

  if (isLoading) {
    return (
      <Card className={cn("h-full flex flex-col", config.className)}>
        <CardHeader className="pb-2 pt-3">
             <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center">
                    <Brain className="h-4 w-4 mr-2 text-primary" />
                    {config.title || 'AI Insights'}
                </CardTitle>
                <RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" />
            </div>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center text-muted-foreground">
          Loading AI insights...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("h-full flex flex-col", config.className)}>
         <CardHeader className="pb-2 pt-3">
             <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center text-danger-fg">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {config.title || 'AI Insights'}
                </CardTitle>
                <button onClick={fetchData} title="Retry loading insights">
                    <RefreshCw className="h-4 w-4 text-muted-foreground hover:text-primary" />
                </button>
            </div>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center text-danger-fg">
          Error: {error}
        </CardContent>
      </Card>
    );
  }

  if (!insightsData || insightsData.insights.length === 0) {
     return (
        <Card className={cn("h-full flex flex-col", config.className)}>
            <CardHeader className="pb-2 pt-3">
                 <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold flex items-center">
                        <Brain className="h-4 w-4 mr-2 text-primary" />
                        {config.title || 'AI Insights'}
                    </CardTitle>
                    <button onClick={fetchData} title="Reload insights">
                        <RefreshCw className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    </button>
                </div>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center text-muted-foreground">
                No AI insights available at the moment.
            </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("h-full flex flex-col", config.className)}>
      <CardHeader className="pb-2 pt-3">
        <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center">
                <Brain className="h-4 w-4 mr-2 text-primary" />
                {config.title || 'AI Insights'} ({insightsData.insights.length})
            </CardTitle>
            <button onClick={fetchData} title="Refresh insights">
                <RefreshCw className="h-4 w-4 text-muted-foreground hover:text-primary" />
            </button>
        </div>
         <CardDescription className="text-xs text-muted-foreground pt-0.5">
            Last refreshed: {new Date(insightsData.lastRefreshed).toLocaleTimeString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow p-0 overflow-hidden"> 
        <ScrollArea className="h-full p-3">
            {insightsData.insights.map(renderInsightItem)}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AIInsights; 