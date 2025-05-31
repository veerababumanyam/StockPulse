import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  ChevronDown,
  Menu,
  Home,
  ChevronRight,
  Palette,
  Monitor,
  Sun,
  Moon,
  Check,
} from "lucide-react";
import ThemeSelector from "../ui/ThemeSelector";
import { useTheme } from "../../contexts/ThemeContext";
import { THEME_METADATA } from "../../types/theme";
import type { ColorTheme } from "../../types/theme";
import { cn } from "../../utils/cn";
import Logo from "../ui/Logo";

interface NavbarProps {
  onToggleSidebar?: () => void;
  transparent?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  transparent = false,
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isColorPaletteMenuOpen, setIsColorPaletteMenuOpen] = useState(false);
  const { mode, setMode, colorTheme, setColorTheme, getThemeMetadata } = useTheme();

  const navClassName = cn(
    transparent
      ? "bg-transparent border-none text-white backdrop-blur-sm"
      : "bg-background/80 backdrop-blur-xl border-b border-border/50",
    "px-4 lg:px-6 py-3 sticky top-0 z-50 transition-all duration-300",
  );

  const linkClassName = transparent
    ? "hover:text-white/80 transition-all duration-200"
    : "text-text/70 hover:text-text transition-all duration-200";

  const buttonClassName = transparent
    ? "px-6 py-2.5 border border-white/30 hover:bg-white/10 text-white font-medium rounded-xl transition-all duration-200 hover:border-white/50"
    : "px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl";

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    if (location.pathname === "/dashboard") {
      return [{ label: "Dashboard", path: "/dashboard" }];
    }
    const breadcrumbs = [{ label: "Home", path: "/dashboard" }];
    let currentPath = "";
    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`;
      const label =
        segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
      breadcrumbs.push({ label, path: currentPath });
    });
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  const getUserInitials = () => {
    const name = user?.name || user?.email || "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get all available themes from metadata
  const allThemes = Object.values(THEME_METADATA);

  // Get current theme metadata
  const currentThemeMetadata = getThemeMetadata(colorTheme);

  return (
    <nav className={navClassName}>
      <div className="flex items-center justify-between w-full max-w-none">
        {/* Left Side - Logo or Mobile Menu + Breadcrumbs */}
        <div className="flex items-center space-x-4 min-w-0 flex-1">
          {transparent ? (
            <Link to="/" className="group">
              <Logo className="h-8 w-8 text-white group-hover:scale-110 transition-transform duration-200" />
            </Link>
          ) : (
            <>
              {onToggleSidebar && (
                <button
                  onClick={onToggleSidebar}
                  className="lg:hidden p-2.5 rounded-xl hover:bg-surface transition-all duration-200 hover:scale-105"
                  title="Toggle sidebar"
                >
                  <Menu className="w-5 h-5 text-text/60" />
                </button>
              )}
              <nav className="hidden md:flex items-center space-x-1 text-sm min-w-0">
                {breadcrumbs.map((crumb, index) => (
                  <div
                    key={`${crumb.path}-${index}`}
                    className="flex items-center whitespace-nowrap"
                  >
                    {index > 0 && (
                      <ChevronRight className="w-3.5 h-3.5 mx-2 text-text/40 flex-shrink-0" />
                    )}
                    {index === 0 && breadcrumbs.length > 1 && (
                      <Home className="w-3.5 h-3.5 mr-2 text-text/40 flex-shrink-0" />
                    )}
                    <Link
                      to={crumb.path}
                      className={cn(
                        index === breadcrumbs.length - 1
                          ? transparent
                            ? "text-white font-semibold bg-white/10 px-3 py-1.5 rounded-lg"
                            : "text-text font-semibold bg-surface px-3 py-1.5 rounded-lg"
                          : `${linkClassName} hover:bg-surface/50 px-2 py-1 rounded-lg`,
                        "truncate transition-all duration-200",
                      )}
                    >
                      {crumb.label}
                    </Link>
                  </div>
                ))}
              </nav>
            </>
          )}
        </div>

        {/* Right Side - Conditional rendering based on 'transparent' prop */}
        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          {transparent ? (
            <>
              <Link
                to="/auth/login"
                className={`${linkClassName} px-4 py-2 rounded-lg font-medium`}
              >
                Sign In
              </Link>
              <Link to="/auth/register" className={buttonClassName}>
                Sign Up
              </Link>
            </>
          ) : (
            <>
              {/* Search */}
              <div className="hidden md:flex relative flex-grow max-w-md">
                <input
                  type="text"
                  placeholder="Search stocks, agents..."
                  className="w-full pl-11 pr-4 py-2.5 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-text placeholder-text/40 transition-all duration-200 text-sm"
                />
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text/40" />
              </div>
              <button className="md:hidden p-2.5 rounded-xl hover:bg-surface transition-all duration-200 hover:scale-105">
                <Search className="w-5 h-5 text-text/60" />
              </button>

              {/* Appearance (Mode) Selector - Triggered by Monitor Icon */}
              <div className="relative">
                <button
                  onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                  className="p-2.5 rounded-xl hover:bg-surface transition-all duration-200 hover:scale-105 group"
                  title="Appearance settings"
                >
                  <Monitor className="w-5 h-5 text-text/60 group-hover:text-primary transition-colors duration-200" />
                </button>
                {isThemeMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsThemeMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-background rounded-2xl shadow-xl border border-border z-40 overflow-hidden backdrop-blur-xl">
                      <div className="p-2 space-y-1">
                        <p className="px-3 py-2 text-xs font-semibold text-text/60">
                          Appearance
                        </p>
                        <button
                          onClick={() => {
                            setMode("light");
                            setIsThemeMenuOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2.5 text-sm text-text hover:bg-surface rounded-xl transition-all duration-200 group",
                            mode === "light" && "bg-surface",
                          )}
                        >
                          <div className="flex items-center">
                            <Sun className="w-4 h-4 mr-3 group-hover:text-yellow-500 transition-colors duration-200" />
                            Light Mode
                          </div>
                          {mode === "light" && <Check className="w-4 h-4 text-primary" />}
                        </button>
                        <button
                          onClick={() => {
                            setMode("dark");
                            setIsThemeMenuOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2.5 text-sm text-text hover:bg-surface rounded-xl transition-all duration-200 group",
                            mode === "dark" && "bg-surface",
                          )}
                        >
                          <div className="flex items-center">
                            <Moon className="w-4 h-4 mr-3 group-hover:text-blue-500 transition-colors duration-200" />
                            Dark Mode
                          </div>
                          {mode === "dark" && <Check className="w-4 h-4 text-primary" />}
                        </button>
                        <button
                          onClick={() => {
                            setMode("system");
                            setIsThemeMenuOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2.5 text-sm text-text hover:bg-surface rounded-xl transition-all duration-200 group",
                            mode === "system" && "bg-surface",
                          )}
                        >
                          <div className="flex items-center">
                            <Monitor className="w-4 h-4 mr-3 group-hover:text-purple-500 transition-colors duration-200" />
                            System
                          </div>
                          {mode === "system" && <Check className="w-4 h-4 text-primary" />}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Enhanced Color Palette Selector - Triggered by Palette Icon */}
              <div className="relative">
                <button
                  onClick={() =>
                    setIsColorPaletteMenuOpen(!isColorPaletteMenuOpen)
                  }
                  className="p-2.5 rounded-xl hover:bg-surface transition-all duration-200 hover:scale-105 group"
                  title={`Current theme: ${currentThemeMetadata.emoji} ${currentThemeMetadata.name}`}
                >
                  <Palette className="w-5 h-5 text-text/60 group-hover:text-primary transition-colors duration-200" />
                </button>
                {isColorPaletteMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsColorPaletteMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-80 bg-background rounded-2xl shadow-xl border border-border z-40 overflow-hidden backdrop-blur-xl">
                      <div className="p-3 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-semibold text-text">Color Themes</h3>
                            <p className="text-xs text-text/60">
                              Current: {currentThemeMetadata.emoji} {currentThemeMetadata.name}
                            </p>
                          </div>
                          <div className="flex space-x-1">
                            {currentThemeMetadata.primaryColors.map((color, index) => (
                              <div 
                                key={index}
                                className="w-4 h-4 rounded-full border border-border/20" 
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="p-2 space-y-1">
                        <div className="max-h-80 overflow-y-auto scrollbar-thin pr-1">
                          {allThemes.map((theme) => (
                            <button
                              key={theme.key}
                              onClick={() => {
                                setColorTheme(theme.key);
                                setIsColorPaletteMenuOpen(false);
                              }}
                              className={cn(
                                "w-full flex items-center justify-between px-3 py-3 text-sm text-text hover:bg-surface rounded-xl transition-all duration-200 group border-b border-border/30 last:border-b-0",
                                colorTheme === theme.key && "bg-surface ring-2 ring-primary/20",
                              )}
                            >
                              <div className="flex items-center">
                                <div className="flex space-x-1 mr-3">
                                  {theme.primaryColors.map((color, index) => (
                                    <div 
                                      key={index}
                                      className="w-3 h-3 rounded-full border border-border/20" 
                                      style={{ backgroundColor: color }}
                                    />
                                  ))}
                                </div>
                                <div className="text-left">
                                  <div className="font-medium">
                                    {theme.emoji} {theme.name}
                                  </div>
                                  <div className="text-xs text-text/60">
                                    {theme.description}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs px-2 py-1 bg-surface-secondary rounded-full text-text/60">
                                  {theme.category}
                                </span>
                                {colorTheme === theme.key && (
                                  <Check className="w-4 h-4 text-primary" />
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="p-2.5 rounded-xl hover:bg-surface transition-all duration-200 relative hover:scale-105 group"
                >
                  <Bell className="w-5 h-5 text-text/60 group-hover:text-primary transition-colors duration-200" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse"></span>
                </button>
                {isNotificationOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsNotificationOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-80 bg-background rounded-2xl shadow-xl border border-border z-40 overflow-hidden backdrop-blur-xl">
                      <div className="p-4 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10">
                        <h3 className="text-lg font-semibold text-text">
                          Notifications
                        </h3>
                        <p className="text-sm text-text/60">3 new updates</p>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        <div className="p-4 hover:bg-surface/50 border-b border-border/50 transition-all duration-200 group">
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mt-2 flex-shrink-0 group-hover:scale-125 transition-transform duration-200"></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-text">
                                New MCP server connected
                              </p>
                              <p className="text-xs text-text/60">
                                5 minutes ago
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 hover:bg-surface/50 border-b border-border/50 transition-all duration-200 group">
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mt-2 flex-shrink-0 group-hover:scale-125 transition-transform duration-200"></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-text">
                                Portfolio performance update
                              </p>
                              <p className="text-xs text-text/60">1 hour ago</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 hover:bg-surface/50 transition-all duration-200 group">
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mt-2 flex-shrink-0 group-hover:scale-125 transition-transform duration-200"></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-text">
                                Risk threshold exceeded
                              </p>
                              <p className="text-xs text-text/60">
                                3 hours ago
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 border-t border-border bg-surface/50">
                        <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors duration-200 hover:underline">
                          View all notifications
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* User Profile - Avatar Only, No Text */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center p-1.5 rounded-xl hover:bg-surface transition-all duration-200 group hover:scale-105"
                >
                  <div className="relative">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-xl transition-all duration-200">
                      <span className="text-sm font-bold text-white">
                        {getUserInitials()}
                      </span>
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-background rounded-full"></div>
                  </div>
                </button>
                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-background rounded-2xl shadow-xl border border-border z-40 overflow-hidden backdrop-blur-xl">
                      <div className="p-4 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                            <span className="text-lg font-bold text-white">
                              {getUserInitials()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-text truncate">
                              {user?.name || "User"}
                            </p>
                            <p className="text-xs text-text/60 truncate">
                              {user?.email}
                            </p>
                            <p className="text-xs font-medium text-primary uppercase tracking-wider">
                              {user?.role || "USER"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <Link
                          to="/profile"
                          className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-text hover:bg-surface rounded-xl transition-all duration-200 group"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User className="w-4 h-4 mr-3 group-hover:text-blue-500 transition-colors duration-200" />
                          View Profile
                        </Link>
                        <Link
                          to="/settings"
                          className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-text hover:bg-surface rounded-xl transition-all duration-200 group"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Settings className="w-4 h-4 mr-3 group-hover:text-purple-500 transition-colors duration-200" />
                          Settings
                        </Link>
                        <hr className="my-2 border-border" />
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 group"
                        >
                          <LogOut className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform duration-200" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
