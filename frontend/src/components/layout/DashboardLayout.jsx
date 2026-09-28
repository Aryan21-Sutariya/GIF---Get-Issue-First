import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { api } from '../../services/api';

export const LayoutContext = React.createContext();

const DashboardLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved === 'true') setIsCollapsed(true);
  }, []);

  useEffect(() => {
    let isMounted = true;
    let isPolling = false;

    const fetchNotifications = async (silent = false) => {
      if (silent && isPolling) return;
      try {
        if (!silent) setLoadingNotifications(true);
        if (silent) isPolling = true;
        
        const data = await api.getNotifications();
        if (isMounted) {
          setNotifications(data.notifications || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) {
          if (!silent) setLoadingNotifications(false);
          isPolling = false;
        }
      }
    };

    fetchNotifications();
    const interval = setInterval(() => fetchNotifications(true), 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleMarkNotificationAsRead = async (id) => {
    try {
      await api.markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebarCollapsed', next);
      return next;
    });
  };

  return (
    <LayoutContext.Provider value={{
      isCollapsed, 
      toggleCollapse, 
      isMobileOpen, 
      setIsMobileOpen,
      notifications,
      loadingNotifications,
      handleMarkNotificationAsRead
    }}>
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
