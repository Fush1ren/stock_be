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

export {
    getProducts,
}