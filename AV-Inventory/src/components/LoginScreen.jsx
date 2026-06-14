import { useState } from 'react'
import { supabase } from '../utils/supabase'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const signIn = async () => {
    if (!email.trim() || !password.trim()) { setError('Please enter email and password.'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg)',
      padding: 24,
    }}>
      <div className="modal" style={{
        width: '100%',
        maxWidth: 380,
        animation: 'modal-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        <div className="modal-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>
            Community Centre
          </span>
          <h3 style={{ fontSize: 18 }}>AV Inventory</h3>
        </div>
        <div className="modal-body">
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && signIn()}
              placeholder="committee@email.com"
              autoFocus
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && signIn()}
              placeholder="••••••••"
            />
          </div>
          {error && (
            <p style={{ color: 'var(--color-repair)', fontSize: 12 }}>{error}</p>
          )}
        </div>
        <div className="modal-footer">
          <button
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={signIn}
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  )
}
