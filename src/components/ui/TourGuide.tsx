import { useCallback, useEffect, useRef, useState } from 'react'
import SectionLoader from './SectionLoader'

export interface TourStep {
  /** DOM id of the element this step points at. */
  id: string
  title: string
  subtitle: string
}

interface TourGuideProps {
  /** Unique key used to remember (in localStorage) whether this tour has been completed before. */
  tourId: string
  steps: TourStep[]
  /** Controls whether the tour is currently shown. */
  active: boolean
  /** Called once the tour ends — either finished or skipped. */
  onFinish: () => void
}

interface Rect { top: number; left: number; width: number; height: number }

const GAP = 14
const VIEWPORT_PADDING = 16
const LOADER_DELAY_MS = 3000

function seenKey(tourId: string) {
  return `kaira_tour_seen_${tourId}`
}

/**
 * Global spotlight-style walkthrough. Points at DOM elements by id, one step at a time.
 * The very first time a given `tourId` runs (nothing in localStorage yet) the Skip button
 * is hidden, so the visitor has to step through every stage via "Next". Once that tour has
 * been completed at least once, later runs show a small Skip link.
 */
const TourGuide = ({ tourId, steps, active, onFinish }: TourGuideProps) => {
  const [stepIndex, setStepIndex] = useState(0)
  const [targetRect, setTargetRect] = useState<Rect | null>(null)
  const [boxHeight, setBoxHeight] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const boxRef = useRef<HTMLDivElement>(null)
  const allowSkipRef = useRef(false)

  useEffect(() => {
    if (!active) return
    allowSkipRef.current = localStorage.getItem(seenKey(tourId)) === '1'
    setStepIndex(0)
    setIsLoading(true)
    const t = setTimeout(() => setIsLoading(false), LOADER_DELAY_MS)
    return () => clearTimeout(t)
  }, [active, tourId])

  const step = active ? steps[stepIndex] : undefined

  const measure = useCallback(() => {
    if (!step) return
    const el = document.getElementById(step.id)
    if (!el) { setTargetRect(null); return }
    const r = el.getBoundingClientRect()
    setTargetRect({ top: r.top, left: r.left, width: r.width, height: r.height })
  }, [step])

  useEffect(() => {
    if (!active || !step || isLoading) return
    const el = document.getElementById(step.id)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
    measure()
    const t = setTimeout(measure, 350)
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      clearTimeout(t)
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [active, step, isLoading, measure])

  useEffect(() => {
    if (boxRef.current) setBoxHeight(boxRef.current.offsetHeight)
  })

  useEffect(() => {
    if (!active) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prevOverflow }
  }, [active])

  if (!active || !step) return null

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <SectionLoader size="lg" />
      </div>
    )
  }

  const isLast = stepIndex === steps.length - 1
  const allowSkip = allowSkipRef.current

  const finish = () => {
    localStorage.setItem(seenKey(tourId), '1')
    onFinish()
  }

  const next = () => {
    if (isLast) { finish(); return }
    setStepIndex((i) => i + 1)
  }

  const boxWidth = Math.min(300, window.innerWidth - VIEWPORT_PADDING * 2)

  let boxTop: number
  let boxLeft: number
  if (targetRect) {
    const spaceBelow = window.innerHeight - (targetRect.top + targetRect.height)
    const placeAbove = spaceBelow < boxHeight + GAP && targetRect.top > boxHeight + GAP
    boxTop = placeAbove
      ? targetRect.top - boxHeight - GAP
      : targetRect.top + targetRect.height + GAP
    boxLeft = targetRect.left + targetRect.width / 2 - boxWidth / 2
    boxLeft = Math.min(Math.max(boxLeft, VIEWPORT_PADDING), window.innerWidth - boxWidth - VIEWPORT_PADDING)
    boxTop = Math.min(Math.max(boxTop, VIEWPORT_PADDING), window.innerHeight - boxHeight - VIEWPORT_PADDING)
  } else {
    boxTop = window.innerHeight / 2 - boxHeight / 2
    boxLeft = window.innerWidth / 2 - boxWidth / 2
  }

  return (
    <div className="fixed inset-0 z-[100]" onClick={(e) => e.stopPropagation()}>
      {/* Spotlight — cuts a highlighted "hole" out of a dark backdrop via box-shadow spread */}
      {targetRect ? (
        <div
          className="absolute rounded-none transition-all duration-300 ease-in-out"
          style={{
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
            boxShadow: '0 0 0 3px var(--color-primary), 0 0 0 9999px rgba(15,15,15,0.72)',
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-black/70" />
      )}

      {/* Tooltip */}
      <div
        ref={boxRef}
        className="absolute transition-[top,left] duration-300 ease-in-out bg-white"
        style={{ top: boxTop, left: boxLeft, width: boxWidth, animation: 'kaira-glow 2.2s ease-in-out infinite' }}
      >
        <div className="flex items-center justify-between px-4 pt-3.5">
          <span className="text-[9px] font-bold uppercase tracking-widest text-primary">
            Step {stepIndex + 1} / {steps.length}
          </span>
          {allowSkip && (
            <button
              onClick={finish}
              className="text-[9px] uppercase tracking-widest text-stone-400 hover:text-stone-600 transition-colors font-semibold px-1 py-0.5"
            >
              Skip
            </button>
          )}
        </div>
        <div className="px-4 pt-2 pb-4">
          <h3 className="text-[13px] font-bold color-secondary-dark uppercase tracking-wide leading-snug">{step.title}</h3>
          <p className="text-[11px] color-secondary-dark/70 leading-relaxed mt-1.5">{step.subtitle}</p>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-1">
              {steps.map((_, i) => (
                <span key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === stepIndex ? 'bg-primary' : 'bg-stone-200'}`} />
              ))}
            </div>
            <button
              onClick={next}
              className="flex items-center gap-1.5 h-8 px-4 bg-primary hover:bg-primary/90 color-secondary-dark transition-all text-[11px] font-bold uppercase tracking-widest shadow-sm"
            >
              {isLast ? 'Done' : 'Next'}
              {!isLast && (
                <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TourGuide
