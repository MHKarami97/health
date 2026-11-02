import type { BackupFingerprint } from '@domain/health/CloudSync'
import { normalizeAppData, type AppData } from '@domain/health/AppData'
import { JsonBackupService } from '@infrastructure/export/JsonBackupService'
import { hashSha256, stableStringify, deriveKey, encryptWithKey, decryptWithKey } from './cloudCrypto'
import { CLOUD_CONFIG } from './cloudConfig'
import { CloudSyncError } from './CloudSyncError'
import type { CloudKeyVault } from './CloudKeyVault'

export interface LocalSnapshot {
  payload: AppData
  fingerprint: BackupFingerprint
}

export interface EncryptedCloudBackupContainer {
  format: 'salamat-encrypted-backup'
  version: '1.0'
  algorithm: 'AES-GCM'
  kdf: 'PBKDF2'
  iterations: number
  salt: string
  iv: string
  ciphertext: string
  checksum: string
  meta: {
    createdAt: string
    itemsCount: number
    contentHash?: string
    source?: 'manual' | 'cloud'
  }
}

export class CloudBackupCodec {
  constructor(private readonly vault: CloudKeyVault) {}

  async snapshotLocal(): Promise<LocalSnapshot> {
    var payload = JsonBackupService.buildPayload()
    return { payload, fingerprint: await this.fingerprintOf(payload) }
  }

  async fingerprintOf(payload: AppData): Promise<BackupFingerprint> {
    var contentHash = await hashSha256(stableStringify(payload))
    var itemsCount = 0

    Object.values(payload.profiles || {}).forEach((p) => {
      itemsCount +=
        (p.nutritionLogs?.length || 0) +
        (p.drinkLogs?.length || 0) +
        (p.activityLogs?.length || 0) +
        (p.measurements?.length || 0) +
        (p.medications?.length || 0) +
        (p.appointments?.length || 0) +
        (p.vaccines?.length || 0) +
        (p.checkIns?.length || 0)
    })

    itemsCount +=
      (payload.shared?.shopping?.length || 0) +
      (payload.shared?.challenges?.length || 0) +
      (payload.shared?.habits?.length || 0)

    return { contentHash, itemsCount }
  }

  async serialize(snapshot: LocalSnapshot, encrypt: boolean): Promise<string> {
    var json = JSON.stringify(snapshot.payload)
    if (!encrypt) return json

    var record = await this.vault.getKey()
    if (!record) {
      throw new CloudSyncError(
        'KEY_MISSING',
        'کلید رمزنگاری روی این دستگاه موجود نیست؛ رمزنگاری را دوباره فعال کنید.',
      )
    }

    var encrypted = await encryptWithKey(json, record.key)
    var container: EncryptedCloudBackupContainer = {
      format: 'salamat-encrypted-backup',
      version: '1.0',
      algorithm: 'AES-GCM',
      kdf: 'PBKDF2',
      iterations: record.iterations,
      salt: record.saltHex,
      iv: encrypted.iv,
      ciphertext: encrypted.ciphertext,
      checksum: await hashSha256(json),
      meta: {
        createdAt: new Date().toISOString(),
        itemsCount: snapshot.fingerprint.itemsCount,
        contentHash: snapshot.fingerprint.contentHash,
        source: 'cloud',
      },
    }
    return JSON.stringify(container)
  }

  async open(content: string, passphrase?: string): Promise<AppData> {
    var parsed: any
    try {
      parsed = JSON.parse(content)
    } catch {
      throw new CloudSyncError('INVALID_BACKUP', 'فایل پشتیبان ابری آسیب دیده است.')
    }

    if (parsed.format !== 'salamat-encrypted-backup') {
      if (parsed.profiles && typeof parsed.profiles === 'object') {
        return normalizeAppData(parsed)
      }
      throw new CloudSyncError('INVALID_BACKUP', 'فرمت فایل پشتیبان ابری معتبر نیست.')
    }

    var container = parsed as EncryptedCloudBackupContainer
    var json = await this.decrypt(container, passphrase)
    if ((await hashSha256(json)) !== container.checksum) {
      throw new CloudSyncError('INVALID_BACKUP', 'یکپارچگی فایل پشتیبان ابری تأیید نشد.')
    }
    return normalizeAppData(JSON.parse(json) as Partial<AppData>)
  }

  private async decrypt(
    container: EncryptedCloudBackupContainer,
    passphrase?: string,
  ): Promise<string> {
    if (!passphrase) {
      var record = await this.vault.getKey()
      var matches =
        !!record && record.saltHex === container.salt && record.iterations === container.iterations
      if (!record || !matches) {
        throw new CloudSyncError('PASSPHRASE_REQUIRED', 'برای باز کردن این پشتیبان، رمز عبور آن را وارد کنید.')
      }
      try {
        return await decryptWithKey(container.ciphertext, container.iv, record.key)
      } catch {
        throw new CloudSyncError('PASSPHRASE_REQUIRED', 'برای باز کردن این پشتیبان، رمز عبور آن را وارد کنید.')
      }
    }

    if (passphrase.length < CLOUD_CONFIG.minPassphraseLength) {
      throw new CloudSyncError('PASSPHRASE_INVALID', 'رمز عبور وارد شده کوتاه‌تر از حد مجاز است.')
    }

    var key = await deriveKey(passphrase, container.salt, container.iterations)
    try {
      var json = await decryptWithKey(container.ciphertext, container.iv, key)
      await this.vault.saveKey(key, container.salt, container.iterations)
      return json
    } catch {
      throw new CloudSyncError('PASSPHRASE_INVALID', 'رمز عبور اشتباه است یا فایل پشتیبان دستکاری شده است.')
    }
  }
}
