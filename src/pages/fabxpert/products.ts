// FABXPERT product content. Copy is limited to claims supported by the FABXPERT by Kaira product brief;
// anything the brief marks as unconfirmed (durations, dwell times, stain-age performance) defers to the label.

// Shared motion easing and brand dot-grid background used across the FabXpert pages
export const EXPO_OUT = [0.16, 1, 0.3, 1] as const
export const DOT_PATTERN = { backgroundImage: 'radial-gradient(circle, #97c41e 1px, transparent 1px)', backgroundSize: '28px 28px' }

export const ICONS = {
  water: 'M12 3.5c-3 4-6 7.2-6 10.5a6 6 0 0012 0c0-3.3-3-6.5-6-10.5z',
  food: 'M7 3v8m-2-8v4a2 2 0 004 0V3M7 11v10M17 3c-1.7 1-3 3.2-3 6v3h3m0-9v18',
  coffee: 'M4 9h12v5a5 5 0 01-5 5H9a5 5 0 01-5-5V9zm12 1h1.5a2.5 2.5 0 010 5H16M8 3c0 1 1 1.5 1 2.5S8 7 8 7m4-4c0 1 1 1.5 1 2.5S12 7 12 7',
  oil: 'M12 3c-2.5 3.5-5 6.3-5 9.2A5 5 0 0012 17a5 5 0 005-4.8C17 9.3 14.5 6.5 12 3zM5 21h14',
  ink: 'M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125',
  shield: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z',
  sparkle: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z',
  check: 'M4.5 12.75l6 6 9-13.5',
  cross: 'M6 18L18 6M6 6l12 12',
  alert: 'M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z',
  sofa: 'M5 10V7a2 2 0 012-2h10a2 2 0 012 2v3M3 10h2a1 1 0 011 1v3h12v-3a1 1 0 011-1h2v7H3v-7zM5 17v2m14-2v2',
  armchair: 'M7 11V6a2 2 0 012-2h6a2 2 0 012 2v5M4 11h3v3h10v-3h3v6H4v-6zM6 17v3m12-3v3',
  chair: 'M7 3h10v8H7zM6 11h12v3H6zM7 14v7m10-7v7',
  curtain: 'M3 3h18M5 3v18c2-2 3-6 3-9S7 5 5 3m14 0v18c-2-2-3-6-3-9s1-7 3-9',
  carpet: 'M5 6h14v12H5zM3 8h2m-2 4h2m-2 4h2m14-8h2m-2 4h2m-2 4h2M9 10h6v4H9z',
  info: 'M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z',
  arrow: 'M17 8l4 4m0 0l-4 4m4-4H3',
  back: 'M10 19l-7-7m0 0l7-7m-7 7h18',
  plus: 'M12 4.5v15m7.5-7.5h-15',
}

export type ProductId = 'fabseal' | 'fabfix'

export type Product = {
  id: ProductId
  name: string
  category: string
  tagline: string
  role: string
  /** One-sentence summary used on cards and the product hero */
  summary: string
  /** Longer "What is it?" copy */
  about: string[]
  size: string
  technology: string
  price: string
  mrp: string
  problemsTitle: string
  problems: string[]
  targetsLabel: string
  targets: { label: string; icon: string }[]
  howItWorks: { intro: string; points: string[] }
  steps: { title: string; body: string }[]
  benefits: string[]
  limitations: string[]
  /** Positioning statement shown as a pull quote */
  statement: string
  why: string
  faqs: { q: string; a: string }[]
  seoDescription: string
  /** Product photo (transparent PNG/WebP works best); until supplied, an illustrated bottle is shown */
  image?: string
  /** Lifestyle photo beside "What is it?"; until supplied, a labelled placeholder is shown */
  lifestyleImage?: string
  /** Before/after demonstrations; each shows a labelled placeholder until its `src` is supplied */
  demos: { label: string; caption: string; src?: string }[]
}

export const SURFACES = [
  { label: 'Sofa upholstery', icon: ICONS.sofa },
  { label: 'Fabric furniture', icon: ICONS.armchair },
  { label: 'Dining chairs', icon: ICONS.chair },
  { label: 'Curtains', icon: ICONS.curtain },
  { label: 'Carpets', icon: ICONS.carpet },
]


export const IDEAL_FOR ='Homes, offices, furniture owners, carpet and curtain customers'

