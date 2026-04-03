import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react'
import { loadNewMaterials, clearNewMaterialsCache, getNewMaterialsCache, type NewMaterial } from '../data/newmaterials'
import { buildCollections, type Collection } from '../data/collections'
import type { Material } from '../data/materials'

// ─── Context shape ───────────────────────────────────────────────────────────

interface MaterialsContextValue {
  /** Raw materials fetched from S3. Empty array while loading. */
  newMaterials: NewMaterial[]
  /** Collections derived from newMaterials. */
  collections: Collection[]
  /** Same data cast to the typed Material interface. */
  materials: Material[]
  /** True until the first successful fetch (or error). */
  isLoading: boolean
  /** Non-null when the fetch failed. */
  error: Error | null
  /** Clears the module cache and re-fetches fresh data from S3. */
  refresh: () => Promise<void>
}

const MaterialsContext = createContext<MaterialsContextValue>({
  newMaterials: [],
  collections: [],
  materials: [],
  isLoading: true,
  error: null,
  refresh: () => Promise.resolve(),
})

// ─── Provider ────────────────────────────────────────────────────────────────

export function MaterialsProvider({ children }: { children: ReactNode }) {
  // Initialise from module cache in case the pre-fetch already resolved
  // (fast-path: avoids a re-render when data was ready before React mounted).
  const [newMaterials, setNewMaterials] = useState<NewMaterial[]>(getNewMaterialsCache)
  const [isLoading, setIsLoading] = useState(() => getNewMaterialsCache().length === 0)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // If the module-level pre-fetch already populated the cache, skip.
    if (newMaterials.length > 0) return

    loadNewMaterials()
      .then((data) => {
        setNewMaterials(data)
        setIsLoading(false)
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error(String(err)))
        setIsLoading(false)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const refresh = async () => {
    clearNewMaterialsCache()
    setIsLoading(true)
    setError(null)
    try {
      const data = await loadNewMaterials(true)
      setNewMaterials(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setIsLoading(false)
    }
  }

  const collections = useMemo(() => buildCollections(newMaterials), [newMaterials])
  const materials = newMaterials as unknown as Material[]

  return (
    <MaterialsContext.Provider value={{ newMaterials, collections, materials, isLoading, error, refresh }}>
      {children}
    </MaterialsContext.Provider>
  )
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/** Consume materials data from anywhere inside the component tree. */
export function useMaterials(): MaterialsContextValue {
  return useContext(MaterialsContext)
}
