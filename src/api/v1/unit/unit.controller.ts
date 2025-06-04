import { Request, Response } from "express";
import { getPage, responseAPI, responseAPIData } from "../../utils";
import { prismaClient } from "../../config";
import { validateToken } from "../auth/auth.controller";
import { BodyDeleteProductData, BodyUpdateProductUnit, GetProductUnitParams } from "../../../dto/product.dto";
import { parseSort } from "../../utils/data.util";
import { Prisma } from "@prisma/client";

export const createUnit = async (req: Request, res: Response) => {
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
                message: 'Name is required!',
            });
        }
        await prismaClient.unit.create({
            data: {
                name,
                createdBy: {
                    connect: {
                        id: user.id,
                    }
                },
                updatedBy: {
                    connect: {
                        id: user.id,
                    }
                }
            }
        });
        responseAPI(res, {
            status: 200,
            message: 'Unit created successfully',
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: 'Internal server error',
        });
    }
}

export const updateUnit = async (req: Request, res: Response) => {
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
        const body = req.body as BodyUpdateProductUnit;
        
        if (!body) {
            responseAPI(res, {
                status: 400,
                message: 'No data provided',
            });
            return;
        }

        if (!body.name) {
            responseAPI(res, {
                status: 400,
                message: 'Name is required for update!',
            });
            return;
        }

        const existingUnit = await prismaClient.unit.findUnique({
            where: {
                id: id,
            },
        });
        if (!existingUnit) {
            responseAPI(res, {
                status: 404,
                message: 'Unit not found!',
            });
            return;
        }

        await prismaClient.unit.update({
            where: {
                id: id,
            },
            data: {
                name: body.name.trim(),
                updatedBy: {
                    connect: {
                        id: user.id,
                    }
                },
            }
        });
        
        responseAPI(res, {
            status: 200,
            message: 'Unit updated successfully',
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: 'Internal server error',
        });
    }
}

export const deleteUnit = async (req: Request, res: Response) => {
    try {
        const body = req.body as BodyDeleteProductData;
        if (!body) {
            responseAPI(res, {
                status: 400,
                message: 'No data provided',
            });
            return;
        }

        const unitIds = [...new Set(body.id.map((id) => id))];

        const [ existingUnitId ] = await Promise.all([
            prismaClient.unit.findMany({
                where: {
                    id: {
                        in: unitIds,
                    },
                },
                select: {
                    id: true,
                },
            })
        ]);

        if (existingUnitId.length === 0) {
            responseAPI(res, {
                status: 400,
                message: 'Unit ID is required for all units!',
            });
            return;
        }

        await Promise.all(
            body.id.map(unit => prismaClient.unit.delete({
                where: {
                    id: unit,
                }
            }))
        )

        responseAPI(res, {
            status: 200,
            message: 'Unit deleted successfully',
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: 'Internal server error',
        });
    }
}

export const getAllUnit = async (req: Request, res: Response) => {
    try {
        const queryParams = req.query as GetProductUnitParams;

        // Definisikan filter where
        let where: Prisma.UnitWhereInput = {};

        // Filter name (array exact match, insensitive)
        if (queryParams.name) {
            const names = JSON.parse(queryParams.name as string) as string[];
            if (Array.isArray(names) && names.length > 0) {
                where.OR = names.map(name => ({
                    name: {
                        equals: name.trim(),
                        mode: 'insensitive',
                    },
                }));
            }
        }

        // Filter search (contains, insensitive)
        if (queryParams.search) {
            const search = queryParams.search.toString().trim();
            if (search.length > 0) {
                where.name = {
                    contains: search,
                    mode: 'insensitive',
                };
            }
        }

        // Filter createdAt (range)
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

        // Filter updatedAt (range)
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

        // Bangun query
        let queryTable: Prisma.UnitFindManyArgs = {
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

        // Query data
        const units = await prismaClient.unit.findMany(queryTable);
        const totalRecords = await prismaClient.unit.count({ where });

        responseAPIData(res, {
            status: 200,
            message: 'Units retrieved successfully',
            data: {
                totalRecords,
                data: units,
            },
        });
    } catch (error) {
        console.error(error);
        responseAPI(res, {
            status: 500,
            message: 'Internal server error',
        });
    }
};

export const getUnitDropdown = async (_req: Request, res: Response) => {
    try {
        const units = await prismaClient.unit.findMany({
            select: {
                id: true,
                name: true,
            },
        });
        responseAPIData(res, {
            status: 200,
            message: 'Units dropdown retrieved successfully',
            data: units,
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: 'Internal server error',
        });
    }
}