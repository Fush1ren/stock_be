import { NextFunction, Request, Response } from "express";
import { loginService } from "../services/loginService";

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const response = await loginService(req.body);
        res.status(200).json(response);
    } catch (error) {
        next(error);
    };
}