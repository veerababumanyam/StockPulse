import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { THEME_METADATA } from "@/types/theme";
import type { ColorTheme } from "@/types/theme";

interface ThemePreviewProps {
  className?: string;
  showAllThemes?: boolean;
}

const ThemePreview: React.FC<ThemePreviewProps> = ({
  className = "",
  showAllThemes = false,
}) => {
  const { colorTheme, setColorTheme, getThemeMetadata } = useTheme();

  const currentTheme = getThemeMetadata(colorTheme);
  const allThemes = Object.values(THEME_METADATA);

  const PreviewCard: React.FC<{ theme: ColorTheme; isActive?: boolean }> = ({
    theme,
    isActive = false,
  }) => {
    const metadata = getThemeMetadata(theme);

    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
          relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
          ${
            isActive
              ? "border-primary ring-2 ring-primary/20 bg-surface"
              : "border-border hover:border-primary/50 bg-surface/50"
          }
        `}
        onClick={() => setColorTheme(theme)}
      >
        {/* Theme Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{metadata.emoji}</span>
            <div>
              <h3 className="font-semibold text-sm text-text">
                {metadata.name}
              </h3>
              <p className="text-xs text-text/60">{metadata.category}</p>
            </div>
          </div>
          {isActive && (
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          )}
        </div>

        {/* Color Preview */}
        <div className="flex space-x-1 mb-2">
          {metadata.primaryColors.map((color, index) => (
            <div
              key={index}
              className="w-6 h-6 rounded-md border border-border/20 shadow-sm"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        {/* Description */}
        <p className="text-xs text-text/70 leading-relaxed">
          {metadata.description}
        </p>

        {/* Theme Indicators */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex space-x-1">
            {metadata.isDarkDominant && (
              <span className="text-xs px-2 py-1 bg-gray-800 text-white rounded-full">
                Dark
              </span>
            )}
            {metadata.isLightDominant && (
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                Light
              </span>
            )}
          </div>
          <span className="text-xs text-text/50 font-mono">{theme}</span>
        </div>
      </motion.div>
    );
  };

  if (showAllThemes) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text mb-2">
            🎨 StockPulse Color Themes
          </h2>
          <p className="text-text/60">
            Choose from {allThemes.length} comprehensive themes designed for
            modern financial applications
          </p>
        </div>

        {/* Current Theme Highlight */}
        <div className="p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl border border-border">
          <h3 className="text-lg font-semibold text-text mb-4">
            Currently Active: {currentTheme.emoji} {currentTheme.name}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-text mb-2">Theme Details</h4>
              <ul className="space-y-1 text-sm text-text/70">
                <li>
                  <strong>Category:</strong> {currentTheme.category}
                </li>
                <li>
                  <strong>Description:</strong> {currentTheme.description}
                </li>
                <li>
                  <strong>Colors:</strong> {currentTheme.primaryColors.length}{" "}
                  primary colors
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-text mb-2">Color Palette</h4>
              <div className="flex flex-wrap gap-2">
                {currentTheme.primaryColors.map((color, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className="w-8 h-8 rounded-lg border border-border/20 shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs text-text/60 mt-1 font-mono">
                      {color}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* All Themes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {allThemes.map((theme) => (
            <PreviewCard
              key={theme.key}
              theme={theme.key}
              isActive={theme.key === colorTheme}
            />
          ))}
        </div>

        {/* Theme Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {[
            "Modern",
            "Dark",
            "Natural",
            "Warm",
            "Cool",
            "Vibrant",
            "Minimal",
          ].map((category) => {
            const count = allThemes.filter(
              (theme) => theme.category === category,
            ).length;
            return count > 0 ? (
              <div
                key={category}
                className="text-center p-4 bg-surface rounded-lg border border-border"
              >
                <div className="text-2xl font-bold text-primary">{count}</div>
                <div className="text-sm text-text/60">{category} Themes</div>
              </div>
            ) : null;
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <PreviewCard theme={colorTheme} isActive={true} />
    </div>
  );
};

export default ThemePreview;
