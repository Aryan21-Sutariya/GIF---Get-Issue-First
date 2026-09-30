import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { AuthContext } from './AuthContext';
import { privateRepos as initialPrivateRepos } from '../data/mockRepositories';

const RepositoryContext = createContext();

export const useRepositories = () => useContext(RepositoryContext);

export const RepositoryProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [publicRepos, setPublicRepos] = useState([]);
  const [privateRepos, setPrivateRepos] = useState([]);
  const [loadingRepos, setLoadingRepos] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (user) {
      setLoadingRepos(true);
      Promise.all([
        api.getPublicRepositories().then(data => { if (isMounted) setPublicRepos(data); }).catch(console.error),
        api.getPrivateRepositories().then(data => { if (isMounted) setPrivateRepos(data); }).catch(console.error)
      ]).finally(() => {
        if (isMounted) setLoadingRepos(false);
      });
    } else {
      if (isMounted) {
        setPublicRepos([]);
        setPrivateRepos([]);
        setLoadingRepos(false);
      }
    }
    return () => { isMounted = false; };
  }, [user]);

  const addPublicRepo = async (url, selectedLabels, watchAllIssues = false) => {
    await api.addPublicRepository(url, selectedLabels, watchAllIssues);
    const updated = await api.getPublicRepositories();
    setPublicRepos(updated);
  };

  const addPrivateRepo = async (url, selectedLabels, watchAllIssues = false) => {
    await api.addPrivateRepository(url, selectedLabels, watchAllIssues);
    const updated = await api.getPrivateRepositories();
    setPrivateRepos(updated);
  };

  const updatePublicRepoLabels = (name, labels, watchAllIssues) => {
    setPublicRepos(prev => prev.map(r => r.name === name ? { ...r, labels, ...(watchAllIssues !== undefined ? { watchAllIssues } : {}) } : r));
  };

  const deletePublicRepo = async (id) => {
    await api.deletePublicRepository(id);
    const updated = await api.getPublicRepositories();
    setPublicRepos(updated);
  };

  const updatePrivateRepoLabels = (name, labels, watchAllIssues) => {
    setPrivateRepos(prev => prev.map(r => r.name === name ? { ...r, labels, ...(watchAllIssues !== undefined ? { watchAllIssues } : {}) } : r));
  };

  const deletePrivateRepo = async (id) => {
    await api.deletePrivateRepository(id);
    const updated = await api.getPrivateRepositories();
    setPrivateRepos(updated);
  };

  return (
    <RepositoryContext.Provider value={{
      publicRepos,
      privateRepos,
      loadingRepos,
      addPublicRepo,
      addPrivateRepo,
      updatePublicRepoLabels,
      updatePrivateRepoLabels,
      deletePublicRepo,
      deletePrivateRepo
    }}>
      {children}
    </RepositoryContext.Provider>
  );
};
