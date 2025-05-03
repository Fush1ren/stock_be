import { StockIn, StockOut } from "../../../types/stock.type";
import { prismaClient } from "../../../config/db";

const getStocksIn = async (): Promise<StockIn[]> => {
    const db = await prismaClient.stocks.findMany();
    return db.map((stock) => ({
        id: stock.id,
        productId: stock.productId,
        storeId: stock.storeId,
        quantity: stock.quantity,
        createdAt: stock.createdAt,
        updatedAt: stock.updatedAt,
        userId: stock.userId,
    }));
}

const getStocksOut = async (): Promise<StockOut[]> => {
    const db = await prismaClient.stocksOut.findMany();
    return db.map((stock) => ({
        id: stock.id,
        productId: stock.productId,
        storeId: stock.storeId,
        quantity: stock.quantity,
        createdAt: stock.createdAt,
        updatedAt: stock.updatedAt,
        userId: stock.userId,
    }));
}

export {
    getStocksIn,
    getStocksOut,
}