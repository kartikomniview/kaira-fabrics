import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Seo, { pageTitle } from '../../components/seo/Seo'
import EnquiryFormModal from '../../components/ui/EnquiryFormModal'
import { DOT_PATTERN, EXPO_OUT, ICONS, IDEAL_FOR, PRODUCTS, getProduct, productPath } from './products'
import { CompareTable, CtaStrip, Eyebrow, FaqSection, Icon, ImageSlot, ProductVisual, Reveal, SurfacesSection } from './shared'

/** /fabxpert/:product — full detail page for one FABXPERT product (FABSEAL or FABFIX) */
const FabXpertProductPage = () => {
  const { product: productId } = useParams()
  const product = getProduct(productId)
  const [showEnquiry, setShowEnquiry] = useState(false)

  // Also runs when hopping between the two product pages, which reuses this component
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [productId])

  if (!product) return <Navigate to="/fabxpert" replace />

  const other = PRODUCTS.find((p) => p.id !== product.id)!
  const isSeal = product.id === 'fabseal'

  const specs = [
    { label: 'Product category', value: product.category },
    { label: 'Technology', value: product.technology },
    { label: 'Pack size', value: product.size },
    { label: 'Application', value: 'DIY' },
    { label: 'Price', value: `${product.price} (MRP ${product.mrp})` },
    { label: 'Ideal for', value: IDEAL_FOR },
    { label: 'Availability', value: 'Through KAIRA dealers' },
  ]

  return (
    <>
      <Seo title={pageTitle(`${product.name} ${product.category}`)} description={product.seoDescription} />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative bg-secondary-dark overflow-hidden pt-24 pb-12 sm:pt-28 sm:pb-14 md:pt-36 md:pb-20">
        <div className="absolute inset-0 opacity-[0.12]" style={DOT_PATTERN} />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-6 sm:mb-8 md:mb-12 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/50">
            <Link to="/fabxpert" className="inline-flex items-center gap-2 hover:text-primary transition-colors">
              <Icon d={ICONS.back} className="w-3.5 h-3.5" /> FabXpert
            </Link>
            <span>/</span>
            <span className="text-white">{product.name}</span>
          </nav>

          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-8 sm:gap-10 lg:gap-16 items-center">
            <div>
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EXPO_OUT }}>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-secondary-dark text-[10px] font-bold uppercase tracking-[0.25em]">
                  <Icon d={isSeal ? ICONS.shield : ICONS.sparkle} className="w-3.5 h-3.5" /> {product.category}
                </span>
              </motion.div>
              <div className="overflow-hidden mt-5">
                <motion.h1
                  className="font-serif text-5xl sm:text-6xl lg:text-7xl text-white leading-none"
                  initial={{ y: '110%' }}
                  animate={{ y: '0%' }}
                  transition={{ duration: 1, delay: 0.1, ease: EXPO_OUT }}
                >
                  {product.name}
                </motion.h1>
              </div>
              <motion.p
                className="mt-2 text-[11px] uppercase tracking-[0.3em] text-white/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.25 }}
              >
                by FABXPERT
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3, ease: EXPO_OUT }}>
                <p className="mt-5 font-serif text-2xl sm:text-3xl text-primary">{product.tagline}</p>
                <p className="mt-4 text-stone-300 text-sm sm:text-base md:text-lg font-light leading-relaxed max-w-xl">{product.summary}</p>

                <div className="mt-6 sm:mt-7 flex items-baseline gap-3">
                  <span className="font-serif text-3xl sm:text-4xl text-white">{product.price}</span>
                  <span className="text-sm text-stone-400 line-through">MRP {product.mrp}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[product.size, product.technology, 'DIY application'].map((s) => (
                    <span key={s} className="px-3 py-1.5 border border-white/20 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/80">{s}</span>
                  ))}
                </div>

                <div className="mt-7 sm:mt-8 grid grid-cols-2 sm:flex gap-3 sm:gap-4">
                  <button
                    onClick={() => setShowEnquiry(true)}
                    className="group inline-flex items-center justify-center gap-2 sm:gap-3 px-4 py-3.5 sm:px-8 sm:py-4 bg-primary text-secondary-dark hover:bg-white transition-colors font-bold text-xs uppercase tracking-widest"
                  >
                    Enquire Now <Icon d={ICONS.arrow} className="hidden sm:block w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <a href="#how-to-use" className="inline-flex items-center justify-center px-4 py-3.5 sm:px-8 sm:py-4 border border-white/30 text-white hover:border-primary hover:text-primary transition-colors font-bold text-xs uppercase tracking-widest">
                    How to use
                  </a>
                </div>
              </motion.div>
            </div>

            {/* Product visual */}
            <motion.div
              className="relative flex items-end justify-center h-[240px] sm:h-[400px] lg:h-[480px]"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.2, ease: EXPO_OUT }}
            >
              <div className="absolute bottom-0 w-3/5 h-6 rounded-[50%] bg-black/30 blur-md" />
              <ProductVisual product={product} className={`relative ${isSeal ? 'h-full' : 'h-[78%]'} w-auto drop-shadow-2xl`} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── What is it + problem ─────────────────────────────── */}
      <section className="py-12 md:py-24 bg-cream border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-20 items-center">
          <Reveal>
            <ImageSlot
              src={product.lifestyleImage}
              alt={`${product.name} in use on a fabric sofa`}
              label={isSeal ? 'Lifestyle photo: FABSEAL being sprayed onto a fabric sofa' : 'Lifestyle photo: FABFIX treating a stain on a fabric sofa'}
              className="w-full aspect-[4/3]"
            />
          </Reveal>
          <div>
            <Reveal>
              <Eyebrow>What is {product.name}?</Eyebrow>
              <h2 className="font-serif text-3xl sm:text-4xl color-secondary-dark leading-tight">{isSeal ? 'Preventive care for your fabric' : 'Corrective care for everyday stains'}</h2>
              <div className="mt-5 space-y-4 text-stone-600 text-sm sm:text-base font-light leading-relaxed">
                {product.about.map((p) => <p key={p}>{p}</p>)}
              </div>
            </Reveal>
            <Reveal delay={0.08} className="mt-6 sm:mt-8 bg-white border border-stone-200 p-5 sm:p-6">
              <h3 className="font-serif text-lg color-secondary-dark mb-4">{product.problemsTitle}</h3>
              <ul className="space-y-3">
                {product.problems.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-sm text-stone-600 font-light leading-relaxed">
                    <span className="mt-2 w-1.5 h-1.5 shrink-0 bg-primary" />
                    {p}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Targets + how it works ───────────────────────────── */}
      <section className="py-12 md:py-24 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <Reveal className="text-center max-w-2xl mx-auto mb-8 md:mb-12">
            <Eyebrow center>{product.targetsLabel}</Eyebrow>
            <h2 className="font-serif text-3xl sm:text-4xl color-secondary-dark leading-tight">
              {isSeal ? 'Made for everyday spills' : 'Made for everyday stains'}
            </h2>
          </Reveal>
          <div className={`grid gap-3 sm:gap-4 max-w-4xl mx-auto ${product.targets.length === 4 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-3'}`}>
            {product.targets.map((t, i) => (
              <Reveal key={t.label} delay={i * 0.08}>
                <div className="group h-full bg-cream border border-stone-200 p-4 sm:p-7 flex flex-col items-center text-center gap-2 sm:gap-3 hover:border-primary hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                  <span className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center bg-primary/15 text-secondary-dark group-hover:bg-primary transition-colors">
                    <Icon d={t.icon} className="w-5 h-5 sm:w-7 sm:h-7" />
                  </span>
                  <span className="text-xs sm:text-base font-medium color-secondary-dark">{t.label}</span>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-4 text-center text-xs text-stone-400">
            {isSeal
              ? 'FABSEAL is designed for water, food and coffee spills.'
              : 'FABFIX is designed for oil, food, coffee and ink stains. For any other stain, check the label or ask our team first.'}
          </Reveal>

          {/* How it works */}
          <div className="mt-12 md:mt-20 grid lg:grid-cols-[1fr_1.4fr] gap-6 sm:gap-10 lg:gap-16 items-start">
            <Reveal>
              <Eyebrow>How it works</Eyebrow>
              <h3 className="font-serif text-2xl sm:text-3xl color-secondary-dark leading-tight">{product.technology}</h3>
              <p className="mt-4 text-stone-600 text-sm sm:text-base font-light leading-relaxed">{product.howItWorks.intro}</p>
            </Reveal>
            <div className="relative">
              <div className="absolute left-5 top-5 bottom-5 w-px bg-stone-200" />
              <ol className="space-y-4">
                {product.howItWorks.points.map((pt, i) => (
                  <Reveal key={pt} as="li" delay={i * 0.08} className="relative flex items-start gap-5">
                    <span className="relative z-10 w-10 h-10 shrink-0 flex items-center justify-center bg-secondary-dark text-primary font-serif text-sm">{i + 1}</span>
                    <p className="pt-2 text-sm sm:text-base color-secondary-dark font-light leading-relaxed">{pt}</p>
                  </Reveal>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ── Before & after ───────────────────────────────────── */}
      <section className="py-12 md:py-24 bg-stone-50 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <Reveal className="text-center max-w-2xl mx-auto mb-8 md:mb-12">
            <Eyebrow center>See it in action</Eyebrow>
            <h2 className="font-serif text-3xl sm:text-4xl color-secondary-dark leading-tight">
              {isSeal ? 'Protection you can see' : 'Before & after'}
            </h2>
            <p className="mt-3 text-stone-500 text-sm sm:text-base font-light">
              {isSeal
                ? 'How a spill behaves on untreated fabric compared with fabric treated with FABSEAL.'
                : 'Real results on each stain type FABFIX is made for.'}
            </p>
          </Reveal>
          <div className={`grid grid-cols-2 gap-3 sm:gap-6 ${product.demos.length === 4 ? 'lg:grid-cols-4' : 'max-w-5xl mx-auto'}`}>
            {product.demos.map((d, i) => (
              <Reveal key={d.label} delay={i * 0.08}>
                <figure className="h-full bg-white border border-stone-200">
                  <ImageSlot src={d.src} alt={`${product.name}: ${d.label}`} label={`${d.label}: ${d.caption}`} className={`w-full border-0 aspect-square ${product.demos.length === 4 ? '' : 'sm:aspect-[4/3]'}`} />
                  <figcaption className="p-3 sm:p-4">
                    <p className="font-semibold text-sm color-secondary-dark">{d.label}</p>
                    <p className="text-xs text-stone-500 font-light mt-0.5">{d.caption}</p>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-5 text-center text-xs text-stone-400">
            Results vary with the fabric, the type of {isSeal ? 'spill' : 'stain'} and conditions of use.
          </Reveal>
        </div>
      </section>

      {/* ── How to use ───────────────────────────────────────── */}
      <section id="how-to-use" className="scroll-mt-20 py-12 md:py-24 bg-cream border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <Reveal className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 md:mb-12">
            <div>
              <Eyebrow>How to use</Eyebrow>
              <h2 className="font-serif text-3xl sm:text-4xl color-secondary-dark leading-tight">{product.steps.length} simple steps</h2>
            </div>
            <p className="flex items-start gap-2 text-sm text-stone-500 max-w-sm">
              <Icon d={ICONS.info} className="w-4 h-4 mt-0.5 shrink-0 text-primary-dark" />
              Always follow the instructions and safety information on the {product.name} label.
            </p>
          </Reveal>
          {/* Compact numbered list on phones; card grid from sm up */}
          <ol className={`grid gap-px bg-stone-200 border border-stone-200 sm:grid-cols-2 ${product.steps.length > 5 ? 'lg:grid-cols-4' : 'lg:grid-cols-5'}`}>
            {product.steps.map((s, i) => (
              <Reveal key={s.title} as="li" delay={i * 0.05} className="bg-white p-4 sm:p-6 flex items-start gap-4 sm:block hover:bg-[#f4f9e8] transition-colors">
                <span className="font-serif text-2xl sm:text-3xl text-primary-dark leading-none sm:leading-normal shrink-0 w-9 sm:w-auto">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <p className="sm:mt-3 font-semibold color-secondary-dark">{s.title}</p>
                  <p className="mt-1 sm:mt-1.5 text-sm text-stone-500 font-light leading-relaxed">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Benefits + good to know ──────────────────────────── */}
      <section className="py-12 md:py-24 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-6 lg:gap-10">
          <Reveal className="h-full">
            <div className="h-full bg-cream border border-stone-200 p-5 sm:p-7 md:p-9">
              <Eyebrow>Benefits</Eyebrow>
              <h2 className="font-serif text-2xl sm:text-3xl color-secondary-dark mb-6">Why you’ll like it</h2>
              <ul className="space-y-3.5">
                {product.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm sm:text-base text-stone-600 font-light">
                    <span className="mt-0.5 w-5 h-5 shrink-0 flex items-center justify-center bg-primary text-secondary-dark">
                      <Icon d={ICONS.check} className="w-3.5 h-3.5" />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.08} className="h-full">
            <div className="h-full bg-white border border-stone-200 p-5 sm:p-7 md:p-9">
              <Eyebrow>Good to know</Eyebrow>
              <h2 className="font-serif text-2xl sm:text-3xl color-secondary-dark mb-6">Use it the right way</h2>
              <ul className="space-y-3.5">
                {product.limitations.map((l) => (
                  <li key={l} className="flex items-start gap-3 text-sm sm:text-base text-stone-600 font-light">
                    <Icon d={ICONS.alert} className="w-5 h-5 shrink-0 text-secondary" />
                    {l}
                  </li>
                ))}
              </ul>
              <div className="mt-7 pt-6 border-t border-stone-200">
                <p className="text-xs font-bold uppercase tracking-[0.2em] color-secondary-dark mb-2">Safety</p>
                <p className="text-sm text-stone-500 font-light leading-relaxed">
                  Read the product label and safety information before use. Follow its guidance on handling, ventilation, storage, first aid and precautions around children and pets.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Positioning statement ────────────────────────────── */}
      <section className="py-12 md:py-20 bg-cream border-b border-stone-200">
        <Reveal className="max-w-4xl mx-auto px-6 lg:px-10 text-center">
          <Eyebrow center>Why {product.name}</Eyebrow>
          <p className="font-serif text-2xl sm:text-3xl md:text-4xl color-secondary-dark leading-snug">“{product.statement}”</p>
          <p className="mt-6 text-stone-600 text-sm sm:text-base font-light leading-relaxed max-w-2xl mx-auto">{product.why}</p>
        </Reveal>
      </section>

      <SurfacesSection subtitle={`Use ${product.name} on compatible fabrics only. Check the label and spot-test before you start.`} />

      {/* ── Specifications ───────────────────────────────────── */}
      <section className="py-12 md:py-24 bg-white border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 grid md:grid-cols-[1fr_1.6fr] gap-6 sm:gap-10 md:gap-14 items-start">
          <Reveal>
            <Eyebrow>Specifications</Eyebrow>
            <h2 className="font-serif text-3xl sm:text-4xl color-secondary-dark leading-tight">Product details</h2>
            <p className="mt-4 text-stone-500 text-sm font-light leading-relaxed">Key details at a glance. For full usage, compatibility and safety information, refer to the product label.</p>
          </Reveal>
          <Reveal delay={0.08}>
            <dl className="border border-stone-200 divide-y divide-stone-200">
              {specs.map((s) => (
                <div key={s.label} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-3 sm:gap-4 p-3.5 sm:p-4">
                  <dt className="text-[11px] font-bold uppercase tracking-[0.15em] text-stone-500">{s.label}</dt>
                  <dd className="text-sm color-secondary-dark">{s.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      <FaqSection faqs={product.faqs} title={`${product.name} FAQs`} />

      {/* ── Pair with the other product ──────────────────────── */}
      <section className="py-12 md:py-24 bg-stone-50 border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <Reveal>
            {/* Phones: bottle beside the text, button full-width below. md+: bottle | text | button in one row */}
            <Link to={productPath(other)} className="group grid grid-cols-[auto_1fr] md:grid-cols-[auto_1fr_auto] items-center gap-x-5 gap-y-5 md:gap-10 bg-secondary-dark p-5 sm:p-7 md:p-10 relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.08]" style={DOT_PATTERN} />
              <div className="relative h-28 sm:h-36 md:h-44 flex items-end justify-center">
                <ProductVisual product={other} className={`${other.id === 'fabseal' ? 'h-full' : 'h-[80%]'} w-auto drop-shadow-xl transition-transform duration-500 group-hover:-translate-y-2`} />
              </div>
              <div className="relative">
                <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.3em] text-primary mb-2">Complete the routine</p>
                <h2 className="font-serif text-lg sm:text-3xl text-white leading-snug">
                  {isSeal ? 'When a stain still happens, use FABFIX' : 'Protect before the next spill with FABSEAL'}
                </h2>
                <p className="hidden sm:block mt-3 text-stone-400 text-sm sm:text-base font-light leading-relaxed max-w-xl">{other.summary}</p>
              </div>
              <span className="relative col-span-2 md:col-span-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-secondary-dark font-bold text-xs uppercase tracking-widest group-hover:bg-white transition-colors">
                View {other.name} <Icon d={ICONS.arrow} className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </Reveal>

          <Reveal className="mt-10 md:mt-16">
            <h2 className="font-serif text-2xl sm:text-3xl color-secondary-dark text-center mb-6 sm:mb-8">FABSEAL vs FABFIX</h2>
            <CompareTable highlight={product.id} />
          </Reveal>
        </div>
      </section>

      <CtaStrip
        title={`Get ${product.name} for your home`}
        body={`${product.name} is available through KAIRA dealers. Send us an enquiry and we’ll help you find it near you.`}
        onEnquire={() => setShowEnquiry(true)}
      />

      {showEnquiry && (
        <EnquiryFormModal
          eyebrow="FABXPERT Enquiry"
          title={`${product.name} ${product.category}`}
          intro={<>Share your details and our team will get in touch about <span className="text-secondary-dark font-semibold">{product.name}</span> ({product.size}) and where to buy it near you.</>}
          subject={`FabXpert Enquiry: ${product.name}`}
          successText="Thank you! Our team will contact you shortly."
          onClose={() => setShowEnquiry(false)}
        />
      )}
    </>
  )
}

export default FabXpertProductPage
