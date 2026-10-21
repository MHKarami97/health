<script setup lang="ts">
import { useThemeStore, type ThemeMode } from '@application/stores/themeStore'

var themeStore = useThemeStore()

var options: { value: ThemeMode; label: string; icon: string }[] = [
  { value: 'system', label: 'سیستم', icon: '🖥️' },
  { value: 'light', label: 'روشن', icon: '☀️' },
  { value: 'dark', label: 'تاریک', icon: '🌙' },
]
</script>

<template>
  <div class="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
    <h2 class="text-base font-semibold">ظاهر برنامه</h2>

    <div class="flex flex-wrap gap-2" role="radiogroup" aria-label="انتخاب تم">
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        role="radio"
        :aria-checked="themeStore.mode === option.value"
        :class="themeStore.mode === option.value ? 'chip-on' : 'chip-off'"
        @click="themeStore.setMode(option.value)"
      >
        {{ option.icon }} {{ option.label }}
      </button>
    </div>

    <p class="muted">
      در حالت «سیستم»، تم برنامه از تنظیمات روشن/تاریک دستگاه شما پیروی می‌کند.
      انتخاب فعلی: {{ themeStore.isDark ? 'تاریک' : 'روشن' }}
    </p>
  </div>
</template>