import * as React from 'react';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    { className = '', value = 0, max = 100, variant = 'default', ...props },
    ref,
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const variants = {
      default: 'bg-primary',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      destructive: 'bg-red-500',
    };

    return (
      <div
        ref={ref}
        className={`relative h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 ${className}`}
        {...props}
      >
        <div
          className={`h-full w-full flex-1 transition-all duration-300 ease-in-out ${variants[variant]}`}
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        />
        {percentage > 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-white mix-blend-difference">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
      </div>
    );
  },
);

Progress.displayName = 'Progress';

export { Progress };
