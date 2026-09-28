import React, { useContext, useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { LayoutContext } from '../layout/DashboardLayout';
import { Link } from 'react-router-dom';

const NotificationBell = () => {
  const { notifications, handleMarkNotificationAsRead } = useContext(LayoutContext);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (n) => {
    if (!n.isRead) {
      handleMarkNotificationAsRead(n.id);
    }
  };

  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white z-10">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 z-50">
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs text-slate-500 dark:text-slate-400">{unreadCount} unread</span>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {recentNotifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
                No recent notifications.
              </div>
            ) : (
              recentNotifications.map(n => (
                <div 
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-4 border-b border-slate-100/50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${n.isRead ? 'opacity-70' : 'bg-blue-50/50 dark:bg-slate-800/80'}`}
                >
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {n.repository?.fullName || 'Unknown Repository'}
                    </p>
                    <p className={`text-sm break-words ${n.isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white font-medium'}`}>
                      {n.issue?.url ? (
                        <a 
                          href={n.issue.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="hover:underline"
                          onClick={(e) => {
                            if (!n.isRead) handleMarkNotificationAsRead(n.id);
                          }}
                        >
                          #{n.issue.number} {n.issue.title}
                        </a>
                      ) : (
                        <span>#{n.issue?.number} {n.issue?.title}</span>
                      )}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-2 border-t border-slate-200 dark:border-slate-800">
            <Link 
              to="/notifications" 
              className="block w-full text-center text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 py-2 rounded-md hover:bg-purple-50 dark:hover:bg-purple-900/20"
              onClick={() => setIsOpen(false)}
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
