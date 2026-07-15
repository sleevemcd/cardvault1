import { useState, useEffect, useCallback } from 'react'
import { api } from '../api'

interface Props {
  cardId: string
}

export function CardDetail({ cardId }: Props) {
  const [card, setCard] = useState<any>(null)
  const [listings, setListings] = useState<any[]>([])
  const [gradeAnalysis, setGradeAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshingEbay, setRefreshingEbay] = useState(false)
  const [tab, setTab] = useState<'info' | 'pricing' | 'grading'>('info')

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.getCard(cardId),
      api.getCardEbayListings(cardId).catch(() => []),
      api.getGradeAnalysis(cardId).catch(() => null),
    ]).then(([c, l, g]) => {
      setCard(c)
      setListings(l)
      setGradeAnalysis(g)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [cardId])

  const refreshEbay = useCallback(async () => {
    setRefreshingEbay(true)
    try {
      const data = await api.refreshEbayListings(cardId)
      setListings(data)
    } catch {}
    setRefreshingEbay(false)
  }, [cardId])

  const row = (label: string, value: string) => (
    <div
      key={label}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '10px 0',
        borderBottom: '1px solid #1a1a2e',
      }}
    >
      <span style={{ color: '#888', fontSize: 14 }}>{label}</span>
      <span style={{ color: '#e0e0e0', fontSize: 14, fontWeight: 500 }}>{value}</span>
    </div>
  )

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 80 }}>
        <div style={{ color: '#888', fontSize: 16 }}>Loading...</div>
      </div>
    )
  }

  if (!card) {
    return <div style={{ color: '#e94560', textAlign: 'center', padding: 40 }}>Card not found</div>
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <div
          style={{
            width: 130,
            height: 180,
            background: '#1a1a2e',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 48,
            border: '1px solid #16213e',
            flexShrink: 0,
          }}
        >
          🃏
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#e0e0e0', fontSize: 24, fontWeight: 'bold' }}>{card.playerName}</div>
          <div style={{ color: '#aaa', fontSize: 16, marginTop: 4 }}>{card.set?.name}</div>
          <div style={{ color: '#888', fontSize: 14, marginTop: 4 }}>
            {card.year} · {card.manufacturer} · #{card.cardNumber}
          </div>
          {card.parallel && (
            <div style={{ color: '#e94560', fontSize: 14, marginTop: 4, fontStyle: 'italic' }}>
              Parallel: {card.parallel}
            </div>
          )}
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            {card.isRookie && <Badge text="RC" />}
            {card.isAutographed && <Badge text="Auto" />}
            {card.isMemorabilia && <Badge text="Mem" />}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <QuickValue label="Raw Value" value={`$${(card.rawMarketValue ?? 0).toFixed(2)}`} />
        {card.lastSalePrice && (
          <QuickValue label="Last Sale" value={`$${card.lastSalePrice.toFixed(2)}`} />
        )}
        {gradeAnalysis?.recommended !== undefined && (
          <QuickValue
            label="Grade?"
            value={gradeAnalysis.recommended ? 'Yes' : 'No'}
            color={gradeAnalysis.recommended ? '#4ecca3' : '#e0e0e0'}
          />
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['info', 'pricing', 'grading'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '10px 20px',
              borderRadius: 10,
              border: 'none',
              background: tab === t ? '#e94560' : '#1a1a2e',
              color: tab === t ? '#fff' : '#888',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            {t === 'info' ? 'Set Info' : t === 'pricing' ? 'Pricing' : 'Grading'}
          </button>
        ))}
      </div>

      {tab === 'info' && (
        <div>
          <h3 style={{ color: '#e0e0e0', fontSize: 20, fontWeight: 700, margin: '0 0 16px 0' }}>Set Details</h3>
          {card.set && (
            <>
              {row('Set Name', card.set.name)}
              {row('Year', String(card.set.year))}
              {row('Sport', card.set.sport)}
              {row('Manufacturer', card.set.manufacturer)}
              {card.set.totalCards && row('Total Cards', String(card.set.totalCards))}
              {card.set.description && row('Description', card.set.description)}
            </>
          )}
          {card.serialNumbered && row('Serial #', `${card.serialNumbered}/${card.serialTotal}`)}
        </div>
      )}

      {tab === 'pricing' && (
        <div>
          <h3 style={{ color: '#e0e0e0', fontSize: 20, fontWeight: 700, margin: '0 0 16px 0' }}>eBay Listings</h3>
          {listings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 30 }}>
              <div style={{ color: '#888', fontSize: 16, marginBottom: 12 }}>No eBay listings loaded</div>
              <button
                onClick={refreshEbay}
                disabled={refreshingEbay}
                style={{
                  padding: '12px 24px',
                  borderRadius: 10,
                  border: 'none',
                  background: refreshingEbay ? '#666' : '#e94560',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: refreshingEbay ? 'not-allowed' : 'pointer',
                }}
              >
                {refreshingEbay ? 'Loading...' : 'Refresh Listings'}
              </button>
            </div>
          ) : (
            listings.map((listing: any, i: number) => (
              <div
                key={i}
                style={{
                  background: '#1a1a2e',
                  borderRadius: 10,
                  padding: 14,
                  marginBottom: 8,
                  border: '1px solid #16213e',
                }}
              >
                <div style={{ color: '#e0e0e0', fontSize: 14, marginBottom: 8, lineHeight: 1.3 }}>
                  {listing.title}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: '#4ecca3', fontSize: 18, fontWeight: 700 }}>
                    ${listing.price.toFixed(2)}
                  </span>
                  <span style={{ color: '#888', fontSize: 13 }}>{listing.condition}</span>
                  {listing.isSold && (
                    <span style={{ color: '#e94560', fontSize: 12, fontWeight: 700 }}>Sold</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'grading' && gradeAnalysis && (
        <div>
          <h3 style={{ color: '#e0e0e0', fontSize: 20, fontWeight: 700, margin: '0 0 16px 0' }}>Grade Analysis</h3>
          <div
            style={{
              background: '#1a1a2e',
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              border: '1px solid #16213e',
            }}
          >
            <div style={{ color: '#e0e0e0', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
              {gradeAnalysis.recommended ? '✅ Recommended to Grade' : '⚠️ Grading Not Recommended'}
            </div>
            <div style={{ color: '#aaa', fontSize: 14, lineHeight: 1.4 }}>{gradeAnalysis.reason}</div>
          </div>

          <h4 style={{ color: '#e0e0e0', fontSize: 16, fontWeight: 600, margin: '0 0 12px 0' }}>
            Estimated Values by Grade
          </h4>
          {Object.entries(gradeAnalysis.estimatedGradedValues ?? {}).map(([grade, value]) => (
            <div
              key={grade}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 0',
                borderBottom: '1px solid #1a1a2e',
              }}
            >
              <span style={{ color: '#e0e0e0', fontSize: 14, width: 70 }}>Grade {grade}</span>
              <div
                style={{
                  flex: 1,
                  height: 8,
                  background: '#16213e',
                  borderRadius: 4,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min((value as number) / 100, 100)}%`,
                    background: '#4ecca3',
                    borderRadius: 4,
                  }}
                />
              </div>
              <span style={{ color: '#4ecca3', fontSize: 14, fontWeight: 600, width: 70, textAlign: 'right' }}>
                ${(value as number).toFixed(2)}
              </span>
            </div>
          ))}

          <div style={{ marginTop: 20 }}>
            {row('Optimal Grade', String(gradeAnalysis.optimalGrade))}
            {row('Break-Even Grade', String(gradeAnalysis.breakEvenGrade))}
            {row('Raw Value', `$${gradeAnalysis.estimatedRawValue.toFixed(2)}`)}
            {row('Confidence', `${(gradeAnalysis.confidence * 100).toFixed(0)}%`)}
          </div>
        </div>
      )}
    </div>
  )
}

function Badge({ text }: { text: string }) {
  return (
    <span
      style={{
        background: '#e94560',
        color: '#fff',
        fontSize: 11,
        fontWeight: 700,
        padding: '3px 8px',
        borderRadius: 6,
      }}
    >
      {text}
    </span>
  )
}

function QuickValue({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div
      style={{
        flex: 1,
        background: '#1a1a2e',
        borderRadius: 12,
        padding: 14,
        textAlign: 'center',
        border: '1px solid #16213e',
      }}
    >
      <div style={{ color: '#888', fontSize: 12 }}>{label}</div>
      <div style={{ color: color ?? '#e0e0e0', fontSize: 20, fontWeight: 700, marginTop: 4 }}>{value}</div>
    </div>
  )
}
