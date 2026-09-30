// Production-ready API communication relies strictly on ENV definitions
export const API_URL = import.meta.env.VITE_API_URL;

export const api = {
  getRepositories: async () => [],
  getIssues: async () => [],
  getNotifications: async () => {
    const response = await fetch(`${API_URL}/api/notifications`, { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch notifications');
    return response.json();
  },
  markNotificationAsRead: async (id) => {
    const response = await fetch(`${API_URL}/api/notifications/${id}/read`, {
      method: 'PATCH',
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to mark notification as read');
    return response.json();
  },
  dismissNotification: async (id) => {
    const response = await fetch(`${API_URL}/api/notifications/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to dismiss notification');
    return response.json();
  },
  checkBackendHealth: async () => {
    try {
      const response = await fetch(`${API_URL}/api/health`, { credentials: 'omit' });
      if (!response.ok) {
        return { success: false, message: 'Unable to connect to GIF backend.' };
      }
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Unable to connect to GIF backend.' };
    }
  },
  getMe: async () => {
    const res = await fetch(`${API_URL}/api/auth/me`, { credentials: 'include' });
    if (!res.ok) throw new Error('Unauthenticated');
    return res.json();
  },
  logout: async () => {
    const res = await fetch(`${API_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    return res.json();
  },
  lookupPublicRepository: async (url) => {
    const res = await fetch(`${API_URL}/api/repositories/public/lookup?url=${encodeURIComponent(url)}`, { credentials: 'include' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to lookup repository');
    }
    return res.json();
  },
  addPublicRepository: async (url, selectedLabels, watchAllIssues = false) => {
    const res = await fetch(`${API_URL}/api/repositories/public`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ url, selectedLabels, watchAllIssues })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add repository');
    }
    return res.json();
  },
  getPublicRepositories: async () => {
    const res = await fetch(`${API_URL}/api/repositories/public`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch public repositories');
    return res.json();
  },
  updatePublicRepositoryLabels: async (repositoryId, labels, watchAllIssues = false) => {
    const res = await fetch(`${API_URL}/api/repositories/public/${repositoryId}/labels`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ labels, watchAllIssues })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update labels');
    }
    return res.json();
  },
  deletePublicRepository: async (repositoryId) => {
    const res = await fetch(`${API_URL}/api/repositories/public/${repositoryId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete repository');
    }
    return res.json();
  },
  fetchGithubIssuesAction: async (repositoryId) => {
    const res = await fetch(`${API_URL}/api/repositories/public/${repositoryId}/issues`, { credentials: 'include' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to fetch issues');
    }
    return res.json();
  },
  
  // ======================
  // PRIVATE ENDPOINTS
  // ======================
  
  lookupPrivateRepository: async (url) => {
    const res = await fetch(`${API_URL}/api/repositories/private/lookup?url=${encodeURIComponent(url)}`, { credentials: 'include' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to lookup repository');
    }
    return res.json();
  },
  addPrivateRepository: async (url, selectedLabels, watchAllIssues = false) => {
    const res = await fetch(`${API_URL}/api/repositories/private`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ url, selectedLabels, watchAllIssues })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add repository');
    }
    return res.json();
  },
  getPrivateRepositories: async () => {
    const res = await fetch(`${API_URL}/api/repositories/private`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch private repositories');
    return res.json();
  },
  updatePrivateRepositoryLabels: async (repositoryId, labels, watchAllIssues = false) => {
    const res = await fetch(`${API_URL}/api/repositories/private/${repositoryId}/labels`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ labels, watchAllIssues })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update labels');
    }
    return res.json();
  },
  fetchPrivateGithubIssuesAction: async (repositoryId) => {
    const res = await fetch(`${API_URL}/api/repositories/private/${repositoryId}/issues`, { credentials: 'include' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to fetch issues');
    }
    return res.json();
  },
  deletePrivateRepository: async (repositoryId) => {
    const res = await fetch(`${API_URL}/api/repositories/private/${repositoryId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete repository');
    }
    return res.json();
  }
};
