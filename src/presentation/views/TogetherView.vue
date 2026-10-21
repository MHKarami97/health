<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '@application/stores/appStore'
import MealPlanPanel from '@presentation/components/together/MealPlanPanel.vue'
import ShoppingPanel from '@presentation/components/together/ShoppingPanel.vue'
import ChallengesPanel from '@presentation/components/together/ChallengesPanel.vue'
import PageCard from '@presentation/components/shared/PageCard.vue'
import TabBar from '@presentation/components/shared/TabBar.vue'

type TogetherTab = 'challenges' | 'plan' | 'shopping'

var store = useAppStore()
var tab = ref<TogetherTab>('challenges')
var tabs: { id: TogetherTab; label: string }[] = [
  { id: 'challenges', label: 'چالش‌ها' },
  { id: 'plan', label: 'برنامهٔ غذایی' },
  { id: 'shopping', label: 'لیست خرید' },
]
</script>

<template>
  <PageCard v-if="store.profiles.length < 2" title="مشترک با یک نفر دیگر">
    <p class="muted">بخش مشترک روی یک دستگاه با چند پروفایل کار می‌کند (بدون سرور). برای شروع در تنظیمات یک پروفایل دوم بسازید. برای هماهنگی بین دو گوشی، از «خروجی/ورودی پشتیبان» در تنظیمات استفاده کنید.</p>
  </PageCard>
  <TabBar v-model="tab" :tabs="tabs" />
  <ChallengesPanel v-if="tab === 'challenges'" />
  <MealPlanPanel v-else-if="tab === 'plan'" />
  <ShoppingPanel v-else />
</template>
