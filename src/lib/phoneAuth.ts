const API = 'https://kcef1hkto8.execute-api.ap-south-1.amazonaws.com/stage'

export interface SendOtpResult {
  /** Seconds until another code may be requested */
  resendAfter: number
}

export interface VerifyOtpResult {
  token: string
  expiresAt: number
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw new Error('Network error. Please check your connection and try again')
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'Something went wrong. Please try again')
  return data as T
}

/** Asks the Lambda to send a 6-digit code to the number on WhatsApp. */
export function sendOtp(mobile: string): Promise<SendOtpResult> {
  return postJson<SendOtpResult>('/otp/send', { mobile })
}

/** Checks the code with the Lambda; on success returns a signed verification token. */
export function verifyOtp(mobile: string, code: string): Promise<VerifyOtpResult> {
  return postJson<VerifyOtpResult>('/otp/verify', { mobile, code })
}
