import { useState, useRef, useMemo } from 'react'
import { newMaterials } from '../data/newmaterials'
import { dummyProducts, getProductImageUrl } from '../data/products'
import type { Product } from '../data/products'

const S3_THUMB = 'https://supoassets.s3.ap-south-1.amazonaws.com/public/textures/KairaFabrics'

// -- Material filter constants -------------------------------------------------
const materialTypeOptions = [
  'All',
  ...Array.from(new Set(newMaterials.map((m) => m.material_type).filter(Boolean))).sort(),
]
const allColorGroups = [
  'All',
  ...Array.from(new Set(newMaterials.map((m) => m.color_group).filter((v): v is string => !!v))).sort(),
]
const allPatterns = [
  'All',
  ...Array.from(new Set(newMaterials.map((m) => m.pattern).filter((v): v is string => !!v))).sort(),
]
const COLOR_SWATCH: Record<string, string> = {
  Whites: '#f5f0eb', Creams: '#f2e9d0', Beiges: '#c9b49a', Browns: '#8b5a2b',
  Tans: '#d2b48c', Grays: '#8a8a8a', 'Light Grays': '#c4c4c4', 'Dark Grays': '#555555',
  Blacks: '#1c1c1c', Blues: '#3b6ea5', Navys: '#1b2f6b', Teals: '#19787d',
  Greens: '#2e7d32', Reds: '#c0392b', Oranges: '#e07020', Yellows: '#d4a017',
  Pinks: '#d4607a', Purples: '#7b3fa0', Mauves: '#9e7b9b', Coals: '#3c3c3c',
}

// -- Types ---------------------------------------------------------------------
interface SelectedMaterial {
  id: string | number
  fabricName: string
  textureUrl: string
  collectionName: string
  isCustom?: boolean
}

interface SelectedProduct {
  id: string | number
  productName: string
  imageUrl: string
  isCustom?: boolean
}

