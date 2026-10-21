<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'

var links = [
  { to: '/', label: 'خانه', icon: '🏠' },
  { to: '/nutrition', label: 'تغذیه', icon: '🥗' },
  { to: '/activity', label: 'فعالیت', icon: '🏃' },
  { to: '/checkups', label: 'چکاپ', icon: '🩺' },
  { to: '/habits', label: 'عادت‌ها', icon: '✅' },
  { to: '/settings', label: 'تنظیمات', icon: '⚙️' },
]
</script>

<template>
  <div class="mx-auto flex min-h-screen w-full max-w-3xl flex-col">
    <header class="sticky top-0 z-20 border-b border-slate-200 bg-white/90 p-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
      <div class="flex items-center justify-between">
        <h1 class="text-lg font-bold text-teal-700 dark:text-teal-300">سلامت</h1>
        <span class="text-xs text-slate-500">جایگزین توصیهٔ پزشک نیست</span>
      </div>
    </header>

    <main class="flex-1 p-4 pb-24">
      <RouterView />
    </main>

    <nav class="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div class="mx-auto grid max-w-3xl grid-cols-6">
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="flex flex-col items-center gap-1 py-2 text-[11px] text-slate-500 transition hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-300"
          active-class="!text-teal-600 dark:!text-teal-300 font-semibold"
        >
          <span class="text-lg">{{ link.icon }}</span>
          {{ link.label }}
        </RouterLink>
      </div>
    </nav>
  </div>
</template>
