import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { api } from '../../services/api';

export const LayoutContext = React.createContext();

const DashboardLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  const isInitialFetch = useRef(true);
  const seenNotificationIds = useRef(new Set());
  const navigate = useNavigate();

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
          const incomingNotifications = data.notifications || [];
          setNotifications(incomingNotifications);

          if (isInitialFetch.current) {
            incomingNotifications.forEach(n => seenNotificationIds.current.add(n.id));
            isInitialFetch.current = false;
          } else {
            incomingNotifications.forEach(n => {
              if (!seenNotificationIds.current.has(n.id)) {
                seenNotificationIds.current.add(n.id);
                
                if ('Notification' in window && Notification.permission === 'granted') {
                  const title = "New issue found";
                  const body = `${n.repository?.fullName || 'Unknown Repository'}\n#${n.issue?.number} ${n.issue?.title}`;
                  const desktopNotification = new Notification(title, { body });

                  desktopNotification.onclick = (e) => {
                    e.preventDefault();
                    window.focus();
                    desktopNotification.close();
                    if (n.repository?.fullName && n.issue?.number) {
                      const type = n.repository.isPrivate ? 'private' : 'public';
                      navigate(`/${type}/${n.repository.fullName}?issue=${n.issue.number}`);
                    } else {
                      navigate(`/notifications`);
                    }
                  };
                }
              }
            });
          }
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
  }, [navigate]);

  const handleMarkNotificationAsRead = async (id) => {
    try {
      await api.markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const handleDismissNotification = async (id) => {
    const index = notifications.findIndex(n => n.id === id);
    if (index === -1) return;
    const notificationToDismiss = notifications[index];
    
    setNotifications(prev => prev.filter(n => n.id !== id));
    
    try {
      await api.dismissNotification(id);
    } catch (err) {
      console.error('Failed to dismiss notification', err);
      setNotifications(prev => {
        const newNotifications = [...prev];
        if (!newNotifications.some(n => n.id === id)) {
          newNotifications.splice(index, 0, notificationToDismiss);
        }
        return newNotifications;
      });
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
      handleMarkNotificationAsRead,
      handleDismissNotification
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
