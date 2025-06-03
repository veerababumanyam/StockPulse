# WCAG AA+ Compliant Color Palette Usage

## Overview

The StockPulse dashboard uses a WCAG AA+ compliant color palette that ensures accessibility and proper contrast ratios across all components, including the navbar.

## Available Color Variables

### CSS Custom Properties

```css
/* Light Theme */
--dashboard-success: #059669; /* Green for positive values */
--dashboard-danger: #dc2626; /* Red for negative values */
--dashboard-warning: #d97706; /* Orange for neutral/warning */
--dashboard-primary: #1e40af; /* Blue for primary actions */

/* Dark Theme */
--dashboard-success: #10b981; /* Emerald 500 - brighter for dark backgrounds */
--dashboard-danger: #ef4444; /* Red 500 - brighter for dark backgrounds */
--dashboard-warning: #f59e0b; /* Amber 500 - brighter for dark backgrounds */
--dashboard-primary: #3b82f6; /* Blue 500 - brighter for dark backgrounds */
```

## Usage Examples

### In CSS

```css
/* Using CSS custom properties */
.success-indicator {
  color: var(--dashboard-success);
  background-color: var(--dashboard-success);
}

.danger-alert {
  border: 2px solid var(--dashboard-danger);
  color: var(--dashboard-danger);
}
```

### Using Utility Classes

```html
<!-- Text colors -->
<span class="text-dashboard-success">+2.5%</span>
<span class="text-dashboard-danger">-1.8%</span>
<span class="text-dashboard-warning">Pending</span>
<span class="text-dashboard-primary">Buy</span>

<!-- Background colors -->
<div class="bg-dashboard-success text-white p-2 rounded">Success</div>
<div class="bg-dashboard-danger text-white p-2 rounded">Error</div>

<!-- Border colors -->
<div class="border-2 border-dashboard-warning p-4">Warning Box</div>
```

### In React Components

```tsx
import React from "react";

const StatusIndicator: React.FC<{
  status: "success" | "danger" | "warning" | "primary";
}> = ({ status }) => {
  return (
    <span
      className={`text-dashboard-${status} font-semibold`}
      style={{ color: `var(--dashboard-${status})` }}
    >
      Status: {status}
    </span>
  );
};
```

## Navbar Integration

The navbar can now use these color variables for:

- Status indicators (portfolio performance)
- Alert notifications
- Action buttons
- Theme-aware components

Example navbar usage:

```tsx
// Portfolio performance indicator in navbar
<div className="flex items-center space-x-2">
  <span className="text-dashboard-success">+$1,234.56</span>
  <span className="text-dashboard-success text-sm">+2.3%</span>
</div>

// Alert notification badge
<div className="relative">
  <Bell className="w-5 h-5" />
  <span className="absolute -top-1 -right-1 bg-dashboard-danger text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
    3
  </span>
</div>
```

## Accessibility Compliance

These colors meet WCAG AA+ standards for:

- ✅ Contrast ratio requirements
- ✅ Color blindness accessibility
- ✅ Dark/light theme support
- ✅ Semantic meaning consistency

## Best Practices

1. **Use semantic colors**: Choose colors based on meaning (success for positive, danger for negative)
2. **Test in both themes**: Ensure colors work in both light and dark modes
3. **Don't rely on color alone**: Always provide additional context (icons, text)
4. **Maintain consistency**: Use the same color for the same meaning across the application

## Integration with Existing Systems

These colors work seamlessly with:

- Tailwind CSS utility classes
- Styled-components
- CSS modules
- Inline styles
- Theme context providers

# Color Palette Integration with ThemeComposer

## Overview

The StockPulse dashboard uses an advanced theme management system that integrates:

- **colorPalettes.ts**: Comprehensive color palette definitions
- **themeComposer.ts**: Dynamic theme composition and management
- **ThemeContext**: React context for theme state management
- **Navbar Color Selector**: UI for theme selection

## Available Color Themes

### Modern

- **Electric Minimalist** (`default`): Clean and modern electric blue design

### Futuristic

- **Cyber Luxury** (`cyber-neon`): Futuristic neon cyber aesthetic

### Natural

- **Sage Luxury** (`sage-terracotta`): Natural sage green with terracotta accents
- **Ocean Sunset** (`ocean-sunset`): Ocean blues meeting sunset oranges

### Elegant

- **Midnight Gold** (`midnight-aurora`): Dark elegance with golden highlights
- **Monochrome Pop** (`monochrome-pop`): Sophisticated monochrome with accent pops

### Vibrant

- **Tropical Jungle** (`tropical-jungle`): Vibrant tropical greens and warm accents
- **Berry Fields** (`berry-fields`): Rich berry purples and field greens
- **Sunset Gradient** (`sunset-gradient`): Warm sunset gradient colors

### Cool & Earthy

- **Arctic Moss** (`arctic-moss`): Cool arctic blues with moss greens
- **Desert Storm** (`desert-storm`): Warm desert tones with storm grays

## Implementation

### Theme Selection in Navbar

The navbar includes a categorized color theme selector that:

- Organizes themes by visual categories
- Shows theme names and descriptions
- Displays color indicators
- Provides immediate visual feedback

### Theme Application

When a user selects a color theme:

1. **ThemeContext** validates the theme exists in `colorPalettes.ts`
2. **ThemeComposer** generates the composed theme with variants
3. CSS custom properties are applied to the document root
4. Only dashboard pages receive color themes (public pages remain unthemed)

### Usage in Components

```tsx
import { useTheme } from "../../contexts/ThemeContext";

const MyComponent = () => {
  const { colorTheme, setColorTheme } = useTheme();

  return (
    <div
      style={{
        backgroundColor: "var(--dashboard-primary-color)",
        color: "var(--dashboard-primary-color-text)",
      }}
    >
      Current theme: {colorTheme}
    </div>
  );
};
```

### CSS Variables Applied

Each theme applies comprehensive CSS variables:

```css
/* Foundation Colors */
--primary-50 through --primary-900
--secondary-50 through --secondary-900

/* Dashboard Integration */
--dashboard-primary-color
--dashboard-primary-color-hover
--dashboard-primary-color-active
--dashboard-primary

/* Typography */
--font-family-primary
--font-family-secondary
--font-family-mono
--font-family-display

/* Plus many more... */
```

## Theme Composition Features

The `themeComposer.ts` provides advanced features:

- **Variants**: default, compact, comfortable, accessible
- **Sizes**: sm, md, lg, xl
- **Density**: low, medium, high
- **Accessibility**: high contrast, larger text, focus rings
- **Custom Overrides**: spacing, typography, shadows

## Conditional Theme Application

- **Dashboard Pages**: Full color theme application
- **Public Pages**: No color themes (landing, login, pricing, contact)
- **Route-based Logic**: Automatically detects page type

## Browser Storage

Theme preferences are persisted:

- Light/Dark mode: `stockpulse-theme-mode`
- Color theme: `stockpulse-color-theme`

## Architecture Benefits

1. **Enterprise-grade**: Scalable theme management
2. **Type-safe**: Full TypeScript integration
3. **Performance**: Caching and validation
4. **Accessibility**: WCAG AA+ compliance
5. **Flexibility**: Easy theme creation and customization

## Adding New Themes

1. Define in `colorPalettes.ts`
2. Add to `ColorTheme` type in `types/theme.ts`
3. Include in `COLOR_THEMES` metadata
4. Update navbar categorization

🚀
