import { NextFunction, Request, Response } from "express";
import { BodyCreateProduct } from "../../../dto/product.dto";
import { prismaClient } from "../../../config/db";
import { StatusProduct } from "@prisma/client";
import { getUserByToken } from "../../../utils/api.util";
import { getProducts } from "./product.service";
import { QueryParams } from "src/dto/api.dto";
import { getUserById } from "../users/users.service";

const createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
    if (!req.body) {
        res.status(400).json({ message: "No data provided" });
        return;
    };
    const body = req.body as BodyCreateProduct;
    if (!body.name) {
        res.status(400).json({ status: 400, message: "Name is required" });
        return;
    }
    if (!body.status) {
        res.status(400).json({ status: 400, message: "Status is required" });
        return;
    }
    if (!body.categoryId) {
        res.status(400).json({ status: 400, message: "Category is required" });
        return;
    }
    if (!body.unit) {
        res.status(400).json({ status: 400, message: "Unit is required" });
        return;
    }
    const user = await getUserByToken(token as string);

    await prismaClient.products.create({
        data: {
            name: body.name,
            description: body.description,
            unit: body.unit,
            status: body.status as StatusProduct,
            userId: user?.id as string,
            categoryId: body.categoryId
        }
    })
    res.status(200).json({ status: 200, message: "Product created successfully" });
    return;
    } catch (error) {
        next(error);
    }
}

const getProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const products = await getProducts();

        const users = await Promise.all(
            products.map((product) => getUserById(product?.userId))
        );

        let data = products.map((product, index) => ({
            id: product.id,
            name: product.name,
            unit: product.unit,
            description: product.description,
            user: {
                id: users[index]?.id,
                username: users[index]?.username,
                name: users[index]?.name,
            },
            updatedAt: product.updatedAt,
            createdAt: product.createdAt,
          }));

        const params = req.params as QueryParams;

        if (params.page && params.limit) {
            const startIndex = (params.page - 1) * params.limit;
            const endIndex = params.page * params.limit;
            const paginatedProduct = data.slice(startIndex, endIndex);
            data = paginatedProduct;
        }
        res.status(200).json({ 
            status: 200, 
            message: 'Successfully Get Product Data!', 
            data: {
                totalRecords: data.length,
                data: data
            } 
        });
    } catch (error) {
        next(error);
    }
}

export {
    createProduct,
    getProduct
}