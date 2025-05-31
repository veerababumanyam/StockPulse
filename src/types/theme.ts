// StockPulse Theme Types

// Define theme modes
export type ThemeMode = "light" | "dark" | "system";

// Define all available color themes
export type ColorTheme =
  | "default" // ⚡ Electric Minimalist
  | "cyber-neon" // 🔮 Cyber Luxury
  | "sage-terracotta" // 🌿 Sage Terracotta
  | "midnight-aurora" // 🌌 Midnight Aurora
  | "tropical-jungle" // 🌿 Tropical Jungle
  | "ocean-sunset" // 🌊 Ocean Sunset
  | "desert-storm" // 🏜️ Desert Storm
  | "berry-fields" // 🫐 Berry Fields
  | "arctic-moss" // ❄️ Arctic Moss
  | "sunset-gradient" // 🌅 Sunset Gradient
  | "monochrome-pop"; // ⚫ Monochrome Pop

// Theme metadata interface
export interface ThemeMetadata {
  key: ColorTheme;
  name: string;
  description: string;
  category: ThemeCategory;
  emoji: string;
  primaryColors: string[];
  isDarkDominant?: boolean;
  isLightDominant?: boolean;
}

// Theme categories
export type ThemeCategory = 
  | "Modern"
  | "Dark"
  | "Natural"
  | "Warm"
  | "Cool"
  | "Vibrant"
  | "Minimal";

// CSS Variable names for theme colors
export type ThemeColorVariable =
  // Foundation Colors
  | "--primary-50" | "--primary-100" | "--primary-200" | "--primary-300" | "--primary-400"
  | "--primary-500" | "--primary-600" | "--primary-700" | "--primary-800" | "--primary-900"
  | "--secondary-50" | "--secondary-100" | "--secondary-200" | "--secondary-300" | "--secondary-400"
  | "--secondary-500" | "--secondary-600" | "--secondary-700" | "--secondary-800" | "--secondary-900"
  
  // Text System
  | "--text-primary" | "--text-secondary" | "--text-tertiary" | "--text-disabled"
  | "--text-inverse" | "--text-link" | "--text-link-hover"
  
  // Background System
  | "--background-primary" | "--background-secondary" | "--background-tertiary"
  | "--surface-primary" | "--surface-secondary" | "--surface-raised"
  
  // Border & Divider System
  | "--border-light" | "--border-medium" | "--border-strong"
  | "--border-interactive" | "--border-focus" | "--divider"
  
  // Interactive States
  | "--hover-primary" | "--hover-secondary" | "--active-primary"
  | "--focus-ring" | "--selected-background" | "--selected-text"
  
  // Semantic Colors
  | "--success-50" | "--success-500" | "--success-700"
  | "--warning-50" | "--warning-500" | "--warning-700"
  | "--error-50" | "--error-500" | "--error-700"
  | "--info-50" | "--info-500" | "--info-700"
  
  // Compatibility Colors
  | "--color-primary" | "--color-accent" | "--color-background"
  | "--color-surface" | "--color-text" | "--color-text-secondary" | "--color-border";

// Theme palette structure
export interface ThemePalette {
  light: Record<ThemeColorVariable, string>;
  dark: Record<ThemeColorVariable, string>;
}

// Complete theme configuration
export interface ThemeConfig {
  mode: ThemeMode;
  colorTheme: ColorTheme;
  metadata: ThemeMetadata;
}

// Theme context interface
export interface ThemeContextType {
  mode: ThemeMode;
  colorTheme: ColorTheme;
  setMode: (mode: ThemeMode) => void;
  setColorTheme: (theme: ColorTheme) => void;
  toggleMode: () => void;
  getThemeMetadata: (theme: ColorTheme) => ThemeMetadata;
  isDarkMode: boolean;
  isSystemMode: boolean;
}

// Theme selector props
export interface ThemeSelectorProps {
  className?: string;
  showLabels?: boolean;
  compact?: boolean;
  orientation?: "horizontal" | "vertical";
}

// Theme preview component props
export interface ThemePreviewProps {
  theme: ColorTheme;
  size?: "small" | "medium" | "large";
  showName?: boolean;
  onClick?: () => void;
  isSelected?: boolean;
}

