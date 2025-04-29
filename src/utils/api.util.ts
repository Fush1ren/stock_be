import { prismaClient } from "../config/db";
import { UserData } from "../types/user.type";

const getUserByToken = async (token: string): Promise<UserData | null> => {
    if (!token) return null;
    const user = await prismaClient.users.findMany({
        where: {
            token: token,
        },
    });
    if (!user) return null;
    const data = {
        id: user[0].id,
        username: user[0].username,
        name: user[0].name,
    }
    return data;
}

export {
    getUserByToken,
}