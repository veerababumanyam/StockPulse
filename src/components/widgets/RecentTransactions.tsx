/**
 * RecentTransactions Widget
 * Displays a list of recent account transactions.
 * Part of Story 2.2: Customizable Widget System
 */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { WidgetComponentProps } from '../../types/dashboard';
import { RecentTransactionsData, TransactionItem, TransactionType, TransactionStatus } from '../../types/widget-data';
import { useTheme } from '../../contexts/ThemeContext';
import { apiClient } from '../../services/api';
import {
  History,
  RefreshCw,
  AlertCircle,
  ArrowRightLeft,
  ArrowDownCircle,
  ArrowUpCircle,
  DollarSign,
  CircleSlash,
  BadgeCheck,
  BadgeX,
  BadgeAlert,
  BadgeMinus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { cn } from '../../utils/tailwind';

const getTransactionTypeIcon = (type: TransactionType) => {
  switch (type) {
    case 'buy': return <ArrowUpCircle className="h-4 w-4 text-success-fg" />;
    case 'sell': return <ArrowDownCircle className="h-4 w-4 text-danger-fg" />;
    case 'dividend': return <DollarSign className="h-4 w-4 text-success-fg" />;
    case 'deposit': return <ArrowDownCircle className="h-4 w-4 text-success-fg" />;
    case 'withdrawal': return <ArrowUpCircle className="h-4 w-4 text-danger-fg" />;
    case 'fee': return <DollarSign className="h-4 w-4 text-warning-fg" />;
    default: return <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />;
  }
};

const getStatusBadge = (status: TransactionStatus) => {
    switch (status) {
        case 'completed':
            return <Badge variant="outline" className="text-xs border-success-emphasis text-success-fg bg-success-muted"><BadgeCheck className="h-3 w-3 mr-1"/>Completed</Badge>;
        case 'pending':
            return <Badge variant="outline" className="text-xs border-warning-emphasis text-warning-fg bg-warning-muted"><BadgeAlert className="h-3 w-3 mr-1"/>Pending</Badge>;
        case 'failed':
            return <Badge variant="outline" className="text-xs border-danger-emphasis text-danger-fg bg-danger-muted"><BadgeX className="h-3 w-3 mr-1"/>Failed</Badge>;
        case 'cancelled':
            return <Badge variant="outline" className="text-xs border-muted-foreground/50 text-muted-foreground bg-muted/30"><BadgeMinus className="h-3 w-3 mr-1"/>Cancelled</Badge>;
        default: return null;
    }
}

const RecentTransactions: React.FC<WidgetComponentProps> = ({
  widgetId,
  config,
  isEditMode,
  // onConfigChange,
}) => {
  const { isDarkMode } = useTheme();
  const [transactionsData, setTransactionsData] = useState<RecentTransactionsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const transactionLimit = config.config?.limit || 7; // Default to 7 transactions
  const accountId = config.config?.accountId; // Optional accountId from widget config

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.getRecentTransactionsData(transactionLimit, accountId);
      if (response.success && response.data) {
        setTransactionsData(response.data);
      } else {
        setError(response.message || 'Failed to fetch recent transactions.');
      }
    } catch (err: any) {
      console.error(`[${widgetId}] Error fetching transactions:`, err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [widgetId, transactionLimit, accountId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const renderTransactionItem = (item: TransactionItem) => (
    <div key={item.id} className="flex items-start justify-between py-2.5 px-1 border-b border-border/50 last:border-b-0 hover:bg-muted/50 rounded-md">
      <div className="flex items-center mr-3">
        <div className="mr-2.5 pt-0.5">{getTransactionTypeIcon(item.type)}</div>
        <div>
          <p className="text-sm font-medium text-foreground">{item.description}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
            {item.symbol && <span className="ml-1 font-semibold">({item.symbol})</span>}
          </p>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={cn(
            "text-sm font-semibold",
            item.amount >= 0 ? 'text-success-fg' : 'text-danger-fg'
        )}>
          {item.amount >= 0 ? '+' : ''}${Math.abs(item.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
        </p>
        {getStatusBadge(item.status)}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <Card className={cn("h-full flex flex-col", config.className)}>
        <CardHeader className="pb-2 pt-3">
            <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center">
                    <History className="h-4 w-4 mr-2 text-primary" />
                    {config.title || 'Recent Transactions'}
                </CardTitle>
                <RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" />
            </div>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center text-muted-foreground">
          Loading transactions...
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
                    {config.title || 'Recent Transactions'}
                </CardTitle>
                <button onClick={fetchData} title="Retry loading transactions">
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

  if (!transactionsData || transactionsData.transactions.length === 0) {
     return (
        <Card className={cn("h-full flex flex-col", config.className)}>
            <CardHeader className="pb-2 pt-3">
                 <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold flex items-center">
                        <History className="h-4 w-4 mr-2 text-primary" />
                        {config.title || 'Recent Transactions'}
                    </CardTitle>
                    <button onClick={fetchData} title="Reload transactions">
                        <RefreshCw className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    </button>
                </div>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center text-muted-foreground">
                No recent transactions found.
            </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("h-full flex flex-col", config.className)}>
      <CardHeader className="pb-2 pt-3">
        <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center">
                <History className="h-4 w-4 mr-2 text-primary" />
                {config.title || 'Recent Transactions'}
            </CardTitle>
            <button onClick={fetchData} title="Refresh transactions">
                <RefreshCw className="h-4 w-4 text-muted-foreground hover:text-primary" />
            </button>
        </div>
        <CardDescription className="text-xs text-muted-foreground pt-0.5">
            Showing last {transactionsData.transactions.length} transactions. Last updated: {new Date(transactionsData.lastUpdated).toLocaleTimeString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow p-0 overflow-hidden">
        <ScrollArea className="h-full p-2">
            {transactionsData.transactions.map(renderTransactionItem)}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RecentTransactions; 