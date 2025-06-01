import React, { useState, ErrorInfo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';
import { cn } from '../../utils/cn';

interface LayoutProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Layout Error Boundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please refresh the page or contact support if the problem
              persists.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Refresh Page
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-red-600">
                  Error Details
                </summary>
                <pre className="mt-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 text-sm rounded">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default to closed on mobile
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Default to expanded on desktop
  const location = useLocation();

  // Initialize sidebar collapsed state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-collapsed');
    if (savedState !== null) {
      setSidebarCollapsed(JSON.parse(savedState));
    }
  }, []);

  // Save collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Routes that don't need the full layout (auth pages, landing page)
  const authRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
  ];
  const noLayoutRoutes = ['/', ...authRoutes];

  const isNoLayoutRoute = noLayoutRoutes.includes(location.pathname);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
    // Also close mobile sidebar when collapsing on mobile
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  // For pages that don't need the sidebar layout
  if (isNoLayoutRoute) {
    return <>{children}</>;
  }

  // Calculate main content margin based on sidebar state
  const mainContentMargin = sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64';

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <ErrorBoundary>
          <Sidebar
            isOpen={sidebarOpen}
            onClose={closeSidebar}
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={toggleSidebarCollapse}
          />
        </ErrorBoundary>

        {/* Main Content Area */}
        <div
          className={cn(
            'min-h-screen transition-all duration-300 ease-in-out',
            mainContentMargin,
          )}
        >
          {/* Top Navigation */}
          <ErrorBoundary>
            <Navbar onToggleSidebar={toggleSidebar} />
          </ErrorBoundary>

          {/* Page Content */}
          <main className="px-4 sm:px-6 lg:px-8 py-6 pb-20 min-h-[calc(100vh-8rem)]">
            <ErrorBoundary>{children}</ErrorBoundary>
          </main>

          {/* Footer */}
          <ErrorBoundary>
            <Footer />
          </ErrorBoundary>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Layout;
