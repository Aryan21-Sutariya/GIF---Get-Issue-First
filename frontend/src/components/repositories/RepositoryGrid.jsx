import React from 'react';

export const RepositoryGrid = ({ children }) => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
      {children}
    </div>
  );
};
