/**
 * StockPulse Theme Types - Centralized Integration
 * All theme data comes from colorPalettes.ts (single source of truth)
 */

import type { ColorTheme, ThemeMetadata } from "../theme/colorPalettes";
import { getAllThemeMetadata } from "../theme/colorPalettes";

// Re-export the centralized types properly
export type { ColorTheme, ThemeMetadata };

export type ThemeMode = "light" | "dark" | "system";

// Enhanced theme context interface
export interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  colorTheme: ColorTheme;
  setMode: (mode: ThemeMode) => void;
  setColorTheme: (theme: ColorTheme) => void;
  toggleMode: () => void;
}

// Get centralized theme metadata (derived from colorPalettes.ts)
export const COLOR_THEMES = getAllThemeMetadata();

// Theme constants
export const THEME_STORAGE_KEYS = {
  MODE: "stockpulse-theme-mode",
  COLOR_THEME: "stockpulse-color-theme",
} as const;

export const DEFAULT_THEME_CONFIG = {
  mode: "system" as ThemeMode,
  colorTheme: "default" as ColorTheme,
};
