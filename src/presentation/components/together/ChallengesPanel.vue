<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useAppStore } from '@application/stores/appStore'
import { CHALLENGE_LABELS, ChallengeEvaluator, type ChallengeKind } from '@domain/health/Challenge'
import { DateOnly, persianDate } from '@domain/valueObjects/DateOnly'
import PageCard from '@presentation/components/shared/PageCard.vue'
import ProgressBar from '@presentation/components/shared/ProgressBar.vue'
import { useAction } from '@presentation/composables/useAction'

var store = useAppStore()
var action = useAction()
var kinds = Object.keys(CHALLENGE_LABELS) as ChallengeKind[]
var form = reactive({ title: '', kind: 'custom' as ChallengeKind, startDate: store.todayKey, endDate: DateOnly.parse(store.todayKey).addDays(6).value, targetMinutes: 300 })

var evaluator = computed(() => new ChallengeEvaluator(DateOnly.parse(store.todayKey)))
var rows = computed(() =>
  store.shared.challenges.map((challenge) => ({ challenge, progress: evaluator.value.evaluate(challenge, store.challengeFacts) })),
)

function preset(kind: ChallengeKind): void {
  var end = DateOnly.parse(store.todayKey).addDays(6).value
  var title = kind === 'no-sweet-drinks' ? 'این هفته نوشابه نداریم' : kind === 'walking-duo' ? 'پیاده‌روی دونفره' : ''
  Object.assign(form, { kind, title, startDate: store.todayKey, endDate: end })
}

async function create(): Promise<void> {
  var ok = await action.run(() => store.addChallenge(form.title, form.kind, form.startDate, form.endDate, form.targetMinutes), 'چالش ساخته شد')
  if (ok) form.title = ''
}

function doneToday(id: string): boolean {
  return (store.shared.challenges.find((item) => item.id === id)?.completions[store.current.profile.id] ?? []).includes(store.todayKey)
}
</script>

<template>
  <PageCard title="چالش‌های مشترک">
    <p v-if="!rows.length" class="muted">چالشی ندارید. یکی از نمونه‌ها را انتخاب کنید.</p>
    <div v-for="row in rows" :key="row.challenge.id" class="flex flex-col gap-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
      <div class="flex items-center justify-between gap-2">
        <b class="text-sm">{{ row.challenge.title }}</b>
        <button type="button" class="text-xs text-rose-500" @click="store.removeChallenge(row.challenge.id)">حذف</button>
      </div>
      <p class="muted">{{ CHALLENGE_LABELS[row.challenge.kind] }} · {{ persianDate(row.challenge.startDate) }} تا {{ persianDate(row.challenge.endDate) }}</p>
      <ProgressBar :percent="row.progress.percent" :detail="row.progress.summary" />
      <ul class="text-xs leading-6"><li v-for="line in row.progress.lines" :key="line">{{ line }}</li></ul>
      <button v-if="row.challenge.kind === 'custom'" type="button" :class="doneToday(row.challenge.id) ? 'chip-on' : 'chip-off'" class="self-start" @click="store.toggleChallengeToday(row.challenge.id)">
        {{ doneToday(row.challenge.id) ? 'امروز انجام شد ✓' : 'ثبت امروز برای من' }}
      </button>
      <p v-else-if="row.challenge.kind === 'walking-duo'" class="muted">پیاده‌روی را از بخش «فعالیت» با نوع «پیاده‌روی تند» ثبت کنید.</p>
      <p v-else class="muted">با شمارندهٔ «نوشیدنی شیرین» در خانه یا تغذیه کار می‌کند؛ روزِ بدون ثبت، بدون نوشیدنی شیرین حساب می‌شود.</p>
    </div>
  </PageCard>

  <PageCard title="چالش جدید">
    <div class="flex flex-wrap gap-2">
      <button type="button" class="chip-off" @click="preset('no-sweet-drinks')">این هفته نوشابه نداریم</button>
      <button type="button" class="chip-off" @click="preset('walking-duo')">پیاده‌روی دونفره</button>
      <button type="button" class="chip-off" @click="preset('custom')">دلخواه</button>
    </div>
    <form class="grid gap-2 sm:grid-cols-2" @submit.prevent="create">
      <input v-model="form.title" placeholder="عنوان چالش" class="sm:col-span-2" maxlength="60" />
      <label class="field">شروع<input v-model="form.startDate" type="date" /></label>
      <label class="field">پایان<input v-model="form.endDate" type="date" /></label>
      <label v-if="form.kind === 'walking-duo'" class="field sm:col-span-2">هدف جمع پیاده‌روی (دقیقه)<input v-model.number="form.targetMinutes" type="number" min="1" /></label>
      <button type="submit" class="btn-primary sm:col-span-2">ساخت چالش</button>
    </form>
  </PageCard>
</template>
