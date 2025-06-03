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
} from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import { UnifiedThemeSelector } from "../common/UnifiedThemeSelector";
import { cn } from "../../utils/theme";
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

  const { isDark } = useTheme({
    context: "navbar",
  });

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

              {/* Enhanced Theme Selector - Compact Mode for Navbar */}
              <div className="theme-selector-container">
                <UnifiedThemeSelector
                  variant="compact"
                  position="toolbar"
                  showLabels={false}
                  showRecommendations={false}
                  showAnalytics={false}
                  enableAutoSwitch={false}
                  className="navbar-theme-selector"
                />
              </div>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="p-2.5 rounded-xl hover:bg-surface transition-all duration-200 hover:scale-105 group relative"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5 text-text/60 group-hover:text-primary transition-colors duration-200" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    3
                  </span>
                </button>
                {isNotificationOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsNotificationOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-80 bg-background border border-border rounded-2xl shadow-xl z-40 overflow-hidden">
                      <div className="p-4 border-b border-border">
                        <h3 className="font-semibold text-text">
                          Notifications
                        </h3>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        <div className="p-4 hover:bg-surface transition-colors duration-200">
                          <p className="text-sm text-text/80">
                            Portfolio performance update available
                          </p>
                          <p className="text-xs text-text/50 mt-1">
                            2 minutes ago
                          </p>
                        </div>
                        <div className="p-4 hover:bg-surface transition-colors duration-200">
                          <p className="text-sm text-text/80">
                            New trading signal detected
                          </p>
                          <p className="text-xs text-text/50 mt-1">
                            5 minutes ago
                          </p>
                        </div>
                        <div className="p-4 hover:bg-surface transition-colors duration-200">
                          <p className="text-sm text-text/80">
                            Market analysis completed
                          </p>
                          <p className="text-xs text-text/50 mt-1">
                            1 hour ago
                          </p>
                        </div>
                      </div>
                      <div className="p-3 border-t border-border">
                        <button className="w-full text-sm text-primary hover:text-primary/80 transition-colors duration-200 font-medium">
                          View All Notifications
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-xl hover:bg-surface transition-all duration-200 hover:scale-105 group"
                  title="User menu"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-sm font-semibold group-hover:scale-110 transition-transform duration-200">
                    {getUserInitials()}
                  </div>
                  <ChevronDown className="w-4 h-4 text-text/60 group-hover:text-primary transition-colors duration-200" />
                </button>
                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-background border border-border rounded-2xl shadow-xl z-40 overflow-hidden">
                      <div className="p-4 border-b border-border">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-semibold text-lg">
                            {getUserInitials()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-text truncate">
                              {user?.name || "User"}
                            </p>
                            <p className="text-sm text-text/60 truncate">
                              {user?.email || "user@example.com"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2 space-y-1">
                        <Link
                          to="/settings"
                          className="flex items-center space-x-3 p-3 rounded-xl hover:bg-surface transition-all duration-200 text-text/80 hover:text-text group"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Settings className="w-4 h-4 group-hover:text-primary transition-colors duration-200" />
                          <span className="text-sm font-medium">Settings</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 text-text/80 hover:text-red-600 dark:hover:text-red-400 group"
                        >
                          <LogOut className="w-4 h-4 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-200" />
                          <span className="text-sm font-medium">Sign Out</span>
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
