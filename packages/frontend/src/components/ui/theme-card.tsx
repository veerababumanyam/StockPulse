import React, { ReactNode } from 'react';
import { getCardColorClasses } from '@/lib/theme-utils';
import { cn } from '@/lib/utils';

export interface ThemeCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: keyof ReturnType<typeof getVariants>;
  colorVariant?: keyof typeof colorVariants;
  highlight?: boolean;
  bordered?: boolean;
  shadow?: boolean | 'sm' | 'md' | 'lg';
}

// Card style variants
const getVariants = () => ({
  default: 'bg-card text-card-foreground rounded-lg',
  glass: 'bg-background/70 backdrop-blur-sm text-foreground rounded-lg',
  muted: 'bg-muted/50 text-foreground rounded-lg',
  accent: 'bg-accent text-accent-foreground rounded-lg',
  elevated: 'bg-card text-card-foreground rounded-lg shadow-md',
  outline: 'bg-transparent border border-border text-foreground rounded-lg',
});

// Color variants
const colorVariants = {
  volume: 'volume',
  marketCap: 'marketCap',
  peRatio: 'peRatio',
  dividend: 'dividend',
  priceUp: 'priceUp',
  priceDown: 'priceDown',
} as const;

const ThemeCard = ({
  children,
  variant = 'default',
  colorVariant,
  highlight = false,
  bordered = true,
  shadow = false,
  className,
  ...props
}: ThemeCardProps) => {
  const variants = getVariants();
  const shadowClass = shadow === true ? 'shadow-md' : shadow ? `shadow-${shadow}` : '';
  const borderClass = bordered ? 'border border-border' : '';
  const highlightClass = highlight ? 'border-l-4 border-primary' : '';
  
  const colorVariantClass = colorVariant ? getCardColorClasses(colorVariant) : '';
  
  return (
    <div
      className={cn(
        variants[variant],
        borderClass,
        shadowClass,
        highlightClass,
        colorVariantClass,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export interface ThemeCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const ThemeCardHeader = ({
  children,
  className,
  ...props
}: ThemeCardHeaderProps) => {
  return (
    <div
      className={cn('p-4 flex flex-col space-y-1.5', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export interface ThemeCardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}

const ThemeCardTitle = ({
  children,
  className,
  ...props
}: ThemeCardTitleProps) => {
  return (
    <h3
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    >
      {children}
    </h3>
  );
};

export interface ThemeCardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

const ThemeCardDescription = ({
  children,
  className,
  ...props
}: ThemeCardDescriptionProps) => {
  return (
    <p
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    >
      {children}
    </p>
  );
};

export interface ThemeCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const ThemeCardContent = ({
  children,
  className,
  ...props
}: ThemeCardContentProps) => {
  return (
    <div
      className={cn('p-4 pt-0', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export interface ThemeCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const ThemeCardFooter = ({
  children,
  className,
  ...props
}: ThemeCardFooterProps) => {
  return (
    <div
      className={cn('flex items-center p-4 pt-0', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export {
  ThemeCard,
  ThemeCardHeader,
  ThemeCardTitle,
  ThemeCardDescription,
  ThemeCardContent,
  ThemeCardFooter,
}; 