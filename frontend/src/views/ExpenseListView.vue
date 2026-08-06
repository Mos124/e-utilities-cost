<template>
  <div>
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-white">รายการค่าใช้จ่าย</h1>
        <p class="text-slate-400 text-sm mt-0.5">ทั้งหมด {{ expenseStore.total }} รายการ</p>
      </div>
      <RouterLink v-if="authStore.canWrite" to="/expenses/create"
        class="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 hover:from-blue-500 hover:to-indigo-500 transition-all">
        <PlusCircle class="w-4 h-4" />
        <span>เพิ่มรายการ</span>
      </RouterLink>
    </div>

    <!-- Filter Panel -->
    <div class="glass-panel rounded-2xl p-4 mb-5 border border-slate-700/50">
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <input v-model="filters.year" type="number" min="2000" max="2099" placeholder="ปี"
          class="glass-input rounded-xl px-3 py-2 text-sm" @change="applyFilters" />
        <select v-model="filters.month" class="glass-input rounded-xl px-3 py-2 text-sm" @change="applyFilters">
          <option value="">ทุกเดือน</option>
          <option v-for="(m, i) in MONTHS" :key="i" :value="i+1">{{ m }}</option>
        </select>
        <select v-model="filters.expense_category_id" class="glass-input rounded-xl px-3 py-2 text-sm" @change="applyFilters">
          <option value="">ทุกประเภท</option>
          <option v-for="c in categoryStore.expenseCategories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <select v-model="filters.budget_category_id" class="glass-input rounded-xl px-3 py-2 text-sm" @change="applyFilters">
          <option value="">ทุกหมวดเงิน</option>
          <option v-for="c in categoryStore.budgetCategories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input v-model="filters.search" type="text" placeholder="ค้นหา..."
            class="glass-input w-full pl-9 pr-3 py-2 text-sm rounded-xl" @input="debouncedSearch" />
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="glass-panel rounded-2xl border border-slate-700/50 overflow-hidden">
      <div v-if="expenseStore.loading" class="py-16 flex items-center justify-center">
        <Loader2 class="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
      <div v-else-if="expenseStore.expenses.length === 0" class="py-16 text-center text-slate-500">
        <FileX class="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p>ไม่พบรายการค่าใช้จ่าย</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-slate-700/50">
              <th class="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">เดือน</th>
              <th class="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">ประเภท</th>
              <th class="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">หมวดเงิน</th>
              <th class="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">ยอดเงิน (บาท)</th>
              <th class="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">เลขที่ใบแจ้ง</th>
              <th v-if="authStore.canWrite" class="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="exp in expenseStore.expenses" :key="exp.id"
              class="border-b border-slate-800/50 hover:bg-slate-800/30 transition">
              <td class="px-4 py-3 text-slate-300 whitespace-nowrap">{{ formatMonth(exp.billing_month) }}</td>
              <td class="px-4 py-3">
                <span class="px-2 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 text-xs font-medium">
                  {{ exp.expenseCategory?.name || '-' }}
                </span>
              </td>
              <td class="px-4 py-3 text-slate-400 text-xs">{{ exp.budgetCategory?.name || '-' }}</td>
              <td class="px-4 py-3 text-right font-mono font-semibold text-emerald-400">{{ fmt(exp.amount) }}</td>
              <td class="px-4 py-3 text-slate-500 text-xs">{{ exp.invoice_no || '-' }}</td>
              <td v-if="authStore.canWrite" class="px-4 py-3 text-center">
                <div class="flex items-center justify-center space-x-1">
                  <RouterLink :to="`/expenses/${exp.id}/edit`"
                    class="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition">
                    <Pencil class="w-4 h-4" />
                  </RouterLink>
                  <button @click="confirmDelete(exp)"
                    class="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="expenseStore.totalPages > 1" class="px-5 py-3 border-t border-slate-700/50 flex items-center justify-between">
        <span class="text-xs text-slate-500">หน้า {{ expenseStore.page }} จาก {{ expenseStore.totalPages }}</span>
        <div class="flex space-x-1">
          <button v-for="p in expenseStore.totalPages" :key="p" @click="goPage(p)"
            :class="['px-3 py-1 rounded-lg text-xs font-medium transition',
              expenseStore.page === p ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white']">
            {{ p }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Modal -->
    <div v-if="deleteTarget" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div class="glass-panel rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-slate-700/50">
        <div class="flex items-center space-x-3 mb-4">
          <div class="p-2 bg-red-500/15 rounded-xl"><AlertTriangle class="w-5 h-5 text-red-400" /></div>
          <h3 class="font-semibold text-white">ยืนยันการลบ</h3>
        </div>
        <p class="text-slate-400 text-sm mb-5">ต้องการลบรายการ <strong class="text-slate-200">{{ deleteTarget.expenseCategory?.name }}</strong> เดือน {{ formatMonth(deleteTarget.billing_month) }} หรือไม่?</p>
        <div class="flex space-x-3">
          <button @click="deleteTarget = null" class="flex-1 py-2 rounded-xl border border-slate-600 text-slate-400 hover:text-white hover:border-slate-500 text-sm transition">ยกเลิก</button>
          <button @click="doDelete" class="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition">ลบ</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useExpenseStore } from '../stores/expense';
import { useCategoryStore } from '../stores/category';
import { useAuthStore } from '../stores/auth';
import { PlusCircle, Search, Pencil, Trash2, FileX, Loader2, AlertTriangle } from 'lucide-vue-next';

const expenseStore = useExpenseStore();
const categoryStore = useCategoryStore();
const authStore = useAuthStore();

const MONTHS = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
const deleteTarget = ref(null);

const filters = reactive({
  year: new Date().getFullYear(),
  month: '',
  expense_category_id: '',
  budget_category_id: '',
  search: ''
});

const fmt = (v) => v != null ? Number(v).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';

const formatMonth = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`;
};

const applyFilters = () => {
  Object.assign(expenseStore.filters, filters);
  expenseStore.fetchExpenses(1);
};

let searchTimeout;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(applyFilters, 400);
};

const goPage = (p) => expenseStore.fetchExpenses(p);

const confirmDelete = (exp) => { deleteTarget.value = exp; };
const doDelete = async () => {
  if (!deleteTarget.value) return;
  await expenseStore.deleteExpense(deleteTarget.value.id);
  deleteTarget.value = null;
};

onMounted(async () => {
  await Promise.all([categoryStore.fetchAllCategories(), expenseStore.fetchExpenses(1)]);
});
</script>
