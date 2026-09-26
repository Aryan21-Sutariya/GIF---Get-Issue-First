import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { BookMarked, Lock, User, LogOut, Menu, X, Bell } from 'lucide-react';
import GithubIcon from '../ui/GithubIcon';
import { LayoutContext } from './DashboardLayout';
import { AuthContext } from '../../context/AuthContext';

const Sidebar = () => {
  const { isCollapsed, toggleCollapse, isMobileOpen, setIsMobileOpen } = useContext(LayoutContext);
  const { user, logout, login } = useContext(AuthContext);

  const getNavClass = ({ isActive }) =>
    `flex items-center rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400'
        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
    } ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2'}`;

  const navItems = [
    {
      label: 'PUBLIC',
      items: [
        { name: 'Public Repositories', to: '/public', icon: BookMarked },
      ],
    },
    {
      label: 'PRIVATE',
      items: [
        { name: 'Private Repositories', to: '/private', icon: Lock },
      ],
    },
    {
      label: 'ALERTS',
      items: [
        { name: 'Notifications', to: '/notifications', icon: Bell },
      ],
    }
  ];

  const accountItems = [
    { name: 'Account', to: '/account', icon: User },
  ];

  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
    >
      {/* Header */}
      <div className={`flex h-16 shrink-0 items-center border-b border-slate-200 dark:border-slate-800 ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}>
        <div className="flex items-center w-full gap-3">
          
          <button 
            onClick={toggleCollapse} 
            className="hidden md:flex p-2 items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
            title="Toggle Sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <button 
            onClick={() => setIsMobileOpen(false)} 
            className="md:hidden flex p-2 items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          >
            <X className="h-5 w-5" />
          </button>

          {!isCollapsed && (
            <div className="flex items-center gap-2 font-bold tracking-tight text-slate-900 dark:text-white">
              <GithubIcon className="h-6 w-6 text-purple-600 dark:text-purple-500" />
              <div className="flex flex-col whitespace-nowrap overflow-hidden">
                <span className="text-xl leading-none">GIF</span>
                <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400">Get Issue First</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-4">
        {navItems.map((section) => (
          <div key={section.label} className="mb-6">
            {!isCollapsed && (
              <h4 className="mb-2 px-3 text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap">
                {section.label}
              </h4>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => (
                <li key={item.name}>
                  <NavLink to={item.to} className={getNavClass} title={isCollapsed ? item.name : undefined}>
                    <item.icon className="h-5 w-5 shrink-0" />
                    {!isCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer Nav */}
      <div className="mt-auto border-t border-slate-200 p-4 dark:border-slate-800">
        {!isCollapsed && (
          <h4 className="mb-2 px-3 text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap">
            ACCOUNT
          </h4>
        )}
        <ul className="space-y-1">
          {accountItems.map((item) => (
            <li key={item.name}>
              <NavLink to={item.to} className={getNavClass} title={isCollapsed ? item.name : undefined}>
                <item.icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
              </NavLink>
            </li>
          ))}
          {user ? (
            <li>
              <button 
                onClick={logout}
                className={`flex w-full items-center rounded-md font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-red-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-red-400 ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2 text-sm'}`}
                title={isCollapsed ? "Logout" : undefined}
              >
                <LogOut className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span className="whitespace-nowrap">Logout</span>}
              </button>
            </li>
          ) : (
            <li>
               <button 
                onClick={login}
                className={`flex w-full items-center rounded-md font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-emerald-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-emerald-400 ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2 text-sm'}`}
                title={isCollapsed ? "Login" : undefined}
              >
                <GithubIcon className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span className="whitespace-nowrap">Login</span>}
              </button>
            </li>
          )}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
