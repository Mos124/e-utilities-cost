import { defineStore } from 'pinia';
import api from '../services/api';

export const useExpenseStore = defineStore('expense', {
  state: () => ({
    expenses: [],
    total: 0,
    page: 1,
    totalPages: 1,
    loading: false,
    dashboardSummary: null,
    dashboardByCategory: [],
    dashboardByBudget: [],
    compareData: null,
    filters: {
      year: new Date().getFullYear(),
      month: '',
      expense_category_id: '',
      budget_category_id: '',
      search: ''
    }
  }),

  actions: {
    async fetchExpenses(page = 1) {
      this.loading = true;
      this.page = page;
      try {
        const params = {
          page: this.page,
          limit: 15,
          year: this.filters.year || undefined,
          month: this.filters.month || undefined,
          expense_category_id: this.filters.expense_category_id || undefined,
          budget_category_id: this.filters.budget_category_id || undefined,
          search: this.filters.search || undefined
        };

        const res = await api.get('/expenses', { params });
        this.expenses = res.data.data;
        this.total = res.data.total;
        this.totalPages = res.data.totalPages;
      } catch (err) {
        console.error('Fetch expenses error:', err);
      } finally {
        this.loading = false;
      }
    },

    async fetchDashboardSummary(year) {
      try {
        const targetYear = year || this.filters.year;
        const [sumRes, catRes, budRes] = await Promise.all([
          api.get(`/dashboard/summary?year=${targetYear}`),
          api.get(`/dashboard/by-category?year=${targetYear}`),
          api.get(`/dashboard/by-budget?year=${targetYear}`)
        ]);

        this.dashboardSummary = sumRes.data;
        this.dashboardByCategory = catRes.data;
        this.dashboardByBudget = budRes.data;
      } catch (err) {
        console.error('Fetch dashboard summary error:', err);
      }
    },

    async fetchCompareData(year1, year2) {
      try {
        const res = await api.get(`/dashboard/compare?year1=${year1}&year2=${year2}`);
        this.compareData = res.data;
      } catch (err) {
        console.error('Fetch compare data error:', err);
      }
    },

    async createExpense(data) {
      const res = await api.post('/expenses', data);
      await this.fetchExpenses(1);
      return res.data;
    },

    async updateExpense(id, data) {
      const res = await api.put(`/expenses/${id}`, data);
      await this.fetchExpenses(this.page);
      return res.data;
    },

    async deleteExpense(id) {
      await api.delete(`/expenses/${id}`);
      await this.fetchExpenses(this.page);
    }
  }
});
