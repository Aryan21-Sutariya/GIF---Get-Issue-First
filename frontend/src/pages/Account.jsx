import React, { useContext } from 'react';
import TopBar from '../components/layout/TopBar';
import { LogOut, CheckCircle2, LogIn } from 'lucide-react';
import Button from '../components/ui/Button';
import GithubIcon from '../components/ui/GithubIcon';
import { AuthContext } from '../context/AuthContext';

const Account = () => {
  const { user, login, logout, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Account Settings" showTabs={false} />
        <div className="flex-1 p-6 md:p-8 flex items-center justify-center">
          <p className="text-slate-500 dark:text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Account Settings" showTabs={false} />
      
      <div className="flex-1 p-6 md:p-8 max-w-3xl mx-auto w-full">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          
          {!user ? (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <GithubIcon className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-4" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Welcome to GIF</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6 mt-2 max-w-md">
                Get Issue First is designed to monitor open source repositories and provide immediate alerts. 
                Please connect your GitHub account to sync credentials mapping.
              </p>
              <Button onClick={login} className="gap-2">
                <LogIn className="h-4 w-4" />
                Login with GitHub
              </Button>
            </div>
          ) : (
            <>
              <div className="p-8">
                <div className="flex items-center gap-6">
                  <div className="h-24 w-24 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center border-4 border-white dark:border-slate-950 shadow-sm overflow-hidden">
                    {user.avatarUrl ? (
                      <img 
                        src={user.avatarUrl} 
                        alt="Github avatar" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <GithubIcon className="h-10 w-10 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{user.username}</h2>
                    <div className="flex items-center gap-2 text-slate-500 mt-1">
                      <GithubIcon className="h-4 w-4" />
                      <span>@{user.username}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-slate-100 dark:border-slate-800 px-8 py-6">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-4">
                  Connections
                </h3>
                <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <GithubIcon className="h-5 w-5 text-slate-900 dark:text-white" />
                    <span className="font-medium">GitHub Account</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4" />
                    Connected
                  </div>
                </div>
              </div>
              
              <div className="border-t border-slate-100 dark:border-slate-800 px-8 py-6 bg-slate-50 dark:bg-slate-900/50">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-4 text-red-600 dark:text-red-500">
                  Danger Zone
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Log out of GIF</p>
                    <p className="text-sm text-slate-500 mt-1">Clear your session. You won't receive notifications.</p>
                  </div>
                  <Button onClick={logout} variant="danger" className="gap-2">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default Account;
