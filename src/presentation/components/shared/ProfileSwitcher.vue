<script setup lang="ts">
import { useAppStore } from '@application/stores/appStore'

var store = useAppStore()
</script>

<template>
  <select
    v-if="store.profiles.length > 1"
    :value="store.data.activeProfileId"
    class="!w-auto max-w-32 !py-1 text-xs"
    aria-label="انتخاب پروفایل"
    @change="store.setActiveProfile(($event.target as HTMLSelectElement).value)"
  >
    <option v-for="profile in store.profiles" :key="profile.id" :value="profile.id">{{ profile.name }}</option>
  </select>
</template>
