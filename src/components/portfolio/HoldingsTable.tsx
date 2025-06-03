/**
 * Holdings Table Component
 * Advanced table component for displaying portfolio positions with sorting,
 * filtering, pagination, and accessibility features
 */
import React, { useState, useCallback, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Plus,
  Minus,
  Activity,
  AlertCircle,
  Eye,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Settings,
} from "lucide-react";
import {
  Position,
  HoldingsFilter,
  TableState,
  HoldingsSortBy,
  SortDirection,
  PositionAction,
  RealtimeData,
} from "../../types/portfolio";
import {
  formatCurrency,
  formatPercentage,
} from "../../utils/portfolioCalculations";
import ValueChangeDisplay from "../ui/ValueChangeDisplay";
import { cn } from "../../utils/cn";

interface HoldingsTableProps {
  positions: Position[];
  tableState: TableState;
  realtimeData?: RealtimeData | null;
  isLoading?: boolean;
  isRefreshing?: boolean;
  enableQuickActions?: boolean;
  enableExport?: boolean;
  compactMode?: boolean;
  onUpdateTableState: (state: Partial<TableState>) => void;
  onUpdateFilters: (filters: Partial<HoldingsFilter>) => void;
  onPositionAction?: (action: PositionAction) => void;
  onExport?: () => void;
  onRefresh?: () => void;
  className?: string;
}

// Sort indicator component
const SortIndicator: React.FC<{
  column: HoldingsSortBy;
  currentSort: HoldingsSortBy;
  currentDirection: SortDirection;
}> = ({ column, currentSort, currentDirection }) => {
  if (currentSort !== column) {
    return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />;
  }

  return currentDirection === "asc" ? (
    <ChevronUp className="ml-2 h-4 w-4" />
  ) : (
    <ChevronDown className="ml-2 h-4 w-4" />
  );
};

// Real-time price indicator
const RealTimePriceIndicator: React.FC<{
  symbol: string;
  currentPrice: number;
  realtimeData?: RealtimeData | null;
}> = ({ symbol, currentPrice, realtimeData }) => {
  const realtimePrice = realtimeData?.prices[symbol];

  if (!realtimePrice) {
    return <span className="text-xs text-muted-foreground">Static</span>;
  }

  const isUpdated = Math.abs(realtimePrice.currentPrice - currentPrice) > 0.01;

  return (
    <div className="flex items-center gap-1">
      <div
        className={cn(
          "w-2 h-2 rounded-full",
          isUpdated ? "bg-green-500 animate-pulse" : "bg-gray-400",
        )}
      />
      <span className="text-xs text-muted-foreground">
        {isUpdated ? "Live" : "Static"}
      </span>
    </div>
  );
};

