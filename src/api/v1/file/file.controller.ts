import { Request, Response } from "express";
import { prismaClient } from "../../config";
import { responseAPI } from "../../utils";

export const getFile = async (req: Request, res: Response) => {
    try {
        const { userId } = req.query;
        if (!userId) {
            res.status(400).json({
                status: 400,
                message: "User ID are required",
            });
        }
        const user = await prismaClient.user.findUnique({
            where: { id: Number(userId) },
            select: {
                photo: true,
            }
        });
        if (!user || !user.photo) {
                responseAPI(res, {
                status: 404,
                message: "User not found or photo not available",
            });
        }
        res.setHeader('Content-Type', 'image/jpeg');
        res.status(200).send(user?.photo);
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Internal server error",
        });
    }
}