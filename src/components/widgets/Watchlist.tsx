/**
 * Watchlist Widget
 * Displays a list of stocks the user is watching.
 * Part of Story 2.2: Customizable Widget System
 */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { WidgetComponentProps } from '../../types/dashboard';
import { WatchlistData, WatchlistItem } from '../../types/widget-data';
import { useTheme } from '../../contexts/ThemeContext';
import { apiClient } from '../../services/api';
import { Eye, RefreshCw, AlertCircle, ArrowUpRight, ArrowDownRight, PlusCircle, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area'; // Assuming this exists
import { cn } from '../../utils/tailwind';
import { Badge } from '../ui/badge';

const Watchlist: React.FC<WidgetComponentProps> = ({
  widgetId,
  config,
  isEditMode,
  onConfigChange, 
  // onRemoveWidget, // We'd get this from EnterpriseWidgetGrid if we allow direct removal
}) => {
  const { isDarkMode } = useTheme();
  const [watchlistData, setWatchlistData] = useState<WatchlistData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // In a real app, watchlistId might come from widget config or user preferences
  const currentWatchlistId = config.config?.watchlistId || 'default-watchlist';

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Call without parameters to get the default watchlist
      // In the future, we could pass specific symbols if needed
      const data = await apiClient.getWatchlistData();
      setWatchlistData(data);
    } catch (err: any) {
      console.error(`[${widgetId}] Error fetching watchlist:`, err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [widgetId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Placeholder actions - these would interact with a service or context
  const handleAddItem = () => {
    console.log(`[${widgetId}] Add item to watchlist ${currentWatchlistId}`);
    // Example: onConfigChange(widgetId, { ...config, items: [...(config.items || []), newItem] });
    alert('Add item functionality not implemented yet.');
  };

  const handleRemoveItem = (itemId: string) => {
    console.log(`[${widgetId}] Remove item ${itemId} from watchlist ${currentWatchlistId}`);
    alert(`Remove item ${itemId} functionality not implemented yet.`);
    // Example: onConfigChange(widgetId, { ...config, items: config.items.filter(i => i.id !== itemId) });
    // This would likely involve calling dashboardService.updateWidgetConfiguration or similar,
    // or a specific watchlist service.
  };

  const renderListItem = (item: WatchlistItem) => (
    <div key={item.id} className="flex items-center justify-between py-2 px-1 hover:bg-muted/50 rounded-md">
      <div className="flex items-center flex-grow min-w-0">
        {item.logoUrl && <img src={item.logoUrl} alt={`${item.name} logo`} className="h-6 w-6 mr-2 rounded-full object-contain" onError={(e) => e.currentTarget.style.display='none'} />}
        <div className="flex-grow min-w-0">
          <p className="text-sm font-medium text-foreground truncate" title={item.name}>{item.symbol}</p>
          <p className="text-xs text-muted-foreground truncate" title={item.name}>{item.name}</p>
        </div>
      </div>
      <div className="text-right ml-2 flex-shrink-0">
        <p className="text-sm font-medium text-foreground">${item.price.toFixed(2)}</p>
        <p className={cn(
          "text-xs",
          item.change >= 0 ? 'text-success-fg' : 'text-danger-fg'
        )}>
          {item.change >= 0 ? <ArrowUpRight className="inline h-3 w-3"/> : <ArrowDownRight className="inline h-3 w-3"/>}
          {item.change.toFixed(2)} ({item.changePercent.toFixed(2)}%)
        </p>
      </div>
      {isEditMode && (
        <Button variant="ghost" size="icon" className="ml-2 h-7 w-7" onClick={() => handleRemoveItem(item.id)} title={`Remove ${item.symbol}`}>
          <Trash2 className="h-4 w-4 text-danger-fg" />
        </Button>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <Card className={cn("h-full flex flex-col", config.className)}>
        <CardHeader className="pb-2 pt-3">
            <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center">
                    <Eye className="h-4 w-4 mr-2 text-primary" />
                    {watchlistData?.name || config.title || 'Watchlist'}
                </CardTitle>
                <RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" />
            </div>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center text-muted-foreground">
          Loading watchlist...
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
                    {config.title || 'Watchlist'}
                </CardTitle>
                <button onClick={fetchData} title="Retry loading watchlist">
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

  if (!watchlistData || watchlistData.items.length === 0) {
     return (
        <Card className={cn("h-full flex flex-col", config.className)}>
            <CardHeader className="pb-2 pt-3">
                 <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold flex items-center">
                        <Eye className="h-4 w-4 mr-2 text-primary" />
                        {watchlistData?.name || config.title || 'Watchlist'}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                        {isEditMode && (
                            <Button variant="outline" size="sm" onClick={handleAddItem} className="h-7">
                                <PlusCircle className="h-3.5 w-3.5 mr-1.5" /> Add
                            </Button>
                        )}
                        <button onClick={fetchData} title="Reload watchlist">
                            <RefreshCw className="h-4 w-4 text-muted-foreground hover:text-primary" />
                        </button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col items-center justify-center text-muted-foreground">
                <p>Watchlist is empty.</p>
                {isEditMode && <p className="text-xs mt-1">Click "Add" to include symbols.</p>}
            </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("h-full flex flex-col", config.className)}>
      <CardHeader className="pb-2 pt-3">
        <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center">
                <Eye className="h-4 w-4 mr-2 text-primary" />
                {watchlistData.name || config.title || 'Watchlist'}
                <Badge variant="outline" className="ml-2 text-xs font-normal">{watchlistData.items.length} items</Badge>
            </CardTitle>
            <div className="flex items-center space-x-2">
                {isEditMode && (
                    <Button variant="outline" size="sm" onClick={handleAddItem} className="h-7">
                        <PlusCircle className="h-3.5 w-3.5 mr-1.5" /> Add
                    </Button>
                )}
                <button onClick={fetchData} title="Refresh watchlist">
                    <RefreshCw className="h-4 w-4 text-muted-foreground hover:text-primary" />
                </button>
            </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-0 overflow-hidden"> {/* Remove padding for ScrollArea */} 
        <ScrollArea className="h-full p-2"> {/* Add padding inside ScrollArea */} 
            {watchlistData.items.map(renderListItem)}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default Watchlist; 