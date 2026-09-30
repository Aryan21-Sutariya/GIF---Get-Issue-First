import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, MessageSquare, ExternalLink, Star, Globe } from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import GithubIcon from '../components/ui/GithubIcon';
import { useRepositories } from '../context/RepositoryContext';
import { api } from '../services/api';
import { useToast } from '../components/ui/Toast';
import Modal from '../components/ui/Modal';

const PRESET_LABELS = [
  'bug', 'documentation', 'enhancement', 'beginner', 
  'bounty', 'help wanted', 'good first issue'
];

const PublicRepositoryDetail = () => {
  const { owner, repo } = useParams();
  const repoName = `${owner}/${repo}`;
  const location = useLocation();
  const navigate = require('react-router-dom').useNavigate();
  const [activeTab, setActiveTab] = useState('issues');
  const { publicRepos, updatePublicRepoLabels, deletePublicRepo } = useRepositories();
  const [customLabel, setCustomLabel] = useState('');
  const toast = useToast();
  
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [issues, setIssues] = useState([]);
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [issuesError, setIssuesError] = useState(null);
  
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const repository = publicRepos.find(r => r.name === repoName) || {
    name: repoName,
    description: 'A repository not found natively in contexts.',
    language: 'Unknown',
    stars: '~',
    labels: [],
    watchAllIssues: false
  };

  const [localLabels, setLocalLabels] = useState(repository.labels || []);
  const [localWatchAll, setLocalWatchAll] = useState(repository.watchAllIssues || false);

  useEffect(() => {
    if (repository.labels) {
      setLocalLabels(repository.labels);
    }
    setLocalWatchAll(repository.watchAllIssues || false);
  }, [repository.labels, repository.watchAllIssues]);

  useEffect(() => {
    let isMounted = true;
    let isPolling = false;
    let interval;

    if (activeTab === 'issues' && repository && repository.id) {
       if (!localWatchAll && repository.labels.length === 0) {
         if (isMounted) {
           setIssues([]);
           setIssuesError(null);
         }
         return;
       }

       const fetchIssues = async (silent = false) => {
         if (silent && isPolling) return;
         if (!silent) {
           setLoadingIssues(true);
           setIssuesError(null);
         } else {
           isPolling = true;
         }
         try {
           const data = await api.fetchGithubIssuesAction(repository.id);
           if (isMounted) setIssues(data.issues || []);
         } catch (err) {
           if (isMounted && !silent) setIssuesError("Couldn't load issues right now. Please try again.");
         } finally {
           if (isMounted) {
             if (!silent) setLoadingIssues(false);
             isPolling = false;
           }
         }
       };

       fetchIssues();
       interval = setInterval(() => {
         fetchIssues(true);
       }, 5000);
    }
    
    return () => { 
      isMounted = false; 
      if (interval) clearInterval(interval);
    };
  }, [activeTab, repository.id, repository.labels, localWatchAll]);

  useEffect(() => {
    if (activeTab === 'issues' && issues.length > 0) {
      const searchParams = new URLSearchParams(location.search);
      const issueParam = searchParams.get('issue');
      if (issueParam) {
        setTimeout(() => {
          const element = document.getElementById(`issue-${issueParam}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('ring-2', 'ring-purple-500', 'ring-offset-2', 'dark:ring-offset-slate-950', 'transition-all', 'duration-500');
            setTimeout(() => {
              element.classList.remove('ring-2', 'ring-purple-500', 'ring-offset-2', 'dark:ring-offset-slate-950');
            }, 3000);
          }
        }, 100);
      }
    }
  }, [issues, activeTab, location.search]);

  const handleRemoveLabel = (labelToRemove) => {
    setLocalLabels(prev => prev.filter(l => l !== labelToRemove));
  };

  const handleAddLabel = (labelToAdd) => {
    if (labelToAdd.trim() && !localLabels.includes(labelToAdd.trim())) {
      setLocalLabels(prev => [...prev, labelToAdd.trim()]);
    }
  };

  const handleCustomLabelAdd = (e) => {
    e.preventDefault();
    handleAddLabel(customLabel);
    setCustomLabel('');
  };

  const handleSaveChanges = async () => {
    if (!repository || !repository.id) return;
    setIsSavingSettings(true);
    try {
      await api.updatePublicRepositoryLabels(repository.id, localWatchAll ? [] : localLabels, localWatchAll);
      updatePublicRepoLabels(repoName, localWatchAll ? [] : localLabels, localWatchAll);
      toast.success('Monitoring settings saved successfully.');
    } catch (err) {
      toast.error("We couldn't save your monitoring settings. Please try again.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSelectAllLabels = () => {
    const allLabels = Array.from(new Set([...localLabels, ...PRESET_LABELS]));
    setLocalLabels(allLabels);
  };
  
  const handleClearAllLabels = () => {
    setLocalLabels([]);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deletePublicRepo(repository.id);
      toast.success('Repository removed from your GIF watchlist.');
      navigate('/public');
    } catch(err) {
      toast.error("We couldn't remove this repository. Please try again.");
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  const formatDisplayDate = (isoString) => {
    try {
      return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Repository Details" showTabs={false} />
      
      <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
        {/* Navigation */}
        <Link 
          to="/public" 
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Public Repositories
        </Link>
        
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <GithubIcon className="h-8 w-8 text-slate-800 dark:text-slate-200" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  {repository.name}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 max-w-2xl mb-4">
                  {repository.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                     <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                    {repository.language}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    {repository.stars}
                  </div>
                  {repository.watchAllIssues && (
                    <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                      <Globe className="h-4 w-4" />
                      All Issues
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="shrink-0 flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <a 
                href={`https://github.com/${repository.name}`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="default" className="gap-2 w-full sm:w-auto text-sm">
                  Open on GitHub
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
              {activeTab === 'settings' && (
                <Button 
                  variant="ghost" 
                  className="w-full sm:w-auto text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/30"
                  onClick={() => setShowConfirmDelete(true)}
                >
                  Remove Repository
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-800 mb-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('issues')}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'issues' 
                  ? 'border-purple-500 text-purple-600 dark:border-purple-400 dark:text-purple-400' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:border-slate-700'
              }`}
            >
              Issues
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'settings' 
                  ? 'border-purple-500 text-purple-600 dark:border-purple-400 dark:text-purple-400' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:border-slate-700'
              }`}
            >
              Settings
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'issues' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {localWatchAll ? 'All Issues' : 'New Matching Issues'}
              </h2>
            </div>
            
            <div className="space-y-4">
              {loadingIssues ? (
                <div className="text-center py-12 px-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                  <p className="text-slate-500 dark:text-slate-400">Loading {localWatchAll ? 'all' : 'matching'} issues...</p>
                </div>
              ) : issuesError ? (
                <div className="text-center py-12 px-4 border border-red-300 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 rounded-lg">
                  <p className="text-red-500 dark:text-red-400 font-medium">{issuesError}</p>
                </div>
              ) : issues.length > 0 ? (
                issues.map((issue) => (
                  <div 
                    key={issue.id} 
                    id={`issue-${issue.number}`}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 hover:border-purple-300 dark:hover:border-purple-500 transition-colors shadow-sm scroll-mt-24"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-start gap-2">
                          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 break-words leading-snug">
                            {issue.title}
                          </h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {issue.labels.map(label => (
                            <Badge key={label} label={label} />
                          ))}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs md:text-sm text-slate-500 dark:text-slate-400">
                          <span>#{issue.number}</span>
                          <span>opened {formatDisplayDate(issue.createdAt)} by {issue.author}</span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            {issue.commentCount}
                          </span>
                        </div>
                      </div>
                      <a 
                        href={issue.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="shrink-0"
                      >
                        <Button variant="ghost" size="sm" className="gap-1.5 w-full md:w-auto">
                          Open Issue
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </a>
                    </div>
                  </div>
                ))
              ) : !localWatchAll && repository.labels.length === 0 ? (
                <div className="text-center py-12 px-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                   <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">No labels selected</h3>
                   <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
                    Please select at least one label in Repository Settings, or enable All Issues mode.
                  </p>
                  <Button variant="primary" onClick={() => setActiveTab('settings')}>
                    Go to Settings
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12 px-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                   <p className="text-slate-500 dark:text-slate-400">
                    No new {localWatchAll ? '' : 'matching '}issues found for <span className="font-medium text-slate-700 dark:text-slate-300">{repoName}</span>.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm max-w-3xl">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Repository Settings
            </h2>
            
            {/* Monitoring Mode */}
            <div className="mt-6 mb-6">
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-3">
                Monitoring Mode
              </h3>
              <div className="space-y-3">
                <label className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${!localWatchAll ? 'border-purple-300 bg-purple-50/50 dark:border-purple-700 dark:bg-purple-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                  <input 
                    type="radio" 
                    name="monitoringMode" 
                    checked={!localWatchAll} 
                    onChange={() => setLocalWatchAll(false)}
                    className="mt-1 accent-purple-600"
                  />
                  <div>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Selected labels</span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Only issues matching your selected labels will be monitored.</p>
                  </div>
                </label>
                <label className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${localWatchAll ? 'border-purple-300 bg-purple-50/50 dark:border-purple-700 dark:bg-purple-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                  <input 
                    type="radio" 
                    name="monitoringMode" 
                    checked={localWatchAll} 
                    onChange={() => setLocalWatchAll(true)}
                    className="mt-1 accent-purple-600"
                  />
                  <div>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">All issues</span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Every new issue in this repository will be monitored.</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Label Configuration - disabled when All Issues is on */}
            <div className={`mt-8 mb-6 ${localWatchAll ? 'opacity-40 pointer-events-none' : ''}`}>
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                Issue notification labels
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">
                You're notified when a newly created issue contains any of these labels.
              </p>
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Current labels:
                  </label>
                  {!localWatchAll && (
                    <div className="flex gap-3 text-xs">
                      <button type="button" onClick={handleSelectAllLabels} className="text-purple-600 hover:text-purple-700 font-medium dark:text-purple-400 dark:hover:text-purple-300">Select All</button>
                      <button type="button" onClick={handleClearAllLabels} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300">Clear All</button>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {localLabels.length === 0 ? (
                    <span className="text-sm text-slate-400 italic">No labels selected</span>
                  ) : (
                    localLabels.map(label => (
                      <span key={label} className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 dark:border-purple-800/50 dark:bg-purple-900/20 dark:text-purple-300">
                        {label}
                        <button 
                          onClick={() => handleRemoveLabel(label)}
                          className="text-purple-400 hover:text-purple-900 dark:text-purple-500 dark:hover:text-purple-200 ml-1 rounded-full focus:outline-none"
                        >
                          &times;
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Add custom label:
                </label>
                <form onSubmit={handleCustomLabelAdd} className="flex gap-2">
                  <input
                    type="text"
                    className="block max-w-sm flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder-slate-400 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                    placeholder="Search or enter GitHub label..."
                    value={customLabel}
                    onChange={(e) => setCustomLabel(e.target.value)}
                  />
                  <Button type="submit" variant="default" size="sm">
                    Add
                  </Button>
                </form>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Suggested labels:
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_LABELS.filter(l => !localLabels.includes(l)).map(label => (
                    <button
                      key={label}
                      onClick={() => handleAddLabel(label)}
                      className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
                    >
                      {label}
                    </button>
                  ))}
                  {PRESET_LABELS.filter(l => !localLabels.includes(l)).length === 0 && (
                    <span className="text-sm text-slate-400 italic">All suggested labels are currently watched.</span>
                  )}
                </div>
              </div>

            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <Button variant="primary" onClick={handleSaveChanges} disabled={isSavingSettings}>
                {isSavingSettings ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        )}

      </div>
      
      <Modal
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        title="Remove repository from GIF?"
      >
        <div className="space-y-6">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            This will stop GIF from monitoring this repository and remove it from your watchlist. 
            <strong> Your GitHub repository will not be deleted.</strong>
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setShowConfirmDelete(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button 
              variant="default"
              className="bg-red-600 hover:bg-red-700 text-white dark:hover:bg-red-700 dark:bg-red-600 border-transparent shadow-none"
              onClick={confirmDelete} 
              disabled={isDeleting}
            >
              {isDeleting ? 'Removing...' : 'Remove Repository'}
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default PublicRepositoryDetail;
