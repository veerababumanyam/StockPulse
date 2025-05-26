import React from 'react';
import { useMediaQuery } from '@hooks/useMediaQuery';

// Responsive component wrapper that renders different content based on screen size
interface ResponsiveProps {
  desktop: React.ReactNode;
  mobile: React.ReactNode;
  tabletFallback?: 'desktop' | 'mobile';
}

export const Responsive: React.FC<ResponsiveProps> = ({ 
  desktop, 
  mobile, 
  tabletFallback = 'desktop' 
}) => {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const isMobile = useMediaQuery('(max-width: 767px)');

  if (isDesktop) {
    return <>{desktop}</>;
  } else if (isTablet) {
    return <>{tabletFallback === 'desktop' ? desktop : mobile}</>;
  } else {
    return <>{mobile}</>;
  }
};

// Lazy loading wrapper with suspense
interface LazyLoadProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const LazyLoad: React.FC<LazyLoadProps> = ({ 
  children, 
  fallback = <div className="w-full h-full flex items-center justify-center">Loading...</div> 
}) => {
  return (
    <React.Suspense fallback={fallback}>
      {children}
    </React.Suspense>
  );
};

// Performance optimized list rendering
interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  windowHeight: number;
  overscan?: number;
}

export function VirtualizedList<T>({ 
  items, 
  renderItem, 
  itemHeight, 
  windowHeight, 
  overscan = 3 
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = React.useState(0);
  
  const totalHeight = items.length * itemHeight;
  const visibleItemCount = Math.ceil(windowHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + windowHeight) / itemHeight) + overscan
  );

  const visibleItems = React.useMemo(() => {
    return items.slice(startIndex, endIndex + 1).map((item, index) => {
      const actualIndex = startIndex + index;
      return renderItem(item, actualIndex);
    });
  }, [items, startIndex, endIndex, renderItem]);

  const handleScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div
      className="overflow-auto"
      style={{ height: windowHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: startIndex * itemHeight,
            width: '100%',
          }}
        >
          {visibleItems}
        </div>
      </div>
    </div>
  );
}

// Image optimization wrapper
interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  loading = 'lazy',
}) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);

  return (
    <div className={`relative ${className}`}>
      {!isLoaded && !error && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      {error && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500">Failed to load image</span>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  );
};
