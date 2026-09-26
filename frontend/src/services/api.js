// Placeholder for future backend API communication
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const api = {
  getRepositories: async () => [],
  getIssues: async () => [],
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
  }
};
