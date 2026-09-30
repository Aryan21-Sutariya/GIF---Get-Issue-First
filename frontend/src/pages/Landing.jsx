import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ArrowRight, Bell, Search, Lock, Zap, Globe, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Button from '../components/ui/Button';
import GithubIcon from '../components/ui/GithubIcon';
import ThemeToggle from '../components/ui/ThemeToggle';

const Landing = () => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (loading) return;
    if (user) {
      navigate('/public');
    } else {
      navigate('/account');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GithubIcon className="h-8 w-8 text-purple-600 dark:text-purple-500" />
            <div className="flex flex-col">
              <span className="text-xl font-bold leading-none tracking-tight">GIF</span>
              <span className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider">Get Issue First</span>
            </div>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              {!loading && user && (
                <>
                  <Link to="/public" className="text-slate-600 hover:text-purple-600 dark:text-slate-300 dark:hover:text-purple-400 transition-colors">Public Repositories</Link>
                  <Link to="/private" className="text-slate-600 hover:text-purple-600 dark:text-slate-300 dark:hover:text-purple-400 transition-colors">Private</Link>
                  <Link to="/account" className="text-slate-600 hover:text-purple-600 dark:text-slate-300 dark:hover:text-purple-400 transition-colors">Account</Link>
                </>
              )}
            </nav>
            <ThemeToggle />
            <Button variant="primary" size="sm" onClick={handleGetStarted}>
              {user ? 'Dashboard' : 'Sign In'}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Section 1: Hero */}
        <section className="px-6 py-24 md:py-32 flex flex-col items-center text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 text-sm font-medium mb-8 border border-purple-200 dark:border-purple-800/60">
            <Zap className="h-4 w-4" /> Real-time GitHub Issue Monitoring
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-tight">
            Get the Issue. <span className="text-purple-600 dark:text-purple-500">First.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-10 leading-relaxed">
            Monitor GitHub repositories for the issues that matter to you. GIF watches your selected labels and alerts you when a matching issue appears.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full sm:w-auto px-8 gap-2" onClick={handleGetStarted}>
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="lg" className="w-full sm:w-auto px-8" onClick={handleGetStarted}>
              View Repositories
            </Button>
          </div>
        </section>

        {/* Section 2: How GIF Works */}
        <section className="px-6 py-16 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">How it works</h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                No complex setup. Start monitoring repositories in minutes.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 relative">
              <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-slate-200 dark:bg-slate-800 -z-10 bg-gradient-to-r from-transparent via-purple-300 dark:via-purple-800 to-transparent"></div>
              
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mb-6 shadow-sm z-10">
                  <ShieldCheck className="h-8 w-8 text-purple-600 dark:text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-slate-100">1. Connect GitHub</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Sign in securely with your GitHub account to enable synchronization and private repository mapping.
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mb-6 shadow-sm z-10">
                  <Search className="h-8 w-8 text-purple-600 dark:text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-slate-100">2. Choose what to watch</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Add repositories and select labels such as <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">good first issue</span>, <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">help wanted</span>, or <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">bounty</span>.
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mb-6 shadow-sm z-10">
                  <Bell className="h-8 w-8 text-purple-600 dark:text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-slate-100">3. Get notified</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  When a matching issue appears, GIF alerts you immediately across your dashboard and browser.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Notification Flow */}
        <section className="px-6 py-16 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Workflow Intelligence</h2>
              <p className="text-slate-600 dark:text-slate-400">
                GIF bridges the gap between repository activity and your awareness, ensuring you never miss critical community issues by leveraging secure webhooks.
              </p>
              
              <ul className="space-y-4 pt-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-purple-600 dark:text-purple-500 mt-0.5 shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">GitHub issue created</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-purple-600 dark:text-purple-500 mt-0.5 shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">Matching label detected precisely</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-purple-600 dark:text-purple-500 mt-0.5 shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">GIF notification dispatched</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-purple-600 dark:text-purple-500 mt-0.5 shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">Open the issue directly and contribute</span>
                </li>
              </ul>
            </div>
            
            <div className="flex-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl">
               <div className="space-y-4">
                 <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 dark:bg-slate-800/80 dark:border-blue-500/30 flex items-start gap-4">
                   <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                     <GithubIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                   </div>
                   <div>
                     <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">vercel/next.js</p>
                     <p className="text-slate-900 dark:text-white font-semibold flex flex-col gap-1">
                       <span>New matching issue: <span className="text-blue-600 dark:text-blue-400">#41212 Add types</span></span>
                       <span className="inline-flex items-center gap-1 w-fit rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-700 dark:border-purple-800/50 dark:bg-purple-900/20 dark:text-purple-300">good first issue</span>
                     </p>
                   </div>
                 </div>
                 
                 <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 dark:bg-slate-800/40 dark:border-slate-700/50 flex items-start gap-4 opacity-75">
                   <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                     <GithubIcon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                   </div>
                   <div>
                     <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">remix-run/react-router</p>
                     <p className="text-slate-600 dark:text-slate-300">
                       New matching issue: <span className="text-slate-500">#1022 Fix layout jump</span>
                     </p>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </section>

        {/* Section 4: Key Features */}
        <section className="px-6 py-16 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Core Capabilities</h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Built natively for speed and accuracy. No bloated metrics—just what you need.
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Globe, title: 'Public Repositories', desc: 'Watch any public GitHub repository transparently.' },
                { icon: Lock, title: 'Private Repositories', desc: 'Securely monitor authorized organizations and personal workspaces.' },
                { icon: Search, title: 'Label Tracking', desc: 'Filter noise uniquely by selecting precise label strings.' },
                { icon: Zap, title: 'Real-time Detection', desc: 'Webhooks verify events synchronously delivering updates reliably.' },
                { icon: Bell, title: 'In-app Notifications', desc: 'Unified dashboard streams matching events natively.' },
                { icon: Globe, title: 'All Issues Mode', desc: 'Monitor every new issue in a repository without label filtering.' },
              ].map((feature, idx) => (
                <div key={idx} className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:border-purple-300 dark:hover:border-purple-800 transition-colors">
                  <feature.icon className="h-6 w-6 text-purple-600 dark:text-purple-500 mb-4" />
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">{feature.title}</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 5: Final CTA */}
        <section className="px-6 py-20 md:py-28 text-center bg-slate-900 dark:bg-slate-950">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Start finding issues before they get crowded.
            </h2>
            <p className="text-slate-400 mb-10 text-lg">
              Join GIF and streamline your open-source workflow today.
            </p>
            <Button variant="primary" size="lg" className="px-10" onClick={handleGetStarted}>
              Get Started
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-12 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
             <div className="flex items-center gap-2 mb-4">
              <GithubIcon className="h-6 w-6 text-purple-600 dark:text-purple-500" />
              <div className="flex flex-col">
                <span className="text-lg font-bold leading-none tracking-tight">GIF</span>
                <span className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider">Get Issue First</span>
              </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs">
              Monitor GitHub repositories for the issues that matter to you.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 text-sm">Navigation</h4>
            <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
              <li>
                <Link to="/" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/account" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Account</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 text-sm">Legal & Connect</h4>
            <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
              <li><span className="cursor-not-allowed opacity-75">Terms of Service</span></li>
              <li><span className="cursor-not-allowed opacity-75">Privacy Policy</span></li>
              <li className="pt-2 italic text-xs">
                Not officially affiliated with GitHub.
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
