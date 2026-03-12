import { Link } from 'react-router-dom'

const CTASection = () => {
  return (
    <section className="bg-stone-800 py-16 lg:py-24">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">
          Ready to Transform Your Space?
        </h2>
        <p className="text-stone-400 text-base mb-10">
          Explore our complete collection of luxury fabrics and leather
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/materials"
            className="inline-flex items-center justify-center px-8 py-3.5 text-sm tracking-widest uppercase border border-white text-white hover:bg-white hover:text-stone-900 transition-all duration-300"
          >
            Explore Fabrics
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center px-8 py-3.5 text-sm tracking-widest uppercase bg-stone-950 text-white hover:bg-stone-900 transition-all duration-300"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  )
}

export default CTASection
