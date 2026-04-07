import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useMaterials } from '../../contexts/MaterialsContext'

const categoryImages: Record<string, string> = {
  'CHENILLE':     'https://kairafabrics.s3.ap-south-1.amazonaws.com/coverpages/KairaFabrics/Ripple.webp',
  'DIGITALPRINT': 'https://kairafabrics.s3.ap-south-1.amazonaws.com/coverpages/KairaFabrics/DigitalPrints2.webp',
  'LEATHERITE':   'https://kairafabrics.s3.ap-south-1.amazonaws.com/coverpages/KairaFabrics/Adelaide.webp',
  'SUEDEFABRIC':  'https://kairafabrics.s3.ap-south-1.amazonaws.com/coverpages/KairaFabrics/Krystal.webp',
  'SUEDELEATHER': 'https://kairafabrics.s3.ap-south-1.amazonaws.com/coverpages/KairaFabrics/Ivana.webp',
  'DEFAULT':      'https://placehold.co/400x500/e7e5e4/a8a29e?text=Fabric',
}

const categoryMeta: Record<string, { label: string; desc: string; features: string[]; usedFor: string }> = {
  'CHENILLE':     { label: 'Chenille',           desc: 'Soft, richly textured weaves for lasting comfort',      features: ['Velvety pile texture', 'Highly durable', 'Fade resistant'],    usedFor: 'Sofas & cushions' },
  'DIGITALPRINT': { label: 'Digital Print',      desc: 'Vibrant, bespoke patterns with razor-sharp clarity',    features: ['Custom artwork prints', 'Colorfast & sharp', 'Light & airy'],   usedFor: 'Drapes & accent chairs' },
  'LEATHERITE':   { label: 'Artificial Leather', desc: 'Premium vegan upholstery with a supple finish',         features: ['Easy to clean', 'Water resistant', 'Animal-free'],               usedFor: 'Office & dining chairs' },
  'SUEDEFABRIC':  { label: 'Suede Fabric',       desc: 'Plush matte finish with an ultra-soft hand feel',       features: ['Buttery soft touch', 'Rich color depth', 'Breathable weave'],   usedFor: 'Lounge & bedroom' },
  'SUEDELEATHER': { label: 'Suede Leather',      desc: 'Buttery smooth leather that ages beautifully',          features: ['100% genuine leather', 'Develops patina', 'Luxurious grip'],    usedFor: 'Luxury upholstery' },
}

const CARD_VARIANTS = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.09, ease: [0.25, 0.46, 0.45, 0.94] } }),
}

// Desktop hover-reveal variants
const revealPanel = {
  rest: { y: '100%' },
  hover: {
    y: 0,
    transition: {
      duration: 0.48,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
      staggerChildren: 0.07,
      delayChildren: 0.12,
    },
  },
}

