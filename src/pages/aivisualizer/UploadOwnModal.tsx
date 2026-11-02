import { useRef, useState } from 'react'
import AnimatedModal from '../../components/ui/AnimatedModal'
import { AI_VISUALIZER_PRODUCTS } from './AiVisualizerEngine'
import type { SelectedMaterial, SelectedProduct } from './generateRender'

interface UploadOwnModalProps {
  /** May return a promise; the Generate button shows progress until it settles */
  onGenerate: (request: { material: SelectedMaterial; product: SelectedProduct }) => void | Promise<void>
  onClose: () => void
  /** False while another modal (e.g. the lead form) is stacked on top, so Esc only closes that one */
  dismissible?: boolean
}

const STEP_TITLES = ['Upload Your Fabric', 'Choose Product', 'Review & Generate']

/** 3D Studio "Upload your own": upload a fabric image → pick an AI product → generate a render. */
const UploadOwnModal = ({ onGenerate, onClose, dismissible = true }: UploadOwnModalProps) => {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [material, setMaterial] = useState<SelectedMaterial | null>(null)
  const [product, setProduct] = useState<SelectedProduct | null>(null)
  const [pending, setPending] = useState(false)
  const fabricUploadRef = useRef<HTMLInputElement>(null)

  const handleFabricUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file?.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setMaterial({
        id: `custom-fab-${Date.now()}`,
        fabricName: file.name.replace(/\.[^/.]+$/, ''),
        textureUrl: ev.target?.result as string,
        collectionName: 'Custom Upload',
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
      panelClassName="w-full max-w-md max-h-[calc(100dvh-32px)] bg-white shadow-2xl border border-stone-200 flex flex-col overflow-hidden"
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
              <h3 className="text-xs sm:text-sm font-bold tracking-widest uppercase text-secondary truncate">Upload Your Own</h3>
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

          <div key={step} className="kaira-content-in flex-1 min-h-0 overflow-y-auto p-5 sm:p-6">

            {/* Step 1: Upload fabric */}
            {step === 1 && (
              <div className="flex flex-col items-center gap-4">
                {material ? (
                  <>
                    <div className="w-44 aspect-square overflow-hidden border border-stone-200 shadow-md bg-stone-100">
                      <img src={material.textureUrl} alt={material.fabricName} className="w-full h-full object-contain" />
                    </div>
                    <div className="w-full bg-stone-50 border border-stone-200 px-4 py-3 flex flex-col gap-1">
                      <p className="text-[10px] color-secondary-dark uppercase tracking-widest">Custom Upload</p>
                      <p className="text-xs sm:text-sm font-bold color-secondary-dark truncate">{material.fabricName}</p>
                    </div>
                    <div className="flex gap-3 w-full">
                      <button
                        onClick={() => fabricUploadRef.current?.click()}
                        className="flex-1 h-11 border-2 border-stone-200 color-secondary-dark font-bold uppercase tracking-widest text-[10px] sm:text-[11px] hover:border-stone-400 transition-colors"
                      >
                        Change
                      </button>
                      <button
                        onClick={() => setStep(2)}
                        className="flex-1 h-11 bg-primary color-secondary-dark font-bold uppercase tracking-widest text-[10px] sm:text-[11px] shadow-md hover:bg-primary/90 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
                      >
                        <span>Use This Fabric</span>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => fabricUploadRef.current?.click()}
                    className="w-full flex flex-col items-center justify-center gap-3 border-2 border-dashed border-stone-300 py-12 hover:border-primary hover:bg-primary/5 transition-all color-secondary-dark group"
                  >
                    <div className="w-12 h-12 bg-stone-100 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    </div>
                    <div className="text-center">
                      <span className="block text-xs font-bold uppercase tracking-widest">Upload Fabric Image</span>
                      <span className="block text-[10px] color-secondary-dark/60 mt-1 normal-case tracking-normal">A clear, flat photo of the fabric works best</span>
                    </div>
                  </button>
                )}
                <input ref={fabricUploadRef} type="file" accept="image/*" onChange={handleFabricUpload} className="sr-only" />
              </div>
            )}

            {/* Step 2: Choose product */}
            {step === 2 && (
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {AI_VISUALIZER_PRODUCTS.map((p) => {
                  const isActive = product?.id === p.productName
                  return (
                    <button
                      key={p.productName}
                      onClick={() => {
                        setProduct({ id: p.productName, productName: p.productName, imageUrl: p.productImageUrl, isCustom: false })
                        setStep(3)
                      }}
                      className={`aspect-[4/3] border-2 overflow-hidden relative transition-all ${isActive ? 'border-primary ring-1 ring-primary' : 'border-stone-200 hover:border-stone-400'}`}
                    >
                      <img src={p.productImageUrl} alt="" className="w-full h-full object-contain bg-stone-100" />
                      <div className={`absolute bottom-0 left-0 right-0 py-1.5 px-2 text-center ${isActive ? 'bg-primary/15' : 'bg-white/75 backdrop-blur-sm'}`}>
                        <span className="text-[10px] sm:text-[11px] font-bold uppercase color-secondary-dark leading-tight tracking-wider">{p.productName}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Step 3: Review & generate */}
            {step === 3 && material && product && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 bg-stone-50 p-4 border border-stone-200">
                  <h4 className="text-[10px] font-bold color-secondary-dark uppercase tracking-[0.2em]">Your Fabric</h4>
                  <div className="flex items-center gap-4">
                    <img src={material.textureUrl} className="w-16 h-16 object-cover shadow-md border border-stone-200" alt="" />
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-[10px] color-secondary-dark uppercase tracking-widest mb-1">Custom Upload</p>
                      <p className="text-sm font-black color-secondary-dark leading-tight truncate">{material.fabricName}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 bg-stone-50 p-4 border border-stone-200">
                  <h4 className="text-[10px] font-bold color-secondary-dark uppercase tracking-[0.2em]">Selected Product</h4>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white flex items-center justify-center border border-stone-200 shadow-md p-1.5">
                      <img src={product.imageUrl} className="max-w-full max-h-full object-contain" alt="" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-[10px] color-secondary-dark uppercase tracking-widest mb-1">Preview Item</p>
                      <p className="text-sm font-black color-secondary-dark leading-tight">{product.productName}</p>
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
                  Generate Render
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </AnimatedModal>
  )
}

export default UploadOwnModal
