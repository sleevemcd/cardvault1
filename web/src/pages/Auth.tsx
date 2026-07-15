import { useState } from 'react'
import { api } from '../api'

interface Props {
  onAuth: (token: string, user: any) => void
}

export function Auth({ onAuth }: Props) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = mode === 'login'
        ? await api.auth.login(email, password)
        : await api.auth.signup(email, password, name || undefined)
      onAuth(result.token, result.user)
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%',
    padding: 14,
    fontSize: 16,
    borderRadius: 10,
    border: '1px solid #16213e',
    background: '#1a1a2e',
    color: '#e0e0e0',
    outline: 'none',
    boxSizing: 'border-box' as const,
    marginBottom: 12,
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f0f23',
        padding: 20,
      }}
    >
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🃏</div>
          <h1 style={{ fontSize: 28, fontWeight: 'bold', color: '#e0e0e0', margin: 0 }}>CardVault</h1>
          <p style={{ color: '#888', margin: '4px 0 0 0', fontSize: 14 }}>
            {mode === 'login' ? 'Sign in to your collection' : 'Create your CardVault account'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name (optional)"
              style={inputStyle}
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            style={inputStyle}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            minLength={4}
            style={inputStyle}
          />

          {error && (
            <div style={{ color: '#e94560', fontSize: 14, marginBottom: 12, textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: 14,
              borderRadius: 10,
              border: 'none',
              background: loading ? '#666' : '#e94560',
              color: '#fff',
              fontSize: 16,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: 16,
            }}
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
            style={{ background: 'none', border: 'none', color: '#e94560', cursor: 'pointer', fontSize: 14 }}
          >
            {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>

        {mode === 'login' && (
          <div style={{ textAlign: 'center', marginTop: 24, color: '#666', fontSize: 13 }}>
            Demo: demo@cardvault.app / demo123
          </div>
        )}
      </div>
    </div>
  )
}
