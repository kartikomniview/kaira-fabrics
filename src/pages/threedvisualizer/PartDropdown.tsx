import { useEffect, useMemo, useRef, useState } from 'react'
import { getPartOptions } from './MaterialSelector'

interface PartDropdownProps {
  productName?: string
  selectedPart: string
  onPartChange: (part: string) => void
  // Fired only for user picks, not the automatic fallback to "All"
  onUserSelect?: (part: string) => void
  disabled?: boolean
  /** Smaller variant for the mobile viewport */
  compact?: boolean
}

const PART_LABELS: Record<string, string> = {
  All: 'All Sofa parts',
  Back: 'Back Cushion',
  Seat: 'Seat Cushion',
  Base: 'Sofa Base',
}

export const partLabel = (part: string) => PART_LABELS[part] ?? part

const PartDropdown = ({ productName, selectedPart, onPartChange, onUserSelect, disabled = false, compact = false }: PartDropdownProps) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const options = useMemo(() => getPartOptions(productName), [productName])
  const hasChoices = options.length > 1

  // Fall back to "All" when the current part isn't offered for this product
  useEffect(() => {
    if (!options.includes(selectedPart)) onPartChange('All')
  }, [options, selectedPart])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  useEffect(() => {
    if (disabled) setOpen(false)
  }, [disabled])

  return (
    <div ref={ref} className="relative flex flex-col items-center gap-1">
      <span className="text-[9px] font-bold uppercase tracking-[0.2em] color-secondary-dark/50 select-none">
        Applying fabric on
      </span>

      {/* Options open upward since the dropdown sits at the bottom of the canvas */}
      {open && (
        <div className="absolute bottom-full mb-1 left-0 right-0 bg-white border border-secondary shadow-xl rounded-none py-1">
          {options.map((p) => {
            const isActive = selectedPart === p
            return (
              <button
                key={p}
                onClick={() => { onPartChange(p); onUserSelect?.(p); setOpen(false) }}
                className={`w-full text-left px-3 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors ${isActive
                  ? 'bg-stone-100 color-secondary-dark'
                  : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'
                  }`}
              >
                {partLabel(p)}
              </button>
            )
          })}
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        disabled={disabled || !hasChoices}
        className={`${compact ? 'min-w-[140px] h-8' : 'min-w-[180px] h-9'} px-3 flex items-center justify-between gap-3 bg-white border border-secondary hover:border-secondary-dark shadow-sm rounded-none transition-colors disabled:hover:border-secondary disabled:opacity-70`}
      >
        <span className="text-[11px] font-bold uppercase tracking-wider color-secondary-dark">{partLabel(selectedPart)}</span>
        {hasChoices && (
          <svg className={`w-3.5 h-3.5 color-secondary-dark/60 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
          </svg>
        )}
      </button>
    </div>
  )
}

export default PartDropdown
