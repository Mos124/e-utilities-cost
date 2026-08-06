<template>
  <div class="max-w-2xl mx-auto">
    <div class="mb-6">
      <RouterLink to="/expenses" class="inline-flex items-center space-x-1 text-slate-400 hover:text-white text-sm transition mb-3">
        <ArrowLeft class="w-4 h-4" /> <span>กลับ</span>
      </RouterLink>
      <h1 class="text-2xl font-bold text-white">{{ isEdit ? 'แก้ไขรายการ' : 'บันทึกค่าใช้จ่าย' }}</h1>
    </div>

    <div class="glass-panel rounded-2xl p-6 border border-slate-700/50">
      <div v-if="loadingData" class="py-12 flex justify-center">
        <Loader2 class="w-8 h-8 text-indigo-400 animate-spin" />
      </div>

      <form v-else @submit.prevent="handleSubmit" class="space-y-5">
        <!-- Error -->
        <div v-if="error" class="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center space-x-2">
          <AlertCircle class="w-4 h-4 flex-shrink-0" />
          <span>{{ error }}</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1.5">ประเภทค่าใช้จ่าย <span class="text-red-400">*</span></label>
            <select v-model="form.expense_category_id" required class="glass-input w-full px-3 py-2.5 rounded-xl text-sm">
              <option value="">-- เลือกประเภท --</option>
              <option v-for="c in categoryStore.expenseCategories" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1.5">หมวดเงินงบประมาณ <span class="text-red-400">*</span></label>
            <select v-model="form.budget_category_id" required class="glass-input w-full px-3 py-2.5 rounded-xl text-sm">
              <option value="">-- เลือกหมวดเงิน --</option>
              <option v-for="c in categoryStore.budgetCategories" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1.5">ยอดเงิน (บาท) <span class="text-red-400">*</span></label>
            <input v-model="form.amount" type="number" step="0.01" min="0" required placeholder="0.00"
              class="glass-input w-full px-3 py-2.5 rounded-xl text-sm" />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1.5">เดือนที่เบิก <span class="text-red-400">*</span></label>
            <input v-model="form.billing_month" type="month" required
              class="glass-input w-full px-3 py-2.5 rounded-xl text-sm" />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1.5">วันที่ชำระ</label>
            <input v-model="form.paid_date" type="date"
              class="glass-input w-full px-3 py-2.5 rounded-xl text-sm" />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1.5">เลขที่ใบแจ้งหนี้</label>
            <input v-model="form.invoice_no" type="text" placeholder="INV-XXXX"
              class="glass-input w-full px-3 py-2.5 rounded-xl text-sm" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1.5">หมายเหตุ</label>
          <textarea v-model="form.note" rows="3" placeholder="บันทึกเพิ่มเติม..."
            class="glass-input w-full px-3 py-2.5 rounded-xl text-sm resize-none" />
        </div>

        <div class="flex space-x-3 pt-2">
          <RouterLink to="/expenses"
            class="flex-1 py-3 rounded-xl border border-slate-600 text-slate-400 hover:text-white hover:border-slate-500 text-sm font-medium transition text-center">
            ยกเลิก
          </RouterLink>
          <button type="submit" :disabled="submitting"
            class="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 hover:from-blue-500 hover:to-indigo-500 transition disabled:opacity-60 flex items-center justify-center space-x-2">
            <Loader2 v-if="submitting" class="w-4 h-4 animate-spin" />
            <Save v-else class="w-4 h-4" />
            <span>{{ submitting ? 'กำลังบันทึก...' : (isEdit ? 'บันทึกการแก้ไข' : 'บันทึกรายการ') }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useExpenseStore } from '../stores/expense';
import { useCategoryStore } from '../stores/category';
import api from '../services/api';
import { ArrowLeft, AlertCircle, Loader2, Save } from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const expenseStore = useExpenseStore();
const categoryStore = useCategoryStore();

const isEdit = computed(() => !!route.params.id);
const loadingData = ref(false);
const submitting = ref(false);
const error = ref('');

const form = reactive({
  expense_category_id: '',
  budget_category_id: '',
  amount: '',
  billing_month: '',
  paid_date: '',
  invoice_no: '',
  note: ''
});

const handleSubmit = async () => {
  error.value = '';
  submitting.value = true;
  try {
    if (isEdit.value) {
      await expenseStore.updateExpense(route.params.id, form);
    } else {
      await expenseStore.createExpense(form);
    }
    router.push('/expenses');
  } catch (err) {
    error.value = err.response?.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่';
  } finally {
    submitting.value = false;
  }
};

onMounted(async () => {
  loadingData.value = true;
  await categoryStore.fetchAllCategories();
  if (isEdit.value) {
    try {
      const res = await api.get(`/expenses/${route.params.id}`);
      const d = res.data;
      form.expense_category_id = d.expense_category_id;
      form.budget_category_id = d.budget_category_id;
      form.amount = d.amount;
      form.billing_month = d.billing_month ? d.billing_month.substring(0, 7) : '';
      form.paid_date = d.paid_date ? d.paid_date.substring(0, 10) : '';
      form.invoice_no = d.invoice_no || '';
      form.note = d.note || '';
    } catch {
      error.value = 'ไม่พบรายการที่ต้องการแก้ไข';
    }
  }
  loadingData.value = false;
});
</script>
