const STORAGE_KEY = 'kaira_render_limits'

interface MobileRenderRecord {
  /** Signed token from /otp/verify; older entries only had `verified: true` and no token */
  token?: string
  expiresAt?: number
}

type RenderLimitStore = Record<string, MobileRenderRecord>

function readStore(): RenderLimitStore {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function writeStore(store: RenderLimitStore): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

export function getVerificationToken(mobile: string): string | null {
  const record = readStore()[mobile]
  if (!record?.token || !record.expiresAt || record.expiresAt <= Date.now()) return null
  return record.token
}

export function isVerified(mobile: string): boolean {
  return getVerificationToken(mobile) !== null
}

export function markVerified(mobile: string, token: string, expiresAt: number): void {
  const store = readStore()
  store[mobile] = { token, expiresAt }
  writeStore(store)
}

export function clearVerified(mobile: string): void {
  const store = readStore()
  delete store[mobile]
  writeStore(store)
}
