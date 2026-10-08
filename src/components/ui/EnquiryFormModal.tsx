import { useEffect, useId, useState, type ReactNode } from 'react'
import { parsePhoneNumberFromString } from 'libphonenumber-js/max'

const CONTACT_API = 'https://kcef1hkto8.execute-api.ap-south-1.amazonaws.com/stage/contact'

const isValidIndianMobile = (num: string) => {
  const phone = parsePhoneNumberFromString(num, 'IN')
  return !!phone && phone.isValid() &&
    (phone.getType() === 'MOBILE' || phone.getType() === 'FIXED_LINE_OR_MOBILE')
}

// 16px text keeps iOS Safari from zooming the page when a field is focused.
const inputClass =
  'w-full border border-stone-300 bg-white px-3.5 py-3 text-base text-color-secondary-dark placeholder:text-stone-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 transition'

function Field({ label, optional, htmlFor, children }: { label: string; optional?: boolean; htmlFor: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-color-secondary-dark">
        {label}
        {optional && <span className="ml-1.5 font-normal text-stone-400">(optional)</span>}
      </label>
      {children}
    </div>
  )
}

interface EnquiryFormModalProps {
  /** Small label above the title, e.g. "Request Catalog". */
  eyebrow: string
  title: string
  intro: ReactNode
  /** First segment of the lead message, e.g. "Catalog Request: Alaska". */
  subject: string
  successText: string
  onClose: () => void
}

/** Lead-capture modal (name / mobile / email / message) posting to the contact API.
 *  Handles its own Escape-to-close and background scroll lock. */
export default function EnquiryFormModal({ eyebrow, title, intro, subject, successText, onClose }: EnquiryFormModalProps) {
  const [submitted, setSubmitted] = useState(false)
  const [data, setData] = useState({ name: '', mobile: '', email: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const ids = useId()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const set = (key: keyof typeof data) => (e: { target: { value: string } }) => setData((d) => ({ ...d, [key]: e.target.value }))

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${ids}-title`}
        className="relative bg-white w-full max-w-md max-h-[92dvh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center text-stone-400 hover:text-color-secondary-dark hover:bg-stone-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {submitted ? (
          <div className="px-6 sm:px-8 py-12 text-center">
            <div className="w-14 h-14 mx-auto mb-5 flex items-center justify-center rounded-full bg-primary/15 text-primary">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h3 className="font-serif text-xl text-color-secondary-dark mb-2">Request sent</h3>
            <p className="text-sm text-color-secondary-dark/80 leading-relaxed max-w-xs mx-auto">{successText}</p>
            <button
              onClick={onClose}
              className="mt-8 w-full sm:w-auto px-10 py-3 bg-secondary-dark text-white text-sm font-semibold hover:bg-stone-800 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-6 sm:px-8 pt-7 pb-5 pr-14 border-b border-stone-100">
              <p className="text-xs font-semibold text-primary mb-1.5">{eyebrow}</p>
              <h3 id={`${ids}-title`} className="font-serif text-xl text-color-secondary-dark leading-snug">{title}</h3>
              <p className="mt-2 text-sm text-color-secondary-dark/75 leading-relaxed">{intro}</p>
            </div>

            <form
              className="px-6 sm:px-8 py-6 flex flex-col gap-4"
              onSubmit={async (e) => {
                e.preventDefault()
                if (!isValidIndianMobile(data.mobile)) {
                  setError('Please enter a valid mobile number.')
                  return
                }
                setLoading(true)
                setError(null)
                try {
                  const messageBody = [subject, data.message].filter(Boolean).join(' | ')
                  const res = await fetch(CONTACT_API, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      name: data.name,
                      mobile: data.mobile,
                      email: data.email || 'not provided',
                      message: messageBody,
                    }),
                  })
                  if (!res.ok) throw new Error('Something went wrong. Please try again.')
                  setSubmitted(true)
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
                } finally {
                  setLoading(false)
                }
              }}
            >
              <Field label="Your name" htmlFor={`${ids}-name`}>
                <input
                  id={`${ids}-name`}
                  required
                  type="text"
                  autoComplete="name"
                  value={data.name}
                  onChange={set('name')}
                  placeholder="Full name"
                  className={inputClass}
                />
              </Field>

              <Field label="Mobile number" htmlFor={`${ids}-mobile`}>
                <input
                  id={`${ids}-mobile`}
                  required
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  pattern="^[0-9\-\+\s]{10,15}$"
                  title="Please enter a valid mobile number (10-15 digits)"
                  value={data.mobile}
                  onChange={(e) => { set('mobile')(e); if (error) setError(null) }}
                  placeholder="98765 43210"
                  className={inputClass}
                />
              </Field>

              <Field label="Email" optional htmlFor={`${ids}-email`}>
                <input
                  id={`${ids}-email`}
                  type="email"
                  autoComplete="email"
                  value={data.email}
                  onChange={set('email')}
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </Field>

              <Field label="Message" optional htmlFor={`${ids}-message`}>
                <textarea
                  id={`${ids}-message`}
                  rows={3}
                  value={data.message}
                  onChange={set('message')}
                  placeholder="Anything you'd like us to know"
                  className={`${inputClass} resize-none`}
                />
              </Field>

              {error && (
                <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 px-3.5 py-2.5">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-1 w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-secondary-dark text-base font-semibold hover:bg-primary-dark transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading && <span className="w-4 h-4 border-2 border-secondary-dark/30 border-t-secondary-dark rounded-full animate-spin" />}
                {loading ? 'Sending…' : 'Send request'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
