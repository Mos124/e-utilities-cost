<template>
  <div>
    <!-- Page Header -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">แดชบอร์ด</h1>
        <p class="text-slate-400 text-sm mt-0.5">ภาพรวมค่าสาธารณูปโภค ปี {{ selectedYear }}</p>
      </div>
      <select v-model="selectedYear" @change="loadData"
        class="glass-input px-3 py-2 rounded-xl text-sm text-white">
        <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
      </select>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div v-for="i in 4" :key="i" class="glass-card rounded-2xl p-5 h-28 animate-pulse bg-slate-800/50" />
    </div>

    <!-- Summary Cards -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="glass-card rounded-2xl p-5 border border-slate-700/50">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">ยอดรวมปี {{ selectedYear }}</span>
          <div class="p-2 bg-indigo-500/15 rounded-xl"><TrendingUp class="w-4 h-4 text-indigo-400" /></div>
        </div>
        <div class="text-2xl font-bold text-white">{{ fmt(summary?.yearTotal) }}</div>
        <div class="text-xs text-slate-500 mt-1">บาท</div>
      </div>

      <div class="glass-card rounded-2xl p-5 border border-slate-700/50">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">เดือนนี้</span>
          <div class="p-2 bg-blue-500/15 rounded-xl"><Calendar class="w-4 h-4 text-blue-400" /></div>
        </div>
        <div class="text-2xl font-bold text-white">{{ fmt(summary?.currentMonthTotal) }}</div>
        <div class="flex items-center space-x-1 mt-1">
          <span :class="['text-xs font-medium', summary?.percentChange >= 0 ? 'text-red-400' : 'text-green-400']">
            {{ summary?.percentChange >= 0 ? '▲' : '▼' }} {{ Math.abs(summary?.percentChange || 0).toFixed(1) }}%
          </span>
          <span class="text-xs text-slate-500">vs เดือนก่อน</span>
        </div>
      </div>

      <div class="glass-card rounded-2xl p-5 border border-slate-700/50">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">เดือนก่อน</span>
          <div class="p-2 bg-purple-500/15 rounded-xl"><Clock class="w-4 h-4 text-purple-400" /></div>
        </div>
        <div class="text-2xl font-bold text-white">{{ fmt(summary?.prevMonthTotal) }}</div>
        <div class="text-xs text-slate-500 mt-1">บาท</div>
      </div>

      <div class="glass-card rounded-2xl p-5 border border-slate-700/50">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">เฉลี่ยต่อเดือน</span>
          <div class="p-2 bg-emerald-500/15 rounded-xl"><Activity class="w-4 h-4 text-emerald-400" /></div>
        </div>
        <div class="text-2xl font-bold text-white">
          {{ fmt((summary?.yearTotal || 0) / 12) }}
        </div>
        <div class="text-xs text-slate-500 mt-1">บาท</div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <!-- Monthly Bar Chart -->
      <div class="lg:col-span-2 glass-panel rounded-2xl p-5 border border-slate-700/50">
        <h2 class="text-sm font-semibold text-slate-300 mb-4">ค่าใช้จ่ายรายเดือน (บาท)</h2>
        <div class="h-52">
          <Bar v-if="barChartData" :data="barChartData" :options="barOptions" />
        </div>
      </div>

      <!-- Category Donut -->
      <div class="glass-panel rounded-2xl p-5 border border-slate-700/50">
        <h2 class="text-sm font-semibold text-slate-300 mb-4">สัดส่วนตามประเภท</h2>
        <div class="h-52 flex items-center justify-center">
          <Doughnut v-if="donutData" :data="donutData" :options="donutOptions" />
        </div>
      </div>
    </div>

    <!-- Category Table -->
    <div class="glass-panel rounded-2xl border border-slate-700/50 overflow-hidden">
      <div class="px-5 py-4 border-b border-slate-700/50">
        <h2 class="text-sm font-semibold text-slate-300">ยอดแยกตามประเภทค่าใช้จ่าย</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-slate-700/50">
              <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">ประเภท</th>
              <th class="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">ยอดรวม (บาท)</th>
              <th class="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">สัดส่วน</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cat in byCategory" :key="cat.id" class="border-b border-slate-800/50 hover:bg-slate-800/30 transition">
              <td class="px-5 py-3 text-slate-200">
                <span class="inline-flex items-center space-x-2">
                  <span class="w-2 h-2 rounded-full bg-indigo-400 inline-block" />
                  <span>{{ cat.name }}</span>
                </span>
              </td>
              <td class="px-5 py-3 text-right font-mono text-slate-200">{{ fmt(cat.totalAmount) }}</td>
              <td class="px-5 py-3 text-right text-slate-400">
                {{ summary?.yearTotal ? ((cat.totalAmount / summary.yearTotal) * 100).toFixed(1) : '0.0' }}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useExpenseStore } from '../stores/expense';
import { Bar, Doughnut } from 'vue-chartjs';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import { TrendingUp, Calendar, Clock, Activity } from 'lucide-vue-next';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const expenseStore = useExpenseStore();
const selectedYear = ref(new Date().getFullYear());
const loading = ref(false);

const yearOptions = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

const summary = computed(() => expenseStore.dashboardSummary);
const byCategory = computed(() => expenseStore.dashboardByCategory.filter(c => c.totalAmount > 0));

const MONTHS = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
const COLORS = ['#6366f1','#3b82f6','#06b6d4','#10b981','#f59e0b','#ef4444','#8b5cf6'];

const fmt = (v) => v != null ? Number(v).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';

const barChartData = computed(() => {
  if (!summary.value) return null;
  return {
    labels: MONTHS,
    datasets: [{
      label: 'ค่าใช้จ่าย (บาท)',
      data: summary.value.monthlyData,
      backgroundColor: 'rgba(99,102,241,0.5)',
      borderColor: '#6366f1',
      borderWidth: 2,
      borderRadius: 6,
    }]
  };
});

const donutData = computed(() => {
  if (!byCategory.value.length) return null;
  return {
    labels: byCategory.value.map(c => c.name),
    datasets: [{
      data: byCategory.value.map(c => c.totalAmount),
      backgroundColor: COLORS,
      borderColor: '#1e293b',
      borderWidth: 2,
    }]
  };
});

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { ticks: { color: '#94a3b8', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
    y: { ticks: { color: '#94a3b8', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.05)' } }
  }
};

const donutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 11 }, boxWidth: 10, padding: 12 } }
  }
};

const loadData = async () => {
  loading.value = true;
  await expenseStore.fetchDashboardSummary(selectedYear.value);
  loading.value = false;
};

onMounted(loadData);
</script>
