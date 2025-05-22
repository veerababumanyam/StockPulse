import { MoonIcon, SunIcon } from '@/assets/icons';
import { useTheme } from '@/contexts/ThemeContext';
import { themeClasses } from '@/lib/theme-constants';

interface ThemeToggleProps {
  className?: string;
  showIcon?: boolean;
}

export function ThemeToggle({ className = '', showIcon = true }: ThemeToggleProps) {
  const { themeMode, toggleTheme } = useTheme();
  const isDark = themeMode === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`${themeClasses.interactive.focus} inline-flex items-center justify-center rounded-md p-2.5 transition-colors hover:bg-accent ${className}`}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      {showIcon && (
        isDark ? (
          <SunIcon className="h-5 w-5 text-foreground transition-all" />
        ) : (
          <MoonIcon className="h-5 w-5 text-foreground transition-all" />
        )
      )}
    </button>
  );
}
