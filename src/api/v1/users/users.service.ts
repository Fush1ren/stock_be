import { User } from "../../../types/user.type";
import { prismaClient } from "../../../config/db";

const getUserData = async (): Promise<User[]> => {
    const db = await prismaClient.users.findMany();
    return db.map((user) => ({
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    }));
}

const getUserById = async (id: string): Promise<User | null> => {
    const db = await prismaClient.users.findUnique({
        where: {
            id: id
        }
    });
    if (!db) return null;
    return {
        id: db.id,
        username: db.username,
        name: db.name,
        role: db.role,
        createdAt: db.createdAt,
        updatedAt: db.updatedAt,
    };
}

export {
    getUserData,
    getUserById,
}