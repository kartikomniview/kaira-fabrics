import React from 'react'

// ── Feature flag: set to false to re-enable the OTP / generation flow ─────────
const isComingSoon = false

/** Masks a 10-digit mobile number for display, e.g. "9876543210" -> "98••• •••10". */
const maskMobileNumber = (mobile: string) => {
  if (mobile.length !== 10) return mobile
  return `${mobile.slice(0, 2)}${'•'.repeat(3)} ${'•'.repeat(3)}${mobile.slice(-2)}`
}

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

interface LeadFormModalProps {
  isGenerating: boolean
  generateError: string | null
  cyclingMsg: string
  mobileNumber: string
  setMobileNumber: (val: string) => void
  mobileError: string
  otpCode: string
  setOtpCode: (val: string) => void
  leadStep: 'mobile' | 'otp' | 'limit'
  dailyLimit: number
  isKnownVerifiedNumber: boolean
  otpValidationEnabled: boolean
  sendingOtp: boolean
  verifyingOtp: boolean
  otpError: string
  /** Seconds left before another code can be requested; 0 = resend allowed */
  resendIn: number
  onClose: () => void
  onDismissError: () => void
  onSendOtp: () => void
  onVerifyOtp: () => void
  onResendOtp: () => void
  onChangeMobile: () => void
}

