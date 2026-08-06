<template>
  <div>
    <!-- Page Header -->
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 class="w-6 h-6 text-indigo-400" />
          รายงานและเปรียบเทียบย้อนหลัง
        </h1>
        <p class="text-slate-400 text-sm mt-0.5">
          เปรียบเทียบยอดรวมค่าสาธารณูปโภคระหว่างปีเพื่อวิเคราะห์แนวโน้มการใช้งาน
        </p>
      </div>

      <!-- Action & Filter Bar -->
      <div class="flex items-center gap-3">
        <div class="glass-panel px-3 py-1.5 rounded-xl border border-slate-700/50 flex items-center gap-2 text-sm">
          <span class="text-slate-400">เปรียบเทียบ:</span>
          <select v-model="year1" @change="loadComparison" class="glass-input px-2 py-1 rounded-lg text-white text-xs bg-slate-900/60">
            <option v-for="y in yearOptions" :key="'y1-'+y" :value="y">ปี {{ y }}</option>
          </select>
          <ArrowRightLeft class="w-4 h-4 text-indigo-400" />
          <select v-model="year2" @change="loadComparison" class="glass-input px-2 py-1 rounded-lg text-white text-xs bg-slate-900/60">
            <option v-for="y in yearOptions" :key="'y2-'+y" :value="y">ปี {{ y }}</option>
          </select>
        </div>

        <button @click="printReport" class="glass-button px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:text-white flex items-center gap-1.5">
          <Printer class="w-4 h-4" />
          <span class="hidden md:inline">พิมพ์รายงาน</span>
        </button>
      </div>
    </div>

    <!-- Comparison Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div class="glass-card rounded-2xl p-5 border border-slate-700/50">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">ยอดรวมปี {{ year1 }}</span>
          <span class="px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">ฐานข้อมูล</span>
        </div>
        <div class="text-2xl font-bold text-white">{{ fmt(compareData?.year1?.total) }}</div>
        <div class="text-xs text-slate-500 mt-1">บาท</div>
      </div>

      <div class="glass-card rounded-2xl p-5 border border-slate-700/50">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">ยอดรวมปี {{ year2 }}</span>
          <span class="px-2 py-0.5 text-xs rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">ปีปัจจุบัน/เปรียบเทียบ</span>
        </div>
        <div class="text-2xl font-bold text-white">{{ fmt(compareData?.year2?.total) }}</div>
        <div class="text-xs text-slate-500 mt-1">บาท</div>
      </div>

      <div class="glass-card rounded-2xl p-5 border border-slate-700/50">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">ผลต่าง ({{ year2 }} vs {{ year1 }})</span>
          <div class="p-1.5 bg-indigo-500/15 rounded-lg">
            <TrendingUp class="w-4 h-4 text-indigo-400" />
          </div>
        </div>
        <div :class="['text-2xl font-bold', diffAmount >= 0 ? 'text-red-400' : 'text-emerald-400']">
          {{ diffAmount >= 0 ? '+' : '' }}{{ fmt(diffAmount) }}
        </div>
        <div class="flex items-center gap-1.5 text-xs mt-1">
          <span :class="['font-semibold', diffAmount >= 0 ? 'text-red-400' : 'text-emerald-400']">
            {{ diffPercent >= 0 ? '▲' : '▼' }} {{ Math.abs(diffPercent).toFixed(1) }}%
          </span>
          <span class="text-slate-500">เปลี่ยนแปลง</span>
        </div>
      </div>
    </div>

    <!-- Comparison Chart -->
    <div class="glass-panel rounded-2xl p-5 border border-slate-700/50 mb-6">
      <h2 class="text-base font-semibold text-slate-200 mb-4">กราฟเปรียบเทียบค่าใช้จ่ายรายเดือน (ปี {{ year1 }} vs ปี {{ year2 }})</h2>
      <div class="h-64 sm:h-80">
        <Bar v-if="chartData" :data="chartData" :options="chartOptions" />
      </div>
    </div>

    <!-- Monthly Comparison Breakdown Table -->
    <div class="glass-panel rounded-2xl border border-slate-700/50 overflow-hidden mb-6">
      <div class="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
        <h2 class="text-base font-semibold text-slate-200">ตารางสรุปเปรียบเทียบรายเดือน (บาท)</h2>
        <span class="text-xs text-slate-400">ข้อมูล ณ วันที่ {{ currentDateFormat }}</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-slate-700/50 bg-slate-900/40 text-slate-400">
              <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider">เดือน</th>
              <th class="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider">ปี {{ year1 }}</th>
              <th class="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider">ปี {{ year2 }}</th>
              <th class="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider">ผลต่าง (บาท)</th>
              <th class="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider">อัตราเปลี่ยนแปลง (%)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(mName, idx) in monthNames" :key="idx" class="border-b border-slate-800/40 hover:bg-slate-800/30 transition">
              <td class="px-5 py-3 text-slate-300 font-medium">{{ mName }}</td>
              <td class="text-right px-5 py-3 text-slate-400">{{ fmt(compareData?.year1?.monthly[idx]) }}</td>
              <td class="text-right px-5 py-3 text-white font-semibold">{{ fmt(compareData?.year2?.monthly[idx]) }}</td>
              <td :class="['text-right px-5 py-3 font-medium', getMonthlyDiff(idx) >= 0 ? 'text-red-400' : 'text-emerald-400']">
                {{ getMonthlyDiff(idx) >= 0 ? '+' : '' }}{{ fmt(getMonthlyDiff(idx)) }}
              </td>
              <td :class="['text-right px-5 py-3 font-medium', getMonthlyDiffPercent(idx) >= 0 ? 'text-red-400' : 'text-emerald-400']">
                {{ getMonthlyDiffPercent(idx) >= 0 ? '▲' : '▼' }} {{ Math.abs(getMonthlyDiffPercent(idx)).toFixed(1) }}%
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="bg-slate-900/80 font-bold border-t border-slate-700/50 text-white">
              <td class="px-5 py-3">รวมทั้งหมด</td>
              <td class="text-right px-5 py-3 text-slate-300">{{ fmt(compareData?.year1?.total) }}</td>
              <td class="text-right px-5 py-3 text-indigo-400">{{ fmt(compareData?.year2?.total) }}</td>
              <td :class="['text-right px-5 py-3', diffAmount >= 0 ? 'text-red-400' : 'text-emerald-400']">
                {{ diffAmount >= 0 ? '+' : '' }}{{ fmt(diffAmount) }}
              </td>
              <td :class="['text-right px-5 py-3', diffPercent >= 0 ? 'text-red-400' : 'text-emerald-400']">
                {{ diffPercent >= 0 ? '▲' : '▼' }} {{ Math.abs(diffPercent).toFixed(1) }}%
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../services/api';
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js';
import { BarChart3, TrendingUp, ArrowRightLeft, Printer } from 'lucide-vue-next';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const currentYear = new Date().getFullYear();
const year1 = ref(currentYear - 1);
const year2 = ref(currentYear);

