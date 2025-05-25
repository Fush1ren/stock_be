import jwt from 'jsonwebtoken'
import config from "../../../config"
import bcrypt from 'bcryptjs'
import { Request, Response } from 'express'
import { responseAPI, responseAPIData } from '../../utils'
import { BodyUserLogin } from '../../dto'
import { prismaClient } from '../../config'
import { Payload, Token, User } from '../../types'

const generateAccessToken = (userId: number) => {
    return jwt.sign({ userId }, config.jwtSecret, { expiresIn: '1h' }) // 1 hour
  }
  
const generateRefreshToken = (userId: number) => {
    return jwt.sign({ userId }, config.refreshTokenSecret, { expiresIn: '7d' }) // 7 days
}

const checkToken = (token: string): number | null => {
    const decodedAccessToken = jwt.verify(token, config.jwtSecret) as Payload;
    if (decodedAccessToken) {
        return decodedAccessToken.userId;
    }
    const decodedRefreshToken = jwt.verify(token, config.refreshTokenSecret) as Payload;
    if (!decodedRefreshToken) {
        return null;
    }
    return decodedRefreshToken.userId;
}

const validateToken = async (token: string): Promise<User | null> => {
    try {
        const userId = checkToken(token);
        if (!userId) {
            return null;
        }

        const user = await prismaClient.user.findUnique({
            where: {
                id: userId,
            }, select: {
                id: true,
                username: true,
                name: true,
                email: true,
                photo: true,
                refreshToken: true,
                roles: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        });

        const response: User = {
            id: user?.id as number,
            name: user?.name as string,
            username: user?.username as string,
            email: user?.email as string,
            photo: user?.photo as Uint8Array,
            refreshToken: user?.refreshToken as string,
            role: user?.roles.name as string,
        }

        return response;
    } catch (error) {
        return null;
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const tokenHead = req.headers['authorization']?.split(' ')[1]
        if (tokenHead) {
            const user = await validateToken(tokenHead);
            if (user) {
                responseAPI(res, {
                    status: 200,
                    message: 'User already logged in',
                })
            }
            responseAPI(res, {
                status: 401,
                message: 'Token is Expired',
            })
        }
        const body = req.body as BodyUserLogin;
        if (!body) {
            responseAPI(res, {status: 400, message: "No data provided"});
        };
        if (!body.identifier) {
            responseAPI(res, {
                status: 400,
                message: 'Username Or Email is required!',
            });
        }
        if (!body.password) {
            responseAPI(res, {
                status: 400,
                message: 'Password is required!',
            });
        }
        const user = await prismaClient.user.findFirst({
            where: {
                OR: [
                    { username: body.identifier },
                    { email: body.identifier },
                ]
            }
        })
        if (!user) {
            responseAPI(res, {
                status: 401,
                message: 'Your username or email is incorrect',
            })
        }
        const isPasswordValid = await bcrypt.compare(body.password, user?.password as string);
        if (!isPasswordValid) {
            responseAPI(res, {
                status: 401,
                message: 'Your password is incorrect',
            })
        }

        const token = generateAccessToken(user?.id as number);
        let data: Token = {
            accessToken: token,
        }
        if (body.stayLoggedIn) {
            const refreshToken = generateRefreshToken(user?.id as number);
            await prismaClient.user.update({
                where: {
                    id: user?.id,
                },
                data: {
                    refreshToken: refreshToken,
                }
            });
            data = {
                ...data,
                refreshToken: refreshToken,
            }
        }
        responseAPIData(res, {
            status: 200,
            message: 'Login successfully',
            data: data,
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: 'Internal server error',
        })
    }
}