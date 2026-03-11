import Button from '../ui/Button'

const CTASection = () => {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-charcoal to-[#2A1A10]" />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            #C5A552 0px,
            #C5A552 1px,
            transparent 1px,
            transparent 60px
          )`,
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-10 text-center">
        <p className="text-gold text-xs tracking-[0.4em] uppercase font-medium mb-4">
          Begin Your Journey
        </p>
        <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-cream leading-tight mb-6">
          Discover the Fabric<br />
          <span className="italic text-gold">That Defines You</span>
        </h2>
        <p className="text-stone-300 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
          Whether you're redesigning a single room or furnishing an entire estate,
          KAIRA's experts are ready to guide you to the perfect textile choice.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button to="/materials" variant="primary" size="lg">
            Explore Fabrics
          </Button>
          <Button to="/contact" variant="outline" size="lg">
            Contact Us
          </Button>
        </div>
      </div>
    </section>
  )
}

export default CTASection
