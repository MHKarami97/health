<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { JalaliCalendar, type JalaliDate } from '@domain/valueObjects/JalaliCalendar'

interface DayCell {
  day: number
  iso: string
  isSelected: boolean
  isToday: boolean
  isFriday: boolean
}

var props = withDefaults(defineProps<{
  modelValue: string
  label?: string
  placeholder?: string
  clearable?: boolean
}>(), {
  label: 'تاریخ',
  placeholder: 'انتخاب تاریخ',
  clearable: true,
})

var emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()

var YEARS = Array.from({ length: JalaliCalendar.maxYear - JalaliCalendar.minYear + 1 }, (_, index) => JalaliCalendar.minYear + index)
var MONTHS = JalaliCalendar.monthNames.map((name, index) => ({ value: index + 1, name }))

var isOpen = ref(false)
var viewYear = ref<number>(JalaliCalendar.minYear)
var viewMonth = ref(1)
var today = ref<JalaliDate>(JalaliCalendar.today())
var trigger = ref<HTMLButtonElement | null>(null)
var panel = ref<HTMLElement | null>(null)

var selected = computed(() => JalaliCalendar.fromIso(props.modelValue))
var triggerText = computed(() => (selected.value ? JalaliCalendar.format(selected.value) : props.placeholder))

var cells = computed<(DayCell | null)[]>(() => {
  if (!isOpen.value) return []
  var offset = JalaliCalendar.firstWeekdayIndex(viewYear.value, viewMonth.value)
  var length = JalaliCalendar.daysInMonth(viewYear.value, viewMonth.value)
  var result: (DayCell | null)[] = Array.from({ length: offset }, () => null)
  for (var day = 1; day <= length; day++) {
    var date: JalaliDate = { year: viewYear.value, month: viewMonth.value, day }
    result.push({
      day,
      iso: JalaliCalendar.toIso(date),
      isSelected: isSame(selected.value, date),
      isToday: isSame(today.value, date),
      isFriday: (offset + day - 1) % 7 === 6,
    })
  }
  return result
})

function isSame(a: JalaliDate | null, b: JalaliDate): boolean {
  return a !== null && a.year === b.year && a.month === b.month && a.day === b.day
}

function clampYear(year: number): number {
  return Math.min(JalaliCalendar.maxYear, Math.max(JalaliCalendar.minYear, year))
}

function open(): void {
  today.value = JalaliCalendar.today()
  var base = selected.value ?? today.value
  viewYear.value = clampYear(base.year)
  viewMonth.value = base.month
  isOpen.value = true
  void nextTick(() => panel.value?.focus())
}

function close(): void {
  isOpen.value = false
  void nextTick(() => trigger.value?.focus())
}

function shiftMonth(delta: number): void {
  var index = viewYear.value * 12 + (viewMonth.value - 1) + delta
  var year = Math.floor(index / 12)
  if (year < JalaliCalendar.minYear || year > JalaliCalendar.maxYear) return
  viewYear.value = year
  viewMonth.value = (index % 12) + 1
}

function commit(iso: string): void {
  emit('update:modelValue', iso)
  close()
}

function dayClass(cell: DayCell): string[] {
  return [
    'size-10 rounded-full text-sm transition-colors',
    cell.isSelected
      ? 'bg-teal-600 font-semibold text-white'
      : 'hover:bg-slate-100 dark:hover:bg-slate-800',
    cell.isToday && !cell.isSelected ? 'ring-1 ring-teal-500' : '',
    cell.isFriday && !cell.isSelected ? 'text-rose-500' : '',
  ]
}
</script>

<template>
  <div class="relative">
    <button
      ref="trigger"
      type="button"
      class="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-start text-sm dark:border-slate-700 dark:bg-slate-900"
      :class="selected ? '' : 'text-slate-400'"
      :aria-label="`${label}: ${triggerText}`"
      aria-haspopup="dialog"
      :aria-expanded="isOpen"
      @click="open"
    >
      <span>{{ triggerText }}</span>
      <span aria-hidden="true">📅</span>
    </button>

    <Teleport to="body">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/50 sm:items-center sm:p-4"
        @click.self="close"
      >
        <div
          ref="panel"
          role="dialog"
          aria-modal="true"
          :aria-label="label"
          tabindex="-1"
          dir="rtl"
          class="w-full max-w-sm rounded-t-2xl bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-xl outline-none dark:bg-slate-900 sm:rounded-2xl sm:pb-4"
          @keydown.esc.stop="close"
        >
          <div class="mb-3 flex items-center justify-between gap-2">
            <button type="button" class="btn-soft !px-3" aria-label="ماه قبل" @click="shiftMonth(-1)">
              <svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
            </button>
            <div class="flex flex-1 gap-2">
              <select v-model.number="viewMonth" class="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900" aria-label="ماه">
                <option v-for="month in MONTHS" :key="month.value" :value="month.value">{{ month.name }}</option>
              </select>
              <select v-model.number="viewYear" class="w-24 rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900" aria-label="سال">
                <option v-for="year in YEARS" :key="year" :value="year">{{ JalaliCalendar.digits(year) }}</option>
              </select>
            </div>
            <button type="button" class="btn-soft !px-3" aria-label="ماه بعد" @click="shiftMonth(1)">
              <svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
            </button>
          </div>

          <div class="grid grid-cols-7 text-center text-xs text-slate-500 dark:text-slate-400" aria-hidden="true">
            <span v-for="(weekday, index) in JalaliCalendar.weekdayLabels" :key="weekday" class="py-1" :class="index === 6 ? 'text-rose-500' : ''">{{ weekday }}</span>
          </div>

          <div class="grid grid-cols-7 justify-items-center gap-y-1">
            <template v-for="(cell, index) in cells" :key="index">
              <span v-if="cell === null" />
              <button v-else type="button" :class="dayClass(cell)" :aria-pressed="cell.isSelected" :aria-label="JalaliCalendar.format({ year: viewYear, month: viewMonth, day: cell.day })" @click="commit(cell.iso)">
                {{ JalaliCalendar.digits(cell.day) }}
              </button>
            </template>
          </div>

          <div class="mt-4 flex gap-2">
            <button type="button" class="btn-soft flex-1" @click="commit(JalaliCalendar.toIso(today))">امروز</button>
            <button v-if="clearable && modelValue" type="button" class="btn-soft flex-1" @click="commit('')">پاک کردن</button>
            <button type="button" class="btn-soft flex-1" @click="close">بستن</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
