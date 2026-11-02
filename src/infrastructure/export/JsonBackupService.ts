import { normalizeAppData, mergeAppData, type AppData } from '@domain/health/AppData'
import type { CloudRestoreMode } from '@domain/health/CloudSync'
import { LocalStorageRepository } from '@infrastructure/storage/LocalStorageRepository'

var STORAGE_KEY = 'salamat-data-v1'

export interface AppStoreBridge {
  data: { value: AppData }
  flush: () => void
  replaceAll: (data: AppData) => void
}

export class JsonBackupService {
  private static storeBridge: AppStoreBridge | null = null

  static registerStore(bridge: AppStoreBridge): void {
    this.storeBridge = bridge
  }

  static buildPayload(): AppData {
    if (this.storeBridge) {
      this.storeBridge.flush()
      return JSON.parse(JSON.stringify(this.storeBridge.data.value))
    }
    var repository = new LocalStorageRepository()
    return normalizeAppData(repository.load<Partial<AppData> | null>(STORAGE_KEY, null))
  }

  static restoreCloudPayload(payload: AppData, mode: CloudRestoreMode): void {
    var repository = new LocalStorageRepository()
    var current = this.storeBridge
      ? JSON.parse(JSON.stringify(this.storeBridge.data.value))
      : normalizeAppData(repository.load<Partial<AppData> | null>(STORAGE_KEY, null))

    var targetData: AppData = mode === 'replace' ? normalizeAppData(payload) : mergeAppData(current, payload)

    if (this.storeBridge) {
      this.storeBridge.replaceAll(targetData)
    } else {
      repository.save(STORAGE_KEY, targetData)
    }
  }

  export(data: AppData, fileName: string): void {
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    var url = URL.createObjectURL(blob)
    var link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()
    URL.revokeObjectURL(url)
  }

  async import(file: File): Promise<AppData> {
    var parsed = JSON.parse(await file.text()) as Partial<AppData>
    if (!parsed || typeof parsed !== 'object' || !parsed.profiles) throw new Error('فایل پشتیبان معتبر نیست')
    return normalizeAppData(parsed)
  }
}