const LeadFormModal: React.FC<LeadFormModalProps> = ({
  isGenerating,
  generateError,
  cyclingMsg,
  mobileNumber,
  setMobileNumber,
  mobileError,
  otpCode,
  setOtpCode,
  leadStep,
  dailyLimit,
  isKnownVerifiedNumber,
  otpValidationEnabled,
  sendingOtp,
  verifyingOtp,
  otpError,
  resendIn,
  onClose,
  onDismissError,
  onSendOtp,
  onVerifyOtp,
  onResendOtp,
  onChangeMobile,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => !isGenerating && onClose()} />
      <div className="relative w-full max-w-[340px] sm:max-w-[380px] bg-white shadow-2xl border border-stone-200 overflow-hidden flex flex-col">

        {isComingSoon ? (
          <div className="p-8 sm:p-10 flex flex-col items-center justify-center pb-10 sm:pb-12 gap-4 text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 border border-primary/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l2.5 2.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-[0.2em] mb-2">Coming Soon</span>
              <h3 className="text-xs sm:text-sm font-bold color-secondary-dark tracking-wide uppercase mb-1">AI Preview Generation</h3>
              <p className="text-[11px] color-secondary-dark">We're putting the finishing touches on this feature. Check back soon!</p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-primary color-secondary-dark text-[11px] uppercase font-bold tracking-widest hover:bg-primary/90 transition-colors"
            >
              Got It
            </button>
          </div>
        ) : isGenerating ? (
          <div className="p-8 sm:p-10 flex flex-col items-center justify-center pb-10 sm:pb-12">
            <div className="w-10 h-10 rounded-full sm:w-12 sm:h-12 border-4 border-stone-100 border-t-primary animate-spin mb-4 sm:mb-6" />
            <h3 className="text-xs sm:text-sm font-bold color-secondary-dark tracking-wide uppercase mb-2">Creating Your Preview...</h3>
            <p
              key={cyclingMsg}
              className="text-[11px] sm:text-xs color-secondary-dark text-center transition-opacity duration-500 animate-[fadeInUp_0.5s_ease_forwards]"
            >
              {cyclingMsg}
            </p>
          </div>
        ) : generateError ? (
          <div className="p-8 sm:p-10 flex flex-col items-center justify-center pb-10 sm:pb-12 gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-50 border border-red-200 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </div>
            <div className="text-center">
              <h3 className="text-xs sm:text-sm font-bold color-secondary-dark tracking-wide uppercase mb-1">Preview Failed</h3>
              <p className="text-[11px] sm:text-xs text-red-500">{generateError}</p>
            </div>
            <button
              onClick={onDismissError}
              className="px-6 py-2 bg-primary color-secondary-dark text-[11px] uppercase font-bold tracking-widest hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-[#faf7f2]">
              <div>
                <h3 className="text-[12px] font-bold text-primary uppercase tracking-widest">Almost There</h3>
                <p className="text-[10px] color-secondary-dark mt-0.5">
                  {leadStep === 'mobile' && 'Verify your WhatsApp number to get the preview'}
                  {leadStep === 'otp' && 'Enter the code we sent you on WhatsApp'}
                  {leadStep === 'limit' && 'Daily preview limit reached'}
                </p>
              </div>
              <button onClick={onClose} className="color-secondary-dark hover:color-secondary-dark">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {leadStep === 'mobile' ? (
                                                     <div className="p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest color-secondary-dark">
                    <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
                    WhatsApp Number <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold color-secondary-dark">+91</span>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="WhatsApp number"
                      aria-label="WhatsApp number"
                      className={`w-full bg-stone-50 border pl-10 pr-10 py-3 text-sm focus:outline-none focus:bg-white transition-all font-medium tracking-widest ${mobileError || otpError ? 'border-red-400 focus:border-red-400' : 'border-stone-200 focus:border-stone-400'
                        }`}
                    />
                    <WhatsAppIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#25D366] pointer-events-none" />
                  </div>
                  <p className="text-[10px] color-secondary-dark">We'll send a verification code to this number on WhatsApp</p>
                  {(mobileError || otpError) && (
                    <p className="text-[10px] text-red-500 font-medium">{mobileError || otpError}</p>
                  )}
                </div>

                <button
                  onClick={onSendOtp}
                  disabled={mobileNumber.length < 10 || sendingOtp}
                  className="w-full h-12 bg-primary color-secondary-dark font-bold uppercase tracking-widest text-[11px] shadow-md hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-1 flex items-center justify-center gap-2 group"
                >
                  {sendingOtp ? (
                    <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  ) : (
                    <>
                      {isKnownVerifiedNumber ? 'Continue' : otpValidationEnabled ? 'Send OTP' : 'Generate'}
                      <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </>
                  )}
                </button>
              </div>
            ) : leadStep === 'otp' ? (
              <div className="p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5 text-center">
                  <label className="text-[10px] uppercase font-bold tracking-widest color-secondary-dark">Enter Code</label>
                  <p className="text-[11px] color-secondary-dark mb-1">Sent on WhatsApp to +91 {maskMobileNumber(mobileNumber)}</p>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="••••••"
                    className={`w-full bg-stone-50 border px-4 py-4 text-2xl font-bold tracking-[0.5em] text-center focus:outline-none focus:bg-white transition-all ${otpError ? 'border-red-400 focus:border-red-400' : 'border-stone-200 focus:border-stone-400'
                      }`}
                  />
                  {otpError && (
                    <p className="text-[10px] text-red-500 font-medium">{otpError}</p>
                  )}
                </div>

                <button
                  onClick={onVerifyOtp}
                  disabled={otpCode.length < 6 || verifyingOtp}
                  className="w-full h-12 bg-primary color-secondary-dark font-bold uppercase tracking-widest text-[11px] shadow-md hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-1 flex items-center justify-center gap-2 group"
                >
                  {verifyingOtp ? (
                    <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      Verify & Generate
                    </>
                  )}
                </button>
                <div className="flex items-center justify-between">
                  <button
                    onClick={onChangeMobile}
                    className="text-[10px] font-bold uppercase tracking-[0.2em] color-secondary-dark hover:text-primary transition-colors"
                  >
                    Wrong number?
                  </button>
                  <button
                    onClick={onResendOtp}
                    disabled={resendIn > 0 || sendingOtp}
                    className="text-[10px] font-bold uppercase tracking-[0.2em] color-secondary-dark hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendIn > 0 ? `Resend in 0:${String(resendIn).padStart(2, '0')}` : 'Resend code'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 flex flex-col gap-4 items-center text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-50 border border-amber-200 flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" /></svg>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold color-secondary-dark tracking-wide uppercase mb-1">Daily Limit Reached</h3>
                  <p className="text-[11px] color-secondary-dark">You've used all {dailyLimit} previews today with +91 {maskMobileNumber(mobileNumber)}.</p>
                  <p className="text-[11px] color-secondary-dark mt-1">Try a different mobile number, or come back tomorrow.</p>
                </div>

                <a
                  href="https://wa.me/918589925666"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-12 bg-primary color-secondary-dark font-bold uppercase tracking-widest text-[11px] shadow-md hover:bg-primary/90 transition-all mt-1 flex items-center justify-center"
                >
                  Contact Us
                </a>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  )
}

export default LeadFormModal
