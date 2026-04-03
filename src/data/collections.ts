import type { NewMaterial } from './newmaterials'

export interface Collection {
  id: string
  name: string
  description: string
  category: string
  image: string
  itemCount: number
  tags: string[]
}

const S3_COVER = 'https://kairafabrics.s3.ap-south-1.amazonaws.com/coverpages/KairaFabrics'

/** Derives the collections list from a materials array.
 *  Called by MaterialsContext whenever the fetched data changes. */
export function buildCollections(mats: NewMaterial[]): Collection[] {
  const collectionMap = new Map<string, { count: number; materialType: string; colorGroups: string[] }>()

  for (const m of mats) {
    if (!collectionMap.has(m.collection_name)) {
      collectionMap.set(m.collection_name, { count: 0, materialType: m.material_type, colorGroups: [] })
    }
    const entry = collectionMap.get(m.collection_name)!
    entry.count++
    const cg = m.color_group
    if (cg !== null && !entry.colorGroups.includes(cg)) {
      entry.colorGroups.push(cg)
    }
  }

  return Array.from(collectionMap.entries()).map(([name, data]) => ({
    id: name.toLowerCase(),
    name,
    description: `Premium ${data.materialType} collection featuring ${data.count} unique fabric variants.`,
    category: data.materialType,
    image: `${S3_COVER}/${name}.webp`,
    itemCount: data.count,
    tags: data.colorGroups.slice(0, 3),
  }))
}
