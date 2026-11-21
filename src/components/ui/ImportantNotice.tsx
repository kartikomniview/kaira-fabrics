import { useEffect, useId } from 'react'
import AnimatedModal from './AnimatedModal'

/** "Important Notice" disclaimer: previews are for reference only, confirm by phone before ordering.
 *  Pair with hooks/useImportantNotice for the once-per-session open state. */
export default function ImportantNotice({ onClose }: { onClose: () => void }) {
  const titleId = useId()

  // Keep the page behind from scrolling while the notice is up
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  return (
    <AnimatedModal
      onClose={onClose}
      containerClassName="z-[90] p-4"
      backdropClassName="bg-stone-900/70 backdrop-blur-sm"
      panelClassName="w-full max-w-md max-h-[92dvh] overflow-y-auto bg-white shadow-2xl border border-stone-200"
    >
      {(requestClose) => (
        <div role="dialog" aria-modal="true" aria-labelledby={titleId}>
          {/* Header */}
          <div className="px-6 py-5 bg-secondary-dark flex items-center gap-3">
            <div className="w-9 h-9 shrink-0 flex items-center justify-center bg-primary/15 border border-primary/40 text-primary">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-primary mb-1">Please Note</p>
              <h3 id={titleId} className="font-serif text-xl text-white leading-tight">Important Notice</h3>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-6 flex flex-col gap-5">
            <ol className="flex flex-col gap-4">
              <li className="flex gap-3">
                <span className="w-6 h-6 shrink-0 flex items-center justify-center bg-stone-100 text-secondary-dark text-[11px] font-bold">1</span>
                <p className="text-sm text-secondary-dark leading-relaxed">
                  The 3D visualization and product previews are for reference purposes only. Actual product appearance may vary.
                </p>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 shrink-0 flex items-center justify-center bg-stone-100 text-secondary-dark text-[11px] font-bold">2</span>
                <p className="text-sm text-secondary-dark leading-relaxed">
                  Before finalizing any product or placing an order, please contact us at{' '}
                  <a href="tel:+918589925666" className="font-bold whitespace-nowrap underline decoration-primary decoration-2 underline-offset-2 hover:text-secondary">
                    858 99 25 666
                  </a>{' '}
                  for confirmation.
                </p>
              </li>
            </ol>

            <p className="text-center font-serif text-base text-secondary-dark border-t border-stone-200 pt-4">
              Thank you for choosing <span className="font-bold tracking-wide">KAIRA</span>
            </p>

            <button
              autoFocus
              onClick={requestClose}
              className="w-full h-12 flex items-center justify-center bg-primary text-secondary-dark text-xs uppercase font-bold tracking-widest hover:bg-primary-dark active:scale-[0.98] transition-all shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
            >
              I Understand
            </button>
          </div>
        </div>
      )}
    </AnimatedModal>
  )
}