// Theme constants
export const THEME_STORAGE_KEYS = {
  MODE: "theme-mode",
  COLOR_THEME: "color-theme",
  CACHE_VERSION: "cache-version"
} as const;

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  mode: "system",
  colorTheme: "default",
  metadata: {
    key: "default",
    name: "Electric Minimalist",
    description: "Clean, modern design with electric blue accents",
    category: "Modern",
    emoji: "⚡",
    primaryColors: ["#3B82F6", "#EC4899", "#84CC16"],
    isLightDominant: true
  }
};

// Theme metadata for all available themes
export const THEME_METADATA: Record<ColorTheme, ThemeMetadata> = {
  "default": {
    key: "default",
    name: "Electric Minimalist",
    description: "Clean, modern design with electric blue accents",
    category: "Modern",
    emoji: "⚡",
    primaryColors: ["#3B82F6", "#EC4899", "#84CC16"],
    isLightDominant: true
  },
  "cyber-neon": {
    key: "cyber-neon",
    name: "Cyber Luxury",
    description: "Dark-dominant futuristic theme with neon highlights",
    category: "Dark",
    emoji: "🔮",
    primaryColors: ["#8B5CF6", "#22D3EE", "#F59E0B"],
    isDarkDominant: true
  },
  "sage-terracotta": {
    key: "sage-terracotta",
    name: "Sage Terracotta",
    description: "Natural earth tones with sage green",
    category: "Natural",
    emoji: "🌿",
    primaryColors: ["#84CC16", "#EF4444", "#A3E635"]
  },
  "midnight-aurora": {
    key: "midnight-aurora",
    name: "Midnight Aurora",
    description: "Deep blues with golden aurora accents",
    category: "Dark",
    emoji: "🌌",
    primaryColors: ["#3B82F6", "#F59E0B", "#60A5FA"],
    isDarkDominant: true
  },
  "tropical-jungle": {
    key: "tropical-jungle",
    name: "Tropical Jungle",
    description: "Modern botanical with sage greens and jungle orange",
    category: "Natural",
    emoji: "🌿",
    primaryColors: ["#059669", "#84CC16", "#F97316"]
  },
  "ocean-sunset": {
    key: "ocean-sunset",
    name: "Ocean Sunset",
    description: "Coastal luxury with ocean blues and coral",
    category: "Natural",
    emoji: "🌊",
    primaryColors: ["#0891B2", "#F97316", "#FBBF24"]
  },
  "desert-storm": {
    key: "desert-storm",
    name: "Desert Storm",
    description: "Warm earthy terracotta and sand tones",
    category: "Warm",
    emoji: "🏜️",
    primaryColors: ["#DC2626", "#F59E0B", "#BE185D"]
  },
  "berry-fields": {
    key: "berry-fields",
    name: "Berry Fields",
    description: "Sophisticated purple and pink palette",
    category: "Vibrant",
    emoji: "🫐",
    primaryColors: ["#7C3AED", "#DB2777", "#A78BFA"]
  },
  "arctic-moss": {
    key: "arctic-moss",
    name: "Arctic Moss",
    description: "Clean tech with steel blue and mint",
    category: "Cool",
    emoji: "❄️",
    primaryColors: ["#1E40AF", "#10B981", "#22D3EE"]
  },
  "sunset-gradient": {
    key: "sunset-gradient",
    name: "Sunset Gradient",
    description: "Warm modern oranges and reds",
    category: "Warm",
    emoji: "🌅",
    primaryColors: ["#F59E0B", "#EF4444", "#F472B6"]
  },
  "monochrome-pop": {
    key: "monochrome-pop",
    name: "Monochrome Pop",
    description: "Minimalist bold with electric green accent",
    category: "Minimal",
    emoji: "⚫",
    primaryColors: ["#374151", "#000000", "#10B981"]
  }
};

// Utility functions
export const getThemeMetadata = (theme: ColorTheme): ThemeMetadata => {
  return THEME_METADATA[theme] || THEME_METADATA.default;
};

export const getThemesByCategory = (category: ThemeCategory): ColorTheme[] => {
  return Object.values(THEME_METADATA)
    .filter(meta => meta.category === category)
    .map(meta => meta.key);
};

export const getAllThemeCategories = (): ThemeCategory[] => {
  return Array.from(new Set(Object.values(THEME_METADATA).map(meta => meta.category)));
};

export const isDarkDominantTheme = (theme: ColorTheme): boolean => {
  return THEME_METADATA[theme]?.isDarkDominant || false;
};

export const isLightDominantTheme = (theme: ColorTheme): boolean => {
  return THEME_METADATA[theme]?.isLightDominant || false;
}; 