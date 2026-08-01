/**
 * Persistent, cross-session cache for S3-hosted images (material swatches,
 * collection covers, 3D PBR texture maps), backed by the browser's Cache
 * Storage API. These S3 objects have no Cache-Control header, so without
 * this the browser only applies weak heuristic caching and re-requests the
 * same image on every page load.
 */

const CACHE_NAME = 'kaira-media-v1'

const S3_KAIRA_ORIGIN = 'https://kairafabrics.s3.ap-south-1.amazonaws.com'
// Same-origin proxy, wired up in vite.config.ts for local dev only. The S3
// bucket's CORS policy allowlists the production origins (kairafabrics.in)
// and localhost:5173, but not arbitrary dev hosts/ports/LAN IPs, so dev
// fetches are routed through this proxy to bypass CORS entirely.
const S3_PROXY_ORIGIN = '/s3kaira'

/** Rewrites an S3 URL to the dev-only same-origin proxy when needed. The
 * cache itself is always keyed by the original (non-proxied) URL so dev and
 * prod share the same cache entries. */
function toFetchableUrl(url: string): string {
  return import.meta.env.DEV && url.startsWith(S3_KAIRA_ORIGIN)
    ? url.replace(S3_KAIRA_ORIGIN, S3_PROXY_ORIGIN)
    : url
}

// Dedupes concurrent requests for the same URL within this page session so
// N components mounting at once trigger a single cache read / fetch.
const inFlight = new Map<string, Promise<string | null>>()

async function resolve(url: string): Promise<string | null> {
  try {
    if (typeof caches !== 'undefined') {
      const cache = await caches.open(CACHE_NAME)
      const cached = await cache.match(url)
      if (cached) {
        const blob = await cached.blob()
        return URL.createObjectURL(blob)
      }

      // `no-store`: these S3 objects have no Cache-Control header, so the
      // browser's heuristic HTTP cache can otherwise keep serving a stale,
      // pre-CORS response (missing Access-Control-Allow-Origin) indefinitely.
      const res = await fetch(toFetchableUrl(url), { cache: 'no-store' })
      if (!res.ok) return null
      await cache.put(url, res.clone())
      const blob = await res.blob()
      return URL.createObjectURL(blob)
    }

    // Cache Storage unavailable (very old browser, insecure context) — fall
    // back to a plain fetch with no persistence.
    const res = await fetch(toFetchableUrl(url), { cache: 'no-store' })
    if (!res.ok) return null
    const blob = await res.blob()
    return URL.createObjectURL(blob)
  } catch {
    return null
  }
}

/**
 * Resolves `url` through the shared persistent media cache, returning a
 * `blob:` object URL. Fetches over the network only on the first-ever
 * request for a given URL (per browser); every later call — this session or
 * a future one — is served from Cache Storage.
 */
export function getCachedMediaUrl(url: string): Promise<string | null> {
  let pending = inFlight.get(url)
  if (!pending) {
    pending = resolve(url).finally(() => inFlight.delete(url))
    inFlight.set(url, pending)
  }
  return pending
}

/**
 * Cache-only lookup: returns a blob URL if `url` is already in the
 * persistent cache, or `null` immediately if not — never triggers a network
 * fetch. Lets large-asset callers (e.g. hero videos) prefer an already-cached
 * copy without paying for a full download just to check.
 */
export async function getCachedMediaUrlIfPresent(url: string): Promise<string | null> {
  if (typeof caches === 'undefined') return null
  try {
    const cache = await caches.open(CACHE_NAME)
    const cached = await cache.match(url)
    if (!cached) return null
    const blob = await cached.blob()
    return URL.createObjectURL(blob)
  } catch {
    return null
  }
}

const warming = new Set<string>()

/**
 * Fetches `url` and stores it in the persistent cache for a future visit,
 * without creating a blob/object URL. For large assets like video, callers
 * should invoke this well after the asset was already used via a direct
 * streamed URL, so the download never competes with initial load or
 * playback memory.
 */
export async function warmMediaCache(url: string): Promise<void> {
  if (typeof caches === 'undefined' || warming.has(url)) return
  warming.add(url)
  try {
    const cache = await caches.open(CACHE_NAME)
    if (await cache.match(url)) return
    const res = await fetch(toFetchableUrl(url), { cache: 'no-store' })
    if (!res.ok) return
    await cache.put(url, res)
  } catch {
    // Best-effort background warm — a failed prefetch just means the next
    // visit streams the raw URL again, same as today.
  } finally {
    warming.delete(url)
  }
}
