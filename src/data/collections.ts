export interface Collection {
  id: string
  name: string
  description: string
  category: string
  image: string
  itemCount: number
  tags: string[]
}

export const collections: Collection[] = [
  {
    id: 'royal-velvet',
    name: 'Royal Velvet',
    description: 'Opulent velvet fabrics in rich jewel tones, perfect for statement furniture and luxurious drapery.',
    category: 'Velvet',
    image: 'https://placehold.co/600x440/3B1F3A/C5A552?text=Royal+Velvet',
    itemCount: 24,
    tags: ['Luxury', 'Draping', 'Statement'],
  },
  {
    id: 'linen-masters',
    name: 'Linen Masters',
    description: 'Premium Belgian linen with exceptional texture and breathable quality for timeless interiors.',
    category: 'Linen',
    image: 'https://placehold.co/600x440/D4C5A9/1C1917?text=Linen+Masters',
    itemCount: 18,
    tags: ['Natural', 'Breathable', 'Classic'],
  },
  {
    id: 'silk-heritage',
    name: 'Silk Heritage',
    description: 'Pure silk fabrics with a luminous sheen, woven using centuries-old artisanal techniques.',
    category: 'Silk',
    image: 'https://placehold.co/600x440/C5A552/1C1917?text=Silk+Heritage',
    itemCount: 16,
    tags: ['Sheen', 'Artisanal', 'Premium'],
  },
  {
    id: 'cashmere-touch',
    name: 'Cashmere Touch',
    description: 'Ultra-soft cashmere blends that bring unparalleled warmth and elegance to any living space.',
    category: 'Cashmere',
    image: 'https://placehold.co/600x440/9C8B7E/FAF8F5?text=Cashmere+Touch',
    itemCount: 20,
    tags: ['Soft', 'Warm', 'Luxurious'],
  },
  {
    id: 'outdoor-luxe',
    name: 'Outdoor Luxe',
    description: 'Weather-resistant luxury fabrics engineered to maintain their beauty in outdoor environments.',
    category: 'Technical',
    image: 'https://placehold.co/600x440/3D5A47/C5A552?text=Outdoor+Luxe',
    itemCount: 14,
    tags: ['Durable', 'UV-resistant', 'Outdoor'],
  },
  {
    id: 'contemporary-weave',
    name: 'Contemporary Weave',
    description: 'Modern herringbone and geometric patterns for the design-forward interior space.',
    category: 'Woven',
    image: 'https://placehold.co/600x440/2C3E50/C5A552?text=Contemporary+Weave',
    itemCount: 22,
    tags: ['Modern', 'Geometric', 'Bold'],
  },
  {
    id: 'italian-leather',
    name: 'Italian Leather',
    description: 'Full-grain Italian leather hides with a patina that deepens beautifully with time.',
    category: 'Leather',
    image: 'https://placehold.co/600x440/6B3A2A/C5A552?text=Italian+Leather',
    itemCount: 12,
    tags: ['Leather', 'Heritage', 'Craft'],
  },
  {
    id: 'embroidered-tales',
    name: 'Embroidered Tales',
    description: 'Hand-embroidered fabrics featuring intricate motifs inspired by global craft traditions.',
    category: 'Embroidered',
    image: 'https://placehold.co/600x440/1A2F4A/C5A552?text=Embroidered+Tales',
    itemCount: 10,
    tags: ['Artisan', 'Hand-crafted', 'Heritage'],
  },
]
