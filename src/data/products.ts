/** Legacy product type — kept for backward compatibility */
export interface Product {
  product_name: string
  category_name: string
  sub_category_name: string
  product_id: string
  sku: string
  price: number
}

export const dummyProducts: Product[] = [
  { product_name: 'Linda', category_name: 'Sofa', sub_category_name: 'SetSofas', product_id: 'linda-demo', sku: 'linda-demo', price: 0 },
  { product_name: 'Fantasy', category_name: 'Sofa', sub_category_name: 'LShape', product_id: 'fantasy-demo', sku: 'fantasy-demo', price: 0 },
  { product_name: 'Covey', category_name: 'Sofa', sub_category_name: 'LShape', product_id: 'covey-demo', sku: 'covey-demo', price: 0 },
  { product_name: 'F3A060', category_name: 'Sofa', sub_category_name: 'LShape', product_id: 'f3a060-demo', sku: 'f3a060-demo', price: 0 },
  { product_name: 'Hector', category_name: 'Sofa', sub_category_name: 'LShape', product_id: 'hector-demo', sku: 'hector-demo', price: 0 },
  { product_name: 'Steve', category_name: 'Sofa', sub_category_name: 'LShape', product_id: 'steve-demo', sku: 'steve-demo', price: 0 },
]

export const getProductGlbUrl = (p: Product) =>
  `https://supoassets.s3.ap-south-1.amazonaws.com/public/models/OVL/${p.category_name}/${p.sub_category_name}/${p.product_name}.glb`

export const getProductImageUrl = (p: Product) =>
  `https://supoassets.s3.ap-south-1.amazonaws.com/public/productImages/OVL/${p.category_name}/${p.sub_category_name}/${p.product_name}/${p.product_name}.png`

/** Kaira product type using direct S3 asset URLs */
export interface KairaProduct {
  id: number
  product_name: string
  /** Product thumbnail image (.webp) */
  model_url: string
  /** 3D model asset (.glb) */
  image_url: string
}

export const kairaProducts: KairaProduct[] = [
  {
    id: 4,
    product_name: 'Hygge',
    model_url: 'https://kairafabrics.s3.ap-south-1.amazonaws.com/ThreeAssets/productImages/v1/Hygge.webp',
    image_url: 'https://kairafabrics.s3.ap-south-1.amazonaws.com/ThreeAssets/models/v2/Hygge.glb',
  },
  {
    id: 7,
    product_name: 'Marcellus',
    model_url: 'https://kairafabrics.s3.ap-south-1.amazonaws.com/ThreeAssets/productImages/v1/Marcellus.webp',
    image_url: 'https://kairafabrics.s3.ap-south-1.amazonaws.com/ThreeAssets/models/v2/Marcellus.glb',
  },
  {
    id: 11,
    product_name: 'Monaco',
    model_url: 'https://kairafabrics.s3.ap-south-1.amazonaws.com/ThreeAssets/productImages/v1/Monaco.webp',
    image_url: 'https://kairafabrics.s3.ap-south-1.amazonaws.com/ThreeAssets/models/v2/Monaco.glb',
  },
  {
    id: 1,
    product_name: 'Nova',
    model_url: 'https://kairafabrics.s3.ap-south-1.amazonaws.com/ThreeAssets/productImages/v1/Nova.webp',
    image_url: 'https://kairafabrics.s3.ap-south-1.amazonaws.com/ThreeAssets/models/v2/Nova.glb',
  },
  {
    id: 2,
    product_name: 'Zephyr',
    model_url: 'https://kairafabrics.s3.ap-south-1.amazonaws.com/ThreeAssets/productImages/v1/Zephyr.webp',
    image_url: 'https://kairafabrics.s3.ap-south-1.amazonaws.com/ThreeAssets/models/v2/Zephyr.glb',
  },
  {
    id: 3,
    product_name: 'Celeste',
    model_url: 'https://kairafabrics.s3.ap-south-1.amazonaws.com/ThreeAssets/productImages/v1/Celeste.webp',
    image_url: 'https://kairafabrics.s3.ap-south-1.amazonaws.com/ThreeAssets/models/v2/Celeste.glb',
  },
 
  {
    id: 5,
    product_name: 'Heritage',
    model_url: 'https://kairafabrics.s3.ap-south-1.amazonaws.com/ThreeAssets/productImages/v1/Heritage.webp',
    image_url: 'https://kairafabrics.s3.ap-south-1.amazonaws.com/ThreeAssets/models/v2/Heritage.glb',
  },
  {
    id: 6,
    product_name: 'Verona',
    model_url: 'https://kairafabrics.s3.ap-south-1.amazonaws.com/ThreeAssets/productImages/v1/Verona.webp',
    image_url: 'https://kairafabrics.s3.ap-south-1.amazonaws.com/ThreeAssets/models/v2/Verona.glb',
  },
 
  {
    id: 8,
    product_name: 'Soma',
    model_url: 'https://kairafabrics.s3.ap-south-1.amazonaws.com/ThreeAssets/productImages/v1/Soma.webp',
    image_url: 'https://kairafabrics.s3.ap-south-1.amazonaws.com/ThreeAssets/models/v2/Soma.glb',
  },
  {
    id: 9,
    product_name: 'Aura',
    model_url: 'https://kairafabrics.s3.ap-south-1.amazonaws.com/ThreeAssets/productImages/v1/Aura.webp',
    image_url: 'https://kairafabrics.s3.ap-south-1.amazonaws.com/ThreeAssets/models/v2/Aura.glb',
  },
  {
    id: 10,
    product_name: 'Aurelia',
    model_url: 'https://kairafabrics.s3.ap-south-1.amazonaws.com/ThreeAssets/productImages/v1/Aurelia.webp',
    image_url: 'https://kairafabrics.s3.ap-south-1.amazonaws.com/ThreeAssets/models/v2/Aurelia.glb',
  },

  {
    id: 12,
    product_name: 'Luna',
    model_url: 'https://kairafabrics.s3.ap-south-1.amazonaws.com/ThreeAssets/productImages/v1/Luna.webp',
    image_url: 'https://kairafabrics.s3.ap-south-1.amazonaws.com/ThreeAssets/models/v2/Luna.glb',
  },
  {
    id: 13,
    product_name: 'Rubino',
    model_url: 'https://kairafabrics.s3.ap-south-1.amazonaws.com/ThreeAssets/productImages/v1/Rubino.webp',
    image_url: 'https://kairafabrics.s3.ap-south-1.amazonaws.com/ThreeAssets/models/v2/Rubino.glb',
  }
]
