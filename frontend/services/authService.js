import { api } from './api';

export const authService = {
  async login(email, password) {
    const data = await api.post('/auth/login', { email, password });
    // backend returns { token, user }
    api.setToken(data.token);
    return data;
  },

  async register(payload) {
    const data = await api.post('/auth/register', payload);
    api.setToken(data.token);
    return data;
  },

  logout() {
    api.setToken(null);
    localStorage.removeItem('dca_token');
    localStorage.removeItem('dca_user');
  }
};
