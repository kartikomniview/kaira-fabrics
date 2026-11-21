import { useEffect, useId } from 'react'
import AnimatedModal from './AnimatedModal'

/** "Important Notice" disclaimer: previews are for reference only, confirm by phone before ordering.
 *  Pair with hooks/useImportantNotice for the open state (shown again after every refresh). */
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
                  <a
                    href="https://wa.me/918589925666"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Chat with us on WhatsApp at 858 99 25 666"
                    className="inline-flex items-center gap-1 align-bottom font-bold whitespace-nowrap underline decoration-primary decoration-2 underline-offset-2 hover:text-secondary"
                  >
                    {/* WhatsApp logo, so it's clear the number opens a chat rather than the dialer */}
                    <svg className="w-3.5 h-3.5 shrink-0 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    858 99 25 666
                  </a>{' '}
                  for color confirmation.
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
