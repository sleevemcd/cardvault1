import path from 'path'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import fastifyStatic from '@fastify/static'
import { authRoutes } from './routes/auth'
import { cardRoutes } from './routes/cards'
import { binderRoutes } from './routes/binders'
import { searchRoutes } from './routes/search'
import { identificationRoutes } from './routes/identification'

const server = Fastify({ logger: true })

async function main() {
  await server.register(cors, { origin: true })

  await server.register(authRoutes, { prefix: '/api/auth' })
  await server.register(cardRoutes, { prefix: '/api/cards' })
  await server.register(binderRoutes, { prefix: '/api/binders' })
  await server.register(searchRoutes, { prefix: '/api/search' })
  await server.register(identificationRoutes, { prefix: '/api/identify' })

  server.get('/health', async () => ({ status: 'ok' }))

  if (process.env.NODE_ENV === 'production') {
    const webDist = path.join(__dirname, '../../web/dist')
    await server.register(fastifyStatic, {
      root: webDist,
      wildcard: false,
    })
    server.setNotFoundHandler((_req, reply) => {
      return reply.sendFile('index.html')
    })
  }

  try {
    await server.listen({ port: Number(process.env.PORT ?? 3001), host: '0.0.0.0' })
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

main()
