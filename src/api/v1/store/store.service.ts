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

export {
    getStores,
}