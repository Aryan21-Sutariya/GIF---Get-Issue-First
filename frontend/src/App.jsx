import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { RepositoryProvider } from './context/RepositoryContext';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <RepositoryProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </RepositoryProvider>
  );
}

export default App;
