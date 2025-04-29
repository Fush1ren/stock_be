import { NextFunction, Request, Response } from "express";
import { createUserService, getUserService } from "../services/userService";

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body) {
            res.status(400).json({ message: "No data provided" });
            return;
        }
        const response = await createUserService(req.body);
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.query.id as string;
        if (!userId) {
            res.status(400).json({ message: "No user ID provided" });
            return;
        }
        const response = await getUserService(userId);
        if (!response) {
            res.status(404).json({ message: "User not found" });
            return;
        }   
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
}