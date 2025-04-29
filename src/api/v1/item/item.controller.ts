import { NextFunction, Request, Response } from "express";
import { prismaClient } from "../../../config/db";
import { getUserByToken } from "../../../utils/api.util";

const createItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body) {
            res.status(400).json({ message: "No data provided" });
            return;
        };

        const { name, description, status, stock, categoryId } = req.body
        if (!name) {
            res.status(400).json({ status: 400, message: "Name is required" });
            return;
        }
        if (!stock) {
            res.status(400).json({ status: 400, message: "Stock is required" });
            return;
        }
        if (!status) {
            res.status(400).json({ status: 400, message: "Status is required" });
            return;
        }
        if (!categoryId) {
            res.status(400).json({ status: 400, message: "Category is required" });
            return;
        }

        const user = await getUserByToken(req.headers['authorization']?.split(' ')[1] as string);
        if (!user) {
            res.status(401).json({ status: 400, message: "User was not found!" });
            return;
        }

        await prismaClient.item.createMany({
            data: [
                {
                    name,
                    description,
                    stock,
                    status,
                    categoryId,
                    userId: user.id,
                }
            ]
        })
        res.status(200).json({ status: 200, message: "Item created successfully" });
        return;
    } catch (error) {
        next(error);
    }
}

export {
    createItem,
}