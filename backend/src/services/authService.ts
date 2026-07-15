import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production-cardvault'

export const authService = {
  async signup(email: string, password: string, name?: string) {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) throw new Error('Email already in use')

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { email, password: passwordHash, name },
    })

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' })
    return { token, user: { id: user.id, email: user.email, name: user.name } }
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) throw new Error('Invalid email or password')

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) throw new Error('Invalid email or password')

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' })
    return { token, user: { id: user.id, email: user.email, name: user.name } }
  },

  verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
      return decoded.userId
    } catch {
      return null
    }
  },
}
