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

export {
    getUserData,
}