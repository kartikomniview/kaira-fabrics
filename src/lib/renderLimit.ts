const STORAGE_KEY = 'kaira_render_limits'

interface MobileRenderRecord {
  verified: boolean
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

export function isVerified(mobile: string): boolean {
  return !!readStore()[mobile]?.verified
}

export function markVerified(mobile: string): void {
  const store = readStore()
  store[mobile] = { verified: true }
  writeStore(store)
}
