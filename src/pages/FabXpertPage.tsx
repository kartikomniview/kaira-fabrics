import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Seo, { pageTitle } from '../components/seo/Seo'
import { DOT_PATTERN, EXPO_OUT, ICONS, PRODUCTS, productPath, type Product } from './fabxpert/products'
import { Icon, ProductVisual } from './fabxpert/shared'

// Exactly the screen below the fixed header (2px brand bar + 64px header, 76px from lg).
// Phones stack the panels with at-least-full-height; side by side they are fixed-height so the image shrinks to fit.
const PANEL_HEIGHT = 'min-h-[calc(100svh-66px)] md:min-h-[600px] md:h-[calc(100svh-66px)] lg:h-[calc(100svh-78px)]'

/** One full-height half of the split: the whole panel links to the product's detail page */
const ProductPanel = ({ product, index }: { product: Product; index: number }) => {
  const dark = index === 0
  return (
    <motion.div
      className="flex"
      initial={{ opacity: 0, x: dark ? -40 : 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1, delay: 0.1 + index * 0.12, ease: EXPO_OUT }}
    >
      <Link
        to={productPath(product)}
        aria-label={`Explore ${product.name} ${product.category}`}
        className={`group relative flex-1 flex flex-col items-center text-center overflow-hidden px-6 pt-16 pb-10 sm:px-10 md:pb-8 lg:px-14 lg:pt-16 lg:pb-10 ${PANEL_HEIGHT} ${dark ? 'bg-secondary-dark' : 'bg-[#ece7dc]'}`}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ ...DOT_PATTERN, opacity: dark ? 0.1 : 0.18 }} />

        {/* Heading */}
        <div className="relative">
          <span className={`inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.3em] ${dark ? 'text-white/60' : 'text-stone-500'}`}>
            <Icon d={dark ? ICONS.shield : ICONS.sparkle} className="w-4 h-4 text-primary-dark" />
            {product.role} · {product.category}
          </span>
          {/* Side-by-side panels on a short screen (e.g. 1280×720 laptops): trim text so the image stays big */}
          <h2 className={`mt-3 font-serif text-5xl sm:text-6xl xl:text-7xl md:[@media(max-height:800px)]:text-5xl leading-none ${dark ? 'text-white' : 'color-secondary-dark'}`}>{product.name}</h2>
          <p className={`mt-3 font-serif text-xl sm:text-2xl ${dark ? 'text-primary' : 'text-primary-dark'}`}>{product.tagline}</p>
        </div>

        {/* Big product image: fills whatever height is left in the panel (capped), fixed size on phones */}
        <div className="relative flex-1 md:min-h-0 w-full flex items-center justify-center my-6 md:my-5 lg:my-6">
          <div className={`relative flex items-end ${product.id === 'fabseal' ? 'h-[300px] sm:h-[360px] md:h-full md:max-h-[460px]' : 'h-[240px] sm:h-[290px] md:h-[80%] md:max-h-[370px]'}`}>
            <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-[85%] h-5 rounded-[50%] blur-md ${dark ? 'bg-black/35' : 'bg-secondary-dark/20'}`} />
            <ProductVisual
              product={product}
              className="relative h-full w-auto drop-shadow-2xl transition-transform duration-700 ease-out group-hover:-translate-y-3 group-hover:scale-[1.03]"
            />
          </div>
        </div>

        {/* Summary + CTA */}
        <div className="relative w-full max-w-md">
          <p className={`text-sm sm:text-base font-light leading-relaxed md:[@media(max-height:800px)]:hidden ${dark ? 'text-stone-300' : 'text-stone-600'}`}>{product.summary}</p>
          <div className="mt-4 md:[@media(max-height:800px)]:mt-0 flex items-baseline justify-center gap-3">
            <span className={`font-serif text-2xl sm:text-3xl ${dark ? 'text-white' : 'color-secondary-dark'}`}>{product.price}</span>
            <span className={`text-sm line-through ${dark ? 'text-stone-400' : 'text-stone-400'}`}>MRP {product.mrp}</span>
            <span className={`text-sm ${dark ? 'text-stone-400' : 'text-stone-500'}`}>· {product.size}</span>
          </div>
          <span
            className={`mt-5 lg:mt-6 w-full inline-flex items-center justify-center gap-3 px-8 py-4 lg:py-5 font-bold text-sm uppercase tracking-[0.2em] shadow-lg transition-colors duration-300 ${dark ? 'bg-primary text-secondary-dark group-hover:bg-white' : 'bg-[var(--color-secondary-dark)] text-white group-hover:bg-secondary'}`}
            // Light panel: text stays white on hover. The arbitrary bg is deliberate: index.css's unlayered
            // .bg-secondary-dark would otherwise override the hover background.
          >
            Explore {product.name}
            <Icon d={ICONS.arrow} className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1.5" />
          </span>
        </div>
      </Link>
    </motion.div>
  )
}

/** /fabxpert: full-height split screen, one panel per FABXPERT product, each linking to /fabxpert/:product */
const FabXpertPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      <Seo
        title={pageTitle('FabXpert Fabric Care')}
        description="FABXPERT by KAIRA: FABSEAL stain repellent protects fabric before the spill, and FABFIX stain remover cleans after the stain. DIY fabric care for sofas and upholstery."
      />

      <section className="relative pt-[66px] lg:pt-[78px]">
        <h1 className="sr-only">FABXPERT fabric care by KAIRA: FABSEAL and FABFIX</h1>

        {/* FABXPERT logo centred on the seam between the panels */}
        <motion.div
          className="absolute z-10 left-1/2 -translate-x-1/2 top-[86px] lg:top-[98px] pointer-events-none"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: EXPO_OUT }}
        >
          <img src="/images/fabxpert_logo.png" alt="" className="h-5 lg:h-6 w-auto" />
        </motion.div>

        <div className="grid md:grid-cols-2">
          {PRODUCTS.map((p, i) => (
            <ProductPanel key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>
    </>
  )
}

export default FabXpertPage
