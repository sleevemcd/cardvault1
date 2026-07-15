import { FastifyInstance } from 'fastify'
import { binderService } from '../services/binderService'
import { requireAuth } from '../middleware/auth'

export async function binderRoutes(server: FastifyInstance) {
  server.get('/', { preHandler: [requireAuth] }, async (req) => {
    const userId = (req as any).userId
    return binderService.getAll(userId)
  })

  server.get('/:id', { preHandler: [requireAuth] }, async (req, reply) => {
    const userId = (req as any).userId
    const { id } = req.params as { id: string }
    const binder = await binderService.getById(id, userId)
    if (!binder) return reply.status(404).send({ error: 'Binder not found' })
    return binder
  })

  server.post('/', { preHandler: [requireAuth] }, async (req) => {
    const userId = (req as any).userId
    const body = req.body as { name: string; description?: string }
    return binderService.create(body, userId)
  })

  server.get('/:id/value', { preHandler: [requireAuth] }, async (req, reply) => {
    const userId = (req as any).userId
    const { id } = req.params as { id: string }
    const value = await binderService.getTotalValue(id, userId)
    if (!value) return reply.status(404).send({ error: 'Binder not found' })
    return value
  })

  server.post('/:id/cards', { preHandler: [requireAuth] }, async (req) => {
    const userId = (req as any).userId
    const { id } = req.params as { id: string }
    const body = req.body as { cardId: string; acquisitionPrice?: number; condition?: string; notes?: string }
    return binderService.addCard(id, body.cardId, userId, body)
  })

  server.delete('/:id/cards/:cardId', { preHandler: [requireAuth] }, async (req) => {
    const userId = (req as any).userId
    const { id, cardId } = req.params as { id: string; cardId: string }
    await binderService.removeCard(id, cardId, userId)
    return { success: true }
  })

  server.patch('/items/:itemId', { preHandler: [requireAuth] }, async (req) => {
    const { itemId } = req.params as { itemId: string }
    const body = req.body as { acquisitionPrice?: number; condition?: string; notes?: string }
    return binderService.updateItem(itemId, body)
  })
}
