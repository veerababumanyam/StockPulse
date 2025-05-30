/**
 * Recent Transactions Component
 * Optimized component for displaying transaction history with pagination and filtering
 * Includes real-time updates and accessibility features
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
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown,
  Calendar,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';
import { Transaction } from '../../types/portfolio';
import { formatCurrency, groupTransactionsByDate } from '../../utils/portfolioCalculations';
import { TransactionsSkeleton } from '../ui/SkeletonLoader';
import { cn } from '../../utils/tailwind';

// Component props
interface RecentTransactionsProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onTransactionClick?: (transaction: Transaction) => void;
  onRefresh?: () => void;
  onExport?: () => void;
  showPagination?: boolean;
  itemsPerPage?: number;
  className?: string;
}

// Filter and sort options
type TransactionType = 'ALL' | 'BUY' | 'SELL' | 'DIVIDEND' | 'SPLIT' | 'TRANSFER';
type SortBy = 'date' | 'symbol' | 'amount' | 'type';
type SortOrder = 'ASC' | 'DESC';
type TimeRange = 'ALL' | '7D' | '30D' | '90D' | '1Y';

interface FilterState {
  search: string;
  type: TransactionType;
  timeRange: TimeRange;
  sortBy: SortBy;
  sortOrder: SortOrder;
  isCollapsed: boolean;
}

// Transaction item component with memoization
const TransactionItem = React.memo<{
  transaction: Transaction;
  onClick?: (transaction: Transaction) => void;
  isCompact?: boolean;
}>(({ transaction, onClick, isCompact = false }) => {
  const handleClick = useCallback(() => {
    onClick?.(transaction);
  }, [onClick, transaction]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'BUY':
        return 'default';
      case 'SELL':
        return 'secondary';
      case 'DIVIDEND':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getAmountColor = (type: string, amount: number) => {
    if (type === 'DIVIDEND') return 'text-green-600';
    if (type === 'BUY') return 'text-red-600';
    if (type === 'SELL') return 'text-green-600';
    return 'text-foreground';
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between py-2 transition-all",
        "hover:bg-muted/50 rounded-lg px-2 -mx-2",
        onClick && "cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isCompact && "py-1"
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : -1}
      role={onClick ? "button" : undefined}
      aria-label={`${transaction.transaction_type} ${transaction.symbol} transaction`}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Badge 
            variant={getBadgeVariant(transaction.transaction_type)}
            className="text-xs"
          >
            {transaction.transaction_type}
          </Badge>
          <span className="font-medium text-sm">{transaction.symbol}</span>
        </div>
        {!isCompact && (
          <p className="text-xs text-muted-foreground">
            {new Date(transaction.transaction_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
            {transaction.notes && (
              <span className="ml-2">• {transaction.notes}</span>
            )}
          </p>
        )}
      </div>
      <div className="text-right space-y-1">
        <div className={cn("font-medium text-sm", getAmountColor(transaction.transaction_type, transaction.total_amount))}>
          {transaction.quantity > 0 ? `${transaction.quantity.toLocaleString()} @ ` : ''}
          {formatCurrency(Math.abs(transaction.total_amount))}
        </div>
        {!isCompact && transaction.fees > 0 && (
          <div className="text-xs text-muted-foreground">
            Fee: {formatCurrency(transaction.fees)}
          </div>
        )}
      </div>
    </div>
  );
});

TransactionItem.displayName = 'TransactionItem';

// Main component
export const RecentTransactions: React.FC<RecentTransactionsProps> = React.memo(({
  transactions,
  isLoading = false,
  onTransactionClick,
  onRefresh,
  onExport,
  showPagination = true,
  itemsPerPage = 10,
  className
}) => {
  // State management
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    type: 'ALL',
    timeRange: 'ALL',
    sortBy: 'date',
    sortOrder: 'DESC',
    isCollapsed: false,
  });

  const [currentPage, setCurrentPage] = useState(1);

  // Filter transactions based on current filters
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(t => 
        t.symbol.toLowerCase().includes(searchLower) ||
        t.transaction_type.toLowerCase().includes(searchLower) ||
        (t.notes && t.notes.toLowerCase().includes(searchLower))
      );
    }

    // Type filter
    if (filters.type !== 'ALL') {
      filtered = filtered.filter(t => t.transaction_type === filters.type);
    }

    // Time range filter
    if (filters.timeRange !== 'ALL') {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (filters.timeRange) {
        case '7D':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case '30D':
          cutoffDate.setDate(now.getDate() - 30);
          break;
        case '90D':
          cutoffDate.setDate(now.getDate() - 90);
          break;
        case '1Y':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(t => new Date(t.transaction_date) >= cutoffDate);
    }

    // Sort transactions
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (filters.sortBy) {
        case 'date':
          aValue = new Date(a.transaction_date);
          bValue = new Date(b.transaction_date);
          break;
        case 'symbol':
          aValue = a.symbol;
          bValue = b.symbol;
          break;
        case 'amount':
          aValue = Math.abs(a.total_amount);
          bValue = Math.abs(b.total_amount);
          break;
        case 'type':
          aValue = a.transaction_type;
          bValue = b.transaction_type;
          break;
        default:
          aValue = new Date(a.transaction_date);
          bValue = new Date(b.transaction_date);
      }

      if (aValue < bValue) return filters.sortOrder === 'ASC' ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === 'ASC' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [transactions, filters]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = showPagination 
    ? filteredTransactions.slice(startIndex, endIndex)
    : filteredTransactions.slice(0, itemsPerPage);

  // Transaction summary stats
  const transactionStats = useMemo(() => {
    const stats = filteredTransactions.reduce((acc, transaction) => {
      switch (transaction.transaction_type) {
        case 'BUY':
          acc.buys += 1;
          acc.buyAmount += transaction.total_amount;
          break;
        case 'SELL':
          acc.sells += 1;
          acc.sellAmount += transaction.total_amount;
          break;
        case 'DIVIDEND':
          acc.dividends += 1;
          acc.dividendAmount += transaction.total_amount;
          break;
      }
      acc.totalFees += transaction.fees;
      return acc;
    }, {
      buys: 0,
      sells: 0,
      dividends: 0,
      buyAmount: 0,
      sellAmount: 0,
      dividendAmount: 0,
      totalFees: 0,
    });

    return stats;
  }, [filteredTransactions]);

  // Update filter handlers
  const updateFilter = useCallback(<K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    updateFilter('search', event.target.value);
  }, [updateFilter]);

  const toggleCollapsed = useCallback(() => {
    updateFilter('isCollapsed', !filters.isCollapsed);
  }, [filters.isCollapsed, updateFilter]);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      type: 'ALL',
      timeRange: 'ALL',
      sortBy: 'date',
      sortOrder: 'DESC',
      isCollapsed: false,
    });
    setCurrentPage(1);
  }, []);

  // Pagination handlers
  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const hasFilters = filters.search || filters.type !== 'ALL' || filters.timeRange !== 'ALL';

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
          <TransactionsSkeleton />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Recent Transactions</span>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button variant="ghost" size="sm" onClick={onRefresh}>
                <RefreshCw size={16} />
              </Button>
            )}
            {onExport && (
              <Button variant="ghost" size="sm" onClick={onExport}>
                <Download size={16} />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCollapsed}
              aria-label={filters.isCollapsed ? 'Expand transactions' : 'Collapse transactions'}
            >
              {filters.isCollapsed ? <Eye size={16} /> : <EyeOff size={16} />}
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Your latest trading activity
          {filteredTransactions.length !== transactions.length && (
            <span className="ml-2">
              ({filteredTransactions.length} of {transactions.length})
            </span>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {!filters.isCollapsed && (
          <>
            {/* Filters */}
            {transactions.length > 0 && (
              <div className="space-y-3 mb-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                      placeholder="Search transactions..."
                      value={filters.search}
                      onChange={handleSearchChange}
                      className="pl-9"
                      aria-label="Search transactions"
                    />
                  </div>
                  
                  <Select value={filters.type} onValueChange={(value: TransactionType) => updateFilter('type', value)}>
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Types</SelectItem>
                      <SelectItem value="BUY">Buy</SelectItem>
                      <SelectItem value="SELL">Sell</SelectItem>
                      <SelectItem value="DIVIDEND">Dividend</SelectItem>
                      <SelectItem value="SPLIT">Split</SelectItem>
                      <SelectItem value="TRANSFER">Transfer</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filters.timeRange} onValueChange={(value: TimeRange) => updateFilter('timeRange', value)}>
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Time</SelectItem>
                      <SelectItem value="7D">Last 7 Days</SelectItem>
                      <SelectItem value="30D">Last 30 Days</SelectItem>
                      <SelectItem value="90D">Last 90 Days</SelectItem>
                      <SelectItem value="1Y">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {hasFilters && (
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-muted-foreground"
                    >
                      Clear Filters
                    </Button>
                    
                    {/* Transaction Stats */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {transactionStats.buys > 0 && (
                        <span>Buys: {transactionStats.buys}</span>
                      )}
                      {transactionStats.sells > 0 && (
                        <span>Sells: {transactionStats.sells}</span>
                      )}
                      {transactionStats.dividends > 0 && (
                        <span>Dividends: {transactionStats.dividends}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Transactions List */}
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                {hasFilters ? 'No transactions match your filters' : 'No recent transactions'}
              </div>
            ) : (
              <div className="space-y-1" role="list" aria-label="Recent transactions">
                {paginatedTransactions.map((transaction) => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                    onClick={onTransactionClick}
                    isCompact={filteredTransactions.length > 10}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {showPagination && totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length} transactions
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  
                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label="Next page"
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
});

RecentTransactions.displayName = 'RecentTransactions';

export default RecentTransactions; 