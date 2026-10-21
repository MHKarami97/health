<script setup lang="ts">
defineProps<{ title?: string }>()
</script>

<template>
  <section class="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
    <div v-if="title || $slots.header" class="flex items-center justify-between gap-2">
      <h2 v-if="title" class="text-base font-semibold">{{ title }}</h2>
      <slot name="header" />
    </div>
    <slot />
  </section>
</template>
