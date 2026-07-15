import { FastifyInstance } from 'fastify'
import { cardService } from '../services/cardService'

export async function searchRoutes(server: FastifyInstance) {
  server.get('/', async (req) => {
    const { q, sport } = req.query as { q: string; sport?: string }
    if (!q) return []
    return cardService.search(q, sport)
  })
}
