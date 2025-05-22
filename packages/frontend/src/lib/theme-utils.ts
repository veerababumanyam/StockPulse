import { ThemeMode } from './theme';
import { themeClasses } from './theme-constants';

/**
 * Theme-aware color variants for card backgrounds
 */
export interface CardColorVariant {
  bgLight: string;
  bgDark: string;
  textLight: string;
  textDark: string;
}

/**
 * Stock display card colors that automatically adapt to theme changes
 */
export const cardVariants = {
  volume: {
    bgLight: 'bg-stockpulse-pastel-blue',
    bgDark: 'dark:bg-stockpulse-blue-dark/20',
    textLight: 'text-stockpulse-blue-dark',
    textDark: 'dark:text-stockpulse-blue-light'
  },
  marketCap: {
    bgLight: 'bg-stockpulse-pastel-purple',
    bgDark: 'dark:bg-stockpulse-purple-dark/20',
    textLight: 'text-stockpulse-purple-dark',
    textDark: 'dark:text-stockpulse-purple-light'
  },
  peRatio: {
    bgLight: 'bg-stockpulse-pastel-yellow',
    bgDark: 'dark:bg-stockpulse-gold-dark/20',
    textLight: 'text-stockpulse-gold-dark',
    textDark: 'dark:text-stockpulse-gold-light'
  },
  dividend: {
    bgLight: 'bg-stockpulse-pastel-orange',
    bgDark: 'dark:bg-stockpulse-coral-dark/20',
    textLight: 'text-stockpulse-coral-dark',
    textDark: 'dark:text-stockpulse-coral-light'
  },
  priceUp: {
    bgLight: 'bg-stockpulse-pastel-green',
    bgDark: 'dark:bg-stockpulse-green-dark/20',
    textLight: 'text-stockpulse-green-dark',
    textDark: 'dark:text-stockpulse-green-light'
  },
  priceDown: {
    bgLight: 'bg-stockpulse-pastel-pink',
    bgDark: 'dark:bg-stockpulse-coral-dark/20',
    textLight: 'text-stockpulse-coral-dark',
    textDark: 'dark:text-stockpulse-coral-light'
  }
};

/**
 * Get theme-aware class names for a card variant
 * @param variant The color variant to use
 * @returns A string of Tailwind classes for both light and dark modes
 */
export function getCardColorClasses(variant: keyof typeof cardVariants): string {
  const colors = cardVariants[variant];
  return `${colors.bgLight} ${colors.bgDark} ${colors.textLight} ${colors.textDark}`;
}

/**
 * Get theme-aware text classes that adapt to both light and dark themes
 * @param mode Optional override for the current theme mode
 * @returns Object with class mappings for common text elements
 */
export function getThemeTextClasses(mode?: ThemeMode) {
  return themeClasses.text;
}

/**
 * Generate CSS variables for custom colors
 * @param colorName The base name for the CSS variable
 * @param lightValue The light theme value
 * @param darkValue The dark theme value
 * @returns A style object with CSS variable definitions
 */
export function createThemeColorVars(colorName: string, lightValue: string, darkValue: string): Record<string, string> {
  return {
    [`--${colorName}-light`]: lightValue,
    [`--${colorName}-dark`]: darkValue,
    [`--${colorName}`]: `var(--${colorName}-light)`,
    [`.dark .dark\\:--${colorName}`]: `var(--${colorName}-dark)`,
  };
}

/**
 * Get CSS classes that will automatically adapt to theme changes
 */
export function getAdaptiveClasses() {
  return {
    container: themeClasses.container.card,
    panel: themeClasses.container.panel,
    dataContainer: themeClasses.container.data,
    cardHighlight: 'border-l-4 border-primary',
    positiveValue: themeClasses.text.positive,
    negativeValue: themeClasses.text.negative,
    neutralValue: themeClasses.text.primary,
    buttonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    buttonSecondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
    buttonOutline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  };
}

/**
 * Apply theme-aware colors to a component based on a value or condition
 * @param value The value to evaluate
 * @param options Configuration options for theming
 * @returns Appropriate theme-aware CSS classes
 */
export function getValueBasedClasses(
  value: number,
  options: {
    neutral?: boolean,
    showBackground?: boolean,
    prefix?: string
  } = {}
) {
  const { neutral = false, showBackground = false, prefix = '' } = options;

  if (neutral) {
    return themeClasses.text.primary;
  }

  if (value > 0) {
    return showBackground
      ? `${themeClasses.text.positive} ${prefix && `${prefix}-`}bg-stockpulse-green/10`
      : themeClasses.text.positive;
  }

  if (value < 0) {
    return showBackground
      ? `${themeClasses.text.negative} ${prefix && `${prefix}-`}bg-stockpulse-coral/10`
      : themeClasses.text.negative;
  }

  return themeClasses.text.primary;
}

/**
 * Create theme-aware styles for charts and visualizations
 */
export function getChartThemeColors() {
  return {
    gridLines: 'var(--border)',
    axis: 'var(--muted-foreground)',
    tooltip: {
      background: 'var(--card)',
      text: 'var(--card-foreground)',
      border: 'var(--border)',
    },
    series: {
      primary: 'var(--primary)',
      secondary: 'var(--secondary)',
      positive: 'var(--stockpulse-green)',
      negative: 'var(--stockpulse-coral)',
      volume: 'var(--stockpulse-blue)',
    }
  };
}