// Position row component with actions
const PositionRow: React.FC<{
  position: Position;
  realtimeData?: RealtimeData | null;
  enableQuickActions: boolean;
  compactMode: boolean;
  onAction?: (action: PositionAction) => void;
}> = React.memo(
  ({ position, realtimeData, enableQuickActions, compactMode, onAction }) => {
    const [showActions, setShowActions] = useState(false);

    const handleAction = useCallback(
      (actionType: PositionAction["type"]) => {
        onAction?.({
          type: actionType,
          symbol: position.symbol,
          data: position,
        });
        setShowActions(false);
      },
      [onAction, position],
    );

    // Get real-time price if available
    const realtimePrice = realtimeData?.prices[position.symbol];
    const displayPrice = realtimePrice?.currentPrice ?? position.currentPrice;
    const displayChange = realtimePrice?.change ?? position.dayChange;
    const displayChangePercentage =
      realtimePrice?.changePercentage ?? position.dayChangePercentage;

    return (
      <tr
        className="border-b border-border hover:bg-muted/50 transition-colors"
        role="row"
      >
        {/* Symbol & Company */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center space-x-3">
            <div>
              <div className="text-sm font-medium text-foreground">
                {position.symbol}
              </div>
              {!compactMode && (
                <div className="text-xs text-muted-foreground truncate max-w-32">
                  {position.companyName}
                </div>
              )}
            </div>
            {position.sector && !compactMode && (
              <Badge variant="outline" className="text-xs">
                {position.sector}
              </Badge>
            )}
          </div>
        </td>

        {/* Shares */}
        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
          {position.shares.toLocaleString()}
        </td>

        {/* Average Cost */}
        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
          {formatCurrency(position.avgCost)}
        </td>

        {/* Current Price */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="space-y-1">
            <div className="text-sm font-medium text-foreground">
              {formatCurrency(displayPrice)}
            </div>
            {!compactMode && (
              <RealTimePriceIndicator
                symbol={position.symbol}
                currentPrice={position.currentPrice}
                realtimeData={realtimeData}
              />
            )}
          </div>
        </td>

        {/* Market Value & Weight */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="space-y-1">
            <div className="text-sm font-medium text-foreground">
              {formatCurrency(position.marketValue)}
            </div>
            {position.weight && !compactMode && (
              <div className="text-xs text-muted-foreground">
                {position.weight.toFixed(1)}% of portfolio
              </div>
            )}
          </div>
        </td>

        {/* Gain/Loss */}
        <td className="px-6 py-4 whitespace-nowrap">
          <ValueChangeDisplay
            value={position.gainLoss}
            changePercentage={position.gainLossPercentage}
            currency={true}
            size="sm"
            showArrow={true}
          />
        </td>

        {/* Day Change */}
        {!compactMode && (
          <td className="px-6 py-4 whitespace-nowrap">
            <ValueChangeDisplay
              value={displayChange ?? 0}
              changePercentage={displayChangePercentage ?? 0}
              currency={true}
              size="sm"
              showArrow={true}
            />
          </td>
        )}

        {/* Actions */}
        {enableQuickActions && (
          <td className="px-6 py-4 whitespace-nowrap text-right">
            <div className="relative">
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => setShowActions(!showActions)}
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>

              {showActions && (
                <div className="absolute right-0 top-8 z-10 w-48 bg-background border border-border rounded-md shadow-md py-1">
                  <button
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center"
                    onClick={() => handleAction("VIEW_DETAILS")}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </button>
                  <button
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center"
                    onClick={() => handleAction("BUY_MORE")}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Buy More
                  </button>
                  <button
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center"
                    onClick={() => handleAction("SELL")}
                  >
                    <Minus className="mr-2 h-4 w-4" />
                    Sell Position
                  </button>
                  <div className="border-t border-border my-1" />
                  <button
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center"
                    onClick={() => handleAction("SET_ALERT")}
                  >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Set Alert
                  </button>
                  <button
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center"
                    onClick={() => handleAction("ANALYZE")}
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Analyze
                  </button>
                </div>
              )}
            </div>
          </td>
        )}
      </tr>
    );
  },
);

PositionRow.displayName = "PositionRow";

// Main Holdings Table component
export const HoldingsTable: React.FC<HoldingsTableProps> = React.memo(
  ({
    positions,
    tableState,
    realtimeData,
    isLoading = false,
    isRefreshing = false,
    enableQuickActions = true,
    enableExport = true,
    compactMode = false,
    onUpdateTableState,
    onUpdateFilters,
    onPositionAction,
    onExport,
    onRefresh,
    className,
  }) => {
    // Pagination calculations
    const startIndex = (tableState.page - 1) * tableState.pageSize;
    const endIndex = startIndex + tableState.pageSize;
    const paginatedPositions = positions.slice(startIndex, endIndex);

    // Handle column sorting
    const handleSort = useCallback(
      (column: HoldingsSortBy) => {
        const newDirection: SortDirection =
          tableState.sortBy === column && tableState.sortDirection === "desc"
            ? "asc"
            : "desc";

        onUpdateTableState({
          sortBy: column,
          sortDirection: newDirection,
          page: 1, // Reset to first page
        });

        onUpdateFilters({
          sortBy: column,
          sortDirection: newDirection,
        });
      },
      [
        tableState.sortBy,
        tableState.sortDirection,
        onUpdateTableState,
        onUpdateFilters,
      ],
    );

    // Handle search
    const handleSearchChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        onUpdateFilters({
          searchTerm: event.target.value,
        });
        onUpdateTableState({ page: 1 });
      },
      [onUpdateFilters, onUpdateTableState],
    );

    // Handle filter changes
    const handleFilterChange = useCallback(
      (key: keyof HoldingsFilter, value: any) => {
        onUpdateFilters({ [key]: value });
        onUpdateTableState({ page: 1 });
      },
      [onUpdateFilters, onUpdateTableState],
    );

    // Handle pagination
    const handlePageChange = useCallback(
      (page: number) => {
        onUpdateTableState({ page });
      },
      [onUpdateTableState],
    );

    // Handle page size change
    const handlePageSizeChange = useCallback(
      (pageSize: number) => {
        onUpdateTableState({
          pageSize,
          page: 1, // Reset to first page
        });
      },
      [onUpdateTableState],
    );

    // Get unique sectors for filtering
    const sectors = useMemo(() => {
      const uniqueSectors = [
        ...new Set(positions.map((p) => p.sector).filter(Boolean)),
      ];
      return uniqueSectors.sort();
    }, [positions]);

    if (isLoading) {
      return (
        <Card className={className}>
          <CardHeader>
            <div className="space-y-2">
              <div className="h-6 w-32 bg-muted rounded animate-pulse" />
              <div className="h-4 w-48 bg-muted rounded animate-pulse" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Filter skeleton */}
              <div className="flex gap-2">
                <div className="h-10 flex-1 bg-muted rounded animate-pulse" />
                <div className="h-10 w-32 bg-muted rounded animate-pulse" />
                <div className="h-10 w-24 bg-muted rounded animate-pulse" />
              </div>

              {/* Table skeleton */}
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 bg-muted rounded animate-pulse"
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Holdings
                {realtimeData && (
                  <Badge variant="outline" className="text-xs">
                    <Activity className="w-3 h-3 mr-1" />
                    Live Data
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {tableState.totalItems} position
                {tableState.totalItems !== 1 ? "s" : ""}
                {positions.length !== tableState.totalItems && (
                  <span> • {positions.length} shown</span>
                )}
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              {enableExport && onExport && (
                <Button variant="outline" size="sm" onClick={onExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              )}
              {onRefresh && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw
                    className={cn("w-4 h-4", isRefreshing && "animate-spin")}
                  />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                size={16}
              />
              <Input
                placeholder="Search positions..."
                value={tableState.filters.searchTerm}
                onChange={handleSearchChange}
                className="pl-9"
                aria-label="Search positions"
              />
            </div>

            {/* Sector Filter */}
            <Select
              value={tableState.filters.sector || "all"}
              onValueChange={(value) =>
                handleFilterChange(
                  "sector",
                  value === "all" ? undefined : value,
                )
              }
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Sectors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sectors</SelectItem>
                {sectors.map((sector) => (
                  <SelectItem key={sector} value={sector}>
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Profitable Only Filter */}
            <Button
              variant={
                tableState.filters.profitableOnly ? "default" : "outline"
              }
              size="sm"
              onClick={() =>
                handleFilterChange(
                  "profitableOnly",
                  !tableState.filters.profitableOnly,
                )
              }
              className="gap-2"
            >
              <Filter size={14} />
              Profitable Only
            </Button>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/30">
                  <tr role="row">
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("symbol")}
                    >
                      <div className="flex items-center">
                        Symbol
                        <SortIndicator
                          column="symbol"
                          currentSort={tableState.sortBy || "marketValue"}
                          currentDirection={tableState.sortDirection || "desc"}
                        />
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("shares")}
                    >
                      <div className="flex items-center">
                        Shares
                        <SortIndicator
                          column="shares"
                          currentSort={tableState.sortBy || "marketValue"}
                          currentDirection={tableState.sortDirection || "desc"}
                        />
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("avgCost")}
                    >
                      <div className="flex items-center">
                        Avg. Cost
                        <SortIndicator
                          column="avgCost"
                          currentSort={tableState.sortBy || "marketValue"}
                          currentDirection={tableState.sortDirection || "desc"}
                        />
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("currentPrice")}
                    >
                      <div className="flex items-center">
                        Current Price
                        <SortIndicator
                          column="currentPrice"
                          currentSort={tableState.sortBy || "marketValue"}
                          currentDirection={tableState.sortDirection || "desc"}
                        />
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("marketValue")}
                    >
                      <div className="flex items-center">
                        Market Value
                        <SortIndicator
                          column="marketValue"
                          currentSort={tableState.sortBy || "marketValue"}
                          currentDirection={tableState.sortDirection || "desc"}
                        />
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("gainLoss")}
                    >
                      <div className="flex items-center">
                        Gain/Loss
                        <SortIndicator
                          column="gainLoss"
                          currentSort={tableState.sortBy || "marketValue"}
                          currentDirection={tableState.sortDirection || "desc"}
                        />
                      </div>
                    </th>
                    {!compactMode && (
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort("dayChange")}
                      >
                        <div className="flex items-center">
                          Day Change
                          <SortIndicator
                            column="dayChange"
                            currentSort={tableState.sortBy || "marketValue"}
                            currentDirection={
                              tableState.sortDirection || "desc"
                            }
                          />
                        </div>
                      </th>
                    )}
                    {enableQuickActions && (
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody
                  className="bg-background divide-y divide-border"
                  role="rowgroup"
                >
                  {paginatedPositions.length === 0 ? (
                    <tr>
                      <td
                        colSpan={
                          enableQuickActions
                            ? compactMode
                              ? 7
                              : 8
                            : compactMode
                              ? 6
                              : 7
                        }
                        className="px-6 py-12 text-center text-muted-foreground"
                      >
                        {tableState.filters.searchTerm ||
                        tableState.filters.profitableOnly ||
                        tableState.filters.sector
                          ? "No positions match your filters"
                          : "No positions found"}
                      </td>
                    </tr>
                  ) : (
                    paginatedPositions.map((position) => (
                      <PositionRow
                        key={position.id}
                        position={position}
                        realtimeData={realtimeData}
                        enableQuickActions={enableQuickActions}
                        compactMode={compactMode}
                        onAction={onPositionAction}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {tableState.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Rows per page:
                </span>
                <Select
                  value={tableState.pageSize.toString()}
                  onValueChange={(value) =>
                    handlePageSizeChange(parseInt(value))
                  }
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {startIndex + 1}-{Math.min(endIndex, tableState.totalItems)}{" "}
                  of {tableState.totalItems}
                </span>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(tableState.page - 1)}
                    disabled={tableState.page <= 1}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <span className="text-sm px-2">
                    Page {tableState.page} of {tableState.totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(tableState.page + 1)}
                    disabled={tableState.page >= tableState.totalPages}
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  },
);

HoldingsTable.displayName = "HoldingsTable";

export default HoldingsTable;
