import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Navbar from '@components/layout/Navbar';
import Sidebar from '@components/layout/Sidebar';

const DashboardLayout = ({ sidebarLinks = [] }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      {/* Top Navbar - Using existing Navbar component */}
      <Navbar />

      {/* Main Layout */}
      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className={`hidden lg:block fixed left-0 top-16 bottom-0 z-30 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}>
          <Sidebar 
            links={sidebarLinks} 
            isCollapsed={isCollapsed}
            onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          />
        </aside>

        {/* Mobile Sidebar */}
        {isMobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <div
              className="lg:hidden fixed inset-0 bg-black/50 z-40 top-16"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            {/* Mobile Sidebar */}
            <aside className="lg:hidden fixed left-0 top-16 bottom-0 w-64 z-50">
              <Sidebar
                links={sidebarLinks}
                isMobile
                onClose={() => setIsMobileSidebarOpen(false)}
              />
            </aside>
          </>
        )}

        {/* Main Content */}
        <main className={`flex-1 min-h-[calc(100vh-4rem)] transition-all duration-300 ${
          isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}>
          {/* Mobile Menu Button - Fixed at top of content area */}
          <div className="lg:hidden sticky top-16 z-20 bg-white dark:bg-dark-bg-secondary border-b border-light-border dark:border-dark-border p-4">
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors"
              aria-label="Toggle mobile menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Page Content - Rendered via Outlet */}
          <div className="p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
