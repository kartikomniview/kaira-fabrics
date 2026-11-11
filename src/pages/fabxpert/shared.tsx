import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ICONS, SURFACES, COMPARE_ROWS, PRODUCTS, productPath, EXPO_OUT, DOT_PATTERN, type Product } from './products'

export const Icon = ({ d, className = 'w-5 h-5' }: { d: string; className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
)

/** Fades children up when scrolled into view. `as="li"` keeps list markup valid inside <ol>/<ul>. */
export const Reveal = ({ children, delay = 0, className = '', as = 'div' }: { children: ReactNode; delay?: number; className?: string; as?: 'div' | 'li' }) => {
  const Comp = as === 'li' ? motion.li : motion.div
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.8, delay, ease: EXPO_OUT }}
    >
      {children}
    </Comp>
  )
}

export const Eyebrow = ({ children, light = false, center = false }: { children: ReactNode; light?: boolean; center?: boolean }) => (
  <div className={`flex items-center gap-3 mb-3 ${center ? 'justify-center' : ''}`}>
    <span className="w-6 h-px bg-primary shrink-0" />
    <span className={`text-[11px] font-bold uppercase tracking-[0.3em] ${light ? 'text-white/70' : 'text-stone-500'}`}>{children}</span>
  </div>
)

/** Illustrated spray bottle, stands in for product photography. FABSEAL is the large dark bottle, FABFIX the small light one. */
export const Bottle = ({ product, className = '' }: { product: Product; className?: string }) => {
  const seal = product.id === 'fabseal'
  const body = seal ? '#574929' : '#FAF8F5'
  // Light-brown accents keep both bottles readable on the dark hero and on the white product cards
  const bodyEdge = seal ? '#9a8460' : '#e7e5e4'
  const head = seal ? '#2f2818' : '#9a8460'
  return (
    <svg viewBox="0 0 120 230" className={className} role="img" aria-label={`${product.name} ${product.size} bottle`}>
      <rect x="10" y="14" width="26" height="10" rx="2" fill={head} />
      <rect x="28" y="6" width="56" height="30" rx="6" fill={head} />
      <path d="M44 36 q-4 18 6 24 l6 -2 q-6 -8 -4 -22z" fill={head} />
      <rect x="46" y="36" width="28" height="22" rx="3" fill={bodyEdge} />
      <rect x="20" y="56" width="80" height="168" rx="16" fill={body} stroke={bodyEdge} strokeWidth="2" />
      <rect x="28" y="66" width="8" height="140" rx="4" fill="#ffffff" opacity={seal ? 0.08 : 0.6} />
      <rect x="28" y="104" width="64" height="86" fill="#97c41e" />
      <text x="60" y="122" textAnchor="middle" fontSize="6" fontWeight="700" letterSpacing="1.2" fill="#2f2818">FABXPERT</text>
      <line x1="40" y1="128" x2="80" y2="128" stroke="#2f2818" strokeOpacity="0.35" strokeWidth="0.75" />
      <text x="60" y="146" textAnchor="middle" fontSize="12.5" fontWeight="800" letterSpacing="0.5" fill="#2f2818">{product.name}</text>
      <text x="60" y="158" textAnchor="middle" fontSize="5.5" fontWeight="600" letterSpacing="1" fill="#2f2818">{product.category.toUpperCase()}</text>
      <text x="60" y="181" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#2f2818">{product.size}</text>
    </svg>
  )
}

/** Product photo when one is set, otherwise the illustrated bottle */
export const ProductVisual = ({ product, className = '' }: { product: Product; className?: string }) =>
  product.image ? (
    <img src={product.image} alt={`${product.name} ${product.size}`} className={`object-contain ${className}`} />
  ) : (
    <Bottle product={product} className={className} />
  )

/**
 * Image with a built-in dummy placeholder: renders `src` when supplied, otherwise a labelled
 * "photo coming soon" panel of the same size. Swap in real images later by passing `src`.
 */
