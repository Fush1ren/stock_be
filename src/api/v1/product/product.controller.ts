import { Request, Response } from "express";
import { prismaClient } from "../../config";
import { getPage, responseAPI, responseAPITable } from "../../utils";
import { QueryParams } from "../../dto";
import { IQuery } from "../../types/data.type";
import { validateToken } from "../auth/auth.controller";
import { BodyCreateProduct } from "../../../dto/product.dto";

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

        const body = req.body as BodyCreateProduct[];

        if (!body || body.length === 0) {
            responseAPI(res, {
                status: 400,
                message: 'No data provided',
            });
        }

        const invalidName = body.find(
            item => typeof item.name !== 'string' || item.name.trim() === ''
        )

        const invalidCode = body.find(
            item => typeof item.code !== 'string' || item.code.trim() === ''
        )

        const invalidCategoryId = body.find(
            item => typeof item.categoryId !== 'number'
        )

        const invalidUnitId = body.find(
            item => typeof item.unitId !== 'number'
        )

        const invalidBrandId = body.find(
            item => typeof item.brandId !== 'number'
        )

        if (invalidName) {
            responseAPI(res, {
                status: 400,
                message: "Name is required",
            });
        }

        if (!invalidCode) {
            responseAPI(res, {
                status: 400,
                message: "Product code is required",
            });
        }

        if (!invalidCategoryId) {
            responseAPI(res, {
                status: 400,
                message: "Category ID is required",
            });
        }

        if (!invalidUnitId) {
            responseAPI(res, {
                status: 400,
                message: "Unit ID is required",
            });
        }

        if (!invalidBrandId) {
            responseAPI(res, {
                status: 400,
                message: "Brand ID is required",
            });
        }

        const name = body.map(item => item.name.trim());
        const code = body.map(item => item.code.trim());

        const existingProduct = await prismaClient.product.findMany({
            where: {
                OR: [
                        {
                            name: 
                                {
                                    in: name,
                                }
                        },
                        {
                            code: 
                                {
                                    in: code,
                                }
                        }
                    ]
            },
        });

        if (existingProduct.length > 0) {
            responseAPI(res, {
                status: 400,
                message: "Product already exists",
            });
            return;
        }

        await Promise.all(
            body.map(item =>
            prismaClient.product.create({
                data: {
                    name: item.name.trim(),
                    code: item.code.trim(),
                    description: item.description || null,
                    category: {
                        connect: {
                            id: item.categoryId,
                        }
                    },
                    unit: {
                        connect: {
                            id: item.unitId,
                        }
                    },
                    brand: {
                        connect: {
                            id: item.brandId,
                        }
                    },
                    createdBy: { connect: { id: user.id } },
                    updatedBy: { connect: { id: user.id } },
                },
            })
            )
        );


        // await prismaClient.product.create({
        //     data: {
        //         name: name,
        //         code: code,
        //         description: description || null,
        //         category: {
        //             connect: {
        //                 id: categoryId,
        //             }
        //         },
        //         unit: {
        //             connect: {
        //                 id: unitId,
        //             }
        //         },
        //         brand: {
        //             connect: {
        //                 id: brandId,
        //             }
        //         },
        //         createdBy: {
        //             connect: {
        //                 id: userId,
        //             }
        //         },
        //         updatedBy: {
        //             connect: {
        //                 id: userId,
        //             }
        //         },
        //     },
        // });

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