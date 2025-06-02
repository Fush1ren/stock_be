import { Request, Response } from "express";
import { prismaClient } from "../../config";
import { getPage, responseAPI, responseAPIData, responseAPITable } from "../../utils";
import { QueryParams } from "../../dto";
import { IQuery } from "../../types/data.type";
import { validateToken } from "../auth/auth.controller";
import { BodyCreateProduct, BodyDeleteProductData, BodyUpdateProduct } from "../../../dto/product.dto";
import { parseSort } from "../../utils/data.util";

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

        const body = req.body as BodyCreateProduct;

        if (!body) {
            responseAPI(res, {
                status: 400,
                message: 'No data provided',
            });
            return;
        }

        if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
            responseAPI(res, {
                status: 400,
                message: 'Name is required',
            });
            return;
        }

        if (!body.code || typeof body.code !== 'string' || body.code.trim() === '') {
            responseAPI(res, {
                status: 400,
                message: 'Code is required',
            });
            return;
        }

        if (!body.unitId || typeof body.unitId !== 'number') {
            responseAPI(res, {
                status: 400,
                message: 'Unit ID is required',
            });
            return;
        }

        if (!body.categoryId || typeof body.categoryId !== 'number') {
            responseAPI(res, {
                status: 400,
                message: 'Category ID is required',
            });
            return;
        }

        if (!body.brandId || typeof body.brandId !== 'number') {
            responseAPI(res, {
                status: 400,
                message: 'Brand ID is required',
            });
            return;
        }

        const existingProduct = await prismaClient.product.findUnique({
            where: {
                code: body.code.trim(),
            },
        });

        if (existingProduct) {
            responseAPI(res, {
                status: 400,
                message: 'Product with this code already exists',
            });
            return;
        }

        await prismaClient.product.create({
            data: {
                name: body.name.trim(),
                code: body.code.trim(),
                description: body.description ? body.description.trim() : null,
                category: {
                  connect: {
                    id: body.categoryId,
                  }
                },
                unit: {
                    connect: {
                        id: body.unitId,
                    }
                },
                brand: {
                    connect: {
                        id: body.brandId,
                    }
                },
                createdBy: { connect: { id: user.id } },
                updatedBy: { connect: { id: user.id } },
            }
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

export const updateProduct = async (req: Request, res: Response) => {
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
        const body = req.body as BodyUpdateProduct;

        if (!body || !id) {
            responseAPI(res, {
                status: 400,
                message: 'No data provided',
            });
            return;
        }

        if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
            responseAPI(res, {
                status: 400,
                message: 'Name is required',
            });
            return;
        }
        
        const existingProduct = await prismaClient.product.findUnique({
            where: {
                id: id,
            },
        });

        if (!existingProduct) {
            responseAPI(res, {
                status: 404,
                message: 'Product not found',
            });
            return;
        }
        
        await prismaClient.product.update({
            where: {
                id: id,
            },
            data: {
                name: body.name.trim(),
                description: body.description,
                category: body.categoryId ? {
                    connect: {
                        id: body.categoryId,
                    }
                } : undefined,
                unit: body.unitId ? {
                    connect: {
                        id: body.unitId,
                    }
                } : undefined,
                brand: body.brandId ? {
                    connect: {
                        id: body.brandId,
                    }
                } : undefined,
                updatedBy: { connect: { id: user.id } },
            }
        });

        responseAPI(res, {
            status: 200,
            message: 'Product updated successfully',
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: 'Internal server error',
        });
    }
}

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const body = req.body as BodyDeleteProductData;

        if (!body) {
            responseAPI(res, {
                status: 400,
                message: 'No data provided',
            });
            return;
        }

        const productIds = [...new Set(body.id.map((id) => id))];

        const [ existingProductId ] = await Promise.all([
            prismaClient.product.findMany({
                where: {
                    id: {
                        in: productIds,
                    },
                },
                select: {
                    id: true,
                },
            })
        ]);

        if (existingProductId.length > 0) {
            responseAPI(res, {
                status: 400,
                message: 'Unit ID is required for all units!',
            });
            return;
        }

        await Promise.all(
            body.id.map(unit => prismaClient.product.delete({
                where: {
                    id: unit,
                }
            }))
        )

        responseAPI(res, {
            status: 200,
            message: 'Product deleted successfully',
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: 'Internal server error',
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

        const orderBy = parseSort({
            sortBy: queryParams.sortBy,
            sortOrder: queryParams.sortOrder,
        });
        
        if (orderBy) {
            queryTable = {
                ...queryTable,
                orderBy,
            };
        }

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

export const getNextIndex = async (_req: Request, res: Response) => {
    try {
        const lastProduct = await prismaClient.product.findFirst({
            orderBy: {
                id: 'desc',
            },
            select: {
                id: true,
            },
        });

        const nextIndex = lastProduct ? lastProduct.id + 1 : 1;

        responseAPIData(res, {
            status: 200,
            message: "Next index retrieved successfully",
            data: { nextIndex },
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: "Internal server error",
        });
    }
}