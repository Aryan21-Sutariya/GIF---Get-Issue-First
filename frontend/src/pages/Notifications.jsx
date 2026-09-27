import React, { useState, useEffect } from 'react';
import TopBar from '../components/layout/TopBar';
import { api } from '../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let isPolling = false;

    const fetchNotifications = async (silent = false) => {
      if (silent && isPolling) return;
      try {
        if (!silent) setLoading(true);
        if (silent) isPolling = true;
        
        const data = await api.getNotifications();
        if (isMounted) {
          setNotifications(data.notifications || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) {
          if (!silent) setLoading(false);
          isPolling = false;
        }
      }
    };

    fetchNotifications();
    const interval = setInterval(() => fetchNotifications(true), 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.markNotificationAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark as read');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Notifications" showTabs={false} />
      <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
            <p className="text-slate-500 dark:text-slate-400">No new notifications.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map(n => (
              <div 
                key={n.id} 
                className={`p-4 border rounded-lg flex flex-col md:flex-row md:items-center justify-between ${n.isRead ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700' : 'bg-blue-50 dark:bg-slate-800/80 border-blue-200 dark:border-blue-500/30'}`}
              >
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                    {n.repository?.fullName || 'Unknown Repository'}
                  </p>
                  <p className={`text-base ${n.isRead ? 'text-slate-700 dark:text-slate-200' : 'text-slate-900 dark:text-white font-semibold'}`}>
                    New matching issue: <a href={n.issue?.url} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">#{n.issue?.number} {n.issue?.title}</a>
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                {!n.isRead && (
                  <button 
                    onClick={() => handleMarkAsRead(n.id)}
                    className="mt-4 md:mt-0 text-sm px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shrink-0"
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
