<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@application/stores/appStore'
import { persianDate } from '@domain/valueObjects/DateOnly'
import { SleepCalculator } from '@domain/health/Habit'
import HabitList from '@presentation/components/habits/HabitList.vue'
import CheckInForm from '@presentation/components/habits/CheckInForm.vue'
import BreathingExercise from '@presentation/components/habits/BreathingExercise.vue'
import PageCard from '@presentation/components/shared/PageCard.vue'
import TrendChart from '@presentation/components/shared/TrendChart.vue'
import DisclaimerBanner from '@presentation/components/shared/DisclaimerBanner.vue'

var store = useAppStore()
var recent = computed(() => store.current.checkIns.slice(0, 14).reverse())
var labels = computed(() => recent.value.map((item) => persianDate(item.date)))
var moodSeries = computed(() => [
  { name: 'انرژی', color: '#0d9488', values: recent.value.map((item) => item.energy) },
  { name: 'استرس', color: '#e11d48', values: recent.value.map((item) => item.stress) },
])
var sleepSeries = computed(() => [
  { name: 'ساعت خواب', color: '#6366f1', values: recent.value.map((item) => SleepCalculator.hours(item.sleepStart, item.sleepEnd)) },
])
var sleepGoal = computed(() => store.shared.sleepGoal)

function updateGoal(field: 'start' | 'end', value: string): void {
  store.setSleepGoal(field === 'start' ? value : sleepGoal.value.start, field === 'end' ? value : sleepGoal.value.end)
}
</script>

<template>
  <DisclaimerBanner />
  <HabitList />
  <CheckInForm />

  <PageCard title="هدف مشترک خواب">
    <div class="grid grid-cols-2 gap-3">
      <label class="field">خواب<input type="time" :value="sleepGoal.start" @change="updateGoal('start', ($event.target as HTMLInputElement).value)" /></label>
      <label class="field">بیداری<input type="time" :value="sleepGoal.end" @change="updateGoal('end', ($event.target as HTMLInputElement).value)" /></label>
    </div>
    <p class="muted">این هدف برای همهٔ پروفایل‌های این دستگاه یکی است.</p>
  </PageCard>

  <PageCard v-if="recent.length" title="روند ۱۴ روز اخیر">
    <TrendChart :series="moodSeries" :labels="labels" />
    <TrendChart :series="sleepSeries" :labels="labels" unit="ساعت" />
  </PageCard>

  <BreathingExercise />
</template>
