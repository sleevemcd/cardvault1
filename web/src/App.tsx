import { useState, useEffect } from 'react'
import { api } from './api'
import { Auth } from './pages/Auth'
import { Home } from './pages/Home'
import { Search } from './pages/Search'
import { CardDetail } from './pages/CardDetail'
import { Binder } from './pages/Binder'
import { Identify } from './pages/Identify'

type Page = 'home' | 'search' | 'binder' | 'identify'
type View = { page: Page } | { page: 'card'; id: string }

function getStoredAuth(): { token: string; user: any } | null {
  try {
    const t = localStorage.getItem('cardvault_token')
    const u = localStorage.getItem('cardvault_user')
    if (t && u) return { token: t, user: JSON.parse(u) }
  } catch {}
  return null
}

export function App() {
  const [auth, setAuth] = useState<{ token: string; user: any } | null>(getStoredAuth)
  const [checking, setChecking] = useState(true)
  const [view, setView] = useState<View>({ page: 'home' })

  useEffect(() => {
    if (auth?.token) {
      api.auth.me().then((res) => {
        const u = { ...auth, user: res.user }
        setAuth(u)
        localStorage.setItem('cardvault_user', JSON.stringify(res.user))
      }).catch(() => {
        localStorage.removeItem('cardvault_token')
        localStorage.removeItem('cardvault_user')
        setAuth(null)
      }).finally(() => setChecking(false))
    } else {
      setChecking(false)
    }
  }, [])

  const handleAuth = (token: string, user: any) => {
    localStorage.setItem('cardvault_token', token)
    localStorage.setItem('cardvault_user', JSON.stringify(user))
    setAuth({ token, user })
  }

  const logout = () => {
    localStorage.removeItem('cardvault_token')
    localStorage.removeItem('cardvault_user')
    setAuth(null)
  }

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f0f23', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
        Loading...
      </div>
    )
  }

  if (!auth) {
    return <Auth onAuth={handleAuth} />
  }

  const navStyle = {
    display: 'flex',
    gap: 4,
    background: '#1a1a2e',
    borderBottom: '1px solid #16213e',
    padding: '0 16px',
    overflowX: 'auto' as const,
    WebkitOverflowScrolling: 'touch' as const,
  }

  const tabStyle = (active: boolean) => ({
    padding: '14px 20px',
    color: active ? '#e94560' : '#888',
    fontWeight: active ? '700' as const : '500' as const,
    borderBottom: active ? '2px solid #e94560' : '2px solid transparent',
    cursor: 'pointer' as const,
    whiteSpace: 'nowrap' as const,
    background: 'none',
    border: 'none',
    fontSize: 15,
  })

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f23', color: '#e0e0e0' }}>
      {'page' in view && view.page !== 'card' ? (
        <>
          <div style={navStyle}>
            <button style={tabStyle(view.page === 'home')} onClick={() => setView({ page: 'home' })}>
              Home
            </button>
            <button style={tabStyle(view.page === 'identify')} onClick={() => setView({ page: 'identify' })}>
              Scan
            </button>
            <button style={tabStyle(view.page === 'binder')} onClick={() => setView({ page: 'binder' })}>
              Binder
            </button>
            <button style={tabStyle(view.page === 'search')} onClick={() => setView({ page: 'search' })}>
              Search
            </button>
            <div style={{ flex: 1 }} />
            <button
              onClick={logout}
              style={{
                padding: '14px 16px',
                color: '#888',
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                fontSize: 13,
              }}
            >
              Logout ({auth.user.email})
            </button>
          </div>
          <div style={{ padding: 20 }}>
            {view.page === 'home' && <Home onNavigate={setView} />}
            {view.page === 'search' && <Search onCardClick={(id) => setView({ page: 'card', id })} />}
            {view.page === 'identify' && <Identify onCardIdentified={(id) => setView({ page: 'card', id })} />}
            {view.page === 'binder' && <Binder onCardClick={(id) => setView({ page: 'card', id })} />}
          </div>
        </>
      ) : 'id' in view ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={() => setView({ page: 'home' })}
              style={{
                padding: '16px 20px',
                background: 'none',
                border: 'none',
                color: '#e94560',
                fontSize: 18,
                cursor: 'pointer',
                display: 'block',
              }}
            >
              ← Back
            </button>
            <button
              onClick={logout}
              style={{
                padding: '16px 20px',
                background: 'none',
                border: 'none',
                color: '#888',
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              Logout
            </button>
          </div>
          <div style={{ padding: '0 20px 100px' }}>
            <CardDetail cardId={view.id} />
          </div>
        </div>
      ) : null}
    </div>
  )
}
