import React, { useState } from 'react';
import TopBar from '../components/layout/TopBar';
import { RepositorySearch } from '../components/repositories/RepositorySearch';
import { RepositoryGrid } from '../components/repositories/RepositoryGrid';
import RepositoryCard from '../components/repositories/RepositoryCard';
import AddRepositoryModal from '../components/repositories/AddRepositoryModal';
import { useRepositories } from '../context/RepositoryContext';

const PublicRepositories = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { publicRepos, addPublicRepo } = useRepositories();

  const filteredRepos = publicRepos.filter(repo => 
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    repo.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Public Repositories" onAddClick={() => setIsModalOpen(true)} />
      
      <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Public Repositories</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Monitor public GitHub repositories and discover matching issues quickly.
          </p>
        </div>

        <RepositorySearch 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <RepositoryGrid>
          {filteredRepos.map(repo => (
            <RepositoryCard key={repo.id} repo={repo} />
          ))}
        </RepositoryGrid>

        {filteredRepos.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">No repositories found</h3>
            <p className="text-slate-500 mt-2">Try adjusting your search query.</p>
          </div>
        )}
      </div>

      <AddRepositoryModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isPrivate={false}
        onAdd={addPublicRepo}
      />
    </div>
  );
};

export default PublicRepositories;
