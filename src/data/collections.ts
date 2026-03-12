import { newMaterials } from './newmaterials'

export interface Collection {
  id: string
  name: string
  description: string
  category: string
  image: string
  itemCount: number
  tags: string[]
}

const S3_COVER = 'https://supoassets.s3.ap-south-1.amazonaws.com/public/store/ThumbnailsCover/KairaFabrics'

const collectionMap = new Map<string, { count: number; materialType: string; colorGroups: string[] }>()

for (const m of newMaterials) {
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

export const collections: Collection[] = Array.from(collectionMap.entries()).map(([name, data]) => ({
  id: name.toLowerCase(),
  name,
  description: `Premium ${data.materialType} collection featuring ${data.count} unique fabric variants.`,
  category: data.materialType,
  image: `${S3_COVER}/${name}.webp`,
  itemCount: data.count,
  tags: data.colorGroups.slice(0, 3),
}))
