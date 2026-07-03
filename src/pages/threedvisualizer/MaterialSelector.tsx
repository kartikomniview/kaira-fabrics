import { useEffect, useRef, useState, useMemo } from 'react'
import type { NewMaterial } from '../../data/newmaterials'
import { useMaterials } from '../../contexts/MaterialsContext'
import { categoryMeta, normalizeType } from '../../components/sections/FabricCategoriesSection'

export const S3_THUMB = 'https://kairafabrics.s3.ap-south-1.amazonaws.com/textures/KairaFabrics'

const COLOR_MAP: Record<string, string> = {
  Whites: '#f5f0eb', Creams: '#f2e9d0', Beiges: '#c9b49a', Browns: '#8b5a2b',
  Tans: '#d2b48c', Grays: '#8a8a8a', 'Light Grays': '#c4c4c4', 'Dark Grays': '#555555',
  Blacks: '#1c1c1c', Blues: '#3b6ea5', Navys: '#1b2f6b', Teals: '#19787d',
  Greens: '#2e7d32', Reds: '#c0392b', Oranges: '#e07020', Yellows: '#d4a017',
  Pinks: '#d4607a', Purples: '#7b3fa0', Mauves: '#9e7b9b', Coals: '#3c3c3c',
}

function highlight(text: string, query: string) {
  if (!query) return <>{text}</>
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-primary/30 color-secondary-dark rounded-none px-[1px]">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  )
}

export interface SelectedMaterial {
  id: number
  fabricName: string
  textureUrl: string
  roughness: number
  metalness: number
  collectionName: string
  materialCode: string
  materialType: string
  colorGroup: string | null
}

const PART_OPTIONS = ['All', 'Pillow', 'Base', 'Back', 'Seat']

interface MaterialSelectorProps {
  selectedId: number | null
  onSelect: (mat: SelectedMaterial) => void
  selectedPart?: string
  onPartChange?: (part: string) => void
  availableMeshNames?: string[]
  onToast?: (msg: string, type: 'success' | 'error') => void
  className?: string
  showPartFilter?: boolean
  onClose?: () => void
}

const PAGE_SIZE = 24

