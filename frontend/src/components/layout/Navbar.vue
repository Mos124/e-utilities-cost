<template>
  <header class="glass-panel border-b border-slate-700/50 sticky top-0 z-30 px-4 py-3 flex items-center justify-between">
    <!-- Left: Mobile Menu Toggle & Title -->
    <div class="flex items-center space-x-3">
      <button 
        @click="$emit('toggle-sidebar')"
        class="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition md:hidden"
      >
        <Menu class="w-6 h-6" />
      </button>
      <div class="flex items-center space-x-2">
        <div class="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-blue-500/20">
          <Zap class="w-5 h-5" />
        </div>
        <div>
          <h1 class="text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            e-utilities-cost
          </h1>
          <p class="text-xs text-slate-400 hidden sm:block">ระบบติดตามค่าสาธารณูปโภค</p>
        </div>
      </div>
    </div>

    <!-- Right: User Profile & Actions -->
    <div class="flex items-center space-x-4">
      <div v-if="user" class="flex items-center space-x-3 bg-slate-800/60 px-3 py-1.5 rounded-full border border-slate-700/50">
        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm shadow">
          {{ user.full_name ? user.full_name.charAt(0) : 'U' }}
        </div>
        <div class="hidden sm:block text-left pr-1">
          <div class="text-xs font-semibold text-slate-200">{{ user.full_name }}</div>
          <div class="text-[10px] uppercase font-bold tracking-wider text-indigo-400">{{ user.role }}</div>
        </div>
      </div>

      <button 
        @click="handleLogout" 
        class="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 transition text-sm font-medium"
      >
        <LogOut class="w-4 h-4" />
        <span class="hidden sm:inline">ออกจากระบบ</span>
      </button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { Menu, Zap, LogOut } from 'lucide-vue-next';

defineEmits(['toggle-sidebar']);

const authStore = useAuthStore();
const router = useRouter();

const user = computed(() => authStore.user);

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>
