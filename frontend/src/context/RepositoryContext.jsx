import React, { createContext, useContext, useState } from 'react';
import { publicRepos as initialPublicRepos, privateRepos as initialPrivateRepos } from '../data/mockRepositories';

const RepositoryContext = createContext();

export const useRepositories = () => useContext(RepositoryContext);

export const RepositoryProvider = ({ children }) => {
  const [publicRepos, setPublicRepos] = useState(initialPublicRepos);
  const [privateRepos, setPrivateRepos] = useState(initialPrivateRepos);

  const addPublicRepo = (repo) => {
    setPublicRepos([repo, ...publicRepos]);
  };

  const addPrivateRepo = (repo) => {
    setPrivateRepos([repo, ...privateRepos]);
  };

  const updatePublicRepoLabels = (name, labels) => {
    setPublicRepos(prev => prev.map(r => r.name === name ? { ...r, labels } : r));
  };

  const updatePrivateRepoLabels = (name, labels) => {
    setPrivateRepos(prev => prev.map(r => r.name === name ? { ...r, labels } : r));
  };

  return (
    <RepositoryContext.Provider value={{
      publicRepos,
      privateRepos,
      addPublicRepo,
      addPrivateRepo,
      updatePublicRepoLabels,
      updatePrivateRepoLabels
    }}>
      {children}
    </RepositoryContext.Provider>
  );
};
