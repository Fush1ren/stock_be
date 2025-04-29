import { NextFunction, Request, Response } from "express";
import { prismaClient } from "../../../config/db";
import { getUserByToken } from "../../../utils/api.util";

const createCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1]
        if (!req.body) {
            res.status(400).json({ message: "No data provided" });
            return;
        };
        const user = await getUserByToken(token as string);
        const { name } = req.body
        if (!name) {
            res.status(400).json({ status: 400, message: "Name is required" });
            return;
        }
        await prismaClient.category.create({
            data: { name, userId: user?.id as string }
        })
        res.status(200).json({ status: 200, message: "Category created successfully" });
        return;
    } catch (error) {
        next(error);
    }
}

const getCategoryDropdown = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const categories = await prismaClient.category.findMany({
            select: {
                id: true,
                name: true,
            }
        })
        res.status(200).json({ status: 200, message: "Category fetched successfully", data: categories });
        return;
    } catch (error) {
        next(error);
    }
}

export {
    createCategory,
    getCategoryDropdown,
}