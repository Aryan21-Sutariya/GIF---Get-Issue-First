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

  useEffect(() => {
    let isMounted = true;
    if (user) {
      api.getPublicRepositories().then(data => {
        if (isMounted) setPublicRepos(data);
      }).catch(console.error);

      api.getPrivateRepositories().then(data => {
        if (isMounted) setPrivateRepos(data);
      }).catch(console.error);
    } else {
      if (isMounted) {
        setPublicRepos([]);
        setPrivateRepos([]);
      }
    }
    return () => { isMounted = false; };
  }, [user]);

  const addPublicRepo = async (url, selectedLabels) => {
    await api.addPublicRepository(url, selectedLabels);
    const updated = await api.getPublicRepositories();
    setPublicRepos(updated);
  };

  const addPrivateRepo = async (url, selectedLabels) => {
    await api.addPrivateRepository(url, selectedLabels);
    const updated = await api.getPrivateRepositories();
    setPrivateRepos(updated);
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
