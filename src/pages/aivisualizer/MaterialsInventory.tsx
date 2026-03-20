import { useMemo, useState } from 'react'
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

interface MaterialsInventoryProps {
  onBack: () => void;
  onSelectMaterial: (m: typeof newMaterials[0]) => void;
  selectedMaterialId?: string | number;
}

export const MaterialsInventory = ({ onBack, onSelectMaterial, selectedMaterialId }: MaterialsInventoryProps) => {
  const [activeMaterialType, setActiveMaterialType] = useState('All')
  const [activeCollection, setActiveCollection] = useState('All')
  const [activeColorGroup, setActiveColorGroup] = useState('All')
  const [activePattern, setActivePattern] = useState('All')
  const [search, setSearch] = useState('')
  const [showColDropdown, setShowColDropdown] = useState(false)
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)

  const collectionsWithThumbs = useMemo(() => {
    return collections.map(c => ({
      name: c.name,
      thumb: c.image
    })).sort((a, b) => a.name.localeCompare(b.name))
  }, [])

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

  return (
    <div className="flex flex-col h-full -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 animate-in fade-in">
      {/* Sticky top bar */}
      <div className="shrink-0 bg-white border-b border-stone-100 px-3 sm:px-4 pt-3 sm:pt-4 pb-3 sm:pb-4 space-y-3 sm:space-y-4">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button onClick={onBack} className="p-1 sm:p-1.5 border border-stone-200 rounded-lg text-stone-500 hover:bg-stone-50 text-[10px]">←</button>
          <h2 className="text-[10px] sm:text-[11px] font-bold text-stone-700 uppercase tracking-widest flex-1">Kaira Inventory</h2>
          <span className="text-[9px] sm:text-[10px] text-stone-400">{filteredMaterials.length} fabrics</span>
          {activeFilterCount > 0 && (
            <button onClick={clearInventoryFilters} className="text-[9px] uppercase tracking-widest text-primary hover:underline">
              Clear ({activeFilterCount})
            </button>
          )}
        </div>

        {/* Collection Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowColDropdown(!showColDropdown)}
            className="w-full bg-white border border-stone-200 text-[10px] sm:text-[11px] px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg flex items-center justify-between hover:border-stone-300"
          >
            <span className="font-semibold text-stone-700 uppercase tracking-wider">
              {activeCollection === 'All' ? 'All Collections' : activeCollection}
            </span>
            <svg className={`w-3 h-3 text-stone-500 transition-transform ${showColDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          
          {showColDropdown && (
            <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-stone-200 rounded-lg shadow-xl p-3 max-h-72 overflow-y-auto">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                <div 
                  className="flex flex-col items-center gap-1.5 cursor-pointer group"
                  onClick={() => { setActiveCollection('All'); setShowColDropdown(false); }}
                >
                  <div className={`w-full aspect-square rounded-lg border flex items-center justify-center transition-all ${activeCollection === 'All' ? 'border-primary shadow-sm bg-primary/5' : 'border-stone-200 bg-stone-50 group-hover:border-stone-300'}`}>
                    <span className="text-xs font-bold text-stone-500">ALL</span>
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-semibold text-stone-700 uppercase tracking-wider text-center w-full truncate">All Collections</span>
                </div>
                {collectionsWithThumbs.map(c => {
                  const isActive = activeCollection === c.name;
                  return (
                    <div 
                      key={c.name}
                      className="flex flex-col items-center gap-1.5 cursor-pointer group"
                      onClick={() => { setActiveCollection(c.name); setShowColDropdown(false); }}
                    >
                      <div className={`w-full aspect-square rounded-lg overflow-hidden border transition-all ${isActive ? 'border-primary ring-1 ring-primary shadow-sm' : 'border-stone-200 group-hover:border-stone-300'}`}>
                        <img src={c.thumb} alt={c.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-semibold text-stone-700 uppercase tracking-wider text-center w-full truncate">{c.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Row: Search + Type Dropdown + Color Group Filter */}
        <div className="flex items-center gap-2">
          
          {/* Expandable Search */}
          <div className={`flex items-center bg-stone-50 border border-stone-200 rounded-lg transition-all duration-300 ${isSearchExpanded ? 'w-1/2 px-2.5 flex-none' : 'w-8 px-0 justify-center shrink-0'} h-7 sm:h-8`}>
            <button onClick={() => setIsSearchExpanded(!isSearchExpanded)} className="text-stone-500 hover:text-stone-800">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
            {isSearchExpanded && (
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full bg-transparent text-[10px] sm:text-[11px] ml-2 focus:outline-none placeholder-stone-400"
                autoFocus
              />
            )}
          </div>

          <div className="flex shrink-0">
            <select
              value={activeMaterialType}
              onChange={(e) => setActiveMaterialType(e.target.value)}
              className="bg-white border border-stone-200 text-[10px] sm:text-[11px] px-2 py-1 h-7 sm:h-8 rounded-lg focus:outline-none focus:border-primary/60 text-stone-700 font-semibold uppercase tracking-wider cursor-pointer"
            >
              <option value="All">All Types</option>
              {materialTypeOptions.filter(t => t !== 'All').map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 flex items-center gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pl-1 pr-1 py-1 relative">
            {allColorGroups.map((c) => {
              const isActive = activeColorGroup === c
              return (
                <button
                  key={c}
                  onClick={() => setActiveColorGroup(c)}
                  title={c}
                  className={`relative shrink-0 flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full transition-all ${
                    isActive ? 'ring-2 ring-offset-1 ring-primary scale-110' : 'hover:scale-110 hover:ring-1 hover:ring-stone-300 ring-offset-1 z-10'
                  }`}
                >
                  <span
                    className="absolute inset-0 rounded-full border border-stone-200 shadow-sm"
                    style={{ background: c === 'All' ? 'linear-gradient(135deg,#f5f0eb,#8b5a2b,#1c1c1c)' : (COLOR_SWATCH[c] ?? '#d0c8c0') }}
                  />
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-3 bg-stone-50">
        {filteredMaterials.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[10px] sm:text-[11px] text-stone-400 uppercase tracking-widest">No fabrics found</div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 sm:gap-2">
            {filteredMaterials.map((m) => {
              const isActive = selectedMaterialId === m.id
              return (
                <button
                  key={m.id}
                  onClick={() => onSelectMaterial(m)}
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
  )
}
