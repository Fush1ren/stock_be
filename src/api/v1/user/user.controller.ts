import { Request, Response } from "express";
import { BodyCreateUser } from "../../../dto";
import { getPage, responseAPI, responseAPITable } from "../../utils";
import { prismaClient } from "../../config";
import { QueryParams } from "../../dto";
import { IQuery } from "../../types/data.type";

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

        const imageBuffer = req.file ? req.file.buffer : null;

        await prismaClient.user.create({
            data: {
                name: body.name,
                username: body.username,
                email: body.email,
                password: body.password,
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
            const page = getPage(queryParams.page ?? 1, queryParams.limit ?? 10);
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