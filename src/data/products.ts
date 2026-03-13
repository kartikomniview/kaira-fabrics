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
