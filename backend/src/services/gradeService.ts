import { prisma } from '../lib/prisma'

export const gradeService = {
  async analyzeGradeSuggestion(cardId: string) {
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      include: { grades: true, ebayListings: true },
    })

    if (!card) return null

    const rawValue = card.rawMarketValue ?? 0
    const activeListings = card.ebayListings.filter(l => !l.isSold)
    const soldListings = card.ebayListings.filter(l => l.isSold)

    const gradeValues: Record<number, number> = {}
    const gradeCost = 25

    for (const grade of card.grades) {
      gradeValues[grade.grade] = grade.gradedValue ?? 0
    }

    if (!gradeValues[10]) gradeValues[10] = rawValue * 10
    if (!gradeValues[9]) gradeValues[9] = rawValue * 4
    if (!gradeValues[8]) gradeValues[8] = rawValue * 2
    if (!gradeValues[7]) gradeValues[7] = rawValue * 1.2
    if (!gradeValues[6]) gradeValues[6] = rawValue * 0.8

    let optimalGrade = 8
    let bestNetValue = 0

    for (const [gradeStr, value] of Object.entries(gradeValues)) {
      const g = parseInt(gradeStr)
      const netValue = value - gradeCost
      if (netValue > bestNetValue) {
        bestNetValue = netValue
        optimalGrade = g
      }
    }

    let breakEvenGrade = 7
    for (let g = 10; g >= 1; g--) {
      if ((gradeValues[g] ?? 0) > gradeCost + rawValue) {
        breakEvenGrade = g
        break
      }
    }

    const estimatedGradedValues: Record<number, number> = {}
    for (const g of [10, 9, 8, 7, 6, 5]) {
      estimatedGradedValues[g] = gradeValues[g] ?? 0
    }

    const recommended = optimalGrade >= 7 && rawValue > 10
    const reason = recommended
      ? `Card has strong estimated value at grade ${optimalGrade}. Estimated net gain after grading cost: $${bestNetValue.toFixed(2)}`
      : `Raw value ($${rawValue.toFixed(2)}) may not justify grading cost ($${gradeCost.toFixed(2)})`

    return {
      recommended,
      confidence: rawValue > 0 ? 0.75 : 0.4,
      estimatedRawValue: rawValue,
      estimatedGradedValues,
      optimalGrade,
      breakEvenGrade,
      reason,
    }
  },
}
