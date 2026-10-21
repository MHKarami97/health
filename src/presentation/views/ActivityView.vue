<script setup lang="ts">
import { ref } from 'vue'
import { useHealthStore } from '@application/stores/healthStore'
import { ACTIVITY_LABELS_FA, type ActivityIntensity } from '@domain/health/ActivityLog'
import PageCard from '@presentation/components/shared/PageCard.vue'
import Progressbar from '@presentation/components/shared/Progressbar.vue'

var store = useHealthStore()
var intensity = ref<ActivityIntensity>('moderate')
var minutes = ref(30)
var note = ref('')
var types = Object.keys(ACTIVITY_LABELS_FA) as ActivityIntensity[]

function save(): void {
  try {
    store.addActivityLog(intensity.value, minutes.value, note.value)
    note.value = ''
  } catch (error) {
    alert(error instanceof Error ? error.message : 'خطا')
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <PageCard title="ثبت فعالیت">
      <div class="mb-3 flex flex-wrap gap-2">
        <button
          v-for="item in types"
          :key="item"
          type="button"
          class="rounded-lg px-3 py-1.5 text-xs"
          :class="intensity === item ? 'bg-teal-500 text-white' : 'bg-slate-100 dark:bg-slate-800'"
          @click="intensity = item"
        >
          {{ ACTIVITY_LABELS_FA[item] }}
        </button>
      </div>
      <input v-model.number="minutes" type="number" min="1" class="mb-3 w-full rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800" placeholder="دقیقه" />
      <input v-model="note" class="mb-3 w-full rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800" placeholder="یادداشت اختیاری" />
      <button type="button" class="w-full rounded-xl bg-teal-500 py-2.5 text-sm font-medium text-white" @click="save">ثبت فعالیت</button>
    </PageCard>

    <PageCard title="پیشرفت هفتگی">
      <Progressbar :value="store.activityPercentage" label="فعالیت هوازی" />
      <p class="mt-3 text-sm">تمرین قدرتی: {{ store.activitySummary.strengthDays }} روز</p>
      <p class="mt-1 text-xs text-slate-500">هدف عمومی بزرگسالان: ۱۵۰ دقیقه فعالیت متوسط یا ۷۵ دقیقه فعالیت شدید در هفته.</p>
    </PageCard>

    <PageCard title="یادآور حرکت">
      <p class="text-sm">بعد از نشستن طولانی، هر ۳۰ تا ۶۰ دقیقه چند دقیقه راه بروید یا حرکت سبک انجام دهید.</p>
    </PageCard>
  </div>
</template>
