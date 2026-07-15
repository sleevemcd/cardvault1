import { prisma } from '../lib/prisma'

interface EbayListingData {
  itemId: string
  title: string
  price: number
  currency: string
  condition: string
  listingUrl: string
  sellerName: string
  sellerRating: number
  soldDate: string | null
  isSold: boolean
  bidCount: number | null
}

const EBAY_API = 'https://api.ebay.com'
const EBAY_AUTH_URL = `${EBAY_API}/identity/v1/oauth2/token`
const EBAY_BROWSE_URL = `${EBAY_API}/buy/browse/v1`
const SPORTS_CARDS_CATEGORY = '260'

let tokenCache: { token: string; expires: number } | null = null

async function getAccessToken(): Promise<string> {
  const clientId = process.env.EBAY_APP_ID
  const clientSecret = process.env.EBAY_CERT_ID

  if (!clientId || !clientSecret) {
    throw new Error('EBAY_APP_ID and EBAY_CERT_ID must be set in backend/.env')
  }

  if (tokenCache && Date.now() < tokenCache.expires) {
    return tokenCache.token
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const res = await fetch(EBAY_AUTH_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope',
  })

  if (!res.ok) {
    throw new Error(`eBay OAuth failed: ${res.status} ${await res.text()}`)
  }

  const data: any = await res.json()
  tokenCache = {
    token: data.access_token,
    expires: Date.now() + (data.expires_in - 60) * 1000,
  }
  return data.access_token
}

async function searchEbay(query: string, filters: string[] = []): Promise<any[]> {
  const token = await getAccessToken()

  const params = new URLSearchParams({
    q: query,
    limit: '50',
    category_ids: SPORTS_CARDS_CATEGORY,
    filter: filters.join(','),
  })

  const res = await fetch(`${EBAY_BROWSE_URL}/item_summary/search?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    throw new Error(`eBay search failed: ${res.status} ${await res.text()}`)
  }

  const data: any = await res.json()
  return data.itemSummaries ?? []
}

function mapEbayItem(item: any): EbayListingData {
  const isSold = item.itemEndDate && new Date(item.itemEndDate) < new Date()
  return {
    itemId: item.itemId,
    title: item.title,
    price: parseFloat(item.price?.value ?? '0'),
    currency: item.price?.currency ?? 'USD',
    condition: item.condition ?? '',
    listingUrl: item.itemWebUrl ?? '',
    sellerName: item.seller?.username ?? '',
    sellerRating: item.seller?.feedbackPercentage ?? 0,
    soldDate: isSold ? item.itemEndDate : null,
    isSold: !!isSold,
    bidCount: item.bidCount ?? null,
  }
}

export const ebayService = {
  async searchListings(cardId: string): Promise<EbayListingData[]> {
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      include: { set: true },
    })
    if (!card) return []

    const parts = [
      card.playerName,
      card.set?.name,
      String(card.year),
      card.cardNumber,
    ].filter(Boolean)
    const query = parts.join(' ')

    try {
      const items = await searchEbay(query)
      return items.map(mapEbayItem)
    } catch (e: any) {
      console.warn('eBay search failed:', e.message)
      return []
    }
  },

  async refreshListings(cardId: string) {
    const results = await this.searchListings(cardId)

    await prisma.ebayListing.deleteMany({ where: { cardId } })

    for (const listing of results) {
      await prisma.ebayListing.create({
        data: {
          cardId,
          itemId: listing.itemId,
          title: listing.title,
          price: listing.price,
          currency: listing.currency ?? 'USD',
          condition: listing.condition,
          listingUrl: listing.listingUrl,
          sellerName: listing.sellerName,
          sellerRating: listing.sellerRating,
          soldDate: listing.soldDate ? new Date(listing.soldDate) : null,
          isSold: listing.isSold,
          bidCount: listing.bidCount,
        },
      })
    }

    return results
  },

  async createListing(cardId: string, ebayAuthToken: string): Promise<any> {
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      include: { set: true },
    })
    if (!card) throw new Error('Card not found')

    const title = `${card.year} ${card.set?.name ?? ''} ${card.playerName} #${card.cardNumber}`.trim()
    const condition = 'USED_GOOD'

    const body = {
      title,
      description: `CardVault listing: ${card.playerName} ${card.cardNumber}`,
      category_id: SPORTS_CARDS_CATEGORY,
      condition,
      pricing: {
        pricingModel: 'FIXED_PRICE',
        price: { value: card.rawMarketValue ?? '0.00', currency: 'USD' },
      },
      product: {
        title,
        description: `${card.year} ${card.manufacturer} ${card.playerName} card #${card.cardNumber}`,
      },
    }

    const res = await fetch(`${EBAY_API}/sell/inventory/v1/offer`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ebayAuthToken}`,
        'Content-Type': 'application/json',
        'Content-Language': 'en-US',
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      throw new Error(`eBay listing failed: ${res.status} ${await res.text()}`)
    }

    return res.json()
  },
}
