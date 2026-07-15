import { FastifyInstance } from 'fastify'
import { identificationService } from '../services/identificationService'

export async function identificationRoutes(server: FastifyInstance) {
  server.post('/image', async (req) => {
    const { image } = req.body as { image: string }
    const result = await identificationService.identifyByImage(image)
    if (!result) return { identified: false, message: 'Could not identify card from image' }
    return { identified: true, ...result }
  })

  server.post('/text', async (req) => {
    const { text } = req.body as { text: string }
    const result = await identificationService.identifyByText(text)
    if (!result) return { identified: false, message: 'Could not identify card from text' }
    return { identified: true, ...result }
  })

  server.post('/set-number', async (req) => {
    const { setName, cardNumber } = req.body as { setName: string; cardNumber: string }
    const result = await identificationService.identifyBySetAndNumber(setName, cardNumber)
    if (!result) return { identified: false, message: 'Could not identify card' }
    return { identified: true, ...result }
  })
}
