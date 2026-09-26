import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Info, Plus } from 'lucide-react';
import { api } from '../../services/api';

const AddRepositoryModal = ({ isOpen, onClose, isPrivate, onAdd }) => {
  const [step, setStep] = useState(1);
  const [url, setUrl] = useState('');
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [customLabel, setCustomLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [repoData, setRepoData] = useState(null);
  const [availableLabels, setAvailableLabels] = useState([]);
  
  React.useEffect(() => {
    if (isOpen) {
      setStep(1);
      setUrl('');
      setSelectedLabels([]);
      setCustomLabel('');
      setError(null);
      setRepoData(null);
      setAvailableLabels([]);
    }
  }, [isOpen]);

  const handleNext = async () => {
    if (isPrivate) {
      if (url.trim().length > 0) setStep(2);
      return; 
    }
    
    if (url.trim().length === 0) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await api.lookupPublicRepository(url);
      setRepoData(data);
      setAvailableLabels(data.labels.length > 0 ? data.labels : ['good first issue', 'help wanted']);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to lookup repository.');
    } finally {
      setLoading(false);
    }
  };

  const toggleLabel = (label) => {
    setSelectedLabels(prev => 
      prev.includes(label) 
        ? prev.filter(l => l !== label) 
        : [...prev, label]
    );
  };

  const addCustomLabel = (e) => {
    e.preventDefault();
    if (customLabel.trim() && !selectedLabels.includes(customLabel.trim())) {
      setSelectedLabels(prev => [...prev, customLabel.trim()]);
      setCustomLabel('');
    }
  };

  const handleStartWatching = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isPrivate) {
         onAdd({ id: Date.now().toString(), name: 'private/fallback', description: 'Mock', language: 'Unknown', watchedIssues: 0, newIssues: 0, labels: selectedLabels, isPrivate: true });
         alert(`Repository added to your watchlist.`);
         onClose();
         return;
      }
      
      await onAdd(url, selectedLabels);
      alert(`Repository added to your watchlist.`);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save repository.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Add ${isPrivate ? 'Private' : 'Public'} Repository`}
    >
      {step === 1 && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Add a {isPrivate ? 'private ' : 'public '} 
            GitHub repository to watch for new matching issues.
          </p>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Repository URL
            </label>
            <input
              type="text"
              className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder-slate-400 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              placeholder="https://github.com/owner/repository"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleNext(); }}
              disabled={loading}
            />
            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
          </div>
          
          <div className="mt-8 pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button variant="primary" onClick={handleNext} disabled={!url.trim() || loading}>
              {loading ? 'Verifying...' : 'Continue'}
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          {isPrivate && (
            <div className="flex gap-3 rounded-md bg-amber-50 dark:bg-amber-500/10 p-4 border border-amber-200 dark:border-amber-900/50">
              <Info className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0" />
              <p className="text-sm text-amber-800 dark:text-amber-400">
                <strong>Authorization Required:</strong> Private repository access will require GitHub authorization.
                This is a UI placeholder and no actual OAuth will occur.
              </p>
            </div>
          )}

          <div className="text-center bg-slate-50 dark:bg-slate-800/50 rounded-lg py-3 px-4 mb-4 border border-slate-100 dark:border-slate-800">
             <h4 className="font-medium text-purple-600 dark:text-purple-400 break-words">
                {repoData ? repoData.fullName : 'unknown/repository'}
             </h4>
             {repoData && repoData.description && (
               <p className="text-xs text-slate-500 mt-1">{repoData.description}</p>
             )}
          </div>

          <div>
            <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
              Choose which issue labels you want to be notified about.
            </h4>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {availableLabels.map(label => {
                const isSelected = selectedLabels.includes(label);
                return (
                  <button
                    key={label}
                    onClick={() => toggleLabel(label)}
                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors ${
                      isSelected 
                        ? 'border-purple-200 bg-purple-100 text-purple-800 dark:border-purple-800 dark:bg-purple-900/40 dark:text-purple-300' 
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Custom label input
            </label>
            <form onSubmit={addCustomLabel} className="flex gap-2">
              <input
                type="text"
                className="block flex-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm placeholder-slate-400 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                placeholder="e.g. priority/high"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
              />
              <Button type="submit" variant="default" size="sm" className="gap-1 px-3">
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </form>
            {error && <p className="text-red-500 text-xs mt-3">{error}</p>}
          </div>

          <div className="mt-8 pt-4 flex justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setStep(1)} disabled={loading}>Back</Button>
            <Button variant="primary" onClick={handleStartWatching} disabled={loading || selectedLabels.length === 0}>
              {loading ? 'Saving...' : 'Start Watching'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default AddRepositoryModal;
