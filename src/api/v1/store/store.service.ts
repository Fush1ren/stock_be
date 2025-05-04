import { Store } from "../../../types/store.type";
import { prismaClient } from "../../../config/db";

const getStores = async (): Promise<Store[]> => {
    const db = await prismaClient.stores.findMany();
    return db.map((store) => ({
        id: store.id,
        name: store.name,
        userId: store.userId,
        createdAt: store.createdAt,
    }));
}

const getStoreById = async (id: string): Promise<Store | null> => {
    const db = await prismaClient.stores.findUnique({
        where: {
            id: id
        }
    });
    if (!db) return null;
    return {
        id: db.id,
        name: db.name,
        userId: db.userId,
        createdAt: db.createdAt,
    };
}

export {
    getStores,
    getStoreById,
}