// -- Component -----------------------------------------------------------------
const AIVisualizerDesktop = () => {
  // Step state
  const [currentStep, setCurrentStep] = useState(1)

  // Material state
  const [selectedMaterial, setSelectedMaterial] = useState<SelectedMaterial | null>(null)
  const [activeMaterialType, setActiveMaterialType] = useState('All')
  const [activeCollection, setActiveCollection] = useState('All')
  const [activeColorGroup, setActiveColorGroup] = useState('All')
  const [activePattern, setActivePattern] = useState('All')
  const [search, setSearch] = useState('')
  const fabricUploadRef = useRef<HTMLInputElement>(null)

  // Product state
  const [selectedProduct, setSelectedProduct] = useState<SelectedProduct | null>(null)
  const productUploadRef = useRef<HTMLInputElement>(null)

  // Generation & OTP state
  const [showOTP, setShowOTP] = useState(false)
  const [mobileNumber, setMobileNumber] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpStep, setOtpStep] = useState(1) // 1 = Mobile, 2 = Verify
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)

  // -- Derived ----------------------------------------------------------------
  const filteredMaterials = useMemo(() => newMaterials.filter((m) => {
    if (activeMaterialType !== 'All' && m.material_type !== activeMaterialType) return false
    if (activeCollection !== 'All' && m.collection_name !== activeCollection) return false
    if (activeColorGroup !== 'All' && m.color_group !== activeColorGroup) return false
    if (activePattern !== 'All' && m.pattern !== activePattern) return false
    if (search) {
      const q = search.toLowerCase()
      if (
        !m.material_name?.toLowerCase().includes(q) &&
        !m.collection_name?.toLowerCase().includes(q)
      ) return false
    }
    return true
  }), [activeMaterialType, activeCollection, activeColorGroup, activePattern, search])

  const activeFilterCount = [activeMaterialType, activeCollection, activeColorGroup, activePattern].filter((v) => v !== 'All').length
  const clearInventoryFilters = () => {
    setActiveMaterialType('All')
    setActiveCollection('All')
    setActiveColorGroup('All')
    setActivePattern('All')
    setSearch('')
  }

  // -- Handlers ---------------------------------------------------------------
  const handleFabricUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file?.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setSelectedMaterial({
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

  const handleSelectMaterial = (m: typeof newMaterials[0]) => {
    setSelectedMaterial({
      id: m.id,
      fabricName: `${m.collection_name} ${m.material_name}`,
      textureUrl: `${S3_THUMB}/${m.collection_name}/${m.material_code}.webp`,
      collectionName: m.collection_name,
      isCustom: false,
    })
  }

  const handleProductUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file?.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setSelectedProduct({
        id: `custom-prod-${Date.now()}`,
        productName: file.name.replace(/\.[^/.]+$/, ''),
        imageUrl: ev.target?.result as string,
        isCustom: true,
      })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleSelectProduct = (p: Product) => {
    setSelectedProduct({
      id: p.product_id,
      productName: p.product_name,
      imageUrl: getProductImageUrl(p),
      isCustom: false,
    })
  }

  const handleGenerateClick = () => {
    if (!selectedProduct) return
    setOtpStep(1)
    setMobileNumber('')
    setOtpCode('')
    setShowOTP(true)
  }

  const handleSendOTP = () => {
    if (mobileNumber.length >= 10) {
      setOtpStep(2)
    }
  }

  const handleVerifyAndGenerate = () => {
    setShowOTP(false)
    setIsGenerating(true)
    setTimeout(() => {
      setGeneratedImage(
        `https://placehold.co/1200x800/F5F0E8/C5A552?text=AI+Preview+•+${encodeURIComponent(selectedProduct?.productName || 'Custom')}`
      )
      setIsGenerating(false)
      setCurrentStep(3) // 3 represents the "Result" step visually
    }, 2500)
  }

  // -- Render Helpers ----------------------------------------------------------

  const startOver = () => {
    setCurrentStep(1)
    setSelectedMaterial(null)
    setSelectedProduct(null)
    setGeneratedImage(null)
    setShowOTP(false)
  }

  return (
    <div className="flex flex-col h-full w-full bg-stone-100 overflow-y-auto items-center p-4 sm:p-8">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden flex flex-col min-h-[520px] sm:min-h-[600px]">
        
        {/* Header */}
        <div className="shrink-0 bg-stone-50 border-b border-stone-200 px-4 py-3 sm:p-6 text-center">
            <h1 className="text-base sm:text-xl font-bold tracking-widest uppercase text-stone-800">AI Studio</h1>
            <p className="text-[10px] sm:text-xs text-stone-500 mt-0.5 uppercase tracking-wider">Visualize Your Future</p>
        </div>

        <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-y-auto">
          {/* Step 1: Material Selection */}
          {currentStep === 1 && (
            <div className="flex flex-col h-full items-center justify-center gap-4 sm:gap-6 animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-[11px] sm:text-sm font-semibold text-stone-700 uppercase tracking-widest mb-1 sm:mb-2">Step 1: Choose Fabric</h2>
              
              <button
                onClick={() => fabricUploadRef.current?.click()}
                className="w-full h-24 sm:h-32 flex flex-col items-center justify-center gap-2 sm:gap-3 border-2 border-dashed border-stone-300 rounded-xl hover:border-primary hover:bg-primary/5 transition-all group"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-stone-100 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-stone-500 group-hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-stone-600 group-hover:text-primary transition-colors">Upload Your Fabric</span>
              </button>
              <input ref={fabricUploadRef} type="file" accept="image/*" onChange={(e) => { handleFabricUpload(e); setCurrentStep(1.5); }} className="sr-only" />

              <div className="flex items-center gap-4 w-full">
                <div className="flex-1 h-px bg-stone-200"></div>
                <span className="text-[10px] text-stone-400 font-medium uppercase tracking-widest">OR</span>
                <div className="flex-1 h-px bg-stone-200"></div>
              </div>

              <button
                onClick={() => setCurrentStep(1.1)}
                className="w-full h-24 sm:h-32 flex flex-col items-center justify-center gap-2 sm:gap-3 border border-stone-200 rounded-xl shadow-sm hover:border-stone-400 hover:shadow-md transition-all group overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-stone-800/5 group-hover:bg-stone-800/10 transition-colors" />
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-stone-200 flex items-center justify-center group-hover:bg-stone-300 transition-colors relative z-10">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-stone-700 relative z-10">Select from Kaira Inventory</span>
              </button>
            </div>
          )}

          {/* Kaira Inventory Selection */}
          {currentStep === 1.1 && (
            <div className="flex flex-col h-full -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 animate-in fade-in">

              {/* Sticky top bar */}
              <div className="shrink-0 bg-white border-b border-stone-100 px-3 sm:px-4 pt-3 sm:pt-4 pb-2 sm:pb-3 space-y-2 sm:space-y-3">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button onClick={() => setCurrentStep(1)} className="p-1 sm:p-1.5 border border-stone-200 rounded-lg text-stone-500 hover:bg-stone-50 text-[10px]">←</button>
                  <h2 className="text-[10px] sm:text-[11px] font-bold text-stone-700 uppercase tracking-widest flex-1">Kaira Inventory</h2>
                  <span className="text-[9px] sm:text-[10px] text-stone-400">{filteredMaterials.length} fabrics</span>
                  {activeFilterCount > 0 && (
                    <button onClick={clearInventoryFilters} className="text-[9px] uppercase tracking-widest text-primary hover:underline">
                      Clear ({activeFilterCount})
                    </button>
                  )}
                </div>

                {/* Search */}
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search fabrics…"
                  className="w-full bg-stone-50 border border-stone-200 text-[10px] sm:text-[11px] px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg focus:outline-none focus:border-primary/60"
                />

                {/* Color swatches */}
                <div className="flex items-center gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-0.5">
                  {allColorGroups.map((c) => (
                    <button
                      key={c}
                      onClick={() => setActiveColorGroup(c)}
                      title={c}
                      className={`flex items-center gap-0.5 sm:gap-1 shrink-0 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[8px] sm:text-[9px] font-semibold uppercase tracking-wide border transition-all ${
                        activeColorGroup === c
                          ? 'bg-stone-800 text-white border-stone-800'
                          : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'
                      }`}
                    >
                      <span
                        className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0 border border-white/30"
                        style={{ background: c === 'All' ? 'linear-gradient(135deg,#f5f0eb,#8b5a2b,#1c1c1c)' : (COLOR_SWATCH[c] ?? '#d0c8c0') }}
                      />
                      {c}
                    </button>
                  ))}
                </div>

                {/* Pattern + Material Type chips — two rows */}
                <div className="flex gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-0.5">
                  {allPatterns.map((p) => (
                    <button
                      key={p}
                      onClick={() => setActivePattern(p)}
                      className={`shrink-0 px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[8px] sm:text-[9px] font-semibold uppercase tracking-wide border transition-all ${
                        activePattern === p
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <div className="flex gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-0.5">
                  {materialTypeOptions.map((t) => (
                    <button
                      key={t}
                      onClick={() => setActiveMaterialType(t)}
                      className={`shrink-0 px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[8px] sm:text-[9px] font-semibold uppercase tracking-wide border transition-all ${
                        activeMaterialType === t
                          ? 'bg-stone-600 text-white border-stone-600'
                          : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid */}
              <div className="flex-1 overflow-y-auto p-2 sm:p-3 bg-stone-50">
                {filteredMaterials.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-[10px] sm:text-[11px] text-stone-400 uppercase tracking-widest">No fabrics found</div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 sm:gap-2">
                    {filteredMaterials.map((m) => {
                      const isActive = selectedMaterial?.id === m.id
                      return (
                        <button
                          key={m.id}
                          onClick={() => { handleSelectMaterial(m); setCurrentStep(1.5) }}
                          className={`aspect-square overflow-hidden rounded-lg border-2 relative transition-all ${
                            isActive ? 'border-primary shadow-md scale-[1.03]' : 'border-transparent hover:border-stone-300'
                          }`}
                        >
                          <img
                            src={`${S3_THUMB}/${m.collection_name}/${m.material_code}.webp`}
                            alt={`${m.collection_name} ${m.material_name}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex flex-col items-center justify-center transition-opacity p-1 text-center">
                            <span className="text-[8px] text-white font-bold uppercase leading-tight">{m.collection_name}</span>
                            <span className="text-[7px] text-white/70 mt-0.5">{m.material_name}</span>
                          </div>
                          {isActive && (
                            <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-primary rounded-full flex items-center justify-center">
                              <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Review Selected Material & Proceed */}
          {currentStep === 1.5 && (
            <div className="flex flex-col h-full items-center justify-center gap-4 sm:gap-6 animate-in fade-in zoom-in-95">
               <h2 className="text-[11px] sm:text-sm font-semibold text-stone-700 uppercase tracking-widest mb-1 sm:mb-2">Selected Fabric</h2>
               <div className="w-36 h-36 sm:w-48 sm:h-48 rounded-xl border-4 border-white shadow-xl overflow-hidden relative">
                 <img src={selectedMaterial?.textureUrl} className="w-full h-full object-cover" alt="" />
                 <button onClick={() => setCurrentStep(1)} className="absolute top-2 right-2 bg-white/90 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-sm text-stone-600 hover:text-red-500 text-[10px]">✕</button>
               </div>
               <p className="text-xs sm:text-sm font-bold text-stone-800 text-center">{selectedMaterial?.fabricName}</p>
               <button onClick={() => setCurrentStep(2)} className="w-full h-10 sm:h-12 bg-primary text-white rounded-xl font-bold uppercase tracking-widest shadow-lg hover:bg-[#b8943f] transition-colors mt-2 sm:mt-4 text-[11px] sm:text-xs">
                 Choose Product
               </button>
            </div>
          )}

          {/* Step 2: Product Selection */}
          {currentStep === 2 && (
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                 <button onClick={() => setCurrentStep(1.5)} className="p-1.5 sm:p-2 border border-stone-200 rounded-lg text-stone-500 hover:bg-stone-50 text-xs">←</button>
                 <h2 className="text-[11px] sm:text-sm font-semibold text-stone-700 uppercase tracking-widest flex-1">Step 2: Choose Product</h2>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6 overflow-y-auto max-h-[340px] sm:max-h-[400px] p-0.5 sm:p-1">
                <button onClick={() => productUploadRef.current?.click()} className="aspect-square border-2 border-dashed border-stone-300 rounded-xl flex items-center justify-center flex-col gap-1.5 sm:gap-2 hover:border-primary hover:bg-primary/5 transition-all text-stone-500">
                   <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                   <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest">Upload Own</span>
                </button>
                <input ref={productUploadRef} type="file" accept="image/*" onChange={(e) => { handleProductUpload(e); setCurrentStep(2.5); }} className="sr-only" />
                
                {dummyProducts.map(p => {
                    const isActive = selectedProduct?.id === p.product_id
                    return (
                       <button
                         key={p.product_id}
                         onClick={() => { handleSelectProduct(p); setCurrentStep(2.5); }}
                         className={`aspect-square border-2 rounded-xl flex flex-col items-center justify-center p-2 sm:p-4 gap-1.5 sm:gap-2 transition-all ${isActive ? 'border-primary bg-primary/5' : 'border-stone-200 bg-white hover:border-stone-400'}`}
                       >
                         <img src={getProductImageUrl(p)} alt="" className="h-20 sm:h-28 object-contain" />
                         <span className="text-[9px] sm:text-[10px] font-bold uppercase text-stone-700 text-center leading-tight">{p.product_name}</span>
                       </button>
                    )
                })}
              </div>
            </div>
          )}

          {/* Review Selected Product & Generate */}
          {currentStep === 2.5 && (
            <div className="flex flex-col h-full items-center justify-center gap-3 sm:gap-6 animate-in fade-in zoom-in-95">
               <div className="flex items-center w-full mb-1 sm:mb-2">
                 <button onClick={() => setCurrentStep(2)} className="p-1.5 sm:p-2 border border-stone-200 rounded-lg text-stone-500 hover:bg-stone-50 mr-auto text-xs">←</button>
                 <h2 className="text-[11px] sm:text-sm font-semibold text-stone-700 uppercase tracking-widest mx-auto pr-8 sm:pr-10">Review</h2>
               </div>
               
               <div className="flex items-center gap-3 sm:gap-4 bg-stone-50 p-3 sm:p-4 border border-stone-200 rounded-xl w-full">
                  <img src={selectedMaterial?.textureUrl} className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover shadow-sm border border-stone-200" alt="" />
                  <div className="flex-1 min-w-0">
                     <p className="text-[9px] sm:text-[10px] text-stone-500 uppercase tracking-widest">Fabric</p>
                     <p className="text-[11px] sm:text-xs font-bold text-stone-800 truncate">{selectedMaterial?.fabricName}</p>
                  </div>
               </div>

               <div className="w-8 flex justify-center"><svg className="w-4 h-4 sm:w-5 sm:h-5 text-stone-300 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></div>

               <div className="flex items-center gap-3 sm:gap-4 bg-stone-50 p-3 sm:p-4 border border-stone-200 rounded-xl w-full">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-lg flex items-center justify-center border border-stone-200 shadow-sm p-1">
                    <img src={selectedProduct?.imageUrl} className="max-w-full max-h-full object-contain" alt="" />
                  </div>
                  <div className="flex-1 min-w-0">
                     <p className="text-[9px] sm:text-[10px] text-stone-500 uppercase tracking-widest">Product</p>
                     <p className="text-[11px] sm:text-xs font-bold text-stone-800 truncate">{selectedProduct?.productName}</p>
                  </div>
               </div>

               <button onClick={handleGenerateClick} className="w-full h-12 sm:h-14 bg-stone-900 text-white rounded-xl font-bold uppercase tracking-widest shadow-xl hover:bg-black transition-all hover:-translate-y-1 mt-2 sm:mt-4 flex justify-center items-center gap-2 text-[10px] sm:text-xs">
                 <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                 Generate Render
               </button>
            </div>
          )}

          {/* Result */}
          {currentStep === 3 && (
            <div className="flex flex-col h-full items-center justify-center gap-4 sm:gap-6 animate-in fade-in">
               <h2 className="text-[11px] sm:text-sm font-semibold text-primary uppercase tracking-widest mb-1 sm:mb-2">Ready!</h2>
               <div className="w-full aspect-square bg-stone-100 rounded-2xl border border-stone-200 shadow-inner overflow-hidden relative">
                  <img src={generatedImage || ''} alt="" className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 backdrop-blur rounded-lg p-1.5 sm:p-2 shadow-sm border border-stone-200/50 flex gap-2">
                    <img src={selectedMaterial?.textureUrl} className="w-6 h-6 sm:w-8 sm:h-8 rounded object-cover" alt="" />
                  </div>
               </div>
               
               <div className="flex gap-3 sm:gap-4 w-full mt-2 sm:mt-4">
                  <button onClick={startOver} className="flex-1 h-10 sm:h-12 border-2 border-stone-200 text-stone-600 rounded-xl font-bold uppercase tracking-widest text-[10px] sm:text-[11px] hover:border-stone-400 transition-colors">
                    Start Over
                  </button>
                  <button className="flex-1 h-10 sm:h-12 bg-primary text-white rounded-xl font-bold uppercase tracking-widest text-[10px] sm:text-[11px] shadow-lg hover:bg-[#b8943f] transition-colors">
                    Download
                  </button>
               </div>
            </div>
          )}

        </div>
      </div>

      {showOTP && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => !isGenerating && setShowOTP(false)} />
          <div className="relative w-full max-w-[340px] sm:max-w-[360px] bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col">
             
             {isGenerating ? (
               <div className="p-8 sm:p-10 flex flex-col items-center justify-center pb-10 sm:pb-12">
                 <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-stone-100 border-t-primary rounded-full animate-spin mb-4 sm:mb-6" />
                 <h3 className="text-xs sm:text-sm font-bold text-stone-800 tracking-wide uppercase mb-2">Generating...</h3>
                 <p className="text-[11px] sm:text-xs text-stone-500 text-center">Using AI to apply your fabric to the product.</p>
               </div>
             ) : (
               <>
                 <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
                   <h3 className="text-[12px] font-bold text-stone-800 uppercase tracking-widest">Verification</h3>
                   <button onClick={() => setShowOTP(false)} className="text-stone-400 hover:text-stone-700">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                   </button>
                 </div>
                 <div className="p-6">
                   {otpStep === 1 ? (
                     <div className="flex flex-col gap-4">
                       <div>
                         <label className="block text-[10px] font-semibold text-stone-600 uppercase tracking-wider mb-2">Mobile Number</label>
                         <input type="tel" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} placeholder="10-digit number" className="w-full h-10 px-3 border border-stone-300 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-xs" />
                       </div>
                       <button onClick={handleSendOTP} disabled={mobileNumber.length < 10} className="h-10 w-full bg-stone-800 hover:bg-stone-900 text-white rounded-lg text-[11px] font-bold uppercase tracking-widest disabled:bg-stone-300 transition-colors mt-2">
                         Send OTP
                       </button>
                     </div>
                   ) : (
                     <div className="flex flex-col gap-4">
                       <p className="text-xs text-stone-500">OTP sent to <span className="font-semibold text-stone-800">{mobileNumber}</span></p>
                       <div>
                         <label className="block text-[10px] font-semibold text-stone-600 uppercase tracking-wider mb-2">Enter OTP</label>
                         <input type="text" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} placeholder="1234" maxLength={4} className="w-full h-10 px-3 border border-stone-300 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-center tracking-[0.5em] font-mono text-sm" />
                       </div>
                       <button onClick={handleVerifyAndGenerate} disabled={otpCode.length < 4} className="h-10 w-full bg-primary hover:bg-[#b8943f] text-white rounded-lg text-[11px] font-bold uppercase tracking-widest disabled:bg-stone-200 transition-colors mt-2">
                         Verify & Generate
                       </button>
                     </div>
                   )}
                 </div>
               </>
             )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AIVisualizerDesktop
