export function bufferToHex(buffer: ArrayBuffer | Uint8Array): string {
  var bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  var hex = ''
  for (var i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0')
  }
  return hex
}

export function hexToBuffer(hex: string): Uint8Array {
  var clean = hex.trim()
  var bytes = new Uint8Array(clean.length / 2)
  for (var i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.substring(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

export function getRandomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length))
}

export function newSaltHex(): string {
  return bufferToHex(getRandomBytes(16))
}

export async function hashSha256(data: string): Promise<string> {
  var encoder = new TextEncoder()
  var buffer = await crypto.subtle.digest('SHA-256', encoder.encode(data))
  return bufferToHex(buffer)
}

export async function deriveKey(
  passphrase: string,
  saltHex: string,
  iterations: number,
): Promise<CryptoKey> {
  var enc = new TextEncoder()
  var keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey'],
  )

  var salt = hexToBuffer(saltHex)
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false, // extractable: false so key cannot be extracted or stolen
    ['encrypt', 'decrypt'],
  )
}

export async function encryptWithKey(
  plainText: string,
  key: CryptoKey,
): Promise<{ ciphertext: string; iv: string }> {
  var iv = getRandomBytes(12)
  var data = new TextEncoder().encode(plainText)
  var cipher = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as unknown as BufferSource, tagLength: 128 },
    key,
    data as unknown as BufferSource,
  )
  return { ciphertext: bufferToHex(cipher), iv: bufferToHex(iv) }
}

export async function decryptWithKey(
  ciphertextHex: string,
  ivHex: string,
  key: CryptoKey,
): Promise<string> {
  var plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: hexToBuffer(ivHex) as unknown as BufferSource, tagLength: 128 },
    key,
    hexToBuffer(ciphertextHex) as unknown as BufferSource,
  )
  return new TextDecoder().decode(plain)
}

// Deterministic JSON (sorted keys) so equal data always yields an equal hash across devices.
export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null'
  if (Array.isArray(value)) return '[' + value.map((item) => stableStringify(item)).join(',') + ']'
  var record = value as Record<string, unknown>
  var parts: string[] = []
  for (var key of Object.keys(record).sort()) {
    if (record[key] === undefined) continue
    parts.push(JSON.stringify(key) + ':' + stableStringify(record[key]))
  }
  return '{' + parts.join(',') + '}'
}
