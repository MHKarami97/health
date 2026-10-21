<script setup lang="ts">
import { computed } from 'vue'
import { SOURCES } from '@domain/health/Sources'

var props = defineProps<{ source: keyof typeof SOURCES }>()
var resolved = computed(() => SOURCES[props.source])
</script>

<template>
  <a :href="resolved.url" target="_blank" rel="noopener noreferrer" class="text-[11px] text-teal-700 underline decoration-dotted dark:text-teal-300" dir="ltr">
    {{ resolved.title }}
  </a>
</template>
