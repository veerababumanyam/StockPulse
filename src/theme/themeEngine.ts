/**
 * Central Theme Engine - Single Coordinator for All Theme Operations
 * Enterprise-grade theme management with unified storage, analytics, and application
 */

import {
  ColorTheme,
  ThemeMode,
  colorPalettes,
  getThemeColors,
  isValidTheme,
} from "./colorPalettes";
import {
  ThemeComposer,
  type ThemeComposition,
  type ThemeVariant,
} from "./themeComposer";
import { ThemeStorageManager } from "../utils/theme/themeStorage";
import { ThemeAnalyticsEngine } from "../utils/theme/themeAnalytics";

// Define required types for ThemeEngine
export type { ThemeMode } from "./colorPalettes";

// Enhanced theme configuration
export interface ThemeEngineConfig {
  enableAnalytics: boolean;
  enableStorage: boolean;
  enableCrossTabSync: boolean;
  enableRecommendations: boolean;
  autoSaveInterval: number;
  transitionDuration: number;
  enableHaptics: boolean;
  enableAccessibility: boolean;
}

export interface ThemeState {
  mode: ThemeMode;
  colorTheme: ColorTheme;
  variant: ThemeVariant;
  isDark: boolean;
  isTransitioning: boolean;
  lastChanged: number;
}

export interface ThemeRecommendation {
  theme: ColorTheme;
  mode: ThemeMode;
  confidence: number;
  reason: string;
  energyImpact: "low" | "medium" | "high";
  performanceImpact: "low" | "medium" | "high";
}

// Storage data structure compatible with ThemeStorageManager
interface ThemeStorageData {
  mode: ThemeMode;
  colorTheme: ColorTheme;
  variant?: string;
  customizations?: any;
  timestamp: number;
  version: string;
}

/**
 * Central Theme Engine - Coordinates all theme operations
 */
export class ThemeEngine {
  private storage: ThemeStorageManager;
  private analytics: ThemeAnalyticsEngine;
  private composer: ThemeComposer;
  private config: ThemeEngineConfig;
  private state: ThemeState;
  private listeners: Set<(state: ThemeState) => void> = new Set();
  private transitionTimeout: NodeJS.Timeout | null = null;

  constructor(config: Partial<ThemeEngineConfig> = {}) {
    this.config = {
      enableAnalytics: true,
      enableStorage: true,
      enableCrossTabSync: true,
      enableRecommendations: true,
      autoSaveInterval: 30000, // 30 seconds
      transitionDuration: 300,
      enableHaptics: true,
      enableAccessibility: true,
      ...config,
    };

    // Initialize subsystems
    this.storage = new ThemeStorageManager({
      enableSync: this.config.enableCrossTabSync,
    });
    this.analytics = new ThemeAnalyticsEngine();
    this.composer = new ThemeComposer();

    // Initialize state
    this.state = {
      mode: "system",
      colorTheme: "default",
      variant: "default",
      isDark: false,
      isTransitioning: false,
      lastChanged: Date.now(),
    };

    this.initialize();
  }

  /**
   * Initialize the theme engine
   */
  private async initialize(): Promise<void> {
    try {
      // Load saved theme state
      if (this.config.enableStorage) {
        await this.loadSavedState();
      }

      // Apply initial theme
      await this.applyCurrentTheme();

      // Setup system theme listener
      this.setupSystemThemeListener();

      // Setup auto-save
      if (this.config.autoSaveInterval > 0) {
        setInterval(() => this.autoSave(), this.config.autoSaveInterval);
      }

      console.log("🎨 ThemeEngine initialized successfully");
    } catch (error) {
      console.error("Failed to initialize ThemeEngine:", error);
      // Apply fallback theme
      await this.applyTheme("default", "system");
    }
  }

