import { prismaClient } from "../config/db";
import { Item } from "../models/itemModels";

export const createItemService = async (item: Item) => {
    await prismaClient.item.create({
        data: {
            name: item.name,
            description: item.description,
            category: item.category,
            stock: item.stock,
        },
    })
    return {
        status: 200,
        message: "Item created successfully",
    };
}

export const getItemService = async () => {
    const items = await prismaClient.item.findMany();
    if (!items) {
        return {
            status: 404,
            message: "Items not found",
        };
    }
    return {
        status: 200,
        message: "Items found",
        data: items,
    };
}