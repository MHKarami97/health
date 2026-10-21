<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAppStore } from '@application/stores/appStore'
import { ActivityCalculator } from '@domain/health/ActivityLog'
import { HabitStreak } from '@domain/health/Habit'
import { DateOnly, persianDate } from '@domain/valueObjects/DateOnly'
import PageCard from '@presentation/components/shared/PageCard.vue'
import ProgressBar from '@presentation/components/shared/ProgressBar.vue'
import Counter from '@presentation/components/shared/Counter.vue'
import DisclaimerBanner from '@presentation/components/shared/DisclaimerBanner.vue'
import SourceLink from '@presentation/components/shared/SourceLink.vue'

var store = useAppStore()
var goals = computed(() => store.current.goals)
var aerobicPercent = computed(() => ActivityCalculator.percent(store.activitySummary.aerobicEquivalent, goals.value.weeklyAerobicMinutes))
var strengthPercent = computed(() => ActivityCalculator.percent(store.activitySummary.strengthDays, goals.value.strengthDays))
var pendingMedications = computed(() => store.current.medications.filter((item) => !item.takenDates.includes(store.todayKey)))
var nextAppointment = computed(() => store.current.appointments.find((item) => item.date >= store.todayKey) ?? null)
var attentionCheckups = computed(() => store.checkupViews.filter((item) => item.status === 'overdue' || item.status === 'soon' || item.status === 'never'))
var todayHasCheckIn = computed(() => store.current.checkIns.some((item) => item.date === store.todayKey))
var daysToAppointment = computed(() => (nextAppointment.value ? DateOnly.parse(nextAppointment.value.date).diffInDays(DateOnly.parse(store.todayKey)) : null))

function isDone(habitId: string): boolean {
  var habit = store.visibleHabits.find((item) => item.id === habitId)
  return !!habit && (habit.completions[store.current.profile.id] ?? []).includes(store.todayKey)
}

function streak(habitId: string): number {
  var habit = store.visibleHabits.find((item) => item.id === habitId)
  return HabitStreak.current(habit?.completions[store.current.profile.id] ?? [], DateOnly.parse(store.todayKey))
}
</script>

<template>
  <DisclaimerBanner />

  <PageCard :title="`سلام ${store.current.profile.name}`">
    <div class="grid gap-3 sm:grid-cols-2">
      <Counter label="لیوان آب امروز" :value="store.todayDrinks.water" :goal="goals.dailyWaterGlasses" @increment="store.addDrink('water', 1)" @decrement="store.addDrink('water', -1)" />
      <Counter label="نوشیدنی شیرین امروز" :value="store.todayDrinks.sweet" tone="amber" @increment="store.addDrink('sweet', 1)" @decrement="store.addDrink('sweet', -1)" />
    </div>
  </PageCard>

  <PageCard title="فعالیت این هفته">
    <ProgressBar :percent="aerobicPercent" label="فعالیت هوازی" :detail="`${store.activitySummary.aerobicEquivalent} از ${goals.weeklyAerobicMinutes} دقیقه`" />
    <ProgressBar :percent="strengthPercent" label="تمرین قدرتی" :detail="`${store.activitySummary.strengthDays} از ${goals.strengthDays} روز`" />
    <SourceLink source="whoPhysicalActivity" />
  </PageCard>

  <PageCard v-if="store.visibleHabits.length" title="عادت‌های امروز">
    <ul class="flex flex-col gap-2">
      <li v-for="habit in store.visibleHabits" :key="habit.id" class="flex items-center justify-between gap-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
        <span class="text-sm">{{ habit.title }} <span v-if="habit.scope === 'shared'" class="muted">(مشترک)</span></span>
        <button type="button" :class="isDone(habit.id) ? 'chip-on' : 'chip-off'" @click="store.toggleHabit(habit.id)">
          {{ isDone(habit.id) ? `انجام شد · ${streak(habit.id)} روز پیاپی` : 'ثبت امروز' }}
        </button>
      </li>
    </ul>
  </PageCard>

  <PageCard v-if="pendingMedications.length || nextAppointment || attentionCheckups.length" title="پیگیری پزشکی">
    <ul class="flex flex-col gap-2 text-sm">
      <li v-for="item in pendingMedications" :key="item.id" class="flex items-center justify-between gap-2">
        <span>💊 {{ item.name }} ({{ item.time }})</span>
        <button type="button" class="chip-off" @click="store.toggleMedicationTaken(item.id)">مصرف شد</button>
      </li>
      <li v-if="nextAppointment">📅 {{ nextAppointment.title }} – {{ persianDate(nextAppointment.date) }}<span v-if="daysToAppointment !== null"> ({{ daysToAppointment === 0 ? 'امروز' : `${daysToAppointment} روز دیگر` }})</span></li>
      <li v-for="item in attentionCheckups" :key="item.definition.id">🩺 {{ item.definition.title }}: {{ item.status === 'never' ? 'هنوز ثبت نشده' : item.status === 'overdue' ? 'موعدش گذشته' : 'نزدیک موعد' }}</li>
    </ul>
    <RouterLink to="/medical" class="text-xs text-teal-700 dark:text-teal-300">رفتن به بخش پزشکی</RouterLink>
  </PageCard>

  <PageCard v-if="!todayHasCheckIn" title="چک‌این ۳۰ ثانیه‌ای">
    <p class="muted">انرژی، درد، استرس و خواب امروز را ثبت کنید.</p>
    <RouterLink to="/habits" class="btn-primary text-center">شروع چک‌این</RouterLink>
  </PageCard>
</template>
