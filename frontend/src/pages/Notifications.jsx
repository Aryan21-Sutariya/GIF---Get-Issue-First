import React from 'react';
import TopBar from '../components/layout/TopBar';

const Notifications = () => {
  return (
    <div className="flex flex-col h-full">
      <TopBar title="Notifications" showTabs={false} />
      <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
        <div className="text-center py-12 px-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
          <p className="text-slate-500 dark:text-slate-400">No new notifications.</p>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
