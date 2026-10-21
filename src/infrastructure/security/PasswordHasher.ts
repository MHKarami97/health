export interface PasswordRecord {
  salt: string
  hash: string
  iterations: number
}

/** PBKDF2-SHA256 through Web Crypto. Only the derived hash is stored, never the password. */
export class PasswordHasher {
  private static readonly iterations = 210_000

  async create(password: string): Promise<PasswordRecord> {
    var salt = crypto.getRandomValues(new Uint8Array(16))
    var hash = await this.derive(password, salt, PasswordHasher.iterations)
    return { salt: this.toBase64(salt), hash: this.toBase64(hash), iterations: PasswordHasher.iterations }
  }

  async verify(password: string, record: PasswordRecord): Promise<boolean> {
    var hash = await this.derive(password, this.fromBase64(record.salt), record.iterations)
    return this.toBase64(hash) === record.hash
  }

  private async derive(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
    var key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
    var bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256)
    return new Uint8Array(bits)
  }

  private toBase64(bytes: Uint8Array): string {
    return btoa(String.fromCharCode(...bytes))
  }

  private fromBase64(value: string): Uint8Array {
    return Uint8Array.from(atob(value), (char) => char.charCodeAt(0))
  }
}
