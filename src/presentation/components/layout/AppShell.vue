<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useLockStore } from '@application/stores/lockStore'
import ProfileSwitcher from '@presentation/components/shared/ProfileSwitcher.vue'

var lockStore = useLockStore()

var tabs = [
  { to: '/', label: 'خانه', icon: '🏠' },
  { to: '/nutrition', label: 'تغذیه', icon: '🥗' },
  { to: '/activity', label: 'فعالیت', icon: '🏃' },
  { to: '/medical', label: 'پزشکی', icon: '🩺' },
  { to: '/habits', label: 'عادت‌ها', icon: '✅' },
  { to: '/together', label: 'مشترک', icon: '👥' },
]
</script>

<template>
  <div class="mx-auto flex min-h-dvh w-full max-w-3xl flex-col">
    <header class="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
      <RouterLink to="/" class="text-lg font-bold text-teal-700 dark:text-teal-300">سلامت</RouterLink>
      <div class="flex items-center gap-2">
        <ProfileSwitcher />
        <button v-if="lockStore.isEnabled" type="button" class="rounded-lg px-2 py-1 text-lg" aria-label="قفل برنامه" @click="lockStore.lock()">🔒</button>
        <RouterLink to="/settings" class="rounded-lg px-2 py-1 text-lg" aria-label="تنظیمات">⚙️</RouterLink>
      </div>
    </header>

    <main class="flex flex-1 flex-col gap-4 p-4 pb-28">
      <RouterView />
    </main>

    <nav class="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] dark:border-slate-800 dark:bg-slate-900" aria-label="منوی اصلی">
      <div class="mx-auto grid max-w-3xl grid-cols-6">
        <RouterLink
          v-for="tab in tabs"
          :key="tab.to"
          :to="tab.to"
          class="flex flex-col items-center gap-0.5 py-2 text-[11px] text-slate-500 transition dark:text-slate-400"
          exact-active-class="!text-teal-600 font-semibold dark:!text-teal-300"
        >
          <span class="text-lg" aria-hidden="true">{{ tab.icon }}</span>
          {{ tab.label }}
        </RouterLink>
      </div>
    </nav>
  </div>
</template>
