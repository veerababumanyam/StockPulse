export type ThemeMode = 'light' | 'dark';
export type ThemeColor = 'magenta' | 'teal' | 'indigo' | 'amber' | 'emerald' | 'rose';

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  border: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
}

export interface ThemeConfig {
  [key: string]: ThemeColors;
}

// Define multiple color themes
const themes: Record<ThemeColor, { light: ThemeColors; dark: ThemeColors }> = {
  // Magenta (Default) theme
  // Vibrant Pink/Magenta: #FF006A
  // Deep Charcoal: #2B2B2B
  // Cool Light Gray: #E0E0E0
  // Muted Teal: #008080
  // Pure White: #FFFFFF
  magenta: {
    light: {
      primary: '#FF006A', // Vibrant Pink/Magenta
      secondary: '#008080', // Muted Teal
      background: '#FFFFFF', // Pure White
      foreground: '#2B2B2B', // Deep Charcoal
      card: '#FFFFFF', // Pure White
      cardForeground: '#2B2B2B', // Deep Charcoal
      border: '#E0E0E0', // Cool Light Gray
      muted: '#F3F3F3', // Lighter Cool Light Gray
      mutedForeground: '#747474', // Mid Gray
      accent: '#F5F5F5', // Light Gray
      accentForeground: '#2B2B2B', // Deep Charcoal
      destructive: '#FF3B3B', // Red
      destructiveForeground: '#FFFFFF', // Pure White
    },
    dark: {
      primary: '#FF006A', // Vibrant Pink/Magenta
      secondary: '#00A3A3', // Brighter Muted Teal
      background: '#1E1E1E', // VS Code inspired dark background
      foreground: '#E8E8E8', // Light gray text (not pure white)
      card: '#252526', // Slightly lighter than background
      cardForeground: '#E8E8E8', // Light gray text
      border: '#3E3E42', // Visible borders in dark mode
      muted: '#2D2D30', // VS Code inspired dark UI element bg
      mutedForeground: '#CCCCCC', // Muted text (more visible than before)
      accent: '#37373D', // VS Code inspired selection/hover
      accentForeground: '#FFFFFF', // White text on accent
      destructive: '#F14C4C', // Brighter red for better visibility
      destructiveForeground: '#FFFFFF', // White text on destructive
    }
  },
  
  // Teal theme
  teal: {
    light: {
      primary: '#0D9488', // Teal
      secondary: '#6366F1', // Indigo
      background: '#FFFFFF',
      foreground: '#0F172A',
      card: '#FFFFFF',
      cardForeground: '#0F172A',
      border: '#E2E8F0',
      muted: '#F1F5F9',
      mutedForeground: '#64748B',
      accent: '#F1F5F9',
      accentForeground: '#0F172A',
      destructive: '#EF4444',
      destructiveForeground: '#FFFFFF',
    },
    dark: {
      primary: '#2DD4BF', // Teal
      secondary: '#818CF8', // Indigo
      background: '#1E1E1E', // VS Code inspired dark background
      foreground: '#E8E8E8', // Light gray text
      card: '#252526', // Slightly lighter than background
      cardForeground: '#E8E8E8', // Light gray text
      border: '#3E3E42', // Visible borders
      muted: '#2D2D30', // VS Code inspired
      mutedForeground: '#CCCCCC', // More visible muted text
      accent: '#37373D', // VS Code inspired
      accentForeground: '#FFFFFF', // White text on accent
      destructive: '#F14C4C', // Brighter destructive
      destructiveForeground: '#FFFFFF', // White text on destructive
    }
  },
  
  // Indigo theme
  indigo: {
    light: {
      primary: '#6366F1', // Indigo
      secondary: '#F43F5E', // Rose
      background: '#FFFFFF',
      foreground: '#1E1B4B',
      card: '#FFFFFF',
      cardForeground: '#1E1B4B',
      border: '#E2E8F0',
      muted: '#F1F5F9',
      mutedForeground: '#64748B',
      accent: '#F1F5F9',
      accentForeground: '#1E1B4B',
      destructive: '#EF4444',
      destructiveForeground: '#FFFFFF',
    },
    dark: {
      primary: '#818CF8', // Indigo
      secondary: '#FB7185', // Rose
      background: '#1E1E1E', // VS Code inspired
      foreground: '#E8E8E8', // Light gray text
      card: '#252526', // Card background
      cardForeground: '#E8E8E8', // Card text
      border: '#3E3E42', // Visible borders
      muted: '#2D2D30', // VS Code inspired
      mutedForeground: '#CCCCCC', // More visible
      accent: '#37373D', // VS Code inspired
      accentForeground: '#FFFFFF', // White on accent
      destructive: '#F14C4C', // Brighter destructive
      destructiveForeground: '#FFFFFF', // White on destructive
    }
  },
  
  // Amber theme
  amber: {
    light: {
      primary: '#F59E0B', // Amber
      secondary: '#10B981', // Emerald
      background: '#FFFFFF',
      foreground: '#451A03',
      card: '#FFFFFF',
      cardForeground: '#451A03',
      border: '#E2E8F0',
      muted: '#F1F5F9',
      mutedForeground: '#64748B',
      accent: '#FEF3C7',
      accentForeground: '#451A03',
      destructive: '#EF4444',
      destructiveForeground: '#FFFFFF',
    },
    dark: {
      primary: '#FBBF24', // Amber
      secondary: '#34D399', // Emerald
      background: '#1E1E1E', // VS Code inspired
      foreground: '#E8E8E8', // Light gray text
      card: '#252526', // Card background
      cardForeground: '#E8E8E8', // Card text
      border: '#3E3E42', // Visible borders
      muted: '#2D2D30', // VS Code inspired
      mutedForeground: '#CCCCCC', // More visible
      accent: '#37373D', // VS Code inspired
      accentForeground: '#FFFFFF', // White on accent
      destructive: '#F14C4C', // Brighter destructive
      destructiveForeground: '#FFFFFF', // White on destructive
    }
  },
  
  // Emerald theme
  emerald: {
    light: {
      primary: '#10B981', // Emerald
      secondary: '#8B5CF6', // Purple
      background: '#FFFFFF',
      foreground: '#064E3B',
      card: '#FFFFFF',
      cardForeground: '#064E3B',
      border: '#ECFDF5',
      muted: '#F1F5F9',
      mutedForeground: '#64748B',
      accent: '#ECFDF5',
      accentForeground: '#064E3B',
      destructive: '#EF4444',
      destructiveForeground: '#FFFFFF',
    },
    dark: {
      primary: '#34D399', // Emerald
      secondary: '#A78BFA', // Purple
      background: '#1E1E1E', // VS Code inspired
      foreground: '#E8E8E8', // Light gray text
      card: '#252526', // Card background
      cardForeground: '#E8E8E8', // Card text
      border: '#3E3E42', // Visible borders
      muted: '#2D2D30', // VS Code inspired
      mutedForeground: '#CCCCCC', // More visible
      accent: '#37373D', // VS Code inspired
      accentForeground: '#FFFFFF', // White on accent
      destructive: '#F14C4C', // Brighter destructive
      destructiveForeground: '#FFFFFF', // White on destructive
    }
  },
  
  // Rose theme
  rose: {
    light: {
      primary: '#F43F5E', // Rose
      secondary: '#3B82F6', // Blue
      background: '#FFFFFF',
      foreground: '#881337',
      card: '#FFFFFF',
      cardForeground: '#881337',
      border: '#E2E8F0',
      muted: '#F1F5F9',
      mutedForeground: '#64748B',
      accent: '#FEE2E2',
      accentForeground: '#881337',
      destructive: '#9F1239',
      destructiveForeground: '#FFFFFF',
    },
    dark: {
      primary: '#FB7185', // Rose
      secondary: '#60A5FA', // Blue
      background: '#1E1E1E', // VS Code inspired
      foreground: '#E8E8E8', // Light gray text
      card: '#252526', // Card background
      cardForeground: '#E8E8E8', // Card text
      border: '#3E3E42', // Visible borders
      muted: '#2D2D30', // VS Code inspired
      mutedForeground: '#CCCCCC', // More visible
      accent: '#37373D', // VS Code inspired
      accentForeground: '#FFFFFF', // White on accent
      destructive: '#F14C4C', // Brighter destructive
      destructiveForeground: '#FFFFFF', // White on destructive
    }
  }
};