export const ImageSlot = ({
  src,
  alt,
  label,
  className = '',
  dark = false,
}: {
  src?: string
  alt: string
  /** What photo belongs here, shown on the placeholder */
  label: string
  className?: string
  dark?: boolean
}) =>
  src ? (
    <img src={src} alt={alt} loading="lazy" className={`object-cover ${className}`} />
  ) : (
    <div
      role="img"
      aria-label={`${alt} (image coming soon)`}
      className={`relative overflow-hidden flex flex-col items-center justify-center gap-3 text-center p-6 ${dark ? 'bg-white/5 border border-white/10 text-white/60' : 'bg-stone-100 border border-stone-200 text-stone-400'} ${className}`}
    >
      <div
        className="absolute inset-0 opacity-60"
        style={{ backgroundImage: `repeating-linear-gradient(135deg, transparent 0 14px, ${dark ? 'rgba(255,255,255,0.04)' : 'rgba(120,113,108,0.07)'} 14px 28px)` }}
      />
      <svg className="relative w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.25} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
      <span className="relative text-[10px] font-bold uppercase tracking-[0.25em]">Image coming soon</span>
      <span className={`relative text-xs max-w-[16rem] ${dark ? 'text-white/50' : 'text-stone-500'}`}>{label}</span>
    </div>
  )

const FaqItem = ({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) => (
  <div className="border-b border-stone-200">
    <button onClick={onToggle} aria-expanded={open} className="w-full flex items-center justify-between gap-6 py-5 text-left group">
      <span className={`font-serif text-base sm:text-lg transition-colors ${open ? 'text-primary-dark' : 'color-secondary-dark group-hover:text-primary-dark'}`}>{q}</span>
      <span className={`shrink-0 w-8 h-8 flex items-center justify-center border transition-all duration-300 ${open ? 'bg-primary border-primary text-secondary-dark rotate-45' : 'border-stone-300 text-stone-500'}`}>
        <Icon d={ICONS.plus} className="w-4 h-4" />
      </span>
    </button>
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.35, ease: EXPO_OUT }}
          className="overflow-hidden"
        >
          <p className="pb-5 pr-12 text-sm sm:text-base text-stone-600 font-light leading-relaxed">{a}</p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
)

