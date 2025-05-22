import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';
import { 
  LayoutDashboardIcon, 
  BarChart3Icon, 
  LineChartIcon, 
  SearchIcon, 
  BrainIcon, 
  BellIcon
} from '@/assets/icons';

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className = '' }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboardIcon size={20} />, path: '/' },
    { name: 'Markets', icon: <BarChart3Icon size={20} />, path: '/markets' },
    { name: 'Portfolio', icon: <BarChart3Icon size={20} />, path: '/portfolio' },
    { name: 'Watchlists', icon: <SearchIcon size={20} />, path: '/watchlists' },
    { name: 'Analytics', icon: <LineChartIcon size={20} />, path: '/analytics' },
    { name: 'AI Insights', icon: <BrainIcon size={20} />, path: '/insights' },
    { name: 'Alerts', icon: <BellIcon size={20} />, path: '/alerts' },
  ];

  return (
    <div 
      className={`h-screen fixed top-0 left-0 bg-card border-r border-border 
      transition-all duration-300 flex flex-col shadow-neumorphic-sm z-30 
      ${collapsed ? 'w-20' : 'w-64'} ${className}`}
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className={`${collapsed ? 'hidden' : 'block'}`}>
          <Logo variant="horizontal" size="medium" />
        </div>
        <div className={`${collapsed ? 'mx-auto' : 'hidden'}`}>
          <Logo variant="square" size="small" />
        </div>
        <button 
          onClick={toggleCollapse} 
          className="p-1 rounded-lg hover:bg-muted transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center px-3 py-3 rounded-xl transition-all duration-200 group
                ${isActive(item.path)
                  ? 'bg-primary/15 text-primary font-medium shadow-sm dark:border dark:border-primary/30'
                  : 'text-foreground hover:bg-muted'
                }`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span className={`ml-3 font-medium ${collapsed ? 'hidden' : 'block'}`}>
                {item.name}
              </span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-border p-4">
        <nav className="space-y-1">
          <Link
            to="/settings"
            className={`flex items-center px-3 py-3 rounded-xl transition-all duration-200
              ${isActive('/settings')
                ? 'bg-primary/15 text-primary font-medium shadow-sm dark:border dark:border-primary/30'
                : 'text-foreground hover:bg-muted'
              }`}
          >
            <span className="flex-shrink-0">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </span>
            <span className={`ml-3 font-medium ${collapsed ? 'hidden' : 'block'}`}>
              Settings
            </span>
          </Link>
          <Link
            to="/help"
            className={`flex items-center px-3 py-3 rounded-xl transition-all duration-200
              ${isActive('/help')
                ? 'bg-primary/15 text-primary font-medium shadow-sm dark:border dark:border-primary/30'
                : 'text-foreground hover:bg-muted'
              }`}
          >
            <span className="flex-shrink-0">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <path d="M12 17h.01" />
              </svg>
            </span>
            <span className={`ml-3 font-medium ${collapsed ? 'hidden' : 'block'}`}>
              Help & Support
            </span>
          </Link>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar; 