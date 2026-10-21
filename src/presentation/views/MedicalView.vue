<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '@application/stores/appStore'
import { ReportBuilder } from '@application/services/ReportBuilder'
import { PrintReportService } from '@infrastructure/export/PrintReportService'
import CheckupCalendar from '@presentation/components/medical/CheckupCalendar.vue'
import HealthFilePanel from '@presentation/components/medical/HealthFilePanel.vue'
import MeasurementsPanel from '@presentation/components/medical/MeasurementsPanel.vue'
import MedicationsPanel from '@presentation/components/medical/MedicationsPanel.vue'
import AppointmentsPanel from '@presentation/components/medical/AppointmentsPanel.vue'
import DisclaimerBanner from '@presentation/components/shared/DisclaimerBanner.vue'
import TabBar from '@presentation/components/shared/TabBar.vue'

type MedicalTab = 'checkups' | 'file' | 'results' | 'meds' | 'visits'

var store = useAppStore()
var tab = ref<MedicalTab>('checkups')
var tabs: { id: MedicalTab; label: string }[] = [
  { id: 'checkups', label: 'چکاپ' },
  { id: 'file', label: 'پروندهٔ سلامت' },
  { id: 'results', label: 'آزمایش و روند' },
  { id: 'meds', label: 'دارو' },
  { id: 'visits', label: 'نوبت و واکسن' },
]

function exportPdf(): void {
  var html = new ReportBuilder().build(store.current, store.checkupViews)
  new PrintReportService().print(`گزارش سلامت ${store.current.profile.name}`, html)
}
</script>

<template>
  <DisclaimerBanner />
  <div class="flex items-center justify-between gap-2">
    <TabBar v-model="tab" :tabs="tabs" />
  </div>
  <button type="button" class="btn-soft" @click="exportPdf">📄 خروجی PDF برای پزشک</button>

  <CheckupCalendar v-if="tab === 'checkups'" />
  <HealthFilePanel v-else-if="tab === 'file'" />
  <MeasurementsPanel v-else-if="tab === 'results'" />
  <MedicationsPanel v-else-if="tab === 'meds'" />
  <AppointmentsPanel v-else />
</template>
