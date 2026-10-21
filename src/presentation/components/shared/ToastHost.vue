<script setup lang="ts">
import { useToastStore } from '@application/stores/toastStore'

var toast = useToastStore()
</script>

<template>
  <div class="pointer-events-none fixed inset-x-4 bottom-24 z-50 mx-auto flex max-w-md flex-col gap-2" aria-live="polite">
    <div v-for="message in toast.messages" :key="message.id" class="rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-lg dark:bg-slate-100 dark:text-slate-900">
      {{ message.text }}
    </div>
  </div>
</template>
