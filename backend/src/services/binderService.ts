import { prisma } from '../lib/prisma'

export const binderService = {
  async getAll(userId: string) {
    return prisma.binder.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            card: { include: { set: true, grades: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })
  },

  async getById(id: string, userId: string) {
    return prisma.binder.findFirst({
      where: { id, userId },
      include: {
        items: {
          include: {
            card: { include: { set: true, grades: true, ebayListings: true } },
          },
          orderBy: { dateAdded: 'desc' },
        },
      },
    })
  },

  async create(data: { name: string; description?: string }, userId: string) {
    return prisma.binder.create({ data: { ...data, userId } })
  },

  async addCard(binderId: string, cardId: string, userId: string, data?: { acquisitionPrice?: number; condition?: string; notes?: string }) {
    const binder = await prisma.binder.findFirst({ where: { id: binderId, userId } })
    if (!binder) throw new Error('Binder not found')

    return prisma.binderItem.create({
      data: {
        binderId,
        cardId,
        acquisitionPrice: data?.acquisitionPrice,
        condition: data?.condition ?? 'near-mint',
        notes: data?.notes,
      },
      include: {
        card: { include: { set: true, grades: true } },
      },
    })
  },

  async removeCard(binderId: string, cardId: string, userId: string) {
    const binder = await prisma.binder.findFirst({ where: { id: binderId, userId } })
    if (!binder) throw new Error('Binder not found')
    return prisma.binderItem.deleteMany({
      where: { binderId, cardId },
    })
  },

  async getTotalValue(binderId: string, userId: string) {
    const binder = await prisma.binder.findFirst({
      where: { id: binderId, userId },
      include: {
        items: {
          include: {
            card: {
              include: { grades: true },
            },
          },
        },
      },
    })

    if (!binder) return null

    const total = binder.items.reduce((sum, item) => {
      const grade = item.card.grades?.[0]
      return sum + (grade?.gradedValue ?? item.card.rawMarketValue ?? 0)
    }, 0)

    return { total, cardCount: binder.items.length }
  },

  async updateItem(itemId: string, data: { acquisitionPrice?: number; condition?: string; notes?: string }) {
    return prisma.binderItem.update({
      where: { id: itemId },
      data,
    })
  },
}
