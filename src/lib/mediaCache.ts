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

      const res = await fetch(toFetchableUrl(url))
      if (!res.ok) return null
      await cache.put(url, res.clone())
      const blob = await res.blob()
      return URL.createObjectURL(blob)
    }

    // Cache Storage unavailable (very old browser, insecure context) — fall
    // back to a plain fetch with no persistence.
    const res = await fetch(toFetchableUrl(url))
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
