export interface Material {
  id: string
  name: string
  description: string
  properties: string[]
  category: string
  image: string
  origin: string
  careInstructions: string
}

export const materials: Material[] = [
  {
    id: 'pure-silk',
    name: 'Pure Silk',
    description: 'Sourced from the finest mulberry silkworms, our pure silk offers unmatched luminosity and a fluid drape that elevates any interior.',
    properties: ['Hypoallergenic', 'Temperature regulating', 'Natural sheen', 'Lightweight'],
    category: 'Natural',
    image: 'https://placehold.co/500x380/C5A552/1C1917?text=Pure+Silk',
    origin: 'Italy',
    careInstructions: 'Dry clean only',
  },
  {
    id: 'belgian-linen',
    name: 'Belgian Linen',
    description: 'Cultivated in the fertile fields of Belgium, this linen develops a beautiful softness over time while retaining its natural texture.',
    properties: ['Breathable', 'Durable', 'Anti-static', 'Naturally softer with age'],
    category: 'Natural',
    image: 'https://placehold.co/500x380/D4C5A9/1C1917?text=Belgian+Linen',
    origin: 'Belgium',
    careInstructions: 'Machine wash cold',
  },
  {
    id: 'merino-wool',
    name: 'Merino Wool',
    description: 'Ultra-fine Merino fibers create a fabric of extraordinary softness and natural resilience, adapting to every season.',
    properties: ['Moisture-wicking', 'Odour-resistant', 'Naturally elastic', 'Thermal regulation'],
    category: 'Natural',
    image: 'https://placehold.co/500x380/B8A898/1C1917?text=Merino+Wool',
    origin: 'New Zealand',
    careInstructions: 'Hand wash cold',
  },
  {
    id: 'cashmere-blend',
    name: 'Cashmere Blend',
    description: 'A refined blend of cashmere and fine wool creates a fabric of exceptional softness with improved durability for upholstery use.',
    properties: ['Exceptionally soft', 'Warm', 'Pill-resistant blend', 'Premium hand feel'],
    category: 'Natural',
    image: 'https://placehold.co/500x380/9C8B7E/FAF8F5?text=Cashmere+Blend',
    origin: 'Scotland',
    careInstructions: 'Dry clean recommended',
  },
  {
    id: 'premium-cotton',
    name: 'Egyptian Cotton',
    description: 'The extra-long staple fibers of Egyptian cotton produce a fabric of incredible strength, softness, and rich colour absorption.',
    properties: ['High thread count', 'Absorbent', 'Strong', 'Vibrant colour retention'],
    category: 'Natural',
    image: 'https://placehold.co/500x380/FAF8F5/1C1917?text=Egyptian+Cotton',
    origin: 'Egypt',
    careInstructions: 'Machine wash warm',
  },
  {
    id: 'technical-velvet',
    name: 'Technical Velvet',
    description: 'A modern engineering marvel—our technical velvet combines the opulence of traditional velvet with stain-resistant and fade-proof properties.',
    properties: ['Stain-resistant', 'Fade-proof', 'Crush-resistant', 'Easy clean'],
    category: 'Technical',
    image: 'https://placehold.co/500x380/3B1F3A/C5A552?text=Technical+Velvet',
    origin: 'Germany',
    careInstructions: 'Wipe clean',
  },
  {
    id: 'jacquard-weave',
    name: 'Jacquard Weave',
    description: 'Woven on historic Jacquard looms, each bolt features intricate self-generated patterns with a richness that cannot be screen-printed.',
    properties: ['Intricate pattern', 'Dimensional texture', 'Durable construction', 'Heritage technique'],
    category: 'Woven',
    image: 'https://placehold.co/500x380/2C3E50/C5A552?text=Jacquard+Weave',
    origin: 'France',
    careInstructions: 'Dry clean only',
  },
  {
    id: 'full-grain-leather',
    name: 'Full-Grain Leather',
    description: 'The outermost layer of the hide, full-grain leather is the strongest and most durable, developing a rich patina unique to each piece.',
    properties: ['Ages beautifully', 'Breathable', 'Strongest grade', 'Natural markings'],
    category: 'Leather',
    image: 'https://placehold.co/500x380/6B3A2A/C5A552?text=Full-Grain+Leather',
    origin: 'Italy',
    careInstructions: 'Leather conditioner monthly',
  },
]

export const materialCategories = ['All', 'Natural', 'Technical', 'Woven', 'Leather']
