import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.create({
    data: {
      email: 'demo@cardvault.app',
      password: await bcrypt.hash('demo123', 10),
      name: 'Demo User',
    },
  })

  const set = await prisma.set.create({
    data: {
      name: 'Bowman Chrome',
      year: 2023,
      sport: 'baseball',
      manufacturer: 'Bowman',
      totalCards: 200,
      description: '2023 Bowman Chrome Baseball',
    },
  })

  const card = await prisma.card.create({
    data: {
      setId: set.id,
      playerName: 'Jackson Holliday',
      cardNumber: 'BCP-1',
      sport: 'baseball',
      year: 2023,
      manufacturer: 'Bowman',
      isRookie: true,
      rawMarketValue: 45.00,
    },
  })

  await prisma.grade.create({
    data: {
      cardId: card.id,
      company: 'PSA',
      grade: 10,
      gradedValue: 250.00,
      totalGraded: 120,
      gradeDistribution: JSON.stringify({ '10': 45, '9': 55, '8': 15, '7': 5 }),
    },
  })

  await prisma.ebayListing.create({
    data: {
      cardId: card.id,
      itemId: 'ebay-123',
      title: '2023 Bowman Chrome Jackson Holliday BCP-1 PSA 10',
      price: 249.99,
      currency: 'USD',
      condition: 'PSA 10',
      isSold: true,
      soldDate: new Date('2024-01-15'),
    },
  })

  await prisma.binder.create({
    data: {
      name: 'My Collection',
      description: 'My personal sports card collection',
      userId: user.id,
    },
  })

  console.log('Seed data created successfully')
  console.log('Demo login: demo@cardvault.app / demo123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
