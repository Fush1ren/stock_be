import { NextFunction, Request, Response } from "express";
import { prismaClient } from "../../../config/db";
import { getUserByToken } from "../../../utils/api.util";
import { getStores } from "./store.service";
import { APIRequestBody } from "../../../dto/api.dto";

const createStore = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!req.body) {
            res.status(400).json({ message: "No data provided" });
            return;
        };

        const { name } = req.body;
        if (!name) {
            res.status(400).json({ status: 400, message: "Name is required" });
            return;
        }

        const user = await getUserByToken(token as string);

        // Assuming you have a prismaClient instance to interact with your database
        await prismaClient.stores.create({
            data: {
                name,
                userId: user?.id as string,
            }
        })
        res.status(200).json({ status: 200, message: "Store created successfully" });
        return;
    } catch (error) {
        next(error);
    }
}

const getStore = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let store = await getStores();
        const body = req.body as APIRequestBody;
        if (body.page && body.limit) {
            const startIndex = (body.page - 1) * body.limit;
            const endIndex = body.page * body.limit;
            const paginatedStore = store.slice(startIndex, endIndex);
            store = paginatedStore;
        }
        res.status(200).json({ status: 200, message: 'Successfully Get Store Data!', data: {
            total: store.length,
            data: store
        }});
    } catch (error) {
        next(error);
    }
}

export {
    createStore,
    getStore,
}