import { useState, useCallback, useRef } from 'react'
import { api } from '../api'

interface Props {
  onCardClick: (id: string) => void
}

export function Search({ onCardClick }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const timer = useRef<number | undefined>(undefined)

  const search = useCallback((q: string) => {
    setQuery(q)
    clearTimeout(timer.current)
    if (q.length < 2) { setResults([]); return }
    timer.current = window.setTimeout(async () => {
      try {
        const data = await api.searchCards(q)
        setResults(data)
      } catch { setResults([]) }
    }, 300)
  }, [])

  return (
    <div>
      <h2 style={{ fontSize: 28, fontWeight: 'bold', margin: '0 0 16px 0' }}>Search Cards</h2>
      <input
        value={query}
        onChange={(e) => search(e.target.value)}
        placeholder="Search by player, set, or card #..."
        style={{
          width: '100%',
          padding: 16,
          fontSize: 16,
          borderRadius: 12,
          border: '1px solid #16213e',
          background: '#1a1a2e',
          color: '#e0e0e0',
          outline: 'none',
          boxSizing: 'border-box',
          marginBottom: 16,
        }}
      />

      {results.map((item) => (
        <div
          key={item.id}
          onClick={() => onCardClick(item.id)}
          style={{
            background: '#1a1a2e',
            borderRadius: 12,
            padding: 16,
            marginBottom: 10,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            border: '1px solid #16213e',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#e94560')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#16213e')}
        >
          <div>
            <div style={{ color: '#e0e0e0', fontSize: 16, fontWeight: 700 }}>{item.playerName}</div>
            <div style={{ color: '#888', fontSize: 13, marginTop: 2 }}>
              {item.set?.name} · #{item.cardNumber}
            </div>
            <div style={{ color: '#888', fontSize: 13 }}>
              {item.year} {item.manufacturer}
            </div>
          </div>
          <div style={{ color: '#4ecca3', fontSize: 16, fontWeight: 700 }}>
            ${(item.rawMarketValue ?? 0).toFixed(2)}
          </div>
        </div>
      ))}

      {query.length >= 2 && results.length === 0 && (
        <div style={{ textAlign: 'center', color: '#888', padding: 40, fontSize: 16 }}>No cards found</div>
      )}
    </div>
  )
}
