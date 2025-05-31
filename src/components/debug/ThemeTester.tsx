/**
 * Theme Tester Component - Debug/Testing Tool
 * Temporary component for testing color theme switching functionality
 * Tests all available themes from colorPalettes.ts
 */

import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { ColorTheme } from '../../theme/colorPalettes';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../../utils/tailwind';
import { Palette, Sun, Moon, Monitor, Check } from 'lucide-react';

const availableColorThemes: { id: ColorTheme; name: string; description: string }[] = [
  { id: 'default', name: 'Electric Minimalist', description: 'Clean blue & pink theme' },
  { id: 'cyber-neon', name: 'Cyber Neon', description: 'Futuristic purple & cyan' },
  { id: 'sage-terracotta', name: 'Sage & Terracotta', description: 'Natural green & orange' },
  { id: 'midnight-aurora', name: 'Midnight Aurora', description: 'Deep blue & gold' },
  { id: 'tropical-jungle', name: 'Tropical Jungle', description: 'Lush green nature theme' },
  { id: 'ocean-sunset', name: 'Ocean Sunset', description: 'Blue ocean & coral sunset' },
  { id: 'desert-storm', name: 'Desert Storm', description: 'Warm sandy & terracotta' },
  { id: 'berry-fields', name: 'Berry Fields', description: 'Purple & pink berry theme' },
  { id: 'arctic-moss', name: 'Arctic Moss', description: 'Cool blue & mint theme' },
  { id: 'sunset-gradient', name: 'Sunset Gradient', description: 'Warm orange & red gradient' },
  { id: 'monochrome-pop', name: 'Monochrome Pop', description: 'Black, white & green accent' },
];

export const ThemeTester: React.FC = () => {
  const { theme, colorTheme, resolvedTheme, setTheme, setColorTheme } = useTheme();

  return (
    <div className="bg-elevated p-6 shadow-lg border border-surface rounded-lg space-y-6">
      <div className="text-center">
        <h2 className="text-foreground text-2xl font-bold mb-2">🎨 Theme Tester</h2>
        <p className="text-muted-foreground">Test color theme switching functionality</p>
      </div>

      {/* Current Theme Info */}
      <div className="bg-surface p-4 border border-surface rounded-lg space-y-3">
        <h3 className="text-foreground text-lg font-semibold">Current Theme</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span className="text-muted-foreground text-sm">Mode:</span>
            <Badge className="ml-2">
              {theme === 'system' && <Monitor className="w-3 h-3 mr-1" />}
              {theme === 'light' && <Sun className="w-3 h-3 mr-1" />}
              {theme === 'dark' && <Moon className="w-3 h-3 mr-1" />}
              {theme} ({resolvedTheme})
            </Badge>
          </div>
          <div>
            <span className="text-muted-foreground text-sm">Color Theme:</span>
            <Badge className="ml-2 bg-primary/10 text-primary">
              <Palette className="w-3 h-3 mr-1" />
              {colorTheme}
            </Badge>
          </div>
        </div>
      </div>

      {/* Theme Mode Selector */}
      <div className="bg-surface p-4 border border-surface rounded-lg space-y-3">
        <h3 className="text-foreground text-lg font-semibold">Theme Mode</h3>
        <div className="flex gap-2">
          {(['light', 'dark', 'system'] as const).map((mode) => (
            <Button
              key={mode}
              variant={theme === mode ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme(mode)}
              className={cn(
                "flex items-center gap-2",
                theme === mode && "bg-primary text-white"
              )}
            >
              {mode === 'system' && <Monitor className="w-4 h-4" />}
              {mode === 'light' && <Sun className="w-4 h-4" />}
              {mode === 'dark' && <Moon className="w-4 h-4" />}
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
              {theme === mode && <Check className="w-3 h-3" />}
            </Button>
          ))}
        </div>
      </div>

      {/* Color Theme Selector */}
      <div className="bg-surface p-4 border border-surface rounded-lg space-y-4">
        <h3 className="text-foreground text-lg font-semibold">Color Themes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {availableColorThemes.map((themeOption) => (
            <button
              key={themeOption.id}
              onClick={() => setColorTheme(themeOption.id)}
              className={cn(
                "p-3 rounded-lg border-2 text-left transition-all hover:shadow-md",
                colorTheme === themeOption.id
                  ? "border-primary bg-primary/10"
                  : "border-surface hover:border-primary/50"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-foreground font-medium text-sm">
                  {themeOption.name}
                </span>
                {colorTheme === themeOption.id && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </div>
              <span className="text-muted-foreground text-xs">
                {themeOption.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Color Sample Display */}
      <div className="bg-surface p-4 border border-surface rounded-lg space-y-4">
        <h3 className="text-foreground text-lg font-semibold">Color Samples</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-3 rounded-lg bg-surface border">
            <div className="w-8 h-8 rounded-full bg-primary mx-auto mb-2"></div>
            <span className="text-xs text-muted-foreground">Primary</span>
          </div>
          <div className="text-center p-3 rounded-lg bg-surface border">
            <div className="w-8 h-8 rounded-full bg-success mx-auto mb-2"></div>
            <span className="text-xs text-muted-foreground">Success</span>
          </div>
          <div className="text-center p-3 rounded-lg bg-surface border">
            <div className="w-8 h-8 rounded-full bg-warning mx-auto mb-2"></div>
            <span className="text-xs text-muted-foreground">Warning</span>
          </div>
          <div className="text-center p-3 rounded-lg bg-surface border">
            <div className="w-8 h-8 rounded-full bg-danger mx-auto mb-2"></div>
            <span className="text-xs text-muted-foreground">Danger</span>
          </div>
        </div>
      </div>

      {/* Text Sample Display */}
      <div className="bg-surface p-4 border border-surface rounded-lg space-y-3">
        <h3 className="text-foreground text-lg font-semibold">Text Samples</h3>
        <div className="space-y-2">
          <p className="text-foreground">Primary text (foreground)</p>
          <p className="text-muted-foreground">Secondary text (muted-foreground)</p>
          <p className="text-success">Success text</p>
          <p className="text-warning">Warning text</p>
          <p className="text-danger">Danger text</p>
          <p className="text-info">Info text</p>
        </div>
      </div>
    </div>
  );
}; 