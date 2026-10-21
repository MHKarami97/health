<script setup lang="ts">
import { computed } from 'vue'

export interface TrendSeries {
  name: string
  color: string
  values: number[]
}

var props = defineProps<{ series: TrendSeries[]; labels: string[]; unit?: string }>()

var WIDTH = 300
var HEIGHT = 120
var PAD = 14

var bounds = computed(() => {
  var all = props.series.flatMap((item) => item.values)
  if (!all.length) return { min: 0, max: 1 }
  var min = Math.min(...all)
  var max = Math.max(...all)
  return min === max ? { min: min - 1, max: max + 1 } : { min, max }
})

function point(index: number, value: number, count: number): [number, number] {
  var x = count <= 1 ? WIDTH / 2 : PAD + (index * (WIDTH - PAD * 2)) / (count - 1)
  var y = HEIGHT - PAD - ((value - bounds.value.min) / (bounds.value.max - bounds.value.min)) * (HEIGHT - PAD * 2)
  return [x, y]
}

var lines = computed(() =>
  props.series.map((item) => ({
    ...item,
    points: item.values.map((value, index) => point(index, value, item.values.length)),
  })),
)
</script>

<template>
  <div v-if="series.some((item) => item.values.length)" class="flex flex-col gap-2" dir="ltr">
    <svg :viewBox="`0 0 ${WIDTH} ${HEIGHT}`" class="h-32 w-full" role="img" aria-label="نمودار روند">
      <line :x1="PAD" :x2="WIDTH - PAD" :y1="HEIGHT - PAD" :y2="HEIGHT - PAD" class="stroke-slate-300 dark:stroke-slate-700" />
      <g v-for="line in lines" :key="line.name">
        <polyline :points="line.points.map((p) => p.join(',')).join(' ')" fill="none" :stroke="line.color" stroke-width="2" stroke-linejoin="round" />
        <circle v-for="(p, i) in line.points" :key="i" :cx="p[0]" :cy="p[1]" r="3" :fill="line.color" />
      </g>
    </svg>
    <div class="flex justify-between text-[11px] text-slate-500">
      <span>{{ labels[0] }}</span>
      <span>{{ bounds.min.toFixed(0) }} – {{ bounds.max.toFixed(0) }} {{ unit }}</span>
      <span>{{ labels[labels.length - 1] }}</span>
    </div>
    <div class="flex gap-3 text-[11px]">
      <span v-for="line in lines" :key="line.name" class="flex items-center gap-1">
        <i class="inline-block size-2 rounded-full" :style="{ background: line.color }" />{{ line.name }}
      </span>
    </div>
  </div>
  <p v-else class="muted">برای دیدن نمودار، حداقل یک مقدار ثبت کنید.</p>
</template>
