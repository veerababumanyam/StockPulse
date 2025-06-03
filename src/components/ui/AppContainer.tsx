import React from "react";
import { cn } from "../../utils/cn";

/**
 * AppContainer is a reusable, theme-driven container for all major layouts, cards, and modals.
 * It enforces background, border, shadow, and padding using theme tokens and semantic classes.
 *
 * @param {React.ReactNode} children - Content to render inside the container.
 * @param {'surface' | 'elevated' | 'muted'} [variant='surface'] - Visual variant for background.
 * @param {'none' | 'sm' | 'md' | 'lg'} [padding='md'] - Padding size.
 * @param {'none' | 'md' | 'lg'} [shadow='md'] - Shadow depth.
 * @param {boolean} [border=false] - Whether to show a border.
 * @param {string} [className] - Additional class names.
 */
export interface AppContainerProps {
  children: React.ReactNode;
  variant?: "surface" | "elevated" | "muted";
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  shadow?: "none" | "md" | "lg";
  border?: boolean;
}

export const AppContainer: React.FC<AppContainerProps> = ({
  children,
  variant = "surface",
  className,
  padding = "md",
  shadow = "md",
  border = false,
}) => (
  <div
    className={cn(
      "app-container",
      `bg-${variant}`,
      padding !== "none" && `p-${padding}`,
      shadow !== "none" && `shadow-${shadow}`,
      border && "border border-surface",
      className,
    )}
    data-variant={variant}
  >
    {children}
  </div>
);

export default AppContainer;
