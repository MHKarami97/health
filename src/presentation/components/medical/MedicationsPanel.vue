<script setup lang="ts">
import { reactive } from 'vue'
import { useAppStore } from '@application/stores/appStore'
import PageCard from '@presentation/components/shared/PageCard.vue'
import { useAction } from '@presentation/composables/useAction'

var store = useAppStore()
var action = useAction()
var form = reactive({ name: '', dose: '', kind: 'drug' as 'drug' | 'vitamin', time: '08:00' })

async function add(): Promise<void> {
  var ok = await action.run(() => store.addMedication(form.name, form.dose, form.kind, form.time), 'اضافه شد')
  if (ok) Object.assign(form, { name: '', dose: '' })
}

function isTaken(dates: string[]): boolean {
  return dates.includes(store.todayKey)
}
</script>

<template>
  <PageCard title="دارو و ویتامین">
    <ul class="flex flex-col gap-2">
      <li v-for="item in store.current.medications" :key="item.id" class="flex items-center justify-between gap-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
        <span class="text-sm">{{ item.kind === 'drug' ? '💊' : '🍊' }} {{ item.name }} <span class="muted">{{ item.dose }} · {{ item.time }}</span></span>
        <span class="flex items-center gap-2">
          <button type="button" :class="isTaken(item.takenDates) ? 'chip-on' : 'chip-off'" @click="store.toggleMedicationTaken(item.id)">{{ isTaken(item.takenDates) ? 'مصرف شد ✓' : 'ثبت مصرف' }}</button>
          <button type="button" class="text-xs text-rose-500" :aria-label="`حذف ${item.name}`" @click="store.removeMedication(item.id)">حذف</button>
        </span>
      </li>
    </ul>
    <form class="grid gap-2 sm:grid-cols-4" @submit.prevent="add">
      <input v-model="form.name" placeholder="نام" class="sm:col-span-2" />
      <input v-model="form.dose" placeholder="مقدار (مثلاً ۵۰۰ میلی‌گرم)" />
      <input v-model="form.time" type="time" />
      <select v-model="form.kind" aria-label="نوع"><option value="drug">دارو</option><option value="vitamin">ویتامین</option></select>
      <button type="submit" class="btn-primary sm:col-span-3">افزودن</button>
    </form>
    <p class="muted">برای دریافت یادآور، در تنظیمات «یادآورها» را روشن کنید. یادآورها فقط وقتی برنامه باز است کار می‌کنند.</p>
  </PageCard>
</template>
