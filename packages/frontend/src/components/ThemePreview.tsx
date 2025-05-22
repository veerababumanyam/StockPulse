import React from 'react';
import { ThemeColor, themeConfig, themeNames } from '@/lib/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Check, X } from 'lucide-react';

interface ThemePreviewProps {
  color: ThemeColor;
  className?: string;
}

const ThemePreview: React.FC<ThemePreviewProps> = ({ color, className = '' }) => {
  const { themeMode, themeColor, setThemeColor } = useTheme();
  const isActive = themeColor === color;
  
  return (
    <div className={`p-4 rounded-xl bg-background shadow-sm border border-border relative transition-all duration-200 
      ${isActive ? 'dark:border-primary/30 ring-1 ring-primary/20' : ''}
      ${className}`}
    >
      {isActive && (
        <div className="absolute -right-2 -top-2 z-10">
          <Badge className="bg-primary text-primary-foreground shadow-sm">
            <Check className="mr-1 h-3 w-3" /> Active
          </Badge>
        </div>
      )}
      
      <div className="mb-3 flex justify-between items-center">
        <h3 className="font-medium text-foreground">{themeNames[color]}</h3>
        <div className="flex gap-1.5">
          {Object.values(themeConfig[themeMode][color]).slice(0, 5).map((colorHex, index) => (
            <div 
              key={index} 
              className="h-4 w-4 rounded-full border border-border" 
              style={{ backgroundColor: colorHex }}
            />
          ))}
        </div>
      </div>
      
      <Card className="mb-3 text-sm border dark:border-border/80">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-sm">Sample Card</CardTitle>
        </CardHeader>
        <CardContent className="py-2 px-3">
          <p className="text-card-foreground text-xs">Card content goes here</p>
        </CardContent>
        <CardFooter className="py-2 px-3 flex justify-between">
          <Button variant="outline" size="sm" className="h-7 text-xs">Cancel</Button>
          <Button size="sm" className="h-7 text-xs">Submit</Button>
        </CardFooter>
      </Card>
      
      <div className="flex gap-2 justify-center">
        <Button 
          variant="outline" 
          size="sm" 
          className={`w-full ${isActive ? 'dark:border-primary/30' : ''}`}
          onClick={() => setThemeColor(color)}
        >
          {isActive ? 'Current Theme' : 'Apply Theme'}
        </Button>
      </div>
    </div>
  );
};

export default ThemePreview; 