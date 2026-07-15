import { FastifyInstance } from 'fastify'
import { authService } from '../services/authService'
import { requireAuth } from '../middleware/auth'

export async function authRoutes(server: FastifyInstance) {
  server.post('/signup', async (req, reply) => {
    const { email, password, name } = req.body as { email: string; password: string; name?: string }
    try {
      return await authService.signup(email, password, name)
    } catch (e: any) {
      return reply.status(400).send({ error: e.message })
    }
  })

  server.post('/login', async (req, reply) => {
    const { email, password } = req.body as { email: string; password: string }
    try {
      return await authService.login(email, password)
    } catch (e: any) {
      return reply.status(401).send({ error: e.message })
    }
  })

  server.get('/me', { preHandler: [requireAuth] }, async (req) => {
    const { prisma } = await import('../lib/prisma')
    const userId = (req as any).userId
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    })
    return { user }
  })
}
