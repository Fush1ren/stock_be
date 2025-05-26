import { Request, Response } from "express";
import { BodyCreateUser } from "../../../dto";
import { getPage, responseAPI, responseAPITable } from "../../utils";
import { prismaClient } from "../../config";
import { QueryParams } from "../../dto";
import { IQuery } from "../../types/data.type";
import bcrypt from 'bcryptjs'

export const createUser = async (req: Request, res: Response) => {
    try {
        const body = req.body as BodyCreateUser;
        if (!body) {
            responseAPI(res, {status: 400, message: "No data provided"});
        };

        if (!body.username) {
            responseAPI(res, {
                status: 400,
                message: 'Username is required!',
            });
        }

        if (!body.password) {
            responseAPI(res, {
                status: 400,
                message: 'Password is required!',
            });
        }

        if (!body.email) {
            responseAPI(res, {
                status: 400,
                message: 'Email is required!',
            });
        }

        if (!body.name) {
            responseAPI(res, {
                status: 400,
                message: 'Name is required!',
            });
        }

        if (!body.role) {
            responseAPI(res, {
                status: 400,
                message: 'Role is required!',
            });
        }

        const existingUser = await prismaClient.user.findUnique({
            where: {
                username: body.username,
            },
        });
        if (existingUser) {
            return responseAPI(res, {
                status: 400,
                message: 'Username already exists!',
            });
        }

        const existingEmail = await prismaClient.user.findUnique({
            where: {
                email: body.email,
            },
        });
        
        if (existingEmail) {
            return responseAPI(res, {
                status: 400,
                message: 'Email already exists!',
            });
        }

        const imageBuffer = req.file ? req.file.buffer : null;

        const hashed = await bcrypt.hash(body.password, 10)

        await prismaClient.user.create({
            data: {
                name: body.name,
                username: body.username,
                email: body.email,
                password: hashed,
                photo: imageBuffer,
                refreshToken: null,
                createdBy: {
                    connect: {
                        id: body.createdBy,
                    }
                },
                updatedBy: {
                    connect: {
                        id: body.updatedBy,
                    }
                },
                roles: {
                    connect: {
                        id: Number(body.role),
                    },
                }
            }
        })
        
        responseAPI(res, {
            status: 200,
            message: 'User created successfully',
        })
    } catch (error) {
        res.status(403);
    }
}

export const getAllUser = async (req: Request, res: Response) => {
    try {
        const queryParams = req.query as QueryParams;
        let queryTable = {
            select: {
                id: true,
                name: true,
                username: true,
                email: true,
                photo: true,
                createdAt: true,
                updatedAt: true,
                roles: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            },
        } as IQuery;
        if (queryParams.page || queryParams.limit) {
            const paramPage = queryParams.page ? Number(queryParams.page) : 1;
            const paramLimit = queryParams.limit ? Number(queryParams.limit) : 10;
            const page = getPage(paramPage,paramLimit);
            queryTable = {
                ...queryTable,
                skip: page.skip,
                take: page.take,
            }
        }
        const users = await prismaClient.user.findMany(queryTable);
        const totalRecords = await prismaClient.user.count();

        responseAPITable(res, {
            status: 200,
            message: 'Get all user successfully',
            data: {
                totalRecords: totalRecords,
                data: users,
            },
        })
    } catch (error) {
        res.status(403);
    }
}

export const updateUser = async (req: Request, res: Response) => {
    try {
       const { id, password } = req.body;
        if (!req.body) {
            responseAPI(res, {status: 400, message: "No data provided"});
        };

        const hashed = await bcrypt.hash(password, 10)

        await prismaClient.user.update({
            where: { id: Number(id) },
            data: {
                password: hashed,
            }
        })
        
        responseAPI(res, {
            status: 200,
            message: 'User updated successfully',
        })
    } catch (error) {
        res.status(403);
    }
}