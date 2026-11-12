import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Seo, { pageTitle } from '../components/seo/Seo'
import { DOT_PATTERN, EXPO_OUT, ICONS, PRODUCTS, productPath, type Product } from './fabxpert/products'
import { Icon, ProductVisual } from './fabxpert/shared'

/** White product card: big image, key details and a big CTA. The whole card links to the product page. */
const ProductCard = ({ product, index }: { product: Product; index: number }) => {
  const isSeal = product.id === 'fabseal'
  return (
    <motion.div
      className="flex"
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.35 + index * 0.12, ease: EXPO_OUT }}
    >
      <Link
        to={productPath(product)}
        aria-label={`Explore ${product.name} ${product.category}`}
        className="group flex-1 flex flex-col bg-white border border-stone-200 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden"
      >
        {/* Phones: image | details side by side. sm+: image on top, details below */}
        <div className="flex-1 flex sm:flex-col">
          {/* Big product image */}
          <div className="relative w-[38%] shrink-0 min-h-[190px] sm:w-auto sm:min-h-0 sm:h-[240px] bg-[#f5f1e8] flex items-end justify-center pb-4 sm:pb-6 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none" style={{ ...DOT_PATTERN, opacity: 0.22, backgroundSize: '22px 22px' }} />
            <span className="hidden sm:inline-flex absolute top-5 left-5 items-center gap-2 px-3 py-1.5 bg-white text-[10px] font-bold uppercase tracking-[0.25em] text-secondary-dark shadow-sm">
              <Icon d={isSeal ? ICONS.shield : ICONS.sparkle} className="w-3.5 h-3.5 text-primary-dark" />
              {product.category}
            </span>
            <div className={`relative flex items-end ${isSeal ? 'h-[80%]' : 'h-[62%]'}`}>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[85%] h-4 rounded-[50%] bg-secondary-dark/20 blur-md" />
              <ProductVisual
                product={product}
                className="relative h-full w-auto drop-shadow-2xl transition-transform duration-700 ease-out group-hover:-translate-y-3 group-hover:scale-[1.03]"
              />
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 flex flex-col p-4 sm:p-6 sm:pb-0 lg:p-7 lg:pb-0">
            {/* On phones the category moves here from the image corner, which is too narrow for it */}
            <span className="sm:hidden inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-stone-500 mb-1.5">
              <Icon d={isSeal ? ICONS.shield : ICONS.sparkle} className="w-3 h-3 text-primary-dark" />
              {product.category}
            </span>
            <h2 className="font-serif text-xl sm:text-4xl color-secondary-dark leading-none">{product.name}</h2>
            <p className="mt-1 sm:mt-1.5 font-serif text-[11px] sm:text-lg text-primary-dark leading-snug">{product.tagline}</p>

            {/* What it works on, as chips instead of a sentence; flex-1 keeps both cards' buttons aligned */}
            <div className="mt-3 sm:mt-4 flex-1 flex flex-wrap content-start gap-1.5 sm:gap-2">
              {product.targets.map((t) => (
                <span key={t.label} className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 bg-stone-50 border border-stone-200 text-[10px] sm:text-[11px] color-secondary-dark">
                  <Icon d={t.icon} className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary-dark" /> {t.label}
                </span>
              ))}
            </div>

            <div className="mt-3 sm:mt-4 flex flex-wrap items-baseline gap-x-2 sm:gap-x-3 gap-y-0.5">
              <span className="font-serif text-lg sm:text-3xl color-secondary-dark">{product.price}</span>
              <span className="text-[11px] sm:text-sm text-stone-400 line-through">MRP {product.mrp}</span>
              <span className="text-[11px] sm:text-sm text-stone-500">· {product.size}</span>
            </div>
          </div>
        </div>

        {/* CTA: full width under the card on phones, under the details from sm up.
            The dark button's bg is arbitrary on purpose: index.css's unlayered .bg-secondary-dark would override the
            hover colour. Text stays white on hover. */}
        <div className="px-4 pb-4 sm:px-6 sm:pb-6 sm:pt-5 lg:px-7 lg:pb-7">
          <span
            className={`w-full inline-flex items-center justify-center gap-2.5 sm:gap-3 px-6 py-2.5 sm:px-8 sm:py-4 font-bold text-[11px] sm:text-sm uppercase tracking-[0.18em] sm:tracking-[0.2em] transition-colors duration-300 ${isSeal ? 'bg-primary text-secondary-dark group-hover:bg-primary-dark' : 'bg-[var(--color-secondary-dark)] text-white group-hover:bg-secondary'}`}
          >
            Explore {product.name}
            <Icon d={ICONS.arrow} className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1.5" />
          </span>
        </div>
      </Link>
    </motion.div>
  )
}

/** /fabxpert: FABXPERT logo and intro, then one white card per product linking to /fabxpert/:product */
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

      <section className="relative bg-[#efeae0] pt-[92px] pb-10 sm:pt-28 sm:pb-14 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.14]" style={DOT_PATTERN} />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-10">
          {/* Logo + intro */}
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10">
            <motion.img
              src="/images/fabxpert_logo.png"
              alt="FABXPERT by KAIRA"
              className="block mx-auto h-6 sm:h-11 w-auto"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EXPO_OUT }}
            />
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15, ease: EXPO_OUT }}>
              <h1 className="mt-3 sm:mt-5 font-serif text-lg sm:text-4xl md:text-[2.75rem] color-secondary-dark leading-snug sm:leading-tight">
                Protect before the spill.
                <br />
                <span className="text-primary-dark">Clean after the stain.</span>
              </h1>
              <p className="mt-1.5 sm:mt-3 text-stone-600 text-xs sm:text-base md:text-lg font-light">
                DIY fabric care for sofas and upholstery.
              </p>
            </motion.div>
          </div>

          {/* Product cards */}
          <div className="grid md:grid-cols-2 gap-4 sm:gap-5 lg:gap-8 max-w-5xl mx-auto">
            {PRODUCTS.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default FabXpertPage
