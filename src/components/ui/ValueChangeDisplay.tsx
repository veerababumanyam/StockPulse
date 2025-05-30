/**
 * Value Change Display Component
 * Displays monetary values with change indicators, colors, and accessibility features
 * Supports multiple sizes and formats
 */
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../utils/tailwind';

// Component props
interface ValueChangeDisplayProps {
  value: number;
  change?: number;
  changePercentage?: number;
  currency?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showArrow?: boolean;
  showCurrency?: boolean;
  compact?: boolean;
  className?: string;
  'aria-label'?: string;
}

// Size configuration
const sizeConfig = {
  xs: {
    valueText: 'text-xs',
    changeText: 'text-xs',
    iconSize: 12,
    gap: 'gap-1',
  },
  sm: {
    valueText: 'text-sm',
    changeText: 'text-xs',
    iconSize: 14,
    gap: 'gap-1',
  },
  md: {
    valueText: 'text-base',
    changeText: 'text-sm',
    iconSize: 16,
    gap: 'gap-2',
  },
  lg: {
    valueText: 'text-2xl',
    changeText: 'text-sm',
    iconSize: 18,
    gap: 'gap-2',
  },
  xl: {
    valueText: 'text-3xl',
    changeText: 'text-base',
    iconSize: 20,
    gap: 'gap-2',
  },
};

// Color configuration
const getChangeColor = (change: number) => {
  if (change > 0) return 'text-green-600 dark:text-green-400';
  if (change < 0) return 'text-red-600 dark:text-red-400';
  return 'text-muted-foreground';
};

// Formatting utilities
const formatValue = (value: number, currency: boolean = false): string => {
  if (currency) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  }
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatChange = (change: number, currency: boolean = false): string => {
  const prefix = change > 0 ? '+' : '';
  
  if (currency) {
    return `${prefix}${new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(change)}`;
  }
  
  return `${prefix}${change.toFixed(2)}`;
};

const formatPercentage = (percentage: number): string => {
  const prefix = percentage > 0 ? '+' : '';
  return `${prefix}${percentage.toFixed(2)}%`;
};

// Main component
export const ValueChangeDisplay: React.FC<ValueChangeDisplayProps> = ({
  value,
  change,
  changePercentage,
  currency = false,
  size = 'md',
  showArrow = true,
  showCurrency = true,
  compact = false,
  className,
  'aria-label': ariaLabel,
}) => {
  const config = sizeConfig[size];
  
  // Determine which change value to use
  const displayChange = change !== undefined ? change : 0;
  const displayPercentage = changePercentage !== undefined ? changePercentage : 0;
  
  // Choose the most significant change indicator
  const hasChange = displayChange !== 0 || displayPercentage !== 0;
  const primaryChange = Math.abs(displayChange) > Math.abs(displayPercentage) ? displayChange : displayPercentage;
  
  // Generate accessible label
  const accessibleLabel = ariaLabel || 
    `${currency ? 'Value' : 'Amount'}: ${formatValue(value, currency)}${
      hasChange ? `, Change: ${
        displayChange !== 0 ? formatChange(displayChange, currency) : ''
      }${
        displayPercentage !== 0 ? ` (${formatPercentage(displayPercentage)})` : ''
      }` : ''
    }`;

  // Icon component
  const ChangeIcon = () => {
    if (!showArrow || !hasChange) return null;
    
    if (primaryChange > 0) {
      return <TrendingUp size={config.iconSize} className="text-green-600 dark:text-green-400" />;
    } else if (primaryChange < 0) {
      return <TrendingDown size={config.iconSize} className="text-red-600 dark:text-red-400" />;
    } else {
      return <Minus size={config.iconSize} className="text-muted-foreground" />;
    }
  };

  if (compact) {
    return (
      <div 
        className={cn("flex items-center", config.gap, className)}
        aria-label={accessibleLabel}
        role="status"
      >
        <span className={cn("font-bold", config.valueText)}>
          {showCurrency && currency ? formatValue(value, true) : value.toLocaleString()}
        </span>
        {hasChange && (
          <div className={cn("flex items-center gap-1", getChangeColor(primaryChange))}>
            <ChangeIcon />
            <span className={config.changeText}>
              {displayPercentage !== 0 ? formatPercentage(displayPercentage) : formatChange(displayChange, currency)}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className={cn("space-y-1", className)}
      aria-label={accessibleLabel}
      role="status"
    >
      {/* Main Value */}
      <div className={cn("font-bold", config.valueText)}>
        {showCurrency && currency ? formatValue(value, true) : value.toLocaleString()}
      </div>
      
      {/* Change Indicators */}
      {hasChange && (
        <div className={cn("flex items-center", config.gap, getChangeColor(primaryChange))}>
          <ChangeIcon />
          <div className={cn("flex items-center gap-1", config.changeText)}>
            {displayChange !== 0 && (
              <span>{formatChange(displayChange, currency)}</span>
            )}
            {displayChange !== 0 && displayPercentage !== 0 && (
              <span className="text-muted-foreground">•</span>
            )}
            {displayPercentage !== 0 && (
              <span>{formatPercentage(displayPercentage)}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Screen reader announcements for dynamic updates
export const announceValueChange = (value: number, change?: number, currency: boolean = false) => {
  const announcement = `Portfolio value updated to ${formatValue(value, currency)}${
    change !== undefined && change !== 0 
      ? `, change of ${formatChange(change, currency)}` 
      : ''
  }`;
  
  // Create a temporary element for screen reader announcement
  const announcer = document.createElement('div');
  announcer.setAttribute('aria-live', 'polite');
  announcer.setAttribute('aria-atomic', 'true');
  announcer.setAttribute('class', 'sr-only');
  announcer.textContent = announcement;
  
  document.body.appendChild(announcer);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcer);
  }, 1000);
};

export default ValueChangeDisplay; 