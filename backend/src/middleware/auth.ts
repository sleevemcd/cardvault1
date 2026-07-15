import { FastifyRequest, FastifyReply } from 'fastify'
import { authService } from '../services/authService'

export async function requireAuth(req: FastifyRequest, reply: FastifyReply) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Authentication required' })
  }

  const token = header.slice(7)
  const userId = authService.verifyToken(token)
  if (!userId) {
    return reply.status(401).send({ error: 'Invalid or expired token' })
  }

  ;(req as any).userId = userId
}
