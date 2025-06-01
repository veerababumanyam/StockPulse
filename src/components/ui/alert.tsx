import * as React from 'react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'success' | 'warning';
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className = '', variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-background text-foreground border-border',
      destructive:
        'border-red-500/50 text-red-600 dark:border-red-500 [&>svg]:text-red-600',
      success:
        'border-green-500/50 text-green-600 dark:border-green-500 [&>svg]:text-green-600',
      warning:
        'border-yellow-500/50 text-yellow-600 dark:border-yellow-500 [&>svg]:text-yellow-600',
    };

    return (
      <div
        ref={ref}
        role="alert"
        className={`
          relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px]
          [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground
          ${variants[variant]} ${className}
        `}
        {...props}
      />
    );
  },
);

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className = '', ...props }, ref) => (
  <h5
    ref={ref}
    className={`mb-1 font-medium leading-none tracking-tight ${className}`}
    {...props}
  />
));

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className = '', ...props }, ref) => (
  <div
    ref={ref}
    className={`text-sm [&_p]:leading-relaxed ${className}`}
    {...props}
  />
));

Alert.displayName = 'Alert';
AlertTitle.displayName = 'AlertTitle';
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
