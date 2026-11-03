import { useRef, useState } from 'react'
import AnimatedModal from '../../components/ui/AnimatedModal'
import MaterialSelector from '../threedvisualizer/MaterialSelector'
import type { SelectedMaterial, SelectedProduct } from './generateRender'

interface UploadOwnModalProps {
  /** May return a promise; the Generate button shows progress until it settles */
  onGenerate: (request: { material: SelectedMaterial; product: SelectedProduct }) => void | Promise<void>
  onClose: () => void
  /** False while another modal (e.g. the lead form) is stacked on top, so Esc only closes that one */
  dismissible?: boolean
  /** Fabric to pre-select in step 2 (e.g. the one currently on the 3D model) */
  initialMaterial?: SelectedMaterial | null
}

const STEP_TITLES = ['Upload Your Sofa', 'Choose Fabric', 'Review & Generate']

/** 3D Studio "Try With Your Sofa": upload a sofa photo → pick a Kaira fabric → generate a render. */
const UploadOwnModal = ({ onGenerate, onClose, dismissible = true, initialMaterial = null }: UploadOwnModalProps) => {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [product, setProduct] = useState<SelectedProduct | null>(null)
  const [material, setMaterial] = useState<SelectedMaterial | null>(initialMaterial)
  const [pending, setPending] = useState(false)
  const sofaUploadRef = useRef<HTMLInputElement>(null)

  const handleSofaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file?.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setProduct({
        id: `custom-prod-${Date.now()}`,
        productName: file.name.replace(/\.[^/.]+$/, ''),
        imageUrl: ev.target?.result as string,
        isCustom: true,
      })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleGenerate = async () => {
    if (!material || !product) return
    setPending(true)
    try {
      await onGenerate({ material, product })
    } finally {
      setPending(false)
    }
  }

  return (
    <AnimatedModal
      onClose={onClose}
      dismissible={dismissible && !pending}
      panelClassName={`w-full max-h-[calc(100dvh-32px)] bg-white shadow-2xl border border-stone-200 flex flex-col overflow-hidden transition-[max-width] duration-300 ${step === 2 ? 'max-w-2xl h-[85dvh]' : 'max-w-md'}`}
    >
      {(requestClose) => (
        <>
          {/* Header */}
          <div className="shrink-0 bg-stone-50 border-b border-stone-200 px-4 py-3 flex items-center gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep((s) => (s - 1) as 1 | 2)}
                disabled={pending}
                aria-label="Back"
                className="w-8 h-8 flex items-center justify-center border border-stone-200 color-secondary-dark hover:bg-white transition-colors disabled:opacity-40"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              </button>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-xs sm:text-sm font-bold tracking-widest uppercase text-secondary truncate">Try With Your Sofa</h3>
              <p className="text-[10px] color-secondary-dark uppercase tracking-widest mt-0.5">Step {step} of 3 · {STEP_TITLES[step - 1]}</p>
            </div>
            <div className="hidden sm:flex gap-1.5">
              {[1, 2, 3].map((n) => (
                <div key={n} className={`h-1.5 w-5 transition-colors ${step >= n ? 'bg-primary' : 'bg-stone-200'}`} />
              ))}
            </div>
            <button
              onClick={requestClose}
              disabled={pending}
              aria-label="Close"
              className="w-8 h-8 flex items-center justify-center bg-white border border-secondary text-secondary hover:bg-secondary hover:text-white transition-colors disabled:opacity-40"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Step 2: Choose fabric — the selector manages its own scrolling, so it gets the full body */}
          {step === 2 ? (
            <div key={step} className="kaira-content-in flex-1 min-h-0 flex flex-col">
              <MaterialSelector
                selectedId={typeof material?.id === 'number' ? material.id : null}
                onSelect={(m) => setMaterial({ ...m, isCustom: false })}
                showPartFilter={false}
                className="flex-1 min-h-0 flex flex-col overflow-hidden bg-white"
              />
              <div className="shrink-0 border-t border-stone-200 bg-white px-4 py-3 flex items-center gap-3">
                {material ? (
                  <>
                    <img src={material.textureUrl} alt="" className="w-10 h-10 object-cover border border-stone-200 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] color-secondary-dark/60 uppercase tracking-widest">{material.collectionName}</p>
                      <p className="text-xs font-bold color-secondary-dark truncate">{material.fabricName}</p>
                    </div>
                  </>
                ) : (
                  <p className="flex-1 text-[10px] color-secondary-dark/60 uppercase tracking-widest">Pick a fabric to continue</p>
                )}
                <button
                  onClick={() => setStep(3)}
                  disabled={!material}
                  className="h-10 px-5 bg-primary color-secondary-dark font-bold uppercase tracking-widest text-[10px] sm:text-[11px] shadow-md hover:bg-primary/90 transition-all hover:-translate-y-0.5 flex items-center gap-2 shrink-0 disabled:opacity-40 disabled:pointer-events-none"
                >
                  <span>Continue</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          ) : (
            <div key={step} className="kaira-content-in flex-1 min-h-0 overflow-y-auto p-5 sm:p-6">

              {/* Step 1: Upload sofa */}
              {step === 1 && (
                <div className="flex flex-col items-center gap-4">
                  {product ? (
                    <>
                      <div className="w-full aspect-[4/3] overflow-hidden border border-stone-200 shadow-md bg-stone-100">
                        <img src={product.imageUrl} alt={product.productName} className="w-full h-full object-contain" />
                      </div>
                      <div className="flex gap-3 w-full">
                        <button
                          onClick={() => sofaUploadRef.current?.click()}
                          className="flex-1 h-11 border-2 border-stone-200 color-secondary-dark font-bold uppercase tracking-widest text-[10px] sm:text-[11px] hover:border-stone-400 transition-colors"
                        >
                          Change
                        </button>
                        <button
                          onClick={() => setStep(2)}
                          className="flex-1 h-11 bg-primary color-secondary-dark font-bold uppercase tracking-widest text-[10px] sm:text-[11px] shadow-md hover:bg-primary/90 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
                        >
                          <span>Use This Sofa</span>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={() => sofaUploadRef.current?.click()}
                      className="w-full flex flex-col items-center justify-center gap-3 border-2 border-dashed border-stone-300 py-12 hover:border-primary hover:bg-primary/5 transition-all color-secondary-dark group"
                    >
                      <div className="w-12 h-12 bg-stone-100 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                      </div>
                      <div className="text-center">
                        <span className="block text-xs font-bold uppercase tracking-widest">Upload Sofa Image</span>
                        <span className="block text-[10px] color-secondary-dark/60 mt-1 normal-case tracking-normal">A clear, well-lit photo of the whole sofa works best</span>
                      </div>
                    </button>
                  )}
                  <input ref={sofaUploadRef} type="file" accept="image/*" onChange={handleSofaUpload} className="sr-only" />
                </div>
              )}

              {/* Step 3: Review & generate */}
              {step === 3 && material && product && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-3 bg-stone-50 p-4 border border-stone-200">
                    <h4 className="text-[10px] font-bold color-secondary-dark uppercase tracking-[0.2em]">Your Sofa</h4>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white flex items-center justify-center border border-stone-200 shadow-md p-1.5">
                        <img src={product.imageUrl} className="max-w-full max-h-full object-contain" alt="" />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-[10px] color-secondary-dark uppercase tracking-widest mb-1">Custom Upload</p>
                        <p className="text-sm font-black color-secondary-dark leading-tight truncate">{product.productName}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 bg-stone-50 p-4 border border-stone-200">
                    <h4 className="text-[10px] font-bold color-secondary-dark uppercase tracking-[0.2em]">Selected Fabric</h4>
                    <div className="flex items-center gap-4">
                      <img src={material.textureUrl} className="w-16 h-16 object-cover shadow-md border border-stone-200" alt="" />
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-[10px] color-secondary-dark uppercase tracking-widest mb-1">{material.collectionName}</p>
                        <p className="text-sm font-black color-secondary-dark leading-tight truncate">{material.fabricName}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={pending}
                    className="w-full h-12 bg-primary color-secondary-dark font-bold uppercase tracking-widest shadow-md hover:bg-primary/90 transition-all hover:-translate-y-0.5 flex justify-center items-center gap-2 text-[11px] sm:text-xs disabled:opacity-60 disabled:pointer-events-none"
                  >
                    {pending ? (
                      <div className="w-4 h-4 border-2 border-secondary-dark/30 border-t-secondary-dark rounded-full animate-spin" />
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    )}
                    Generate
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </AnimatedModal>
  )
}

export default UploadOwnModal
