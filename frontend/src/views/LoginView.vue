<template>
  <div class="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
    <!-- Background blobs -->
    <div class="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
    <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

    <div class="w-full max-w-md relative z-10">
      <!-- Card -->
      <div class="glass-panel rounded-2xl p-8 shadow-2xl shadow-black/40">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30 mb-4">
            <Zap class="w-8 h-8 text-white" />
          </div>
          <h1 class="text-2xl font-bold text-white">e-utilities-cost</h1>
          <p class="text-slate-400 text-sm mt-1">ระบบติดตามค่าสาธารณูปโภค</p>
        </div>

        <!-- Error alert -->
        <div v-if="error" class="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center space-x-2">
          <AlertCircle class="w-4 h-4 flex-shrink-0" />
          <span>{{ error }}</span>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1.5">ชื่อผู้ใช้</label>
            <div class="relative">
              <User class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                id="username"
                v-model="form.username"
                type="text"
                required
                autocomplete="username"
                placeholder="กรอกชื่อผู้ใช้"
                class="glass-input w-full pl-10 pr-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1.5">รหัสผ่าน</label>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                autocomplete="current-password"
                placeholder="กรอกรหัสผ่าน"
                class="glass-input w-full pl-10 pr-12 py-3 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/40"
              />
              <button type="button" @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition">
                <Eye v-if="!showPassword" class="w-4 h-4" />
                <EyeOff v-else class="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            id="btn-login"
            type="submit"
            :disabled="loading"
            class="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:from-blue-500 hover:to-indigo-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
            <LogIn v-else class="w-4 h-4" />
            <span>{{ loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}</span>
          </button>
        </form>

        <!-- Hint & Quick Credentials -->
        <div class="mt-6 pt-4 border-t border-slate-700/50">
          <p class="text-xs font-semibold text-slate-400 mb-2.5 text-center">บัญชีสำหรับทดลองระบบ (คลิกเพื่อกรอก):</p>
          <div class="grid grid-cols-3 gap-2">
            <button
              type="button"
              @click="fillCreds('admin', 'admin123')"
              class="px-2 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/30 border border-indigo-500/30 text-[11px] font-medium text-indigo-300 transition text-center"
            >
              👑 Admin<br><span class="text-[9px] text-slate-400">admin / admin123</span>
            </button>
            <button
              type="button"
              @click="fillCreds('staff', 'staff123')"
              class="px-2 py-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/30 border border-blue-500/30 text-[11px] font-medium text-blue-300 transition text-center"
            >
              📝 Staff<br><span class="text-[9px] text-slate-400">staff / staff123</span>
            </button>
            <button
              type="button"
              @click="fillCreds('user', 'user123')"
              class="px-2 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 border border-emerald-500/30 text-[11px] font-medium text-emerald-300 transition text-center"
            >
              👀 User<br><span class="text-[9px] text-slate-400">user / user123</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { Zap, User, Lock, Eye, EyeOff, LogIn, AlertCircle, Loader2 } from 'lucide-vue-next';

const authStore = useAuthStore();
const router = useRouter();

const form = ref({ username: '', password: '' });
const loading = ref(false);
const error = ref('');
const showPassword = ref(false);

const fillCreds = (u, p) => {
  form.value.username = u;
  form.value.password = p;
};

const handleLogin = async () => {
  error.value = '';
  loading.value = true;
  try {
    await authStore.login(form.value.username, form.value.password);
    router.push('/');
  } catch (err) {
    error.value = authStore.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่';
  } finally {
    loading.value = false;
  }
};
</script>
