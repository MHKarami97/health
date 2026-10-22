<script setup lang="ts">
import { computed } from 'vue'

var props = defineProps<{ label: string; modelValue: number; min?: number; max?: number; lowLabel?: string; highLabel?: string }>()
defineEmits<{ (event: 'update:modelValue', value: number): void }>()

var values = computed(() => {
  var from = props.min ?? 1
  var to = props.max ?? 5
  return Array.from({ length: to - from + 1 }, (_, index) => from + index)
})
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <div class="flex justify-between text-xs text-slate-600 dark:text-slate-300">
      <span>{{ label }}</span>
      <span class="text-slate-400">→ {{ lowLabel }}  .  {{ highLabel }} ←</span>
    </div>
    <div class="flex gap-2" role="radiogroup" :aria-label="label">
      <button v-for="value in values" :key="value" type="button" role="radio" :aria-checked="value === modelValue" class="size-9" :class="value === modelValue ? 'chip-on' : 'chip-off'" @click="$emit('update:modelValue', value)">{{ value }}</button>
    </div>
  </div>
</template>
