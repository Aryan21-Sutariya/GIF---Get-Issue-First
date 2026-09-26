import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { Info, Plus, X } from 'lucide-react';

const PRESET_LABELS = [
  'good first issue', 'help wanted', 'bug', 
  'documentation', 'enhancement', 'easy', 
  'beginner', 'bounty'
];

const parseRepoName = (url) => {
  try {
    const parsed = new URL(url);
    const pathParts = parsed.pathname.split('/').filter(Boolean);
    if (pathParts.length >= 2) {
      return `${pathParts[0]}/${pathParts[1]}`;
    }
    return 'unknown/repository';
  } catch (e) {
    const parts = url.split('/').filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
    }
    return 'unknown/repository';
  }
};

const AddRepositoryModal = ({ isOpen, onClose, isPrivate, onAdd }) => {
  const [step, setStep] = useState(1);
  const [url, setUrl] = useState('');
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [customLabel, setCustomLabel] = useState('');
  
  // reset on open/close
  React.useEffect(() => {
    if (isOpen) {
      setStep(1);
      setUrl('');
      setSelectedLabels(['good first issue', 'help wanted']);
      setCustomLabel('');
    }
  }, [isOpen]);

  const handleNext = () => {
    if (url.trim().length > 0) {
      setStep(2);
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

  const handleStartWatching = () => {
    const name = parseRepoName(url);
    const newRepo = {
      id: `${name}-${Date.now()}`,
      name: name,
      description: `Automatically added ${isPrivate ? 'private' : 'public'} repository watching for specific labels.`,
      language: 'Unknown',
      watchedIssues: 0,
      newIssues: 0,
      labels: selectedLabels,
      isPrivate,
    };
    onAdd(newRepo);
    
    // Simulate toast
    alert(`Repository added to your watchlist.`);
    onClose();
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
            />
          </div>
          
          <div className="mt-8 pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={handleNext} disabled={!url.trim()}>
              Continue
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
             <h4 className="font-medium text-purple-600 dark:text-purple-400 break-words">{parseRepoName(url)}</h4>
          </div>

          <div>
            <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
              Choose which issue labels you want to be notified about.
            </h4>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {PRESET_LABELS.map(label => {
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
          </div>

          <div className="mt-8 pt-4 flex justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
            <Button variant="primary" onClick={handleStartWatching}>
              Start Watching
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default AddRepositoryModal;
