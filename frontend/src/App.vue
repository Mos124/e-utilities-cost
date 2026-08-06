<template>
  <div class="min-h-screen bg-slate-900">
    <!-- Sidebar + Main layout for authenticated pages -->
    <template v-if="authStore.isAuthenticated">
      <div class="flex h-screen overflow-hidden">
        <!-- Sidebar -->
        <aside
          :class="['flex-shrink-0 w-64 glass-panel border-r border-slate-700/50 flex flex-col transition-all duration-300 z-20',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
            'fixed md:static h-full']"
        >
          <!-- Logo -->
          <div class="px-5 py-5 border-b border-slate-700/50">
            <div class="flex items-center space-x-3">
              <div class="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 rounded-xl shadow-lg shadow-blue-500/30">
                <Zap class="w-6 h-6 text-white" />
              </div>
              <div>
                <div class="font-bold text-white text-sm">e-utilities-cost</div>
                <div class="text-[10px] text-slate-400">ระบบติดตามค่าสาธารณูปโภค</div>
              </div>
            </div>
          </div>

          <!-- Nav Links -->
          <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            <RouterLink
              v-for="item in navItems"
              :key="item.path"
              :to="item.path"
              @click="sidebarOpen = false"
              class="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all group"
              active-class="!text-white !bg-indigo-600/20 !border !border-indigo-500/30"
            >
              <component :is="item.icon" class="w-5 h-5 flex-shrink-0 group-hover:text-indigo-400" />
              <span class="text-sm font-medium">{{ item.label }}</span>
            </RouterLink>
          </nav>

          <!-- User Info at bottom -->
          <div class="p-4 border-t border-slate-700/50">
            <div class="flex items-center space-x-3">
              <div class="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm shadow">
                {{ authStore.user?.full_name?.charAt(0) || 'U' }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-xs font-semibold text-slate-200 truncate">{{ authStore.user?.full_name }}</div>
                <div class="text-[10px] uppercase font-bold tracking-wider text-indigo-400">{{ authStore.user?.role }}</div>
              </div>
              <button @click="handleLogout" class="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition">
                <LogOut class="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        <!-- Overlay for mobile -->
        <div v-if="sidebarOpen" @click="sidebarOpen = false" class="fixed inset-0 bg-black/50 z-10 md:hidden" />

        <!-- Main content -->
        <div class="flex-1 flex flex-col overflow-hidden">
          <!-- Top bar (mobile) -->
          <header class="glass-panel border-b border-slate-700/50 px-4 py-3 flex items-center justify-between md:hidden">
            <button @click="sidebarOpen = true" class="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
              <Menu class="w-5 h-5" />
            </button>
            <span class="text-sm font-bold text-white">e-utilities-cost</span>
            <div class="w-8" />
          </header>

          <!-- Page -->
          <main class="flex-1 overflow-y-auto p-4 md:p-6">
            <RouterView />
          </main>
        </div>
      </div>
    </template>

    <!-- Unauthenticated: just show the page (LoginView) -->
    <template v-else>
      <RouterView />
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';
import { Zap, Menu, LogOut, LayoutDashboard, ListOrdered, PlusCircle, Tags, BarChart2 } from 'lucide-vue-next';

const authStore = useAuthStore();
const router = useRouter();
const sidebarOpen = ref(false);

const navItems = computed(() => {
  const items = [
    { path: '/', label: 'แดชบอร์ด', icon: LayoutDashboard },
    { path: '/expenses', label: 'รายการค่าใช้จ่าย', icon: ListOrdered },
  ];
  if (authStore.canWrite) {
    items.push({ path: '/expenses/create', label: 'บันทึกค่าใช้จ่าย', icon: PlusCircle });
  }
  items.push({ path: '/reports', label: 'รายงาน / เปรียบเทียบ', icon: BarChart2 });
  if (authStore.isAdmin) {
    items.push({ path: '/settings/categories', label: 'จัดการหมวดหมู่', icon: Tags });
  }
  return items;
});

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>
