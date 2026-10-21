<script setup lang="ts" generic="T extends string">
defineProps<{ tabs: { id: T; label: string }[]; modelValue: T }>()
defineEmits<{ (event: 'update:modelValue', value: T): void }>()
</script>

<template>
  <div class="flex gap-2 overflow-x-auto pb-1" role="tablist">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      type="button"
      role="tab"
      :aria-selected="tab.id === modelValue"
      class="shrink-0"
      :class="tab.id === modelValue ? 'chip-on' : 'chip-off'"
      @click="$emit('update:modelValue', tab.id)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>
