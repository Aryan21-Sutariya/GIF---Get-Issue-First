import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookMarked, Eye, CircleDot, Lock, X } from 'lucide-react';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useRepositories } from '../../context/RepositoryContext';
import { useToast } from '../ui/Toast';

const RepositoryCard = ({ repo }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { deletePublicRepo, deletePrivateRepo } = useRepositories();
  const toast = useToast();

  const handleRemoveClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (repo.isPrivate) {
        await deletePrivateRepo(repo.id);
      } else {
        await deletePublicRepo(repo.id);
      }
      toast.success('Repository removed from your GIF watchlist.');
      // The context will automatically update the list, which will unmount this card.
    } catch (err) {
      toast.error("We couldn't remove this repository. Please try again.");
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <Link 
        to={`/${repo.isPrivate ? 'private' : 'public'}/${repo.name}`}
        className="group block rounded-lg border border-slate-200 bg-white p-5 transition-all outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:border-transparent cursor-pointer hover:border-purple-300 hover:shadow-md hover:shadow-purple-100/50 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-purple-700 dark:hover:shadow-purple-900/20"
      >
        <div className="mb-2 flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            {repo.isPrivate ? (
              <Lock className="mt-1 h-5 w-5 shrink-0 text-slate-400 dark:text-slate-500" />
            ) : (
              <BookMarked className="mt-1 h-5 w-5 shrink-0 text-slate-400 dark:text-slate-500" />
            )}
            <h3 className="break-words text-lg font-semibold text-purple-600 hover:underline dark:text-purple-400">
              <span>{repo.name}</span>
            </h3>
            {repo.isPrivate && (
              <span className="rounded-full border border-slate-200 px-2 py-0.5 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
                Private
              </span>
            )}
          </div>
          <button
            onClick={handleRemoveClick}
            aria-label="Remove repository"
            title="Remove repository"
            className="p-1 rounded text-slate-400 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <p className="mb-4 flex-grow text-sm text-slate-600 dark:text-slate-400">
          {repo.description}
        </p>
        
        <div className="mb-4 flex flex-wrap gap-2">
          {repo.labels.map((label) => (
            <Badge key={label} className="bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50">
              {label}
            </Badge>
          ))}
        </div>
        
        <div className="flex items-center gap-5 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <CircleDot className={`h-4 w-4 ${repo.newIssues > 0 ? 'text-purple-500' : 'text-slate-400'}`} />
            <span className={repo.newIssues > 0 ? 'font-medium text-slate-700 dark:text-slate-300' : ''}>
              {repo.newIssues} {repo.newIssues === 1 ? 'new issue' : 'new issues'}
            </span>
          </div>
          
          {repo.language && (
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-purple-500" />
              <span>{repo.language}</span>
            </div>
          )}
          
          <div className="flex items-center gap-1.5 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
            <Eye className="h-4 w-4" />
            <span>{repo.watchedIssues}</span>
          </div>
        </div>
      </Link>

      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Remove repository from GIF?"
      >
        <div className="space-y-6">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            This will stop GIF from monitoring this repository and remove it from your watchlist. 
            <strong> Your GitHub repository will not be deleted.</strong>
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setShowConfirm(false)} disabled={isDeleting}>
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
    </>
  );
};

export default RepositoryCard;
