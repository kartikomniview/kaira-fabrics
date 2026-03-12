import { newMaterials } from './newmaterials'

export interface Material {
  id: number
  material_name: string
  company_name: string
  collection_name: string
  material_code: string
  uv_scale: number | null
  sheen: number
  company_collection_materialtype_id: number
  company_id: number
  collection_id: number
  material_type_id: number
  roughness: number
  metalness: number
  specular: number
  clearcoat: number
  transmission: number
  color_group: string | null
  pattern: string | null
  material_type: string
  storefront_id: number | null
}

export const materials: Material[] = newMaterials as Material[]

const safeComponent = (value: string) => encodeURIComponent(value.trim())

export const getMaterialImageUrl = (material: Material): string => {
  if (!material.company_name || !material.collection_name || !material.material_code) {
    return ''
  }
  return `https://supoassets.s3.ap-south-1.amazonaws.com/public/textures/${safeComponent(material.company_name)}/${safeComponent(material.collection_name)}/${safeComponent(material.material_code)}.webp`
}

export const getCollectionImageUrl = (collection_name: string): string => {
  return `https://supoassets.s3.ap-south-1.amazonaws.com/public/store/ThumbnailsCover/KairaFabrics/${encodeURIComponent(collection_name.trim())}.webp`
}

export const materialCategories = [
  'All',
  ...Array.from(new Set(materials.map((m) => m.material_type).filter(Boolean))).sort(),
]
