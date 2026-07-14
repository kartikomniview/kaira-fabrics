import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from 'firebase/auth'
import { auth } from './firebase'

export function createRecaptchaVerifier(containerId: string): RecaptchaVerifier {
  return new RecaptchaVerifier(auth, containerId, { size: 'invisible' })
}

function friendlyAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code
  switch (code) {
    case 'auth/invalid-phone-number':
      return 'Please enter a valid 10-digit mobile number'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later'
    case 'auth/invalid-verification-code':
      return 'Incorrect code. Please try again'
    case 'auth/code-expired':
      return 'This code has expired. Please request a new one'
    default:
      return err instanceof Error ? err.message : 'Something went wrong. Please try again'
  }
}

export async function sendOtp(phoneE164: string, verifier: RecaptchaVerifier): Promise<ConfirmationResult> {
  try {
    return await signInWithPhoneNumber(auth, phoneE164, verifier)
  } catch (err) {
    throw new Error(friendlyAuthError(err))
  }
}

export async function confirmOtp(confirmationResult: ConfirmationResult, code: string): Promise<void> {
  try {
    await confirmationResult.confirm(code)
  } catch (err) {
    throw new Error(friendlyAuthError(err))
  }
}