  /**
   * Apply a theme with full coordination
   */
  async applyTheme(
    colorTheme: ColorTheme,
    mode: ThemeMode,
    variant: ThemeVariant = "default",
    context: string = "manual",
  ): Promise<boolean> {
    try {
      // Validate theme
      if (!isValidTheme(colorTheme)) {
        console.warn(`Invalid theme "${colorTheme}", falling back to default`);
        colorTheme = "default";
      }

      // Set transitioning state
      this.updateState({ isTransitioning: true });

      // Calculate resolved mode
      const isDark = this.resolveMode(mode);

      // Compose theme with variant
      const composition: ThemeComposition = {
        base: colorTheme,
        variant,
        size: "md",
        density: "medium",
      };

      const composedTheme = this.composer.composeTheme(composition);

      // Apply theme to DOM
      await this.applyToDOM(colorTheme, isDark, composedTheme);

      // Update state
      this.updateState({
        mode,
        colorTheme,
        variant,
        isDark,
        lastChanged: Date.now(),
      });

      // Save to storage
      if (this.config.enableStorage) {
        await this.saveCurrentState();
      }

      // Track analytics
      if (this.config.enableAnalytics) {
        await this.analytics.trackThemeUsage(colorTheme, mode, context);
      }

      // Haptic feedback
      if (this.config.enableHaptics && "vibrate" in navigator) {
        navigator.vibrate(50);
      }

      // Clear transitioning state after delay
      if (this.transitionTimeout) {
        clearTimeout(this.transitionTimeout);
      }
      this.transitionTimeout = setTimeout(() => {
        this.updateState({ isTransitioning: false });
      }, this.config.transitionDuration);

      return true;
    } catch (error) {
      console.error("Failed to apply theme:", error);
      this.updateState({ isTransitioning: false });
      return false;
    }
  }

  /**
   * Apply theme to DOM with comprehensive CSS variable mapping
   */
  private async applyToDOM(
    colorTheme: ColorTheme,
    isDark: boolean,
    composedTheme?: any,
  ): Promise<void> {
    const root = document.documentElement;

    // Apply dark/light mode
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Get theme colors from centralized palette
    const themeColors = getThemeColors(colorTheme, isDark ? "dark" : "light");

    // Remove existing theme classes
    const existingThemeClasses = Array.from(root.classList).filter((cls) =>
      cls.startsWith("theme-"),
    );
    existingThemeClasses.forEach((cls) => root.classList.remove(cls));

    // Add current theme class
    root.classList.add(`theme-${colorTheme}`);

    // Apply all CSS custom properties from centralized palette
    Object.entries(themeColors).forEach(([property, value]) => {
      if (typeof value === "string") {
        const cssProperty = property.startsWith("--")
          ? property
          : `--${property}`;
        root.style.setProperty(cssProperty, value);
      }
    });

    // Apply composed theme if available
    if (composedTheme) {
      Object.entries(composedTheme).forEach(([property, value]) => {
        if (typeof value === "string") {
          const cssProperty = property.startsWith("--")
            ? property
            : `--${property}`;
          root.style.setProperty(cssProperty, value);
        }
      });
    }

    // Apply semantic mappings for component compatibility
    this.applySemanticMappings(themeColors);
  }

  /**
   * Apply semantic CSS variable mappings for component compatibility
   */
  private applySemanticMappings(themeColors: Record<string, string>): void {
    const root = document.documentElement;

    // Background mappings
    if (themeColors["--background-primary"]) {
      root.style.setProperty(
        "--background",
        themeColors["--background-primary"],
      );
      root.style.setProperty(
        "--surface",
        themeColors["--surface-primary"] || themeColors["--background-primary"],
      );
    } else if (themeColors["--color-background"]) {
      root.style.setProperty("--background", themeColors["--color-background"]);
      root.style.setProperty(
        "--surface",
        themeColors["--color-surface"] || themeColors["--color-background"],
      );
    }

    // Text mappings
    if (themeColors["--text-primary"]) {
      root.style.setProperty("--foreground", themeColors["--text-primary"]);
      root.style.setProperty(
        "--muted-foreground",
        themeColors["--text-secondary"] || themeColors["--text-primary"],
      );
    } else if (themeColors["--color-text"]) {
      root.style.setProperty("--foreground", themeColors["--color-text"]);
      root.style.setProperty(
        "--muted-foreground",
        themeColors["--color-text-secondary"] || themeColors["--color-text"],
      );
    }

    // Border mappings
    if (themeColors["--border-light"]) {
      root.style.setProperty("--border", themeColors["--border-light"]);
    } else if (themeColors["--color-border"]) {
      root.style.setProperty("--border", themeColors["--color-border"]);
    }

    // Primary color mappings
    if (themeColors["--primary-600"]) {
      root.style.setProperty("--primary", themeColors["--primary-600"]);
    } else if (themeColors["--color-primary"]) {
      root.style.setProperty("--primary", themeColors["--color-primary"]);
    }
  }

