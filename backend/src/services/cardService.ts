import { prisma } from '../lib/prisma'

export const cardService = {
  async getById(id: string) {
    return prisma.card.findUnique({
      where: { id },
      include: { set: true, grades: true, ebayListings: true },
    })
  },

  async search(query: string, sport?: string) {
    return prisma.card.findMany({
      where: {
        OR: [
          { playerName: { contains: query } },
          { cardNumber: { contains: query } },
          { set: { name: { contains: query } } },
        ],
        ...(sport ? { sport } : {}),
      },
      include: { set: true },
      take: 50,
    })
  },

  async getBySet(setId: string) {
    return prisma.card.findMany({
      where: { setId },
      include: { set: true },
      orderBy: { cardNumber: 'asc' },
    })
  },

  async upsertCard(data: {
    setId: string
    playerName: string
    cardNumber: string
    sport: string
    year: number
    manufacturer: string
    parallel?: string
    isRookie?: boolean
    isAutographed?: boolean
    isMemorabilia?: boolean
    serialNumbered?: number
    serialTotal?: number
    imageUrl?: string
  }) {
    const existing = await prisma.card.findFirst({
      where: {
        setId: data.setId,
        cardNumber: data.cardNumber,
        parallel: data.parallel ?? null,
      },
    })

    if (existing) {
      return prisma.card.update({
        where: { id: existing.id },
        data,
        include: { set: true },
      })
    }

    return prisma.card.create({
      data,
      include: { set: true },
    })
  },

  async getEbayListings(cardId: string) {
    return prisma.ebayListing.findMany({
      where: { cardId },
      orderBy: { createdAt: 'desc' },
    })
  },

  async getGrades(cardId: string) {
    return prisma.grade.findMany({
      where: { cardId },
      orderBy: { grade: 'desc' },
    })
  },
}
