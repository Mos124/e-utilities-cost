<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-white">จัดการหมวดหมู่</h1>
      <p class="text-slate-400 text-sm mt-0.5">จัดการประเภทค่าใช้จ่ายและหมวดเงินงบประมาณ</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Expense Categories -->
      <div class="glass-panel rounded-2xl border border-slate-700/50 overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
          <h2 class="font-semibold text-slate-200">ประเภทค่าใช้จ่าย</h2>
          <button @click="openExpenseModal()" class="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-xs font-medium hover:bg-indigo-600/30 transition">
            <Plus class="w-3.5 h-3.5" /><span>เพิ่ม</span>
          </button>
        </div>
        <div class="divide-y divide-slate-800/50">
          <div v-if="!categoryStore.expenseCategories.length" class="py-8 text-center text-slate-600 text-sm">ไม่มีข้อมูล</div>
          <div v-for="c in categoryStore.expenseCategories" :key="c.id"
            class="flex items-center justify-between px-5 py-3 hover:bg-slate-800/30 transition">
            <div>
              <span class="text-slate-200 text-sm font-medium">{{ c.name }}</span>
              <span class="ml-2 text-[10px] text-slate-500 font-mono">{{ c.code }}</span>
            </div>
            <div class="flex space-x-1">
              <button @click="openExpenseModal(c)" class="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition">
                <Pencil class="w-3.5 h-3.5" />
              </button>
              <button @click="deleteExpenseCat(c.id)" class="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition">
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Budget Categories -->
      <div class="glass-panel rounded-2xl border border-slate-700/50 overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
          <h2 class="font-semibold text-slate-200">หมวดเงินงบประมาณ</h2>
          <button @click="openBudgetModal()" class="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-xs font-medium hover:bg-indigo-600/30 transition">
            <Plus class="w-3.5 h-3.5" /><span>เพิ่ม</span>
          </button>
        </div>
        <div class="divide-y divide-slate-800/50">
          <div v-if="!categoryStore.budgetCategories.length" class="py-8 text-center text-slate-600 text-sm">ไม่มีข้อมูล</div>
          <div v-for="c in categoryStore.budgetCategories" :key="c.id"
            class="flex items-center justify-between px-5 py-3 hover:bg-slate-800/30 transition">
            <div>
              <span class="text-slate-200 text-sm font-medium">{{ c.name }}</span>
              <span class="ml-2 text-[10px] text-slate-500 font-mono">{{ c.code }}</span>
            </div>
            <div class="flex space-x-1">
              <button @click="openBudgetModal(c)" class="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition">
                <Pencil class="w-3.5 h-3.5" />
              </button>
              <button @click="deleteBudgetCat(c.id)" class="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition">
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="modal.show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div class="glass-panel rounded-2xl p-6 max-w-sm w-full mx-4 border border-slate-700/50 shadow-2xl">
        <h3 class="font-semibold text-white mb-4">{{ modal.id ? 'แก้ไข' : 'เพิ่ม' }}{{ modal.type === 'expense' ? 'ประเภทค่าใช้จ่าย' : 'หมวดเงิน' }}</h3>
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1">ชื่อ</label>
            <input v-model="modal.name" type="text" class="glass-input w-full px-3 py-2 rounded-xl text-sm" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1">รหัส (CODE)</label>
            <input v-model="modal.code" type="text" class="glass-input w-full px-3 py-2 rounded-xl text-sm uppercase" />
          </div>
          <div v-if="modal.type === 'expense'">
            <label class="block text-xs font-medium text-slate-400 mb-1">หน่วย</label>
            <input v-model="modal.unit" type="text" placeholder="บาท" class="glass-input w-full px-3 py-2 rounded-xl text-sm" />
          </div>
        </div>
        <div class="flex space-x-3 mt-5">
          <button @click="modal.show = false" class="flex-1 py-2 rounded-xl border border-slate-600 text-slate-400 hover:text-white text-sm transition">ยกเลิก</button>
          <button @click="saveModal" class="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition">บันทึก</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue';
import { useCategoryStore } from '../stores/category';
import { Plus, Pencil, Trash2 } from 'lucide-vue-next';

const categoryStore = useCategoryStore();

const modal = reactive({ show: false, type: 'expense', id: null, name: '', code: '', unit: 'บาท' });

const openExpenseModal = (c = null) => {
  Object.assign(modal, { show: true, type: 'expense', id: c?.id || null, name: c?.name || '', code: c?.code || '', unit: c?.unit || 'บาท' });
};
const openBudgetModal = (c = null) => {
  Object.assign(modal, { show: true, type: 'budget', id: c?.id || null, name: c?.name || '', code: c?.code || '', unit: '' });
};

const saveModal = async () => {
  const data = { name: modal.name, code: modal.code.toUpperCase() };
  if (modal.type === 'expense') {
    data.unit = modal.unit || 'บาท';
    if (modal.id) await categoryStore.updateExpenseCategory(modal.id, data);
    else await categoryStore.createExpenseCategory(data);
  } else {
    if (modal.id) await categoryStore.updateBudgetCategory(modal.id, data);
    else await categoryStore.createBudgetCategory(data);
  }
  modal.show = false;
};

const deleteExpenseCat = async (id) => {
  if (confirm('ต้องการลบประเภทนี้หรือไม่?')) await categoryStore.deleteExpenseCategory(id);
};
const deleteBudgetCat = async (id) => {
  if (confirm('ต้องการลบหมวดเงินนี้หรือไม่?')) await categoryStore.deleteBudgetCategory(id);
};

onMounted(() => categoryStore.fetchAllCategories());
</script>
