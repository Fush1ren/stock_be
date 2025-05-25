import { Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { user, UserRequest } from '../types/userRequest'
import config from '../config'

export const verifyToken = (req: UserRequest, res: Response, next: NextFunction) => {
  const token = req.headers['authorization']?.split(' ')[1]
  if (!token) {
    res.status(401).json({ message: 'No token provided' })
    return;
  }

  jwt.verify(token, config.jwtSecret, (err, user) => {
    if (err) {
      res.status(403).json({ message: 'Invalid token' })
      return;
    }

    req.user = user as user

    next()
  })
}
