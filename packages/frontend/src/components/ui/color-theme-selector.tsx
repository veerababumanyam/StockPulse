import React from 'react';
import { ThemeColor, themeNames, themeConfig } from '@/lib/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { Check } from 'lucide-react';

interface ColorThemeSelectorProps {
  className?: string;
}

const ColorThemeSelector: React.FC<ColorThemeSelectorProps> = ({ 
  className = '' 
}) => {
  const { themeColor, themeMode, setThemeColor } = useTheme();
  
  // Available theme colors
  const colorOptions: ThemeColor[] = ['magenta', 'teal', 'indigo', 'amber', 'emerald', 'rose'];
  
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {colorOptions.map((color) => {
        const isActive = themeColor === color;
        const themeColors = themeConfig[themeMode][color];
        
        return (
          <button
            key={color}
            onClick={() => setThemeColor(color)}
            className={`
              relative flex items-center justify-center
              h-10 w-10 rounded-full
              border-2 transition-all duration-200
              ${isActive 
                ? 'border-foreground shadow-lg scale-110' 
                : 'border-transparent hover:scale-105 hover:border-border'
              }
            `}
            style={{ backgroundColor: themeColors.primary }}
            aria-label={`Select ${themeNames[color]} theme`}
            title={themeNames[color]}
          >
            {isActive && (
              <div className="absolute inset-0 flex items-center justify-center text-primary-foreground">
                <Check size={16} strokeWidth={3} />
              </div>
            )}
            <span className="sr-only">{themeNames[color]}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ColorThemeSelector; 