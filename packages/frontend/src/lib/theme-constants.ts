import { ThemeMode } from './theme';

/**
 * CSS variable mapping for theme colors
 * These map directly to the CSS variables defined in index.css
 */
export const themeVars = {
  // Base
  background: 'var(--background)',
  foreground: 'var(--foreground)',

  // Card
  card: 'var(--card)',
  cardForeground: 'var(--card-foreground)',

  // Primary
  primary: 'var(--primary)',
  primaryForeground: 'var(--primary-foreground)',

  // Secondary
  secondary: 'var(--secondary)',
  secondaryForeground: 'var(--secondary-foreground)',

  // Accent
  accent: 'var(--accent)',
  accentForeground: 'var(--accent-foreground)',

  // Muted
  muted: 'var(--muted)',
  mutedForeground: 'var(--muted-foreground)',

  // Destructive
  destructive: 'var(--destructive)',
  destructiveForeground: 'var(--destructive-foreground)',

  // Border
  border: 'var(--border)',

  // Misc
  ring: 'var(--ring)',
  radius: 'var(--radius)',
} as const;

/**
 * StockPulse color palette with theme-aware colors
 */
export const colors = {
  // Brand colors with light/dark variants
  stockpulse: {
    blue: {
      light: 'var(--stockpulse-blue-light)',
      DEFAULT: 'var(--stockpulse-blue)',
      dark: 'var(--stockpulse-blue-dark)',
    },
    purple: {
      light: 'var(--stockpulse-purple-light)',
      DEFAULT: 'var(--stockpulse-purple)',
      dark: 'var(--stockpulse-purple-dark)',
    },
    green: {
      light: 'var(--stockpulse-green-light)',
      DEFAULT: 'var(--stockpulse-green)',
      dark: 'var(--stockpulse-green-dark)',
    },
    coral: {
      light: 'var(--stockpulse-coral-light)',
      DEFAULT: 'var(--stockpulse-coral)',
      dark: 'var(--stockpulse-coral-dark)',
    },
    gold: {
      light: 'var(--stockpulse-gold-light)',
      DEFAULT: 'var(--stockpulse-gold)',
      dark: 'var(--stockpulse-gold-dark)',
    },
  },

  // Semantic colors
  semantic: {
    positive: 'var(--stockpulse-green)',
    negative: 'var(--stockpulse-coral)',
    warning: 'var(--stockpulse-gold)',
    info: 'var(--stockpulse-blue)',
  }
} as const;

/**
 * CSS class mappings for common UI elements
 * This provides a consistent way to apply theme-aware styles
 */
export const themeClasses = {
  // Text styles
  text: {
    primary: 'text-foreground',
    secondary: 'text-muted-foreground',
    accent: 'text-accent-foreground',
    link: 'text-primary hover:underline',
    positive: 'text-stockpulse-green-dark dark:text-stockpulse-green-light',
    negative: 'text-stockpulse-coral-dark dark:text-stockpulse-coral-light',
  },

  // Background styles
  bg: {
    primary: 'bg-background',
    secondary: 'bg-muted',
    card: 'bg-card',
    accent: 'bg-accent',
    highlight: 'bg-primary/10',
  },

  // Container styles
  container: {
    card: 'bg-card rounded-lg border border-border shadow-sm',
    panel: 'bg-background rounded-lg border border-border p-4',
    glass: 'bg-background/70 backdrop-blur-sm border border-border/20',
    data: 'bg-muted/50 dark:bg-muted/20 rounded-md p-3',
  },

  // Interactive element styles
  interactive: {
    hover: 'hover:bg-accent/50 transition-colors duration-200',
    active: 'bg-accent/50',
    focus: 'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2',
  },
};

/**
 * Get appropriate theme-aware classes based on current theme
 * @param mode Optional override for current theme
 */
export function getThemeClasses(mode?: ThemeMode) {
  return {
    ...themeClasses,
    // Add any mode-specific overrides here if needed
  };
}
