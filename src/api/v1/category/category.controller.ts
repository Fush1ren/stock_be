import { NextFunction, Request, Response } from "express";
import { prismaClient } from "../../../config/db";
import { getUserByToken } from "../../../utils/api.util";
import { getCategories } from "./category.service";
import { QueryParams } from "../../../dto/api.dto";

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

const getCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let categories = await getCategories();
        const params = req.params as QueryParams;
        if (params.page && params.limit) {
            const startIndex = (params.page - 1) * params.limit;
            const endIndex = params.page * params.limit;
            const paginatedCategories = categories.slice(startIndex, endIndex);
            categories = paginatedCategories;
        }
        res.status(200).json({ status: 200, message: "Category fetched successfully", data: {
            total: categories.length,
            data: categories
        }});
        return;
    } catch (error) {
        next(error);
    }
}

export {
    createCategory,
    getCategory,
}