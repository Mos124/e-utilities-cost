import { defineStore } from 'pinia';
import api from '../services/api';

export const useCategoryStore = defineStore('category', {
  state: () => ({
    expenseCategories: [],
    budgetCategories: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchExpenseCategories() {
      try {
        const res = await api.get('/expense-categories');
        this.expenseCategories = res.data;
      } catch (err) {
        console.error('Fetch expense categories error:', err);
      }
    },

    async fetchBudgetCategories() {
      try {
        const res = await api.get('/budget-categories');
        this.budgetCategories = res.data;
      } catch (err) {
        console.error('Fetch budget categories error:', err);
      }
    },

    async fetchAllCategories() {
      this.loading = true;
      try {
        await Promise.all([this.fetchExpenseCategories(), this.fetchBudgetCategories()]);
      } finally {
        this.loading = false;
      }
    },

    async createExpenseCategory(data) {
      const res = await api.post('/expense-categories', data);
      await this.fetchExpenseCategories();
      return res.data;
    },

    async updateExpenseCategory(id, data) {
      const res = await api.put(`/expense-categories/${id}`, data);
      await this.fetchExpenseCategories();
      return res.data;
    },

    async deleteExpenseCategory(id) {
      await api.delete(`/expense-categories/${id}`);
      await this.fetchExpenseCategories();
    },

    async createBudgetCategory(data) {
      const res = await api.post('/budget-categories', data);
      await this.fetchBudgetCategories();
      return res.data;
    },

    async updateBudgetCategory(id, data) {
      const res = await api.put(`/budget-categories/${id}`, data);
      await this.fetchBudgetCategories();
      return res.data;
    },

    async deleteBudgetCategory(id) {
      await api.delete(`/budget-categories/${id}`);
      await this.fetchBudgetCategories();
    }
  }
});
