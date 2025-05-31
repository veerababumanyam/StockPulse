// StockPulse Color Palettes with Typography

// Define the available color theme keys
export type ColorTheme =
  | "default" // Electric Minimalist
  | "cyber-neon" // Cyber Luxury
  | "sage-terracotta" // Sage Luxury
  | "midnight-aurora" // Midnight Gold
  | "tropical-jungle" // Tropical Jungle
  | "ocean-sunset" // Ocean Sunset
  | "desert-storm" // Desert Storm
  | "berry-fields" // Berry Fields
  | "arctic-moss" // Arctic Moss
  | "sunset-gradient" // Sunset Gradient
  | "monochrome-pop"; // Monochrome Pop

// Each palette now has both light and dark variants with typography
export const colorPalettes: Record<
  ColorTheme,
  {
    light: Record<string, string>;
    dark: Record<string, string>;
  }
> = {
  default: { // ⚡ ELECTRIC MINIMALIST (Light Dominant)
    light: {
      // Foundation Colors
      "--primary-50": "#EFF6FF", "--primary-100": "#DBEAFE", "--primary-200": "#BFDBFE",
      "--primary-300": "#93C5FD", "--primary-400": "#60A5FA", "--primary-500": "#3B82F6",
      "--primary-600": "#2563EB", "--primary-700": "#1D4ED8", "--primary-800": "#1E40AF", "--primary-900": "#1E3A8A",
      "--secondary-50": "#FDF2F8", "--secondary-100": "#FCE7F3", "--secondary-200": "#FBCFE8",
      "--secondary-300": "#F9A8D4", "--secondary-400": "#F472B6", "--secondary-500": "#EC4899",
      "--secondary-600": "#DB2777", "--secondary-700": "#BE185D", "--secondary-800": "#9D174D", "--secondary-900": "#831843",
      "--accent-lime-50": "#F7FEE7", "--accent-lime-100": "#ECFCCB", "--accent-lime-500": "#84CC16", "--accent-lime-700": "#4D7C0F",
      
      // Typography System - Modern Clean
      "--font-family-primary": "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      "--font-family-secondary": "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      "--font-family-mono": "'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace",
      "--font-family-display": "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      
      // Font Weights
      "--font-weight-light": "300",
      "--font-weight-normal": "400",
      "--font-weight-medium": "500",
      "--font-weight-semibold": "600",
      "--font-weight-bold": "700",
      "--font-weight-extrabold": "800",
      
      // Font Sizes - Clean Modern Scale
      "--font-size-xs": "0.75rem", // 12px
      "--font-size-sm": "0.875rem", // 14px
      "--font-size-base": "1rem", // 16px
      "--font-size-lg": "1.125rem", // 18px
      "--font-size-xl": "1.25rem", // 20px
      "--font-size-2xl": "1.5rem", // 24px
      "--font-size-3xl": "1.875rem", // 30px
      "--font-size-4xl": "2.25rem", // 36px
      "--font-size-5xl": "3rem", // 48px
      
      // Line Heights
      "--line-height-tight": "1.25",
      "--line-height-snug": "1.375",
      "--line-height-normal": "1.5",
      "--line-height-relaxed": "1.625",
      "--line-height-loose": "2",
      
      // Letter Spacing
      "--letter-spacing-tighter": "-0.05em",
      "--letter-spacing-tight": "-0.025em",
      "--letter-spacing-normal": "0em",
      "--letter-spacing-wide": "0.025em",
      "--letter-spacing-wider": "0.05em",
      "--letter-spacing-widest": "0.1em",
      
      // Text System
      "--text-primary": "#0F172A", "--text-secondary": "#475569", "--text-tertiary": "#64748B", "--text-disabled": "#CBD5E1",
      "--text-inverse": "#F8FAFC", "--text-link": "#3B82F6", "--text-link-hover": "#2563EB", "--text-glow": "#60A5FA",
      // Background System
      "--background-primary": "#FFFFFF", "--background-secondary": "#F8FAFC", "--background-tertiary": "#F1F5F9",
      "--surface-primary": "#FFFFFF", "--surface-secondary": "#F8FAFC", "--surface-dark": "#0F172A",
      // Border & Divider System
      "--border-light": "#E2E8F0", "--border-medium": "#CBD5E1", "--border-strong": "#94A3B8",
      "--border-interactive": "#3B82F6", "--border-focus": "#60A5FA", "--divider": "#E2E8F0",
      // Interactive States
      "--hover-primary": "#2563EB", "--hover-secondary": "#BE185D", "--active-primary": "#1D4ED8",
      "--focus-ring": "#93C5FD", "--selected-background": "#DBEAFE", "--selected-text": "#1D4ED8",
      // Semantic Colors
      "--success-50": "#F0FDF4", "--success-500": "#10B981", "--success-700": "#059669",
      "--warning-50": "#FFFBEB", "--warning-500": "#F59E0B", "--warning-700": "#D97706",
      "--error-50": "#FEF2F2", "--error-500": "#EF4444", "--error-700": "#DC2626",
      "--info-50": "#EFF6FF", "--info-500": "#3B82F6", "--info-700": "#2563EB",
      // Compatibility
      "--color-primary": "#3B82F6", "--color-accent": "#EC4899", "--color-background": "#FFFFFF",
      "--color-surface": "#F8FAFC", "--color-text": "#0F172A", "--color-text-secondary": "#475569", "--color-border": "#CBD5E1",
    },
    dark: {
      // Foundation Colors
      "--primary-50": "#1E293B", "--primary-100": "#1E3A8A", "--primary-200": "#1D4ED8",
      "--primary-300": "#2563EB", "--primary-400": "#3B82F6", "--primary-500": "#60A5FA",
      "--primary-600": "#93C5FD", "--primary-700": "#BFDBFE", "--primary-800": "#DBEAFE", "--primary-900": "#EFF6FF",
      "--secondary-50": "#831843", "--secondary-100": "#9D174D", "--secondary-200": "#BE185D",
      "--secondary-300": "#DB2777", "--secondary-400": "#EC4899", "--secondary-500": "#F472B6",
      "--secondary-600": "#F9A8D4", "--secondary-700": "#FBCFE8", "--secondary-800": "#FCE7F3", "--secondary-900": "#FDF2F8",
      "--accent-lime-50": "#365314", "--accent-lime-100": "#4D7C0F", "--accent-lime-500": "#A3E635", "--accent-lime-700": "#BEF264",
      
      // Typography System - Modern Clean (Dark Mode)
      "--font-family-primary": "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      "--font-family-secondary": "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      "--font-family-mono": "'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace",
      "--font-family-display": "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      
      // Font Weights (same as light)
      "--font-weight-light": "300",
      "--font-weight-normal": "400",
      "--font-weight-medium": "500",
      "--font-weight-semibold": "600",
      "--font-weight-bold": "700",
      "--font-weight-extrabold": "800",
      
      // Font Sizes (same as light)
      "--font-size-xs": "0.75rem", "--font-size-sm": "0.875rem", "--font-size-base": "1rem",
      "--font-size-lg": "1.125rem", "--font-size-xl": "1.25rem", "--font-size-2xl": "1.5rem",
      "--font-size-3xl": "1.875rem", "--font-size-4xl": "2.25rem", "--font-size-5xl": "3rem",
      
      // Line Heights (same as light)
      "--line-height-tight": "1.25", "--line-height-snug": "1.375", "--line-height-normal": "1.5",
      "--line-height-relaxed": "1.625", "--line-height-loose": "2",
      
      // Letter Spacing (same as light)
      "--letter-spacing-tighter": "-0.05em", "--letter-spacing-tight": "-0.025em", "--letter-spacing-normal": "0em",
      "--letter-spacing-wide": "0.025em", "--letter-spacing-wider": "0.05em", "--letter-spacing-widest": "0.1em",
      
      // Text System
      "--text-primary": "#F8FAFC", "--text-secondary": "#CBD5E1", "--text-tertiary": "#94A3B8", "--text-disabled": "#475569",
      "--text-inverse": "#0F172A", "--text-link": "#60A5FA", "--text-link-hover": "#93C5FD", "--text-glow": "#93C5FD",
      // Background System
      "--background-primary": "#0F172A", "--background-secondary": "#1E293B", "--background-tertiary": "#334155",
      "--surface-primary": "#1E293B", "--surface-secondary": "#334155", "--surface-dark": "#0F172A",
      // Border & Divider System
      "--border-light": "#334155", "--border-medium": "#475569", "--border-strong": "#64748B",
      "--border-interactive": "#60A5FA", "--border-focus": "#93C5FD", "--divider": "#334155",
      // Interactive States
      "--hover-primary": "#93C5FD", "--hover-secondary": "#F9A8D4", "--active-primary": "#3B82F6",
      "--focus-ring": "#60A5FA", "--selected-background": "#1E3A8A", "--selected-text": "#DBEAFE",
      // Semantic Colors
      "--success-50": "#064E3B", "--success-500": "#34D399", "--success-700": "#A7F3D0",
      "--warning-50": "#78350F", "--warning-500": "#FBBF24", "--warning-700": "#FEF3C7",
      "--error-50": "#7F1D1D", "--error-500": "#F87171", "--error-700": "#FECACA",
      "--info-50": "#164E63", "--info-500": "#22D3EE", "--info-700": "#A5F3FC",
      // Compatibility
      "--color-primary": "#60A5FA", "--color-accent": "#F472B6", "--color-background": "#0F172A",
      "--color-surface": "#1E293B", "--color-text": "#F8FAFC", "--color-text-secondary": "#CBD5E1", "--color-border": "#475569",
    },
  },
  "cyber-neon": { // 🔮 CYBER LUXURY (Dark Dominant)
    dark: {
      // Foundation Colors
      "--primary-50": "#312E81", "--primary-100": "#3730A3", "--primary-200": "#4338CA",
      "--primary-300": "#4F46E5", "--primary-400": "#6366F1", "--primary-500": "#8B5CF6",
      "--primary-600": "#A78BFA", "--primary-700": "#C4B5FD", "--primary-800": "#DDD6FE", "--primary-900": "#F3E8FF",
      "--secondary-50": "#164E63", "--secondary-100": "#0E7490", "--secondary-200": "#0891B2",
      "--secondary-300": "#06B6D4", "--secondary-400": "#22D3EE", "--secondary-500": "#67E8F9",
      "--secondary-600": "#A5F3FC", "--secondary-700": "#CFFAFE", "--secondary-800": "#E0FCFF", "--secondary-900": "#F0FFFF",
      "--accent-gold-50": "#78350F", "--accent-gold-100": "#92400E", "--accent-gold-500": "#F59E0B", "--accent-gold-700": "#FBBF24",
      
      // Typography System - Futuristic Cyber
      "--font-family-primary": "'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace",
      "--font-family-secondary": "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      "--font-family-mono": "'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace",
      "--font-family-display": "'Orbitron', 'JetBrains Mono', monospace",
      
      // Font Weights - Cyber Style
      "--font-weight-light": "300",
      "--font-weight-normal": "400",
      "--font-weight-medium": "500",
      "--font-weight-semibold": "600",
      "--font-weight-bold": "700",
      "--font-weight-extrabold": "900", // Heavier for cyber aesthetic
      
      // Font Sizes - Cyber Scale
      "--font-size-xs": "0.7rem", // 11.2px - Smaller for data density
      "--font-size-sm": "0.8rem", // 12.8px
      "--font-size-base": "0.95rem", // 15.2px - Slightly smaller base
      "--font-size-lg": "1.1rem", // 17.6px
      "--font-size-xl": "1.3rem", // 20.8px
      "--font-size-2xl": "1.6rem", // 25.6px
      "--font-size-3xl": "2rem", // 32px
      "--font-size-4xl": "2.5rem", // 40px
      "--font-size-5xl": "3.2rem", // 51.2px
      
      // Line Heights - Tighter for cyber aesthetic
      "--line-height-tight": "1.2",
      "--line-height-snug": "1.3",
      "--line-height-normal": "1.4",
      "--line-height-relaxed": "1.5",
      "--line-height-loose": "1.8",
      
      // Letter Spacing - Wider for futuristic feel
      "--letter-spacing-tighter": "-0.02em",
      "--letter-spacing-tight": "0em",
      "--letter-spacing-normal": "0.02em",
      "--letter-spacing-wide": "0.05em",
      "--letter-spacing-wider": "0.1em",
      "--letter-spacing-widest": "0.15em",
      
      // Text System
      "--text-primary": "#F1F5F9", "--text-secondary": "#94A3B8", "--text-tertiary": "#64748B", "--text-disabled": "#475569",
      "--text-inverse": "#0F172A", "--text-link": "#22D3EE", "--text-link-hover": "#67E8F9", "--text-neon": "#00FFFF",
      // Background System
      "--background-primary": "#0A0A0F", "--background-secondary": "#1A1A2E", "--background-tertiary": "#16213E",
      "--surface-primary": "#1E293B", "--surface-secondary": "#334155", "--surface-raised": "#475569",
      // Border & Divider System
      "--border-light": "#1E293B", "--border-medium": "#334155", "--border-strong": "#475569",
      "--border-interactive": "#8B5CF6", "--border-focus": "#22D3EE", "--divider": "#334155",
      // Interactive States
      "--hover-primary": "#A78BFA", "--hover-secondary": "#22D3EE", "--active-primary": "#7C3AED",
      "--focus-ring": "#67E8F9", "--selected-background": "#312E81", "--selected-text": "#C4B5FD",
      // Semantic Colors
      "--success-50": "#064E3B", "--success-500": "#00FF87", "--success-700": "#34D399",
      "--warning-50": "#78350F", "--warning-500": "#FBBF24", "--warning-700": "#FEF3C7",
      "--error-50": "#991B1B", "--error-500": "#FF073A", "--error-700": "#F87171",
      "--info-50": "#164E63", "--info-500": "#22D3EE", "--info-700": "#A5F3FC",
      // Compatibility
      "--color-primary": "#8B5CF6", "--color-accent": "#F59E0B", "--color-background": "#0A0A0F",
      "--color-surface": "#1A1A2E", "--color-text": "#F1F5F9", "--color-text-secondary": "#94A3B8", "--color-border": "#334155",
    },
    light: {
      // Foundation Colors
      "--primary-50": "#F3E8FF", "--primary-100": "#DDD6FE", "--primary-200": "#C4B5FD",
      "--primary-300": "#A78BFA", "--primary-400": "#8B5CF6", "--primary-500": "#7C3AED",
      "--primary-600": "#6D28D9", "--primary-700": "#5B21B6", "--primary-800": "#4C1D95", "--primary-900": "#3B0764",
      "--secondary-50": "#CFFAFE", "--secondary-100": "#A5F3FC", "--secondary-200": "#67E8F9",
      "--secondary-300": "#22D3EE", "--secondary-400": "#06B6D4", "--secondary-500": "#0891B2",
      "--secondary-600": "#0E7490", "--secondary-700": "#155E75", "--secondary-800": "#164E63", "--secondary-900": "#113540",
      "--accent-gold-50": "#FFFBEB", "--accent-gold-100": "#FEF3C7", "--accent-gold-500": "#F59E0B", "--accent-gold-700": "#B45309",
      
      // Typography System - Futuristic Cyber (Light Mode)
      "--font-family-primary": "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      "--font-family-secondary": "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      "--font-family-mono": "'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace",
      "--font-family-display": "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      
      // Font Weights
      "--font-weight-light": "300", "--font-weight-normal": "400", "--font-weight-medium": "500",
      "--font-weight-semibold": "600", "--font-weight-bold": "700", "--font-weight-extrabold": "800",
      
      // Font Sizes
      "--font-size-xs": "0.75rem", "--font-size-sm": "0.875rem", "--font-size-base": "1rem",
      "--font-size-lg": "1.125rem", "--font-size-xl": "1.25rem", "--font-size-2xl": "1.5rem",
      "--font-size-3xl": "1.875rem", "--font-size-4xl": "2.25rem", "--font-size-5xl": "3rem",
      
      // Line Heights
      "--line-height-tight": "1.25", "--line-height-snug": "1.375", "--line-height-normal": "1.5",
      "--line-height-relaxed": "1.625", "--line-height-loose": "2",
      
      // Letter Spacing
      "--letter-spacing-tighter": "-0.05em", "--letter-spacing-tight": "-0.025em", "--letter-spacing-normal": "0em",
      "--letter-spacing-wide": "0.025em", "--letter-spacing-wider": "0.05em", "--letter-spacing-widest": "0.1em",
      
      // Text System
      "--text-primary": "#0F172A", "--text-secondary": "#334155", "--text-tertiary": "#475569", "--text-disabled": "#94A3B8",
      "--text-inverse": "#F1F5F9", "--text-link": "#0891B2", "--text-link-hover": "#0E7490", "--text-neon": "#7C3AED",
      // Background System
      "--background-primary": "#FFFFFF", "--background-secondary": "#F8FAFC", "--background-tertiary": "#F1F5F9",
      "--surface-primary": "#FFFFFF", "--surface-secondary": "#F3E8FF", "--surface-raised": "#E0F7FA",
      // Border & Divider System
      "--border-light": "#E0E7FF", "--border-medium": "#DDD6FE", "--border-strong": "#C4B5FD",
      "--border-interactive": "#7C3AED", "--border-focus": "#0891B2", "--divider": "#E0E7FF",
      // Interactive States
      "--hover-primary": "#6D28D9", "--hover-secondary": "#0E7490", "--active-primary": "#5B21B6",
      "--focus-ring": "#A78BFA", "--selected-background": "#E9D5FF", "--selected-text": "#5B21B6",
      // Semantic Colors
      "--success-50": "#D1FAE5", "--success-500": "#10B981", "--success-700": "#047857",
      "--warning-50": "#FEF3C7", "--warning-500": "#F59E0B", "--warning-700": "#B45309",
      "--error-50": "#FEE2E2", "--error-500": "#EF4444", "--error-700": "#B91C1C",
      "--info-50": "#E0F2FE", "--info-500": "#0EA5E9", "--info-700": "#0369A1",
      // Compatibility
      "--color-primary": "#7C3AED", "--color-accent": "#F59E0B", "--color-background": "#FFFFFF",
      "--color-surface": "#F8FAFC", "--color-text": "#0F172A", "--color-text-secondary": "#334155", "--color-border": "#DDD6FE",
    },
  },
  // Additional color themes would continue here...
  "sage-terracotta": {
    light: {
      "--color-primary": "#84CC16",
      "--color-accent": "#EF4444",
      "--color-background": "#FFFFFF",
      "--color-surface": "#FEFCF3",
      "--color-text": "#1A2E05",
      "--color-text-secondary": "#365314",
      "--color-border": "#D9F99D",
    },
    dark: {
      "--color-primary": "#A3E635",
      "--color-accent": "#F87171",
      "--color-background": "#0F1A02",
      "--color-surface": "#1A2E05",
      "--color-text": "#F7FEE7",
      "--color-text-secondary": "#ECFCCB",
      "--color-border": "#4D7C0F",
    },
  },
  "midnight-aurora": {
    light: {
      "--color-primary": "#3B82F6",
      "--color-accent": "#F59E0B",
      "--color-background": "#FFFFFF",
      "--color-surface": "#F8FAFC",
      "--color-text": "#0F172A",
      "--color-text-secondary": "#475569",
      "--color-border": "#CBD5E1",
    },
    dark: {
      "--color-primary": "#60A5FA",
      "--color-accent": "#FBBF24",
      "--color-background": "#0F172A",
      "--color-surface": "#1E293B",
      "--color-text": "#F8FAFC",
      "--color-text-secondary": "#CBD5E1",
      "--color-border": "#475569",
    },
  },
  "tropical-jungle": {
    light: {
      // Foundation Colors - Primary Sage Green Scale
      "--primary-50": "#ECFDF5", "--primary-100": "#D1FAE5", "--primary-200": "#A7F3D0",
      "--primary-300": "#6EE7B7", "--primary-400": "#34D399", "--primary-500": "#059669",
      "--primary-600": "#047857", "--primary-700": "#065F46", "--primary-800": "#064E3B", "--primary-900": "#064E3B",
      // Foundation Colors - Secondary Lime Scale
      "--secondary-50": "#F7FEE7", "--secondary-100": "#ECFCCB", "--secondary-200": "#D9F99D",
      "--secondary-300": "#BEF264", "--secondary-400": "#A3E635", "--secondary-500": "#84CC16",
      "--secondary-600": "#65A30D", "--secondary-700": "#4D7C0F", "--secondary-800": "#365314", "--secondary-900": "#365314",
      // Accent Jungle Orange
      "--accent-jungle-orange": "#F97316",
      
      // Typography System - Natural Botanical
      "--font-family-primary": "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      "--font-family-secondary": "'Merriweather', Georgia, serif",
      "--font-family-mono": "'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace",
      "--font-family-display": "'Playfair Display', 'Merriweather', Georgia, serif",
      
      // Font Weights - Natural Feel
      "--font-weight-light": "300",
      "--font-weight-normal": "400",
      "--font-weight-medium": "500",
      "--font-weight-semibold": "600",
      "--font-weight-bold": "700",
      "--font-weight-extrabold": "800",
      
      // Font Sizes - Organic Scale
      "--font-size-xs": "0.8rem", // 12.8px - Slightly larger for readability
      "--font-size-sm": "0.9rem", // 14.4px
      "--font-size-base": "1.05rem", // 16.8px - Comfortable reading
      "--font-size-lg": "1.2rem", // 19.2px
      "--font-size-xl": "1.35rem", // 21.6px
      "--font-size-2xl": "1.6rem", // 25.6px
      "--font-size-3xl": "2rem", // 32px
      "--font-size-4xl": "2.5rem", // 40px
      "--font-size-5xl": "3.2rem", // 51.2px
      
      // Line Heights - Natural Flow
      "--line-height-tight": "1.3",
      "--line-height-snug": "1.4",
      "--line-height-normal": "1.6",
      "--line-height-relaxed": "1.7",
      "--line-height-loose": "2.1",
      
      // Letter Spacing - Organic Feel
      "--letter-spacing-tighter": "-0.03em",
      "--letter-spacing-tight": "-0.01em",
      "--letter-spacing-normal": "0em",
      "--letter-spacing-wide": "0.02em",
      "--letter-spacing-wider": "0.04em",
      "--letter-spacing-widest": "0.08em",
      
      // Text System
      "--text-primary": "#064E3B", // deep forest
      "--text-secondary": "#065F46", // medium forest
      "--text-tertiary": "#047857", // light forest
      "--text-disabled": "#A7F3D0", // very light
      "--text-inverse": "#F0FDF4", // on dark backgrounds
      "--text-link": "#059669", // sage links
      "--text-link-hover": "#047857", // darker hover
      "--text-accent": "#EA580C", // orange highlights (corrected from F97316)
      // Background System
      "--background-primary": "#FEFFFE", // pure white with green tint
      "--background-secondary": "#F0FDF4", // light sage
      "--background-tertiary": "#DCFCE7", // lighter sage
      "--surface-primary": "#FFFFFF", // cards
      "--surface-secondary": "#F0FDF4", // elevated surfaces
      "--surface-raised": "#ECFDF5", // modals, tooltips
      // Border & Divider System
      "--border-light": "#D1FAE5", // subtle
      "--border-medium": "#A7F3D0", // medium
      "--border-strong": "#6EE7B7", // strong
      "--border-interactive": "#059669", // primary
      "--border-focus": "#34D399", // focus ring
      "--divider": "#BBF7D0",
      // Interactive States
      "--hover-primary": "#047857", // sage hover
      "--hover-secondary": "#65A30D", // lime hover
      "--active-primary": "#064E3B", // pressed
      "--focus-ring": "#6EE7B7", // accessibility
      "--selected-background": "#D1FAE5",
      "--selected-text": "#047857",
      // Semantic Colors - Success
      "--success-light": "#10B981", "--success-medium": "#059669", "--success-dark": "#064E3B",
      "--success-50": "#ECFDF5", "--success-500": "#10B981", "--success-700": "#059669",
      // Semantic Colors - Warning
      "--warning-light": "#F59E0B", "--warning-medium": "#D97706", "--warning-dark": "#92400E",
      "--warning-50": "#FFFBEB", "--warning-500": "#F59E0B", "--warning-700": "#D97706",
      // Semantic Colors - Error
      "--error-light": "#EF4444", "--error-medium": "#DC2626", "--error-dark": "#B91C1C",
      "--error-50": "#FEF2F2", "--error-500": "#EF4444", "--error-700": "#DC2626",
      // Semantic Colors - Info
      "--info-light": "#06B6D4", "--info-medium": "#0891B2", "--info-dark": "#164E63",
      "--info-50": "#CFFAFE", "--info-500": "#06B6D4", "--info-700": "#0891B2",
      // Compatibility
      "--color-primary": "#059669", "--color-accent": "#F97316", "--color-background": "#FEFFFE",
      "--color-surface": "#F0FDF4", "--color-text": "#064E3B", "--color-text-secondary": "#065F46", "--color-border": "#D1FAE5",
    },
    dark: {
      // Foundation Colors - Primary Sage Green Scale (inverted)
      "--primary-50": "#064E3B", "--primary-100": "#065F46", "--primary-200": "#047857",
      "--primary-300": "#059669", "--primary-400": "#10B981", "--primary-500": "#34D399",
      "--primary-600": "#6EE7B7", "--primary-700": "#A7F3D0", "--primary-800": "#D1FAE5", "--primary-900": "#ECFDF5",
      // Foundation Colors - Secondary Lime Scale (inverted)
      "--secondary-50": "#365314", "--secondary-100": "#4D7C0F", "--secondary-200": "#65A30D",
      "--secondary-300": "#84CC16", "--secondary-400": "#A3E635", "--secondary-500": "#BEF264",
      "--secondary-600": "#D9F99D", "--secondary-700": "#ECFCCB", "--secondary-800": "#F7FEE7", "--secondary-900": "#F7FEE7",
      // Accent Jungle Orange (adapted for dark)
      "--accent-jungle-orange": "#FB923C",
      
      // Typography System - Natural Botanical (Dark Mode)
      "--font-family-primary": "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      "--font-family-secondary": "'Merriweather', Georgia, serif",
      "--font-family-mono": "'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace",
      "--font-family-display": "'Playfair Display', 'Merriweather', Georgia, serif",
      
      // Font Weights (same as light)
      "--font-weight-light": "300", "--font-weight-normal": "400", "--font-weight-medium": "500",
      "--font-weight-semibold": "600", "--font-weight-bold": "700", "--font-weight-extrabold": "800",
      
      // Font Sizes (same as light)
      "--font-size-xs": "0.8rem", "--font-size-sm": "0.9rem", "--font-size-base": "1.05rem",
      "--font-size-lg": "1.2rem", "--font-size-xl": "1.35rem", "--font-size-2xl": "1.6rem",
      "--font-size-3xl": "2rem", "--font-size-4xl": "2.5rem", "--font-size-5xl": "3.2rem",
      
      // Line Heights (same as light)
      "--line-height-tight": "1.3", "--line-height-snug": "1.4", "--line-height-normal": "1.6",
      "--line-height-relaxed": "1.7", "--line-height-loose": "2.1",
      
      // Letter Spacing (same as light)
      "--letter-spacing-tighter": "-0.03em", "--letter-spacing-tight": "-0.01em", "--letter-spacing-normal": "0em",
      "--letter-spacing-wide": "0.02em", "--letter-spacing-wider": "0.04em", "--letter-spacing-widest": "0.08em",
      
      // Text System
      "--text-primary": "#F0FDF4", // light on dark
      "--text-secondary": "#D1FAE5", // medium light
      "--text-tertiary": "#A7F3D0", // lighter
      "--text-disabled": "#065F46", // dark disabled
      "--text-inverse": "#064E3B", // dark text on light
      "--text-link": "#34D399", // bright sage links
      "--text-link-hover": "#6EE7B7", // brighter hover
      "--text-accent": "#FB923C", // bright orange highlights
      // Background System
      "--background-primary": "#0A1F0F", // very dark forest
      "--background-secondary": "#064E3B", // dark forest
      "--background-tertiary": "#065F46", // medium forest
      "--surface-primary": "#064E3B", // dark cards
      "--surface-secondary": "#065F46", // elevated dark surfaces
      "--surface-raised": "#047857", // dark modals, tooltips
      // Border & Divider System
      "--border-light": "#065F46", // dark subtle
      "--border-medium": "#047857", // dark medium
      "--border-strong": "#059669", // dark strong
      "--border-interactive": "#34D399", // bright primary
      "--border-focus": "#6EE7B7", // bright focus ring
      "--divider": "#065F46",
      // Interactive States
      "--hover-primary": "#6EE7B7", // bright sage hover
      "--hover-secondary": "#A3E635", // bright lime hover
      "--active-primary": "#10B981", // bright pressed
      "--focus-ring": "#34D399", // bright accessibility
      "--selected-background": "#065F46",
      "--selected-text": "#A7F3D0",
      // Semantic Colors (adapted for dark)
      "--success-light": "#34D399", "--success-medium": "#10B981", "--success-dark": "#059669",
      "--success-50": "#064E3B", "--success-500": "#34D399", "--success-700": "#A7F3D0",
      "--warning-light": "#FBBF24", "--warning-medium": "#F59E0B", "--warning-dark": "#D97706",
      "--warning-50": "#78350F", "--warning-500": "#FBBF24", "--warning-700": "#FEF3C7",
      "--error-light": "#F87171", "--error-medium": "#EF4444", "--error-dark": "#7F1D1D",
      "--error-50": "#7F1D1D", "--error-500": "#F87171", "--error-700": "#FECACA",
      "--info-light": "#22D3EE", "--info-medium": "#06B6D4", "--info-dark": "#0891B2",
      "--info-50": "#164E63", "--info-500": "#22D3EE", "--info-700": "#A5F3FC",
      // Compatibility
      "--color-primary": "#34D399", "--color-accent": "#FB923C", "--color-background": "#0A1F0F",
      "--color-surface": "#064E3B", "--color-text": "#F0FDF4", "--color-text-secondary": "#D1FAE5", "--color-border": "#065F46",
    },
  },
  "ocean-sunset": {
    light: {
      // Foundation Colors - Primary Ocean Blue Scale
      "--primary-50": "#F0F9FF", "--primary-100": "#E0F2FE", "--primary-200": "#BAE6FD",
      "--primary-300": "#7DD3FC", "--primary-400": "#38BDF8", "--primary-500": "#0891B2",
      "--primary-600": "#0E7490", "--primary-700": "#155E75", "--primary-800": "#164E63", "--primary-900": "#164E63",
      // Foundation Colors - Secondary Coral Scale
      "--secondary-50": "#FFF7ED", "--secondary-100": "#FFEDD5", "--secondary-200": "#FED7AA",
      "--secondary-300": "#FDBA74", "--secondary-400": "#FB923C", "--secondary-500": "#F97316",
      "--secondary-600": "#EA580C", "--secondary-700": "#C2410C", "--secondary-800": "#9A3412", "--secondary-900": "#9A3412",
      // Accent Golden Sand
      "--accent-golden-sand": "#FBBF24",
      
      // Typography System - Coastal Luxury
      "--font-family-primary": "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      "--font-family-secondary": "'Lora', Georgia, serif",
      "--font-family-mono": "'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace",
      "--font-family-display": "'Playfair Display', 'Lora', Georgia, serif",
      
      // Font Weights - Luxury Feel
      "--font-weight-light": "300",
      "--font-weight-normal": "400",
      "--font-weight-medium": "500",
      "--font-weight-semibold": "600",
      "--font-weight-bold": "700",
      "--font-weight-extrabold": "800",
      
      // Font Sizes - Elegant Scale
      "--font-size-xs": "0.75rem", // 12px
      "--font-size-sm": "0.875rem", // 14px
      "--font-size-base": "1rem", // 16px
      "--font-size-lg": "1.125rem", // 18px
      "--font-size-xl": "1.25rem", // 20px
      "--font-size-2xl": "1.5rem", // 24px
      "--font-size-3xl": "1.875rem", // 30px
      "--font-size-4xl": "2.25rem", // 36px
      "--font-size-5xl": "3rem", // 48px
      
      // Line Heights - Luxury Spacing
      "--line-height-tight": "1.25",
      "--line-height-snug": "1.375",
      "--line-height-normal": "1.5",
      "--line-height-relaxed": "1.625",
      "--line-height-loose": "2",
      
      // Letter Spacing - Refined
      "--letter-spacing-tighter": "-0.05em",
      "--letter-spacing-tight": "-0.025em",
      "--letter-spacing-normal": "0em",
      "--letter-spacing-wide": "0.025em",
      "--letter-spacing-wider": "0.05em",
      "--letter-spacing-widest": "0.1em",
      
      // Text System
      "--text-primary": "#164E63", // deep ocean
      "--text-secondary": "#0E7490", // medium ocean
      "--text-tertiary": "#0891B2", // light ocean
      "--text-disabled": "#A5F3FC", // very light
      "--text-inverse": "#F0F9FF", // on dark
      "--text-link": "#0891B2", // ocean links
      "--text-link-hover": "#0E7490", // darker hover
      "--text-coral": "#EA580C", // coral highlights
      // Background System
      "--background-primary": "#FFFBF7", // warm white
      "--background-secondary": "#F0F9FF", // light blue
      "--background-tertiary": "#E0F7FA", // lighter blue
      "--surface-primary": "#FFFFFF", // cards
      "--surface-secondary": "#F0F9FF", // elevated
      "--surface-coral": "#FFF7ED", // coral accents
      // Border & Divider System
      "--border-light": "#E0F7FA",
      "--border-medium": "#B3E5FC",
      "--border-strong": "#81D4FA",
      "--border-interactive": "#0891B2",
      "--border-focus": "#22D3EE",
      "--divider": "#B3E5FC",
      // Interactive States
      "--hover-primary": "#0E7490",
      "--hover-secondary": "#EA580C",
      "--active-primary": "#164E63",
      "--focus-ring": "#7DD3FC",
      "--selected-background": "#E0F7FA",
      "--selected-text": "#164E63",
      // Semantic Colors - Success
      "--success-light": "#10B981", "--success-medium": "#059669", "--success-dark": "#047857",
      "--success-50": "#ECFDF5", "--success-500": "#10B981", "--success-700": "#059669",
      // Semantic Colors - Warning
      "--warning-light": "#F59E0B", "--warning-medium": "#D97706", "--warning-dark": "#92400E",
      "--warning-50": "#FFFBEB", "--warning-500": "#F59E0B", "--warning-700": "#D97706",
      // Semantic Colors - Error
      "--error-light": "#EF4444", "--error-medium": "#DC2626", "--error-dark": "#B91C1C",
      "--error-50": "#FEF2F2", "--error-500": "#EF4444", "--error-700": "#DC2626",
      // Semantic Colors - Info
      "--info-light": "#0891B2", "--info-medium": "#0E7490", "--info-dark": "#164E63",
      "--info-50": "#F0F9FF", "--info-500": "#0891B2", "--info-700": "#164E63",
      // Compatibility
      "--color-primary": "#0891B2", "--color-accent": "#F97316", "--color-background": "#FFFBF7",
      "--color-surface": "#F0F9FF", "--color-text": "#164E63", "--color-text-secondary": "#0E7490", "--color-border": "#B3E5FC",
    },
    dark: {
      // Foundation Colors - Primary Ocean Blue Scale (inverted)
      "--primary-50": "#164E63", "--primary-100": "#155E75", "--primary-200": "#0E7490",
      "--primary-300": "#0891B2", "--primary-400": "#06B6D4", "--primary-500": "#22D3EE",
      "--primary-600": "#67E8F9", "--primary-700": "#A5F3FC", "--primary-800": "#CFFAFE", "--primary-900": "#F0F9FF",
      // Foundation Colors - Secondary Coral Scale (inverted)
      "--secondary-50": "#9A3412", "--secondary-100": "#C2410C", "--secondary-200": "#EA580C",
      "--secondary-300": "#F97316", "--secondary-400": "#FB923C", "--secondary-500": "#FDBA74",
      "--secondary-600": "#FED7AA", "--secondary-700": "#FFEDD5", "--secondary-800": "#FFF7ED", "--secondary-900": "#FFF7ED",
      // Accent Golden Sand (adapted for dark)
      "--accent-golden-sand": "#FCD34D",
      
      // Typography System - Coastal Luxury (Dark Mode)
      "--font-family-primary": "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      "--font-family-secondary": "'Lora', Georgia, serif",
      "--font-family-mono": "'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace",
      "--font-family-display": "'Playfair Display', 'Lora', Georgia, serif",
      
      // Font Weights (same as light)
      "--font-weight-light": "300", "--font-weight-normal": "400", "--font-weight-medium": "500",
      "--font-weight-semibold": "600", "--font-weight-bold": "700", "--font-weight-extrabold": "800",
      
      // Font Sizes (same as light)
      "--font-size-xs": "0.75rem", "--font-size-sm": "0.875rem", "--font-size-base": "1rem",
      "--font-size-lg": "1.125rem", "--font-size-xl": "1.25rem", "--font-size-2xl": "1.5rem",
      "--font-size-3xl": "1.875rem", "--font-size-4xl": "2.25rem", "--font-size-5xl": "3rem",
      
      // Line Heights (same as light)
      "--line-height-tight": "1.25", "--line-height-snug": "1.375", "--line-height-normal": "1.5",
      "--line-height-relaxed": "1.625", "--line-height-loose": "2",
      
      // Letter Spacing (same as light)
      "--letter-spacing-tighter": "-0.05em", "--letter-spacing-tight": "-0.025em", "--letter-spacing-normal": "0em",
      "--letter-spacing-wide": "0.025em", "--letter-spacing-wider": "0.05em", "--letter-spacing-widest": "0.1em",
      
      // Text System
      "--text-primary": "#F0F9FF", // light on dark
      "--text-secondary": "#CFFAFE", // medium light
      "--text-tertiary": "#A5F3FC", // lighter
      "--text-disabled": "#0E7490", // dark disabled
      "--text-inverse": "#164E63", // dark text on light
      "--text-link": "#22D3EE", // bright ocean links
      "--text-link-hover": "#67E8F9", // brighter hover
      "--text-coral": "#FB923C", // bright coral highlights
      // Background System
      "--background-primary": "#0C1B2E", // very deep ocean
      "--background-secondary": "#164E63", // deep ocean
      "--background-tertiary": "#155E75", // medium ocean
      "--surface-primary": "#155E75", // dark cards
      "--surface-secondary": "#0E7490", // elevated dark surfaces
      "--surface-coral": "#9A3412", // dark coral accents
      // Border & Divider System
      "--border-light": "#0E7490",
      "--border-medium": "#0891B2",
      "--border-strong": "#06B6D4",
      "--border-interactive": "#22D3EE",
      "--border-focus": "#67E8F9",
      "--divider": "#0E7490",
      // Interactive States
      "--hover-primary": "#67E8F9",
      "--hover-secondary": "#FDBA74",
      "--active-primary": "#22D3EE",
      "--focus-ring": "#06B6D4",
      "--selected-background": "#0E7490",
      "--selected-text": "#A5F3FC",
      // Semantic Colors (adapted for dark)
      "--success-light": "#34D399", "--success-medium": "#10B981", "--success-dark": "#059669",
      "--success-50": "#064E3B", "--success-500": "#34D399", "--success-700": "#A7F3D0",
      "--warning-light": "#FBBF24", "--warning-medium": "#F59E0B", "--warning-dark": "#78350F",
      "--warning-50": "#78350F", "--warning-500": "#FBBF24", "--warning-700": "#FEF3C7",
      "--error-light": "#F87171", "--error-medium": "#EF4444", "--error-dark": "#7F1D1D",
      "--error-50": "#7F1D1D", "--error-500": "#F87171", "--error-700": "#FECACA",
      "--info-light": "#22D3EE", "--info-medium": "#06B6D4", "--info-dark": "#0891B2",
      "--info-50": "#164E63", "--info-500": "#22D3EE", "--info-700": "#A5F3FC",
      // Compatibility
      "--color-primary": "#22D3EE", "--color-accent": "#FB923C", "--color-background": "#0C1B2E",
      "--color-surface": "#155E75", "--color-text": "#F0F9FF", "--color-text-secondary": "#CFFAFE", "--color-border": "#0E7490",
    },
  },
  "desert-storm": {
    light: {
      // Foundation Colors - Primary Terracotta Scale
      "--primary-50": "#FEF2F2", "--primary-100": "#FEE2E2", "--primary-200": "#FECACA",
      "--primary-300": "#FCA5A5", "--primary-400": "#F87171", "--primary-500": "#DC2626",
      "--primary-600": "#B91C1C", "--primary-700": "#991B1B", "--primary-800": "#7F1D1D", "--primary-900": "#7F1D1D",
      // Foundation Colors - Secondary Sand Scale
      "--secondary-50": "#FFFBEB", "--secondary-100": "#FEF3C7", "--secondary-200": "#FDE68A",
      "--secondary-300": "#FCD34D", "--secondary-400": "#FBBF24", "--secondary-500": "#F59E0B",
      "--secondary-600": "#D97706", "--secondary-700": "#B45309", "--secondary-800": "#78350F", "--secondary-900": "#78350F",
      // Accent Desert Rose
      "--accent-desert-rose": "#BE185D",
      
      // Typography System - Warm Earthy
      "--font-family-primary": "'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      "--font-family-secondary": "'Crimson Text', Georgia, serif",
      "--font-family-mono": "'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace",
      "--font-family-display": "'Playfair Display', 'Crimson Text', Georgia, serif",
      
      // Font Weights - Earthy Feel
      "--font-weight-light": "300",
      "--font-weight-normal": "400",
      "--font-weight-medium": "500",
      "--font-weight-semibold": "600",
      "--font-weight-bold": "700",
      "--font-weight-extrabold": "800",
      
      // Font Sizes - Warm Scale
      "--font-size-xs": "0.75rem", // 12px
      "--font-size-sm": "0.875rem", // 14px
      "--font-size-base": "1rem", // 16px
      "--font-size-lg": "1.125rem", // 18px
      "--font-size-xl": "1.25rem", // 20px
      "--font-size-2xl": "1.5rem", // 24px
      "--font-size-3xl": "1.875rem", // 30px
      "--font-size-4xl": "2.25rem", // 36px
      "--font-size-5xl": "3rem", // 48px
      
      // Line Heights - Comfortable
      "--line-height-tight": "1.25",
      "--line-height-snug": "1.375",
      "--line-height-normal": "1.5",
      "--line-height-relaxed": "1.625",
      "--line-height-loose": "2",
      
      // Letter Spacing - Natural
      "--letter-spacing-tighter": "-0.05em",
      "--letter-spacing-tight": "-0.025em",
      "--letter-spacing-normal": "0em",
      "--letter-spacing-wide": "0.025em",
      "--letter-spacing-wider": "0.05em",
      "--letter-spacing-widest": "0.1em",
      
      // Text System
      "--text-primary": "#92400E", // warm brown
      "--text-secondary": "#B45309", // medium brown
      "--text-tertiary": "#D97706", // light brown
      "--text-disabled": "#FDE68A", // very light
      "--text-inverse": "#FEF3C7", // on dark
      "--text-link": "#DC2626", // terracotta links
      "--text-link-hover": "#B91C1C", // darker hover
      "--text-rose": "#BE185D", // rose highlights
      // Background System
      "--background-primary": "#FFFBEB", // warm cream
      "--background-secondary": "#FEF3C7", // light sand
      "--background-tertiary": "#FED7AA", // deeper sand
      "--surface-primary": "#FFFFFF", // cards
      "--surface-secondary": "#FFFBEB", // elevated
      "--surface-warm": "#FEF2F2", // warm surfaces
      // Border & Divider System
      "--border-light": "#FED7AA",
      "--border-medium": "#FCD34D",
      "--border-strong": "#FBBF24",
      "--border-interactive": "#DC2626",
      "--border-focus": "#F87171",
      "--divider": "#FED7AA",
      // Interactive States
      "--hover-primary": "#B91C1C",
      "--hover-secondary": "#D97706",
      "--active-primary": "#7F1D1D",
      "--focus-ring": "#FCA5A5",
      "--selected-background": "#FEE2E2",
      "--selected-text": "#7F1D1D",
      // Semantic Colors - Success
      "--success-light": "#10B981", "--success-medium": "#059669", "--success-dark": "#047857",
      "--success-50": "#ECFDF5", "--success-500": "#10B981", "--success-700": "#059669",
      // Semantic Colors - Warning
      "--warning-light": "#F59E0B", "--warning-medium": "#D97706", "--warning-dark": "#92400E",
      "--warning-50": "#FFFBEB", "--warning-500": "#F59E0B", "--warning-700": "#D97706",
      // Semantic Colors - Error
      "--error-light": "#DC2626", "--error-medium": "#B91C1C", "--error-dark": "#7F1D1D",
      "--error-50": "#FEF2F2", "--error-500": "#DC2626", "--error-700": "#B91C1C",
      // Semantic Colors - Info
      "--info-light": "#0891B2", "--info-medium": "#0E7490", "--info-dark": "#164E63",
      "--info-50": "#F0F9FF", "--info-500": "#0891B2", "--info-700": "#164E63",
      // Compatibility
      "--color-primary": "#DC2626", "--color-accent": "#BE185D", "--color-background": "#FFFBEB",
      "--color-surface": "#FEF3C7", "--color-text": "#92400E", "--color-text-secondary": "#B45309", "--color-border": "#FED7AA",
    },
    dark: {
      // Foundation Colors - Primary Terracotta Scale (inverted)
      "--primary-50": "#7F1D1D", "--primary-100": "#991B1B", "--primary-200": "#B91C1C",
      "--primary-300": "#DC2626", "--primary-400": "#EF4444", "--primary-500": "#F87171",
      "--primary-600": "#FCA5A5", "--primary-700": "#FECACA", "--primary-800": "#FEE2E2", "--primary-900": "#FEF2F2",
      // Foundation Colors - Secondary Sand Scale (inverted)
      "--secondary-50": "#78350F", "--secondary-100": "#92400E", "--secondary-200": "#B45309",
      "--secondary-300": "#D97706", "--secondary-400": "#F59E0B", "--secondary-500": "#FBBF24",
      "--secondary-600": "#FCD34D", "--secondary-700": "#FDE68A", "--secondary-800": "#FEF3C7", "--secondary-900": "#FFFBEB",
      // Accent Desert Rose (adapted for dark)
      "--accent-desert-rose": "#F472B6",
      
      // Typography System - Warm Earthy (Dark Mode)
      "--font-family-primary": "'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      "--font-family-secondary": "'Crimson Text', Georgia, serif",
      "--font-family-mono": "'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace",
      "--font-family-display": "'Playfair Display', 'Crimson Text', Georgia, serif",
      
      // Font Weights (same as light)
      "--font-weight-light": "300", "--font-weight-normal": "400", "--font-weight-medium": "500",
      "--font-weight-semibold": "600", "--font-weight-bold": "700", "--font-weight-extrabold": "800",
      
      // Font Sizes (same as light)
      "--font-size-xs": "0.75rem", "--font-size-sm": "0.875rem", "--font-size-base": "1rem",
      "--font-size-lg": "1.125rem", "--font-size-xl": "1.25rem", "--font-size-2xl": "1.5rem",
      "--font-size-3xl": "1.875rem", "--font-size-4xl": "2.25rem", "--font-size-5xl": "3rem",
      
      // Line Heights (same as light)
      "--line-height-tight": "1.25", "--line-height-snug": "1.375", "--line-height-normal": "1.5",
      "--line-height-relaxed": "1.625", "--line-height-loose": "2",
      
      // Letter Spacing (same as light)
      "--letter-spacing-tighter": "-0.05em", "--letter-spacing-tight": "-0.025em", "--letter-spacing-normal": "0em",
      "--letter-spacing-wide": "0.025em", "--letter-spacing-wider": "0.05em", "--letter-spacing-widest": "0.1em",
      
      // Text System
      "--text-primary": "#FEF3C7", // light on dark
      "--text-secondary": "#FDE68A", // medium light
      "--text-tertiary": "#FCD34D", // lighter
      "--text-disabled": "#B45309", // dark disabled
      "--text-inverse": "#92400E", // dark text on light
      "--text-link": "#F87171", // bright terracotta links
      "--text-link-hover": "#FCA5A5", // brighter hover
      "--text-rose": "#F472B6", // bright rose highlights
      // Background System
      "--background-primary": "#78350F", // very warm brown
      "--background-secondary": "#92400E", // warm brown
      "--background-tertiary": "#B45309", // medium brown
      "--surface-primary": "#B45309", // dark cards
      "--surface-secondary": "#D97706", // elevated dark surfaces
      "--surface-warm": "#7F1D1D", // dark warm surfaces
      // Border & Divider System
      "--border-light": "#D97706",
      "--border-medium": "#F59E0B",
      "--border-strong": "#FBBF24",
      "--border-interactive": "#F87171",
      "--border-focus": "#FCA5A5",
      "--divider": "#D97706",
      // Interactive States
      "--hover-primary": "#FCA5A5",
      "--hover-secondary": "#FCD34D",
      "--active-primary": "#F87171",
      "--focus-ring": "#EF4444",
      "--selected-background": "#D97706",
      "--selected-text": "#FDE68A",
      // Semantic Colors (adapted for dark)
      "--success-light": "#34D399", "--success-medium": "#10B981", "--success-dark": "#064E3B",
      "--success-50": "#064E3B", "--success-500": "#34D399", "--success-700": "#A7F3D0",
      "--warning-light": "#FBBF24", "--warning-medium": "#F59E0B", "--warning-dark": "#78350F",
      "--warning-50": "#78350F", "--warning-500": "#FBBF24", "--warning-700": "#FEF3C7",
      "--error-light": "#F87171", "--error-medium": "#EF4444", "--error-dark": "#7F1D1D",
      "--error-50": "#7F1D1D", "--error-500": "#F87171", "--error-700": "#FECACA",
      "--info-light": "#22D3EE", "--info-medium": "#06B6D4", "--info-dark": "#164E63",
      "--info-50": "#164E63", "--info-500": "#22D3EE", "--info-700": "#A5F3FC",
      // Compatibility
      "--color-primary": "#F87171", "--color-accent": "#F472B6", "--color-background": "#78350F",
      "--color-surface": "#B45309", "--color-text": "#FEF3C7", "--color-text-secondary": "#FDE68A", "--color-border": "#F59E0B",
    },
  },
  "berry-fields": {
    light: {
      // Foundation Colors - Primary Purple Scale
      "--primary-50": "#F3E8FF", "--primary-100": "#E9D5FF", "--primary-200": "#DDD6FE",
      "--primary-300": "#C4B5FD", "--primary-400": "#A78BFA", "--primary-500": "#7C3AED",
      "--primary-600": "#6B21A8", "--primary-700": "#5B21B6", "--primary-800": "#581C87", "--primary-900": "#581C87",
      // Foundation Colors - Secondary Pink Scale
      "--secondary-50": "#FDF2F8", "--secondary-100": "#FCE7F3", "--secondary-200": "#FBCFE8",
      "--secondary-300": "#F9A8D4", "--secondary-400": "#F472B6", "--secondary-500": "#DB2777",
      "--secondary-600": "#BE185D", "--secondary-700": "#9D174D", "--secondary-800": "#831843", "--secondary-900": "#831843",
      // Accent Lavender
      "--accent-lavender": "#A78BFA",
      // Text System
      "--text-primary": "#581C87", // deep purple
      "--text-secondary": "#6B21A8", // medium purple
      "--text-tertiary": "#7C3AED", // light purple
      "--text-disabled": "#DDD6FE", // very light
      "--text-inverse": "#F3E8FF", // on dark
      "--text-link": "#7C3AED", // purple links
      "--text-link-hover": "#6B21A8", // darker hover
      "--text-pink": "#BE185D", // pink highlights
      // Background System
      "--background-primary": "#FEFCFF", // pure white with purple tint
      "--background-secondary": "#FAF5FF", // light purple
      "--background-tertiary": "#F3E8FF", // lighter purple
      "--surface-primary": "#FFFFFF", // cards
      "--surface-secondary": "#FAF5FF", // elevated
      "--surface-pink": "#FDF2F8", // pink surfaces
      // Border & Divider System
      "--border-light": "#F3E8FF",
      "--border-medium": "#E9D5FF",
      "--border-strong": "#DDD6FE",
      "--border-interactive": "#7C3AED",
      "--border-focus": "#A78BFA",
      "--divider": "#E9D5FF",
      // Interactive States
      "--hover-primary": "#6B21A8",
      "--hover-secondary": "#BE185D",
      "--active-primary": "#581C87",
      "--focus-ring": "#C4B5FD",
      "--selected-background": "#E9D5FF",
      "--selected-text": "#581C87",
      // Semantic Colors - Success
      "--success-light": "#10B981", "--success-medium": "#059669", "--success-dark": "#047857",
      "--success-50": "#ECFDF5", "--success-500": "#10B981", "--success-700": "#059669",
      // Semantic Colors - Warning
      "--warning-light": "#F59E0B", "--warning-medium": "#D97706", "--warning-dark": "#92400E",
      "--warning-50": "#FFFBEB", "--warning-500": "#F59E0B", "--warning-700": "#D97706",
      // Semantic Colors - Error
      "--error-light": "#EF4444", "--error-medium": "#DC2626", "--error-dark": "#B91C1C",
      "--error-50": "#FEF2F2", "--error-500": "#EF4444", "--error-700": "#DC2626",
      // Semantic Colors - Info
      "--info-light": "#0891B2", "--info-medium": "#0E7490", "--info-dark": "#164E63",
      "--info-50": "#F0F9FF", "--info-500": "#0891B2", "--info-700": "#164E63",
      // Compatibility
      "--color-primary": "#7C3AED", "--color-accent": "#DB2777", "--color-background": "#FEFCFF",
      "--color-surface": "#FAF5FF", "--color-text": "#581C87", "--color-text-secondary": "#6B21A8", "--color-border": "#E9D5FF",
    },
    dark: {
      // Foundation Colors - Primary Purple Scale (inverted)
      "--primary-50": "#581C87", "--primary-100": "#5B21B6", "--primary-200": "#6B21A8",
      "--primary-300": "#7C3AED", "--primary-400": "#8B5CF6", "--primary-500": "#A78BFA",
      "--primary-600": "#C4B5FD", "--primary-700": "#DDD6FE", "--primary-800": "#E9D5FF", "--primary-900": "#F3E8FF",
      // Foundation Colors - Secondary Pink Scale (inverted)
      "--secondary-50": "#831843", "--secondary-100": "#9D174D", "--secondary-200": "#BE185D",
      "--secondary-300": "#DB2777", "--secondary-400": "#EC4899", "--secondary-500": "#F472B6",
      "--secondary-600": "#F9A8D4", "--secondary-700": "#FBCFE8", "--secondary-800": "#FCE7F3", "--secondary-900": "#FDF2F8",
      // Accent Lavender (adapted for dark)
      "--accent-lavender": "#C4B5FD",
      // Text System
      "--text-primary": "#F3E8FF", // light on dark
      "--text-secondary": "#E9D5FF", // medium light
      "--text-tertiary": "#DDD6FE", // lighter
      "--text-disabled": "#6B21A8", // dark disabled
      "--text-inverse": "#581C87", // dark text on light
      "--text-link": "#A78BFA", // bright purple links
      "--text-link-hover": "#C4B5FD", // brighter hover
      "--text-pink": "#F472B6", // bright pink highlights
      // Background System
      "--background-primary": "#581C87", // deep purple
      "--background-secondary": "#5B21B6", // medium purple
      "--background-tertiary": "#6B21A8", // lighter purple
      "--surface-primary": "#5B21B6", // dark cards
      "--surface-secondary": "#6B21A8", // elevated dark surfaces
      "--surface-pink": "#831843", // dark pink surfaces
      // Border & Divider System
      "--border-light": "#6B21A8",
      "--border-medium": "#7C3AED",
      "--border-strong": "#8B5CF6",
      "--border-interactive": "#A78BFA",
      "--border-focus": "#C4B5FD",
      "--divider": "#6B21A8",
      // Interactive States
      "--hover-primary": "#C4B5FD",
      "--hover-secondary": "#F9A8D4",
      "--active-primary": "#A78BFA",
      "--focus-ring": "#8B5CF6",
      "--selected-background": "#6B21A8",
      "--selected-text": "#DDD6FE",
      // Semantic Colors - Success (dark adapted)
      "--success-light": "#34D399", "--success-medium": "#10B981", "--success-dark": "#064E3B",
      "--success-50": "#064E3B", "--success-500": "#34D399", "--success-700": "#A7F3D0",
      // Semantic Colors - Warning (dark adapted)
      "--warning-light": "#FBBF24", "--warning-medium": "#F59E0B", "--warning-dark": "#78350F",
      "--warning-50": "#78350F", "--warning-500": "#FBBF24", "--warning-700": "#FEF3C7",
      // Semantic Colors - Error (dark adapted)
      "--error-light": "#F87171", "--error-medium": "#EF4444", "--error-dark": "#7F1D1D",
      "--error-50": "#7F1D1D", "--error-500": "#F87171", "--error-700": "#FECACA",
      // Semantic Colors - Info (dark adapted)
      "--info-light": "#22D3EE", "--info-medium": "#06B6D4", "--info-dark": "#164E63",
      "--info-50": "#164E63", "--info-500": "#22D3EE", "--info-700": "#A5F3FC",
      // Compatibility
      "--color-primary": "#A78BFA", "--color-accent": "#F472B6", "--color-background": "#581C87",
      "--color-surface": "#5B21B6", "--color-text": "#F3E8FF", "--color-text-secondary": "#E9D5FF", "--color-border": "#7C3AED",
    },
  },
  "arctic-moss": {
    light: {
      // Foundation Colors - Primary Steel Blue Scale
      "--primary-50": "#EFF6FF", "--primary-100": "#DBEAFE", "--primary-200": "#BFDBFE",
      "--primary-300": "#93C5FD", "--primary-400": "#60A5FA", "--primary-500": "#1E40AF",
      "--primary-600": "#1D4ED8", "--primary-700": "#2563EB", "--primary-800": "#1E3A8A", "--primary-900": "#1E3A8A",
      // Foundation Colors - Secondary Mint Scale
      "--secondary-50": "#ECFDF5", "--secondary-100": "#D1FAE5", "--secondary-200": "#A7F3D0",
      "--secondary-300": "#6EE7B7", "--secondary-400": "#34D399", "--secondary-500": "#10B981",
      "--secondary-600": "#059669", "--secondary-700": "#047857", "--secondary-800": "#064E3B", "--secondary-900": "#064E3B",
      // Accent Ice Blue
      "--accent-ice-blue": "#22D3EE",
      // Text System
      "--text-primary": "#1E3A8A", // deep blue
      "--text-secondary": "#1D4ED8", // medium blue
      "--text-tertiary": "#2563EB", // light blue
      "--text-disabled": "#DBEAFE", // very light
      "--text-inverse": "#EFF6FF", // on dark
      "--text-link": "#1E40AF", // blue links
      "--text-link-hover": "#1D4ED8", // darker hover
      "--text-mint": "#059669", // mint highlights
      // Background System
      "--background-primary": "#F9FAFB", // cool gray
      "--background-secondary": "#F3F4F6", // light gray
      "--background-tertiary": "#EFF6FF", // light blue
      "--surface-primary": "#FFFFFF", // cards
      "--surface-secondary": "#F3F4F6", // elevated
      "--surface-cool": "#EFF6FF", // cool surfaces
      // Border & Divider System
      "--border-light": "#EFF6FF",
      "--border-medium": "#DBEAFE",
      "--border-strong": "#BFDBFE",
      "--border-interactive": "#1E40AF",
      "--border-focus": "#60A5FA",
      "--divider": "#E5E7EB",
      // Interactive States
      "--hover-primary": "#1D4ED8",
      "--hover-secondary": "#047857",
      "--active-primary": "#1E3A8A",
      "--focus-ring": "#93C5FD",
      "--selected-background": "#DBEAFE",
      "--selected-text": "#1E3A8A",
      // Semantic Colors - Success
      "--success-light": "#10B981", "--success-medium": "#059669", "--success-dark": "#047857",
      "--success-50": "#ECFDF5", "--success-500": "#10B981", "--success-700": "#059669",
      // Semantic Colors - Warning
      "--warning-light": "#F59E0B", "--warning-medium": "#D97706", "--warning-dark": "#92400E",
      "--warning-50": "#FFFBEB", "--warning-500": "#F59E0B", "--warning-700": "#D97706",
      // Semantic Colors - Error
      "--error-light": "#EF4444", "--error-medium": "#DC2626", "--error-dark": "#B91C1C",
      "--error-50": "#FEF2F2", "--error-500": "#EF4444", "--error-700": "#DC2626",
      // Semantic Colors - Info
      "--info-light": "#1E40AF", "--info-medium": "#1D4ED8", "--info-dark": "#1E3A8A",
      "--info-50": "#EFF6FF", "--info-500": "#1E40AF", "--info-700": "#1E3A8A",
      // Compatibility
      "--color-primary": "#1E40AF", "--color-accent": "#10B981", "--color-background": "#F9FAFB",
      "--color-surface": "#F3F4F6", "--color-text": "#1E3A8A", "--color-text-secondary": "#1D4ED8", "--color-border": "#DBEAFE",
    },
    dark: {
      // Foundation Colors - Primary Steel Blue Scale (inverted)
      "--primary-50": "#1E3A8A", "--primary-100": "#2563EB", "--primary-200": "#1D4ED8",
      "--primary-300": "#1E40AF", "--primary-400": "#3B82F6", "--primary-500": "#60A5FA",
      "--primary-600": "#93C5FD", "--primary-700": "#BFDBFE", "--primary-800": "#DBEAFE", "--primary-900": "#EFF6FF",
      // Foundation Colors - Secondary Mint Scale (inverted)
      "--secondary-50": "#064E3B", "--secondary-100": "#047857", "--secondary-200": "#059669",
      "--secondary-300": "#10B981", "--secondary-400": "#34D399", "--secondary-500": "#6EE7B7",
      "--secondary-600": "#A7F3D0", "--secondary-700": "#D1FAE5", "--secondary-800": "#ECFDF5", "--secondary-900": "#ECFDF5",
      // Accent Ice Blue (adapted for dark)
      "--accent-ice-blue": "#67E8F9",
      // Text System
      "--text-primary": "#EFF6FF", // light on dark
      "--text-secondary": "#DBEAFE", // medium light
      "--text-tertiary": "#BFDBFE", // lighter
      "--text-disabled": "#1D4ED8", // dark disabled
      "--text-inverse": "#1E3A8A", // dark text on light
      "--text-link": "#60A5FA", // bright blue links
      "--text-link-hover": "#93C5FD", // brighter hover
      "--text-mint": "#34D399", // bright mint highlights
      // Background System
      "--background-primary": "#1E3A8A", // deep blue
      "--background-secondary": "#2563EB", // medium blue
      "--background-tertiary": "#1D4ED8", // lighter blue
      "--surface-primary": "#2563EB", // dark cards
      "--surface-secondary": "#1D4ED8", // elevated dark surfaces
      "--surface-cool": "#1E40AF", // dark cool surfaces
      // Border & Divider System
      "--border-light": "#1D4ED8",
      "--border-medium": "#1E40AF",
      "--border-strong": "#3B82F6",
      "--border-interactive": "#60A5FA",
      "--border-focus": "#93C5FD",
      "--divider": "#1D4ED8",
      // Interactive States
      "--hover-primary": "#93C5FD",
      "--hover-secondary": "#A7F3D0",
      "--active-primary": "#60A5FA",
      "--focus-ring": "#3B82F6",
      "--selected-background": "#1D4ED8",
      "--selected-text": "#BFDBFE",
      // Semantic Colors - Success (dark adapted)
      "--success-light": "#34D399", "--success-medium": "#10B981", "--success-dark": "#064E3B",
      "--success-50": "#064E3B", "--success-500": "#34D399", "--success-700": "#A7F3D0",
      // Semantic Colors - Warning (dark adapted)
      "--warning-light": "#FBBF24", "--warning-medium": "#F59E0B", "--warning-dark": "#78350F",
      "--warning-50": "#78350F", "--warning-500": "#FBBF24", "--warning-700": "#FEF3C7",
      // Semantic Colors - Error (dark adapted)
      "--error-light": "#F87171", "--error-medium": "#EF4444", "--error-dark": "#7F1D1D",
      "--error-50": "#7F1D1D", "--error-500": "#F87171", "--error-700": "#FECACA",
      // Semantic Colors - Info (dark adapted)
      "--info-light": "#60A5FA", "--info-medium": "#3B82F6", "--info-dark": "#1E3A8A",
      "--info-50": "#1E3A8A", "--info-500": "#60A5FA", "--info-700": "#BFDBFE",
      // Compatibility
      "--color-primary": "#60A5FA", "--color-accent": "#34D399", "--color-background": "#1E3A8A",
      "--color-surface": "#2563EB", "--color-text": "#EFF6FF", "--color-text-secondary": "#DBEAFE", "--color-border": "#1E40AF",
    },
  },
  "sunset-gradient": {
    light: {
      // Foundation Colors - Primary Orange Scale
      "--primary-50": "#FEF3C7", "--primary-100": "#FDE68A", "--primary-200": "#FCD34D",
      "--primary-300": "#FBBF24", "--primary-400": "#F59E0B", "--primary-500": "#F59E0B",
      "--primary-600": "#D97706", "--primary-700": "#B45309", "--primary-800": "#78350F", "--primary-900": "#78350F",
      // Foundation Colors - Secondary Red Scale
      "--secondary-50": "#FEF2F2", "--secondary-100": "#FEE2E2", "--secondary-200": "#FECACA",
      "--secondary-300": "#FCA5A5", "--secondary-400": "#F87171", "--secondary-500": "#EF4444",
      "--secondary-600": "#DC2626", "--secondary-700": "#B91C1C", "--secondary-800": "#7F1D1D", "--secondary-900": "#7F1D1D",
      // Accent Pink
      "--accent-pink": "#F472B6",
      // Text System
      "--text-primary": "#7C2D12", // warm brown
      "--text-secondary": "#92400E", // medium brown
      "--text-tertiary": "#B45309", // light brown
      "--text-disabled": "#FED7AA", // very light
      "--text-inverse": "#FEF3C7", // on dark
      "--text-link": "#F59E0B", // orange links
      "--text-link-hover": "#D97706", // darker hover
      "--text-red": "#DC2626", // red highlights
      // Background System
      "--background-primary": "#FFFBF5", // warm white
      "--background-secondary": "#FEF2E7", // light orange
      "--background-tertiary": "#FED7AA", // deeper orange
      "--surface-primary": "#FFFFFF", // cards
      "--surface-secondary": "#FEF2E7", // elevated
      "--surface-gradient": "linear-gradient(135deg, #FEF3C7 0%, #FEF2F2 100%)", // gradient surfaces
      // Border & Divider System
      "--border-light": "#FED7AA",
      "--border-medium": "#FDE68A",
      "--border-strong": "#FCD34D",
      "--border-interactive": "#F59E0B",
      "--border-focus": "#FBBF24",
      "--divider": "#FED7AA",
      // Interactive States
      "--hover-primary": "#D97706",
      "--hover-secondary": "#DC2626",
      "--active-primary": "#92400E",
      "--focus-ring": "#FCD34D",
      "--selected-background": "#FEE2E2",
      "--selected-text": "#7C2D12",
      // Semantic Colors - Success
      "--success-light": "#10B981", "--success-medium": "#059669", "--success-dark": "#047857",
      "--success-50": "#ECFDF5", "--success-500": "#10B981", "--success-700": "#059669",
      // Semantic Colors - Warning
      "--warning-light": "#F59E0B", "--warning-medium": "#D97706", "--warning-dark": "#92400E",
      "--warning-50": "#FEF3C7", "--warning-500": "#F59E0B", "--warning-700": "#D97706",
      // Semantic Colors - Error
      "--error-light": "#EF4444", "--error-medium": "#DC2626", "--error-dark": "#B91C1C",
      "--error-50": "#FEF2F2", "--error-500": "#EF4444", "--error-700": "#DC2626",
      // Semantic Colors - Info
      "--info-light": "#0891B2", "--info-medium": "#0E7490", "--info-dark": "#164E63",
      "--info-50": "#F0F9FF", "--info-500": "#0891B2", "--info-700": "#164E63",
      // Compatibility
      "--color-primary": "#F59E0B", "--color-accent": "#F472B6", "--color-background": "#FFFBF5",
      "--color-surface": "#FEF2E7", "--color-text": "#7C2D12", "--color-text-secondary": "#92400E", "--color-border": "#FED7AA",
    },
    dark: {
      // Foundation Colors - Primary Orange Scale (inverted)
      "--primary-50": "#78350F", "--primary-100": "#92400E", "--primary-200": "#B45309",
      "--primary-300": "#D97706", "--primary-400": "#F59E0B", "--primary-500": "#FBBF24",
      "--primary-600": "#FCD34D", "--primary-700": "#FDE68A", "--primary-800": "#FEF3C7", "--primary-900": "#FEF3C7",
      // Foundation Colors - Secondary Red Scale (inverted)
      "--secondary-50": "#7F1D1D", "--secondary-100": "#991B1B", "--secondary-200": "#B91C1C",
      "--secondary-300": "#DC2626", "--secondary-400": "#EF4444", "--secondary-500": "#F87171",
      "--secondary-600": "#FCA5A5", "--secondary-700": "#FECACA", "--secondary-800": "#FEE2E2", "--secondary-900": "#FEF2F2",
      // Accent Pink (adapted for dark)
      "--accent-pink": "#F9A8D4",
      // Text System
      "--text-primary": "#FEF3C7", // light on dark
      "--text-secondary": "#FDE68A", // medium light
      "--text-tertiary": "#FCD34D", // lighter
      "--text-disabled": "#B45309", // dark disabled
      "--text-inverse": "#7C2D12", // dark text on light
      "--text-link": "#FBBF24", // bright orange links
      "--text-link-hover": "#FCD34D", // brighter hover
      "--text-red": "#F87171", // bright red highlights
      // Background System
      "--background-primary": "#7C2D12", // warm brown
      "--background-secondary": "#92400E", // medium brown
      "--background-tertiary": "#B45309", // lighter brown
      "--surface-primary": "#92400E", // dark cards
      "--surface-secondary": "#B45309", // elevated dark surfaces
      "--surface-gradient": "linear-gradient(135deg, #92400E 0%, #7F1D1D 100%)", // dark gradient surfaces
      // Border & Divider System
      "--border-light": "#B45309",
      "--border-medium": "#D97706",
      "--border-strong": "#F59E0B",
      "--border-interactive": "#FBBF24",
      "--border-focus": "#FCD34D",
      "--divider": "#B45309",
      // Interactive States
      "--hover-primary": "#FCD34D",
      "--hover-secondary": "#FCA5A5",
      "--active-primary": "#FBBF24",
      "--focus-ring": "#F59E0B",
      "--selected-background": "#B45309",
      "--selected-text": "#FDE68A",
      // Semantic Colors - Success (dark adapted)
      "--success-light": "#34D399", "--success-medium": "#10B981", "--success-dark": "#064E3B",
      "--success-50": "#064E3B", "--success-500": "#34D399", "--success-700": "#A7F3D0",
      // Semantic Colors - Warning (dark adapted)
      "--warning-light": "#FBBF24", "--warning-medium": "#F59E0B", "--warning-dark": "#78350F",
      "--warning-50": "#78350F", "--warning-500": "#FBBF24", "--warning-700": "#FEF3C7",
      // Semantic Colors - Error (dark adapted)
      "--error-light": "#F87171", "--error-medium": "#EF4444", "--error-dark": "#7F1D1D",
      "--error-50": "#7F1D1D", "--error-500": "#F87171", "--error-700": "#FECACA",
      // Semantic Colors - Info (dark adapted)
      "--info-light": "#22D3EE", "--info-medium": "#06B6D4", "--info-dark": "#164E63",
      "--info-50": "#164E63", "--info-500": "#22D3EE", "--info-700": "#A5F3FC",
      // Compatibility
      "--color-primary": "#FBBF24", "--color-accent": "#F9A8D4", "--color-background": "#7C2D12",
      "--color-surface": "#92400E", "--color-text": "#FEF3C7", "--color-text-secondary": "#FDE68A", "--color-border": "#D97706",
    },
  },
  "monochrome-pop": {
    light: {
      // Foundation Colors - Primary Charcoal Scale
      "--primary-50": "#F9FAFB", "--primary-100": "#F3F4F6", "--primary-200": "#E5E7EB",
      "--primary-300": "#D1D5DB", "--primary-400": "#9CA3AF", "--primary-500": "#374151",
      "--primary-600": "#1F2937", "--primary-700": "#111827", "--primary-800": "#111827", "--primary-900": "#111827",
      // Foundation Colors - Secondary Pure Black Scale
      "--secondary-50": "#F9FAFB", "--secondary-100": "#F3F4F6", "--secondary-200": "#E5E7EB",
      "--secondary-300": "#D1D5DB", "--secondary-400": "#9CA3AF", "--secondary-500": "#000000",
      "--secondary-600": "#000000", "--secondary-700": "#000000", "--secondary-800": "#000000", "--secondary-900": "#000000",
      // Accent Electric Green
      "--accent-electric-green": "#10B981",
      // Text System
      "--text-primary": "#111827", // pure black
      "--text-secondary": "#374151", // charcoal
      "--text-tertiary": "#6B7280", // medium gray
      "--text-disabled": "#D1D5DB", // light gray
      "--text-inverse": "#F9FAFB", // on dark
      "--text-link": "#374151", // charcoal links
      "--text-link-hover": "#111827", // black hover
      "--text-pop": "#10B981", // green highlights
      // Background System
      "--background-primary": "#FFFFFF", // pure white
      "--background-secondary": "#F9FAFB", // light gray
      "--background-tertiary": "#F3F4F6", // medium gray
      "--surface-primary": "#FFFFFF", // cards
      "--surface-secondary": "#F9FAFB", // elevated
      "--surface-dark": "#111827", // dark surfaces
      // Border & Divider System
      "--border-light": "#F3F4F6",
      "--border-medium": "#E5E7EB",
      "--border-strong": "#D1D5DB",
      "--border-interactive": "#374151",
      "--border-focus": "#10B981",
      "--divider": "#E5E7EB",
      // Interactive States
      "--hover-primary": "#1F2937",
      "--hover-secondary": "#047857",
      "--active-primary": "#111827",
      "--focus-ring": "#34D399",
      "--selected-background": "#F3F4F6",
      "--selected-text": "#111827",
      // Semantic Colors - Success
      "--success-light": "#10B981", "--success-medium": "#059669", "--success-dark": "#047857",
      "--success-50": "#ECFDF5", "--success-500": "#10B981", "--success-700": "#047857",
      // Semantic Colors - Warning
      "--warning-light": "#F59E0B", "--warning-medium": "#D97706", "--warning-dark": "#92400E",
      "--warning-50": "#FFFBEB", "--warning-500": "#F59E0B", "--warning-700": "#D97706",
      // Semantic Colors - Error
      "--error-light": "#EF4444", "--error-medium": "#DC2626", "--error-dark": "#B91C1C",
      "--error-50": "#FEF2F2", "--error-500": "#EF4444", "--error-700": "#DC2626",
      // Semantic Colors - Info
      "--info-light": "#0891B2", "--info-medium": "#0E7490", "--info-dark": "#164E63",
      "--info-50": "#F0F9FF", "--info-500": "#0891B2", "--info-700": "#164E63",
      // Compatibility
      "--color-primary": "#374151", "--color-accent": "#10B981", "--color-background": "#FFFFFF",
      "--color-surface": "#F9FAFB", "--color-text": "#111827", "--color-text-secondary": "#374151", "--color-border": "#D1D5DB",
    },
    dark: {
      // Foundation Colors - Primary Charcoal Scale (inverted)
      "--primary-50": "#111827", "--primary-100": "#1F2937", "--primary-200": "#374151",
      "--primary-300": "#4B5563", "--primary-400": "#6B7280", "--primary-500": "#9CA3AF",
      "--primary-600": "#D1D5DB", "--primary-700": "#E5E7EB", "--primary-800": "#F3F4F6", "--primary-900": "#F9FAFB",
      // Foundation Colors - Secondary Pure Black Scale (inverted)
      "--secondary-50": "#000000", "--secondary-100": "#000000", "--secondary-200": "#111827",
      "--secondary-300": "#1F2937", "--secondary-400": "#374151", "--secondary-500": "#6B7280",
      "--secondary-600": "#9CA3AF", "--secondary-700": "#D1D5DB", "--secondary-800": "#E5E7EB", "--secondary-900": "#F9FAFB",
      // Accent Electric Green (adapted for dark)
      "--accent-electric-green": "#34D399",
      // Text System
      "--text-primary": "#F9FAFB", // light on dark
      "--text-secondary": "#E5E7EB", // light gray
      "--text-tertiary": "#D1D5DB", // medium gray
      "--text-disabled": "#374151", // dark disabled
      "--text-inverse": "#111827", // dark text on light
      "--text-link": "#9CA3AF", // gray links
      "--text-link-hover": "#D1D5DB", // lighter hover
      "--text-pop": "#34D399", // bright green highlights
      // Background System
      "--background-primary": "#111827", // dark charcoal
      "--background-secondary": "#1F2937", // medium charcoal
      "--background-tertiary": "#374151", // lighter charcoal
      "--surface-primary": "#1F2937", // dark cards
      "--surface-secondary": "#374151", // elevated dark surfaces
      "--surface-dark": "#000000", // pure black surfaces
      // Border & Divider System
      "--border-light": "#374151",
      "--border-medium": "#4B5563",
      "--border-strong": "#6B7280",
      "--border-interactive": "#9CA3AF",
      "--border-focus": "#34D399",
      "--divider": "#374151",
      // Interactive States
      "--hover-primary": "#D1D5DB",
      "--hover-secondary": "#A7F3D0",
      "--active-primary": "#9CA3AF",
      "--focus-ring": "#10B981",
      "--selected-background": "#374151",
      "--selected-text": "#E5E7EB",
      // Semantic Colors - Success (dark adapted)
      "--success-light": "#34D399", "--success-medium": "#10B981", "--success-dark": "#064E3B",
      "--success-50": "#064E3B", "--success-500": "#34D399", "--success-700": "#A7F3D0",
      // Semantic Colors - Warning (dark adapted)
      "--warning-light": "#FBBF24", "--warning-medium": "#F59E0B", "--warning-dark": "#78350F",
      "--warning-50": "#78350F", "--warning-500": "#FBBF24", "--warning-700": "#FEF3C7",
      // Semantic Colors - Error (dark adapted)
      "--error-light": "#F87171", "--error-medium": "#EF4444", "--error-dark": "#7F1D1D",
      "--error-50": "#7F1D1D", "--error-500": "#F87171", "--error-700": "#FECACA",
      // Semantic Colors - Info (dark adapted)
      "--info-light": "#22D3EE", "--info-medium": "#06B6D4", "--info-dark": "#164E63",
      "--info-50": "#164E63", "--info-500": "#22D3EE", "--info-700": "#A5F3FC",
      // Compatibility
      "--color-primary": "#9CA3AF", "--color-accent": "#34D399", "--color-background": "#111827",
      "--color-surface": "#1F2937", "--color-text": "#F9FAFB", "--color-text-secondary": "#E5E7EB", "--color-border": "#374151",
    },
  },
}; 