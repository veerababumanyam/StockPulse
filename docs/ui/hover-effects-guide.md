# Container Hover Effects Guide 🎯

Modern, centralized hover effects system for StockPulse application that provides consistent, accessible, and visually appealing interactions.

## Overview

The hover effects system is centrally managed in `src/theme/dashboard-design-tokens.css` and provides:
- **Modern shadow effects** with proper elevation
- **Smooth animations** with optimized timing
- **Theme-aware colors** that adapt to light/dark modes
- **Accessibility support** with proper focus states
- **Performance optimized** with hardware acceleration

## 🚀 Quick Start

### Automatic Hover Effects

These container types automatically get hover effects:

```tsx
// Automatic hover effects
<div className="bg-surface p-4 border rounded-lg">
  Auto hover effect
</div>

<div className="bg-elevated p-6 shadow-md">
  Auto hover effect
</div>

<AppContainer variant="surface" padding="lg">
  Auto hover effect
</AppContainer>
```

### Manual Utility Classes

For custom containers, use these utility classes:

```tsx
// Basic hover with subtle lift
<div className="hover-lift p-4 bg-white border rounded">
  Basic hover effect
</div>

// Enhanced hover with prominent shadow
<div className="hover-lift-lg p-6 bg-white border rounded">
  Enhanced hover effect
</div>

// Primary color accent hover
<div className="hover-primary p-4 bg-white border rounded">
  Primary color hover
</div>

// Perfect for dashboard cards
<div className="hover-card p-6 bg-white rounded-lg">
  Card hover effect
</div>

// Button-like hover for clickable items
<div className="hover-button p-3 bg-gray-50 rounded">
  Button hover effect
</div>
```

## 🎨 Available Hover Effects

### 1. `hover-lift` - Basic Hover
- **Transform**: `translateY(-1px)`
- **Shadow**: Medium enhanced shadow
- **Use case**: General containers, panels

### 2. `hover-lift-lg` - Enhanced Hover
- **Transform**: `translateY(-2px)`
- **Shadow**: Large enhanced shadow
- **Border**: Changes to primary color
- **Use case**: Important containers, featured content

### 3. `hover-primary` - Primary Color Accent
- **Transform**: `translateY(-2px)`
- **Shadow**: Primary color shadow + enhanced shadow
- **Border**: Primary color
- **Background**: Subtle primary color tint
- **Use case**: Interactive elements, call-to-action containers

### 4. `hover-card` - Card Interaction
- **Transform**: `translateY(-3px)` (most prominent)
- **Shadow**: Extra large shadow
- **Border**: Primary color
- **Background**: Very subtle primary tint
- **Use case**: Dashboard cards, main content areas

### 5. `hover-button` - Button-like
- **Transform**: `translateY(-1px)`
- **Shadow**: Small enhanced shadow
- **Background**: Primary color overlay (5%)
- **Use case**: Clickable containers, menu items

## 🔧 Shadow System

### Light Mode Shadows
```css
--shadow-hover-sm: 0 4px 8px -2px rgba(0, 0, 0, 0.1)
--shadow-hover-md: 0 8px 16px -4px rgba(0, 0, 0, 0.15)
--shadow-hover-lg: 0 16px 32px -8px rgba(0, 0, 0, 0.2)
--shadow-hover-xl: 0 24px 48px -12px rgba(0, 0, 0, 0.25)
```

### Dark Mode Shadows
```css
--shadow-hover-sm: 0 4px 8px -2px rgba(0, 0, 0, 0.4)
--shadow-hover-md: 0 8px 16px -4px rgba(0, 0, 0, 0.5)
--shadow-hover-lg: 0 16px 32px -8px rgba(0, 0, 0, 0.6)
--shadow-hover-xl: 0 24px 48px -12px rgba(0, 0, 0, 0.7)
```

### Primary Color Shadows
```css
--shadow-primary-sm: Primary color shadows with opacity
--shadow-primary-md: Enhanced primary color shadows
--shadow-primary-lg: Large primary color shadows
```

## ♿ Accessibility Features

### Focus States
All hover utilities include proper focus-visible states:
- **Outline**: Removed (replaced with shadow)
- **Shadow**: Primary color shadow with 2px ring
- **Border**: Primary color
- **Keyboard navigation**: Fully supported

### Motion Preferences
The system respects `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  .hover-*, .app-container, .bg-surface, .bg-elevated, .bg-muted {
    transition: none !important;
  }
}
```

## 🎭 Theme Integration

### Color Adaptation
Hover effects automatically adapt to:
- **Light/Dark themes**: Different shadow intensities
- **Color themes**: Primary color changes reflect in shadows
- **Custom themes**: All CSS variables are respected

### CSS Variables Used
```css
--border-interactive
--primary-500
--surface-primary
--shadow-hover-*
--shadow-primary-*
```

## 📱 Responsive Behavior

Hover effects are automatically disabled on touch devices:
```css
@media (hover: none) {
  /* Hover effects are automatically disabled */
}
```

## 🔧 Customization

### Custom Hover Effect
```css
.my-custom-hover {
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.my-custom-hover:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover-lg);
  border-color: var(--primary-500);
}
```

### Override Existing Effects
```css
.my-container.hover-lift:hover {
  /* Override with custom styles */
  transform: scale(1.02);
  box-shadow: var(--shadow-hover-xl);
}
```

## ⚡ Performance Notes

### Hardware Acceleration
All animations use hardware-accelerated properties:
- `transform` (not `top/left`)
- `box-shadow`
- `border-color`
- `background-color`

### Timing Function
Optimized easing: `cubic-bezier(0.4, 0, 0.2, 1)`
- Fast start for immediate feedback
- Smooth deceleration for polished feel

## 🧪 Testing

Test the hover effects at: `http://localhost:3000/hover-test.html`

## 📋 Implementation Checklist

- [ ] Add appropriate hover utility class
- [ ] Ensure border is set for color changes
- [ ] Test in light and dark modes
- [ ] Verify keyboard accessibility
- [ ] Check performance on slower devices
- [ ] Test with different color themes

## 🚀 Best Practices

1. **Consistency**: Use the same hover effect type for similar UI elements
2. **Hierarchy**: More important elements get more prominent effects
3. **Performance**: Avoid hover effects on mobile/touch devices
4. **Accessibility**: Always include focus states
5. **Theme Awareness**: Test with all available color themes

---

**Need help?** Check the hover effects test page or review `src/theme/dashboard-design-tokens.css` for implementation details. 