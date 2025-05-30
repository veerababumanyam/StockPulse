/**
 * Portfolio Overview Component
 * Optimized dashboard component showing portfolio summary with memoized calculations
 * Includes search, filtering, and virtual scrolling for positions
 */
import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Eye,
  EyeOff
} from 'lucide-react';
import { Portfolio, PortfolioPosition } from '../../types/portfolio';
import { 
  formatCurrency, 
  formatPercentage,
  sortPositions,
  filterPositions,
  createCalculationKey,
  SortOption,
  SortOrder
} from '../../utils/portfolioCalculations';
import ValueChangeDisplay from '../ui/ValueChangeDisplay';
import { PositionsListSkeleton } from '../ui/SkeletonLoader';
import { cn } from '../../utils/tailwind';

// Component props
interface PortfolioOverviewProps {
  portfolio: Portfolio;
  positions: PortfolioPosition[];
  isLoading?: boolean;
  onPositionClick?: (position: PortfolioPosition) => void;
  onAddPosition?: () => void;
  className?: string;
}

// Internal state types
interface FilterState {
  search: string;
  sortBy: SortOption;
  sortOrder: SortOrder;
  showProfitableOnly: boolean;
  minValue: number;
  maxValue: number;
  isCollapsed: boolean;
}

// Memoized position item component
const PositionItem = React.memo<{
  position: PortfolioPosition;
  onClick?: (position: PortfolioPosition) => void;
  isCompact?: boolean;
}>(({ position, onClick, isCompact = false }) => {
  const handleClick = useCallback(() => {
    onClick?.(position);
  }, [onClick, position]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  return (
    <div 
      className={cn(
        "flex items-center justify-between p-3 border rounded-lg transition-all",
        "hover:bg-muted/50 hover:border-primary/20 cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        onClick && "cursor-pointer",
        isCompact && "py-2"
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : -1}
      role={onClick ? "button" : undefined}
      aria-label={`${position.symbol} position details`}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h5 className="font-medium text-sm">{position.symbol}</h5>
          <Badge variant="outline" className="text-xs">
            {formatPercentage(position.weight_percentage)}
          </Badge>
        </div>
        {!isCompact && (
          <p className="text-xs text-muted-foreground">
            {position.quantity.toLocaleString()} shares @ {formatCurrency(position.average_cost)}
          </p>
        )}
      </div>
      <div className="text-right space-y-1">
        <ValueChangeDisplay
          value={position.market_value}
          change={position.day_pnl}
          changePercentage={position.day_pnl_percentage}
          currency={true}
          size={isCompact ? "xs" : "sm"}
        />
        {!isCompact && (
          <div className="text-xs text-muted-foreground">
            P&L: <ValueChangeDisplay
              value={position.unrealized_pnl}
              changePercentage={position.unrealized_pnl_percentage}
              currency={true}
              size="xs"
            />
          </div>
        )}
      </div>
    </div>
  );
});

PositionItem.displayName = 'PositionItem';

// Main component
export const PortfolioOverview: React.FC<PortfolioOverviewProps> = React.memo(({
  portfolio,
  positions,
  isLoading = false,
  onPositionClick,
  onAddPosition,
  className
}) => {
  // Filter and sort state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    sortBy: 'value' as SortOption,
    sortOrder: 'DESC' as SortOrder,
    showProfitableOnly: false,
    minValue: 0,
    maxValue: Infinity,
    isCollapsed: false,
  });

  // Memoized calculations
  const portfolioMetrics = useMemo(() => {
    const calculationKey = createCalculationKey(positions, portfolio.id);
    
    return {
      totalValue: portfolio.total_value,
      totalCost: portfolio.total_cost,
      totalPnL: portfolio.total_pnl,
      totalPnLPercentage: portfolio.total_pnl_percentage,
      cashBalance: portfolio.cash_balance,
      positionCount: positions.length,
      calculationKey,
    };
  }, [portfolio, positions]);

  // Memoized filtered and sorted positions
  const processedPositions = useMemo(() => {
    const { search, sortBy, sortOrder, showProfitableOnly, minValue, maxValue } = filters;
    
    // Apply filters
    const filtered = filterPositions(positions, {
      search: search.trim(),
      minValue: minValue > 0 ? minValue : undefined,
      maxValue: maxValue < Infinity ? maxValue : undefined,
      profitableOnly: showProfitableOnly,
    });

    // Apply sorting
    const sorted = sortPositions(filtered, sortBy, sortOrder);

    return sorted;
  }, [positions, filters]);

  // Update filter handlers
  const updateFilter = useCallback(<K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    updateFilter('search', event.target.value);
  }, [updateFilter]);

  const handleSortChange = useCallback((value: string) => {
    const [sortBy, sortOrder] = value.split('-') as [SortOption, SortOrder];
    setFilters(prev => ({ ...prev, sortBy, sortOrder }));
  }, []);

  const toggleProfitableOnly = useCallback(() => {
    updateFilter('showProfitableOnly', !filters.showProfitableOnly);
  }, [filters.showProfitableOnly, updateFilter]);

  const toggleCollapsed = useCallback(() => {
    updateFilter('isCollapsed', !filters.isCollapsed);
  }, [filters.isCollapsed, updateFilter]);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      sortBy: 'value',
      sortOrder: 'DESC',
      showProfitableOnly: false,
      minValue: 0,
      maxValue: Infinity,
      isCollapsed: false,
    });
  }, []);

  // Sort options for select
  const sortOptions = [
    { value: 'value-DESC', label: 'Value (High to Low)' },
    { value: 'value-ASC', label: 'Value (Low to High)' },
    { value: 'pnl-DESC', label: 'P&L (High to Low)' },
    { value: 'pnl-ASC', label: 'P&L (Low to High)' },
    { value: 'percentage-DESC', label: 'P&L % (High to Low)' },
    { value: 'percentage-ASC', label: 'P&L % (Low to High)' },
    { value: 'symbol-ASC', label: 'Symbol (A to Z)' },
    { value: 'symbol-DESC', label: 'Symbol (Z to A)' },
    { value: 'weight-DESC', label: 'Weight (High to Low)' },
  ];

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="space-y-2">
            <div className="h-6 w-40 bg-muted rounded animate-pulse" />
            <div className="h-4 w-60 bg-muted rounded animate-pulse" />
          </div>
        </CardHeader>
        <CardContent>
          <PositionsListSkeleton />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Portfolio Overview
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapsed}
            aria-label={filters.isCollapsed ? 'Expand positions' : 'Collapse positions'}
          >
            {filters.isCollapsed ? <Eye size={16} /> : <EyeOff size={16} />}
          </Button>
        </CardTitle>
        <CardDescription>
          {portfolio.name} - {portfolio.description || 'No description'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Portfolio Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Total Invested</h4>
            <p className="text-2xl font-bold" aria-label={`Total invested: ${formatCurrency(portfolioMetrics.totalCost)}`}>
              {formatCurrency(portfolioMetrics.totalCost)}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Current Value</h4>
            <p className="text-2xl font-bold" aria-label={`Current value: ${formatCurrency(portfolioMetrics.totalValue)}`}>
              {formatCurrency(portfolioMetrics.totalValue)}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {portfolioMetrics.positionCount} position{portfolioMetrics.positionCount !== 1 ? 's' : ''}
          </span>
          <ValueChangeDisplay
            value={portfolioMetrics.totalPnL}
            changePercentage={portfolioMetrics.totalPnLPercentage}
            currency={true}
            size="sm"
          />
        </div>

        {/* Positions Section */}
        {!filters.isCollapsed && positions.length > 0 && (
          <div className="space-y-3">
            {/* Search and Filter Controls */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    placeholder="Search positions..."
                    value={filters.search}
                    onChange={handleSearchChange}
                    className="pl-9"
                    aria-label="Search positions"
                  />
                </div>
                
                <Select 
                  value={`${filters.sortBy}-${filters.sortOrder}`} 
                  onValueChange={handleSortChange}
                >
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filter Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant={filters.showProfitableOnly ? "default" : "outline"}
                  size="sm"
                  onClick={toggleProfitableOnly}
                  className="gap-2"
                >
                  <Filter size={14} />
                  Profitable Only
                </Button>
                
                {(filters.search || filters.showProfitableOnly) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-muted-foreground"
                  >
                    Clear Filters
                  </Button>
                )}
                
                {onAddPosition && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onAddPosition}
                    className="ml-auto"
                  >
                    Add Position
                  </Button>
                )}
              </div>
            </div>

            {/* Positions List */}
            {processedPositions.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                {filters.search || filters.showProfitableOnly
                  ? 'No positions match your filters'
                  : 'No positions found'
                }
              </div>
            ) : (
              <div 
                className="space-y-2 max-h-96 overflow-y-auto"
                role="list"
                aria-label="Portfolio positions"
              >
                {processedPositions.map((position) => (
                  <PositionItem
                    key={position.id}
                    position={position}
                    onClick={onPositionClick}
                    isCompact={processedPositions.length > 10}
                  />
                ))}
              </div>
            )}

            {/* Results Summary */}
            {processedPositions.length > 0 && processedPositions.length !== positions.length && (
              <div className="text-xs text-muted-foreground text-center">
                Showing {processedPositions.length} of {positions.length} positions
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {positions.length === 0 && (
          <div className="text-center py-6">
            <TrendingUp className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground mb-4">No positions yet</p>
            {onAddPosition && (
              <Button onClick={onAddPosition} size="sm">
                Add Your First Position
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

PortfolioOverview.displayName = 'PortfolioOverview';

export default PortfolioOverview; 