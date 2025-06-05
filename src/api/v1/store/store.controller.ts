import { Request, Response } from "express";
import { prismaClient } from "../../config";
import { getPage, responseAPI, responseAPIData, responseAPITable } from "../../utils";
import { validateToken } from "../auth/auth.controller";
import { parseSort } from "../../utils/data.util";
import { GetStoreParams } from "../../../dto/store.dto";
import { Prisma } from "@prisma/client";

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

        const existingStore = await prismaClient.store.findFirst({
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
        const queryParams = req.query as GetStoreParams;
        
        // Definisikan where secara terpisah agar lebih fleksibel
        let where: Prisma.StoreWhereInput = {};

        // Filter nama berdasarkan queryParams.name (array of exact match)
        if (queryParams.name) {
            const names = JSON.parse(queryParams.name as string) as string[];
            if (Array.isArray(names) && names.length > 0) {
                where.OR = names.map(name => ({
                    name: {
                        equals: name.trim(),
                        mode: 'insensitive',
                    }
                }));
            }
        }

        // Filter nama berdasarkan search string (contains, case-insensitive)
        if (queryParams.search) {
            const search = queryParams.search.toString().trim();
            if (search.length > 0) {
                where.name = {
                    contains: search,
                    mode: 'insensitive',
                };
            }
        }

        // Filter createdAt
        if (queryParams.createdAt) {
            const createdAt = JSON.parse(queryParams.createdAt) as string[];
            let createdAtQuery: Prisma.DateTimeFilter = {};
            if (createdAt[0]) {
                createdAtQuery.gte = new Date(createdAt[0]);
            }
            if (createdAt[1]) {
                createdAtQuery.lte = new Date(createdAt[1]);
            }
            where.createdAt = createdAtQuery;
        }

        // Filter updatedAt
        if (queryParams.updatedAt) {
            const updatedAt = JSON.parse(queryParams.updatedAt) as string[];
            let updatedAtQuery: Prisma.DateTimeFilter = {};
            if (updatedAt[0]) {
                updatedAtQuery.gte = new Date(updatedAt[0]);
            }
            if (updatedAt[1]) {
                updatedAtQuery.lte = new Date(updatedAt[1]);
            }
            where.updatedAt = updatedAtQuery;
        }

        // Siapkan queryTable
        let queryTable: Prisma.StoreFindManyArgs = {
            where,
            select: {
                id: true,
                name: true,
                createdAt: true,
                updatedAt: true,
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                updatedBy: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        };

        // Sort
        const orderBy = parseSort({
            sortBy: queryParams.sortBy,
            sortOrder: queryParams.sortOrder,
        });

        if (orderBy) {
            queryTable.orderBy = orderBy;
        }

        // Pagination
        if (queryParams.page || queryParams.limit) {
            const paramPage = queryParams.page ? Number(queryParams.page) : 1;
            const paramLimit = queryParams.limit ? Number(queryParams.limit) : 10;
            const page = getPage(paramPage, paramLimit);
            queryTable.skip = page.skip;
            queryTable.take = page.take;
        }

        const stores = await prismaClient.store.findMany(queryTable);
        const totalRecords = await prismaClient.store.count({
            where,
        });

        responseAPITable(res, {
            status: 200,
            message: "Stores retrieved successfully",
            data: {
                totalRecords,
                data: stores,
            }
        });
    } catch (error) {
        console.error(error);
        responseAPI(res, {
            status: 500,
            message: "Internal server error",
        });
    }
};

export const getStoreById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (!id) {
            responseAPI(res, {
                status: 400,
                message: "ID is required",
            });
            return;
        }

        const store = await prismaClient.store.findUnique({
            where: { id: id },
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
        });

        if (!store) {
            responseAPI(res, {
                status: 404,
                message: "Store not found",
            });
            return;
        }

        responseAPIData(res, {
            status: 200,
            message: "Store retrieved successfully",
            data: store,
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: "Internal server error",
        });
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