// Export theme configuration
export const themeConfig: Record<ThemeMode, Record<ThemeColor, ThemeColors>> = {
  light: {
    magenta: themes.magenta.light,
    teal: themes.teal.light,
    indigo: themes.indigo.light,
    amber: themes.amber.light,
    emerald: themes.emerald.light,
    rose: themes.rose.light
  },
  dark: {
    magenta: themes.magenta.dark,
    teal: themes.teal.dark,
    indigo: themes.indigo.dark,
    amber: themes.amber.dark,
    emerald: themes.emerald.dark,
    rose: themes.rose.dark
  }
};

// Convert HEX to HSL for CSS variables
export function hexToHSL(hex: string): string {
  // Remove the # if present
  hex = hex.replace('#', '');
  
  // Convert hex to RGB
  let r = parseInt(hex.substring(0, 2), 16) / 255;
  let g = parseInt(hex.substring(2, 4), 16) / 255;
  let b = parseInt(hex.substring(4, 6), 16) / 255;
  
  // Find min and max RGB values
  let max = Math.max(r, g, b);
  let min = Math.min(r, g, b);
  
  let h = 0, s = 0, l = (max + min) / 2;
  
  if (max !== min) {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    
    h /= 6;
  }
  
  // Convert to degrees, percentage, percentage
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);
  
  return `${h} ${s}% ${l}%`;
}

// Convert theme colors to HSL for CSS variables
export function getThemeHSL(theme: ThemeColors): Record<string, string> {
  return {
    '--primary': hexToHSL(theme.primary),
    '--secondary': hexToHSL(theme.secondary),
    '--background': hexToHSL(theme.background),
    '--foreground': hexToHSL(theme.foreground),
    '--card': hexToHSL(theme.card),
    '--card-foreground': hexToHSL(theme.cardForeground),
    '--border': hexToHSL(theme.border),
    '--muted': hexToHSL(theme.muted),
    '--muted-foreground': hexToHSL(theme.mutedForeground),
    '--accent': hexToHSL(theme.accent),
    '--accent-foreground': hexToHSL(theme.accentForeground),
    '--destructive': hexToHSL(theme.destructive),
    '--destructive-foreground': hexToHSL(theme.destructiveForeground),
  };
}

// Theme names for display
export const themeNames: Record<ThemeColor, string> = {
  magenta: "Magenta",
  teal: "Teal",
  indigo: "Indigo",
  amber: "Amber",
  emerald: "Emerald",
  rose: "Rose"
}; 