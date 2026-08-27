import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

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
    component: LoginView,
    meta: { guestOnly: true }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: DashboardView,
    meta: { requiresAuth: true }
  },
  {
    path: '/expenses',
    name: 'ExpenseList',
    component: ExpenseListView,
    meta: { requiresAuth: true }
  },
  {
    path: '/expenses/create',
    name: 'ExpenseCreate',
    component: ExpenseFormView,
    meta: { requiresAuth: true, requiresStaffOrAdmin: true }
  },
  {
    path: '/expenses/:id/edit',
    name: 'ExpenseEdit',
    component: ExpenseFormView,
    meta: { requiresAuth: true, requiresStaffOrAdmin: true }
  },
  {
    path: '/settings/categories',
    name: 'CategoryManage',
    component: CategoryManageView,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/reports',
    name: 'ReportHistory',
    component: ReportHistoryView,
    meta: { requiresAuth: true }
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

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  if (!authStore.user && !authStore.loading) {
    await authStore.checkAuth();
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'Login' });
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return next({ name: 'Dashboard' });
  }

  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return next({ name: 'Dashboard' });
  }

  if (to.meta.requiresStaffOrAdmin && !authStore.canWrite) {
    return next({ name: 'Dashboard' });
  }

  next();
});

export default router;