const revealItem = {
  rest: { opacity: 0, y: 10 },
  hover: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

const FabricCategoriesSection = () => {
  const { materials } = useMaterials()

  const categories = useMemo(() => {
    const counts = materials.reduce((acc, m) => {
      const type = m.material_type?.toUpperCase().replace(/\s+/g, '') || 'OTHER'
      if (!acc[type]) acc[type] = new Set<string>()
      acc[type].add(m.collection_name)
      return acc
    }, {} as Record<string, Set<string>>)
    return Object.entries(
      Object.fromEntries(Object.entries(counts).map(([k, v]) => [k, v.size]))
    ).sort((a, b) => a[0].localeCompare(b[0]))
  }, [materials])

  return (
    <div id="fabric-collections" className="scroll-mt-24">

      {/* ── Mobile: 2-column grid ── */}
      <div className="md:hidden grid grid-cols-2 gap-3">
        {categories.map(([name, count], i) => {
          const imgUrl = categoryImages[name] || categoryImages['DEFAULT']
          const { label, desc } = categoryMeta[name] ?? { label: name, desc: '' }
          return (
            <motion.div key={name} custom={i} initial="hidden" animate="visible" variants={CARD_VARIANTS}>
              <Link
                to={`/collections?category=${name}`}
                className="group block relative overflow-hidden rounded-sm shadow-md hover:shadow-xl transition-shadow duration-400"
              >
                <div className="aspect-[3/4] relative">
                  <img src={imgUrl} alt={label} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  {/* Collection badge */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="inline-block bg-black/40 backdrop-blur-sm text-white/80 text-[8px] uppercase tracking-[0.22em] px-2 py-0.5 rounded-sm border border-white/15">
                      {count} {count === 1 ? 'Collection' : 'Collections'}
                    </span>
                  </div>
                  {/* Bottom text */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="font-serif text-[15px] text-white leading-tight">{label}</h3>
                    <p className="text-[10px] text-stone-300 font-light mt-0.5 leading-snug">{desc}</p>
                    <div className="mt-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-1 group-hover:translate-y-0">
                      <span className="text-[9px] text-amber-300 uppercase tracking-[0.2em] font-semibold">Explore</span>
                      <svg className="w-3 h-3 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                  {/* Left accent bar */}
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary scale-y-0 group-hover:scale-y-100 origin-bottom transition-transform duration-500" />
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>

      {/* ── Desktop: 5-column grid with Framer Motion hover-reveal ── */}
      <div className="hidden md:grid grid-cols-3 lg:grid-cols-5 gap-5">
        {categories.map(([name, count], i) => {
          const imgUrl = categoryImages[name] || categoryImages['DEFAULT']
          const { label, desc, features, usedFor } = categoryMeta[name] ?? { label: name, desc: '', features: [], usedFor: '' }
          return (
            <motion.div key={name} custom={i} initial="hidden" animate="visible" variants={CARD_VARIANTS}>
              <Link to={`/collections?category=${name}`} className="block">
                {/* This motion.div owns the hover state — all motion children inherit "rest"/"hover" */}
                <motion.div
                  className="aspect-[4/5] relative overflow-hidden rounded-sm shadow-lg"
                  initial="rest"
                  whileHover="hover"
                  animate="rest"
                >
                  {/* Image — scales in on hover via variant propagation */}
                  <motion.img
                    src={imgUrl}
                    alt={label}
                    className="w-full h-full object-cover"
                    variants={{
                      rest:  { scale: 1 },
                      hover: { scale: 1.08, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
                    }}
                  />

                  {/* Permanent base gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

                  {/* Idle state — category name always visible, fades out on hover */}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 p-4"
                    variants={{
                      rest:  { opacity: 1, y: 0 },
                      hover: { opacity: 0, y: 8, transition: { duration: 0.2 } },
                    }}
                  >
                    <span className="text-[9px] text-white/55 uppercase tracking-[0.25em] font-medium">
                      {count} {count === 1 ? 'Collection' : 'Collections'}
                    </span>
                    <h3 className="font-serif text-xl text-white leading-tight mt-0.5">{label}</h3>
                    <p className="text-[11px] text-stone-300/70 font-light mt-1">{desc}</p>
                  </motion.div>

                  {/* ── Hover reveal panel — slides up from bottom ── */}
                  <motion.div
                    className="absolute inset-0 flex flex-col justify-end p-5 bg-gradient-to-t from-black/95 via-black/80 to-black/40"
                    variants={revealPanel}
                  >
                    {/* Collection count */}
                    <motion.span
                      variants={revealItem}
                      className="text-[9px] text-amber-300/90 uppercase tracking-[0.3em] font-bold"
                    >
                      {count} {count === 1 ? 'Collection' : 'Collections'}
                    </motion.span>

                    {/* Title */}
                    <motion.h3
                      variants={revealItem}
                      className="font-serif text-[22px] text-white leading-tight mt-2"
                    >
                      {label}
                    </motion.h3>

                    {/* Description */}
                    <motion.p
                      variants={revealItem}
                      className="text-[11px] text-stone-300/80 font-light mt-2 leading-relaxed"
                    >
                      {desc}
                    </motion.p>

                    {/* Divider */}
                    <motion.div variants={revealItem} className="my-3 h-px bg-white/15" />

                    {/* Feature bullets */}
                    <motion.ul variants={revealItem} className="space-y-1.5">
                      {features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-[10px] text-stone-300/75">
                          <span className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </motion.ul>

                    {/* Ideal for */}
                    <motion.p
                      variants={revealItem}
                      className="mt-2.5 text-[9px] text-stone-400/60 uppercase tracking-[0.18em]"
                    >
                      Ideal for:{' '}
                      <span className="text-amber-300/70 normal-case">{usedFor}</span>
                    </motion.p>

                    {/* CTA */}
                    <motion.div variants={revealItem} className="mt-4 flex items-center gap-2">
                      <span className="text-[10px] text-white uppercase tracking-[0.28em] font-bold border-b border-white/30 pb-px">
                        Browse Collection
                      </span>
                      <svg className="w-3.5 h-3.5 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </motion.div>
                  </motion.div>

                  {/* Left accent bar — framer-motion controlled */}
                  <motion.div
                    className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary origin-bottom"
                    variants={{
                      rest:  { scaleY: 0 },
                      hover: { scaleY: 1, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
                    }}
                  />
                </motion.div>
              </Link>
            </motion.div>
          )
        })}
      </div>

    </div>
  )
}

export default FabricCategoriesSection
