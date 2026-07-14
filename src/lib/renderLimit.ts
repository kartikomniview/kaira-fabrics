const STORAGE_KEY = 'kaira_render_limits'
export const DAILY_GENERATION_LIMIT = 4

interface MobileRenderRecord {
  verified: boolean
  date: string
  genCount: number
}

type RenderLimitStore = Record<string, MobileRenderRecord>

function todayStr(): string {
  return new Date().toLocaleDateString('en-CA')
}

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

export function getRemainingGenerations(mobile: string): number {
  const rec = readStore()[mobile]
  if (!rec || rec.date !== todayStr()) return DAILY_GENERATION_LIMIT
  return Math.max(0, DAILY_GENERATION_LIMIT - rec.genCount)
}

export function markVerified(mobile: string): void {
  const store = readStore()
  const existing = store[mobile]
  if (existing) {
    existing.verified = true
  } else {
    store[mobile] = { verified: true, date: todayStr(), genCount: 0 }
  }
  writeStore(store)
}

export function recordGeneration(mobile: string): void {
  const store = readStore()
  const rec = store[mobile]
  const today = todayStr()
  if (!rec || rec.date !== today) {
    store[mobile] = { verified: true, date: today, genCount: 1 }
  } else {
    rec.genCount += 1
  }
  writeStore(store)
}
