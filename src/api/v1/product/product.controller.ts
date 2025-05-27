import { Request, Response } from "express";
import { prismaClient } from "../../config";
import { getPage, responseAPI, responseAPITable } from "../../utils";
import { QueryParams } from "../../dto";
import { IQuery } from "../../types/data.type";
import { validateToken } from "../auth/auth.controller";
import { BodyCreateProduct, BodyDeleteProductData, BodyUpdateProduct } from "../../../dto/product.dto";

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

        // Ambil ID unik
        const categoryIds = [...new Set(body.map(item => item.categoryId))];
        const unitIds = [...new Set(body.map(item => item.unitId))];
        const brandIds = [...new Set(body.map(item => item.brandId))];

        // Query database
        const [existingCategories, existingUnits, existingBrands] = await Promise.all([
            prismaClient.category.findMany({
                where: { id: { in: categoryIds } },
                select: { id: true }
            }),
            prismaClient.unit.findMany({
                where: { id: { in: unitIds } },
                select: { id: true }
            }),
            prismaClient.brand.findMany({
                where: { id: { in: brandIds } },
                select: { id: true }
            })
        ]);

        // Ambil ID yang ditemukan
        const existingCategoryIds = new Set(existingCategories.map(c => c.id));
        const existingUnitIds = new Set(existingUnits.map(u => u.id));
        const existingBrandIds = new Set(existingBrands.map(b => b.id));

        // Cek apakah ada ID yang tidak ditemukan
        const missingCategory = categoryIds.find(id => !existingCategoryIds.has(id));
        const missingUnit = unitIds.find(id => !existingUnitIds.has(id));
        const missingBrand = brandIds.find(id => !existingBrandIds.has(id));

        if (missingCategory) {
            responseAPI(res, {
                status: 400,
                message: `Category ID ${missingCategory} does not exist`,
            });
            return;
        }

        if (missingUnit) {
            responseAPI(res, {
                status: 400,
                message: `Unit ID ${missingUnit} does not exist`,
            });
            return;
        }

        if (missingBrand) {
            responseAPI(res, {
                status: 400,
                message: `Brand ID ${missingBrand} does not exist`,
            });
            return;
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

        const body = req.body as BodyUpdateProduct;

        if (!body || !body.id) {
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
                id: body.id,
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
                id: body.id,
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