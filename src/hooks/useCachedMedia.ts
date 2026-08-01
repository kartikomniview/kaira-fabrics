import { useEffect, useState } from 'react'
import { getCachedMediaUrl, getCachedMediaUrlIfPresent } from '../lib/mediaCache'

/**
 * Resolves `src` through the shared persistent media cache (src/lib/mediaCache.ts).
 * Returns `undefined` while the lookup/fetch is in flight, so callers can
 * render a placeholder and avoid ever requesting the raw URL directly.
 */
export function useCachedMedia(src: string | undefined): string | undefined {
  const [resolved, setResolved] = useState<{ src: string | undefined; url: string | undefined }>({
    src,
    url: undefined,
  })

  // Discard a stale result from a previous `src` as soon as it changes,
  // without waiting for the effect below to run.
  if (resolved.src !== src) {
    setResolved({ src, url: undefined })
  }

  useEffect(() => {
    if (!src) return
    let cancelled = false
    getCachedMediaUrl(src).then((url) => {
      if (!cancelled) setResolved({ src, url: url ?? undefined })
    })
    return () => {
      cancelled = true
    }
  }, [src])

  return resolved.src === src ? resolved.url : undefined
}

/**
 * Cache-only variant of {@link useCachedMedia}: resolves `src` to a blob URL
 * only if it's already in the persistent cache, and never triggers a network
 * fetch. Returns `undefined` if the asset isn't cached yet. Intended for
 * large assets (e.g. video) where callers want to prefer an already-cached
 * copy but otherwise stream the raw URL directly rather than forcing a full
 * download just to populate the cache.
 */
export function useCachedMediaIfPresent(src: string | undefined): string | undefined {
  const [resolved, setResolved] = useState<{ src: string | undefined; url: string | undefined }>({
    src,
    url: undefined,
  })

  if (resolved.src !== src) {
    setResolved({ src, url: undefined })
  }

  useEffect(() => {
    if (!src) return
    let cancelled = false
    getCachedMediaUrlIfPresent(src).then((url) => {
      if (!cancelled) setResolved({ src, url: url ?? undefined })
    })
    return () => {
      cancelled = true
    }
  }, [src])

  return resolved.src === src ? resolved.url : undefined
}
