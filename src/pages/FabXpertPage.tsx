import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Seo, { pageTitle } from '../components/seo/Seo'

const EXPO_OUT = [0.16, 1, 0.3, 1] as const

const FabXpertPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      <Seo
        title={pageTitle('FabXpert')}
        description="FabXpert by KAIRA Fabrics — coming soon."
        noindex
      />

      <div className="min-h-[80vh] flex items-center justify-center pt-28 pb-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <motion.span
            className="inline-block text-[11px] uppercase tracking-[0.35em] text-gold font-bold font-serif mb-4"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EXPO_OUT }}
          >
            FabXpert
          </motion.span>

          <div className="overflow-hidden">
            <motion.h1
              className="font-serif text-4xl sm:text-5xl md:text-[3.2rem] text-charcoal leading-tight"
              initial={{ y: '115%', skewY: 2 }}
              animate={{ y: '0%', skewY: 0 }}
              transition={{ duration: 1.0, delay: 0.18, ease: EXPO_OUT }}
            >
              Coming <span className="text-gold">Soon</span>
            </motion.h1>
          </div>

          <motion.p
            className="mt-5 text-stone-500 text-sm leading-relaxed max-w-lg mx-auto font-sans"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: EXPO_OUT }}
          >
            We're working on something new. Check back soon.
          </motion.p>

          <motion.div
            className="mt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5, ease: EXPO_OUT }}
          >
            <Link
              to="/"
              className="inline-block px-6 py-3 border border-gold text-gold hover:bg-gold hover:text-white transition-colors text-[11px] uppercase tracking-[0.25em] font-medium"
            >
              Back to Home
            </Link>
          </motion.div>
        </div>
      </div>
    </>
  )
}

export default FabXpertPage
