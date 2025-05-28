import { Request, Response } from "express";
import { prismaClient } from "../../config";
import { QueryParams } from "../../dto";
import { getPage, responseAPI, responseAPIData, responseAPITable } from "../../utils";
import { IQuery } from "../../types/data.type";
import { validateToken } from "../auth/auth.controller";

export const createStore = async (req: Request, res: Response) => {
    try {
        const tokenHead = req.headers['authorization']?.split(' ')[1] as string;
            const user = await validateToken(tokenHead);
            if (!user) {
                responseAPI(res, {
                    status: 401,
                    message: 'Unauthorized',
                });
                return;
        }

        const { name } = req.body;

        if (!name) {
            responseAPI(res, {
                status: 400,
                message: "Name is required",
            });
        }

        const existingStore = await prismaClient.store.findUnique({
            where: {
                name: name,
            },
        });

        if (existingStore) {
            responseAPI(res, {
                status: 400,
                message: "Store already exists",
            });
            return;
        }

        await prismaClient.store.create({
            data: {
                name: name,
                createdBy: {
                    connect: {
                        id: user.id,
                    }
                },
                updatedBy: {
                    connect: {
                        id: user.id,
                    }
                },
            },
        });


        responseAPI(res, {
            status: 201,
            message: "Store created successfully",
        });

    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: 'Internal server error',
        });
    }
}

export const getAllStore = async (req: Request, res: Response) => {
    try {
        const queryParams = req.query as QueryParams;
        let queryTable = {
            select: {
                id: true,
                name: true,
                createdAt: true,
                updatedAt: true,
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                updatedBy: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
            }
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

        const stores = await prismaClient.store.findMany(queryTable);
        const totalRecords = await prismaClient.store.count();

        responseAPITable(res, {
            status: 200,
            message: "Stores retrieved successfully",
            data: {
                totalRecords: totalRecords,
                data: stores,
            }
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: "Internal server error",
        })
    }
}

export const updateStore = async (req: Request, res: Response) => {
    try {
        const tokenHead = req.headers['authorization']?.split(' ')[1] as string;
        const user = await validateToken(tokenHead);
        if (!user) {
            responseAPI(res, {
                status: 401,
                message: 'Unauthorized',
            });
            return;
        }
        const id = Number(req.params.id);
        const body = req.body as { name: string; };

        if (!body || !body.name) {
            responseAPI(res, {
                status: 400,
                message: "ID and Name are required",
            });
            return;
        }
        
        const existingStore = await prismaClient.store.findUnique({
            where: {
                id: id,
            },
        });

         // Check if the store exists
        if (!existingStore) {
            responseAPI(res, {
                status: 404,
                message: "Store not found",
            });
            return;
        }
        
        await prismaClient.store.update({
            where: { id: id },
            data: {
                name: body.name.trim(),
                updatedBy: {
                    connect: { id: user.id },
                },
            },
        }); // Respond with success message

        responseAPI(res, {
            status: 200,
            message: "Store updated successfully",
        });

    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: 'Internal server error',
        });
    }
}

export const deleteStore = async (req: Request, res: Response) => {
    try {
        const body = req.body as { id: number[] };

        if (!body || !body.id || body.id.length === 0) {
            responseAPI(res, {
                status: 400,
                message: "ID is required",
            });
            return;
        }

        await Promise.all(
            body.id.map(id => 
                prismaClient.store.delete({
                    where: { id: id },
                })
            )
        ); // Delete multiple stores

        responseAPI(res, {
            status: 200,
            message: "Store deleted successfully",
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: 'Internal server error',
        });
    }
}

export const getStoreDropdown = async (_req: Request, res: Response) => {
    try {
        const stores = await prismaClient.store.findMany({
            select: {
                id: true,
                name: true,
            },
        });

        responseAPIData(res, {
            status: 200,
            message: "Stores retrieved successfully",
            data: stores,
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: "Internal server error",
        });
    }
}