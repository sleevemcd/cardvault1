import { useState, useEffect, useCallback } from 'react'
import { api } from '../api'

interface Props {
  onCardClick: (id: string) => void
}

export function Binder({ onCardClick }: Props) {
  const [binders, setBinders] = useState<any[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [binderData, setBinderData] = useState<any>(null)
  const [value, setValue] = useState<{ total: number; cardCount: number } | null>(null)

  const load = useCallback(async () => {
    const data = await api.getBinders()
    setBinders(data)
  }, [])

  useEffect(() => { load() }, [load])

  const select = async (id: string) => {
    setSelected(id)
    const [data, v] = await Promise.all([api.getBinder(id), api.getBinderValue(id)])
    setBinderData(data)
    setValue(v)
  }

  return (
    <div>
      <h2 style={{ fontSize: 28, fontWeight: 'bold', margin: '0 0 16px 0' }}>My Binder</h2>

      {value && selected && (
        <div style={{
          background: '#1a1a2e', borderRadius: 12, padding: 16, marginBottom: 16,
          border: '1px solid #16213e',
        }}>
          <div style={{ color: '#888', fontSize: 13 }}>Total Value</div>
          <div style={{ color: '#4ecca3', fontSize: 28, fontWeight: 700 }}>${value.total.toFixed(2)}</div>
          <div style={{ color: '#888', fontSize: 12 }}>{value.cardCount} cards</div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        {binders.map((b) => (
          <button
            key={b.id}
            onClick={() => select(b.id)}
            style={{
              padding: '10px 20px',
              borderRadius: 12,
              border: selected === b.id ? '2px solid #e94560' : '1px solid #16213e',
              background: selected === b.id ? '#1e1e3a' : '#1a1a2e',
              color: selected === b.id ? '#e94560' : '#e0e0e0',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            {b.name}
            <div style={{ color: '#888', fontSize: 11, marginTop: 2 }}>{b.items?.length ?? 0} cards</div>
          </button>
        ))}
      </div>

      {binderData ? (
        binderData.items.map((item: any) => (
          <div
            key={item.id}
            onClick={() => onCardClick(item.card.id)}
            style={{
              background: '#1a1a2e', borderRadius: 12, padding: 16, marginBottom: 10,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              border: '1px solid #16213e', cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#e94560')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#16213e')}
          >
            <div>
              <div style={{ color: '#e0e0e0', fontSize: 16, fontWeight: 700 }}>{item.card.playerName}</div>
              <div style={{ color: '#888', fontSize: 13 }}>
                {item.card.set?.name} #{item.card.cardNumber}
              </div>
              <div style={{ color: '#888', fontSize: 13 }}>
                {item.card.year} {item.card.manufacturer}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#4ecca3', fontSize: 16, fontWeight: 700 }}>
                ${(item.card.rawMarketValue ?? 0).toFixed(2)}
              </div>
              {item.card.grades?.[0] && (
                <div style={{ color: '#e94560', fontSize: 14, fontWeight: 600, marginTop: 2 }}>
                  {item.card.grades[0].grade}
                </div>
              )}
            </div>
          </div>
        ))
      ) : (
        <div style={{ textAlign: 'center', color: '#888', padding: 60, fontSize: 16 }}>
          {binders.length === 0
            ? 'No binders yet. Create one to start your collection!'
            : 'Select a binder to view its cards'}
        </div>
      )}
    </div>
  )
}
