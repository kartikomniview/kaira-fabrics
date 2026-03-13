import { useState } from 'react'
import { Link } from 'react-router-dom'

const API = 'https://kcef1hkto8.execute-api.ap-south-1.amazonaws.com/stage'

const AdminLoginPage = ({ onSuccess }: { onSuccess: () => void }) => {
  const [username, setUsername] = useState(() => localStorage.getItem('adminUsername') ?? '')
  const [password, setPassword] = useState(() => localStorage.getItem('adminPassword') ?? '')
  const [remember, setRemember] = useState(() => !!localStorage.getItem('adminUsername'))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API}/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (!res.ok) throw new Error('Invalid credentials. Please try again.')
      const data = await res.json()
      if (!data.token) throw new Error('No token received from server.')
      localStorage.setItem('adminToken', data.token)
      if (remember) {
        localStorage.setItem('adminUsername', username)
        localStorage.setItem('adminPassword', password)
      } else {
        localStorage.removeItem('adminUsername')
        localStorage.removeItem('adminPassword')
      }
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans">
      {/* Top bar */}
      <header className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <span className="font-serif text-xl tracking-wide text-amber-400">KAIRA</span>
          <span className="text-stone-500 text-sm">|</span>
          <span className="text-stone-300 text-sm uppercase tracking-widest">Admin Portal</span>
        </div>
        <Link 
          to="/" 
          className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors text-xs uppercase tracking-widest"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Go to Home
        </Link>
      </header>
      
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm bg-white border border-stone-200 rounded-lg shadow-sm p-8">
          <div className="text-center mb-8">
            <span className="font-serif text-2xl tracking-wide text-amber-600">KAIRA</span>
            <p className="text-stone-400 text-xs uppercase tracking-widest mt-1">Admin Sign In</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-widest text-stone-400 mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                className="w-full border border-stone-300 bg-stone-50 px-4 py-2.5 text-sm text-stone-800 rounded focus:outline-none focus:border-stone-600 transition-colors"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-stone-400 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full border border-stone-300 bg-stone-50 px-4 py-2.5 text-sm text-stone-800 rounded focus:outline-none focus:border-stone-600 transition-colors"
                placeholder="Enter password"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="accent-stone-800 w-3.5 h-3.5"
              />
              <span className="text-xs text-stone-400 uppercase tracking-widest">Remember me</span>
            </label>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-stone-900 text-white text-xs uppercase tracking-widest py-3 rounded hover:bg-stone-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdminLoginPage
