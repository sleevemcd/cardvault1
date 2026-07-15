import { useState, useRef } from 'react'
import { api } from '../api'

interface Props {
  onCardIdentified: (id: string) => void
}

export function Identify({ onCardIdentified }: Props) {
  const [image, setImage] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImage(reader.result as string)
    reader.readAsDataURL(file)
    setError(null)
  }

  const identify = async () => {
    if (!image) return
    setScanning(true)
    setError(null)
    try {
      const base64 = image.split(',')[1]
      const result = await api.identifyByImage(base64)
      if (result?.identified && result.card?.id) {
        onCardIdentified(result.card.id)
      } else {
        setError('Could not identify this card. Try a clearer photo.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setScanning(false)
  }

  return (
    <div>
      <h2 style={{ fontSize: 28, fontWeight: 'bold', margin: '0 0 20px 0' }}>Scan a Card</h2>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        style={{ display: 'none' }}
      />

      {image ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <img src={image} alt="Card" style={{ width: '100%', maxWidth: 400, borderRadius: 12 }} />
          {error && <div style={{ color: '#e94560', fontSize: 14 }}>{error}</div>}
          <button
            onClick={identify}
            disabled={scanning}
            style={{
              width: '100%',
              maxWidth: 400,
              padding: '16px 32px',
              borderRadius: 12,
              border: 'none',
              background: scanning ? '#888' : '#e94560',
              color: '#fff',
              fontSize: 18,
              fontWeight: 700,
              cursor: scanning ? 'not-allowed' : 'pointer',
            }}
          >
            {scanning ? 'Identifying...' : 'Identify Card'}
          </button>
          <button
            onClick={() => { setImage(null); setError(null); if (fileRef.current) fileRef.current.value = '' }}
            style={{ padding: 12, background: 'none', border: 'none', color: '#888', fontSize: 16, cursor: 'pointer' }}
          >
            Choose Another Photo
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            padding: 60,
            borderRadius: 16,
            border: '2px dashed #16213e',
            background: '#1a1a2e',
            cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: 48 }}>📸</div>
          <div style={{ fontSize: 18, color: '#e0e0e0', fontWeight: 600 }}>Upload a Card Photo</div>
          <div style={{ fontSize: 14, color: '#888' }}>JPG or PNG accepted</div>
        </div>
      )}
    </div>
  )
}
