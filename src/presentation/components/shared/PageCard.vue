<script setup lang="ts">
defineProps<{ title?: string }>()
</script>

<template>
  <section class="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
    <h2 v-if="title" class="mb-3 text-base font-semibold">{{ title }}</h2>
    <slot />
  </section>
</template>
