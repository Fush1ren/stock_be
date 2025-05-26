import { Request, Response } from "express";
import { prismaClient } from "../../config";
import { getPage, responseAPI, responseAPITable } from "../../utils";
import { QueryParams } from "../../dto";
import { IQuery } from "../../types/data.type";
import { validateToken } from "../auth/auth.controller";

export const createProduct = async (req: Request, res: Response) => {
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

        const { name, code, description, userId, unitId, categoryId, brandId } = req.body;

        if (!name) {
            responseAPI(res, {
                status: 400,
                message: "Name is required",
            });
        }

        if (!code) {
            responseAPI(res, {
                status: 400,
                message: "Product code is required",
            });
        }

        if (!userId) {
            responseAPI(res, {
                status: 400,
                message: "User ID is required",
            });
        }

        if (!categoryId) {
            responseAPI(res, {
                status: 400,
                message: "Category ID is required",
            });
        }

        if (!unitId) {
            responseAPI(res, {
                status: 400,
                message: "Unit ID is required",
            });
        }

        if (!brandId) {
            responseAPI(res, {
                status: 400,
                message: "Brand ID is required",
            });
        }

        const existingProduct = await prismaClient.product.findUnique({
            where: {
                code: code,
            },
        });

        if (existingProduct) {
            responseAPI(res, {
                status: 400,
                message: "Product with this code already exists",
            });
            return;
        }

        await prismaClient.product.create({
            data: {
                name: name,
                code: code,
                description: description || null,
                category: {
                    connect: {
                        id: categoryId,
                    }
                },
                unit: {
                    connect: {
                        id: unitId,
                    }
                },
                brand: {
                    connect: {
                        id: brandId,
                    }
                },
                createdBy: {
                    connect: {
                        id: userId,
                    }
                },
                updatedBy: {
                    connect: {
                        id: userId,
                    }
                },
            },
        });

        responseAPI(res, {
            status: 201,
            message: "Product created successfully",
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: "Internal server error",
        });
    }
}

export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const queryParams = req.query as QueryParams;
        let queryTable = {
            select: {
                id: true,
                name: true,
                code: true,
                description: true,
                createdAt: true,
                updatedAt: true,
                category: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                unit: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                brand: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
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

        const products = await prismaClient.product.findMany(queryTable);
        const totalRecords = await prismaClient.product.count();

        responseAPITable(res, {
            status: 200,
            message: "Stores retrieved successfully",
            data: {
                totalRecords: totalRecords,
                data: products,
            }
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: "Internal server error",
        })
    }
}