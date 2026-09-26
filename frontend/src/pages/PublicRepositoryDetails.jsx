import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, ExternalLink, Star } from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import GithubIcon from '../components/ui/GithubIcon';
import { useRepositories } from '../context/RepositoryContext';
import { api } from '../services/api';

const PRESET_LABELS = [
  'bug', 'documentation', 'enhancement', 'beginner', 
  'bounty', 'help wanted', 'good first issue'
];

const PublicRepositoryDetail = () => {
  const { owner, repo } = useParams();
  const repoName = `${owner}/${repo}`;
  const [activeTab, setActiveTab] = useState('issues');
  const { publicRepos, updatePublicRepoLabels } = useRepositories();
  const [customLabel, setCustomLabel] = useState('');
  
  const [issues, setIssues] = useState([]);
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [issuesError, setIssuesError] = useState(null);
  
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const repository = publicRepos.find(r => r.name === repoName) || {
    name: repoName,
    description: 'A repository not found natively in contexts.',
    language: 'Unknown',
    stars: '~',
    labels: []
  };

  const [localLabels, setLocalLabels] = useState(repository.labels || []);

  useEffect(() => {
    if (repository.labels) {
      setLocalLabels(repository.labels);
    }
  }, [repository.labels]);

  useEffect(() => {
    let isMounted = true;
    if (activeTab === 'issues' && repository && repository.id) {
       if (repository.labels.length === 0) {
         if (isMounted) {
           setIssues([]);
           setIssuesError(null);
         }
         return;
       }
       setLoadingIssues(true);
       setIssuesError(null);
       api.fetchGithubIssuesAction(repository.id)
         .then(data => {
           if (isMounted) setIssues(data.issues || []);
         })
         .catch(err => {
           if (isMounted) setIssuesError(err.message);
         })
         .finally(() => {
           if (isMounted) setLoadingIssues(false);
         });
    }
    return () => { isMounted = false; };
  }, [activeTab, repository.id, repository.labels]); // re-fetch if labels change (simulated properly).

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
      await api.updatePublicRepositoryLabels(repository.id, localLabels);
      updatePublicRepoLabels(repoName, localLabels);
      alert('Settings successfully updated and persisted to Database!');
    } catch (err) {
      alert('Failed to save settings: ' + err.message);
    } finally {
      setIsSavingSettings(false);
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
                </div>
              </div>
            </div>
            
            <a 
              href={`https://github.com/${repository.name}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="shrink-0"
            >
              <Button variant="default" className="gap-2 w-full sm:w-auto">
                Open on GitHub
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
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
                New Matching Issues
              </h2>
            </div>
            
            <div className="space-y-4">
              {loadingIssues ? (
                <div className="text-center py-12 px-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                  <p className="text-slate-500 dark:text-slate-400">Loading matching issues...</p>
                </div>
              ) : issuesError ? (
                <div className="text-center py-12 px-4 border border-red-300 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 rounded-lg">
                  <p className="text-red-500 dark:text-red-400 font-medium">Error: {issuesError}</p>
                </div>
              ) : issues.length > 0 ? (
                issues.map((issue) => (
                  <div 
                    key={issue.id} 
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 hover:border-purple-300 dark:hover:border-purple-500 transition-colors shadow-sm"
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
              ) : repository.labels.length === 0 ? (
                <div className="text-center py-12 px-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                   <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">No labels selected</h3>
                   <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
                    Please select at least one label in Repository Settings to start watching matching issues.
                  </p>
                  <Button variant="primary" onClick={() => setActiveTab('settings')}>
                    Go to Settings
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12 px-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                   <p className="text-slate-500 dark:text-slate-400">
                    No new matching issues found for <span className="font-medium text-slate-700 dark:text-slate-300">{repoName}</span>.
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
            
            <div className="mt-8 mb-6">
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                Issue notification labels
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">
                You're notified when a newly created issue contains any of these labels.
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Current labels:
                </label>
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
    </div>
  );
};

export default PublicRepositoryDetail;
