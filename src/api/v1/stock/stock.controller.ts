import { Request, Response } from "express";
import { getPage, responseAPI, responseAPIData, responseAPITable } from "../../utils";
import { prismaClient } from "../../config";
import { InsertUpdateQuery, IQuery } from "../../types/data.type";
import { BodyCreateStockIn, BodyCreateStockMutation, BodyCreateStockOut, BodyCreateStoreStock, BodyCreateWareHouseStock } from "../../../dto/stock.dto";
import { QueryParams } from "../../dto";
import { validateToken } from "../auth/auth.controller";

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
        const { stockInCode, date, toWarehouse, storeId, products } = req.body as BodyCreateStockIn;

        const queryTable =             {
            data: {
                stockInCode: stockInCode,
                date: new Date(date),
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
                StockInDetail: {
                    create:  products.map((product) => ({
                        productId: product.productId,
                        quantity: product.quantity,
                    })),
                }
            },
            include: {
                StockInDetail: true,
            }
        } as InsertUpdateQuery;

        if (!stockInCode) {
            responseAPI(res, {
                status: 400,
                message: "Code is required",
            });
        }
        if (!date) {
            responseAPI(res, {
                status: 400,
                message: "Date is required",
            });
        }

        if (!toWarehouse) {
            if (!storeId) {
                responseAPI(res, {
                    status: 400,
                    message: "Store ID is required",
                });
            }
            queryTable.data.store = {
                connect: {
                    id: storeId,
                }
            };
        }

        if (!products || products.length === 0) {
            responseAPI(res, {
                status: 400,
                message: "Products are required",
            });
        }

        products.find((product) => {
            if (!product.productId) {
                responseAPI(res, {
                    status: 400,
                    message: "Product ID is required",
                });
                return;
            }
            if (!product.quantity) {
                responseAPI(res, {
                    status: 400,
                    message: "Quantity is required",
                });
                return;
            }
        });

        const existingStockIn = await prismaClient.stockIn.findUnique({
            where: {
                stockInCode: stockInCode,
            },
        });

        if (existingStockIn) {
            responseAPI(res, {
                status: 400,
                message: "Stock in with this code already exists",
            });
            return;
        }

        await prismaClient.stockIn.create(queryTable);
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
        const { stockOutCode, date, storeId, products } = req.body as BodyCreateStockOut;

        const queryTable = {
            data: {
                stockOutCode: stockOutCode,
                date: new Date(date),
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
                StockOutDetail: {
                    create:  products.map((product) => ({
                        productId: product.productId,
                        quantity: product.quantity,
                    })),
                }
            },
            include: {
                StockOutDetail: true,
            }
        } as InsertUpdateQuery;

        if (!stockOutCode) {
            responseAPI(res, {
                status: 400,
                message: "Code is required",
            });
        }
        if (!date) {
            responseAPI(res, {
                status: 400,
                message: "Date is required",
            });
        }

        if (!storeId) {
            responseAPI(res, {
                status: 400,
                message: "Store ID is required",
            });
        }

        if (!products || products.length === 0) {
            responseAPI(res, {
                status: 400,
                message: "Products are required",
            });
        }

        products.find((product) => {
            if (!product.productId) {
                responseAPI(res, {
                    status: 400,
                    message: "Product ID is required",
                });
                return;
            }
            if (!product.quantity) {
                responseAPI(res, {
                    status: 400,
                    message: "Quantity is required",
                });
                return;
            }   
        });

        const existingStockOut = await prismaClient.stockOut.findUnique({
            where: {
                stockOutCode: stockOutCode,
            },
        });
        if (existingStockOut) {
            responseAPI(res, {
                status: 400,
                message: "Stock out with this code already exists",
            });
            return;
        }

        await prismaClient.stockOut.create(queryTable);
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
        const { stockMutationCode, date, fromWarehouse, toStoreId, fromStoreId, products } = req.body as BodyCreateStockMutation;

        const queryTable = {
            data: {
                stockMutationCode: stockMutationCode,
                date: new Date(date),
                fromWarehouse: {
                    connect: {
                        id: fromWarehouse,
                    }
                },
                toStore: {
                    connect: {
                        id: toStoreId,
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
                StockMutationDetail: {
                    create:  products.map((product) => ({
                        productId: product.productId,
                        quantity: product.quantity,
                    })),
                }
            },
            include: {
                StockMutationDetail: true,
            }
        } as InsertUpdateQuery;

        if (!stockMutationCode) {
            responseAPI(res, {
                status: 400,
                message: "Stock mutation code is required",
            });
        }

        if (!date) {
            responseAPI(res, {
                status: 400,
                message: "Date is required",
            });
        }

        if (!fromWarehouse) {
            if (!fromStoreId) {
                responseAPI(res, {
                    status: 400,
                    message: "From store ID is required",
                });  
            }
            queryTable.data.fromStore = {
                connect: {
                    id: fromStoreId,
                }
            };
        }

        if (!toStoreId) {
            responseAPI(res, {
                status: 400,
                message: "To store ID is required",
            });
        }

        if (!products || products.length === 0) {
            responseAPI(res, {
                status: 400,
                message: "Products are required",
            });
        }

        products.forEach((product) => {
            if (!product.productId) {
                responseAPI(res, {
                    status: 400,
                    message: "Product ID is required",
                });
                return;
            }
            if (!product.quantity) {
                responseAPI(res, {
                    status: 400,
                    message: "Quantity is required",
                });
                return;
            }
        });

        const existingStockMutation = await prismaClient.stockMutation.findUnique({
            where: {
                stockMutationCode: stockMutationCode,
            },
        });

        if (existingStockMutation) {
            responseAPI(res, {
                status: 400,
                message: "Stock mutation with this code already exists",
            });
            return;
        }

        // Logic to create stock mutation goes here
        await prismaClient.stockMutation.create(queryTable);
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
        const queryParams = req.query as QueryParams;
        let queryTable = {
            select: {
                id: true,
                stockInCode: true,
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

        const stocksIn = await prismaClient.stockIn.findMany(queryTable);
        const totalRecords = await prismaClient.stockIn.count();

        responseAPITable(res, {
            status: 200,
            message: "Stocks in retrieved successfully",
            data: {
                totalRecords: totalRecords,
                data: stocksIn,
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
        const queryParams = req.query as QueryParams;
        let queryTable = {
            select: {
                id: true,
                stockOutCode: true,
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

        const stocksOut = await prismaClient.stockOut.findMany(queryTable);
        const totalRecords = await prismaClient.stockOut.count();

        responseAPITable(res, {
            status: 200,
            message: "Stocks out retrieved successfully",
            data: {
                totalRecords: totalRecords,
                data: stocksOut,
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
        const queryParams = req.query as QueryParams;
        let queryTable = {
            select: {
                id: true,
                stockMutationCode: true,
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

        const stocksMutation = await prismaClient.stockMutation.findMany(queryTable);
        const totalRecords = await prismaClient.stockMutation.count();

        responseAPITable(res, {
            status: 200,
            message: "Stocks mutation retrieved successfully",
            data: {
                totalRecords: totalRecords,
                data: stocksMutation,
            }
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: "Internal server error",
        });
    }
}