import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import PublicRepositories from '../pages/PublicRepositories';
import PrivateRepositories from '../pages/PrivateRepositories';
import PublicRepositoryDetails from '../pages/PublicRepositoryDetails';
import PrivateRepositoryDetails from '../pages/PrivateRepositoryDetails';
import Account from '../pages/Account';
import Notifications from '../pages/Notifications';
import Landing from '../pages/Landing';
import ProtectedRoute from './ProtectedRoute';
import { AuthContext } from '../context/AuthContext';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route element={<DashboardLayout />}>
        <Route path="public" element={<ProtectedRoute><PublicRepositories /></ProtectedRoute>} />
        <Route path="public/:owner/:repo" element={<ProtectedRoute><PublicRepositoryDetails /></ProtectedRoute>} />
        <Route path="private" element={<ProtectedRoute><PrivateRepositories /></ProtectedRoute>} />
        <Route path="private/:owner/:repo" element={<ProtectedRoute><PrivateRepositoryDetails /></ProtectedRoute>} />
        <Route path="account" element={<Account />} />
        <Route path="notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
