import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'demo@cardvault.app' },
    update: { name: 'Demo User' },
    create: {
      email: 'demo@cardvault.app',
      password: await bcrypt.hash('demo123', 10),
      name: 'Demo User',
    },
  })

  const set = await prisma.set.upsert({
    where: { id: 'seed-set-2023-bowman-chrome' },
    update: { totalCards: 200 },
    create: {
      id: 'seed-set-2023-bowman-chrome',
      name: 'Bowman Chrome',
      year: 2023,
      sport: 'baseball',
      manufacturer: 'Bowman',
      totalCards: 200,
      description: '2023 Bowman Chrome Baseball',
    },
  })

  const card = await prisma.card.upsert({
    where: { id: 'seed-card-jh-1' },
    update: { rawMarketValue: 45.00 },
    create: {
      id: 'seed-card-jh-1',
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

  await prisma.grade.upsert({
    where: { id: 'seed-grade-1' },
    update: { gradedValue: 250.00 },
    create: {
      id: 'seed-grade-1',
      cardId: card.id,
      company: 'PSA',
      grade: 10,
      gradedValue: 250.00,
      totalGraded: 120,
      gradeDistribution: JSON.stringify({ '10': 45, '9': 55, '8': 15, '7': 5 }),
    },
  })

  await prisma.ebayListing.upsert({
    where: { id: 'seed-ebay-1' },
    update: { price: 249.99 },
    create: {
      id: 'seed-ebay-1',
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

  await prisma.binder.upsert({
    where: { id: 'seed-binder-1' },
    update: { name: 'My Collection' },
    create: {
      id: 'seed-binder-1',
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
