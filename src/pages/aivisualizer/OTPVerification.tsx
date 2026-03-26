import React from 'react'

interface OTPVerificationProps {
  otpStep: number
  mobileNumber: string
  setMobileNumber: (val: string) => void
  otpCode: string
  setOtpCode: (val: string) => void
  onSendOTP: () => void
  onVerify: () => void
  onCancel: () => void
}

const OTPVerification: React.FC<OTPVerificationProps> = ({
  otpStep,
  mobileNumber,
  setMobileNumber,
  otpCode,
  setOtpCode,
  onSendOTP,
  onVerify,
  onCancel,
}) => {
  return (
    <div className="flex flex-col gap-6">
      {otpStep === 1 ? (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold tracking-widest text-stone-900">Mobile Number</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">+91</span>
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="00000 00000"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-stone-400 focus:bg-white transition-all font-medium tracking-widest"
              />
            </div>
            <p className="text-[10px] text-stone-400 mt-1">We'll send a 4-digit code to verify your request.</p>
          </div>
          <button
            onClick={onSendOTP}
            disabled={mobileNumber.length < 10}
            className="w-full h-12 bg-stone-900 text-white rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-lg hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-2"
          >
            Send Verification Code
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex flex-col gap-1.5 text-center">
            <label className="text-[10px] uppercase font-bold tracking-widest text-stone-900">Enter Code</label>
            <p className="text-[11px] text-stone-500 mb-2">Sent to +91 {mobileNumber}</p>
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="••••"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-4 text-2xl font-bold tracking-[1em] text-center focus:outline-none focus:border-stone-400 focus:bg-white transition-all"
            />
          </div>
          <button
            onClick={onVerify}
            disabled={otpCode.length < 4}
            className="w-full h-12 bg-primary text-stone-900 rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-lg hover:bg-stone-800 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Verify & Generate
          </button>
          <button
            onClick={() => onCancel()}
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 hover:text-stone-900 transition-colors"
          >
            Wrong number?
          </button>
        </div>
      )}
    </div>
  )
}

export default OTPVerification
