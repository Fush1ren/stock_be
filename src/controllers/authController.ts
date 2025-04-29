import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Request, Response } from 'express'
import config from '../config'

const prisma = new PrismaClient()

const generateAccessToken = (userId: string) => {
  return jwt.sign({ userId }, config.jwtSecret, { expiresIn: '1h' }) // 1 hour
}

const generateRefreshToken = (userId: string) => {
  return jwt.sign({ userId }, config.refreshTokenSecret, { expiresIn: '7d' }) // 7 days
}

export const register = async (req: Request, res: Response) => {
  const { email, password, username, name, type  } = req.body
  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({ data: { email, password: hashed, username, name, type: type ?? 'pegawai' } })
  res.json(user)
}

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body
  const user = await prisma.user.findUnique({ where: { username } })
  if (!user) {
    res.status(404).json({ message: 'User not found' })
    return;
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    res.status(400).json({ message: 'Invalid credentials' })
    return;
  }

  const accessToken = generateAccessToken(user.id)
  const refreshToken = generateRefreshToken(user.id)

  // Simpan refreshToken ke DB jika mau (optional)

  res.json({ accessToken, refreshToken })
}

export const refreshToken = async (req: Request, res: Response) => {
  const { token } = req.body
  if (!token) {
     res.status(403).json({ message: 'No refresh token provided' })
     return;
  }

  try {
    const decoded = jwt.verify(token, config.refreshTokenSecret) as { userId: string }
    const accessToken = generateAccessToken(decoded.userId)
    res.json({ accessToken })
  } catch (err) {
    console.error('Error verifying refresh token:', err) // Log the error for debugging
    res.status(401).json({ message: 'Invalid or expired refresh token' })
    return;
  }
}
