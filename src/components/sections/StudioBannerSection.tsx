import Button from '../ui/Button'

const StudioBannerSection = () => {
  return (
    <section className="bg-stone-100 py-14 lg:py-20">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <h2 className="font-serif text-3xl md:text-4xl text-stone-900 mb-4">
          Visualize Fabrics in 3D
        </h2>
        <p className="text-stone-500 text-base leading-relaxed mb-8">
          Apply our fabrics to furniture models in real time. See how different textures
          and colors transform your designs before making a decision.
        </p>
        <Button to="/3d-visualizer" variant="secondary" size="lg">
          Try Our Visualizer
        </Button>
      </div>
    </section>
  )
}

export default StudioBannerSection