const yearOptions = computed(() => {
  const years = [];
  for (let i = currentYear - 4; i <= currentYear + 1; i++) {
    years.push(i);
  }
  return years;
});

const compareData = ref({
  year1: { year: year1.value, total: 0, monthly: Array(12).fill(0) },
  year2: { year: year2.value, total: 0, monthly: Array(12).fill(0) }
});

const monthNames = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

const currentDateFormat = computed(() => {
  const d = new Date();
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear() + 543}`;
});

const fmt = (num) => {
  if (num === null || num === undefined || isNaN(num)) return '0.00';
  return Number(num).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const diffAmount = computed(() => {
  const t1 = compareData.value?.year1?.total || 0;
  const t2 = compareData.value?.year2?.total || 0;
  return t2 - t1;
});

const diffPercent = computed(() => {
  const t1 = compareData.value?.year1?.total || 0;
  if (t1 === 0) return 0;
  return (diffAmount.value / t1) * 100;
});

const getMonthlyDiff = (idx) => {
  const m1 = compareData.value?.year1?.monthly?.[idx] || 0;
  const m2 = compareData.value?.year2?.monthly?.[idx] || 0;
  return m2 - m1;
};

const getMonthlyDiffPercent = (idx) => {
  const m1 = compareData.value?.year1?.monthly?.[idx] || 0;
  const m2 = compareData.value?.year2?.monthly?.[idx] || 0;
  if (m1 === 0) return m2 > 0 ? 100 : 0;
  return ((m2 - m1) / m1) * 100;
};

const chartData = computed(() => {
  if (!compareData.value) return null;
  return {
    labels: monthNames,
    datasets: [
      {
        label: `ปี ${year1.value}`,
        data: compareData.value.year1?.monthly || Array(12).fill(0),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: '#3b82f6',
        borderWidth: 1,
        borderRadius: 6
      },
      {
        label: `ปี ${year2.value}`,
        data: compareData.value.year2?.monthly || Array(12).fill(0),
        backgroundColor: 'rgba(99, 102, 241, 0.85)',
        borderColor: '#6366f1',
        borderWidth: 1,
        borderRadius: 6
      }
    ]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: '#94a3b8', font: { family: 'Inter, sans-serif' } }
    },
    tooltip: {
      callbacks: {
        label: (context) => `${context.dataset.label}: ${fmt(context.raw)} บาท`
      }
    }
  },
  scales: {
    x: {
      grid: { color: 'rgba(51, 65, 85, 0.3)' },
      ticks: { color: '#94a3b8' }
    },
    y: {
      grid: { color: 'rgba(51, 65, 85, 0.3)' },
      ticks: {
        color: '#94a3b8',
        callback: (val) => fmt(val)
      }
    }
  }
};

const loadComparison = async () => {
  try {
    const res = await api.get('/dashboard/compare', {
      params: { year1: year1.value, year2: year2.value }
    });
    if (res.data) {
      compareData.value = res.data;
    }
  } catch (err) {
    console.error('Failed to load comparison data:', err);
  }
};

const printReport = () => {
  window.print();
};

onMounted(() => {
  loadComparison();
});
</script>
