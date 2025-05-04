import { NextFunction, Request, Response } from "express";
import { BodyCreateStockIn, BodyCreateStockOut } from "../../../dto/stock.dto";
import { prismaClient } from "../../../config/db";
import { getStocksIn, getStocksOut } from "./stock.service";
import { QueryParams } from "../../../dto/api.dto";
import { getUserByToken } from "../../../utils/api.util";
import { getUserById } from "../users/users.service";
import { getProductById } from "../product/product.service";
import { getStoreById } from "../store/store.service";

const createStockIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!req.body) {
            res.status(400).json({ message: "No data provided" });
            return;
        };

        const body = req.body as BodyCreateStockIn;
        if (!body.productId) {
            res.status(400).json({ status: 400, message: "Product is required" });
            return;
        }
        if (!body.quantity) {
            res.status(400).json({ status: 400, message: "Quantity required" });
            return;
        }

        if (!body.storeId) {
            res.status(400).json({ status: 400, message: "Store is required" });
            return;
        }

        const user = await getUserByToken(token as string);

        await prismaClient.stocks.create({
            data: {
                quantity: body.quantity,
                productId: body.productId,
                storeId: body.storeId,
                userId: user?.id as string,
                date: body.date,
            }
        })
        res.status(200).json({ status: 200, message: "Stock created successfully" });
    } catch (error) {
        next(error);
    }
}

const getStockIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const stocks = await getStocksIn();

        const users = await Promise.all(
            stocks.map((stock) => getUserById(stock?.userId))
        );

        const products = await Promise.all(
            stocks.map((stock) => getProductById(stock?.productId))
        );

        const getStores = await Promise.all(
            stocks.map((stock) => getStoreById(stock?.storeId))
        );

        let data = stocks.map((stock, index) => ({
            id: stock.id,
            qty: stock.quantity,
            products: {
                id: products[index]?.id,
                name: products[index]?.name,
                description: products[index]?.description,
                unit: products[index]?.unit,
            },
            stores: {
                id: getStores[index]?.id,
                name: getStores[index]?.name,
            },
            user: {
                id: users[index]?.id,
                username: users[index]?.username,
                name: users[index]?.name,
            },
            updatedAt: stock.updatedAt,
          }));

        const params = req.params as QueryParams;
        if (params.page && params.limit) {
            const startIndex = (params.page - 1) * params.limit;
            const endIndex = params.page * params.limit;
            const paginatedStock = data.slice(startIndex, endIndex);
            data = paginatedStock;
        }
        res.status(200).json({ status: 200, message: 'Successfully Get Stock Data!', data: {
            totalRecords: data.length,
            data: data
        }});
        return;
    } catch (error) {
        next(error);
    }
}

const createStockOut = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!req.body) {
            res.status(400).json({ message: "No data provided" });
            return;
        };

        const body = req.body as BodyCreateStockOut;
        if (!body.productId) {
            res.status(400).json({ status: 400, message: "Product is required" });
            return;
        }
        if (!body.quantity) {
            res.status(400).json({ status: 400, message: "Quantity required" });
            return;
        }

        if (!body.storeId) {
            res.status(400).json({ status: 400, message: "Store is required" });
            return;
        }

        const user = await getUserByToken(token as string);

        await prismaClient.stocksOut.create({
            data: {
                quantity: body.quantity,
                productId: body.productId,
                storeId: body.storeId,
                userId: user?.id as string,
                date: body.date,
            }
        })
        res.status(200).json({ status: 200, message: "Stock out created successfully" });
    } catch (error) {
        next(error);
    }
}

const getStockOut = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let stocks = await getStocksOut();

        const users = await Promise.all(
            stocks.map((stock) => getUserById(stock?.userId))
        );

        const products = await Promise.all(
            stocks.map((stock) => getProductById(stock?.productId))
        );

        const getStores = await Promise.all(
            stocks.map((stock) => getStoreById(stock?.storeId))
        );

        let data = stocks.map((stock, index) => ({
            id: stock.id,
            qty: stock.quantity,
            products: {
                id: products[index]?.id,
                name: products[index]?.name,
                description: products[index]?.description,
                unit: products[index]?.unit,
            },
            stores: {
                id: getStores[index]?.id,
                name: getStores[index]?.name,
            },
            user: {
                id: users[index]?.id,
                username: users[index]?.username,
                name: users[index]?.name,
            },
            updatedAt: stock.updatedAt,
          }));

        const params = req.params as QueryParams;
        if (params.page && params.limit) {
            const startIndex = (params.page - 1) * params.limit;
            const endIndex = params.page * params.limit;
            const paginatedStock = data.slice(startIndex, endIndex);
            data = paginatedStock;
        }
        res.status(200).json({ status: 200, message: 'Successfully Get Stock Out Data!', data: {
            totalRecords: data.length,
            data: data
        }});
        return;
    } catch (error) {
        next(error);
    }
}

export {
    createStockIn,
    getStockIn,
    createStockOut,
    getStockOut,
}