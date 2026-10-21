<script setup lang="ts">
import { SOURCES } from '@domain/health/Sources'
import ProfilePanel from '@presentation/components/settings/ProfilePanel.vue'
import GoalsPanel from '@presentation/components/settings/GoalsPanel.vue'
import SecurityPanel from '@presentation/components/settings/SecurityPanel.vue'
import DataPanel from '@presentation/components/settings/DataPanel.vue'
import PageCard from '@presentation/components/shared/PageCard.vue'
import DisclaimerBanner from '@presentation/components/shared/DisclaimerBanner.vue'

var sources = Object.values(SOURCES)
</script>

<template>
  <DisclaimerBanner />
  <ProfilePanel />
  <GoalsPanel />
  <SecurityPanel />
  <DataPanel />
  <PageCard title="منابع">
    <ul class="list-disc space-y-1 ps-5 text-sm">
      <li v-for="source in sources" :key="source.id"><a :href="source.url" target="_blank" rel="noopener noreferrer" class="text-teal-700 underline dark:text-teal-300" dir="ltr">{{ source.title }}</a></li>
    </ul>
    <p class="muted">داده‌ها فقط در مرورگر همین دستگاه ذخیره می‌شود و به هیچ سروری ارسال نمی‌شود.</p>
  </PageCard>
</template>