export const FaqSection = ({ faqs, title = 'Questions, answered' }: { faqs: { q: string; a: string }[]; title?: string }) => {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section className="py-12 md:py-24 bg-white border-b border-stone-200">
      <div className="max-w-3xl mx-auto px-6 lg:px-10">
        <Reveal className="text-center mb-8 md:mb-10">
          <Eyebrow center>FAQs</Eyebrow>
          <h2 className="font-serif text-3xl sm:text-4xl color-secondary-dark">{title}</h2>
        </Reveal>
        <Reveal>
          <div className="border-t border-stone-200">
            {faqs.map((f, i) => (
              <FaqItem key={f.q} q={f.q} a={f.a} open={open === i} onToggle={() => setOpen(open === i ? null : i)} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export const SurfacesSection = ({ subtitle }: { subtitle: string }) => (
  <section className="py-12 md:py-20 bg-secondary-dark relative overflow-hidden">
    <div className="absolute inset-0 opacity-[0.08]" style={DOT_PATTERN} />
    <div className="relative max-w-6xl mx-auto px-6 lg:px-10">
      <Reveal className="text-center mb-8 md:mb-12">
        <Eyebrow light center>Where to Use</Eyebrow>
        <h2 className="font-serif text-3xl sm:text-4xl text-white">Made for the fabrics you live with</h2>
        <p className="mt-3 text-stone-400 text-sm sm:text-base font-light max-w-xl mx-auto">{subtitle}</p>
      </Reveal>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {SURFACES.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.06} className={i === SURFACES.length - 1 ? 'col-span-2 sm:col-span-1' : ''}>
            <div className="group h-full border border-white/10 bg-white/5 p-4 sm:p-6 flex flex-col items-center text-center gap-2 sm:gap-3 hover:bg-primary hover:border-primary transition-colors duration-300">
              <span className="text-primary group-hover:text-secondary-dark transition-colors"><Icon d={s.icon} className="w-6 h-6 sm:w-8 sm:h-8" /></span>
              <span className="text-sm font-medium text-white group-hover:text-secondary-dark transition-colors">{s.label}</span>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
)

/** FABSEAL vs FABFIX table; `highlight` tints the current product's column on a product page */
export const CompareTable = ({ highlight }: { highlight?: Product['id'] }) => {
  const cols = PRODUCTS.map((p) => ({ p, on: highlight === p.id }))
  return (
    <>
    {/* Phones: product header + one stacked block per row (no sideways scrolling) */}
    <div className="sm:hidden border border-stone-200 text-sm">
      <div className="grid grid-cols-2 bg-secondary-dark text-white">
        {cols.map(({ p, on }) => (
          <Link key={p.id} to={productPath(p)} className={`p-3.5 border-l first:border-l-0 border-white/10 ${on ? 'bg-white/10' : ''}`}>
            <span className="block font-serif text-base">{p.name}</span>
            <span className="text-[9px] uppercase tracking-[0.2em] text-primary">{p.category}</span>
          </Link>
        ))}
      </div>
      {COMPARE_ROWS.map((r, i) => (
        <div key={r.label} className={i % 2 ? 'bg-stone-50' : 'bg-white'}>
          <p className="px-3.5 pt-3 text-[10px] font-bold uppercase tracking-[0.15em] text-stone-500">{r.label}</p>
          <div className="grid grid-cols-2">
            {cols.map(({ p, on }) => (
              <p key={p.id} className={`px-3.5 pt-1 pb-3 text-[13px] leading-snug color-secondary-dark font-light ${on ? 'bg-primary/10 font-normal' : ''}`}>
                {r[p.id]}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>

    <div className="hidden sm:block">
      <table className="w-full border border-stone-200 text-sm">
        <thead>
          <tr className="bg-secondary-dark text-white">
            <th className="p-4 w-1/4" />
            {cols.map(({ p, on }) => (
              <th key={p.id} className={`p-4 text-left border-l border-white/10 ${on ? 'bg-white/10' : ''}`}>
                <Link to={productPath(p)} className="block font-serif text-lg hover:text-primary transition-colors">{p.name}</Link>
                <span className="text-[10px] uppercase tracking-[0.2em] text-primary">{p.category}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {COMPARE_ROWS.map((r, i) => (
            <tr key={r.label} className={i % 2 ? 'bg-stone-50' : 'bg-white'}>
              <th scope="row" className="p-4 text-left text-[11px] font-bold uppercase tracking-[0.15em] text-stone-500 align-top">{r.label}</th>
              {cols.map(({ p, on }) => (
                <td key={p.id} className={`p-4 color-secondary-dark font-light align-top border-l border-stone-200 ${on ? 'bg-primary/10 font-normal' : ''}`}>
                  {r[p.id]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </>
  )
}

export const CtaStrip = ({ title, body, onEnquire }: { title: string; body: string; onEnquire: () => void }) => (
  <section className="bg-secondary-dark py-14 md:py-16 relative overflow-hidden">
    <div className="relative max-w-7xl mx-auto px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-8">
      <div className="text-center md:text-left">
        <h2 className="font-serif text-2xl sm:text-3xl text-white mb-2">{title}</h2>
        <p className="text-stone-400 text-sm sm:text-base font-light max-w-lg">{body}</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full md:w-auto">
        <button
          onClick={onEnquire}
          className="group inline-flex items-center justify-center gap-3 px-10 py-4 bg-primary text-secondary-dark hover:bg-white transition-all duration-300 shadow-lg font-bold text-xs md:text-sm uppercase tracking-widest w-full sm:w-auto"
        >
          Enquire Now
          <Icon d={ICONS.arrow} className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
        <Link
          to="/contact"
          className="inline-flex items-center justify-center gap-3 px-10 py-4 border border-stone-600 text-stone-300 hover:border-primary hover:text-white transition-all duration-300 font-bold text-xs md:text-sm uppercase tracking-widest w-full sm:w-auto"
        >
          Contact Us
        </Link>
      </div>
    </div>
  </section>
)
