import { createRouter, createWebHistory } from 'vue-router';

import LoginView from '../views/LoginView.vue';
import DashboardView from '../views/DashboardView.vue';
import ExpenseListView from '../views/ExpenseListView.vue';
import ExpenseFormView from '../views/ExpenseFormView.vue';
import CategoryManageView from '../views/CategoryManageView.vue';
import ReportHistoryView from '../views/ReportHistoryView.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/',
    name: 'Dashboard',
    component: DashboardView
  },
  {
    path: '/expenses',
    name: 'ExpenseList',
    component: ExpenseListView
  },
  {
    path: '/expenses/create',
    name: 'ExpenseCreate',
    component: ExpenseFormView
  },
  {
    path: '/expenses/:id/edit',
    name: 'ExpenseEdit',
    component: ExpenseFormView
  },
  {
    path: '/settings/categories',
    name: 'CategoryManage',
    component: CategoryManageView
  },
  {
    path: '/reports',
    name: 'ReportHistory',
    component: ReportHistoryView
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});



export default router;
