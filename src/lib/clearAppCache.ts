/** Wipes all client-side storage: localStorage, sessionStorage, and Cache Storage. */
export function clearAppCache(): void {
  localStorage.clear()
  sessionStorage.clear()
  if (typeof caches !== 'undefined') {
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .catch(() => {})
  }
}
