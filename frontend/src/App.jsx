import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { RepositoryProvider } from './context/RepositoryContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';

function App() {
  return (
    <AuthProvider>
      <RepositoryProvider>
        <ToastProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </RepositoryProvider>
    </AuthProvider>
  );
}

export default App;
