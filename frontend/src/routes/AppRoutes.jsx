import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import PublicRepositories from '../pages/PublicRepositories';
import PrivateRepositories from '../pages/PrivateRepositories';
import PublicRepositoryDetails from '../pages/PublicRepositoryDetails';
import PrivateRepositoryDetails from '../pages/PrivateRepositoryDetails';
import Account from '../pages/Account';
import Notifications from '../pages/Notifications';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Navigate to="/public" replace />} />
        <Route path="public" element={<PublicRepositories />} />
        <Route path="public/:owner/:repo" element={<PublicRepositoryDetails />} />
        <Route path="private" element={<PrivateRepositories />} />
        <Route path="private/:owner/:repo" element={<PrivateRepositoryDetails />} />
        <Route path="account" element={<Account />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
