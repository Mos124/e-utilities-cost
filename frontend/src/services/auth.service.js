import api, { setAccessToken } from './api';

export const authService = {
  async login(username, password) {
    const res = await api.post('/auth/login', { username, password });
    if (res.data.accessToken) {
      setAccessToken(res.data.accessToken);
    }
    return res.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      setAccessToken(null);
    }
  },

  async getMe() {
    const res = await api.get('/auth/me');
    return res.data;
  },

  async refreshToken() {
    const res = await api.post('/auth/refresh');
    if (res.data.accessToken) {
      setAccessToken(res.data.accessToken);
    }
    return res.data;
  }
};
