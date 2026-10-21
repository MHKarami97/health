<script setup lang="ts">
defineProps<{ label: string; value: number; goal?: number; tone?: 'teal' | 'amber' }>()
defineEmits<{ (event: 'increment'): void; (event: 'decrement'): void }>()
</script>

<template>
  <div class="flex items-center justify-between gap-3 rounded-xl p-3" :class="tone === 'amber' ? 'bg-amber-50 dark:bg-amber-500/10' : 'bg-teal-50 dark:bg-teal-500/10'">
    <div>
      <p class="text-xs text-slate-600 dark:text-slate-300">{{ label }}</p>
      <p class="text-xl font-bold">{{ value }}<span v-if="goal !== undefined" class="text-sm font-normal text-slate-500"> / {{ goal }}</span></p>
    </div>
    <div class="flex gap-2">
      <button type="button" class="size-9 rounded-full bg-white text-lg shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700" :aria-label="`کم کردن ${label}`" @click="$emit('decrement')">−</button>
      <button type="button" class="size-9 rounded-full bg-teal-600 text-lg text-white shadow-sm" :aria-label="`اضافه کردن ${label}`" @click="$emit('increment')">+</button>
    </div>
  </div>
</template>
