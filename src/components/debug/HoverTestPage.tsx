/**
 * Hover Test Page - Demonstrates Container Hover Effects
 * Simple page to show how containers highlight with border colors on hover
 */

import React from 'react';
import { useTheme } from '../../hooks/useTheme';

export const HoverTestPage: React.FC = () => {
  const { theme, colorTheme, setColorTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background-primary p-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-foreground text-3xl font-bold mb-4">
          🎯 Container Hover Effects Test
        </h1>
        <p className="text-muted-foreground">
          Hover over containers to see border highlight effects
        </p>
      </div>

      {/* Theme Switcher */}
      <div className="bg-elevated p-6 border border-surface rounded-lg space-y-4">
        <h2 className="text-foreground text-xl font-semibold">
          Quick Theme Switch
        </h2>
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={() => setColorTheme('default')}
            className="px-4 py-2 border border-surface rounded-lg hover:border-primary"
          >
            Default
          </button>
          <button
            onClick={() => setColorTheme('cyber-neon')}
            className="px-4 py-2 border border-surface rounded-lg hover:border-primary"
          >
            Cyber Neon
          </button>
          <button
            onClick={() => setColorTheme('tropical-jungle')}
            className="px-4 py-2 border border-surface rounded-lg hover:border-primary"
          >
            Tropical Jungle
          </button>
        </div>
      </div>

      {/* Grid of Test Containers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Surface Container */}
        <div className="bg-surface p-6 border border-surface rounded-lg shadow-md">
          <h3 className="text-foreground text-lg font-semibold mb-3">
            Surface Container
          </h3>
          <p className="text-muted-foreground text-sm">
            This container uses bg-surface and should highlight with primary
            border on hover.
          </p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-success text-sm">✓ Hover Effect Active</span>
            <div className="w-4 h-4 bg-primary rounded-full"></div>
          </div>
        </div>

        {/* Elevated Container */}
        <div className="bg-elevated p-6 border border-surface rounded-lg shadow-lg">
          <h3 className="text-foreground text-lg font-semibold mb-3">
            Elevated Container
          </h3>
          <p className="text-muted-foreground text-sm">
            This container uses bg-elevated and should lift slightly on hover.
          </p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-warning text-sm">⚡ Transform Effect</span>
            <div className="w-4 h-4 bg-secondary rounded-full"></div>
          </div>
        </div>

        {/* Muted Container */}
        <div className="bg-muted p-6 border border-surface rounded-lg shadow-md">
          <h3 className="text-foreground text-lg font-semibold mb-3">
            Muted Container
          </h3>
          <p className="text-muted-foreground text-sm">
            This container uses bg-muted with enhanced shadow on hover.
          </p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-info text-sm">🎨 Shadow Enhancement</span>
            <div className="w-4 h-4 bg-accent rounded-full"></div>
          </div>
        </div>

        {/* Card-like Container */}
        <div className="bg-surface p-6 border rounded-lg shadow-md">
          <h3 className="text-foreground text-lg font-semibold mb-3">
            Card Container
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Value:</span>
              <span className="text-success font-medium">$12,345</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Change:</span>
              <span className="text-success">+5.2%</span>
            </div>
          </div>
        </div>

        {/* Interactive Container */}
        <div className="bg-elevated p-6 border border-surface rounded-lg shadow-md cursor-pointer">
          <h3 className="text-foreground text-lg font-semibold mb-3">
            Interactive Container
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            This container is clickable and should show enhanced hover effects.
          </p>
          <button className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary/90">
            Click Me
          </button>
        </div>

        {/* Status Container */}
        <div className="bg-surface p-6 border border-success/20 rounded-lg shadow-md">
          <h3 className="text-foreground text-lg font-semibold mb-3">
            Status Container
          </h3>
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-3 h-3 bg-success rounded-full"></div>
            <span className="text-success text-sm font-medium">Active</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Container with colored border that changes on hover.
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-elevated p-6 border border-surface rounded-lg">
        <h3 className="text-foreground text-lg font-semibold mb-3">
          Hover Effects Guide
        </h3>
        <ul className="text-muted-foreground text-sm space-y-2">
          <li>
            • <strong>Border Highlight:</strong> Containers should show primary
            color border on hover
          </li>
          <li>
            • <strong>Shadow Enhancement:</strong> Box shadow should become more
            prominent
          </li>
          <li>
            • <strong>Subtle Transform:</strong> Some containers lift slightly
            (translateY(-1px))
          </li>
          <li>
            • <strong>Smooth Transitions:</strong> All effects should animate
            smoothly (200ms)
          </li>
          <li>
            • <strong>Theme Responsive:</strong> Border colors should match
            current color theme
          </li>
        </ul>
      </div>

      {/* Current Theme Info */}
      <div className="bg-surface p-4 border border-surface rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">Current Theme:</span>
          <span className="text-primary font-medium">{colorTheme}</span>
        </div>
      </div>
    </div>
  );
};
