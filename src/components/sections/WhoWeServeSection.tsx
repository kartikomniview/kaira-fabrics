import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const EXPO_OUT = [0.16, 1, 0.3, 1] as const

const WHATSAPP_SVG = (
  <svg className="w-3.5 h-3.5 text-[#25D366] shrink-0" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

const cards = [
  {
    title: 'Wholesale & Manufacturing',
    titleParts: [
      { text: 'Wholesale', primary: true },
      { text: ' & ', primary: false },
      { text: 'Manufacturing', primary: false },
    ],
    tag: 'B2B · Bulk Orders',
    tagColor: 'text-secondary border-secondary/40 bg-white',
    icon: (
      <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M9 17h6M2 3h20v4H2zm2 4h16v14H4z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 21V11m6 10V11" />
      </svg>
    ),
    description: 'Priority access to bulk inventory, exclusive B2B pricing, and dedicated account management for large-scale production.',
    cta: 'Get a Quote',
    link: 'https://wa.me/918589925111?text=Hi%2C%20I%27m%20interested%20in%20a%20wholesale%20quote%20for%20my%20manufacturing%20business.',
    image: 'https://kairafabrics.s3.ap-south-1.amazonaws.com/site/WhoWeServe/Wholesale+%26+Manufacturing.webp',
  },
  {
    title: 'Designers & Architects',
    titleParts: [
      { text: 'Designers', primary: false },
      { text: ' & ', primary: false },
      { text: 'Architects', primary: true },
    ],
    tag: 'For Professionals',
    tagColor: 'text-secondary border-secondary/40 bg-white',
    icon: (
      <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    description: 'Trade benefits, free swatch books, 3D material libraries, and custom luxury fabric collaboration for creative professionals.',
    cta: 'Partner With Us',
    link: 'https://wa.me/918589925111?text=Hi%2C%20I%27m%20an%20interior%20designer%20looking%20to%20partner%20with%20Kaira.',
    image: 'https://kairafabrics.s3.ap-south-1.amazonaws.com/site/WhoWeServe/Designers+%26+Architects.webp',
  },
  {
    title: 'Retail & Homeowners',
    titleParts: [
      { text: 'Retail', primary: true },
      { text: ' & ', primary: false },
      { text: 'Homeowners', primary: false },
    ],
    tag: 'Personal · Home',
    tagColor: 'text-secondary border-black/20 bg-white',
    icon: (
      <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    description: 'Free consultations with styling experts to find the perfect upholstery or drape fabric for your home.',
    cta: 'Talk to an Expert',
    link: 'https://wa.me/918589925111?text=Hi%2C%20I%20need%20help%20choosing%20fabrics%20for%20my%20home.',
    image: 'https://kairafabrics.s3.ap-south-1.amazonaws.com/site/WhoWeServe/Retail+%26+Homeowners.webp',
  },
]

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13 } },
}

const cardAnim = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EXPO_OUT } },
}

export default function WhoWeServeSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isVisible = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="relative py-16 md:py-24 border-b border-stone-200 overflow-hidden bg-[#f5ede0]">
      <div className="absolute inset-0 opacity-[0.15] bg-[url('https://kairafabrics.s3.ap-south-1.amazonaws.com/site/BackgroundImages/b4.webp')] bg-repeat pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6 lg:px-10">

        {/* Header */}
        <motion.div
          className="text-center mb-10 md:mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: EXPO_OUT }}
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="text-[12px] font-bold uppercase tracking-[0.3em] text-stone-500">Who We Serve</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-[2.75rem] color-secondary-dark leading-[1.15]">
            Ready to elevate <em className="not-italic text-primary">your next project?</em>
          </h2>
          <p className="mt-3 text-stone-500 text-sm md:text-base max-w-md mx-auto leading-relaxed">
            Whether you're scaling production, designing a luxury hotel, or styling your home we have tailored solutions for you.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          className="flex flex-row overflow-x-auto gap-4 snap-x snap-mandatory pb-3 -mx-6 px-6 md:mx-0 md:px-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-x-visible md:pb-0"
          variants={container}
          initial="hidden"
          animate={isVisible ? 'visible' : 'hidden'}
        >
          {cards.map((card) => (
            <motion.div key={card.title} variants={cardAnim} className="shrink-0 w-[72vw] sm:w-[55vw] snap-center md:w-auto md:h-full">
              <a
                href={card.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex flex-col overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 h-[300px] md:h-[460px]"
              >
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img
                    src={card.image}
                    alt={card.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 blur-[2px] scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
                </div>

                {/* Top label */}
                <div className="relative p-3 md:p-5">
                  <span className={`inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em] border shadow-sm px-3 py-1 ${card.tagColor}`}>
                    {card.icon}
                    {card.tag}
                  </span>
                </div>

                {/* Bottom content */}
                <div className="relative mt-auto p-4 md:p-6">
                  <h3 className="font-serif text-[1.3rem] md:text-[1.6rem] mb-1.5 md:mb-2 leading-snug inline-block bg-white/25 backdrop-blur-md shadow-sm rounded-md px-3 py-1">
                    {card.titleParts.map((part, i) => (
                      <span key={i} className={part.primary ? 'text-primary' : 'text-primary'}>
                        {part.text}
                      </span>
                    ))}
                  </h3>
                  <p className="text-white/70 text-[12px] md:text-[13px] leading-relaxed mb-3 md:mb-5 line-clamp-2 md:line-clamp-none">{card.description}</p>
                  <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-white/15">
                    <span className="inline-flex items-center gap-2 bg-primary text-white text-[10px] md:text-xs font-bold uppercase tracking-widest px-4 py-2 md:px-6 md:py-3 group-hover:gap-3.5 transition-all duration-300">
                      {card.cta}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                    {WHATSAPP_SVG}
                  </div>
                </div>
              </a>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}
