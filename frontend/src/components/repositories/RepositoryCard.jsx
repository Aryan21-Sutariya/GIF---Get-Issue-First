import React from 'react';
import { Link } from 'react-router-dom';
import { BookMarked, Eye, CircleDot, Lock } from 'lucide-react';
import Badge from '../ui/Badge';

const RepositoryCard = ({ repo }) => {
  return (
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
  );
};

export default RepositoryCard;
