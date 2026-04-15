const ClientsScrollbar = () => {
  return (
    <section className="bg-stone-50 border-b border-stone-200 py-8 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 mb-6 text-center">
        <p className="text-[14px] uppercase tracking-[0.2em] text-stone-500 font-semibold">Trusted by Global Brands</p>
      </div>

      {/* Infinite Scroll Container */}
      <div className="relative w-full flex overflow-hidden group border-y border-stone-200/50 bg-white/50 py-5">
        {/* Fading Edges */}
        <div className="absolute top-0 left-0 w-16 md:w-32 h-full bg-gradient-to-r from-stone-50 to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-16 md:w-32 h-full bg-gradient-to-l from-stone-50 to-transparent z-10 pointer-events-none" />

        <div className="flex w-max animate-[scroll_30s_linear_infinite] group-hover:[animation-play-state:paused]">
          {[1, 2, 3, 4, 5, 6, 7].map((num) => (
            <div key={`logo-1-${num}`} className="w-32 sm:w-40 mx-6 sm:mx-10 flex flex-col items-center justify-center opacity-60 hover:opacity-100 transition-all duration-300 grayscale hover:grayscale-0">
              <img src={`https://placehold.co/200x80/e7e5e4/a8a29e?text=BRAND+${num}`} alt={`Brand ${num}`} className="w-full h-auto object-contain" />
            </div>
          ))}
          {[1, 2, 3, 4, 5, 6, 7].map((num) => (
            <div key={`logo-2-${num}`} className="w-32 sm:w-40 mx-6 sm:mx-10 flex flex-col items-center justify-center opacity-60 hover:opacity-100 transition-all duration-300 grayscale hover:grayscale-0">
              <img src={`https://placehold.co/200x80/e7e5e4/a8a29e?text=BRAND+${num}`} alt={`Brand ${num}`} className="w-full h-auto object-contain" />
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  )
}

export default ClientsScrollbar