export const FABSEAL: Product = {
  id: 'fabseal',
  name: 'FABSEAL',
  category: 'Stain Repellent',
  tagline: 'Protect before the spill.',
  role: 'Prevent',
  summary:
    'A fabric stain repellent designed to help protect suitable fabric surfaces from water, food and coffee spills through a nano-coating layer.',
  about: [
    'FABSEAL is a fabric-protection product developed to help repel everyday spills before they become difficult-to-remove stains. It uses a nano-coating approach to help protect fabric from water, food and coffee spills.',
    'It’s preventive fabric care: a simple step that helps you keep your sofas, upholstery and other compatible fabric surfaces looking their best.',
  ],
  size: '650 ml',
  technology: 'Nano-coating layer',
  price: '₹1,299',
  mrp: '₹1,499',
  problemsTitle: 'Spills happen. Stains don’t have to.',
  problems: [
    'Everyday spills can soak into fabric and leave visible stains.',
    'Accidental spills make sofas and upholstered furniture harder to look after.',
    'Frequent cleaning is inconvenient.',
    'Most fabric care starts after the stain. FABSEAL helps protect fabric before a spill happens.',
  ],
  targetsLabel: 'Helps protect against',
  targets: [
    { label: 'Water spills', icon: ICONS.water },
    { label: 'Food spills', icon: ICONS.food },
    { label: 'Coffee spills', icon: ICONS.coffee },
  ],
  howItWorks: {
    intro: 'FABSEAL is a nano-coating fabric stain repellent. Here’s what happens once it’s on your fabric:',
    points: [
      'It’s applied to compatible fabric following the label instructions.',
      'As it dries and cures, the coating forms a protective layer.',
      'The treated surface helps resist liquids soaking in.',
      'Spills can be easier to remove when they’re wiped up promptly.',
    ],
  },
  steps: [
    { title: 'Prepare', body: 'Start with clean fabric, prepared as the label directs.' },
    { title: 'Spot-test', body: 'Try a small hidden area first and check for any change in colour or texture.' },
    { title: 'Apply', body: 'Spray evenly, following the distance, coverage and number of coats on the label.' },
    { title: 'Dry & cure', body: 'Leave it for the full drying and curing time given on the label.' },
    { title: 'Enjoy', body: 'Use your furniture again once the curing time on the label has passed.' },
  ],
  benefits: [
    'Helps protect compatible fabric from everyday spills',
    'A preventive approach to fabric care',
    'Can make spill cleanup easier',
    'Helps maintain the appearance of fabric furniture',
    'Simple DIY fabric protection at home',
    'Fits easily into a regular upholstery-care routine',
  ],
  limitations: [
    'It’s a stain repellent, not a remover for stains that are already on the fabric.',
    'It does not make fabric completely stain-proof.',
    'Results can vary with the type of fabric and the spill.',
    'Delicate or specially treated fabrics may not be suitable. Check the label and spot-test first.',
    'Apply it exactly as the label directs. Incorrect application can affect results.',
  ],
  statement: 'Protect your fabric today. Be ready for tomorrow’s spills.',
  why: 'FABSEAL focuses on stopping spills from becoming stubborn stains. Rather than waiting until a stain appears, you take a simple preventive step to help protect your fabric furniture.',
  faqs: [
    { q: 'What is FABSEAL used for?', a: 'FABSEAL is designed to help protect compatible fabrics from water, food and coffee spills.' },
    { q: 'Does FABSEAL remove existing stains?', a: 'No. FABSEAL is the protective product. For stains that have already happened, use FABFIX, the stain remover in the FABXPERT range.' },
    { q: 'Does FABSEAL make fabric completely stain-proof?', a: 'No. It helps fabric resist liquids soaking in so spills can be easier to clean up, but the level of protection depends on the fabric and the spill.' },
    { q: 'Can it be used on every sofa?', a: 'Not necessarily. Check the fabric compatibility information on the label and always spot-test a hidden area first.' },
    { q: 'How often should it be reapplied?', a: 'Follow the guidance on the product label, or get in touch and our team will advise you.' },
    { q: 'How long should the fabric dry after application?', a: 'Allow the full drying and curing time given on the product label before using the furniture again.' },
  ],
  seoDescription:
    'FABSEAL by FABXPERT is a nano-coating fabric stain repellent that helps protect sofas and upholstery from water, food and coffee spills. 650 ml, DIY application.',
  demos: [
    { label: 'Untreated fabric', caption: 'A spill on fabric without FABSEAL' },
    { label: 'Treated with FABSEAL', caption: 'The same spill after FABSEAL has cured' },
  ],
}

