import { prismaClient } from "../config/db";
import { apiResponse } from "../models/apiModels";
import { UserLogin } from "../models/userModels";

export const loginService = async (req: UserLogin): Promise<apiResponse> => {
    const db = await prismaClient.user.findFirst({
        where: {
            username: req.username,
            password: req.password,
        },
    });
    console.log(db);
    return {
        status: 200,
        message: "Login successful",
    }
}