<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { useAppStore } from '@application/stores/appStore'
import { SleepCalculator, type DailyCheckIn } from '@domain/health/Habit'
import PageCard from '@presentation/components/shared/PageCard.vue'
import RatingChips from '@presentation/components/shared/RatingChips.vue'
import { useAction } from '@presentation/composables/useAction'

var store = useAppStore()
var action = useAction()

function blank(): DailyCheckIn {
  var existing = store.current.checkIns.find((item) => item.date === store.todayKey)
  return existing
    ? { ...existing }
    : {
        date: store.todayKey, mood: 3, energy: 3, pain: 0, stress: 3,
        sleepStart: store.shared.sleepGoal.start, sleepEnd: store.shared.sleepGoal.end, screenHours: 0, sittingBreaks: 0,
      }
}

var form = reactive<DailyCheckIn>(blank())
watch(() => [store.current.profile.id, store.todayKey], () => Object.assign(form, blank()))

var sleepHours = computed(() => SleepCalculator.hours(form.sleepStart, form.sleepEnd))
var goalHours = computed(() => SleepCalculator.hours(store.shared.sleepGoal.start, store.shared.sleepGoal.end))

function save(): void {
  void action.run(() => store.saveCheckIn({ ...form }), 'چک‌این امروز ذخیره شد')
}
</script>

<template>
  <PageCard title="چک‌این روزانه">
    <RatingChips v-model="form.mood" label="حال کلی" low-label="بد" high-label="عالی" />
    <RatingChips v-model="form.energy" label="انرژی" low-label="کم" high-label="زیاد" />
    <RatingChips v-model="form.stress" label="سطح استرس" low-label="کم" high-label="زیاد" />
    <RatingChips v-model="form.pain" label="درد" :min="0" low-label="بدون درد" high-label="شدید" />

    <div class="grid grid-cols-2 gap-3">
      <label class="field">ساعت خواب<input v-model="form.sleepStart" type="time" /></label>
      <label class="field">ساعت بیداری<input v-model="form.sleepEnd" type="time" /></label>
    </div>
    <p class="muted">مدت خواب: {{ sleepHours }} ساعت · هدف مشترک: {{ goalHours }} ساعت ({{ store.shared.sleepGoal.start }} تا {{ store.shared.sleepGoal.end }})</p>

    <div class="grid grid-cols-2 gap-3">
      <label class="field">ساعت صفحه‌نمایش<input v-model.number="form.screenHours" type="number" min="0" max="24" step="0.5" inputmode="decimal" /></label>
      <label class="field">دفعات بلند شدن از نشستن<input v-model.number="form.sittingBreaks" type="number" min="0" max="50" inputmode="numeric" /></label>
    </div>
    <button type="button" class="btn-primary" @click="save">ذخیره</button>
  </PageCard>
</template>
