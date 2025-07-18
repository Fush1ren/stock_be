import { Request, Response } from "express";
import { getPage, responseAPI, responseAPIData, responseAPITable, validateStockInPayload } from "../../utils";
import { prismaClient } from "../../config";
import { IQuery } from "../../types/data.type";
import { BodyCreateStockIn, BodyCreateStockMutation, BodyCreateStockOut, BodyCreateStoreStock, BodyCreateWareHouseStock, GetStockInQueryParams, GetStockMutationParams, GetStockOutParams } from "../../../dto/stock.dto";
import { QueryParams } from "../../dto";
import { validateToken } from "../auth/auth.controller";
import { validateStockMutationPayload, validateStockOutPayload } from "../../utils/validation";
import { parseSort } from "../../utils/data.util";
import { Prisma } from "@prisma/client";

const filterStockIn = (queryParams: GetStockInQueryParams) => {
    let where: Prisma.StockInWhereInput = {};

    if (queryParams?.transactionCode) {
        const transactionCode = JSON.parse(queryParams.transactionCode as string) as string[];
        where.transactionCode = {
            in: transactionCode.map(code => code.trim()),
        }
    }

    if (queryParams?.productIds) {
        const productIds = JSON.parse(queryParams.productIds as string) as number[];
        where.StockInDetail = {
            some: {
                productId: {
                    in: productIds.map(Number),
                },
            },
        };
    }

    if (queryParams?.toStoreIds) {
        const toStoreIds = JSON.parse(queryParams.toStoreIds as string) as number[];
        where.toStore = {
            id: {
                in: toStoreIds.map(Number),
            }
        };
    }

    if (queryParams?.date) {
        const date = JSON.parse(queryParams.date as string) as string[];
        let tempDate: Prisma.DateTimeFilter = {};
        if (date[0]) {
            tempDate = {
                gte: new Date(date[0]),
            }
        }
        if (date[1]) {
            tempDate = {
                ...tempDate,
                lte: new Date(date[1]),
            }
        }
        where.date = tempDate;
    }

    if (queryParams?.quantity) {
        const quantity = JSON.parse(queryParams.quantity as string) as number[];
        let tempQuantity: Prisma.IntFilter = {};
        if (quantity[0]) {
            tempQuantity = {
                gte: Number(quantity[0]),
            }
        }
        if (quantity[1]) {
            tempQuantity = {
                ...tempQuantity,
                lte: Number(quantity[1]),
            }
        }
        where.StockInDetail = {
            some: {
                quantity: tempQuantity,
            },
        };
    }

    if (queryParams?.updatedAt) {
        const updatedAt = JSON.parse(queryParams.updatedAt as string) as string[];
        let tempUpdatedAt: Prisma.DateTimeFilter = {};
        if (updatedAt[0]) {
            tempUpdatedAt = {
                gte: new Date(updatedAt[0]),
            }
        }
        if (updatedAt[1]) {
            tempUpdatedAt = {
                ...tempUpdatedAt,
                lte: new Date(updatedAt[1]),
            }
        }
        where.updatedAt = tempUpdatedAt;
    }

    if (queryParams?.createdAt) {
        const createdAt = JSON.parse(queryParams.createdAt as string) as string[];
        let tempCreatedAt: Prisma.DateTimeFilter = {};
        if (createdAt[0]) {
            tempCreatedAt = {
                gte: new Date(createdAt[0]),
            }
        }
        if (createdAt[1]) {
            tempCreatedAt = {
                ...tempCreatedAt,
                lte: new Date(createdAt[1]),
            }
        }
        where.createdAt = tempCreatedAt;
    }

    if (queryParams?.search && queryParams.search.trim() !== "") {
        const search = queryParams.search.trim();

        where.OR = [
            {
                transactionCode: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                toStore: {
                    name: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            },
            {
                createdBy: {
                    name: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            },
            {
                updatedBy: {
                    name: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            },
            {
                StockInDetail: {
                    some: {
                        product: {
                            name: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                    },
                },
            },
        ];
    }

    return where;
};

const filterStockOut = (queryParams: GetStockOutParams) => {
    let where: Prisma.StockOutWhereInput = {};

    if (queryParams?.transactionCode) {
        const transactionCode = JSON.parse(queryParams.transactionCode as string) as string[];
        where.transactionCode = {
            in: transactionCode.map(code => code.trim()),
        }
    }

    if (queryParams?.productIds) {
        const productIds = JSON.parse(queryParams.productIds as string) as number[];
        where.StockOutDetail = {
            some: {
                productId: {
                    in: productIds.map(Number),
                },
            },
        };
    }

    if (queryParams?.storeIds) {
        const storeIds = JSON.parse(queryParams.storeIds as string) as number[];
        where.storeId = {
            in: storeIds.map(Number),
        };
    }

    if (queryParams?.date) {
        const date = JSON.parse(queryParams.date as string) as string[];
        let tempDate: Prisma.DateTimeFilter = {};
        if (date[0]) {
            tempDate = {
                gte: new Date(date[0]),
            }
        }
        if (date[1]) {
            tempDate = {
                ...tempDate,
                lte: new Date(date[1]),
            }
        }
        where.date = tempDate;
    }

    if (queryParams?.quantity) {
        const quantity = JSON.parse(queryParams.quantity as string) as number[];
        let tempQuantity: Prisma.IntFilter = {};
        if (quantity[0]) {
            tempQuantity = {
                gte: Number(quantity[0]),
            }
        }
        if (quantity[1]) {
            tempQuantity = {
                ...tempQuantity,
                lte: Number(quantity[1]),
            }
        }
        where.StockOutDetail = {
            some: {
                quantity: tempQuantity,
            },
        };
    }

    if (queryParams?.updatedAt) {
        const updatedAt = JSON.parse(queryParams.updatedAt as string) as string[];
        let tempUpdatedAt: Prisma.DateTimeFilter = {};
        if (updatedAt[0]) {
            tempUpdatedAt = {
                gte: new Date(updatedAt[0]),
            }
        }
        if (updatedAt[1]) {
            tempUpdatedAt = {
                ...tempUpdatedAt,
                lte: new Date(updatedAt[1]),
            }
        }
        where.updatedAt = tempUpdatedAt;
    }

    if (queryParams?.createdAt) {
        const createdAt = JSON.parse(queryParams.createdAt as string) as string[];
        let tempCreatedAt: Prisma.DateTimeFilter = {};
        if (createdAt[0]) {
            tempCreatedAt = {
                gte: new Date(createdAt[0]),
            }
        }
        if (createdAt[1]) {
            tempCreatedAt = {
                ...tempCreatedAt,
                lte: new Date(createdAt[1]),
            }
        }
        where.createdAt = tempCreatedAt;
    }

    if (queryParams?.search && queryParams.search.trim() !== "") {
        const search = queryParams.search.trim();

        where.OR = [
            {
                transactionCode: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                fromStore: {
                    name: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            },
            {
                createdBy: {
                    name: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            },
            {
                updatedBy: {
                    name: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            },
            {
                StockOutDetail: {
                    some: {
                        product: {
                            name: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                    },
                },
            },
        ]
    }

    return where;
}

const filterStockMutation = (queryParams: GetStockMutationParams) => {
    let where: Prisma.StockMutationWhereInput = {};

    if (queryParams?.transactionCode) {
        const transactionCode = JSON.parse(queryParams.transactionCode as string) as string[];
        where.transactionCode = {
            in: transactionCode.map(code => code.trim()),
        }
    }

    if (queryParams?.productIds) {
        const productIds = JSON.parse(queryParams.productIds as string) as number[];
        where.StockMutationDetail = {
            some: {
                productId: {
                    in: productIds.map(Number),
                },
            },
        };
    }

    if (queryParams?.fromStoreIds) {
        const fromStoreIds = JSON.parse(queryParams.fromStoreIds as string) as number[];
        where.fromStoreId = {
            in: fromStoreIds.map(Number),
        };
    }

    if (queryParams?.toStoreIds) {
        const toStoreIds = JSON.parse(queryParams.toStoreIds as string) as number[];
        where.toStoreId = {
            in: toStoreIds.map(Number),
        };
    }

    if (queryParams?.date) {
        const date = JSON.parse(queryParams.date as string) as string[];
        let tempDate: Prisma.DateTimeFilter = {};
        if (date[0]) {
            tempDate = {
                gte: new Date(date[0]),
            }
        }
        if (date[1]) {
            tempDate = {
                ...tempDate,
                lte: new Date(date[1]),
            }
        }
        where.date = tempDate;
    }

    if (queryParams?.quantity) {
        const quantity = JSON.parse(queryParams.quantity as string) as number[];
        let tempQuantity: Prisma.IntFilter = {};
        if (quantity[0]) {
            tempQuantity = {
                gte: Number(quantity[0]),
            }
        }
        if (quantity[1]) {
            tempQuantity = {
                ...tempQuantity,
                lte: Number(quantity[1]),
            }
        }
        where.StockMutationDetail = {
            some: {
                quantity: tempQuantity,
            },
        };
    }

    if (queryParams?.updatedAt) {
        const updatedAt = JSON.parse(queryParams.updatedAt as string) as string[];
        let tempUpdatedAt: Prisma.DateTimeFilter = {};
        if (updatedAt[0]) {
            tempUpdatedAt = {
                gte: new Date(updatedAt[0]),
            }
        }
        if (updatedAt[1]) {
            tempUpdatedAt = {
                ...tempUpdatedAt,
                lte: new Date(updatedAt[1]),
            }
        }
        where.updatedAt = tempUpdatedAt;
    }
    if (queryParams?.createdAt) {
        const createdAt = JSON.parse(queryParams.createdAt as string) as string[];
        let tempCreatedAt: Prisma.DateTimeFilter = {};
        if (createdAt[0]) {
            tempCreatedAt = {
                gte: new Date(createdAt[0]),
            }
        }
        if (createdAt[1]) {
            tempCreatedAt = {
                ...tempCreatedAt,
                lte: new Date(createdAt[1]),
            }
        }
        where.createdAt = tempCreatedAt;
    }

    if (queryParams?.search && queryParams.search.trim() !== "") {
        const search = queryParams.search.trim();

        where.OR = [
            {
                transactionCode: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                fromStore: {
                    name: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            },
            {
                toStore: {
                    name: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            },
            {
                createdBy: {
                    name: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            },
            {
                updatedBy: {
                    name: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            },
            {
                StockMutationDetail: {
                    some: {
                        product: {
                            name: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                    },
                },
            },
        ]
    }

    return where;
}

export const createStoreStock = async (req: Request, res: Response) => {
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
        
        const { quantity, status, storeId, productId } = req.body as BodyCreateStoreStock;

        if (!quantity) {
            responseAPI(res, {
                status: 400,
                message: "Quantity is required",
            });
        }

        if (!status) {
            responseAPI(res, {
                status: 400,
                message: "Status is required",
            });
        }

        if (!storeId) {
            responseAPI(res, {
                status: 400,
                message: "Store ID is required",
            });
        }

        if (!productId) {
            responseAPI(res, {
                status: 400,
                message: "Product ID is required",
            });
        }

        await prismaClient.storeStock.create({
            data: {
                quantity: quantity,
                status: status,
                store: {
                    connect: {
                        id: storeId,
                    }
                },
                product: {
                    connect: {
                        id: productId,
                    }
                },
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
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: "Internal server error",
        })
    }
}

export const createWarehouseStock = async (req: Request, res: Response) => {
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
        const { quantity, status, productId } = req.body as BodyCreateWareHouseStock;

        if (!quantity) {
            responseAPI(res, {
                status: 400,
                message: "Quantity is required",
            });
        }

        if (!status) {
            responseAPI(res, {
                status: 400,
                message: "Status is required",
            });
        }

        if (!productId) {
            responseAPI(res, {
                status: 400,
                message: "Product ID is required",
            });
        }

        await prismaClient.wareHouseStock.create({
            data: {
                quantity: quantity,
                status: status,
                product: {
                    connect: {
                        id: productId,
                    }
                },
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
            message: "Warehouse stock created successfully",
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: "Internal server error",
        });
    }
}

export const createStockIn = async (req: Request, res: Response) => {
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
        const body = req.body as BodyCreateStockIn;
        const validation = validateStockInPayload(body);
        if (!validation.valid) {
            responseAPI(res, {
                status: 400,
                message: validation.message as string,
            })
        }

        const existing = await prismaClient.stockIn.findFirst({
            where: {
                transactionCode: body.transactionCode,
            }
        });

        if (existing) {
            responseAPI(res, {
                status: 400,
                message: "Stock in with this code already exists",
            });
            return;
        }

        await prismaClient.stockIn.create({
            data: {
                transactionCode: body.transactionCode,
                date: new Date(body.date),
                toWarehouse: body.toWarehouse,
                storeId: body.toWarehouse ? null : body.storeId,
                StockInDetail: {
                    create: body.products.map((product) => ({
                        productId: product.productId,
                        quantity: product.quantity,
                    })),
                },
                createdById: user.id,
                updatedById: user.id,
            },
            include: {
                StockInDetail: true,
            }
        });

        for (const item of body.products) {
            if (body.toWarehouse) {
                const existingStock = await prismaClient.wareHouseStock.findFirst({
                    where: { productId: item.productId },
                });

                if (existingStock) {
                    await prismaClient.wareHouseStock.update({
                        where: { id: existingStock.id },
                        data: {
                            quantity: { increment: item.quantity },
                            updatedById: user.id,
                        },
                    });
                } else {
                    await prismaClient.wareHouseStock.create({
                        data: {
                            productId: item.productId,
                            quantity: item.quantity,
                            status: 'available',
                            createdById: user.id,
                            updatedById: user.id,
                        },
                    });
                }
            } else {
                const existingStoreStock = await prismaClient.storeStock.findFirst({
                    where: {
                        productId: item.productId,
                        storeId: body.storeId!,
                    },
                });

                if (existingStoreStock) {
                    await prismaClient.storeStock.update({
                        where: { id: existingStoreStock.id },
                        data: {
                            quantity: { increment: item.quantity },
                            updatedById: user.id,
                        },
                    });
                } else {
                    await prismaClient.storeStock.create({
                        data: {
                            productId: item.productId,
                            storeId: body.storeId!,
                            quantity: item.quantity,
                            threshold: 0,
                            status: 'available',
                            createdById: user.id,
                            updatedById: user.id,
                        },
                    });
                }
            }
        }

        responseAPI(res, {
            status: 201,
            message: "Stock in created successfully",
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: "Internal server error",
        });
    }
}

export const getStockInNextCode = async (req: Request, res: Response) => {
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

        const lastStockIn = await prismaClient.stockIn.findFirst({
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
            },
        });

        const nextCode = lastStockIn ? lastStockIn.id + 1 : 1;

        responseAPIData(res, {
            status: 200,
            message: "Next stock in code retrieved successfully",
            data: { nextCode },
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: "Internal server error",
        });
    }
}

export const createStockOut = async (req: Request, res: Response) => {
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
        const body = req.body as BodyCreateStockOut;

        const validation = validateStockOutPayload(body);
        if (!validation.valid) {
            responseAPI(res, {
                status: 400,
                message: validation.message as string,
            });
            return;
        }

        const existing = await prismaClient.stockOut.findFirst({
            where: {
                transactionCode: body.transactionCode,
            }
        })

        if (existing) {
            responseAPI(res, {
                status: 400,
                message: "Stock out with this code already exists",
            });
            return;
        };

        for (const item of body.products) {
            const stock = await prismaClient.wareHouseStock.findFirst({
                where: { productId: item.productId },
            });

            if (!stock || stock.quantity < item.quantity) {
                responseAPI(res, {
                    status: 400,
                    message: `Insufficient stock for product ID ${item.productId}.`,
                });
                return;
            }

            await prismaClient.wareHouseStock.update({
                where: { id: stock.id },
                data: {
                    quantity: { decrement: item.quantity },
                    updatedById: user.id,
                },
            });
        }

        await prismaClient.stockOut.create({
            data: {
                transactionCode: body.transactionCode,
                date: new Date(body.date),
                storeId: body.storeId,
                createdById: user.id,
                updatedById: user.id,
                StockOutDetail: {
                    create: body.products.map((product) => ({
                        productId: product.productId,
                        quantity: product.quantity,
                    })),
                },
            },
            include: {
                StockOutDetail: true,
            }
        });

        responseAPI(res, {
            status: 201,
            message: "Stock out created successfully",
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: "Internal server error",
        });
    }
}

export const getStockOutNextCode = async (req: Request, res: Response) => {
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

        const lastStockOut = await prismaClient.stockOut.findFirst({
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
            },
        });

        const nextCode = lastStockOut ? lastStockOut.id + 1 : 1;

        responseAPIData(res, {
            status: 200,
            message: "Next stock out code retrieved successfully",
            data: { nextCode },
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: "Internal server error",
        });
    }
}

export const createStockMutation = async (req: Request, res: Response) => {
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

        const body = req.body as BodyCreateStockMutation;

        const validation = validateStockMutationPayload(body);

        if (!validation.valid) {
            responseAPI(res, {
                status: 400,
                message: validation.message as string,
            });
            return;
        }

        const existing = await prismaClient.stockMutation.findFirst({
            where: {
                transactionCode: body.transactionCode,
            }
        });

        if (existing) {
            responseAPI(res, {
                status: 400,
                message: "Stock mutation with this code already exists",
            });
            return;
        }

        for (const item of body.products) {
            const stock = body.fromWarehouse 
                ? await prismaClient.wareHouseStock.findFirst({
                    where: { productId: item.productId },
                })
                : await prismaClient.storeStock.findFirst({
                    where: { productId: item.productId, storeId: body.fromStoreId! },
                });

            if (!stock || stock.quantity < item.quantity) {
                responseAPI(res, {
                    status: 400,
                    message: `Insufficient stock for product ID ${item.productId}.`,
                });
                return;
            }

            if (body.fromWarehouse) {
                await prismaClient.wareHouseStock.update({
                    where: { id: stock.id },
                    data: {
                        quantity: { decrement: item.quantity },
                        updatedById: user.id,
                    },
                });
            } else {
                await prismaClient.storeStock.update({
                    where: { id: stock.id },
                    data: {
                        quantity: { decrement: item.quantity },
                        updatedById: user.id,
                    },
                });
            }
        }

        await prismaClient.stockMutation.create({
            data: {
                transactionCode: body.transactionCode,
                date: new Date(body.date),
                fromWarehouse: body.fromWarehouse,
                fromStoreId: body.fromWarehouse ? null : body.fromStoreId,
                toStoreId: body.toStoreId,
                createdById: user.id,
                updatedById: user.id,
                StockMutationDetail: {
                    create: body.products.map((product) => ({
                        productId: product.productId,
                        quantity: product.quantity,
                    })),
                },
            },
            include: {
                StockMutationDetail: true,
            }
        });

        responseAPI(res, {
            status: 201,
            message: "Stock mutation created successfully",
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: "Internal server error",
        });
    }
    
}

export const getStockMutationNextCode = async (req: Request, res: Response) => {
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

        const lastStockMutation = await prismaClient.stockMutation.findFirst({
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
            },
        });

        const nextCode = lastStockMutation ? lastStockMutation.id + 1 : 1;

        responseAPIData(res, {
            status: 200,
            message: "Next stock mutation code retrieved successfully",
            data: { nextCode },
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: "Internal server error",
        });
    }
}

export const getAllStoreStocks = async (req: Request, res: Response) => {
    try {
        const queryParams = req.query as QueryParams;
        let queryTable = {
            select: {
                id: true,
                quantity: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                store: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                product: {
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

        const storeStocks = await prismaClient.storeStock.findMany(queryTable);
        const totalRecords = await prismaClient.storeStock.count();

        responseAPITable(res, {
            status: 200,
            message: "Store stocks retrieved successfully",
            data: {
                totalRecords: totalRecords,
                data: storeStocks,
            }
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: "Internal server error",
        });
    }
}

export const getAllWarehouseStocks = async (req: Request, res: Response) => {
    try {
        const queryParams = req.query as QueryParams;
        let queryTable = {
            select: {
                id: true,
                quantity: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                product: {
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

        const warehouseStocks = await prismaClient.wareHouseStock.findMany(queryTable);
        const totalRecords = await prismaClient.wareHouseStock.count();

        responseAPITable(res, {
            status: 200,
            message: "Warehouse stocks retrieved successfully",
            data: {
                totalRecords: totalRecords,
                data: warehouseStocks,
            }
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: "Internal server error",
        });
    }
}

export const getAllStocksIn = async (req: Request, res: Response) => {
    try {
        const queryParams = req.query as GetStockInQueryParams;
        let queryTable = {
            select: {
                id: true,
                transactionCode: true,
                date: true,
                createdAt: true,
                updatedAt: true,
                toWarehouse: true,
                toStore: {
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
                StockInDetail: {
                    select: {
                        productId: true,
                        quantity: true,
                    }
                }
            }
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

        const filter = filterStockIn(queryParams);

        if (filter && Object.keys(filter).length > 0) {
            queryTable = {
                ...queryTable,
                where: filter,
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

        const stocksIn = await prismaClient.stockIn.findMany({
            where: queryTable.where,
            include: {
                StockInDetail: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                            }
                        }
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
                toStore: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
            },
            orderBy: queryTable.orderBy,
        });
        
        const totalRecords = await prismaClient.stockIn.count({
            where: queryTable.where,
        });

        const data = stocksIn.map((stock) => ({
            id: stock.id,
            transactionCode: stock.transactionCode,
            date: stock.date,
            createdAt: stock.createdAt,
            updatedAt: stock.updatedAt,
            toWarehouse: stock.toWarehouse,
            toStore: stock.toStore,
            createdBy: stock.createdBy,
            updatedBy: stock.updatedBy,
            products: stock.StockInDetail.map((detail) => ({
                id: detail.productId,
                quantity: detail.quantity,
                name: detail.product.name,
            })),
        }))

        responseAPITable(res, {
            status: 200,
            message: "Stocks in retrieved successfully",
            data: {
                totalRecords: totalRecords,
                data: data,
            }
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: "Internal server error",
        });
    }
}

export const getAllStocksOut = async (req: Request, res: Response) => {
    try {
        const queryParams = req.query as GetStockOutParams;
        let queryTable = {
            select: {
                id: true,
                transactionCode: true,
                date: true,
                createdAt: true,
                updatedAt: true,
                store: {
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
                StockOutDetail: {
                    select: {
                        productId: true,
                        quantity: true,
                    }
                }
            }
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

        const filter = filterStockOut(queryParams);

        if (filter && Object.keys(filter).length > 0) {
            queryTable = {
                ...queryTable,
                where: filter,
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

        const stocksOut = await prismaClient.stockOut.findMany({
            where: queryTable.where,
            include: {
                StockOutDetail: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                            }
                        }
                    }
                },
                createdBy: true,
                updatedBy: true,
                fromStore: true,
            },
            orderBy: queryTable.orderBy,
        });

        const totalRecords = await prismaClient.stockOut.count({
            where: queryTable.where,
        });

        const data = stocksOut.map((stock) => ({
            id: stock.id,
            transactionCode: stock.transactionCode,
            date: stock.date,
            createdAt: stock.createdAt,
            updatedAt: stock.updatedAt,
            fromStore: stock.fromStore,
            createdBy: stock.createdBy,
            updatedBy: stock.updatedBy,
            products: stock.StockOutDetail.map((detail) => ({
                id: detail.productId,
                quantity: detail.quantity,
                name: detail.product.name,
            })),
        }));

        responseAPITable(res, {
            status: 200,
            message: "Stocks out retrieved successfully",
            data: {
                totalRecords: totalRecords,
                data: data,
            }
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: "Internal server error",
        });
    }
}

export const getAllStocksMutation = async (req: Request, res: Response) => {
    try {
        const queryParams = req.query as GetStockMutationParams;
        let queryTable = {
            select: {
                id: true,
                transactionCode: true,
                date: true,
                createdAt: true,
                updatedAt: true,
                fromWarehouse: true,
                fromStore: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                toStore: {
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
                StockMutationDetail: {
                    select: {
                        productId: true,
                        quantity: true,
                    }
                }
            }
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

        const filter = filterStockMutation(queryParams);

        if (filter && Object.keys(filter).length > 0) {
            queryTable = {
                ...queryTable,
                where: filter,
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

        const stocksMutation = await prismaClient.stockMutation.findMany({
            where: queryTable.where,
            include: {
                StockMutationDetail: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                            }
                        }
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
                fromStore: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                toStore: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
            },
            orderBy: queryTable.orderBy,
        });
        const totalRecords = await prismaClient.stockMutation.count({
            where: queryTable.where,
        });

        const data = stocksMutation.map((stock) => ({
            id: stock.id,
            transactionCode: stock.transactionCode,
            date: stock.date,
            createdAt: stock.createdAt,
            updatedAt: stock.updatedAt,
            fromWarehouse: stock.fromWarehouse,
            fromStore: stock.fromStore,
            toStore: stock.toStore,
            createdBy: stock.createdBy,
            updatedBy: stock.updatedBy,
            products: stock.StockMutationDetail.map((detail) => ({
                id: detail.productId,
                quantity: detail.quantity,
                name: detail.product.name,
            })),
        }));

        responseAPITable(res, {
            status: 200,
            message: "Stocks mutation retrieved successfully",
            data: {
                totalRecords: totalRecords,
                data: data,
            }
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: "Internal server error",
        });
    }
}