<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '@application/stores/appStore'
import { ReportBuilder } from '@application/services/ReportBuilder'
import { JsonBackupService } from '@infrastructure/export/JsonBackupService'
import { PrintReportService } from '@infrastructure/export/PrintReportService'
import PageCard from '@presentation/components/shared/PageCard.vue'
import { useAction } from '@presentation/composables/useAction'

var store = useAppStore()
var action = useAction()
var backup = new JsonBackupService()
var fileInput = ref<HTMLInputElement | null>(null)

function exportPdf(): void {
  var html = new ReportBuilder().build(store.current, store.checkupViews)
  new PrintReportService().print(`گزارش سلامت ${store.current.profile.name}`, html)
}

function exportJson(): void {
  store.flush()
  backup.export(store.data, `salamat-backup-${store.todayKey}.json`)
}

async function importJson(event: Event): Promise<void> {
  var input = event.target as HTMLInputElement
  var file = input.files?.[0]
  if (!file) return
  if (!confirm('با وارد کردن پشتیبان، همهٔ داده‌های فعلی جایگزین می‌شود. ادامه می‌دهید؟')) {
    input.value = ''
    return
  }
  await action.run(async () => store.replaceAll(await backup.import(file)), 'پشتیبان بازیابی شد')
  input.value = ''
}

function reset(): void {
  if (!confirm('همهٔ داده‌ها پاک شود؟ این کار برگشت‌پذیر نیست.')) return
  store.resetAll()
}
</script>

<template>
  <PageCard title="خروجی و پشتیبان">
    <button type="button" class="btn-primary" @click="exportPdf">📄 خروجی PDF برای پزشک ({{ store.current.profile.name }})</button>
    <button type="button" class="btn-soft" @click="exportJson">⬇️ خروجی پشتیبان (JSON، همهٔ پروفایل‌ها)</button>
    <button type="button" class="btn-soft" @click="fileInput?.click()">⬆️ ورود پشتیبان</button>
    <input ref="fileInput" type="file" accept="application/json,.json" class="hidden" @change="importJson" />
    <p class="muted">برای PDF در پنجرهٔ چاپ «Save as PDF» را انتخاب کنید. پشتیبان JSON رمزنگاری نشده است؛ آن را امن نگه دارید.</p>
    <button type="button" class="btn-danger" @click="reset">پاک کردن همهٔ داده‌ها</button>
  </PageCard>
</template>
