import { FastifyInstance } from 'fastify'
import { cardService } from '../services/cardService'
import { gradeService } from '../services/gradeService'
import { ebayService } from '../services/ebayService'

export async function cardRoutes(server: FastifyInstance) {
  server.get('/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const card = await cardService.getById(id)
    if (!card) return reply.status(404).send({ error: 'Card not found' })
    return card
  })

  server.get('/:id/ebay', async (req) => {
    const { id } = req.params as { id: string }
    return cardService.getEbayListings(id)
  })

  server.post('/:id/ebay/refresh', async (req) => {
    const { id } = req.params as { id: string }
    return ebayService.refreshListings(id)
  })

  server.get('/:id/grades', async (req) => {
    const { id } = req.params as { id: string }
    return cardService.getGrades(id)
  })

  server.get('/:id/grade-analysis', async (req, reply) => {
    const { id } = req.params as { id: string }
    const analysis = await gradeService.analyzeGradeSuggestion(id)
    if (!analysis) return reply.status(404).send({ error: 'Card not found' })
    return analysis
  })

  server.get('/set/:setId', async (req) => {
    const { setId } = req.params as { setId: string }
    return cardService.getBySet(setId)
  })

  server.post('/upsert', async (req) => {
    const body = req.body as any
    return cardService.upsertCard(body)
  })
}
