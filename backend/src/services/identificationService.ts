import { createWorker } from 'tesseract.js'
import { prisma } from '../lib/prisma'

interface IdentificationResult {
  card: any
  confidence: number
  matches: Array<{ field: string; value: string; confidence: number }>
}

const MANUFACTURERS = ['topps', 'bowman', 'panini', 'donruss', 'fleer', 'upper deck', 'leaf', 'score']
const knownSets: Record<string, string[]> = {
  'topps': ['topps chrome', 'topps flagship', 'topps heritage', 'topps stadium club', 'topps finest', 'topps pristine', 'topps tribute', 'topps tier one', 'topps museum collection', 'topps dynasty', 'topps transcendent', 'topps five star', 'topps sterling', 'topps definitive'],
  'bowman': ['bowman chrome', 'bowman sterling', 'bowman platinum', 'bowman's best', 'bowman inception', 'bowman draft'],
  'panini': ['panini prizm', 'panini select', 'panini one', 'panini flawless', 'panini national treasures', 'panini immaculate', 'panini noir', 'panini mosaic'],
  'donruss': ['donruss optic', 'donruss elite', 'donruss absolute'],
}

function findSetWords(text: string): string | null {
  const lower = text.toLowerCase()
  for (const [, sets] of Object.entries(knownSets)) {
    for (const set of sets) {
      if (lower.includes(set)) return set
    }
  }
  const yearSetMatch = text.match(/(\d{4})\s+(.+?)(?:\s+#|$)/)
  if (yearSetMatch) return yearSetMatch[2].trim()
  return null
}

function findManufacturer(text: string): string | null {
  const lower = text.toLowerCase()
  for (const mfr of MANUFACTURERS) {
    if (lower.includes(mfr)) return mfr.charAt(0).toUpperCase() + mfr.slice(1)
  }
  return null
}

function findPlayerName(text: string): string | null {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  for (const line of lines) {
    if (line.includes('#')) continue
    if (line.match(/^\d{4}/)) continue
    if (MANUFACTURERS.some(m => line.toLowerCase().includes(m))) continue
    if (line.toLowerCase().includes('rookie') || line.toLowerCase().includes('rc')) continue
    if (line.length > 5 && line.length < 40) {
      return line.trim()
    }
  }
  return null
}

function findCardNumber(text: string): string | null {
  const match = text.match(/#\s*([A-Za-z0-9-]+)/)
  if (match) return match[1].trim()
  const alt = text.match(/(?:BCP|CPA|RA|FUT|FF|FA|IA|ROY|AS|LL|ML|SP|SS|USA)-\d+/i)
  if (alt) return alt[0]
  return null
}

function findYear(text: string): number | null {
  const match = text.match(/(19|20)\d{2}/)
  return match ? parseInt(match[0]) : null
}

function parseOcrText(text: string) {
  return {
    playerName: findPlayerName(text),
    cardNumber: findCardNumber(text),
    year: findYear(text),
    setName: findSetWords(text),
    manufacturer: findManufacturer(text),
  }
}

export const identificationService = {
  async identifyByImage(imageData: string): Promise<IdentificationResult | null> {
    try {
      const worker = await createWorker('eng')
      const buffer = Buffer.from(imageData, 'base64')
      const { data } = await worker.recognize(buffer)
      await worker.terminate()

      const ocrText = data.text
      return this.identifyByText(ocrText)
    } catch {
      return null
    }
  },

  async identifyByText(ocrText: string): Promise<IdentificationResult | null> {
    const parsed = parseOcrText(ocrText)

    const where: any = {}
    const conditions: any[] = []

    if (parsed.cardNumber) {
      conditions.push({ cardNumber: { contains: parsed.cardNumber } })
    }
    if (parsed.playerName) {
      conditions.push({ playerName: { contains: parsed.playerName } })
    }

    if (conditions.length === 0) return null

    where.OR = conditions

    const cards = await prisma.card.findMany({
      where,
      include: { set: true },
      take: 10,
    })

    if (cards.length === 0) {
      return null
    }

    let bestMatch = cards[0]
    let bestScore = 0

    for (const card of cards) {
      let score = 0
      if (parsed.playerName && card.playerName.toLowerCase().includes(parsed.playerName.toLowerCase())) {
        score += 0.5
      }
      if (parsed.cardNumber && card.cardNumber.toLowerCase().includes(parsed.cardNumber.toLowerCase())) {
        score += 0.3
      }
      if (parsed.year && card.year === parsed.year) {
        score += 0.15
      }
      if (parsed.manufacturer && card.manufacturer.toLowerCase() === parsed.manufacturer.toLowerCase()) {
        score += 0.05
      }
      if (score > bestScore) {
        bestScore = score
        bestMatch = card
      }
    }

    return {
      card: bestMatch,
      confidence: bestScore,
      matches: [
        ...(parsed.playerName ? [{ field: 'playerName', value: parsed.playerName, confidence: bestScore }] : []),
        ...(parsed.cardNumber ? [{ field: 'cardNumber', value: parsed.cardNumber, confidence: bestScore }] : []),
        ...(parsed.year ? [{ field: 'year', value: String(parsed.year), confidence: bestScore }] : []),
        ...(parsed.setName ? [{ field: 'setName', value: parsed.setName, confidence: bestScore * 0.8 }] : []),
      ],
    }
  },

  async identifyBySetAndNumber(setName: string, cardNumber: string): Promise<IdentificationResult | null> {
    const set = await prisma.set.findFirst({
      where: { name: { contains: setName } },
    })
    if (!set) return null

    const card = await prisma.card.findFirst({
      where: { setId: set.id, cardNumber },
      include: { set: true },
    })
    if (!card) return null

    return {
      card,
      confidence: 0.98,
      matches: [
        { field: 'setName', value: setName, confidence: 0.95 },
        { field: 'cardNumber', value: cardNumber, confidence: 0.98 },
      ],
    }
  },
}
