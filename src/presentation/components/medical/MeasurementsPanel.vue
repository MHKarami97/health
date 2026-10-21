<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAppStore } from '@application/stores/appStore'
import { BODY_TYPES, MEASUREMENT_LABELS, MEASUREMENT_UNITS, type MeasurementType } from '@domain/health/Medical'
import { Trend } from '@domain/health/Trend'
import { DateOnly, persianDate } from '@domain/valueObjects/DateOnly'
import PageCard from '@presentation/components/shared/PageCard.vue'
import TrendChart, { type TrendSeries } from '@presentation/components/shared/TrendChart.vue'
import { useAction } from '@presentation/composables/useAction'

var store = useAppStore()
var action = useAction()

var type = ref<MeasurementType>('blood-pressure')
var value = ref<number | null>(null)
var secondary = ref<number | null>(null)
var label = ref('')
var unit = ref('')

var availableTypes = computed(() =>
  (Object.keys(MEASUREMENT_LABELS) as MeasurementType[]).filter((item) => store.current.settings.trackBody || !BODY_TYPES.includes(item)),
)
watch(availableTypes, (types) => { if (!types.includes(type.value)) type.value = types[0] })

var items = computed(() =>
  store.current.measurements
    .filter((item) => item.type === type.value && (type.value !== 'other' || item.label === label.value || !label.value))
    .slice()
    .reverse()
    .slice(-20),
)

var labels = computed(() => items.value.map((item) => persianDate(item.date)))
var series = computed<TrendSeries[]>(() => {
  var main: TrendSeries = {
    name: type.value === 'blood-pressure' ? 'سیستول' : MEASUREMENT_LABELS[type.value],
    color: '#0d9488',
    values: items.value.map((item) => item.value),
  }
  if (type.value !== 'blood-pressure') return [main]
  return [main, { name: 'دیاستول', color: '#e11d48', values: items.value.map((item) => item.secondary ?? item.value) }]
})

var bodyTrend = computed(() => {
  if (!BODY_TYPES.includes(type.value)) return null
  var today = DateOnly.parse(store.todayKey)
  var all = store.current.measurements.filter((item) => item.type === type.value)
  var inRange = (from: number, to: number): number[] =>
    all.filter((item) => {
      var age = today.diffInDays(DateOnly.parse(item.date))
      return age >= from && age < to
    }).map((item) => item.value)
  return { recent: Trend.average(inRange(0, 7)), change: Trend.change(inRange(0, 7), inRange(7, 35)) }
})

async function save(): Promise<void> {
  var ok = await action.run(() => {
    if (value.value === null) throw new Error('مقدار را وارد کنید')
    if (type.value === 'blood-pressure' && secondary.value === null) throw new Error('فشار دیاستولیک را هم وارد کنید')
    store.addMeasurement(type.value, value.value, type.value === 'blood-pressure' ? secondary.value : null, label.value, unit.value)
  }, 'ثبت شد')
  if (ok) {
    value.value = null
    secondary.value = null
  }
}
</script>

<template>
  <PageCard title="نتایج آزمایش و اندازه‌گیری">
    <div class="flex flex-wrap gap-2">
      <button v-for="item in availableTypes" :key="item" type="button" :class="type === item ? 'chip-on' : 'chip-off'" @click="type = item">{{ MEASUREMENT_LABELS[item] }}</button>
    </div>
    <form class="grid gap-2 sm:grid-cols-2" @submit.prevent="save">
      <template v-if="type === 'other'">
        <input v-model="label" placeholder="نام آزمایش (مثلاً HbA1c)" />
        <input v-model="unit" placeholder="واحد" dir="ltr" />
      </template>
      <input v-model.number="value" type="number" step="any" inputmode="decimal" :placeholder="type === 'blood-pressure' ? 'سیستولیک' : `مقدار (${MEASUREMENT_UNITS[type] || 'واحد'})`" />
      <input v-if="type === 'blood-pressure'" v-model.number="secondary" type="number" inputmode="numeric" placeholder="دیاستولیک" />
      <button type="submit" class="btn-primary sm:col-span-2">ثبت</button>
    </form>
    <p v-if="!store.current.settings.trackBody" class="muted">ثبت وزن و دور کمر پیش‌فرض خاموش است. اگر خواستید، از تنظیمات روشنش کنید.</p>
  </PageCard>

  <PageCard title="نمودار روند">
    <p v-if="bodyTrend" class="text-sm">
      میانگین ۷ روز اخیر: <b>{{ bodyTrend.recent ?? '—' }}</b>
      <span v-if="bodyTrend.change !== null"> · تغییر نسبت به ۴ هفتهٔ قبل: {{ bodyTrend.change > 0 ? '+' : '' }}{{ bodyTrend.change }}</span>
    </p>
    <p v-if="bodyTrend" class="muted">برای این موارد به روند نگاه کنید، نه عدد یک روز.</p>
    <TrendChart :series="series" :labels="labels" :unit="MEASUREMENT_UNITS[type]" />
  </PageCard>

  <PageCard v-if="items.length" title="ثبت‌ها">
    <ul class="flex flex-col gap-2">
      <li v-for="item in items.slice().reverse().slice(0, 10)" :key="item.id" class="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800/60">
        <span>{{ persianDate(item.date) }} · {{ item.type === 'other' ? item.label : MEASUREMENT_LABELS[item.type] }}: <b>{{ item.value }}<template v-if="item.secondary"> / {{ item.secondary }}</template></b> {{ item.unit }}</span>
        <button type="button" class="text-xs text-rose-500" @click="store.removeMeasurement(item.id)">حذف</button>
      </li>
    </ul>
  </PageCard>
</template>
