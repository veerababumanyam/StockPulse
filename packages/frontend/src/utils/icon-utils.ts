import { SVGProps } from 'react';

// Define a type for our icon components
export type IconComponent = (props: SVGProps<SVGSVGElement>) => JSX.Element;

// Create a map of icon names to their SVG content
const iconMap: Record<string, string> = {
  // This will be populated with SVG content
};

/**
 * Local icon component that renders SVGs directly instead of using lucide-react
 */
export const Icon = ({ 
  name, 
  size = 24, 
  color = 'currentColor',
  strokeWidth = 2,
  ...props 
}: { 
  name: string; 
  size?: number | string; 
  color?: string;
  strokeWidth?: number;
} & SVGProps<SVGSVGElement>) => {
  const svgContent = iconMap[name];
  
  if (!svgContent) {
    console.warn(`Icon "${name}" not found in local icon set`);
    return null;
  }
  
  // Use dangerouslySetInnerHTML to render the SVG content
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth={strokeWidth} 
      strokeLinecap="round" 
      strokeLinejoin="round"
      {...props}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
};

/**
 * Create icon components for each icon in our map
 */
export const createIconComponents = () => {
  const icons: Record<string, IconComponent> = {};
  
  Object.keys(iconMap).forEach(name => {
    icons[name] = (props) => <Icon name={name} {...props} />;
  });
  
  return icons;
};

export const Icons = createIconComponents(); 