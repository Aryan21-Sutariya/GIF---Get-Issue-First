import React, { useContext } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import ThemeToggle from '../ui/ThemeToggle';
import Button from '../ui/Button';
import { Plus, Menu } from 'lucide-react';
import { LayoutContext } from './DashboardLayout';

const TopBar = ({ title, showTabs = true, onAddClick }) => {
  const location = useLocation();
  const { setIsMobileOpen } = useContext(LayoutContext);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 px-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
      <div className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            className="md:hidden text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            onClick={() => setIsMobileOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="primary" size="sm" className="gap-2" onClick={onAddClick}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Repository</span>
            <span className="inline sm:hidden">Add</span>
          </Button>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
          <ThemeToggle />
        </div>
      </div>
      
      {showTabs && (
        <div className="-mb-px flex gap-6 overflow-x-auto no-scrollbar">
          <NavLink
            to="/public"
            className={({ isActive }) =>
              `border-b-2 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-purple-500 text-purple-600 dark:border-purple-400 dark:text-purple-400'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-300'
              }`
            }
          >
            Public Repositories
          </NavLink>
          <NavLink
            to="/private"
            className={({ isActive }) =>
              `border-b-2 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-purple-500 text-purple-600 dark:border-purple-400 dark:text-purple-400'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-300'
              }`
            }
          >
            Private Repositories
          </NavLink>
        </div>
      )}
    </header>
  );
};

export default TopBar;
