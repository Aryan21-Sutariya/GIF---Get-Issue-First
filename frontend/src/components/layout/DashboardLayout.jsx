import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export const LayoutContext = React.createContext();

const DashboardLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved === 'true') setIsCollapsed(true);
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebarCollapsed', next);
      return next;
    });
  };

  return (
    <LayoutContext.Provider value={{ isCollapsed, toggleCollapse, isMobileOpen, setIsMobileOpen }}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex">
        
        {/* Mobile Overlay Background */}
        {isMobileOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}

        <Sidebar />
        
        <div className={`flex flex-1 flex-col transition-all duration-300 min-w-0 ${isCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
          <main className="flex-1 w-full mx-auto relative pt-0 pb-16">
            <Outlet />
          </main>
        </div>
      </div>
    </LayoutContext.Provider>
  );
};

export default DashboardLayout;
