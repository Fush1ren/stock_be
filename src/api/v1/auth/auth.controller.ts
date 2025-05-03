import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import config from "../../../config";
import { BodyUserLogin } from "../../../dto/auth.dto";

const prisma = new PrismaClient()

const generateAccessToken = (userId: string) => {
    return jwt.sign({ userId }, config.jwtSecret, { expiresIn: '1h' }) // 1 hour
  }
  
const generateRefreshToken = (userId: string) => {
    return jwt.sign({ userId }, config.refreshTokenSecret, { expiresIn: '7d' }) // 7 days
}

const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = req.body as BodyUserLogin;
        if (!body) {
            res.status(400).json({ message: 'No data provided' });
            return;
        };
        if (!body.username) {
            res.status(400).json({ message: 'Username is required' });
            return;
        };
        if (!body.password) {
            res.status(400).json({ message: 'Password is required' });
            return;
        };

        const user = await prisma.users.findUnique({ where: { username: body.username } })
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        };
        
        const isMatch = await bcrypt.compare(body.password, user.password);

        if (!isMatch) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        };

        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);
    
        // Simpan token ke DB
        await prisma.users.update({ 
            where: { 
                username: user.username
             },
            data: {
                token: accessToken,
            }
        })
    
        res.json({ accessToken, refreshToken });
        return;
    } catch (error) {
        next(error);
    }
}

const refreshToken = async (req: Request, res: Response) => {
    const { token } = req.body
    if (!token) {
        res.status(403).json({ message: 'No refresh token provided' });
        return;
    }
  
    try {
      const decoded = jwt.verify(token, config.refreshTokenSecret) as { userId: string }
      const accessToken = generateAccessToken(decoded.userId)
      res.json({ accessToken })
      return;
    } catch (err) {
      console.error('Error verifying refresh token:', err) // Log the error for debugging 
      res.status(401).json({ message: 'Invalid or expired refresh token' })
      return;
    }
}

export {
    login,
    refreshToken,
}