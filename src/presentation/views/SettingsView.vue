<script setup lang="ts">
import { ref, watch } from 'vue'
import { useHealthStore } from '@application/stores/healthStore'
import { HealthReportService } from '@application/services/HealthReportService'
import PageCard from '@presentation/components/shared/PageCard.vue'

var store = useHealthStore()
var reportService = new HealthReportService()
var form = ref({ ...store.goals })

watch(store.goals, (value) => {
  form.value = { ...value }
})

function saveGoals(): void {
  store.updateGoals(form.value)
}

function exportPdf(): void {
  reportService.print(store)
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <PageCard title="اهداف سلامت">
      <div class="grid grid-cols-2 gap-3">
        <label class="text-xs">فعالیت متوسط هفتگی
          <input v-model.number="form.weeklyModerateMinutes" type="number" class="mt-1 w-full rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800" />
        </label>
        <label class="text-xs">فعالیت شدید هفتگی
          <input v-model.number="form.weeklyVigorousMinutes" type="number" class="mt-1 w-full rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800" />
        </label>
        <label class="text-xs">لیوان آب روزانه
          <input v-model.number="form.dailyWaterGlasses" type="number" class="mt-1 w-full rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800" />
        </label>
        <label class="text-xs">روزهای تمرین قدرتی
          <input v-model.number="form.strengthDays" type="number" class="mt-1 w-full rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800" />
        </label>
      </div>
      <label class="mt-3 flex items-center gap-2 text-sm">
        <input v-model="form.trackingWeight" type="checkbox" />
        ثبت وزن فعال باشد
      </label>
      <button type="button" class="mt-4 w-full rounded-xl bg-teal-500 py-2.5 text-sm font-medium text-white" @click="saveGoals">
        ذخیرهٔ اهداف
      </button>
    </PageCard>

    <PageCard title="خروجی و داده">
      <button type="button" class="mb-3 w-full rounded-xl bg-slate-800 py-2.5 text-sm text-white dark:bg-slate-700" @click="exportPdf">
        خروجی PDF / چاپ گزارش
      </button>
      <button type="button" class="w-full rounded-xl bg-teal-500 py-2.5 text-sm font-medium text-white" @click="store.exportJson()">
        خروجی JSON
      </button>
    </PageCard>

    <PageCard>
      <p class="text-xs leading-6 text-slate-500">
        داده‌ها فقط در مرورگر شما ذخیره می‌شوند. این برنامهٔ سلامت، ابزار پزشکی نیست و تشخیص یا درمان انجام نمی‌دهد.
      </p>
    </PageCard>
  </div>
</template>
