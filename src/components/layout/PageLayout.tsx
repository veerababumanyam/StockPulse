import React from 'react';
import { cn } from '../../utils/cn';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

/**
 * Standardized page layout component that uses theme system colors
 * All pages should use this for consistent styling
 */
export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  subtitle,
  headerActions,
  className,
  containerClassName,
}) => {
  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {/* Header Section */}
      {(title || subtitle || headerActions) && (
        <div className="bg-surface border-b border-border">
          <div
            className={cn(
              'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6',
              containerClassName,
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                {title && (
                  <h1 className="text-2xl font-bold text-text">{title}</h1>
                )}
                {subtitle && <p className="text-text/60 mt-1">{subtitle}</p>}
              </div>
              {headerActions && (
                <div className="flex items-center space-x-2">
                  {headerActions}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        className={cn(
          'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8',
          containerClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
};

/**
 * Standardized card component using theme system
 */
interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = 'md',
  hover = false,
}) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={cn(
        'bg-surface border border-border rounded-lg shadow-sm',
        paddingClasses[padding],
        hover && 'hover:shadow-md transition-shadow duration-200',
        className,
      )}
    >
      {children}
    </div>
  );
};

/**
 * Standardized alert component using theme system
 */
interface AlertProps {
  children: React.ReactNode;
  variant?: 'success' | 'error' | 'warning' | 'info';
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'info',
  className,
}) => {
  const variantClasses = {
    success: 'bg-surface border-accent text-text',
    error: 'bg-surface border-secondary text-text',
    warning: 'bg-surface border-primary text-text',
    info: 'bg-surface border-border text-text',
  };

  return (
    <div
      className={cn(
        'border-l-4 p-4 rounded-r-lg',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </div>
  );
};

export default PageLayout;
