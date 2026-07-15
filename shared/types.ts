export interface CardSet {
  id: string
  name: string
  year: number
  sport: Sport
  manufacturer: string
  series?: string
  totalCards?: number
  description?: string
  releaseDate?: string
  imageUrl?: string
}

export interface Card {
  id: string
  setId: string
  set?: CardSet
  playerName: string
  cardNumber: string
  sport: Sport
  year: number
  manufacturer: string
  parallel?: string
  isRookie: boolean
  isAutographed: boolean
  isMemorabilia: boolean
  serialNumbered?: number
  serialTotal?: number
  imageUrl?: string
  thumbnailUrl?: string
  rawMarketValue?: number
  lastSalePrice?: number
  lastSaleDate?: string
}

export interface GradedCard extends Card {
  grade: number
  gradingCompany: GradingCompany
  certNumber: string
  gradedValue?: number
  popReport?: PopulationReport
}

export interface PopulationReport {
  totalGraded: number
  gradeDistribution: Record<number, number>
  lastUpdated: string
}

export interface BinderItem {
  id: string
  cardId: string
  card: Card | GradedCard
  binderId: string
  dateAdded: string
  acquisitionPrice?: number
  condition: CardCondition
  notes?: string
}

export interface Binder {
  id: string
  name: string
  description?: string
  items: BinderItem[]
  createdAt: string
  updatedAt: string
}

export interface EbayListing {
  itemId: string
  title: string
  price: number
  currency: string
  condition: string
  listingUrl: string
  sellerName: string
  sellerRating: number
  soldDate?: string
  isSold: boolean
  bidCount?: number
}

export interface GradeSuggestion {
  recommended: boolean
  confidence: number
  estimatedRawValue: number
  estimatedGradedValues: Record<number, number>
  optimalGrade: number
  reason: string
  breakEvenGrade: number
}

export type Sport = 'baseball' | 'basketball' | 'football' | 'hockey' | 'soccer' | 'other'
export type GradingCompany = 'PSA' | 'BGS' | 'BVG' | 'SGC' | 'CSG' | 'CGC' | 'HGA' | 'other'
export type CardCondition = 'mint' | 'near-mint' | 'excellent' | 'very-good' | 'good' | 'fair' | 'poor'
