import { useEffect, useState } from 'react'
import { getCachedMediaUrl } from '../lib/mediaCache'

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
