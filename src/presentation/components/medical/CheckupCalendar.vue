<script setup lang="ts">
import { useAppStore } from '@application/stores/appStore'
import type { CheckupStatus } from '@domain/health/Checkups'
import { persianDate } from '@domain/valueObjects/DateOnly'
import PageCard from '@presentation/components/shared/PageCard.vue'
import PersianDatePicker from '@presentation/components/shared/PersianDatePicker.vue'

var store = useAppStore()

var STATUS: Record<CheckupStatus, { label: string; css: string }> = {
  never: { label: 'ثبت نشده', css: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200' },
  ok: { label: 'به‌روز', css: 'bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-200' },
  soon: { label: 'نزدیک موعد', css: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200' },
  overdue: { label: 'گذشته از موعد', css: 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-200' },
  'not-applicable': { label: 'هنوز لازم نیست', css: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200' },
}

</script>

<template>
  <PageCard title="تقویم چکاپ">
    <p class="muted">این بازه‌ها برای بزرگسالان سالم و عمومی است؛ سابقهٔ خانوادگی یا بیماری آن را تغییر می‌دهد. بازه‌ها قابل ویرایش‌اند و نظر پزشک مقدم است.</p>
    <ul class="flex flex-col gap-3">
      <li v-for="item in store.checkupViews" :key="item.definition.id" class="flex flex-col gap-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
        <div class="flex items-center justify-between gap-2">
          <b class="text-sm">{{ item.definition.title }}</b>
          <span class="rounded-full px-2.5 py-1 text-[11px]" :class="STATUS[item.status].css">{{ STATUS[item.status].label }}</span>
        </div>
        <p class="muted">{{ item.definition.rule }}</p>
        <p v-if="item.note" class="muted">{{ item.note }}</p>
        <p v-if="item.record.lastDate" class="text-xs">آخرین انجام: {{ persianDate(item.record.lastDate) }}<span v-if="item.nextDate"> · نوبت بعدی: {{ item.nextDate.toPersian() }}</span></p>
        <div class="grid grid-cols-2 items-end gap-2">
          <div class="field">
            تاریخ آخرین انجام
            <PersianDatePicker :model-value="item.record.lastDate ?? ''" label="تاریخ آخرین انجام" @update:model-value="store.markCheckupDone(item.definition.id, $event)" />
          </div>
          <label class="field">
            بازه (ماه شمسی)
            <input type="number" min="1" max="120" :value="item.record.intervalMonths" @change="store.setCheckupInterval(item.definition.id, Number(($event.target as HTMLInputElement).value))" />
          </label>
        </div>
        <div class="flex items-center justify-between gap-2">
          <button type="button" class="chip-off" @click="store.markCheckupDone(item.definition.id)">امروز انجام شد</button>
        </div>
        <p v-if="!item.definition.sourceBacked" class="muted">بازهٔ پیش‌فرض این مورد از منبع بالا استخراج نشده و فقط یک مقدار شروع است.</p>
      </li>
    </ul>
  </PageCard>
</template>
