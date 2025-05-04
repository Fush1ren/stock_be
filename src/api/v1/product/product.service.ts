import { Product } from "../../../types/product.type";
import { prismaClient } from "../../../config/db";

const getProducts = async (): Promise<Product[]> => {
    const db = await prismaClient.products.findMany();
    return db.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        unit: product.unit,
        status: product.status,
        userId: product.userId,
        categoryId: product.categoryId,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
    }));
}

const getProductById = async (id: string): Promise<Product | null> => {
    const db = await prismaClient.products.findUnique({
        where: {
            id: id
        }
    });
    if (!db) return null;
    return {
        id: db.id,
        name: db.name,
        description: db.description,
        unit: db.unit,
        status: db.status,
        userId: db.userId,
        categoryId: db.categoryId,
        createdAt: db.createdAt,
        updatedAt: db.updatedAt,
    };
}

export {
    getProducts,
    getProductById,
}