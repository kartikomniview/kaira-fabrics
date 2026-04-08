import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

interface AboutSectionProps {
  isAboutVisible: boolean;
  aboutRef: React.RefObject<HTMLDivElement | null>;
}

const t = { type: 'tween', ease: [0.25, 0.1, 0.25, 1] } as const

const AboutSection = ({ isAboutVisible, aboutRef }: AboutSectionProps) => {
  const show = isAboutVisible

  return (
    <section
      ref={aboutRef}
      id="about"
      className="border-b border-stone-200 py-16 md:py-24 relative overflow-hidden"
      style={{
        backgroundImage: "url('https://supoassets.s3.ap-south-1.amazonaws.com/public/kaira-fabrics/homepage/Background2.webp')",
        backgroundSize: 'cover',
        backgroundPosition: 'left',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-white/90" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left: Text */}
          <div className="max-w-lg mx-auto lg:mx-0 text-center lg:text-left">

            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={show ? { opacity: 1, x: 0 } : { opacity: 0, x: -16 }}
              transition={{ ...t, duration: 0.5 }}
              className="inline-flex items-center gap-2 mb-4"
            >
              <span className="h-px w-5 bg-primary" />
              <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-stone-400">About Us</span>
            </motion.div>

            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ ...t, duration: 0.6, delay: 0.1 }}
              className="font-serif text-3xl md:text-4xl text-stone-900 leading-tight mb-4"
            >
              Kaira: Design for Life
            </motion.h3>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{ ...t, duration: 0.6, delay: 0.2 }}
              className="text-stone-500 text-sm md:text-base leading-relaxed font-light mb-3"
            >
              Kaira is an entity under the <strong className="font-semibold text-stone-700">Kurikkal Group</strong>, specializing in premium sofa fabrics and leathers — delivering remarkable quality right to your doorstep.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{ ...t, duration: 0.6, delay: 0.28 }}
              className="text-stone-400 text-sm leading-relaxed font-light italic hidden md:block mb-6"
            >
              "A perfect blend of form and function with an uncompromising emphasis on quality and style."
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{ ...t, duration: 0.6, delay: 0.35 }}
              className="pt-5 border-t border-stone-100 flex flex-col sm:flex-row items-center lg:items-center gap-5 justify-center lg:justify-start"
            >
              <Link
                to="/about"
                className="group relative inline-flex items-center justify-center px-7 py-3 bg-stone-900 text-white rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="text-[13px] font-bold uppercase tracking-widest relative z-10 group-hover:text-stone-900 transition-colors duration-300">Know more</span>
              </Link>

              <div className="flex items-center gap-5">
                <div className="text-center lg:text-left">
                  <p className="text-xl font-serif text-stone-900">20+</p>
                  <p className="text-[9px] uppercase tracking-widest text-stone-400 font-bold">Years Heritage</p>
                </div>
                <div className="w-px h-7 bg-stone-200" />
                <div className="text-center lg:text-left">
                  <p className="text-xl font-serif text-stone-900">10k+</p>
                  <p className="text-[9px] uppercase tracking-widest text-stone-400 font-bold">Fabrics</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={show ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
            transition={{ ...t, duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative aspect-[4/5] max-w-xs mx-auto bg-stone-100 overflow-hidden rounded-sm shadow-lg">
              <img
                src="https://supoassets.s3.ap-south-1.amazonaws.com/public/kaira-fabrics/homepage/aboutus.webp"
                alt="Kaira Fabrics Heritage"
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-stone-900/10 pointer-events-none" />

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                transition={{ ...t, duration: 0.5, delay: 0.5 }}
                className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-sm shadow-md"
              >
                <p className="text-[10px] text-stone-600 leading-relaxed font-light mb-2">
                  "Excellence woven into every thread. Bringing world-class textiles to exceptional interiors."
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-px bg-primary" />
                  <p className="text-[8px] uppercase tracking-[0.2em] font-bold text-stone-900">The Kurikkal Group</p>
                </div>
              </motion.div>
            </div>

            <div className="absolute -bottom-3 -left-3 w-20 h-20 border border-stone-200 rounded-sm -z-10" />
          </motion.div>

        </div>
      </div>
    </section>
  )
}

export default AboutSection
