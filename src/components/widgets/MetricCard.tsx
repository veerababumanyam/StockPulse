import React, { ReactNode } from 'react';
import { cn } from '../../utils/cn';

type MetricCardVariant = 'default' | 'warning' | 'success' | 'danger';

interface MetricCardProps {
  children: ReactNode;
  className?: string;
  variant?: MetricCardVariant;
  onClick?: () => void;
}

export const MetricCard = ({
  children,
  className,
  variant = 'default',
  onClick,
  ...props
}: MetricCardProps) => {
  const variantClasses = {
    default: 'bg-surface-subtle border-border-subtle',
    warning: 'bg-warning-muted/30 border-warning-subtle',
    success: 'bg-success-muted/30 border-success-subtle',
    danger: 'bg-danger-muted/30 border-danger-subtle',
  };

  return (
    <div
      className={cn(
        'p-4 rounded-md border flex-1 min-w-[180px] transition-colors',
        variantClasses[variant],
        onClick && 'cursor-pointer hover:opacity-90',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

type IconType = React.ForwardRefExoticComponent<
  Omit<React.SVGProps<SVGSVGElement>, 'ref'> & {
    size?: string | number;
    className?: string;
  } & React.RefAttributes<SVGSVGElement>
>;

interface MetricItemProps {
  value: ReactNode;
  label: string;
  icon: IconType;
  change?: string;
  isPositive?: boolean;
  className?: string;
}

export const MetricItem = ({
  value,
  label,
  icon: Icon,
  change,
  isPositive,
  className,
}: MetricItemProps) => {
  return (
    <MetricCard className={className}>
      <div className="flex flex-col gap-1">
        <div 
          className={cn(
            'text-lg font-bold',
            change && (isPositive ? 'text-success-fg' : 'text-danger-fg'),
            !change && 'text-primary'
          )}
        >
          {value}
        </div>
        <div className="text-sm text-secondary flex items-center gap-2">
          <Icon size={16} className="flex-shrink-0" />
          <span className="truncate">{label}</span>
        </div>
        {change && (
          <div className={cn(
            'text-xs mt-1',
            isPositive ? 'text-success-fg' : 'text-danger-fg'
          )}>
            {change}
          </div>
        )}
      </div>
    </MetricCard>
  );
};

export default MetricCard;
