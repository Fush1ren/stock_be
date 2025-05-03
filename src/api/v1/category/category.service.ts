import { prismaClient } from "../../../config/db";

const getCategories = async () => {
    const db = await prismaClient.category.findMany();
    return db.map((category) => ({
        id: category.id,
        name: category.name,
        userId: category.userId,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
    }));
}

export {
    getCategories,
}