import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define theme types
export type ThemeMode = 'light' | 'dark' | 'system';
export type ColorTheme = 'default' | 'tropical-jungle' | 'ocean-sunset' | 'desert-storm' | 'berry-fields' | 'arctic-moss';

interface ThemeContextType {
  mode: ThemeMode;
  colorTheme: ColorTheme;
  setMode: (mode: ThemeMode) => void;
  setColorTheme: (theme: ColorTheme) => void;
  toggleMode: () => void;
}

// Create context with default values
const ThemeContext = createContext<ThemeContextType>({
  mode: 'system',
  colorTheme: 'default',
  setMode: () => {},
  setColorTheme: () => {},
  toggleMode: () => {},
});

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
  defaultMode?: ThemeMode;
  defaultColorTheme?: ColorTheme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultMode = 'system',
  defaultColorTheme = 'default',
}) => {
  // Initialize state from localStorage if available
  const [mode, setMode] = useState<ThemeMode>(() => {
    const savedMode = localStorage.getItem('theme-mode');
    return (savedMode as ThemeMode) || defaultMode;
  });

  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => {
    const savedColorTheme = localStorage.getItem('color-theme');
    return (savedColorTheme as ColorTheme) || defaultColorTheme;
  });

  // Toggle between light and dark modes
  const toggleMode = () => {
    setMode((prevMode) => {
      if (prevMode === 'light') return 'dark';
      if (prevMode === 'dark') return 'system';
      return 'light';
    });
  };

  // Update localStorage when mode changes
  useEffect(() => {
    localStorage.setItem('theme-mode', mode);
    
    // Apply the theme to the document
    const isDark = 
      mode === 'dark' || 
      (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [mode]);

  // Update localStorage when color theme changes
  useEffect(() => {
    localStorage.setItem('color-theme', colorTheme);
    
    // Remove all previous theme classes
    document.documentElement.classList.remove(
      'theme-default',
      'theme-tropical-jungle',
      'theme-ocean-sunset',
      'theme-desert-storm',
      'theme-berry-fields',
      'theme-arctic-moss'
    );
    
    // Add the current theme class
    document.documentElement.classList.add(`theme-${colorTheme}`);
  }, [colorTheme]);

  // Listen for system preference changes
  useEffect(() => {
    if (mode !== 'system') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (mediaQuery.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, colorTheme, setMode, setColorTheme, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
