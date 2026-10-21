<script setup lang="ts">
import { ref } from 'vue'
import { useHealthStore } from '@application/stores/healthStore'
import type { DailyCheckIn } from '@domain/health/Habit'
import PageCard from '@presentation/components/shared/PageCard.vue'

var store = useHealthStore()
var habitTitle = ref('')
var checkIn = ref<DailyCheckIn>({
  date: new Date().toISOString().slice(0, 10),
  mood: 3,
  energy: 3,
  pain: 0,
  stress: 3,
  sleepStart: '23:00',
  sleepEnd: '07:00',
  screenBreaks: 0,
})

function addHabit(): void {
  if (!habitTitle.value.trim()) return
  store.addHabit(habitTitle.value.trim())
  habitTitle.value = ''
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <PageCard title="عادت‌ها">
      <div class="mb-3 flex gap-2">
        <input v-model="habitTitle" placeholder="مثلاً مسواک" class="flex-1 rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800" />
        <button type="button" class="rounded-xl bg-teal-500 px-4 text-sm text-white" @click="addHabit">افزودن</button>
      </div>
      <ul class="space-y-2">
        <li v-for="habit in store.habits" :key="habit.id" class="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
          <span>{{ habit.title }}</span>
          <button type="button" class="rounded-lg px-3 py-1 text-xs" :class="habit.completedDates.length ? 'bg-teal-500 text-white' : 'bg-slate-200 dark:bg-slate-700'" @click="store.toggleHabit(habit.id)">
            {{ habit.completedDates.length ? `${habit.completedDates.length} روز` : 'ثبت امروز' }}
          </button>
        </li>
      </ul>
    </PageCard>

    <PageCard title="چک‌این روزانه">
      <div class="grid grid-cols-2 gap-3">
        <label class="text-xs">انرژی
          <input v-model.number="checkIn.energy" type="range" min="1" max="5" class="mt-2 w-full" />
        </label>
        <label class="text-xs">استرس
          <input v-model.number="checkIn.stress" type="range" min="1" max="5" class="mt-2 w-full" />
        </label>
        <label class="text-xs">درد
          <input v-model.number="checkIn.pain" type="range" min="0" max="5" class="mt-2 w-full" />
        </label>
        <label class="text-xs">شکستن زمان صفحه‌نمایش
          <input v-model.number="checkIn.screenBreaks" type="number" min="0" class="mt-2 w-full rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800" />
        </label>
      </div>
      <button type="button" class="mt-4 w-full rounded-xl bg-teal-500 py-2.5 text-sm font-medium text-white" @click="store.saveCheckIn(checkIn)">
        ذخیرهٔ چک‌این
      </button>
    </PageCard>
  </div>
</template>
