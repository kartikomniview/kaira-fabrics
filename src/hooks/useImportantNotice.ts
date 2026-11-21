import { useCallback, useState } from 'react'

// In-memory only: a page refresh clears it, so the notice shows again after every reload.
// Moving between pages inside the site keeps it, so once dismissed it stays hidden until the next refresh.
const dismissedNotices = new Set<string>()

/** Open/close state for the Important Notice (components/ui/ImportantNotice), tracked per `noticeId`. */
export function useImportantNotice(noticeId: string) {
  const [open, setOpen] = useState(() => !dismissedNotices.has(noticeId))
  const dismiss = useCallback(() => {
    dismissedNotices.add(noticeId)
    setOpen(false)
  }, [noticeId])
  return [open, dismiss] as const
}
