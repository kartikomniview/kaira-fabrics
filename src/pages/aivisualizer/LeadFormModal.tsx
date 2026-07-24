import React from 'react'

// ── Feature flag: set to false to re-enable the OTP / generation flow ─────────
const isComingSoon = false

interface LeadFormModalProps {
  isGenerating: boolean
  generateError: string | null
  cyclingMsg: string
  mobileNumber: string
  setMobileNumber: (val: string) => void
  mobileError: string
  otpCode: string
  setOtpCode: (val: string) => void
  leadStep: 'mobile' | 'otp' | 'verified' | 'limit'
  remainingGenerations: number
  dailyLimit: number
  isKnownVerifiedNumber: boolean
  otpValidationEnabled: boolean
  sendingOtp: boolean
  verifyingOtp: boolean
  otpError: string
  onClose: () => void
  onDismissError: () => void
  onSendOtp: () => void
  onVerifyOtp: () => void
  onChangeMobile: () => void
  onGenerateVerified: () => void
  onUseAnotherNumber: () => void
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
  remainingGenerations,
  dailyLimit,
  isKnownVerifiedNumber,
  otpValidationEnabled,
  sendingOtp,
  verifyingOtp,
  otpError,
  onClose,
  onDismissError,
  onSendOtp,
  onVerifyOtp,
  onChangeMobile,
  onGenerateVerified,
  onUseAnotherNumber,
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
                  {leadStep === 'mobile' && 'Verify your mobile number to get the preview'}
                  {leadStep === 'otp' && 'Enter the code sent to your mobile'}
                  {leadStep === 'verified' && 'You are already verified'}
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
                  <label className="text-[10px] uppercase font-bold tracking-widest color-secondary-dark">
                    Mobile Number <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold color-secondary-dark">+91</span>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="00000 00000"
                      className={`w-full bg-stone-50 border pl-10 pr-4 py-3 text-sm focus:outline-none focus:bg-white transition-all font-medium tracking-widest ${mobileError || otpError ? 'border-red-400 focus:border-red-400' : 'border-stone-200 focus:border-stone-400'
                        }`}
                    />
                  </div>
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
                      {isKnownVerifiedNumber ? 'Continue' : otpValidationEnabled ? 'Send OTP' : 'Validate'}
                      <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </>
                  )}
                </button>
              </div>
            ) : leadStep === 'otp' ? (
              <div className="p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5 text-center">
                  <label className="text-[10px] uppercase font-bold tracking-widest color-secondary-dark">Enter Code</label>
                  <p className="text-[11px] color-secondary-dark mb-1">Sent to +91 {mobileNumber}</p>
                  <input
                    type="text"
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
                <button
                  onClick={onChangeMobile}
                  className="text-[10px] font-bold uppercase tracking-[0.2em] color-secondary-dark hover:text-primary transition-colors"
                >
                  Wrong number?
                </button>
              </div>
            ) : leadStep === 'verified' ? (
              <div className="p-6 flex flex-col gap-4 items-center text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-50 border border-green-200 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold color-secondary-dark tracking-wide uppercase mb-1">Number Verified</h3>
                  <p className="text-[11px] color-secondary-dark">+91 {mobileNumber}</p>
                  <p className="text-[11px] color-secondary-dark mt-2">
                    <span className="font-bold text-primary">{remainingGenerations}</span> of {dailyLimit} previews remaining today
                  </p>
                </div>

                <button
                  onClick={onGenerateVerified}
                  className="w-full h-12 bg-primary color-secondary-dark font-bold uppercase tracking-widest text-[11px] shadow-md hover:bg-primary/90 transition-all mt-1 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  Generate Preview
                </button>
                <button
                  onClick={onUseAnotherNumber}
                  className="text-[10px] font-bold uppercase tracking-[0.2em] color-secondary-dark hover:text-primary transition-colors"
                >
                  Not you? Use a different number
                </button>
              </div>
            ) : (
              <div className="p-6 flex flex-col gap-4 items-center text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-50 border border-amber-200 flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" /></svg>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold color-secondary-dark tracking-wide uppercase mb-1">Daily Limit Reached</h3>
                  <p className="text-[11px] color-secondary-dark">You've used all {dailyLimit} previews today with +91 {mobileNumber}.</p>
                  <p className="text-[11px] color-secondary-dark mt-1">Try a different mobile number, or come back tomorrow.</p>
                </div>

                <button
                  onClick={onUseAnotherNumber}
                  className="w-full h-12 bg-primary color-secondary-dark font-bold uppercase tracking-widest text-[11px] shadow-md hover:bg-primary/90 transition-all mt-1"
                >
                  Use Another Number
                </button>
              </div>
            )}
          </>
        )}

        {/* Invisible reCAPTCHA required by Firebase Phone Auth */}
        <div id="recaptcha-container" />
      </div>
    </div>
  )
}

export default LeadFormModal
