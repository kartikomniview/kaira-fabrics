/** Material-type copy shared by the collection detail page and the material detail page.
 *  Keyed by `normalizeType(material_type)`. */
export interface MaterialTypeCopy {
  description: string
  features: string[]
  /** Collection page appends a "view swatches up close / 3D / catalog" line after the description. */
  showSwatchNote?: boolean
}

export const SWATCH_NOTE =
  'Each swatch below can be viewed up close, previewed on a 3D sofa model, or requested as a full physical catalog.'

const SUEDE_FABRIC_COPY: MaterialTypeCopy = {
  description:
    'Suede Fabric is a soft, smooth upholstery fabric with a fine, velvety surface that gives furniture a rich and luxurious look. It is ideal for sofas, lounge chairs, cushions, headboards, and other upholstered furniture.',
  features: ['Soft and velvety feel', 'Elegant appearance', 'Comfortable', 'Easy to style', 'Available in a wide range of colours'],
  showSwatchNote: true,
}

const ARTIFICIAL_LEATHER_COPY: MaterialTypeCopy = {
  description:
    'Artificial Leather is a synthetic upholstery material designed to offer the look and feel of leather with a practical, versatile finish. It is ideal for sofas, chairs, dining seating, office furniture, and commercial interiors.',
  features: ['Leather-like appearance', 'Easy to maintain', 'Durable', 'Practical', 'Wide range of colours and finishes'],
  showSwatchNote: true,
}

export const materialTypeCopy: Record<string, MaterialTypeCopy> = {
  SUEDEFABRIC: SUEDE_FABRIC_COPY,
  ARTIFICIALLEATHER: ARTIFICIAL_LEATHER_COPY,
  LEATHERITE: ARTIFICIAL_LEATHER_COPY,
  SUEDELEATHER: {
    description:
      'Suede Leather is a type of suede fabric with a leather-like finish, offering the soft, smooth feel of suede with the sophisticated appearance of leather. It is ideal for sofas, lounge chairs, cushions, and premium upholstered furniture.',
    features: ['Soft and smooth texture', 'Leather-like appearance', 'Elegant finish', 'Comfortable', 'Easy to style'],
    showSwatchNote: true,
  },
  BOUCLE: {
    description:
      'Boucle is a textured upholstery fabric made with looped or curled yarns, creating its distinctive soft and tactile surface. Its rich texture adds warmth, depth, and a contemporary feel to furniture and interiors.',
    features: ['Distinctive looped texture', 'Soft and cosy', 'Adds visual depth', 'Contemporary look', 'Comfortable'],
  },
  DIGITALPRINT: {
    description:
      'Digital Prints are upholstery fabrics with designs printed directly onto the surface using digital printing technology. They offer greater freedom to create detailed patterns, artistic designs, and vibrant visuals for distinctive furniture and interiors.',
    features: ['Detailed designs', 'Wide design possibilities', 'Rich colours', 'Custom-look appearance', 'Creative and distinctive'],
  },
}
