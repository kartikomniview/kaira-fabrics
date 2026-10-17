// Admin session token storage.
// "Remember me" → localStorage (survives browser restarts);
// otherwise → sessionStorage (cleared when the browser/tab closes).
const TOKEN_KEY = 'adminToken'

export const getAdminToken = (): string =>
  localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY) ?? ''

export const setAdminToken = (token: string, remember: boolean) => {
  clearAdminToken()
  ;(remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token)
}

export const clearAdminToken = () => {
  localStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
}
