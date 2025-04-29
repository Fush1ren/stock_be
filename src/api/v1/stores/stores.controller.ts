import { NextFunction, Request, Response } from "express";
import { prismaClient } from "../../../config/db";
import { getUserByToken } from "../../../utils/api.util";

const createStore = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1]
        if (!req.body) {
            res.status(400).json({ message: "No data provided" });
            return;
        };

        const { name, isMainWarehouse } = req.body;
        if (!name) {
            res.status(400).json({ status: 400, message: "Name is required" });
            return;
        }

        if (isMainWarehouse === undefined) {
            res.status(400).json({ status: 400, message: "isMainWarehouse is required" });
            return;
        }

        const user = await getUserByToken(token as string);

        // Assuming you have a prismaClient instance to interact with your database
        await prismaClient.stores.create({
            data: {
                name,
                isMainWarehouse,
                userId: user?.id as string,
            }
        })
        res.status(200).json({ status: 200, message: "Store created successfully" });
        return;
    } catch (error) {
        next(error);
    }
}

export {
    createStore,
}