import { useEffect, useState } from 'react'
import CTASection from '../components/sections/CTASection'
import AIVisualizerDesktop from './AIVisualizerDesktop'

const AIVisualizerPage = () => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  
  
  return (
    <main className="min-h-screen bg-stone-50 flex flex-col">
      <section className="py-8 md:py-12 px-4 md:px-8 lg:px-12 xl:px-16 flex justify-center bg-stone-50">
         <div className="w-full max-w-[1600px] border border-stone-200 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] rounded-2xl overflow-hidden bg-white flex flex-col" style={{ height: '85vh', minHeight: '750px' }}>
            <AIVisualizerDesktop />
         </div>
      </section>
      <CTASection />
    </main>
  )
}

export default AIVisualizerPage
