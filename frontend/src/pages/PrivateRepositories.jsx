import React, { useState } from 'react';
import TopBar from '../components/layout/TopBar';
import { RepositorySearch } from '../components/repositories/RepositorySearch';
import { RepositoryGrid } from '../components/repositories/RepositoryGrid';
import RepositoryCard from '../components/repositories/RepositoryCard';
import AddRepositoryModal from '../components/repositories/AddRepositoryModal';
import { useRepositories } from '../context/RepositoryContext';

const PrivateRepositories = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { privateRepos, loadingRepos, addPrivateRepo } = useRepositories();

  const filteredRepos = privateRepos.filter(repo => 
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    repo.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Private Repositories" onAddClick={() => setIsModalOpen(true)} />
      
      <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        <div>
          <h2 className="text-2xl font-semibold mb-2 flex items-center gap-2">
            Private Repositories
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Securely monitor issues in your private organizations and personal repositories.
          </p>
        </div>

        <RepositorySearch 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search private repositories..."
        />

        <RepositoryGrid>
          {filteredRepos.map(repo => (
            <RepositoryCard key={repo.id} repo={repo} />
          ))}
        </RepositoryGrid>

        {loadingRepos ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
            <h3 className="text-lg font-medium text-slate-500 dark:text-slate-400">Loading repositories...</h3>
          </div>
        ) : filteredRepos.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">No repositories found</h3>
            <p className="text-slate-500 mt-2">Try adjusting your search query.</p>
          </div>
        ) : null}
      </div>
      
      <AddRepositoryModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isPrivate={true}
        onAdd={addPrivateRepo}
      />
    </div>
  );
};

export default PrivateRepositories;
