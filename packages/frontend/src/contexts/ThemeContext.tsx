import { getThemeHSL, ThemeColor, themeConfig, ThemeMode } from '@/lib/theme';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
  themeMode: ThemeMode;
  themeColor: ThemeColor;
  setThemeMode: (mode: ThemeMode) => void;
  setThemeColor: (color: ThemeColor) => void;
  toggleTheme: () => void;
  applyThemeClasses: (element: HTMLElement) => void;
  isInitialized: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Check local storage or system preference for initial theme
  const getInitialTheme = (): ThemeMode => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('themeMode') as ThemeMode;
      if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
        return savedTheme;
      }

      // Check if user prefers dark mode
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }

    return 'light';
  };

  // Get initial color theme from localStorage or default to magenta
  const getInitialColor = (): ThemeColor => {
    if (typeof window !== 'undefined') {
      const savedColor = localStorage.getItem('themeColor') as ThemeColor;
      if (savedColor && ['magenta', 'teal', 'indigo', 'amber', 'emerald', 'rose'].includes(savedColor)) {
        return savedColor;
      }
    }

    return 'magenta'; // Default color theme
  };

  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialTheme);
  const [themeColor, setThemeColor] = useState<ThemeColor>(getInitialColor);
  const [isInitialized, setIsInitialized] = useState(false);

  // Function to apply theme to any element (for portals, iframes, etc.)
  const applyThemeClasses = (element: HTMLElement) => {
    element.classList.remove('light', 'dark');
    element.classList.add(themeMode);

    // You could also apply theme CSS variables here if needed
  };

  // Update theme when it changes
  useEffect(() => {
    const root = window.document.documentElement;

    // Remove the old theme class
    root.classList.remove('light', 'dark');
    // Add the new theme class
    root.classList.add(themeMode);

    // Update CSS variables with HSL values
    const themeColors = themeConfig[themeMode][themeColor];
    const hslVariables = getThemeHSL(themeColors);

    // Apply CSS variables to root
    Object.entries(hslVariables).forEach(([variable, value]) => {
      root.style.setProperty(variable, value);
    });

    // Store in local storage
    localStorage.setItem('themeMode', themeMode);
    localStorage.setItem('themeColor', themeColor);

    // Dispatch a custom event for any non-React components that need to respond to theme changes
    const themeChangeEvent = new CustomEvent('themechange', {
      detail: { mode: themeMode, color: themeColor }
    });
    window.dispatchEvent(themeChangeEvent);

    // Mark as initialized
    if (!isInitialized) {
      setIsInitialized(true);
    }
  }, [themeMode, themeColor, isInitialized]);

  // Toggle between light and dark
  const toggleTheme = () => {
    setThemeMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{
      themeMode,
      themeColor,
      setThemeMode,
      setThemeColor,
      toggleTheme,
      applyThemeClasses,
      isInitialized
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};
