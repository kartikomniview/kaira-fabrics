import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Seo, { pageTitle } from '../../components/seo/Seo'
import EnquiryFormModal from '../../components/ui/EnquiryFormModal'
import { DOT_PATTERN, EXPO_OUT, ICONS, PRODUCTS, SAFETY_NOTE, SURFACES, getProduct, productPath } from './products'
import { CompareTable, CtaStrip, Eyebrow, FaqSection, Icon, ImageSlot, ProductVisual, Reveal, Tabs } from './shared'

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
                  <a href="#details" className="inline-flex items-center justify-center px-4 py-3.5 sm:px-8 sm:py-4 border border-white/30 text-white hover:border-primary hover:text-primary transition-colors font-bold text-xs uppercase tracking-widest">
                    How it works
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

      {/* ── Overview: what it is, positioning quote, the problem ── */}
      <section className="py-12 md:py-20 bg-cream border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
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
              <h2 className="font-serif text-2xl sm:text-4xl color-secondary-dark leading-tight">{isSeal ? 'Preventive care for your fabric' : 'Corrective care for everyday stains'}</h2>
              <p className="mt-4 text-stone-600 text-sm sm:text-base font-light leading-relaxed">{product.about}</p>
              <blockquote className="mt-6 pl-4 border-l-2 border-primary font-serif text-lg sm:text-xl color-secondary-dark leading-snug">“{product.statement}”</blockquote>
            </Reveal>
            <Reveal delay={0.08} className="mt-7">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-stone-500 mb-3">{product.problemsTitle}</h3>
              <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                {product.problems.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-sm text-stone-600 font-light">
                    <span className="mt-[7px] w-1.5 h-1.5 shrink-0 bg-primary" />
                    {p}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Works on + where to use ──────────────────────────── */}
      <section className="py-12 md:py-20 bg-white border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 text-center">
          <Reveal className="mb-6 sm:mb-8">
            <Eyebrow center>{product.targetsLabel}</Eyebrow>
            <h2 className="font-serif text-2xl sm:text-4xl color-secondary-dark leading-tight">
              {isSeal ? 'Made for everyday spills' : 'Made for everyday stains'}
            </h2>
          </Reveal>
          <div className={`grid gap-3 sm:gap-4 max-w-4xl mx-auto ${product.targets.length === 4 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-3'}`}>
            {product.targets.map((t, i) => (
              <Reveal key={t.label} delay={i * 0.08}>
                <div className="group h-full bg-cream border border-stone-200 p-4 sm:p-6 flex flex-col items-center text-center gap-2 sm:gap-3 hover:border-primary hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                  <span className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center bg-primary/15 text-secondary-dark group-hover:bg-primary transition-colors">
                    <Icon d={t.icon} className="w-5 h-5 sm:w-7 sm:h-7" />
                  </span>
                  <span className="text-xs sm:text-base font-medium color-secondary-dark">{t.label}</span>
                </div>
              </Reveal>
            ))}
          </div>
          {!isSeal && (
            <Reveal className="mt-4 text-xs text-stone-400">For any other stain, check the label or ask our team first.</Reveal>
          )}

          <Reveal className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-stone-200">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-stone-500 mb-3">Where to use</p>
            <div className="flex flex-wrap justify-center gap-2">
              {SURFACES.map((s) => (
                <span key={s.label} className="inline-flex items-center gap-2 px-3 py-2 bg-cream border border-stone-200 text-xs sm:text-sm color-secondary-dark">
                  <Icon d={s.icon} className="w-4 h-4 text-primary-dark" /> {s.label}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs text-stone-400">Compatible fabrics only. Check the label and spot-test before you start.</p>
          </Reveal>
        </div>
      </section>

      {/* ── Details in tabs: how it works · how to use · benefits · good to know ── */}
      <section id="details" className="scroll-mt-20 py-12 md:py-20 bg-cream border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <Reveal className="mb-6 sm:mb-8 text-center">
            <Eyebrow center>The details</Eyebrow>
            <h2 className="font-serif text-2xl sm:text-4xl color-secondary-dark leading-tight">Know your {product.name}</h2>
          </Reveal>
          <Reveal>
            <Tabs
              label={`${product.name} details`}
              tabs={[
                {
                  id: 'how-it-works',
                  label: 'How it works',
                  content: (
                    <div className="grid md:grid-cols-[1fr_1.5fr] gap-6 md:gap-10 items-start">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-stone-500">Technology</p>
                        <p className="mt-1 font-serif text-xl sm:text-2xl color-secondary-dark">{product.technology}</p>
                        <p className="mt-2 text-sm text-stone-600 font-light leading-relaxed">{product.howItWorks.intro}</p>
                      </div>
                      <ol className="space-y-3">
                        {product.howItWorks.points.map((pt, i) => (
                          <li key={pt} className="flex items-start gap-4">
                            <span className="w-8 h-8 shrink-0 flex items-center justify-center bg-secondary-dark text-primary font-serif text-sm">{i + 1}</span>
                            <p className="pt-1 text-sm sm:text-base color-secondary-dark font-light leading-relaxed">{pt}</p>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ),
                },
                {
                  id: 'how-to-use',
                  label: 'How to use',
                  content: (
                    <>
                      {/* Compact numbered list on phones; card grid from sm up */}
                      <ol className={`grid gap-px bg-stone-200 border border-stone-200 sm:grid-cols-2 ${product.steps.length > 5 ? 'lg:grid-cols-4' : 'lg:grid-cols-5'}`}>
                        {product.steps.map((s, i) => (
                          <li key={s.title} className="bg-white p-4 sm:p-5 flex items-start gap-4 sm:block">
                            <span className="font-serif text-2xl text-primary-dark leading-none shrink-0 w-9 sm:w-auto">{String(i + 1).padStart(2, '0')}</span>
                            <div>
                              <p className="sm:mt-3 font-semibold text-sm color-secondary-dark">{s.title}</p>
                              <p className="mt-1 text-sm text-stone-500 font-light leading-snug">{s.body}</p>
                            </div>
                          </li>
                        ))}
                      </ol>
                      <p className="mt-4 flex items-start gap-2 text-xs sm:text-sm text-stone-500">
                        <Icon d={ICONS.info} className="w-4 h-4 mt-0.5 shrink-0 text-primary-dark" />
                        Always follow the instructions and safety information on the {product.name} label.
                      </p>
                    </>
                  ),
                },
                {
                  id: 'benefits',
                  label: 'Benefits',
                  content: (
                    <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {product.benefits.map((b) => (
                        <li key={b} className="flex items-center gap-3 bg-white border border-stone-200 p-4 text-sm color-secondary-dark">
                          <span className="w-6 h-6 shrink-0 flex items-center justify-center bg-primary text-secondary-dark">
                            <Icon d={ICONS.check} className="w-3.5 h-3.5" />
                          </span>
                          {b}
                        </li>
                      ))}
                    </ul>
                  ),
                },
                {
                  id: 'good-to-know',
                  label: 'Good to know',
                  content: (
                    <>
                      <ul className="grid sm:grid-cols-2 gap-3">
                        {product.limitations.map((l) => (
                          <li key={l} className="flex items-start gap-3 bg-white border border-stone-200 p-4 text-sm color-secondary-dark">
                            <Icon d={ICONS.alert} className="w-5 h-5 shrink-0 text-secondary" />
                            {l}
                          </li>
                        ))}
                      </ul>
                      <p className="mt-4 flex items-baseline gap-3 text-sm">
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em] color-secondary-dark">Safety</span>
                        <span className="text-stone-600 font-light">{SAFETY_NOTE}</span>
                      </p>
                    </>
                  ),
                },
              ]}
            />
          </Reveal>
        </div>
      </section>

      {/* ── Before & after ───────────────────────────────────── */}
      <section className="py-12 md:py-20 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <Reveal className="text-center max-w-2xl mx-auto mb-6 sm:mb-10">
            <Eyebrow center>See it in action</Eyebrow>
            <h2 className="font-serif text-2xl sm:text-4xl color-secondary-dark leading-tight">
              {isSeal ? 'Untreated vs treated' : 'Before & after'}
            </h2>
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

      {/* ── At a glance: pair with the other product + comparison (replaces the specs table) ── */}
      <section className="py-12 md:py-20 bg-stone-50 border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <Reveal className="mb-6 sm:mb-8 text-center">
            <Eyebrow center>At a glance</Eyebrow>
            <h2 className="font-serif text-2xl sm:text-4xl color-secondary-dark">FABSEAL vs FABFIX</h2>
          </Reveal>
          <Reveal>
            <CompareTable highlight={product.id} />
          </Reveal>

          <Reveal className="mt-8 md:mt-12">
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
        </div>
      </section>

      <FaqSection faqs={product.faqs} title={`${product.name} FAQs`} />

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
