import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { RepositoryProvider } from './context/RepositoryContext';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <RepositoryProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </RepositoryProvider>
    </AuthProvider>
  );
}

export default App;
