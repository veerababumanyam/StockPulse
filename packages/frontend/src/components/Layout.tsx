import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  // Automatically hide sidebar on mobile and show on desktop
  useEffect(() => {
    setSidebarOpen(isDesktop);
  }, [isDesktop]);

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-br from-blue-50 to-gray-50">
      {/* Sidebar */}
      {sidebarOpen && <Sidebar />}

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Use a modified Navbar that includes a button to toggle the sidebar on mobile */}
        <Navbar 
          showSidebarToggle={!isDesktop} 
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} 
          sidebarOpen={sidebarOpen}
        />

        {/* Main content area */}
        <main 
          className={`flex-1 overflow-auto transition-all duration-300 ${
            sidebarOpen ? 'lg:ml-64' : ''
          }`}
        >
          {/* Render children directly or from React Router's Outlet */}
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default Layout; 