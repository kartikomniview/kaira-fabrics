import { useEffect, useState } from 'react'
import { generateRender, overlayLogo, logCachedRender, fetchGenerationLimit, buildBadges, buildVariantKey, OTP_REQUIRED_ERROR } from './generateRender'
import type { SelectedMaterial, SelectedProduct, PartFabric, GenerationLimitInfo } from './generateRender'
import { findCachedRender } from './renderCache'
import { sendOtp, verifyOtp } from '../../lib/phoneAuth'
import { isVerified, markVerified, clearVerified } from '../../lib/renderLimit'
import { parsePhoneNumberFromString } from 'libphonenumber-js/max'

export const LOADING_MESSAGES = [
  "Matching the texture and colour just right...",
  "Almost there adding the finishing touches...",
  "Giving your sofa a fresh new look...",
  "Blending the fabric into the scene...",
  "Checking every detail before the reveal...",
  "Your preview is coming together nicely...",
  "Just a few more seconds...",
]

// ── Feature flag: WhatsApp OTP verification via the Lambda (/otp/send, /otp/verify) ────────
export const OTP_VALIDATION_ENABLED = true

const isValidIndianMobile = (num: string) => {
  const phone = parsePhoneNumberFromString(num, 'IN')
  return !!phone && phone.isValid() &&
    (phone.getType() === 'MOBILE' || phone.getType() === 'FIXED_LINE_OR_MOBILE')
}

// ── Feature flag: set to true to re-enable the daily generation limit per mobile number ─────
const IS_GENERATE_LIMITED = true

// ── UI fallback while the server-reported limit hasn't loaded yet / on fetch failure ────────
export const DEFAULT_GENERATION_LIMIT = 4

// ── Minimum time the loader stays visible for a cached (instant) render, so it doesn't flash ─
const MIN_CACHED_LOADER_MS = 8000

/**
 * Shared lead-capture + AI render generation flow (OTP verification, daily limit, generation,
 * result). Used by the full AI Studio wizard and by "Visualize with AI" shortcuts elsewhere
 * (e.g. the 3D Studio) that already have a fabric + product selected.
 */