  /**
   * Toggle between light and dark modes
   */
  async toggleMode(): Promise<boolean> {
    const newMode: ThemeMode = this.state.isDark ? "light" : "dark";
    return this.applyTheme(
      this.state.colorTheme,
      newMode,
      this.state.variant,
      "toggle",
    );
  }

  /**
   * Get AI-powered theme recommendations
   */
  async getRecommendations(): Promise<ThemeRecommendation[]> {
    if (!this.config.enableRecommendations) return [];

    try {
      return await this.analytics.getThemeRecommendations();
    } catch (error) {
      console.error("Failed to get theme recommendations:", error);
      return [];
    }
  }

  /**
   * Get theme analytics data
   */
  async getAnalytics(): Promise<any> {
    if (!this.config.enableAnalytics) return null;

    try {
      return await this.analytics.generateInsights();
    } catch (error) {
      console.error("Failed to get theme analytics:", error);
      return null;
    }
  }

  /**
   * Auto-switch theme based on AI recommendations
   */
  async autoSwitchTheme(): Promise<boolean> {
    if (!this.config.enableRecommendations) return false;

    try {
      const recommendation = await this.analytics.autoSwitchTheme();
      if (recommendation) {
        return this.applyTheme(
          recommendation.theme,
          recommendation.mode,
          this.state.variant,
          "auto",
        );
      }
      return false;
    } catch (error) {
      console.error("Failed to auto-switch theme:", error);
      return false;
    }
  }

  /**
   * Subscribe to theme state changes
   */
  subscribe(listener: (state: ThemeState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Get current theme state
   */
  getState(): ThemeState {
    return { ...this.state };
  }

  /**
   * Resolve theme mode (handle system preference)
   */
  private resolveMode(mode: ThemeMode): boolean {
    if (mode === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return mode === "dark";
  }

  /**
   * Setup system theme change listener
   */
  private setupSystemThemeListener(): void {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (this.state.mode === "system") {
        this.applyCurrentTheme();
      }
    };

    mediaQuery.addEventListener("change", handleChange);
  }

  /**
   * Apply current theme (refresh)
   */
  private async applyCurrentTheme(): Promise<void> {
    await this.applyToDOM(
      this.state.colorTheme,
      this.resolveMode(this.state.mode),
    );
  }

  /**
   * Update internal state and notify listeners
   */
  private updateState(updates: Partial<ThemeState>): void {
    this.state = { ...this.state, ...updates };
    this.listeners.forEach((listener) => {
      try {
        listener(this.state);
      } catch (error) {
        console.error("Theme state listener error:", error);
      }
    });
  }

  /**
   * Load saved theme state from storage
   */
  private async loadSavedState(): Promise<void> {
    try {
      const savedData = await this.storage.loadThemeData();
      if (savedData) {
        this.state = {
          mode: savedData.mode,
          colorTheme: savedData.colorTheme,
          variant: (savedData.variant as ThemeVariant) || "default",
          isDark: this.resolveMode(savedData.mode),
          isTransitioning: false,
          lastChanged: savedData.timestamp,
        };
      }
    } catch (error) {
      console.error("Failed to load saved theme state:", error);
    }
  }

  /**
   * Save current state to storage
   */
  private async saveCurrentState(): Promise<void> {
    try {
      await this.storage.saveThemeData({
        mode: this.state.mode,
        colorTheme: this.state.colorTheme,
        variant: this.state.variant,
        customizations: {},
        timestamp: this.state.lastChanged,
        version: "1.0.0",
      });
    } catch (error) {
      console.error("Failed to save theme state:", error);
    }
  }

  /**
   * Auto-save current state
   */
  private async autoSave(): Promise<void> {
    if (this.config.enableStorage) {
      await this.saveCurrentState();
    }
  }

  /**
   * Export theme data for backup
   */
  async exportThemeData(): Promise<string> {
    return this.storage.exportThemeData();
  }

  /**
   * Import theme data from backup
   */
  async importThemeData(data: string): Promise<boolean> {
    const success = await this.storage.importThemeData(data);
    if (success) {
      await this.loadSavedState();
      await this.applyCurrentTheme();
    }
    return success;
  }

  /**
   * Reset to default theme
   */
  async resetToDefault(): Promise<boolean> {
    return this.applyTheme("default", "system", "default", "reset");
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.transitionTimeout) {
      clearTimeout(this.transitionTimeout);
    }
    this.listeners.clear();
  }
}

// Singleton instance for global access
export const themeEngine = new ThemeEngine();
export default themeEngine;
