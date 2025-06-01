'use client';

import React, { useState, useCallback } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer'; // Uncommented
// import Footer from './Footer'; // Uncomment if you have a Footer component
import { Outlet } from 'react-router-dom';
import { cn } from '../../utils/cn'; // Make sure this path is correct

const MainLayout: React.FC = () => {
  // State for mobile sidebar visibility
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  // State for desktop sidebar collapsed status
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] =
    useState(false);

  const handleToggleMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen((prev) => !prev);
  }, []);

  const handleCloseMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen(false);
  }, []);

  const handleToggleDesktopCollapse = useCallback(() => {
    setIsDesktopSidebarCollapsed((prev) => !prev);
  }, []);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onClose={handleCloseMobileSidebar}
        isCollapsed={isDesktopSidebarCollapsed}
        onToggleCollapse={handleToggleDesktopCollapse}
      />
      {/* Main content: fills remaining space beside sidebar */}
      <div className="flex flex-col flex-1 transition-all duration-300 ease-in-out min-w-0">
        <Navbar onToggleSidebar={handleToggleMobileSidebar} />{' '}
        {/* Navbar is sticky top-0 z-30 */}
        {/* This div is scrollable and contains both main content and footer */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <main className="p-4 md:p-6 w-full">
            <Outlet />
          </main>
          <Footer /> {/* Footer is now inside the scrollable area */}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
