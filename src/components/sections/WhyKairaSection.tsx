import { useEffect, useRef, useState } from 'react';

const features = [
  {
    id: "01",
    title: "Strategic Partnerships",
    desc: "The partner of choice for visionary designers, architects, and luxury manufacturers seeking uncompromised elegance.",
    icon: <svg className="w-8 h-8 md:w-10 md:h-10 text-stone-300 group-hover:text-primary transition-all duration-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
  },
  {
    id: "02",
    title: "Superior Quality",
    desc: "Rigorous testing protocols guarantee exceptional structural integrity and a luxurious tactile feel for every thread.",
    icon: <svg className="w-8 h-8 md:w-10 md:h-10 text-stone-300 group-hover:text-primary transition-all duration-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
  },
  {
    id: "03",
    title: "Innovation First",
    desc: "Sophisticated AI tools and immersive 3D visualization allow you to experience fabrics before they are cut.",
    icon: <svg className="w-8 h-8 md:w-10 md:h-10 text-stone-300 group-hover:text-primary transition-all duration-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
  },
  {
    id: "04",
    title: "Sustainable Luxe",
    desc: "Consciously selected materials that prioritize environmental responsibility without compromising on opulence.",
    icon: <svg className="w-8 h-8 md:w-10 md:h-10 text-stone-300 group-hover:text-primary transition-all duration-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547" /></svg>
  }
];

const WhyKairaSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={sectionRef}
      id="why-kaira" 
      className="py-16 md:py-24 border-b border-stone-200 relative overflow-hidden" 
      style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f4 40%, #e7e5e4 100%)' }}
    >
      {/* Decorative gradient orbs */}
      <div className={`absolute top-0 left-0 w-72 h-72 rounded-full bg-stone-100/80 blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-all duration-[2000ms] ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full'}`} />
      <div className={`absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white/90 blur-3xl pointer-events-none translate-x-1/3 translate-y-1/3 transition-all duration-[2000ms] ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`} />
      <div className="absolute top-1/2 left-1/2 w-80 h-80 rounded-full bg-stone-200/40 blur-2xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />


      {/* Right architectural skew accent */}
      <div className={`absolute top-0 right-0 w-1/2 h-full bg-white/30 skew-x-12 translate-x-32 hidden lg:block border-l border-stone-300/40 pointer-events-none transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-x-32' : 'opacity-0 translate-x-full'}`} />

      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 relative z-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        
        {/* Centered Header - More Compact */}
        <div className={`text-center max-w-2xl mx-auto mb-10 md:mb-16 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4 justify-center">
            <span className="w-1 h-1 bg-primary rounded-full" />
            <span className="text-[14px] sm:text-[12px] uppercase tracking-[0.2em] text-stone-400 font-bold">The Kaira Advantage</span>
            <span className="w-1 h-1 bg-primary rounded-full" />
          </div>
          <h2 className="font-serif text-3xl sm:text-3xl md:text-4xl text-stone-900 font-medium leading-tight mb-2 sm:mb-4">
            Why <span className="italic text-stone-400">Kaira</span>
          </h2>
          <p className="text-base sm:text-base md:text-base text-stone-500 leading-relaxed font-sans px-4 sm:px-0">
            We merge uncompromising quality with unparalleled variety, serving as the trusted fabric partner for bespoke luxury environments.
          </p>
        </div>

        {/* Features Slider/Grid - Horizontally scrollable on mobile */}
        <div className="flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 lg:gap-6 pb-6 md:pb-0 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-4 md:px-0 scroll-pl-4">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className={`w-[58vw] h-auto min-h-[180px] md:min-h-[220px] max-w-[240px] md:w-auto md:h-auto md:max-w-none md:max-h-none flex-shrink-0 snap-center group relative p-4 md:p-8 bg-white border border-stone-100 hover:border-primary/30 rounded-sm overflow-hidden flex flex-col items-start justify-center md:block text-left shadow-sm hover:shadow-md transition-all duration-700`}
              style={{ 
                transitionDelay: `${400 + (idx * 150)}ms`,
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)'
              }}
            >
              {/* Minimalist Background Number */}
              <div className="absolute top-3 right-4 md:top-4 md:right-6 text-[11px] md:text-sm font-serif text-stone-100 group-hover:text-primary/10 transition-colors duration-500 font-bold">
                {feature.id}
              </div>
              
              {/* Icon Container */}
              <div className="w-8 h-8 md:w-12 md:h-12 flex items-center justify-center mb-4 md:mb-6">
                {feature.icon}
              </div>
              
              {/* Content */}
              <h3 className="font-serif text-base md:text-lg text-stone-900 mb-1 md:mb-2 group-hover:text-primary transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-[12px] md:text-[13px] lg:text-sm text-stone-500 font-sans font-normal leading-snug md:leading-relaxed line-clamp-4 md:line-clamp-3 group-hover:text-stone-600">
                {feature.desc}
              </p>

              {/* Subtle Hover Reveal Line */}
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-500 group-hover:w-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyKairaSection;