/**
 * Watchlist Widget
 * Displays user's stock watchlist with real-time price updates
 */

import React, { useState, useMemo } from 'react';
import { Eye, TrendingUp, TrendingDown, Plus, Search, Star, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { cn } from '../../utils/tailwind';

interface WatchlistWidgetProps {
  widgetId: string;
  className?: string;
  showHeader?: boolean;
}

interface WatchlistStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: string;
  isWatched: boolean;
}

const WatchlistWidget: React.FC<WatchlistWidgetProps> = ({
  widgetId,
  className,
  showHeader = true,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingStock, setIsAddingStock] = useState(false);

  // Mock watchlist data - in real app, this would come from a service
  const watchlistStocks = useMemo((): WatchlistStock[] => [
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: 175.43,
      change: 2.15,
      changePercent: 1.24,
      volume: 45678900,
      marketCap: '2.8T',
      isWatched: true,
    },
    {
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      price: 2847.63,
      change: -15.32,
      changePercent: -0.53,
      volume: 1234567,
      marketCap: '1.8T',
      isWatched: true,
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft Corp.',
      price: 378.85,
      change: 4.22,
      changePercent: 1.13,
      volume: 23456789,
      marketCap: '2.9T',
      isWatched: true,
    },
    {
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      price: 248.50,
      change: -8.75,
      changePercent: -3.40,
      volume: 87654321,
      marketCap: '789B',
      isWatched: true,
    },
    {
      symbol: 'NVDA',
      name: 'NVIDIA Corp.',
      price: 875.28,
      change: 12.45,
      changePercent: 1.44,
      volume: 34567890,
      marketCap: '2.2T',
      isWatched: true,
    },
  ], []);

  // Filter stocks based on search term
  const filteredStocks = useMemo(() => {
    if (!searchTerm) return watchlistStocks;
    return watchlistStocks.filter(stock =>
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [watchlistStocks, searchTerm]);

  const handleToggleWatch = (symbol: string) => {
    // In real app, this would update the watchlist via API
    console.log(`Toggle watch for ${symbol}`);
  };

  const handleAddStock = () => {
    setIsAddingStock(true);
  };

  const formatVolume = (volume: number): string => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toString();
  };

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      {showHeader && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-medium flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                Watchlist
              </CardTitle>
              <CardDescription className="text-xs">
                {filteredStocks.length} stocks tracked
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddStock}
              className="h-6 px-2 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
          </div>
        </CardHeader>
      )}

      <CardContent className="flex-1 space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="Search stocks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-7 h-7 text-xs"
          />
        </div>

        {/* Stock List */}
        <div className="space-y-2 flex-1 overflow-y-auto">
          <AnimatePresence>
            {filteredStocks.map((stock, index) => {
              const isPositive = stock.change >= 0;
              
              return (
                <motion.div
                  key={stock.symbol}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                  className="group p-2 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleWatch(stock.symbol)}
                        className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Star className={cn("h-3 w-3", 
                          stock.isWatched ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                        )} />
                      </Button>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-semibold">{stock.symbol}</p>
                          <Badge 
                            variant={isPositive ? "default" : "destructive"}
                            className="text-xs px-1 py-0"
                          >
                            {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {stock.name}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        ${stock.price.toFixed(2)}
                      </p>
                      <p className={cn("text-xs flex items-center",
                        isPositive ? "text-green-600" : "text-red-600"
                      )}>
                        {isPositive ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {isPositive ? '+' : ''}${Math.abs(stock.change).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Additional Info (shown on hover) */}
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ 
                      height: "auto", 
                      opacity: 1,
                      transition: { duration: 0.2 }
                    }}
                    className="mt-2 pt-2 border-t border-muted/50 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Vol: {formatVolume(stock.volume)}</span>
                      <span>Cap: {stock.marketCap}</span>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredStocks.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-8 text-center"
          >
            <Activity className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              {searchTerm ? 'No stocks found' : 'No stocks in watchlist'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddStock}
              className="mt-2 h-7 px-3 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Stock
            </Button>
          </motion.div>
        )}

        {/* Market Status Indicator */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Market Status</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-600 font-medium">Open</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WatchlistWidget; 