import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { MoonIcon, SunIcon } from '@/assets/icons';

interface ThemeToggleProps {
  className?: string;
  id?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', id }) => {
  const { themeMode, toggleTheme } = useTheme();
  const isDark = themeMode === 'dark';

  return (
    <button
      id={id}
      onClick={toggleTheme}
      className={`theme-switch ${className}`}
      role="switch"
      aria-checked={isDark}
      data-state={isDark ? "checked" : "unchecked"}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      <span className="sr-only">{isDark ? "Switch to light theme" : "Switch to dark theme"}</span>
      <span className="theme-switch-thumb flex items-center justify-center">
        {isDark ? <MoonIcon size={12} /> : <SunIcon size={12} />}
      </span>
    </button>
  );
};

export default ThemeToggle; 