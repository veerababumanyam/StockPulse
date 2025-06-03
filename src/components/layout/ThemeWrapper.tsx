/**
 * ThemeWrapper - Global Theme Application for StockPulse
 * Applies color themes globally to all application pages while excluding public pages
 * User-specific and persistent theme management
 */

import React, { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";

interface ThemeWrapperProps {
  children: ReactNode;
}

// Define PUBLIC routes that should NOT have color theme application (only default styling)
const PUBLIC_ROUTES = [
  "/",
  "/landing",
  "/auth/login",
  "/auth/register",
  "/auth/signup",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/pricing",
  "/contact",
  "/about",
  "/privacy",
  "/terms",
  "/help",
  "/docs",
  "/features",
  "/security",
  "/support",
];

// Define APPLICATION routes that should have FULL color theme application
const APPLICATION_ROUTES = [
  "/dashboard",
  "/portfolio",
  "/trading",
  "/analysis",
  "/agents",
  "/settings",
  "/profile",
  "/admin",
  "/screener",
  "/research",
  "/reports",
  "/workspace",
  "/automation",
  "/mcp",
  "/ai-agents",
];

const ThemeWrapper: React.FC<ThemeWrapperProps> = ({ children }) => {
  const location = useLocation();
  const { colorTheme, isDark } = useTheme();

  // Determine if current route should have color theme application
  const shouldApplyColorTheme = () => {
    const currentPath = location.pathname;

    // Check if it's explicitly a public route (no color themes)
    if (
      PUBLIC_ROUTES.some(
        (route) => currentPath === route || currentPath.startsWith(route + "/"),
      )
    ) {
      return false;
    }

    // Check if it's explicitly an application route (full color themes)
    if (APPLICATION_ROUTES.some((route) => currentPath.startsWith(route))) {
      return true;
    }

    // Default: if user is on any authenticated route, apply themes
    // This catches any new routes automatically
    const isAuthenticated = !PUBLIC_ROUTES.some(
      (route) => currentPath === route || currentPath.startsWith(route + "/"),
    );
    return isAuthenticated;
  };

  const applyColorTheme = shouldApplyColorTheme();

  // Apply comprehensive theme classes and data attributes
  React.useEffect(() => {
    const root = document.documentElement;

    // ALWAYS apply global theme classes for navbar, sidebar, footer (UI chrome)
    root.classList.add("global-chrome-themed");

    if (applyColorTheme) {
      // FULL color theme application for application pages
      root.classList.add("app-themed");
      root.classList.remove("public-themed");

      // Add comprehensive theme data attributes
      root.setAttribute("data-app-themed", "true");
      root.setAttribute("data-theme-scope", "application");

      console.log(
        `🎨 Applied full color theme "${colorTheme}" to application page: ${location.pathname}`,
      );
    } else {
      // LIMITED theme for public pages (only basic styling)
      root.classList.add("public-themed");
      root.classList.remove("app-themed");

      // Add public page data attributes
      root.setAttribute("data-app-themed", "false");
      root.setAttribute("data-theme-scope", "public");

      console.log(
        `🌐 Applied neutral styling to public page: ${location.pathname}`,
      );
    }

    // Universal data attributes for styling
    root.setAttribute("data-theme", colorTheme);
    root.setAttribute("data-mode", isDark ? "dark" : "light");
    root.setAttribute("data-chrome-themed", "true"); // UI chrome always themed
    root.setAttribute(
      "data-route-type",
      applyColorTheme ? "application" : "public",
    );

    // Add page-specific classes for additional targeting
    const pageClass = `page-${location.pathname.split("/")[1] || "home"}`;
    root.classList.add(pageClass);

    // Cleanup function to remove page-specific class
    return () => {
      root.classList.remove(pageClass);
    };
  }, [colorTheme, isDark, applyColorTheme, location.pathname]);

  return (
    <div
      className={`theme-wrapper ${applyColorTheme ? "app-themed" : "public-themed"}`}
      data-theme={colorTheme}
      data-mode={isDark ? "dark" : "light"}
      data-app-themed={applyColorTheme}
      data-route-type={applyColorTheme ? "application" : "public"}
    >
      {children}
    </div>
  );
};

export default ThemeWrapper;