const MaterialSelector = ({ selectedId, onSelect, selectedPart, onPartChange, availableMeshNames = [], onToast, className, showPartFilter = true, onClose }: MaterialSelectorProps) => {
  const { newMaterials, collections, isLoading: materialsLoading, error: materialsError } = useMaterials()
  const colorScrollRef = useRef<HTMLDivElement>(null)
  const typeScrollRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const [activeMaterialType, setActiveMaterialType] = useState('All')
  const [activeCollection, setActiveCollection] = useState('Koral')
  const [activeColorGroup, setActiveColorGroup] = useState('All')
  const [activePattern, setActivePattern] = useState('All')
  const [search, setSearch] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [showColDropdown, setShowColDropdown] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  useEffect(() => {
    if (!showColDropdown) return
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-col-dropdown]')) setShowColDropdown(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showColDropdown])

  const showSearchDropdown = search.trim().length > 0

  useEffect(() => {
    if (!showSearchDropdown) return
    const handler = (e: MouseEvent) => {
      if (!searchContainerRef.current?.contains(e.target as Node)) setSearch('')
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showSearchDropdown])

  const collectionsWithThumbs = useMemo(() => {
    return collections
      .filter(c => activeMaterialType === 'All' || c.category === activeMaterialType)
      .map(c => ({ name: c.name, thumb: c.image }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [activeMaterialType, collections])

  // Only reset collection when switching type if the current collection doesn't belong to the new type
  useEffect(() => {
    if (activeMaterialType === 'All') return
    const compatible = collections.some(c => c.name === activeCollection && c.category === activeMaterialType)
    if (!compatible) {
      const first = collectionsWithThumbs[0]
      setActiveCollection(first ? first.name : 'All')
    }
  }, [activeMaterialType])

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [activeMaterialType, activeCollection, activeColorGroup, activePattern])

  const searchResults = useMemo(() => {
    if (!search.trim()) return []
    const q = search.trim().toLowerCase()
    return collections
      .filter(c => c.name.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 10)
  }, [search, collections])

  const scrollColors = (direction: 'left' | 'right') => {
    if (colorScrollRef.current) {
      colorScrollRef.current.scrollBy({ left: direction === 'left' ? -120 : 120, behavior: 'smooth' })
    }
  }

  const scrollTypes = (direction: 'left' | 'right') => {
    if (typeScrollRef.current) {
      typeScrollRef.current.scrollBy({ left: direction === 'left' ? -150 : 150, behavior: 'smooth' })
    }
  }

  const TYPE_ORDER = ['SUEDEFABRIC', 'LEATHERITE', 'SUEDELEATHER', 'CHENILLE', 'DIGITALPRINT']

  const materialTypeOptions = useMemo(() => [
    'All',
    ...Array.from(new Set(newMaterials.map(m => m.material_type).filter(Boolean))).sort((a, b) => {
      const ai = TYPE_ORDER.indexOf(normalizeType(a))
      const bi = TYPE_ORDER.indexOf(normalizeType(b))
      return (ai === -1 ? TYPE_ORDER.length : ai) - (bi === -1 ? TYPE_ORDER.length : bi)
    }),
  ], [newMaterials])

  const allColorGroups = useMemo(() => [
    'All',
    ...Array.from(new Set(newMaterials.map(m => m.color_group).filter((v): v is string => !!v))).sort(),
  ], [newMaterials])

  const filtered = useMemo(() => {
    const base = newMaterials.filter(m => !m.material_code?.includes('Normal') && !m.material_code?.includes('Roughness'))
    return base.filter(m => {
      if (activeMaterialType !== 'All' && m.material_type !== activeMaterialType) return false
      if (activeCollection !== 'All' && m.collection_name !== activeCollection) return false
      if (activeColorGroup !== 'All' && m.color_group !== activeColorGroup) return false
      if (activePattern !== 'All' && (m as any).pattern !== activePattern) return false
      return true
    }).sort((a, b) =>
      (a.material_code ?? '').localeCompare(b.material_code ?? '', undefined, { numeric: true, sensitivity: 'base' })
    )
  }, [newMaterials, activeMaterialType, activeCollection, activeColorGroup, activePattern])

  const visibleMaterials = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length
  const activeFilterCount = [activeCollection, activeColorGroup, activePattern].filter(v => v !== 'All').length

  const clearFilters = () => {
    setActiveMaterialType('All')
    setActiveCollection('All')
    setActiveColorGroup('All')
    setActivePattern('All')
    setSearch('')
  }

  const showToast = (msg: string, type: 'success' | 'error') => {
    onToast?.(msg, type)
  }

  const handlePartClick = (part: string) => {
    if (part === 'All') { onPartChange?.(part); return }
    const exists = availableMeshNames.length === 0 ||
      availableMeshNames.some(n => n.toLowerCase().includes(part.toLowerCase()))
    if (!exists) {
      showToast(`${part} not available`, 'error')
      return
    }
    onPartChange?.(part)
    showToast(`${part} selected`, 'success')
  }

  const handleSelect = (m: NewMaterial) => {
    onSelect({
      id: m.id,
      fabricName: `${m.collection_name} ${m.material_name}`,
      textureUrl: `${S3_THUMB}/${m.collection_name}/${m.material_code}.webp`,
      roughness: m.roughness ?? 0.5,
      metalness: m.metalness ?? 0,
      collectionName: m.collection_name,
      materialCode: m.material_code,
      materialType: m.material_type ?? '',
      colorGroup: m.color_group,
    })
  }

  const handleCollectionSearch = (c: { name: string; category: string; image: string }) => {
    setActiveMaterialType(c.category || 'All')
    setActiveCollection(c.name)
    setSearch('')
    setIsSearchFocused(false)
  }

  return (
    <div className={className ?? "w-[430px] xl:w-[490px] shrink-0 flex flex-col overflow-hidden bg-white rounded-none shadow-sm border border-stone-200/80"}>

      {/* Top bar */}
      <div className="shrink-0 bg-stone-50 border-b border-stone-200/80 px-4 pt-3 pb-3 space-y-2.5">

        {/* Title row */}
        <div className={`items-center gap-2 ${onClose ? 'flex' : 'hidden md:flex'}`}>
          <h2 className="text-[12px] font-bold color-secondary-dark uppercase tracking-widest flex-1">Kaira Inventory</h2>
          <span className="text-[11px] color-secondary-dark/60">{filtered.length} fabrics</span>
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="text-[11px] uppercase tracking-widest text-primary hover:underline ml-2 font-semibold">
              Clear ({activeFilterCount})
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="ml-1 p-1 color-secondary-dark/50 hover:color-secondary-dark transition-colors"
              aria-label="Close"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Search bar — collection search only */}
        <div ref={searchContainerRef} className="relative hidden md:block">
          <div
            className={`flex items-center gap-2 rounded-none border transition-all duration-200 px-3 py-2 ${
              isSearchFocused
                ? 'border-primary/60 bg-white shadow-md ring-1 ring-primary/20'
                : search.trim().length > 0
                  ? 'border-primary/30 bg-primary/5'
                  : 'border-stone-200 bg-white hover:border-stone-300'
            }`}
          >
            <svg className={`w-3.5 h-3.5 shrink-0 transition-colors ${isSearchFocused || search.trim().length > 0 ? 'text-primary' : 'color-secondary-dark/40'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              onKeyDown={(e) => { if (e.key === 'Escape') { setSearch(''); searchInputRef.current?.blur() } }}
              placeholder="Search collections…"
              className="flex-1 bg-transparent text-[11px] focus:outline-none placeholder-stone-400 color-secondary-dark min-w-0"
            />
            {search.trim().length > 0 && (
              <button
                onMouseDown={(e) => { e.preventDefault(); setSearch(''); searchInputRef.current?.focus() }}
                className="shrink-0 color-secondary-dark/40 hover:color-secondary-dark transition-colors"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
              </button>
            )}
          </div>

          {showSearchDropdown && (
            <div
              className="absolute z-30 top-full left-0 right-0 mt-0.5 bg-white border border-stone-200 shadow-xl rounded-none max-h-60 overflow-y-auto"
              onMouseDown={(e) => e.preventDefault()}
            >
              {searchResults.length > 0 ? searchResults.map(c => (
                <button
                  key={c.name}
                  onClick={() => handleCollectionSearch(c)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-stone-50 text-left transition-colors border-b border-stone-100 last:border-b-0"
                >
                  <img src={c.image} alt={c.name} className="w-8 h-8 object-cover border border-stone-200 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider color-secondary-dark truncate">
                      {highlight(c.name, search.trim())}
                    </p>
                    <p className="text-[9px] text-stone-400 uppercase tracking-widest">{c.category}</p>
                  </div>
                  <svg className="w-3 h-3 text-stone-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )) : (
                <div className="px-3 py-3 text-[11px] text-stone-400 text-center uppercase tracking-widest">No collections found</div>
              )}
            </div>
          )}
        </div>

        {/* Part chips */}
        {showPartFilter && (
          <div className="flex items-center gap-1.5">
            <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest color-secondary-dark/50 pr-0.5">Part</span>
            {PART_OPTIONS.map(p => {
              const isActive = selectedPart === p
              return (
                <button
                  key={p}
                  onClick={() => handlePartClick(p)}
                  className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-none border transition-all ${
                    isActive
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400 hover:text-stone-700'
                  }`}
                >
                  {p}
                </button>
              )
            })}
          </div>
        )}

        {/* Type chips */}
        <div className="flex items-center gap-1 overflow-hidden">
          <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest color-secondary-dark/50 pr-0.5">Type</span>
          <button
            onClick={() => scrollTypes('left')}
            className="shrink-0 w-5 h-5 flex items-center justify-center bg-white border border-stone-200 rounded-none shadow-sm color-secondary-dark/40 hover:color-secondary-dark"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div
            ref={typeScrollRef}
            className="flex-1 flex items-center gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-0.5"
          >
            {materialTypeOptions.map(t => {
              const isActive = activeMaterialType === t
              return (
                <button
                  key={t}
                  onClick={() => setActiveMaterialType(t)}
                  className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-none border transition-all ${
                    isActive
                      ? 'bg-secondary-dark text-white border-secondary-dark'
                      : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400 hover:text-stone-700'
                  }`}
                >
                  {t === 'All' ? t : categoryMeta[normalizeType(t)]?.label ?? t}
                </button>
              )
            })}
          </div>
          <button
            onClick={() => scrollTypes('right')}
            className="shrink-0 w-5 h-5 flex items-center justify-center bg-white border border-stone-200 rounded-none shadow-sm color-secondary-dark/40 hover:color-secondary-dark"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        {/* Collection dropdown + color swatches */}
        <div className="flex items-center gap-2">
          <div className="relative shrink-0 w-[160px]" data-col-dropdown>
            <span className="absolute -top-1 left-2 z-10 bg-stone-50 px-1 text-[8px] font-bold text-primary uppercase tracking-wider leading-none">Collections</span>
            <button
              onClick={() => setShowColDropdown(!showColDropdown)}
              className="w-full bg-white border border-primary text-[11px] px-2.5 py-1 h-7 rounded-none flex items-center justify-between hover:border-primary/70"
            >
              <span className="font-semibold text-primary uppercase tracking-wider truncate">
                {activeCollection === 'All' ? 'Collections' : activeCollection}
              </span>
              <svg className={`w-3 h-3 text-stone-500 shrink-0 transition-transform ${showColDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </button>

            {showColDropdown && (
              <div className="absolute z-20 top-full left-0 mt-1 bg-white border border-stone-200 rounded-none shadow-xl p-3 w-[300px] max-h-72 overflow-y-auto">
                <div className="grid grid-cols-3 gap-3">
                  <div
                    className="flex flex-col items-center gap-1.5 cursor-pointer group"
                    onClick={() => { setActiveCollection('All'); setShowColDropdown(false) }}
                  >
                    <div className={`w-full aspect-square rounded-none border flex items-center justify-center transition-all ${activeCollection === 'All' ? 'border-primary shadow-sm bg-primary/5' : 'border-stone-200 bg-stone-50 group-hover:border-stone-300'}`}>
                      <span className="text-xs font-bold color-secondary-dark/50">ALL</span>
                    </div>
                    <span className="text-[10px] font-semibold color-secondary-dark uppercase tracking-wider text-center w-full truncate">All</span>
                  </div>
                  {collectionsWithThumbs.map(c => {
                    const isActive = activeCollection === c.name
                    return (
                      <div
                        key={c.name}
                        className="flex flex-col items-center gap-1.5 cursor-pointer group"
                        onClick={() => { setActiveCollection(c.name); setShowColDropdown(false) }}
                      >
                        <div className={`w-full aspect-square rounded-none overflow-hidden border transition-all ${isActive ? 'border-primary ring-1 ring-primary shadow-sm' : 'border-stone-200 group-hover:border-stone-300'}`}>
                          <img src={c.thumb} alt={c.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[10px] font-semibold color-secondary-dark uppercase tracking-wider text-center w-full truncate">{c.name}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Color swatches with scroll */}
          <div className="flex-1 flex items-center min-w-0 gap-1 overflow-hidden">
            <button
              onClick={() => scrollColors('left')}
              className="shrink-0 w-5 h-5 flex items-center justify-center bg-white border border-stone-200 rounded-none shadow-sm color-secondary-dark/40 hover:color-secondary-dark"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div
              ref={colorScrollRef}
              className="flex-1 flex items-center gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-1"
            >
              {allColorGroups.map((c) => {
                const isActive = activeColorGroup === c
                return (
                  <button
                    key={c}
                    onClick={() => setActiveColorGroup(c)}
                    title={c}
                    className={`relative shrink-0 flex items-center justify-center w-[18px] h-[18px] rounded-none transition-all ${isActive ? 'ring-2 ring-offset-1 ring-primary scale-110' : 'hover:scale-110 hover:ring-1 hover:ring-stone-300 ring-offset-1'}`}
                  >
                    <span
                      className="absolute inset-0 rounded-none border border-stone-200 shadow-sm"
                      style={{ background: c === 'All' ? 'linear-gradient(135deg,#f5f0eb,#8b5a2b,#1c1c1c)' : (COLOR_MAP[c] ?? '#d0c8c0') }}
                    />
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => scrollColors('right')}
              className="shrink-0 w-5 h-5 flex items-center justify-center bg-white border border-stone-200 rounded-none shadow-sm color-secondary-dark/40 hover:color-secondary-dark"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>

      </div>

      {/* Materials grid */}
      <div className="flex-1 overflow-y-auto p-3 bg-stone-50">
        {materialsLoading ? (
          <div className="grid grid-cols-4 md:grid-cols-3 xl:grid-cols-4 gap-2">
            {Array.from({ length: 16 }, (_, i) => (
              <div key={i} className="relative aspect-square rounded-none bg-stone-100 overflow-hidden border border-stone-200" aria-hidden="true">
                <div
                  className="absolute inset-0 -translate-x-full"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)',
                    animation: `kaira-shimmer 1.6s ease-in-out ${i * 0.05}s infinite`,
                  }}
                />
              </div>
            ))}
          </div>
        ) : materialsError ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-center px-4 py-10">
            <svg className="w-8 h-8 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
            <p className="text-[11px] text-stone-400 uppercase tracking-widest">Failed to load materials</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-center px-4 py-10">
            <svg className="w-8 h-8 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <p className="text-[11px] text-stone-400 uppercase tracking-widest">No materials found</p>
            <p className="text-[9px] text-stone-400">Adjust your filters or</p>
            <button onClick={clearFilters} className="text-[9px] text-primary hover:underline uppercase tracking-widest font-semibold">View all</button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-4 md:grid-cols-3 xl:grid-cols-4 gap-2">
              {visibleMaterials.map((m) => {
                const isActive = selectedId === m.id
                return (
                  <button
                    key={m.id}
                    onClick={() => handleSelect(m)}
                    className={`overflow-hidden rounded-none border-2 relative aspect-square transition-all ${isActive ? 'border-primary shadow-md scale-[1.03]' : 'border-transparent hover:border-stone-300'}`}
                  >
                    <img
                      src={`${S3_THUMB}/${m.collection_name}/${m.material_code}.webp`}
                      alt={`${m.collection_name} ${m.material_name}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        const el = e.currentTarget as HTMLImageElement
                        el.style.display = 'none'
                        if (el.parentElement) el.parentElement.style.backgroundColor = '#f5f5f4'
                      }}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex flex-col items-center justify-center transition-opacity p-1 text-center">
                      <span className="text-[10px] text-white font-bold uppercase leading-tight">{m.collection_name}</span>
                      <span className="text-[9px] text-white/70 mt-0.5">{m.material_name}</span>
                    </div>
                    {isActive && (
                      <div className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-none flex items-center justify-center shadow-sm">
                        <svg className="w-2.5 h-2.5 color-secondary-dark" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
            {hasMore && (
              <button
                onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                className="mt-3 w-full py-2 rounded-none border border-stone-200 bg-white text-[12px] font-semibold uppercase tracking-widest color-secondary-dark/40 hover:border-primary/40 hover:color-secondary-dark transition-all active:scale-[0.98]"
              >
                Load more ({filtered.length - visibleCount} remaining)
              </button>
            )}
          </>
        )}
      </div>

    </div>
  )
}

export default MaterialSelector
