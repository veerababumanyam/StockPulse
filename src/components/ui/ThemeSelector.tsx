import React, { useState } from 'react';
import { useTheme, ThemeMode, ColorTheme } from '../../contexts/ThemeContext';
import { Sun, Moon, Monitor, Check, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface ThemeSelectorProps {
  className?: string;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ className = '' }) => {
  const { mode, colorTheme, setMode, setColorTheme } = useTheme();
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
        return <Sun className="w-5 h-5" />;
      case 'dark':
        return <Moon className="w-5 h-5" />;
      case 'system':
        return <Monitor className="w-5 h-5" />;
      default:
        return <Sun className="w-5 h-5" />;
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
        return 'Light';
    }
  };

  const getColorThemeName = () => {
    switch (colorTheme) {
      case 'default':
        return 'Default';
      case 'tropical-jungle':
        return 'Tropical Jungle';
      case 'ocean-sunset':
        return 'Ocean Sunset';
      case 'desert-storm':
        return 'Desert Storm';
      case 'berry-fields':
        return 'Berry Fields';
      case 'arctic-moss':
        return 'Arctic Moss';
      default:
        return 'Default';
    }
  };

  const getColorThemePreview = (theme: ColorTheme) => {
    switch (theme) {
      case 'default':
        return (
          <div className="flex space-x-1">
            <div className="w-4 h-4 rounded-full bg-[#FF1493]"></div>
            <div className="w-4 h-4 rounded-full bg-black"></div>
            <div className="w-4 h-4 rounded-full bg-white border border-gray-200"></div>
          </div>
        );
      case 'tropical-jungle':
        return (
          <div className="flex space-x-1">
            <div className="w-4 h-4 rounded-full bg-[#29A329]"></div>
            <div className="w-4 h-4 rounded-full bg-[#32CD32]"></div>
            <div className="w-4 h-4 rounded-full bg-[#FFFF00]"></div>
          </div>
        );
      case 'ocean-sunset':
        return (
          <div className="flex space-x-1">
            <div className="w-4 h-4 rounded-full bg-[#008B8B]"></div>
            <div className="w-4 h-4 rounded-full bg-[#FF7F50]"></div>
            <div className="w-4 h-4 rounded-full bg-[#FFCBA4]"></div>
          </div>
        );
      case 'desert-storm':
        return (
          <div className="flex space-x-1">
            <div className="w-4 h-4 rounded-full bg-[#C19A6B]"></div>
            <div className="w-4 h-4 rounded-full bg-[#B7410E]"></div>
            <div className="w-4 h-4 rounded-full bg-[#F4A460]"></div>
          </div>
        );
      case 'berry-fields':
        return (
          <div className="flex space-x-1">
            <div className="w-4 h-4 rounded-full bg-[#8E4585]"></div>
            <div className="w-4 h-4 rounded-full bg-[#FF1493]"></div>
            <div className="w-4 h-4 rounded-full bg-[#E6E6FA]"></div>
          </div>
        );
      case 'arctic-moss':
        return (
          <div className="flex space-x-1">
            <div className="w-4 h-4 rounded-full bg-[#4682B4]"></div>
            <div className="w-4 h-4 rounded-full bg-[#9CAF88]"></div>
            <div className="w-4 h-4 rounded-full bg-[#B0E0E6]"></div>
          </div>
        );
      default:
        return (
          <div className="flex space-x-1">
            <div className="w-4 h-4 rounded-full bg-[#FF1493]"></div>
            <div className="w-4 h-4 rounded-full bg-black"></div>
            <div className="w-4 h-4 rounded-full bg-white border border-gray-200"></div>
          </div>
        );
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex space-x-2">
        {/* Mode selector */}
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="flex items-center space-x-2 bg-background-100 dark:bg-background-800 hover:bg-background-200 dark:hover:bg-background-700 text-text-800 dark:text-text-200 px-3 py-2 rounded-md transition-colors duration-200"
            aria-haspopup="true"
            aria-expanded={isOpen}
          >
            {getModeIcon()}
            <span className="hidden sm:inline">{getModeName()} Mode</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 py-1"
            >
              <button
                onClick={() => handleModeChange('light')}
                className="flex items-center justify-between w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div className="flex items-center">
                  <Sun className="w-4 h-4 mr-2" />
                  <span>Light</span>
                </div>
                {mode === 'light' && <Check className="w-4 h-4 text-primary-500" />}
              </button>
              <button
                onClick={() => handleModeChange('dark')}
                className="flex items-center justify-between w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div className="flex items-center">
                  <Moon className="w-4 h-4 mr-2" />
                  <span>Dark</span>
                </div>
                {mode === 'dark' && <Check className="w-4 h-4 text-primary-500" />}
              </button>
              <button
                onClick={() => handleModeChange('system')}
                className="flex items-center justify-between w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div className="flex items-center">
                  <Monitor className="w-4 h-4 mr-2" />
                  <span>System</span>
                </div>
                {mode === 'system' && <Check className="w-4 h-4 text-primary-500" />}
              </button>
            </motion.div>
          )}
        </div>

        {/* Color theme selector */}
        <div className="relative">
          <button
            onClick={toggleColorDropdown}
            className="flex items-center space-x-2 bg-background-100 dark:bg-background-800 hover:bg-background-200 dark:hover:bg-background-700 text-text-800 dark:text-text-200 px-3 py-2 rounded-md transition-colors duration-200"
            aria-haspopup="true"
            aria-expanded={isColorOpen}
          >
            {getColorThemePreview(colorTheme)}
            <span className="hidden sm:inline">{getColorThemeName()}</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {isColorOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 py-1"
            >
              <button
                onClick={() => handleColorThemeChange('default')}
                className="flex items-center justify-between w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div className="flex items-center">
                  {getColorThemePreview('default')}
                  <span className="ml-2">Default</span>
                </div>
                {colorTheme === 'default' && <Check className="w-4 h-4 text-primary-500" />}
              </button>
              <button
                onClick={() => handleColorThemeChange('tropical-jungle')}
                className="flex items-center justify-between w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div className="flex items-center">
                  {getColorThemePreview('tropical-jungle')}
                  <span className="ml-2">Tropical Jungle</span>
                </div>
                {colorTheme === 'tropical-jungle' && <Check className="w-4 h-4 text-primary-500" />}
              </button>
              <button
                onClick={() => handleColorThemeChange('ocean-sunset')}
                className="flex items-center justify-between w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div className="flex items-center">
                  {getColorThemePreview('ocean-sunset')}
                  <span className="ml-2">Ocean Sunset</span>
                </div>
                {colorTheme === 'ocean-sunset' && <Check className="w-4 h-4 text-primary-500" />}
              </button>
              <button
                onClick={() => handleColorThemeChange('desert-storm')}
                className="flex items-center justify-between w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div className="flex items-center">
                  {getColorThemePreview('desert-storm')}
                  <span className="ml-2">Desert Storm</span>
                </div>
                {colorTheme === 'desert-storm' && <Check className="w-4 h-4 text-primary-500" />}
              </button>
              <button
                onClick={() => handleColorThemeChange('berry-fields')}
                className="flex items-center justify-between w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div className="flex items-center">
                  {getColorThemePreview('berry-fields')}
                  <span className="ml-2">Berry Fields</span>
                </div>
                {colorTheme === 'berry-fields' && <Check className="w-4 h-4 text-primary-500" />}
              </button>
              <button
                onClick={() => handleColorThemeChange('arctic-moss')}
                className="flex items-center justify-between w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div className="flex items-center">
                  {getColorThemePreview('arctic-moss')}
                  <span className="ml-2">Arctic Moss</span>
                </div>
                {colorTheme === 'arctic-moss' && <Check className="w-4 h-4 text-primary-500" />}
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;
