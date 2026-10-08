import type { NewMaterial } from '../../data/newmaterials'

export const DEFAULT_COLLECTION = 'Koral'

/** `?collection=<name>&code=<material_code>` — set by the material detail page's "Try in 3D Studio" link (to /ai-visualizer/studio). */
function linkedMaterialParams() {
  const params = new URLSearchParams(window.location.search)
  return { collection: params.get('collection'), code: params.get('code') }
}

/** True when the URL links a specific material — the selector then opens on that collection's shades. */
export function hasLinkedMaterial(): boolean {
  const { collection, code } = linkedMaterialParams()
  return !!collection && !!code
}

/** Collection the material selector should open on: the linked one, else the default. */
export function initialCollectionName(): string {
  return linkedMaterialParams().collection ?? DEFAULT_COLLECTION
}

/** Material to auto-apply on first load: the linked one if it exists, else the first in the default collection. */
export function findInitialMaterial(newMaterials: NewMaterial[]): NewMaterial | undefined {
  const { collection, code } = linkedMaterialParams()
  const linked = collection && code
    ? newMaterials.find((m) => m.collection_name === collection && m.material_code.toLowerCase() === code.toLowerCase())
    : undefined
  return linked ?? newMaterials.find((m) => m.collection_name === DEFAULT_COLLECTION)
}
