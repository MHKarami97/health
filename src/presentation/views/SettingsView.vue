<script setup lang="ts">
import ProfilePanel from '@presentation/components/settings/ProfilePanel.vue'
import GoalsPanel from '@presentation/components/settings/GoalsPanel.vue'
import SecurityPanel from '@presentation/components/settings/SecurityPanel.vue'
import DataPanel from '@presentation/components/settings/DataPanel.vue'
import PageCard from '@presentation/components/shared/PageCard.vue'
import DisclaimerBanner from '@presentation/components/shared/DisclaimerBanner.vue'
</script>

<template>
  <DisclaimerBanner />
  <ProfilePanel />
  <GoalsPanel />
  <SecurityPanel />
  <DataPanel />
  <PageCard title="منابع">
    <p class="muted">داده‌ها فقط در سیستم همین دستگاه ذخیره می‌شود و به هیچ سروری ارسال نمی‌شود.</p>
  </PageCard>
</template>
