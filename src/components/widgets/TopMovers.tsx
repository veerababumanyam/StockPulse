/**
 * TopMovers Widget
 * Displays top gaining, losing, and most active stocks.
 * Part of Story 2.2: Customizable Widget System
 */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
// import Image from 'next/image'; // Removed next/image
import { WidgetComponentProps } from '../../types/dashboard';
import { TopMoversData, TopMoverItem } from '../../types/widget-data';
import { useTheme } from '../../contexts/ThemeContext';
import { apiClient } from '../../services/api';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  RefreshCw,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Flame // For most active
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'; // Assuming Tabs component
import { ScrollArea } from '../ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { cn } from '../../utils/tailwind';
import { Button } from '../ui/button';

const MARKET_OPTIONS = ['US Equities', 'NASDAQ', 'NYSE', 'Crypto', 'Forex'];

const TopMovers: React.FC<WidgetComponentProps> = ({
  widgetId,
  config,
  isEditMode,
  onConfigChange,
}) => {
  const { isDarkMode } = useTheme();
  const [moversData, setMoversData] = useState<TopMoversData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const initialMarket = config.config?.market || 'US Equities';
  const [selectedMarket, setSelectedMarket] = useState<string>(initialMarket);
  const moversCount = config.config?.count || 5;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.getTopMoversData(selectedMarket, moversCount);
      if (response.success && response.data) {
        setMoversData(response.data);
      } else {
        setError(response.message || 'Failed to fetch top movers.');
      }
    } catch (err: any) {
      console.error(`[${widgetId}] Error fetching top movers:`, err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [widgetId, selectedMarket, moversCount]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMarketChange = (newMark: string) => {
    setSelectedMarket(newMark);
     if(onConfigChange && config) {
        onConfigChange(widgetId, { ...config, config: { ...config.config, market: newMark }});
    }
  };

  const renderMoverItem = (item: TopMoverItem, type: 'gainer' | 'loser' | 'active') => (
    <div key={item.id} className="flex items-center justify-between py-2 px-1 border-b border-border/50 last:border-b-0 hover:bg-muted/50 rounded-md">
      <div className="flex items-center overflow-hidden mr-2">
        {item.logoUrl && (
            <div className="flex-shrink-0 w-6 h-6 relative rounded-full overflow-hidden mr-2 border border-border/50 bg-background">
                 <img 
                   src={item.logoUrl} 
                   alt={`${item.name} logo`} 
                   style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                   onError={(e) => e.currentTarget.style.display = 'none'} 
                 />
            </div>
        )}
        <div className="overflow-hidden">
          <p className="text-xs font-semibold text-foreground truncate">{item.symbol}</p>
          <p className="text-xs text-muted-foreground truncate">{item.name}</p>
        </div>
      </div>
      <div className="text-right flex-shrink-0 ml-auto">
        <p className="text-xs font-medium text-foreground">${item.price.toFixed(2)}</p>
        <p className={cn(
          "text-xs",
          item.changePercent >= 0 ? 'text-success-fg' : 'text-danger-fg'
        )}>
          {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
        </p>
      </div>
    </div>
  );
  
  const renderMoverList = (items: TopMoverItem[], type: 'gainer' | 'loser' | 'active') => {
      if (!items || items.length === 0) {
          return <p className="text-xs text-muted-foreground text-center py-4">No {type}s found for this market.</p>;
      }
      return items.map(item => renderMoverItem(item, type));
  }

  if (isLoading && !moversData) {
    return (
      <Card className={cn("h-full flex flex-col", config.className)}>
        <CardHeader className="pb-2 pt-3">
            <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center">
                    <Flame className="h-4 w-4 mr-2 text-primary" />
                    {config.title || 'Top Movers'}
                </CardTitle>
                <RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" />
            </div>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center text-muted-foreground">
          Loading top movers...
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
                    {config.title || 'Top Movers'}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={fetchData} title="Retry loading data" className="h-7 w-7">
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </div>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center text-danger-fg">
          Error: {error}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("h-full flex flex-col", config.className)}>
      <CardHeader className="pb-2 pt-3">
        <div className="flex items-center justify-between mb-2">
            <CardTitle className="text-base font-semibold flex items-center">
                <Flame className="h-4 w-4 mr-2 text-primary" />
                {config.title || 'Top Movers'}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={fetchData} title="Refresh data" className="h-7 w-7">
                <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
        </div>
        {isEditMode && (
            <Select value={selectedMarket} onValueChange={handleMarketChange}>
                <SelectTrigger className="h-8 text-xs w-full">
                    <SelectValue placeholder="Select market" />
                </SelectTrigger>
                <SelectContent>
                    {MARKET_OPTIONS.map(market => (
                        <SelectItem key={market} value={market} className="text-xs">{market}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        )}
        <CardDescription className="text-xs text-muted-foreground pt-1">
            Showing top {moversCount} for {selectedMarket}. Last updated: {moversData ? new Date(moversData.lastUpdated).toLocaleTimeString() : 'N/A'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow p-0 overflow-hidden">
        {(!moversData || (moversData.gainers.length === 0 && moversData.losers.length === 0 && moversData.mostActive.length === 0)) && !isLoading ? (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                No top movers data available for this market.
            </div>
        ) : moversData && (
            <Tabs defaultValue="gainers" className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-3 h-8 mx-2 mt-1 mb-0.5">
                    <TabsTrigger value="gainers" className="text-xs h-6 px-1 py-0.5"><TrendingUp className="h-3.5 w-3.5 mr-1" />Gainers</TabsTrigger>
                    <TabsTrigger value="losers" className="text-xs h-6 px-1 py-0.5"><TrendingDown className="h-3.5 w-3.5 mr-1" />Losers</TabsTrigger>
                    <TabsTrigger value="active" className="text-xs h-6 px-1 py-0.5"><Activity className="h-3.5 w-3.5 mr-1" />Active</TabsTrigger>
                </TabsList>
                <ScrollArea className="flex-grow px-2 pb-1">
                    <TabsContent value="gainers" className="mt-0">{renderMoverList(moversData.gainers, 'gainer')}</TabsContent>
                    <TabsContent value="losers" className="mt-0">{renderMoverList(moversData.losers, 'loser')}</TabsContent>
                    <TabsContent value="active" className="mt-0">{renderMoverList(moversData.mostActive, 'active')}</TabsContent>
                </ScrollArea>
            </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default TopMovers; 