export const FABFIX: Product = {
  id: 'fabfix',
  name: 'FABFIX',
  category: 'Stain Remover',
  tagline: 'Clean after the stain.',
  role: 'Remove',
  summary:
    'A multi-enzyme spray designed to help remove oil, food, coffee and ink stains from suitable fabric surfaces.',
  about: [
    'FABFIX is a fabric stain remover developed to help tackle everyday stains on compatible fabric surfaces. It’s a multi-enzyme spray made for oil, food, coffee and ink stains.',
    'It’s corrective fabric care: a convenient way to deal with stains yourself, after they happen.',
  ],
  size: '100 ml',
  technology: 'Multi-enzyme spray',
  price: '₹299',
  mrp: '₹349',
  problemsTitle: 'Tough stains happen.',
  problems: [
    'Oil and food stains can leave visible marks on fabric.',
    'Coffee spills may leave discolouration.',
    'Ink stains can be difficult to remove from some materials.',
    'Ordinary cleaning methods don’t work equally well on every stain.',
    'Calling in professional cleaning isn’t convenient for every small stain.',
  ],
  targetsLabel: 'Targets',
  targets: [
    { label: 'Oil stains', icon: ICONS.oil },
    { label: 'Food stains', icon: ICONS.food },
    { label: 'Coffee stains', icon: ICONS.coffee },
    { label: 'Ink stains', icon: ICONS.ink },
  ],
  howItWorks: {
    intro: 'FABFIX is a multi-enzyme spray that works on the stain itself:',
    points: [
      'Spray it onto the stain following the label instructions.',
      'Its enzyme formula helps lift the targeted stain from the fabric.',
      'Blot, wipe or rinse as the label directs to clear the treated stain away.',
    ],
  },
  steps: [
    { title: 'Identify', body: 'Identify the stain and check that the fabric is compatible.' },
    { title: 'Spot-test', body: 'Try a small hidden area first and check for any change in colour or texture.' },
    { title: 'Spray', body: 'Apply the spray to the stain as directed on the label.' },
    { title: 'Wait', body: 'Let it act for the time given on the label.' },
    { title: 'Blot or wipe', body: 'Blot, wipe or rinse only as the label instructs for your fabric.' },
    { title: 'Inspect', body: 'Check the result. Repeat only if the label says you can.' },
    { title: 'Dry', body: 'Let the fabric dry as directed before use.' },
  ],
  benefits: [
    'Targets four everyday stain types: oil, food, coffee and ink',
    'Convenient DIY stain treatment',
    'Tackle small stains without calling in professional cleaning',
    'Compact 100 ml spray',
    'Pairs with FABSEAL for complete fabric care',
    'Keeps your fabric-care routine simple',
  ],
  limitations: [
    'FABFIX is not a stain repellent and won’t protect against future spills.',
    'Results can vary with the stain’s age and composition, and the type of fabric.',
    'Some stains may not be completely removable.',
    'Delicate, dyed or specially treated fabrics may need extra care.',
    'Incorrect application can damage or discolour fabric, so always spot-test and follow the label.',
  ],
  statement: 'Tough stains happen. Make fabric care simpler with FABFIX.',
  why: 'FABFIX handles what FABSEAL isn’t designed for: stains that have already happened. It gives you a targeted way to treat oil, food, coffee and ink stains on compatible fabrics.',
  faqs: [
    { q: 'What is FABFIX used for?', a: 'FABFIX is designed to help remove oil, food, coffee and ink stains from suitable fabric surfaces.' },
    { q: 'Can FABFIX remove old stains?', a: 'Results can vary depending on how old the stain is, what caused it and the fabric. Follow the label, and repeat only if it says you can.' },
    { q: 'Can FABFIX be used on sofas?', a: 'Yes, on compatible sofa fabrics. Follow the label instructions and spot-test a hidden area first.' },
    { q: 'Does FABFIX protect fabric against future spills?', a: 'No. FABFIX is the stain remover. FABSEAL is the product that helps protect fabric from spills.' },
    { q: 'Will it remove every stain completely?', a: 'Results vary with the stain and the fabric, and some stains may not be completely removable.' },
    { q: 'Can it be used with other cleaning products?', a: 'No. Don’t mix FABFIX with other products unless the label says you can.' },
  ],
  seoDescription:
    'FABFIX by FABXPERT is a multi-enzyme fabric stain remover spray for oil, food, coffee and ink stains on sofas and upholstery. 100 ml, DIY application.',
  demos: [
    { label: 'Oil stain', caption: 'Before and after FABFIX' },
    { label: 'Food stain', caption: 'Before and after FABFIX' },
    { label: 'Coffee stain', caption: 'Before and after FABFIX' },
    { label: 'Ink stain', caption: 'Before and after FABFIX' },
  ],
}

export const PRODUCTS: Product[] = [FABSEAL, FABFIX]

export const getProduct = (id: string | undefined) => PRODUCTS.find((p) => p.id === id)

export const productPath = (p: Product) => `/fabxpert/${p.id}`

export const COMPARE_ROWS: { label: string; fabseal: string; fabfix: string }[] = [
  { label: 'Purpose', fabseal: 'Helps prevent spills from becoming stains', fabfix: 'Helps remove stains that have already happened' },
  { label: 'When to use', fabseal: 'Before a spill', fabfix: 'After a stain' },
  { label: 'Works on', fabseal: 'Water, food & coffee spills', fabfix: 'Oil, food, coffee & ink stains' },
  { label: 'Technology', fabseal: 'Nano-coating layer', fabfix: 'Multi-enzyme spray' },
  { label: 'Pack size', fabseal: '650 ml', fabfix: '100 ml' },
  { label: 'Application', fabseal: 'DIY', fabfix: 'DIY' },
  { label: 'Price', fabseal: '₹1,299 (MRP ₹1,499)', fabfix: '₹299 (MRP ₹349)' },
]

