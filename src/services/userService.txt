import { prismaClient } from "../config/db";
import { apiResponse } from "../models/apiModels";
import { CreateUser } from "../models/userModels";

export const createUserService = async (user: CreateUser): Promise<apiResponse> => {
    await prismaClient.user.create({
        data: {
            username: user.username,
            email: user.email,
            name: user.name,
            password: user.password,
            type: user.type ?? 'pegawai',
        }
    })
    return {
        status: 200,
        message: "User created successfully",
    }
}

export const getUserService = async (userId: string): Promise<apiResponse> => {
    const user = await prismaClient.user.findUnique({
        where: {
            id: userId,
        },
    })
    if (!user) {
        return {
            status: 404,
            message: "User not found",
        }
    }
    return {
        status: 200,
        message: "User found",
    }
}