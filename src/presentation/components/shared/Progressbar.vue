<script setup lang="ts">
var props = defineProps<{ value: number; label?: string }>()
</script>

<template>
  <div class="flex flex-col gap-1">
    <div v-if="label" class="flex justify-between text-xs text-slate-500">
      <span>{{ label }}</span>
      <span>{{ props.value }}٪</span>
    </div>
    <div class="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
      <div class="h-full rounded-full bg-teal-500 transition-all" :style="{ width: `${Math.min(100, props.value)}%` }" />
    </div>
  </div>
</template>
