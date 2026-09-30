import React, { useContext } from 'react';
import { X } from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import { LayoutContext } from '../components/layout/DashboardLayout';
import { useToast } from '../components/ui/Toast';

const Notifications = () => {
  const { notifications, loadingNotifications: loading, handleMarkNotificationAsRead: handleMarkAsRead, handleDismissNotification } = useContext(LayoutContext);
  const toast = useToast();

  const handleDismiss = async (e, id) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await handleDismissNotification(id);
    } catch (err) {
      toast.error("Couldn't dismiss notification. Please try again.");
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
                <div className="flex-1 min-w-0">
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
                <div className="flex items-center gap-2 mt-4 md:mt-0 shrink-0">
                  {!n.isRead && (
                    <button 
                      onClick={() => handleMarkAsRead(n.id)}
                      className="text-sm px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                    >
                      Mark as Read
                    </button>
                  )}
                  <button
                    onClick={(e) => handleDismiss(e, n.id)}
                    aria-label="Dismiss notification"
                    className="p-2 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
