import { useCallback, useState } from 'react'

const storageKey = (id: string) => `kaira_notice_seen_${id}`

/**
 * Open/close state for the Important Notice (components/ui/ImportantNotice), shown once per browser
 * session per `noticeId`: a new tab or a new visit shows it again; moving around the site in the same tab does not.
 */
export function useImportantNotice(noticeId: string) {
  const [open, setOpen] = useState(() => {
    try { return sessionStorage.getItem(storageKey(noticeId)) !== '1' } catch { return true }
  })
  const dismiss = useCallback(() => {
    setOpen(false)
    try { sessionStorage.setItem(storageKey(noticeId), '1') } catch { /* storage unavailable */ }
  }, [noticeId])
  return [open, dismiss] as const
}
