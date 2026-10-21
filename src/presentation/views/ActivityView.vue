<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAppStore } from '@application/stores/appStore'
import { ACTIVITY_LABELS, ActivityCalculator, type ActivityKind } from '@domain/health/ActivityLog'
import { persianDate } from '@domain/valueObjects/DateOnly'
import { BrowserNotifier } from '@infrastructure/notifications/BrowserNotifier'
import PageCard from '@presentation/components/shared/PageCard.vue'
import ProgressBar from '@presentation/components/shared/ProgressBar.vue'
import SourceLink from '@presentation/components/shared/SourceLink.vue'
import DisclaimerBanner from '@presentation/components/shared/DisclaimerBanner.vue'
import { useAction } from '@presentation/composables/useAction'

var store = useAppStore()
var action = useAction()
var notifier = new BrowserNotifier()

var kind = ref<ActivityKind>('walking')
var minutes = ref(30)
var note = ref('')
var kinds = Object.keys(ACTIVITY_LABELS) as ActivityKind[]
var presets = [10, 20, 30, 45, 60]
var moveOptions = [{ value: 0, label: 'خاموش' }, { value: 30, label: 'هر ۳۰ دقیقه' }, { value: 45, label: 'هر ۴۵ دقیقه' }, { value: 60, label: 'هر ۶۰ دقیقه' }]

var goals = computed(() => store.current.goals)
var summary = computed(() => store.activitySummary)
var aerobicPercent = computed(() => ActivityCalculator.percent(summary.value.aerobicEquivalent, goals.value.weeklyAerobicMinutes))
var extendedPercent = computed(() => ActivityCalculator.percent(summary.value.aerobicEquivalent, 300))
var strengthPercent = computed(() => ActivityCalculator.percent(summary.value.strengthDays, goals.value.strengthDays))

async function save(): Promise<void> {
  var ok = await action.run(() => store.addActivity(kind.value, minutes.value, note.value), 'فعالیت ثبت شد')
  if (ok) note.value = ''
}

async function changeMoveReminder(value: number): Promise<void> {
  store.updateSettings({ ...store.current.settings, moveReminderMinutes: value, remindersEnabled: value > 0 ? true : store.current.settings.remindersEnabled })
  if (value > 0 && notifier.permission === 'default') await notifier.requestPermission()
}
</script>

<template>
  <DisclaimerBanner />

  <PageCard title="ثبت فعالیت">
    <div class="flex flex-wrap gap-2">
      <button v-for="item in kinds" :key="item" type="button" :class="kind === item ? 'chip-on' : 'chip-off'" @click="kind = item">{{ ACTIVITY_LABELS[item] }}</button>
    </div>
    <div class="flex flex-wrap gap-2">
      <button v-for="item in presets" :key="item" type="button" :class="minutes === item ? 'chip-on' : 'chip-off'" @click="minutes = item">{{ item }} دقیقه</button>
    </div>
    <div class="grid gap-3 sm:grid-cols-2">
      <label class="field">مدت (دقیقه)<input v-model.number="minutes" type="number" min="1" max="600" inputmode="numeric" /></label>
      <label class="field">یادداشت (اختیاری)<input v-model="note" maxlength="80" /></label>
    </div>
    <button type="button" class="btn-primary" @click="save">ثبت فعالیت</button>
  </PageCard>

  <PageCard title="پیشرفت این هفته">
    <ProgressBar :percent="aerobicPercent" label="هدف ۱۵۰ دقیقه (فعالیت متوسط)" :detail="`${summary.aerobicEquivalent} از ${goals.weeklyAerobicMinutes}`" />
    <ProgressBar :percent="extendedPercent" label="برای فایدهٔ بیشتر: ۳۰۰ دقیقه" :detail="`${summary.aerobicEquivalent} از 300`" />
    <ProgressBar :percent="strengthPercent" label="تمرین قدرتی (روز)" :detail="`${summary.strengthDays} از ${goals.strengthDays}`" />
    <p class="muted">
      پیاده‌روی تند و فعالیت متوسط هر دقیقه یک امتیاز و فعالیت شدید هر دقیقه دو امتیاز دارد (۷۵ دقیقه شدید معادل ۱۵۰ دقیقه متوسط). هفته از شنبه شروع می‌شود.
      پیاده‌روی ثبت‌شده: {{ summary.walkingMinutes }} · متوسط: {{ summary.moderateMinutes }} · شدید: {{ summary.vigorousMinutes }} دقیقه.
    </p>
    <SourceLink source="whoPhysicalActivity" />
  </PageCard>

  <PageCard title="یادآور «بلند شو و حرکت کن»">
    <p class="muted">در رهنمودهای WHO کم کردن رفتار کم‌تحرک هم توصیه شده است. یادآور فقط وقتی برنامه باز است کار می‌کند و بین ساعت ۲۲ تا ۸ ساکت است.</p>
    <div class="flex flex-wrap gap-2">
      <button v-for="option in moveOptions" :key="option.value" type="button" :class="store.current.settings.moveReminderMinutes === option.value ? 'chip-on' : 'chip-off'" @click="changeMoveReminder(option.value)">{{ option.label }}</button>
    </div>
    <SourceLink source="whoSedentary" />
  </PageCard>

  <PageCard v-if="store.current.activityLogs.length" title="ثبت‌های اخیر">
    <ul class="flex flex-col gap-2">
      <li v-for="log in store.current.activityLogs.slice(0, 12)" :key="log.id" class="flex items-center justify-between gap-2 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800/60">
        <span>{{ persianDate(log.date) }} · {{ ACTIVITY_LABELS[log.kind] }} · {{ log.minutes }} دقیقه <span class="muted">{{ log.note }}</span></span>
        <button type="button" class="text-xs text-rose-500" @click="store.removeActivity(log.id)">حذف</button>
      </li>
    </ul>
  </PageCard>
</template>
