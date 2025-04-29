import { NextFunction, Request, Response } from "express";
import { createItemService, getItemService } from "../services/itemService";

export const createItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body) {
            res.status(400).json({ message: "No data provided" });
            return;
        }
        // Assuming you have a service to handle the creation of items
        const response = await createItemService(req.body);
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
}

export const getItem = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        // Assuming you have a service to handle the retrieval of items
        const response = await getItemService();
        if (!response) {
            res.status(404).json({ message: "Items not found" });
            return;
        }
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
}
