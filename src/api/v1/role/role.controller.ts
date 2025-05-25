import { Request, Response } from "express";
import { responseAPI } from "../../utils";
import { prismaClient } from "../../config";

export const createRole = async (req: Request, response: Response) => {
    try {
        const { name, userId } = req.body;

        if (!name) {
            return responseAPI(response, {
                status: 400,
                message: "Name is required",
            });
        }

        await prismaClient.role.create({
            data: {
                name: name,
                createdBy: {
                    connect: {
                        id: userId,
                    }
                },
                updatedBy: {
                    connect: {
                        id: userId,
                    }
                },
            },
        });

        responseAPI(response, {
            status: 201,
            message: "Role created successfully",
        });
    } catch (error) {
        responseAPI(response, {
            status: 500,
            message: "Internal server error",
        });
    }
}