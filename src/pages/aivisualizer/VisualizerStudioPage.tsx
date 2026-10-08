import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ThreeDVisualizerEngine, { type SelectedMaterial } from '../threedvisualizer/ThreeDVisualizerEngine'
import ThreeDVisualizerPageMobile from '../ThreeDVisualizerPageMobile'
import type { AppliedFabric } from '../threedvisualizer/FabricHotspot'
import { partLabel } from '../threedvisualizer/PartDropdown'
import { kairaProducts, type KairaProduct } from '../../data/products'
import { categoryMeta, normalizeType } from '../../components/sections/FabricCategoriesSection'
import EnquiryFormModal from '../../components/ui/EnquiryFormModal'
import Seo, { pageTitle } from '../../components/seo/Seo'

const typeLabel = (m: SelectedMaterial) => categoryMeta[normalizeType(m.materialType)]?.label ?? m.materialType

const checkIsMobile = () => {
  const isTouch = navigator.maxTouchPoints > 0
  const isPortrait = window.innerHeight > window.innerWidth
  return window.innerWidth < 1024 || (isTouch && isPortrait)
}

/** Full-screen 3D Fabric Studio (with built-in AI render), rendered outside Layout.
 *  Accepts ?collection=<name>&code=<material_code> to open on a specific shade (see threedvisualizer/initialMaterial.ts). */
export default function VisualizerStudioPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const [isMobile, setIsMobile] = useState(checkIsMobile)
  useEffect(() => {
    const handler = () => setIsMobile(checkIsMobile())
    window.addEventListener('resize', handler)
    window.addEventListener('orientationchange', handler)
    return () => {
      window.removeEventListener('resize', handler)
      window.removeEventListener('orientationchange', handler)
    }
  }, [])

  const [currentProduct, setCurrentProduct] = useState<KairaProduct>(
    kairaProducts.find((p) => p.product_name === 'Luna') ?? kairaProducts[0]
  )
  const [selected, setSelected] = useState<SelectedMaterial | null>(null)
  const [isApplying, setIsApplying] = useState(false)
  const [modelLoaded, setModelLoaded] = useState(false)

  // Fabrics on the model right now (whole sofa + any per-part ones), reported by whichever engine is showing
  const [studioFabrics, setStudioFabrics] = useState<{ fabrics: AppliedFabric[]; productName: string }>({ fabrics: [], productName: '' })
  const handleAppliedFabricsChange = useCallback(
    (fabrics: AppliedFabric[], productName: string) => setStudioFabrics({ fabrics, productName }),
    []
  )
  const [showSampleForm, setShowSampleForm] = useState(false)
  const { fabrics, productName } = studioFabrics

  // Back to wherever the visitor came from inside the site; a fresh visit (shared link, refresh) goes to the banner.
  const handleGoBack = () => {
    if (location.key !== 'default') navigate(-1)
    else navigate('/ai-visualizer')
  }

  return (
    <div className="flex flex-col w-full bg-white overflow-hidden" style={{ height: '100dvh' }}>
      <Seo
        title={pageTitle('3D Fabric Studio')}
        description="Visualize KAIRA fabrics and leathers on real furniture in interactive 3D, then turn your pick into a photorealistic AI room render."
        noindex
      />

      {/* ── Studio header ── */}
      <div className="h-12 shrink-0 bg-secondary-dark border-b border-stone-800 flex items-center px-3 sm:px-5 gap-2 sm:gap-4">
        <button
          onClick={handleGoBack}
          className="group flex items-center gap-2 h-8 px-3.5 bg-white border border-white/20 hover:bg-white/80 hover:border-white/100 color-secondary-dark transition-all"
        >
          <svg className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-[11px] font-bold tracking-[0.15em] uppercase">Go Back</span>
        </button>

        <div className="flex-1" />

        <div className="flex items-center gap-2 shrink-0">
          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${modelLoaded || isMobile ? 'bg-emerald-500' : 'bg-primary animate-pulse'}`} />
          <span className="hidden sm:inline text-[11px] text-white font-bold tracking-[0.2em] uppercase">3D Fabric Studio</span>
        </div>

        {/* Enquire Now — opens the contact form for every fabric on the sofa */}
        <button
          onClick={() => setShowSampleForm(true)}
          disabled={fabrics.length === 0}
          className="shrink-0 flex items-center gap-2 h-8 px-3 sm:px-3.5 bg-primary text-secondary-dark hover:bg-primary-dark shadow-sm transition-all active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none"
        >
          {/* Chat-bubble icon, as on the other "Enquire Now" buttons */}
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-[11px] font-bold tracking-[0.15em] uppercase whitespace-nowrap">Enquire Now</span>
        </button>
      </div>

      {showSampleForm && fabrics.length > 0 && (
        <EnquiryFormModal
          eyebrow={fabrics.length > 1 ? 'Request Samples' : 'Request Sample'}
          title={fabrics.length > 1 ? `${fabrics.length} fabrics on your ${productName}` : fabrics[0].material.fabricName}
          intro={
            <>
              Fill in your details and we'll arrange {fabrics.length > 1 ? 'physical samples of ' : 'a physical sample of '}
              {fabrics.map((f, i) => (
                <span key={f.material.id}>
                  {i > 0 && (i === fabrics.length - 1 ? ' and ' : ', ')}
                  <span className="text-secondary-dark font-semibold">{f.material.fabricName}</span> ({typeLabel(f.material)}
                  {f.parts.length > 0 && <>, {f.parts.map(partLabel).join(' & ')}</>})
                </span>
              ))}
              {productName && <> as seen on your {productName}</>}.
            </>
          }
          subject={`Sample Request: ${fabrics
            .map((f) => `${f.material.collectionName} / ${f.material.materialCode} (${typeLabel(f.material)})`)
            .join('; ')} · 3D Studio${productName ? ` (${productName})` : ''}`}
          successText={`Thank you! Our team will contact you shortly to arrange your sample${fabrics.length > 1 ? 's' : ''}.`}
          onClose={() => setShowSampleForm(false)}
        />
      )}

      {/* ── Engine ── */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {isMobile ? (
          <ThreeDVisualizerPageMobile embedded onAppliedFabricsChange={handleAppliedFabricsChange} />
        ) : (
          <div className="flex flex-col bg-stone-50 font-sans h-full">
            <ThreeDVisualizerEngine
              currentProduct={currentProduct}
              setCurrentProduct={setCurrentProduct}
              selected={selected}
              setSelected={setSelected}
              isApplying={isApplying}
              setIsApplying={setIsApplying}
              modelLoaded={modelLoaded}
              setModelLoaded={setModelLoaded}
              onAppliedFabricsChange={handleAppliedFabricsChange}
            />
          </div>
        )}
      </div>
    </div>
  )
}
