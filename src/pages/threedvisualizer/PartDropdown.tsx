import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import AnimatedModal from '../../components/ui/AnimatedModal'
import { getPartOptions } from './MaterialSelector'

interface PartDropdownProps {
  productName?: string
  selectedPart: string
  onPartChange: (part: string) => void
  // Fired only for user picks, not the automatic fallback to "All"
  onUserSelect?: (part: string) => void
  disabled?: boolean
  /** Mobile variant: smaller trigger, and options open as a centred dialog over the whole window (native-picker style) */
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

  // Outside-click close for the anchored desktop menu only; the mobile dialog has its own backdrop
  useEffect(() => {
    if (!open || compact) return
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, compact])

  useEffect(() => {
    if (disabled) setOpen(false)
  }, [disabled])

  // Nothing to choose between, so don't show the selector at all
  if (!hasChoices) return null

  return (
    <div ref={ref} className="relative flex flex-col items-center gap-1">
      <span className="text-[9px] font-bold uppercase tracking-[0.2em] color-secondary-dark/50 select-none">
        Applying fabric on
      </span>

      {/* Mobile: centred dialog, portalled so it covers the whole window above the viewer's stacking context */}
      {open && compact && createPortal(
        <AnimatedModal
          onClose={() => setOpen(false)}
          containerClassName="z-[60] p-6"
          backdropClassName="bg-stone-900/50"
          panelClassName="w-full max-w-xs bg-white shadow-2xl"
        >
          {(requestClose) => (
            <div role="dialog" aria-modal="true" aria-label="Applying fabric on">
              <p className="px-5 pt-4 pb-3 text-[10px] font-bold uppercase tracking-[0.2em] color-secondary-dark/60 border-b border-stone-200">
                Applying fabric on
              </p>
              <div className="py-1 max-h-[60vh] overflow-y-auto">
                {options.map((p) => {
                  const isActive = selectedPart === p
                  return (
                    <button
                      key={p}
                      onClick={() => { onPartChange(p); onUserSelect?.(p); requestClose() }}
                      style={{ touchAction: 'manipulation' }}
                      className={`w-full flex items-center justify-between gap-3 px-5 py-3.5 text-left text-[12px] font-bold uppercase tracking-wider transition-colors active:bg-stone-100 ${isActive ? 'color-secondary-dark' : 'text-stone-500'}`}
                    >
                      {partLabel(p)}
                      {/* Radio indicator, like a native picker */}
                      <span className={`w-4 h-4 shrink-0 rounded-full border-2 flex items-center justify-center ${isActive ? 'border-secondary' : 'border-stone-300'}`}>
                        {isActive && <span className="w-2 h-2 rounded-full bg-secondary" />}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </AnimatedModal>,
        document.body
      )}

      {/* Desktop: options open upward since the dropdown sits at the bottom of the canvas */}
      {open && !compact && (
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
        disabled={disabled}
        className={`${compact ? 'min-w-[140px] h-8' : 'min-w-[180px] h-9'} px-3 flex items-center justify-between gap-3 bg-white border border-secondary hover:border-secondary-dark shadow-sm rounded-none transition-colors disabled:hover:border-secondary disabled:opacity-70`}
      >
        <span className="text-[11px] font-bold uppercase tracking-wider color-secondary-dark">{partLabel(selectedPart)}</span>
        <svg className={`w-3.5 h-3.5 color-secondary-dark/60 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </div>
  )
}

export default PartDropdown
