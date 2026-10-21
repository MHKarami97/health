import { normalizeAppData, type AppData } from '@domain/health/AppData'

export class JsonBackupService {
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
