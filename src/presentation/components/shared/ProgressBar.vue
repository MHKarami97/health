<script setup lang="ts">
defineProps<{ percent: number; label?: string; detail?: string }>()
</script>

<template>
  <div class="flex flex-col gap-1">
    <div v-if="label || detail" class="flex justify-between text-xs text-slate-600 dark:text-slate-300">
      <span>{{ label }}</span>
      <span>{{ detail }}</span>
    </div>
    <div class="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800" role="progressbar" :aria-valuenow="percent" aria-valuemin="0" aria-valuemax="100">
      <div class="h-full rounded-full bg-teal-500 transition-all duration-500" :style="{ width: `${Math.min(100, Math.max(0, percent))}%` }" />
    </div>
  </div>
</template>
