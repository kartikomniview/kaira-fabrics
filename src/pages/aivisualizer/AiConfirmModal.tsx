import { useState } from 'react'
import AnimatedModal from '../../components/ui/AnimatedModal'
import type { PartFabric, SelectedMaterial, SelectedProduct } from './generateRender'

/** Max distinct fabrics (base + part overrides) the AI render reliably handles */
const MAX_AI_FABRICS = 2

/** Temporarily disabled — set back to true to re-enable the MAX_AI_FABRICS check */
const ENFORCE_AI_FABRIC_LIMIT = false

/** Distinct fabrics in a request: the base fabric plus any different part-override fabrics */
const countDistinctFabrics = (base: SelectedMaterial, partFabrics: PartFabric[]) =>
  new Set([base.id, ...partFabrics.map((pf) => pf.material.id)]).size

export interface AiConfirmRequest {
  material: SelectedMaterial
  product: SelectedProduct
  partFabrics: PartFabric[]
}

/** True when the request has more fabrics than the AI render allows — the modal must then show its warning. */
export const exceedsAiFabricLimit = (request: AiConfirmRequest) =>
  ENFORCE_AI_FABRIC_LIMIT && countDistinctFabrics(request.material, request.partFabrics) > MAX_AI_FABRICS

interface AiConfirmModalProps {
  request: AiConfirmRequest
  /** May return a promise; the Generate button shows progress until it settles */
  onConfirm: () => void | Promise<void>
  onClose: () => void
}

const AiConfirmModal = ({ request, onConfirm, onClose }: AiConfirmModalProps) => {
  const { product, partFabrics } = request
  const tooManyFabrics = exceedsAiFabricLimit(request)
  // onConfirm may wait on the generation-limit check; show progress so the click feels answered
  const [pending, setPending] = useState(false)

  const handleConfirm = async () => {
    setPending(true)
    try {
      await onConfirm()
    } finally {
      setPending(false)
    }
  }

  return (
    <AnimatedModal
      onClose={onClose}
      dismissible={!pending}
      panelClassName="w-full max-w-[340px] max-h-[calc(100vh-32px)] bg-white shadow-2xl border border-stone-200 flex flex-col overflow-hidden"
    >
      {(requestClose) => (
        <>
          <button
            onClick={requestClose}
            disabled={pending}
            aria-label="Close"
            className="absolute top-3 left-3 sm:left-auto sm:right-3 z-10 w-8 h-8 flex items-center justify-center bg-white border border-secondary text-secondary hover:bg-secondary hover:text-white transition-colors disabled:opacity-40"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="p-5 sm:p-6 pt-14 sm:pt-14 flex flex-col gap-4 overflow-y-auto">
            <div className="text-center">
              <h3 className="text-xs sm:text-sm font-bold color-secondary-dark tracking-wide uppercase mb-1">Visualize with AI</h3>
              <p className="text-[11px] color-secondary-dark/70">
                Generate a realistic AI render of <span className="font-bold">{product.productName}</span> with your selected fabric{partFabrics.length ? 's' : ''}.
              </p>
            </div>

            {tooManyFabrics && (
              <div className="border-l-4 border-red-400 bg-red-50 px-3 py-2.5">
                <p className="text-[11px] font-bold text-red-600">
                  AI generation is only allowed with {MAX_AI_FABRICS} fabric options.
                </p>
                <p className="text-[10px] text-red-500 mt-0.5">
                  Please reduce the number of different fabrics on the product and try again.
                </p>
              </div>
            )}

            <button
              onClick={handleConfirm}
              disabled={tooManyFabrics || pending}
              className="w-full h-12 flex items-center justify-center gap-2 bg-primary color-secondary-dark text-xs uppercase font-bold tracking-widest hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm disabled:opacity-40 disabled:pointer-events-none"
            >
              {pending ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-secondary-dark/30 border-t-secondary-dark animate-spin" />
                  Preparing…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate
                </>
              )}
            </button>
          </div>
        </>
      )}
    </AnimatedModal>
  )
}

export default AiConfirmModal
