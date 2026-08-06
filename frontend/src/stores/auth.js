import { defineStore } from 'pinia';
import { authService } from '../services/auth.service';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null
  }),

  getters: {
    isAdmin: (state) => state.user?.role === 'admin'
  },

  actions: {
    async login(username, password) {
      this.loading = true;
      this.error = null;
      try {
        const data = await authService.login(username, password);
        this.user = data.user;
        this.isAuthenticated = true;
        return data;
      } catch (err) {
        this.error = err.response?.data?.message || 'การเข้าสู่ระบบล้มเหลว';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      try {
        await authService.logout();
      } catch (err) {
        console.error('Logout error:', err);
      } finally {
        this.user = null;
        this.isAuthenticated = false;
      }
    },

    async checkAuth() {
      this.loading = true;
      try {
        const refreshData = await authService.refreshToken();
        if (refreshData && refreshData.user) {
          this.user = refreshData.user;
          this.isAuthenticated = true;
        }
      } catch (err) {
        this.user = null;
        this.isAuthenticated = false;
      } finally {
        this.loading = false;
      }
    }
  }
});
