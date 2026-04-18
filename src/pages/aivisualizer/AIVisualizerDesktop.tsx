import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import type { NewMaterial } from '../../data/newmaterials'
import { dummyProducts, getProductImageUrl } from '../../data/products'
import type { Product } from '../../data/products'
import { MaterialsInventory, S3_THUMB } from './MaterialsInventory'
import {
  generateRender,
} from './generateRender'
import type { SelectedMaterial, SelectedProduct } from './generateRender'

// -- Component -----------------------------------------------------------------
const AIVisualizerDesktop = () => {
  // Step state
  const [currentStep, setCurrentStep] = useState(1)
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false)

  // Material state
  const [selectedMaterial, setSelectedMaterial] = useState<SelectedMaterial | null>(null)
  const fabricUploadRef = useRef<HTMLInputElement>(null)

  // Product state
  const [selectedProduct, setSelectedProduct] = useState<SelectedProduct | null>(null)
  const productUploadRef = useRef<HTMLInputElement>(null)

  // Lead form & generation state
  const [showLeadForm, setShowLeadForm] = useState(false)
  const [fullName, setFullName] = useState(() => localStorage.getItem('kaira_lead_name') ?? '')
  const [mobileNumber, setMobileNumber] = useState(() => localStorage.getItem('kaira_lead_mobile') ?? '')
  const [mobileError, setMobileError] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [showImageModal, setShowImageModal] = useState(false)
  const [imgZoom, setImgZoom] = useState(1)
  const [showFabricModal, setShowFabricModal] = useState(false)
  const [compareMode, setCompareMode] = useState(false)

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
      setCurrentStep(1.5) // Show material preview first
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleSelectMaterial = (m: NewMaterial) => {
    setSelectedMaterial({
      id: m.id,
      fabricName: `${m.collection_name} ${m.material_name}`,
      textureUrl: `${S3_THUMB}/${m.collection_name}/${m.material_code}.webp`,
      collectionName: m.collection_name,
      isCustom: false,
    })
    setCurrentStep(1.5) // Show material preview first
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


  const handleGenerate = (mobile: string) => {
    if (!selectedMaterial || !selectedProduct) return
    setGenerateError(null)
    generateRender({
      selectedMaterial,
      selectedProduct,
      mobileNumber: mobile,
      onGeneratingChange: setIsGenerating,
      onShowOTPChange: setShowLeadForm,
      onResult: (imageUrl) => {
        setGeneratedImage(imageUrl)
        setCurrentStep(3)
        setShowImageModal(true)
      },
      onError: setGenerateError,
    })
  }

  const handleGenerateClick = () => {
    if (!selectedProduct) return
    setGenerateError(null)
    setShowLeadForm(true)
  }

  const handleLeadSubmit = () => {
    if (!fullName.trim()) return
    const cleaned = mobileNumber.replace(/\D/g, '').slice(0, 10)
    if (cleaned.length !== 10) {
      setMobileError('Please enter a valid 10-digit mobile number')
      return
    }
    setMobileError('')
    localStorage.setItem('kaira_lead_name', fullName.trim())
    localStorage.setItem('kaira_lead_mobile', cleaned)
    handleGenerate(cleaned)
  }

  // -- Render Helpers ----------------------------------------------------------

  const handleDownload = async () => {
    if (!generatedImage) return
    try {
      const res = await fetch(generatedImage)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'kaira-render.jpg'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      window.open(generatedImage, '_blank')
    }
  }

  const startOver = () => {
    setCurrentStep(1)
    setSelectedMaterial(null)
    setSelectedProduct(null)
    setGeneratedImage(null)
    setShowLeadForm(false)
    setShowImageModal(false)
  }

  return (
    <div className="relative flex flex-col w-full min-h-screen" style={{ background: 'linear-gradient(160deg, #ffffff 0%, #f5f5f4 50%, #e7e5e4 100%)' }}>
      <div className="absolute inset-0 pointer-events-none opacity-[0.18]" style={{ backgroundImage: 'radial-gradient(circle, #a8a29e 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

      {/* ── Minimal Page Header ──────────────────────────────────── */}
      <div className="bg-stone-900 pt-24 pb-6">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => window.history.back()}
              className="group flex items-center gap-2 px-4 py-2 border border-stone-600 bg-transparent text-stone-300 hover:text-white hover:border-stone-400 transition-all rounded-sm"
            >
              <svg className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-[11px] uppercase font-bold tracking-widest">Back to Home</span>
            </button>
          </div>

          <p className="text-[10px] tracking-[0.4em] uppercase font-bold text-primary mb-1.5">AI-Powered Tool</p>
          <h1 className="font-serif text-3xl md:text-3xl text-white">AI Fabric Visualizer</h1>
        </div>
      </div>

      {/* ── Content Wrapper ── */}
      <div className="relative z-10 flex flex-col w-full max-w-6xl mx-auto px-4 sm:px-8 pb-12 lg:pb-16">

        {/* Unified AI Studio Card */}
        <div className="w-full bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col lg:flex-row min-h-[600px] mt-6 lg:mt-8 mb-8 lg:mb-0">
          
          {/* Left Side: Header & Info */}
          <div className="relative w-full lg:w-[45%] bg-stone-900 border-b lg:border-b-0 lg:border-r border-stone-800 px-8 py-10 sm:px-10 sm:py-16 hidden lg:flex flex-col justify-center">
            {/* Subtle motion background */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')] animate-[pulse_8s_ease-in-out_infinite]" />
            
            <div className="relative z-10 flex flex-col text-left items-start">
              {/* AI Powered Badge */}
              <div className="inline-flex items-center gap-2 bg-stone-800 backdrop-blur-sm border border-stone-700 rounded-full px-3 py-1 mb-6 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[10px] sm:text-[11px] text-stone-300 uppercase tracking-widest">AI Powered</span>
              </div>

              {/* Title */}
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white leading-[1.1] mb-5">
                Bring Fabrics<br />
                <em className="not-italic text-primary">To Life</em>
              </h2>

              {/* Divider */}
              <div className="flex items-center justify-start gap-2 mb-6">
                <span className="w-8 h-px bg-stone-700" />
                <span className="w-1 h-1 rotate-45 bg-amber-400/70 inline-block" />
                <span className="w-8 h-px bg-stone-700" />
              </div>

              {/* Description */}
              <p className="text-[12px] sm:text-sm text-stone-300 font-light leading-relaxed mb-10">
                Select a fabric, choose a product, and watch AI generate a photorealistic preview — see exactly how it looks before you order.
              </p>

              {/* Feature Highlights */}
              <div className="flex flex-col gap-4 w-full">
                <div className="flex items-center gap-3 text-stone-300">
                  <div className="w-7 h-7 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-xs sm:text-sm">Choose any fabric</span>
                </div>
                <div className="flex items-center gap-3 text-stone-300">
                  <div className="w-7 h-7 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-xs sm:text-sm">Pick any product</span>
                </div>
                <div className="flex items-center gap-3 text-stone-300">
                  <div className="w-7 h-7 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-xs sm:text-sm">See an instant lifelike preview</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Interactive Studio */}
          <div className="w-full lg:w-[55%] flex flex-col bg-stone-50/30">
        
            {/* Studio Header */}
            <div className="shrink-0 bg-white/50 backdrop-blur border-b border-stone-100 px-6 py-5 flex justify-between items-center">
                <div>
                  <h1 className="text-base sm:text-base font-bold tracking-widest uppercase text-stone-800">AI Studio Workspace</h1>
                  <p className="text-[11px] text-stone-500 uppercase tracking-widest mt-0.5">Step {Math.floor(currentStep)} of 3</p>
                </div>
                {/* Progress Indicator */}
                <div className="flex gap-1.5">
                  <div className={`h-1.5 w-6 rounded-full transition-colors ${currentStep >= 1 ? 'bg-primary' : 'bg-stone-200'}`} />
                  <div className={`h-1.5 w-6 rounded-full transition-colors ${currentStep >= 2 ? 'bg-primary' : 'bg-stone-200'}`} />
                  <div className={`h-1.5 w-6 rounded-full transition-colors ${currentStep >= 3 ? 'bg-primary' : 'bg-stone-200'}`} />
                </div>
            </div>

            <div className="flex-1 flex flex-col p-6 sm:p-10 overflow-y-auto min-h-[400px]">
          {/* Step 1: Material Selection */}
          {currentStep === 1 && (
            <div className="flex flex-col h-full items-center justify-center gap-4 sm:gap-6 animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-sm sm:text-base font-semibold text-stone-700 uppercase tracking-widest mb-1 sm:mb-2 text-center">Step 1: Choose Fabric</h2>
              
              {/* Primary: Inventory */}
              <button
                onClick={() => setIsInventoryModalOpen(true)}
                className="w-full flex flex-col items-center justify-center gap-3 sm:gap-4 bg-stone-900 border-2 border-stone-900 rounded-xl py-8 sm:py-10 hover:bg-stone-800 hover:border-stone-800 transition-all group shadow-lg"
              >
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <svg className="w-5 h-5 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="text-center">
                  <span className="block text-[13px] sm:text-sm font-bold uppercase tracking-widest text-white">Browse Kaira Inventory</span>
                  <span className="block text-[10px] sm:text-[11px] text-stone-400 mt-1">Explore our curated fabric collection</span>
                </div>
              </button>

              <div className="flex items-center gap-4 w-full">
                <div className="flex-1 h-px bg-stone-200"></div>
                <span className="text-xs text-stone-400 font-bold uppercase tracking-widest">or</span>
                <div className="flex-1 h-px bg-stone-200"></div>
              </div>

              {/* Secondary: Upload */}
              <button
                onClick={() => fabricUploadRef.current?.click()}
                className="w-full flex items-center justify-center gap-3 border border-stone-200 rounded-xl py-3.5 sm:py-4 hover:border-stone-400 hover:bg-stone-50 transition-all group"
              >
                <svg className="w-4 h-4 text-stone-400 group-hover:text-stone-600 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-stone-500 group-hover:text-stone-700 transition-colors">Upload Your Own Fabric</span>
              </button>
              <input ref={fabricUploadRef} type="file" accept="image/*" onChange={handleFabricUpload} className="sr-only" />
            </div>
          )}

          {/* Step 1.5: Material Preview */}
          {currentStep === 1.5 && (
            <div className="flex flex-col h-full items-center justify-center gap-4 sm:gap-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center w-full mb-1">
                <button onClick={() => { setSelectedMaterial(null); setCurrentStep(1); }} className="p-1.5 sm:p-2 border border-stone-200 rounded-lg text-stone-500 hover:bg-stone-50 text-xs">←</button>
                <h2 className="text-[11px] sm:text-sm font-semibold text-stone-700 uppercase tracking-widest mx-auto pr-8">Fabric Preview</h2>
              </div>

              {/* Large texture preview */}
              <div className="w-auto aspect-square max-h-[160px] sm:max-h-[320px] rounded-2xl overflow-hidden border border-stone-200 shadow-md bg-stone-100">
                <img
                  src={selectedMaterial?.textureUrl}
                  alt={selectedMaterial?.fabricName}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Fabric info */}
              <div className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 flex flex-col gap-1">
                <p className="text-[9px] sm:text-[10px] text-stone-500 uppercase tracking-widest">
                  {selectedMaterial?.isCustom ? 'Custom Upload' : selectedMaterial?.collectionName}
                </p>
                <p className="text-xs sm:text-sm font-bold text-stone-800 truncate">{selectedMaterial?.fabricName}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 w-full mt-auto">
                <button
                  onClick={() => { setSelectedMaterial(null); setCurrentStep(1); }}
                  className="flex-1 h-11 sm:h-12 border-2 border-stone-200 text-stone-600 rounded-xl font-bold uppercase tracking-widest text-[10px] sm:text-[11px] hover:border-stone-400 transition-colors"
                >
                  Change
                </button>
                <button
                  onClick={() => setCurrentStep(2)}
                  className="flex-1 h-11 sm:h-12 bg-stone-900 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] sm:text-[11px] shadow-lg hover:bg-black transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <span>Use This Fabric</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Product Selection */}
          {currentStep === 2 && (
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                 <button onClick={() => setCurrentStep(1.5)} className="p-1.5 sm:p-2 border border-stone-200 rounded-lg text-stone-500 hover:bg-stone-50 text-xs">←</button>
                 <h2 className="text-[13px] sm:text-sm font-semibold text-stone-700 uppercase tracking-widest flex-1">Step 2: Choose Product</h2>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6 overflow-y-auto max-h-[400px] sm:max-h-[480px] p-0.5 sm:p-1">
                <button
                  onClick={() => productUploadRef.current?.click()}
                  className="aspect-[4/3] border-2 border-dashed border-stone-300 rounded-xl flex items-center justify-center flex-col gap-2 sm:gap-3 hover:border-primary hover:bg-primary/5 transition-all text-stone-500 group"
                >
                  <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span className="text-[11px] sm:text-xs uppercase font-bold tracking-widest text-center px-2">Upload Own Product</span>
                </button>
                <input ref={productUploadRef} type="file" accept="image/*" onChange={(e) => { handleProductUpload(e); setCurrentStep(2.5); }} className="sr-only" />
                
                {dummyProducts.map(p => {
                    const isActive = selectedProduct?.id === p.product_id
                    return (
                       <button
                         key={p.product_id}
                         onClick={() => { handleSelectProduct(p); setCurrentStep(2.5); }}
                         className={`aspect-[4/3] border-2 rounded-xl flex flex-col items-center justify-center p-3 sm:p-4 gap-2 transition-all ${isActive ? 'border-primary bg-primary/5' : 'border-stone-200 bg-white hover:border-stone-400'}`}
                       >
                         <div className="flex-1 w-full flex items-center justify-center overflow-hidden">
                           <img src={getProductImageUrl(p)} alt="" className="max-h-full max-w-full object-contain transform group-hover:scale-105 transition-transform duration-500" />
                         </div>
                         <span className="text-[11px] sm:text-xs font-bold uppercase text-stone-700 text-center leading-tight tracking-wider">{p.product_name}</span>
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
                 <h2 className="text-[13px] sm:text-sm font-semibold text-stone-700 uppercase tracking-widest mx-auto pr-8 sm:pr-10">Review</h2>
               </div>
               
               <div className="flex flex-col sm:flex-row items-stretch gap-4 sm:gap-6 w-full">
                  <div className="flex-1 flex flex-col gap-3 bg-stone-50 p-5 sm:p-7 border border-stone-200 rounded-2xl">
                     <h3 className="text-[10px] sm:text-[11px] font-bold text-stone-400 uppercase tracking-[0.2em]">Selected Material</h3>
                     <div className="flex items-center gap-4 sm:gap-5">
                        <img src={selectedMaterial?.textureUrl} className="w-16 h-16 sm:w-24 sm:h-24 rounded-xl object-cover shadow-md border border-stone-200" alt="" />
                        <div className="flex-1 min-w-0 text-left">
                           <p className="text-[10px] text-stone-500 uppercase tracking-widest mb-1">{selectedMaterial?.isCustom ? 'Custom Upload' : selectedMaterial?.collectionName}</p>
                           <p className="text-sm sm:text-sm font-black text-stone-900 leading-tight">{selectedMaterial?.fabricName}</p>
                        </div>
                     </div>
                  </div>

                  <div className="flex-1 flex flex-col gap-3 bg-stone-50 p-5 sm:p-7 border border-stone-200 rounded-2xl">
                     <h3 className="text-[10px] sm:text-[11px] font-bold text-stone-400 uppercase tracking-[0.2em]">Selected Product</h3>
                     <div className="flex items-center gap-4 sm:gap-5">
                        <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white rounded-xl flex items-center justify-center border border-stone-200 shadow-md p-1.5">
                          <img src={selectedProduct?.imageUrl} className="max-w-full max-h-full object-contain" alt="" />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                           <p className="text-[10px] text-stone-500 uppercase tracking-widest mb-1">Preview Item</p>
                           <p className="text-sm sm:text-sm font-black text-stone-900 leading-tight">{selectedProduct?.productName}</p>
                        </div>
                     </div>
                  </div>
               </div>

               <button onClick={handleGenerateClick} className="w-full h-12 sm:h-14 bg-stone-900 text-white rounded-xl font-bold uppercase tracking-widest shadow-xl hover:bg-black transition-all hover:-translate-y-1 mt-2 sm:mt-4 flex justify-center items-center gap-2 text-[11px] sm:text-xs">
                 <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                 Generate Render
               </button>
            </div>
          )}

          {/* Result */}
          {currentStep === 3 && (
            <div className="flex flex-col h-full items-center justify-center gap-3 sm:gap-4 animate-in fade-in">
               <div className="flex items-center justify-between w-full">
                 <h2 className="text-[11px] sm:text-sm font-semibold text-primary uppercase tracking-widest">Result Ready!</h2>
                 {/* Compare toggle */}
                 <button
                   onClick={() => setCompareMode(m => !m)}
                   className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest border-2 shadow-sm transition-all ${
                     compareMode
                       ? 'bg-stone-900 text-white border-stone-900 shadow-md'
                       : 'bg-white text-stone-700 border-stone-300 hover:border-stone-900 hover:bg-stone-900 hover:text-white'
                   }`}
                 >
                   {/* Split/compare columns icon */}
                   <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                     <rect x="3" y="3" width="8" height="18" rx="1.5" />
                     <rect x="13" y="3" width="8" height="18" rx="1.5" />
                   </svg>
                   {compareMode ? 'Single View' : 'Compare'}
                 </button>
               </div>

               {!compareMode ? (
                 /* Single result view */
                 <button
                   onClick={() => setShowImageModal(true)}
                   className="w-full aspect-square bg-stone-100 rounded-2xl border border-stone-200 shadow-inner overflow-hidden relative group cursor-pointer"
                 >
                   <img src={generatedImage || ''} alt="Generated render" className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                     <div className="opacity-0 group-hover:opacity-100 transition-opacity w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                       <svg className="w-5 h-5 text-stone-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5" /></svg>
                     </div>
                   </div>
                   <div className="absolute bottom-2 right-2 bg-stone-900/70 backdrop-blur rounded-full px-2.5 py-1">
                     <span className="text-[9px] text-white uppercase tracking-widest font-bold">Tap to expand</span>
                   </div>
                 </button>
               ) : (
                 /* Compare view: fabric vs result */
                 <div className="w-full flex gap-2 sm:gap-3">
                   {/* Fabric tile */}
                   <button
                     onClick={() => setShowFabricModal(true)}
                     className="flex-1 aspect-square bg-stone-100 rounded-xl border border-stone-200 overflow-hidden relative group cursor-pointer"
                   >
                     <img src={selectedMaterial?.textureUrl} alt="Fabric" className="w-full h-full object-cover" />
                     <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                     <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-2">
                       <span className="text-[9px] text-white font-bold uppercase tracking-widest">Fabric</span>
                     </div>
                     <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-full bg-white/80 flex items-center justify-center">
                       <svg className="w-3 h-3 text-stone-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5" /></svg>
                     </div>
                   </button>

                   {/* Arrow divider */}
                   <div className="flex items-center justify-center shrink-0">
                     <div className="w-7 h-7 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center shadow-sm">
                       <svg className="w-3.5 h-3.5 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                     </div>
                   </div>

                   {/* Result tile */}
                   <button
                     onClick={() => setShowImageModal(true)}
                     className="flex-1 aspect-square bg-stone-100 rounded-xl border-2 border-primary/40 overflow-hidden relative group cursor-pointer"
                   >
                     <img src={generatedImage || ''} alt="Result" className="w-full h-full object-cover" />
                     <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                     <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-2">
                       <span className="text-[9px] text-primary font-bold uppercase tracking-widest">Result</span>
                     </div>
                     <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-full bg-white/80 flex items-center justify-center">
                       <svg className="w-3 h-3 text-stone-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5" /></svg>
                     </div>
                   </button>
                 </div>
               )}

               {/* Fabric used info — clickable to open full fabric */}
               <button
                 onClick={() => setShowFabricModal(true)}
                 className="w-full flex items-center gap-3 bg-stone-50 border border-stone-200 hover:border-stone-400 rounded-xl px-3 py-3 transition-all group text-left"
               >
                 <img
                   src={selectedMaterial?.textureUrl}
                   alt={selectedMaterial?.fabricName}
                   className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover border border-stone-200 shadow-sm shrink-0 group-hover:shadow-md transition-shadow"
                 />
                 <div className="flex-1 min-w-0">
                   <p className="text-[9px] sm:text-[10px] text-stone-400 uppercase tracking-widest font-semibold mb-0.5">
                     {selectedMaterial?.isCustom ? 'Custom Upload' : (selectedMaterial?.collectionName ?? 'Fabric Used')}
                   </p>
                   <p className="text-xs sm:text-sm font-bold text-stone-800 truncate">{selectedMaterial?.fabricName}</p>
                 </div>
                 <div className="shrink-0 flex items-center gap-1.5 text-stone-400 group-hover:text-stone-600 transition-colors">
                   <span className="text-[9px] uppercase tracking-widest font-bold hidden sm:block">View</span>
                   <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5" /></svg>
                 </div>
               </button>
               
               <div className="flex gap-3 sm:gap-4 w-full">
                  <button onClick={() => { startOver(); setCompareMode(false); }} className="flex-1 h-10 sm:h-12 border-2 border-stone-200 text-stone-600 rounded-xl font-bold uppercase tracking-widest text-[10px] sm:text-[11px] hover:border-stone-400 transition-colors">
                    Start Over
                  </button>
                  <button onClick={() => setShowImageModal(true)} className="flex-1 h-10 sm:h-12 bg-primary text-white rounded-xl font-bold uppercase tracking-widest text-[10px] sm:text-[11px] shadow-lg hover:bg-[#b8943f] transition-colors flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5" /></svg>
                    View Full
                  </button>
               </div>
            </div>
          )}

        </div>
      </div>

      </div>

      </div>

      {/* ── 3D Visualizer Promo Strip ───────────────────────── */}
      <div className="bg-stone-900 border-t border-stone-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')] animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="relative max-w-6xl mx-auto px-6 lg:px-10 py-8 md:py-10 flex flex-col sm:flex-row items-center justify-between gap-6">

          {/* Left */}
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center shrink-0">
              <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[11px] md:text-xs text-stone-500 uppercase tracking-widest font-bold">3D Powered</span>
              </div>
              <p className="text-xl md:text-2xl lg:text-3xl font-semibold text-white leading-tight">
                Drape any fabric on a 3D model — <span className="text-primary">in real time</span>
              </p>
            </div>
          </div>

          {/* Right */}
          <Link
            to="/3d-visualizer"
            className="shrink-0 flex items-center gap-3 px-10 py-4.5 md:px-12 md:py-5 bg-primary text-stone-900 text-xs md:text-sm uppercase font-bold tracking-[0.2em] hover:bg-white transition-all rounded-sm shadow-lg transform hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Try 3D Fabric Studio
          </Link>

        </div>
      </div>

      {isInventoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 mt-16 lg:mt-20">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setIsInventoryModalOpen(false)} />
          <div className="relative w-full max-w-2xl h-[85vh] sm:h-[80vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col uppercase">
            {/* Modal Body */}
            <div className="flex-1 overflow-hidden flex flex-col relative bg-white">
              <MaterialsInventory
                onBack={() => setIsInventoryModalOpen(false)}
                onSelectMaterial={(m) => {
                  handleSelectMaterial(m)
                  setIsInventoryModalOpen(false)
                }}
                selectedMaterialId={selectedMaterial?.id}
              />
            </div>
          </div>
        </div>
      )}

      {showLeadForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => !isGenerating && setShowLeadForm(false)} />
          <div className="relative w-full max-w-[340px] sm:max-w-[380px] bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col">

            {isGenerating ? (
              <div className="p-8 sm:p-10 flex flex-col items-center justify-center pb-10 sm:pb-12">
                <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-stone-100 border-t-primary rounded-full animate-spin mb-4 sm:mb-6" />
                <h3 className="text-xs sm:text-sm font-bold text-stone-800 tracking-wide uppercase mb-2">Creating Your Preview...</h3>
                <p className="text-[11px] sm:text-xs text-stone-500 text-center">Draping your chosen fabric beautifully over the sofa — this may take a moment.</p>
              </div>
            ) : generateError ? (
              <div className="p-8 sm:p-10 flex flex-col items-center justify-center pb-10 sm:pb-12 gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </div>
                <div className="text-center">
                  <h3 className="text-xs sm:text-sm font-bold text-stone-800 tracking-wide uppercase mb-1">Preview Failed</h3>
                  <p className="text-[11px] sm:text-xs text-red-500">{generateError}</p>
                </div>
                <button
                  onClick={() => { setGenerateError(null); setShowLeadForm(false) }}
                  className="px-6 py-2 bg-stone-900 text-white text-[11px] uppercase font-bold tracking-widest rounded-lg hover:bg-black transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
                  <div>
                    <h3 className="text-[12px] font-bold text-stone-800 uppercase tracking-widest">Almost There</h3>
                    <p className="text-[10px] text-stone-400 mt-0.5">Enter your details to get the preview</p>
                  </div>
                  <button onClick={() => setShowLeadForm(false)} className="text-stone-400 hover:text-stone-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                {/* Form */}
                <div className="p-6 flex flex-col gap-4">
                  {/* Full Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-stone-900">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-400 focus:bg-white transition-all font-medium"
                    />
                  </div>

                  {/* Mobile */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-stone-900">
                      Mobile Number <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">+91</span>
                      <input
                        type="tel"
                        value={mobileNumber}
                        onChange={(e) => {
                          setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))
                          setMobileError('')
                        }}
                        placeholder="00000 00000"
                        className={`w-full bg-stone-50 border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:bg-white transition-all font-medium tracking-widest ${
                          mobileError ? 'border-red-400 focus:border-red-400' : 'border-stone-200 focus:border-stone-400'
                        }`}
                      />
                    </div>
                    {mobileError && (
                      <p className="text-[10px] text-red-500 font-medium">{mobileError}</p>
                    )}
                  </div>

                  <button
                    onClick={handleLeadSubmit}
                    disabled={!fullName.trim() || mobileNumber.length < 10}
                    className="w-full h-12 bg-stone-900 text-white rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-lg hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-1 flex items-center justify-center gap-2 group"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    Generate My Preview
                    <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {showImageModal && generatedImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8">
          <div className="absolute inset-0 bg-stone-950/90 backdrop-blur-md" onClick={() => { setShowImageModal(false); setImgZoom(1) }} />
          <div className="relative w-full max-w-4xl flex flex-col">
            {/* Close button */}
            <button
              onClick={() => { setShowImageModal(false); setImgZoom(1) }}
              className="absolute -top-3 -right-3 z-10 w-9 h-9 rounded-full bg-white shadow-xl flex items-center justify-center hover:bg-stone-100 transition-colors"
            >
              <svg className="w-5 h-5 text-stone-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            {/* Full image with zoom */}
            <div
              className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-stone-900 flex items-center justify-center"
              style={{ maxHeight: '75vh' }}
              onWheel={(e) => {
                e.preventDefault()
                setImgZoom(z => Math.min(4, Math.max(1, z - e.deltaY * 0.001)))
              }}
            >
              <img
                src={generatedImage}
                alt="Generated render"
                className="object-contain transition-transform duration-150"
                style={{
                  maxHeight: '75vh',
                  width: '100%',
                  transform: `scale(${imgZoom})`,
                  transformOrigin: 'center center',
                  cursor: imgZoom > 1 ? 'zoom-out' : 'zoom-in',
                }}
                onClick={() => setImgZoom(z => z > 1 ? 1 : 2)}
              />
            </div>
            {/* Zoom controls */}
            <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-stone-900/80 backdrop-blur rounded-lg p-1 border border-white/10">
              <button
                onClick={() => setImgZoom(z => Math.max(1, +(z - 0.5).toFixed(1)))}
                disabled={imgZoom <= 1}
                className="w-7 h-7 flex items-center justify-center text-white hover:bg-white/10 rounded disabled:opacity-30 transition-colors text-lg leading-none"
                title="Zoom out"
              >−</button>
              <span className="text-[11px] text-stone-300 font-mono w-10 text-center select-none">{Math.round(imgZoom * 100)}%</span>
              <button
                onClick={() => setImgZoom(z => Math.min(4, +(z + 0.5).toFixed(1)))}
                disabled={imgZoom >= 4}
                className="w-7 h-7 flex items-center justify-center text-white hover:bg-white/10 rounded disabled:opacity-30 transition-colors text-lg leading-none"
                title="Zoom in"
              >+</button>
              {imgZoom > 1 && (
                <button
                  onClick={() => setImgZoom(1)}
                  className="w-7 h-7 flex items-center justify-center text-stone-400 hover:text-white hover:bg-white/10 rounded transition-colors ml-0.5"
                  title="Reset zoom"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4l16 16M4 20L20 4" /></svg>
                </button>
              )}
            </div>
            {/* Footer bar */}
            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img src={selectedMaterial?.textureUrl} className="w-9 h-9 rounded-lg object-cover border border-white/20 shadow-sm" alt="" />
                <div>
                  <p className="text-[10px] text-stone-400 uppercase tracking-widest">Fabric Applied</p>
                  <p className="text-xs font-bold text-white truncate max-w-[180px]">{selectedMaterial?.fabricName}</p>
                </div>
              </div>
              <button
                onClick={handleDownload}
                className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-primary text-stone-900 text-[11px] uppercase font-bold tracking-widest rounded-lg hover:bg-white transition-colors shadow-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fabric full-screen modal */}
      {showFabricModal && selectedMaterial && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8">
          <div className="absolute inset-0 bg-stone-950/90 backdrop-blur-md" onClick={() => setShowFabricModal(false)} />
          <div className="relative w-full max-w-xl flex flex-col">
            <button
              onClick={() => setShowFabricModal(false)}
              className="absolute -top-3 -right-3 z-10 w-9 h-9 rounded-full bg-white shadow-xl flex items-center justify-center hover:bg-stone-100 transition-colors"
            >
              <svg className="w-5 h-5 text-stone-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-stone-900">
              <img
                src={selectedMaterial.textureUrl}
                alt={selectedMaterial.fabricName}
                className="w-full object-contain"
                style={{ maxHeight: '70vh' }}
              />
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div>
                <p className="text-[10px] text-stone-400 uppercase tracking-widest">
                  {selectedMaterial.isCustom ? 'Custom Upload' : selectedMaterial.collectionName}
                </p>
                <p className="text-sm font-bold text-white">{selectedMaterial.fabricName}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AIVisualizerDesktop
