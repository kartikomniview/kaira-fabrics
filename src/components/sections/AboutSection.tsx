import { Link } from 'react-router-dom'

interface AboutSectionProps {
  isAboutVisible: boolean;
  aboutRef: React.RefObject<HTMLDivElement | null>;
}

const AboutSection = ({ isAboutVisible, aboutRef }: AboutSectionProps) => {
  return (
    <section 
      ref={aboutRef} 
      id="about" 
      className={`bg-white border-b border-stone-200 py-20 md:py-32 relative overflow-hidden transition-all duration-1000 ${
        isAboutVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {/* Decorative vertical lines */}
      <div className="absolute top-0 bottom-0 left-[10%] w-px bg-stone-100 hidden md:block" />
      <div className="absolute top-0 bottom-0 right-[10%] w-px bg-stone-100 hidden md:block" />

      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-24 items-center">
          
          {/* Left Column: Text Content */}
          <div className="max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
            <div className="inline-flex items-center gap-3 mb-4 md:mb-6">
              <span className="h-px w-6 bg-primary" />
              <h2 className={`text-[10px] font-bold uppercase tracking-[0.3em] text-stone-500 transition-all duration-700 ${isAboutVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                About Us
              </h2>
            </div>

            <h3 className={`font-serif text-2xl sm:text-4xl md:text-5xl text-stone-900 leading-[1.2] mb-6 md:mb-8 transition-all duration-700 delay-100 ${isAboutVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              Kaira: The House of Sofa Fabrics
            </h3>

            <div className={`space-y-4 md:space-y-6 text-stone-500 text-xs sm:text-base leading-relaxed font-light transition-all duration-700 delay-200 ${isAboutVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <p>
                Kaira is an entity under the <strong>Kurikkal group</strong>, specializing in a wide range of premium sofa fabrics and leathers. We ensure remarkable quality and availability right to your doorstep.
              </p>
              <p>
                With a strong physical presence, Kaira focuses on delivering the best fabric and leather solutions that perfectly balance affordability, design, and comfort.
              </p>
              <p className="text-stone-400 italic text-sm">
                "Born from an understanding of the evolving furniture industry, we represent a perfect blend of form and function with an uncompromising emphasis on quality and style."
              </p>
            </div>

            <div className={`mt-6 md:mt-10 pt-6 md:pt-8 border-t border-stone-100 transition-all duration-700 delay-300 ${isAboutVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="flex flex-col sm:flex-row items-center lg:items-center gap-6 justify-center lg:justify-start">
                <Link
                  to="/about"
                  className="group relative inline-flex items-center justify-center gap-3 px-8 py-3.5 bg-stone-900 text-white hover:bg-primary hover:text-stone-900 transition-all duration-500 rounded-sm overflow-hidden shadow-md"
                >
                  <span className="text-[10px] font-bold uppercase tracking-widest relative z-10">Know more</span>
                  <div className="absolute inset-0 bg-primary translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-in-out" />
                </Link>
                
                <div className="hidden sm:flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-xl font-serif text-stone-900">20+</span>
                    <span className="text-[9px] uppercase tracking-widest text-stone-400 font-bold">Years Heritage</span>
                  </div>
                  <div className="w-px h-8 bg-stone-200" />
                  <div className="flex flex-col">
                    <span className="text-xl font-serif text-stone-900">10k+</span>
                    <span className="text-[9px] uppercase tracking-widest text-stone-400 font-bold">Fabrics</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual/Imagery */}
          <div className={`relative hidden lg:block transition-all duration-1000 delay-200 ${isAboutVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div className="relative aspect-[4/5] sm:aspect-square lg:aspect-[4/5] bg-stone-100 overflow-hidden rounded-sm">
              <img 
                src="https://supoassets.s3.ap-south-1.amazonaws.com/public/kaira-fabrics/homepage/aboutus.webp" 
                alt="Kaira Fabrics Heritage" 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-stone-900/10 pointer-events-none" />
              
              {/* Overlay Badge */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-sm p-6 rounded-sm border border-white/20 shadow-xl">
                <p className="text-xs text-stone-600 leading-relaxed font-light mb-3">
                  "Excellence woven into every thread. Bringing world-class textiles to exceptional interiors."
                </p>
                <div className="flex items-center gap-3 w-full">
                  <div className="w-8 h-px bg-primary" />
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-900">The Kurikkal Group</p>
                </div>
              </div>
            </div>
            
            {/* Decorative element */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-[url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')] opacity-10 pointer-events-none" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 border border-stone-200 pointer-events-none rounded-sm -z-10" />
          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutSection;