export function useAiGenerationFlow(onGenerated?: () => void) {
  const [selectedMaterial, setSelectedMaterial] = useState<SelectedMaterial | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<SelectedProduct | null>(null)
  // Per-part fabric overrides (3D Studio); kept in state so they survive the OTP step
  const [selectedPartFabrics, setSelectedPartFabrics] = useState<PartFabric[]>([])

  const [showLeadForm, setShowLeadForm] = useState(false)
  const [mobileNumber, setMobileNumber] = useState(() => localStorage.getItem('kaira_lead_mobile') ?? '')
  const [mobileError, setMobileError] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [leadStep, setLeadStep] = useState<'mobile' | 'otp' | 'limit'>('mobile')
  const [sendingOtp, setSendingOtp] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [resendIn, setResendIn] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [cyclingMsg, setCyclingMsg] = useState(LOADING_MESSAGES[0])
  const [limitInfo, setLimitInfo] = useState<GenerationLimitInfo | null>(null)
  const [showImageModal, setShowImageModal] = useState(false)
  const [imgZoom, setImgZoom] = useState(1)

  const checkGenerationLimit = async (mobile: string): Promise<GenerationLimitInfo> => {
    if (!IS_GENERATE_LIMITED) {
      const info = { limit: DEFAULT_GENERATION_LIMIT, used: 0, remaining: DEFAULT_GENERATION_LIMIT }
      setLimitInfo(info)
      return info
    }
    try {
      const info = await fetchGenerationLimit(mobile)
      setLimitInfo(info)
      return info
    } catch {
      // fail-open: don't block a real customer over a network blip
      const info = { limit: DEFAULT_GENERATION_LIMIT, used: 0, remaining: DEFAULT_GENERATION_LIMIT }
      setLimitInfo(info)
      return info
    }
  }

  useEffect(() => {
    const cleaned = mobileNumber.replace(/\D/g, '').slice(0, 10)
    if (cleaned.length === 10 && isVerified(cleaned)) {
      checkGenerationLimit(cleaned)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobileNumber])

  // Resend-code countdown
  useEffect(() => {
    if (resendIn <= 0) return
    const id = setTimeout(() => setResendIn((s) => s - 1), 1000)
    return () => clearTimeout(id)
  }, [resendIn])

  useEffect(() => {
    if (!isGenerating) { setCyclingMsg(LOADING_MESSAGES[0]); return }
    let idx = 0
    const id = setInterval(() => {
      if (idx < LOADING_MESSAGES.length - 1) {
        idx += 1
        setCyclingMsg(LOADING_MESSAGES[idx])
      }
    }, 3000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGenerating])

  const handleGenerate = async (
    mobile: string,
    name: string,
    materialOverride?: SelectedMaterial,
    productOverride?: SelectedProduct,
    partFabricsOverride?: PartFabric[],
  ) => {
    const material = materialOverride ?? selectedMaterial
    const product = productOverride ?? selectedProduct
    const partFabrics = partFabricsOverride ?? selectedPartFabrics
    if (!material || !product) return
    setGenerateError(null)

    const cacheEligible = !material.isCustom && !product.isCustom && !!material.materialCode &&
      partFabrics.every((pf) => !pf.material.isCustom && !!pf.material.materialCode)

    if (cacheEligible) {
      const startedAt = Date.now()
      setIsGenerating(true)
      const cachedUrl = await findCachedRender(material.collectionName, material.materialCode!, product.productName, buildVariantKey(partFabrics))
      if (cachedUrl) {
        const watermarked = await overlayLogo(cachedUrl, '/images/kaira.webp', buildBadges(material, partFabrics))
        const elapsed = Date.now() - startedAt
        const remaining = MIN_CACHED_LOADER_MS - elapsed
        if (remaining > 0) {
          await new Promise((resolve) => setTimeout(resolve, remaining))
        }
        await logCachedRender({ selectedMaterial: material, selectedProduct: product, partFabrics, mobileNumber: mobile, name, outputUrl: cachedUrl })
        checkGenerationLimit(mobile)
        setGeneratedImage(watermarked)
        setShowImageModal(true)
        setIsGenerating(false)
        setShowLeadForm(false)
        onGenerated?.()
        return
      }
      setIsGenerating(false)
    }

    generateRender({
      selectedMaterial: material,
      selectedProduct: product,
      partFabrics,
      mobileNumber: mobile,
      name,
      onGeneratingChange: setIsGenerating,
      onShowOTPChange: setShowLeadForm,
      onResult: (imageUrl) => {
        checkGenerationLimit(mobile)
        setGeneratedImage(imageUrl)
        setShowImageModal(true)
        onGenerated?.()
      },
      onError: (message) => {
        if (message === OTP_REQUIRED_ERROR) {
          // Server rejected the stored token (expired / invalid) — send the user back to verify
          clearVerified(mobile)
          setLeadStep('mobile')
          setMobileError('Please verify your number again')
          return
        }
        setGenerateError(message)
      },
    })
  }

  const handleGenerateClick = async (explicit?: { material: SelectedMaterial; product: SelectedProduct; partFabrics?: PartFabric[] }) => {
    const product = explicit?.product ?? selectedProduct
    if (!product) return
    if (explicit) {
      setSelectedMaterial(explicit.material)
      setSelectedProduct(explicit.product)
      setSelectedPartFabrics(explicit.partFabrics ?? [])
    }
    setGenerateError(null)
    setOtpCode('')
    setOtpError('')
    const cleaned = mobileNumber.replace(/\D/g, '').slice(0, 10)
    if (cleaned.length === 10 && isVerified(cleaned)) {
      const info = await checkGenerationLimit(cleaned)
      if (info.remaining > 0) {
        setShowLeadForm(true)
        handleGenerate(cleaned, 'NA', explicit?.material, explicit?.product, explicit ? (explicit.partFabrics ?? []) : undefined)
        return
      }
      setLeadStep('limit')
    } else {
      setLeadStep('mobile')
    }
    setShowLeadForm(true)
  }

  const closeLeadForm = () => {
    setShowLeadForm(false)
    setOtpCode('')
    setOtpError('')
    setMobileError('')
  }

  const continueIfWithinLimit = async (cleaned: string) => {
    const info = await checkGenerationLimit(cleaned)
    if (info.remaining > 0) {
      handleGenerate(cleaned, 'NA')
    } else {
      setLeadStep('limit')
    }
  }

  /** Sends a WhatsApp code; returns false (with otpError set) if the Lambda refused. */
  const requestOtp = async (cleaned: string): Promise<boolean> => {
    setSendingOtp(true)
    try {
      const { resendAfter } = await sendOtp(cleaned)
      setResendIn(resendAfter ?? 30)
      return true
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : 'Failed to send code')
      return false
    } finally {
      setSendingOtp(false)
    }
  }

  const handleSendOtp = async () => {
    const cleaned = mobileNumber.replace(/\D/g, '').slice(0, 10)
    if (!isValidIndianMobile(cleaned)) {
      setMobileError('Please enter a valid 10-digit mobile number')
      return
    }
    setMobileError('')
    setOtpError('')
    localStorage.setItem('kaira_lead_mobile', cleaned)

    if (!OTP_VALIDATION_ENABLED || isVerified(cleaned)) {
      await continueIfWithinLimit(cleaned)
      return
    }

    if (await requestOtp(cleaned)) {
      setOtpCode('')
      setLeadStep('otp')
    }
  }

  const handleResendOtp = async () => {
    const cleaned = mobileNumber.replace(/\D/g, '').slice(0, 10)
    setOtpError('')
    setOtpCode('')
    await requestOtp(cleaned)
  }

  const handleVerifyOtp = async () => {
    const cleaned = mobileNumber.replace(/\D/g, '').slice(0, 10)
    setOtpError('')
    setVerifyingOtp(true)
    try {
      const { token, expiresAt } = await verifyOtp(cleaned, otpCode)
      markVerified(cleaned, token, expiresAt)
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : 'Invalid code')
      return
    } finally {
      setVerifyingOtp(false)
    }
    await continueIfWithinLimit(cleaned)
  }

  const handleChangeMobile = () => {
    setOtpCode('')
    setOtpError('')
    setLeadStep('mobile')
  }

  const handleDownload = async () => {
    if (!generatedImage) return
    try {
      const res = await fetch(generatedImage)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'kaira-render.jpg'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      window.open(generatedImage, '_blank')
    }
  }

  const reset = () => {
    setSelectedMaterial(null)
    setSelectedProduct(null)
    setSelectedPartFabrics([])
    setGeneratedImage(null)
    setShowImageModal(false)
    closeLeadForm()
  }

  return {
    selectedMaterial, setSelectedMaterial,
    selectedProduct, setSelectedProduct,
    showLeadForm, setShowLeadForm,
    mobileNumber, setMobileNumber, mobileError,
    otpCode, setOtpCode, leadStep,
    sendingOtp, verifyingOtp, otpError, resendIn,
    isGenerating, generatedImage, generateError, setGenerateError, cyclingMsg,
    limitInfo,
    showImageModal, setShowImageModal, imgZoom, setImgZoom,
    handleGenerateClick, closeLeadForm, handleSendOtp, handleResendOtp, handleVerifyOtp, handleChangeMobile, handleDownload,
    reset,
  }
}
