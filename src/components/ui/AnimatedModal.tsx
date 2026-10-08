import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

/** Matches the kaira-modal-out / kaira-backdrop-out durations in index.css */
export const MODAL_EXIT_MS = 180

interface AnimatedModalProps {
  onClose: () => void
  /** Either plain content, or a render function receiving `requestClose` (plays the exit animation, then calls onClose). */
  children: ReactNode | ((requestClose: () => void) => ReactNode)
  /** Classes for the panel (size, background, border…). */
  panelClassName?: string
  /** Classes for the fixed outer layer (stacking + padding/offsets). */
  containerClassName?: string
  backdropClassName?: string
  /** When false, backdrop clicks and Esc are ignored (e.g. while a render is generating). */
  dismissible?: boolean
}

/**
 * Centered modal shell with a fade/rise entrance and an animated exit. Parents keep rendering it
 * conditionally as before; user-initiated closes (close buttons via `requestClose`, backdrop, Esc)
 * play the exit animation first, while a parent unmounting it directly closes instantly.
 */
const AnimatedModal = ({
  onClose,
  children,
  panelClassName = '',
  containerClassName = 'z-50 p-4',
  backdropClassName = 'bg-stone-900/60 backdrop-blur-sm',
  dismissible = true,
}: AnimatedModalProps) => {
  const [closing, setClosing] = useState(false)
  const requestClose = useCallback(() => setClosing(true), [])

  // Latest onClose without restarting the exit timer when the parent re-renders mid-animation
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose })

  useEffect(() => {
    if (!closing) return
    const id = setTimeout(() => onCloseRef.current(), MODAL_EXIT_MS)
    return () => clearTimeout(id)
  }, [closing])

  useEffect(() => {
    if (!dismissible) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') requestClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [dismissible, requestClose])

  return (
    <div className={`fixed inset-0 flex items-center justify-center ${containerClassName}`}>
      <div
        className={`absolute inset-0 ${backdropClassName} ${closing ? 'kaira-backdrop-out' : 'kaira-backdrop-in'}`}
        onClick={() => { if (dismissible) requestClose() }}
      />
      <div className={`relative ${panelClassName} ${closing ? 'kaira-modal-out' : 'kaira-modal-in'}`}>
        {typeof children === 'function' ? children(requestClose) : children}
      </div>
    </div>
  )
}

export default AnimatedModal
