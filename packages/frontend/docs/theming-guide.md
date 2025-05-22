# StockPulse Theming Guide

This guide explains how to implement theme-aware components in StockPulse to ensure all UI elements adapt properly to theme changes.

## Theme System Overview

StockPulse uses a centralized theming system with:

1. CSS variables for colors and design tokens
2. Theme-aware utility classes and components
3. Responsive design patterns that work across all device sizes

## How Themes Work

- **Theme Mode**: Light or dark mode (`light` | `dark`)
- **Theme Color**: Primary color scheme (`magenta` | `teal` | `indigo` | `amber` | `emerald` | `rose`)
- **Theme Context**: Manages theme state and localStorage persistence

## Best Practices

### 1. Use Theme-Aware Tailwind Classes

```tsx
// ❌ AVOID - Hardcoded colors
<div className="bg-white text-gray-800">
  <h2 className="text-black">Title</h2>
</div>

// ✅ CORRECT - Theme-aware classes
<div className="bg-card text-card-foreground">
  <h2 className="text-foreground">Title</h2>
</div>
```

### 2. Use Theme Utility Functions

We provide utility functions in `src/lib/theme-utils.ts` to help with theme-aware styling:

```tsx
import { getCardColorClasses, getAdaptiveClasses } from '@/lib/theme-utils';

// Get theme-adaptive styles
const adaptiveClasses = getAdaptiveClasses();

// Apply theme-aware card styling
<div className={`p-3 rounded-lg ${getCardColorClasses('volume')}`}>
  Content
</div>
```

### 3. Use Theme Card Components

For consistent card styling, use the `ThemeCard` component:

```tsx
import {
  ThemeCard,
  ThemeCardHeader,
  ThemeCardTitle,
  ThemeCardContent
} from '@/components/ui/theme-card';

<ThemeCard>
  <ThemeCardHeader>
    <ThemeCardTitle>Card Title</ThemeCardTitle>
  </ThemeCardHeader>
  <ThemeCardContent>
    Card content goes here
  </ThemeCardContent>
</ThemeCard>
```

### 4. Theme-Aware Text Colors

Always use theme-aware text colors:

```tsx
// ❌ AVOID
<p className="text-gray-600">Text content</p>

// ✅ CORRECT
<p className="text-foreground">Main text</p>
<p className="text-muted-foreground">Secondary text</p>
```

## Common Theme Variables

### Background Colors
- `bg-background` - Page background
- `bg-card` - Card background
- `bg-muted` - Muted/secondary background
- `bg-accent` - Accent background

### Text Colors
- `text-foreground` - Primary text
- `text-muted-foreground` - Secondary/muted text
- `text-primary` - Themed primary color text
- `text-secondary` - Themed secondary color text

### Border and Decorative Elements
- `border-border` - Standard border color
- `border-primary` - Themed primary border
- `border-secondary` - Themed secondary border

## Handling Special Cases

### Dynamic Color Based on Value

```tsx
// Price change indicator example
<span className={isPriceUp ? adaptiveClasses.positiveValue : adaptiveClasses.negativeValue}>
  {priceChange}%
</span>
```

### Dark Mode Only Overrides

```tsx
<div className="bg-white dark:bg-gray-800">
  Content adapts to both light and dark modes
</div>
```

## Theme Debug Utilities

To visualize theme colors in development:

```tsx
import { useTheme } from '@/contexts/ThemeContext';

const ThemeDebug = () => {
  const { themeMode, themeColor } = useTheme();

  return (
    <div className="space-y-2">
      <div>Current theme: {themeMode} / {themeColor}</div>
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 bg-primary text-primary-foreground">Primary</div>
        <div className="p-2 bg-secondary text-secondary-foreground">Secondary</div>
        <div className="p-2 bg-card text-card-foreground border border-border">Card</div>
        <div className="p-2 bg-muted text-muted-foreground">Muted</div>
      </div>
    </div>
  );
};
```

## Implementation Checklist

When creating new components:

- [ ] Use theme-aware color classes (`bg-card`, `text-foreground`, etc.)
- [ ] Test in both light and dark modes
- [ ] Test across all color themes
- [ ] Ensure proper contrast for text readability
- [ ] Use proper semantic HTML elements
- [ ] Implement responsive design patterns
- [ ] Use existing theme utilities and components when possible

## Updates to Theming System

StockPulse now uses a centralized theming system to ensure all UI elements consistently adapt to theme changes. This new approach eliminates visibility issues and makes theme management easier.

### Core Components

1. **CSS Variables**: All theme colors are defined as CSS variables in `index.css` and automatically adapt to light/dark modes
2. **Theme Constants**: Centralized in `theme-constants.ts`
3. **Theme Utilities**: Helper functions in `theme-utils.ts`
4. **ThemeContext**: Manages theme state and provides the `useTheme()` hook

### How to Apply Theme-Aware Styles

Instead of hardcoding colors or using direct CSS variables, use the following approach:

```tsx
// 1. Import the theme utilities
import { themeClasses } from '@/lib/theme-constants';
import { getAdaptiveClasses, getValueBasedClasses } from '@/lib/theme-utils';

// 2. Use theme classes for container elements
<div className={themeClasses.container.card}>
  {/* Content */}
</div>

// 3. Use theme classes for text elements
<h2 className={themeClasses.text.primary}>Title</h2>
<p className={themeClasses.text.secondary}>Description</p>

// 4. Use adaptive classes for common patterns
const adaptiveClasses = getAdaptiveClasses();
<div className={adaptiveClasses.dataContainer}>
  {/* Data content */}
</div>

// 5. Use value-based classes for dynamic styling
<span className={getValueBasedClasses(changeValue)}>
  {changeValue}%
</span>
```

### Real-World Example

Here's how to implement a card component with proper theme awareness:

```tsx
import { themeClasses } from '@/lib/theme-constants';
import { getValueBasedClasses } from '@/lib/theme-utils';

const DataCard = ({ title, value, change }) => {
  return (
    <div className={themeClasses.container.card}>
      <h3 className={themeClasses.text.primary}>{title}</h3>
      <div className={themeClasses.text.primary}>{value}</div>
      <div className={getValueBasedClasses(change, { showBackground: true })}>
        {change > 0 ? '+' : ''}{change}%
      </div>
    </div>
  );
};
```

### CSS Variables

The theme system exposes the following CSS variables that automatically adjust based on the current theme:

#### Base Theme Variables
- `--background`, `--foreground`: Base page colors
- `--card`, `--card-foreground`: Card element colors
- `--muted`, `--muted-foreground`: Muted/secondary element colors
- `--accent`, `--accent-foreground`: Accent element colors
- `--primary`, `--primary-foreground`: Primary brand colors
- `--secondary`, `--secondary-foreground`: Secondary brand colors
- `--destructive`, `--destructive-foreground`: Error/destructive action colors
- `--border`: Border color

#### StockPulse Brand Colors
All brand colors have light/dark variants that adjust automatically:
- `--stockpulse-blue`, `--stockpulse-blue-light`, `--stockpulse-blue-dark`
- `--stockpulse-purple`, `--stockpulse-purple-light`, `--stockpulse-purple-dark`
- `--stockpulse-green`, `--stockpulse-green-light`, `--stockpulse-green-dark`
- `--stockpulse-coral`, `--stockpulse-coral-light`, `--stockpulse-coral-dark`
- `--stockpulse-gold`, `--stockpulse-gold-light`, `--stockpulse-gold-dark`
