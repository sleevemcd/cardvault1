import { useState, useEffect } from 'react'
import { api } from '../api'

interface Props {
  onNavigate: (view: any) => void
}

export function Home({ onNavigate }: Props) {
  const [binderValue, setBinderValue] = useState<{ total: number; cardCount: number } | null>(null)

  useEffect(() => {
    api.getBinders().then(async (binders) => {
      if (binders.length > 0) {
        const v = await api.getBinderValue(binders[0].id)
        setBinderValue(v)
      }
    }).catch(() => {})
  }, [])

  const card = (icon: string, title: string, desc: string, onClick: () => void) => (
    <div
      onClick={onClick}
      style={{
        flex: 1,
        background: '#1a1a2e',
        borderRadius: 16,
        padding: 24,
        border: '1px solid #16213e',
        cursor: 'pointer',
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#e94560')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#16213e')}
    >
      <div style={{ fontSize: 36, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 18, fontWeight: 600, color: '#e0e0e0', marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 13, color: '#888', lineHeight: 1.4 }}>{desc}</div>
    </div>
  )

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 'bold', margin: 0, color: '#e0e0e0' }}>CardVault</h1>
        <p style={{ color: '#888', margin: '4px 0 0 0', fontSize: 16 }}>Identify, Track, Value</p>
        {binderValue && (
          <div
            style={{
              marginTop: 16,
              background: '#1a1a2e',
              borderRadius: 12,
              padding: 16,
              border: '1px solid #16213e',
            }}
          >
            <div style={{ color: '#888', fontSize: 13 }}>Collection Value</div>
            <div style={{ color: '#4ecca3', fontSize: 28, fontWeight: 700 }}>
              ${binderValue.total.toFixed(2)}
            </div>
            <div style={{ color: '#888', fontSize: 12, marginTop: 2 }}>
              {binderValue.cardCount} cards
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          {card('📷', 'Scan Card', 'Identify a card using your camera', () => onNavigate({ page: 'identify' }))}
          {card('🔍', 'Search', 'Find cards by player, set, or number', () => onNavigate({ page: 'search' }))}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {card('📒', 'My Binder', 'View your collection and total value', () => onNavigate({ page: 'binder' }))}
          {card('📊', 'Portfolio', 'Collection analytics and trends', () => null)}
        </div>
      </div>
    </div>
  )
}
