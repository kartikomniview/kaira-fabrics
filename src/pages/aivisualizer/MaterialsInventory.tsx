import { useEffect, useMemo, useRef, useState } from 'react'
import { collections } from '../../data/collections'
import { newMaterials } from '../../data/newmaterials'

export const S3_THUMB = 'https://supoassets.s3.ap-south-1.amazonaws.com/public/textures/KairaFabrics'

// -- Material filter constants -------------------------------------------------
const materialTypeOptions = [
  'All',
  ...Array.from(new Set(newMaterials.map((m) => m.material_type).filter(Boolean))).sort(),
]
const allColorGroups = [
  'All',
  ...Array.from(new Set(newMaterials.map((m) => m.color_group).filter((v): v is string => !!v))).sort(),
]
const COLOR_SWATCH: Record<string, string> = {
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
      <mark className="bg-secondary/25 text-secondary rounded-[2px] px-[1px]">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  )
}

interface MaterialsInventoryProps {
  onBack: () => void;
  onSelectMaterial: (m: typeof newMaterials[0]) => void;
  selectedMaterialId?: string | number;
}

export const MaterialsInventory = ({ onBack, onSelectMaterial, selectedMaterialId }: MaterialsInventoryProps) => {
  const [activeMaterialType, setActiveMaterialType] = useState('All')
  const [activeCollection, setActiveCollection] = useState(collections[0]?.name || 'All')
  const [activeColorGroup, setActiveColorGroup] = useState('All')
  const [activePattern, setActivePattern] = useState('All')
  const [search, setSearch] = useState('')
  const [showColDropdown, setShowColDropdown] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [visibleCount, setVisibleCount] = useState(24)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const isSearchMode = search.trim().length > 0
  const PAGE_SIZE = 24

  // Auto-focus search on mount
  useEffect(() => {
    const t = setTimeout(() => searchInputRef.current?.focus(), 100)
    return () => clearTimeout(t)
  }, [])

  // Close collection dropdown on outside click
  useEffect(() => {
    if (!showColDropdown) return
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-col-dropdown]')) setShowColDropdown(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showColDropdown])

  const collectionsWithThumbs = useMemo(() => {
    return collections
      .filter(c => activeMaterialType === 'All' || c.category === activeMaterialType)
      .map(c => ({ name: c.name, thumb: c.image }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [activeMaterialType])

  // Global search — ignores all filters, searches across every material
  const filteredMaterials = useMemo(() => {
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      return newMaterials.filter((m) =>
        m.material_name?.toLowerCase().includes(q) ||
        m.collection_name?.toLowerCase().includes(q) ||
        m.material_code?.toLowerCase().includes(q) ||
        m.material_type?.toLowerCase().includes(q) ||
        m.color_group?.toLowerCase().includes(q) ||
        m.pattern?.toLowerCase().includes(q)
      )
    }
    // When not searching, apply all filters normally
    return newMaterials.filter((m) => {
      if (activeMaterialType !== 'All' && m.material_type !== activeMaterialType) return false
      if (activeCollection !== 'All' && m.collection_name !== activeCollection) return false
      if (activeColorGroup !== 'All' && m.color_group !== activeColorGroup) return false
      if (activePattern !== 'All' && m.pattern !== activePattern) return false
      return true
    })
  }, [activeMaterialType, activeCollection, activeColorGroup, activePattern, search])

  const activeFilterCount = [activeMaterialType, activeCollection, activeColorGroup, activePattern].filter((v) => v !== 'All').length

  // Reset activeCollection when material type changes (select first available in that type)
  useEffect(() => {
    const firstInType = collectionsWithThumbs[0]
    if (firstInType) {
      setActiveCollection(firstInType.name)
    } else {
      setActiveCollection('All')
    }
  }, [activeMaterialType, collectionsWithThumbs])

  // Reset pagination whenever filters or search change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [search, activeMaterialType, activeCollection, activeColorGroup, activePattern])

  const visibleMaterials = filteredMaterials.slice(0, visibleCount)
  const hasMore = visibleCount < filteredMaterials.length

  const clearInventoryFilters = () => {
    setActiveMaterialType('All')
    setActiveCollection('All')
    setActiveColorGroup('All')
    setActivePattern('All')
    setSearch('')
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in">
      {/* Sticky top bar */}
      <div className="shrink-0 bg-stone-50 border-b border-stone-100 px-4 sm:px-6 pt-4 sm:pt-5 pb-4 sm:pb-5 space-y-3.5 sm:space-y-4">

        {/* Title row */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <h2 className="text-sm sm:text-base font-bold text-stone-700 uppercase tracking-widest flex-1 px-1">Kaira Inventory</h2>
          <span className="text-xs sm:text-[11px] text-stone-400">{filteredMaterials.length} fabrics</span>
          {(activeFilterCount > 0 || isSearchMode) && (
            <button onClick={clearInventoryFilters} className="text-xs uppercase tracking-widest text-secondary hover:underline ml-2">
              Clear {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
            </button>
          )}
          <button 
            onClick={onBack} 
            className="ml-2 p-1 text-stone-400 hover:text-stone-800 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Prominent Search Bar */}
        <div
          className={`flex items-center gap-2.5 rounded-xl border transition-all duration-200 px-4 py-3 ${
            isSearchFocused
              ? 'border-secondary/60 bg-white shadow-md shadow-secondary/10 ring-1 ring-secondary/20'
              : isSearchMode
              ? 'border-secondary/30 bg-secondary/5'
              : 'border-stone-200 bg-white hover:border-stone-300'
          }`}
        >
          <svg className={`w-4 h-4 shrink-0 transition-colors ${isSearchFocused || isSearchMode ? 'text-secondary' : 'text-stone-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={searchInputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholder="Search by name, code, type, pattern, color..."
            className="flex-1 bg-transparent text-sm sm:text-sm focus:outline-none placeholder-stone-400 text-stone-700 min-w-0"
          />
          {isSearchMode && (
            <button
              onMouseDown={(e) => { e.preventDefault(); setSearch(''); searchInputRef.current?.focus() }}
              className="shrink-0 text-stone-400 hover:text-stone-600 transition-colors"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
            </button>
          )}
        </div>

        {/* Search mode: show compact tag strip instead of full filters */}
        {isSearchMode ? (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs uppercase tracking-widest text-stone-400 shrink-0">Results for</span>
            <span className="text-sm bg-secondary/10 text-secondary px-3 py-1 rounded-full font-bold">"{search.trim()}"</span>
            {activeFilterCount > 0 && (
              <span className="text-xs text-stone-400 font-medium">+ {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active</span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {/* Type Dropdown — first */}
            <div className="flex shrink-0">
              <select
                value={activeMaterialType}
                onChange={(e) => setActiveMaterialType(e.target.value)}
                className="bg-white border border-stone-200 text-xs sm:text-xs px-2.5 py-1.5 h-8 sm:h-9 rounded-lg focus:outline-none focus:border-secondary/60 text-stone-700 font-bold uppercase tracking-wider cursor-pointer max-w-[100px] sm:max-w-none"
              >
                <option value="All">Types</option>
                {materialTypeOptions.filter(t => t !== 'All').map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Collection Dropdown — filtered by selected type */}
            <div className="relative shrink-0 w-[120px] sm:w-[145px]" data-col-dropdown>
              <button
                onClick={() => setShowColDropdown(!showColDropdown)}
                className="w-full bg-white border border-stone-200 text-xs sm:text-xs px-3 py-1.5 h-8 sm:h-9 rounded-lg flex items-center justify-between hover:border-stone-300"
              >
                <span className="font-bold text-stone-700 uppercase tracking-wider truncate">
                  {activeCollection === 'All' ? 'Collections' : activeCollection}
                </span>
                <svg className={`w-3.5 h-3.5 text-stone-500 shrink-0 transition-transform ${showColDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </button>

              {showColDropdown && (
                <div className="absolute z-20 top-full left-0 mt-1 bg-white border border-stone-200 rounded-lg shadow-xl p-3 w-[260px] sm:w-[320px] max-h-72 overflow-y-auto">
                  <div className="grid grid-cols-3 gap-3">
                    <div
                      className="flex flex-col items-center gap-1.5 cursor-pointer group"
                      onClick={() => { setActiveCollection('All'); setShowColDropdown(false) }}
                    >
                      <div className={`w-full aspect-square rounded-lg border flex items-center justify-center transition-all ${activeCollection === 'All' ? 'border-secondary shadow-sm bg-secondary/5' : 'border-stone-200 bg-stone-50 group-hover:border-stone-300'}`}>
                        <span className="text-xs font-bold text-stone-500">ALL</span>
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-semibold text-stone-700 uppercase tracking-wider text-center w-full truncate">All</span>
                    </div>
                    {collectionsWithThumbs.map(c => {
                      const isActive = activeCollection === c.name
                      return (
                        <div
                          key={c.name}
                          className="flex flex-col items-center gap-1.5 cursor-pointer group"
                          onClick={() => { setActiveCollection(c.name); setShowColDropdown(false) }}
                        >
                          <div className={`w-full aspect-square rounded-lg overflow-hidden border transition-all ${isActive ? 'border-secondary ring-1 ring-secondary shadow-sm' : 'border-stone-200 group-hover:border-stone-300'}`}>
                            <img src={c.thumb} alt={c.name} className="w-full h-full object-cover" />
                          </div>
                          <span className="text-[9px] sm:text-[10px] font-semibold text-stone-700 uppercase tracking-wider text-center w-full truncate">{c.name}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Color Group Filter with Scroll Buttons */}
            <div className="flex-1 flex items-center min-w-0 gap-1 overflow-hidden relative group/scroll">
              <button 
                onClick={(e) => {
                  const el = e.currentTarget.nextElementSibling;
                  el?.scrollBy({ left: -100, behavior: 'smooth' });
                }}
                className="shrink-0 w-5 h-5 flex items-center justify-center bg-white border border-stone-200 rounded shadow-sm text-stone-400 hover:text-stone-600 z-10"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
              </button>

              <div className="flex-1 flex items-center gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-1">
                {allColorGroups.filter(c => c !== 'All').map((c) => {
                  const isActive = activeColorGroup === c
                  return (
                    <button
                      key={c}
                      onClick={() => setActiveColorGroup(isActive ? 'All' : c)}
                      title={c}
                      className={`relative shrink-0 flex items-center justify-center w-4 h-4 sm:w-[18px] sm:h-[18px] rounded-full transition-all ${
                        isActive ? 'ring-2 ring-offset-1 ring-secondary scale-110' : 'hover:scale-110 hover:ring-1 hover:ring-stone-300 ring-offset-1 z-10'
                      }`}
                    >
                      <span
                        className="absolute inset-0 rounded-full border border-stone-200 shadow-sm"
                        style={{ background: COLOR_SWATCH[c] ?? '#d0c8c0' }}
                      />
                    </button>
                  )
                })}
              </div>

              <button 
                onClick={(e) => {
                  const el = e.currentTarget.previousElementSibling;
                  el?.scrollBy({ left: 100, behavior: 'smooth' });
                }}
                className="shrink-0 w-5 h-5 flex items-center justify-center bg-white border border-stone-200 rounded shadow-sm text-stone-400 hover:text-stone-600 z-10"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        )}

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeMaterialType !== 'All' && (
              <span className="inline-flex items-center gap-1.5 bg-stone-900 text-white text-xs font-bold uppercase tracking-wider pl-3 pr-2 py-1.5 rounded-full shadow-sm">
                <span className="text-stone-400 mr-0.5">Type:</span>{activeMaterialType}
                <button
                  onClick={() => setActiveMaterialType('All')}
                  className="ml-0.5 w-4 h-4 flex items-center justify-center rounded-full bg-stone-700 hover:bg-stone-500 transition-colors shrink-0"
                  aria-label="Remove type filter"
                >
                  <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                </button>
              </span>
            )}
            {activeCollection !== 'All' && (
              <span className="inline-flex items-center gap-2.5 bg-stone-900 text-white text-xs font-bold uppercase tracking-wider pl-2 pr-2.5 py-2 rounded-full shadow-sm">
                {(() => {
                  const col = collections.find(c => c.name === activeCollection)
                  return col ? (
                    <img src={col.image} className="w-5.5 h-5.5 rounded-full object-cover border border-white/30" alt="" />
                  ) : (
                    <span className="text-stone-400 ml-1.5 mr-0.5">Col:</span>
                  )
                })()}
                <span>{activeCollection}</span>
                <button
                  onClick={() => setActiveCollection('All')}
                  className="ml-1 w-4.5 h-4.5 flex items-center justify-center rounded-full bg-stone-700 hover:bg-stone-500 transition-colors shrink-0"
                  aria-label="Remove collection filter"
                >
                  <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                </button>
              </span>
            )}
            {activeColorGroup !== 'All' && (
              <span className="inline-flex items-center gap-1.5 bg-stone-900 text-white text-xs font-bold uppercase tracking-wider pl-2.5 pr-2 py-1.5 rounded-full shadow-sm">
                <span
                  className="w-3 h-3 rounded-full border border-white/20 shrink-0"
                  style={{ background: COLOR_SWATCH[activeColorGroup] ?? '#d0c8c0' }}
                />
                {activeColorGroup}
                <button
                  onClick={() => setActiveColorGroup('All')}
                  className="ml-0.5 w-4 h-4 flex items-center justify-center rounded-full bg-stone-700 hover:bg-stone-500 transition-colors shrink-0"
                  aria-label="Remove color filter"
                >
                  <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                </button>
              </span>
            )}
            {activePattern !== 'All' && (
              <span className="inline-flex items-center gap-1.5 bg-stone-900 text-white text-xs font-bold uppercase tracking-wider pl-3 pr-2 py-1.5 rounded-full shadow-sm">
                <span className="text-stone-400 mr-0.5">Pattern:</span>{activePattern}
                <button
                  onClick={() => setActivePattern('All')}
                  className="ml-0.5 w-4 h-4 flex items-center justify-center rounded-full bg-stone-700 hover:bg-stone-500 transition-colors shrink-0"
                  aria-label="Remove pattern filter"
                >
                  <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-3 bg-stone-50">
        {filteredMaterials.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-center px-4">
            <svg className="w-8 h-8 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <p className="text-[12px] sm:text-[11px] text-stone-400 uppercase tracking-widest">No materials found</p>
            {isSearchMode ? (
              <p className="text-[11px] text-stone-400">
                No results for <span className="text-secondary font-semibold">"{search.trim()}"</span> — try a different keyword
              </p>
            ) : (
              <p className="text-[11px] text-stone-400">Adjust your filters or</p>
            )}
            <button
              onClick={clearInventoryFilters}
              className="text-[11px] text-secondary hover:underline uppercase tracking-widest font-semibold"
            >
              View all
            </button>
          </div>
        ) : (
          <>
          <div className={`grid gap-1.5 sm:gap-2 ${isSearchMode ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-4 sm:grid-cols-4'}`}>
            {visibleMaterials.map((m) => {
              const isActive = selectedMaterialId === m.id
              return (
                <button
                  key={m.id}
                  onClick={() => onSelectMaterial(m)}
                  className={`overflow-hidden rounded-lg border-2 relative transition-all ${
                    isSearchMode ? 'aspect-[4/5]' : 'aspect-square'
                  } ${
                    isActive ? 'border-secondary shadow-md scale-[1.03]' : 'border-transparent hover:border-stone-300'
                  }`}
                >
                  <img
                    src={`${S3_THUMB}/${m.collection_name}/${m.material_code}.webp`}
                    alt={`${m.collection_name} ${m.material_name}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* In search mode, always show label at bottom */}
                  {isSearchMode ? (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pt-5 pb-2.5 px-2">
                      <p className="text-[11px] text-white font-bold uppercase leading-tight truncate">
                        {highlight(m.collection_name ?? '', search.trim())}
                      </p>
                      <p className="text-[10px] text-white/70 mt-1 truncate">
                        {highlight(m.material_name ?? '', search.trim())}
                      </p>
                      {(m.material_type?.toLowerCase().includes(search.toLowerCase()) ||
                        m.color_group?.toLowerCase().includes(search.toLowerCase()) ||
                        m.pattern?.toLowerCase().includes(search.toLowerCase())) && (
                        <p className="text-[10px] text-secondary/80 mt-1 truncate">
                          {highlight(m.material_type ?? '', search.trim())} · {highlight(m.color_group ?? '', search.trim())}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex flex-col items-center justify-center transition-opacity p-2 text-center">
                      <span className="text-[11px] text-white font-bold uppercase leading-tight">{m.collection_name}</span>
                      <span className="text-[10px] text-white/70 mt-1">{m.material_name}</span>
                    </div>
                  )}
                  {isActive && (
                    <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-secondary rounded-full flex items-center justify-center">
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
          {hasMore && (
            <button
              onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
              className="mt-3 w-full py-2 rounded-xl border border-stone-200 bg-white text-[12px] sm:text-[11px] font-semibold uppercase tracking-widest text-stone-500 hover:border-secondary/40 hover:text-secondary transition-colors"
            >
              Load more ({filteredMaterials.length - visibleCount} remaining)
            </button>
          )}
          </>
        )}
      </div>
    </div>
  )
}
