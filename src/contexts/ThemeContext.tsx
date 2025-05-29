import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { colorPalettes } from "../theme/colorPalettes";

// Define theme types
export type ThemeMode = "light" | "dark" | "system";
export type ColorTheme = keyof typeof colorPalettes;

interface ThemeContextType {
  mode: ThemeMode;
  colorTheme: ColorTheme;
  setMode: (mode: ThemeMode) => void;
  setColorTheme: (theme: ColorTheme) => void;
  toggleMode: () => void;
}

// Create context with default values
const ThemeContext = createContext<ThemeContextType>({
  mode: "system",
  colorTheme: "default" as ColorTheme,
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
  defaultMode = "system",
  defaultColorTheme = "default",
}) => {
  // Initialize state from localStorage if available
  const [mode, setMode] = useState<ThemeMode>(() => {
    const savedMode = localStorage.getItem("theme-mode");
    return (savedMode as ThemeMode) || defaultMode;
  });

  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => {
    const savedColorTheme = localStorage.getItem("color-theme");
    // Ensure saved is one of the keys
    return (savedColorTheme as ColorTheme) in colorPalettes
      ? (savedColorTheme as ColorTheme)
      : defaultColorTheme;
  });

  // Toggle between light and dark modes
  const toggleMode = () => {
    setMode((prevMode) => {
      if (prevMode === "light") return "dark";
      if (prevMode === "dark") return "system";
      return "light";
    });
  };

  // Apply mode and color theme together
  useEffect(() => {
    // Persist selections
    localStorage.setItem("theme-mode", mode);
    localStorage.setItem("color-theme", colorTheme);

    // Determine dark or light context
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const isDark = mode === "dark" || (mode === "system" && prefersDark);

    // Toggle dark class
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Remove previously applied color theme classes
    const allThemeNames = Object.keys(colorPalettes) as Array<
      keyof typeof colorPalettes
    >;
    allThemeNames.forEach((themeName) => {
      document.documentElement.classList.remove(`theme-${themeName}`);
    });

    // Apply the current colorTheme class
    // Ensure colorTheme is a valid key before applying
    if (colorTheme && colorPalettes.hasOwnProperty(colorTheme)) {
      document.documentElement.classList.add(`theme-${colorTheme}`);
    }
  }, [mode, colorTheme]);

  return (
    <ThemeContext.Provider
      value={{ mode, colorTheme, setMode, setColorTheme, toggleMode }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
