import React from 'react';

export type LogoSize = 'small' | 'medium' | 'large' | 'custom';
export type LogoVariant = 'square' | 'horizontal';

interface LogoProps {
  size?: LogoSize;
  variant?: LogoVariant;
  className?: string;
  width?: number;
  height?: number;
}

/**
 * Logo component for StockPulse branding
 */
export const Logo: React.FC<LogoProps> = ({
  size = 'medium',
  variant = 'square',
  className = '',
  width,
  height,
}) => {
  // Define dimensions based on size
  const getDimensions = () => {
    if (width && height) {
      return { width, height };
    }

    if (variant === 'square') {
      switch (size) {
        case 'small':
          return { width: 32, height: 32 };
        case 'medium':
          return { width: 48, height: 48 };
        case 'large':
          return { width: 64, height: 64 };
        default:
          return { width: 48, height: 48 };
      }
    } else {
      // Horizontal variant
      switch (size) {
        case 'small':
          return { width: 100, height: 25 };
        case 'medium':
          return { width: 140, height: 35 };
        case 'large':
          return { width: 200, height: 50 };
        default:
          return { width: 140, height: 35 };
      }
    }
  };

  const { width: finalWidth, height: finalHeight } = getDimensions();

  // Use @2x for retina displays
  const isRetina = window.devicePixelRatio > 1;
  const retinaPostfix = isRetina ? '@2x' : '';

  // Determine image source based on variant and retina support
  const imageSrc = `/assets/logo/logo-${variant}${retinaPostfix}.png`;
  const fallbackSrc = `/assets/logo/logo-${variant}.png`;

  return (
    <img
      src={imageSrc}
      onError={(e) => {
        // Fallback to non-retina if retina image fails to load
        if (isRetina) {
          (e.target as HTMLImageElement).src = fallbackSrc;
        }
      }}
      alt="StockPulse AI"
      width={finalWidth}
      height={finalHeight}
      className={className}
    />
  );
};

export default Logo; 