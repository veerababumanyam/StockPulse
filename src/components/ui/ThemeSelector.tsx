import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Monitor, Check, ChevronDown } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import type { ThemeMode, ColorTheme, THEME_METADATA } from '@/types/theme';

interface ThemeSelectorProps {
  className?: string;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ className = '' }) => {
  const { mode, setMode, colorTheme, setColorTheme, getThemeMetadata } =
    useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isColorOpen, setIsColorOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const toggleColorDropdown = () => setIsColorOpen(!isColorOpen);

  const handleModeChange = (newMode: ThemeMode) => {
    setMode(newMode);
    setIsOpen(false);
  };

  const handleColorThemeChange = (newTheme: ColorTheme) => {
    setColorTheme(newTheme);
    setIsColorOpen(false);
  };

  const getModeIcon = () => {
    switch (mode) {
      case 'light':
        return <Sun className="w-4 h-4" />;
      case 'dark':
        return <Moon className="w-4 h-4" />;
      case 'system':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const getModeName = () => {
    switch (mode) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
        return 'System';
      default:
        return 'System';
    }
  };

  const getColorThemeName = () => {
    const metadata = getThemeMetadata(colorTheme);
    return `${metadata.emoji} ${metadata.name}`;
  };

  const getColorThemePreview = (theme: ColorTheme) => {
    const metadata = getThemeMetadata(theme);
    return (
      <div className="flex space-x-1">
        {metadata.primaryColors.map((color, index) => (
          <div
            key={index}
            className="w-4 h-4 rounded-full border border-border/20"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    );
  };

  // Define all available themes with their metadata
  const allThemes = Object.values(THEME_METADATA);

  return (
    <div className={`relative ${className}`}>
      <div className="flex space-x-2">
        {/* Mode selector */}
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="flex items-center space-x-1 p-2 bg-surface hover:bg-surface/80 text-text rounded-md transition-colors duration-200 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
            aria-haspopup="true"
            aria-expanded={isOpen}
          >
            {getModeIcon()}
            <ChevronDown className="w-4 h-4" />
            <span className="sr-only">{getModeName()} Mode</span>
          </button>

          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-md shadow-lg z-10 py-1"
            >
              <button
                onClick={() => handleModeChange('light')}
                className="flex items-center justify-between w-full px-4 py-2 text-left text-sm text-text hover:bg-surface/80 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <div className="flex items-center">
                  <Sun className="w-4 h-4 mr-2" />
                  <span>Light</span>
                </div>
                {mode === 'light' && <Check className="w-4 h-4 text-primary" />}
              </button>
              <button
                onClick={() => handleModeChange('dark')}
                className="flex items-center justify-between w-full px-4 py-2 text-left text-sm text-text hover:bg-surface/80 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <div className="flex items-center">
                  <Moon className="w-4 h-4 mr-2" />
                  <span>Dark</span>
                </div>
                {mode === 'dark' && <Check className="w-4 h-4 text-primary" />}
              </button>
              <button
                onClick={() => handleModeChange('system')}
                className="flex items-center justify-between w-full px-4 py-2 text-left text-sm text-text hover:bg-surface/80 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <div className="flex items-center">
                  <Monitor className="w-4 h-4 mr-2" />
                  <span>System</span>
                </div>
                {mode === 'system' && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </button>
            </motion.div>
          )}
        </div>

        {/* Color theme selector */}
        <div className="relative">
          <button
            onClick={toggleColorDropdown}
            className="flex items-center space-x-1 p-2 bg-surface hover:bg-surface/80 text-text rounded-md transition-colors duration-200 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
            aria-haspopup="true"
            aria-expanded={isColorOpen}
          >
            {getColorThemePreview(colorTheme)}
            <ChevronDown className="w-4 h-4" />
            <span className="sr-only">{getColorThemeName()} Theme</span>
          </button>

          {isColorOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-80 bg-surface border border-border rounded-md shadow-lg z-10 py-1 max-h-96 overflow-y-auto"
            >
              {allThemes.map((theme) => (
                <button
                  key={theme.key}
                  onClick={() => handleColorThemeChange(theme.key)}
                  className="flex items-center justify-between w-full px-4 py-3 text-left text-sm text-text hover:bg-surface/80 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 border-b border-border/50 last:border-b-0"
                >
                  <div className="flex items-center">
                    {getColorThemePreview(theme.key)}
                    <div className="ml-3">
                      <div className="font-medium">
                        {theme.emoji} {theme.name}
                      </div>
                      <div className="text-xs text-text-secondary opacity-75">
                        {theme.description}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs px-2 py-1 bg-surface-secondary rounded-full text-text-tertiary">
                      {theme.category}
                    </span>
                    {colorTheme === theme.key && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;
