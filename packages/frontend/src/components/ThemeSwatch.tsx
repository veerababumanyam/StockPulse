import React from 'react';
import { ThemeColor, themeConfig } from '@/lib/theme';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeSwatchProps {
  className?: string;
  color: ThemeColor;
  showLabel?: boolean;
  onClick?: () => void;
}

const ThemeSwatch: React.FC<ThemeSwatchProps> = ({ 
  className = '',
  color,
  showLabel = false,
  onClick
}) => {
  const { themeMode, setThemeColor } = useTheme();
  const themeColors = themeConfig[themeMode][color];
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setThemeColor(color);
    }
  };
  
  return (
    <div 
      className={`rounded-lg overflow-hidden border border-border cursor-pointer transition-all duration-200 hover:shadow-sm ${className}`}
      onClick={handleClick}
    >
      {showLabel && (
        <div className="px-3 py-2 bg-card text-card-foreground text-sm font-medium">
          {color.charAt(0).toUpperCase() + color.slice(1)} Theme
        </div>
      )}
      <div className="grid grid-cols-5 h-12">
        <div style={{ backgroundColor: themeColors.primary }} />
        <div style={{ backgroundColor: themeColors.secondary }} />
        <div style={{ backgroundColor: themeColors.background }} />
        <div style={{ backgroundColor: themeColors.card }} />
        <div style={{ backgroundColor: themeColors.muted }} />
      </div>
    </div>
  );
};

export default ThemeSwatch; 