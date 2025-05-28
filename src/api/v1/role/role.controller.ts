import { Request, Response } from "express";
import { getPage, responseAPI, responseAPIData, responseAPITable } from "../../utils";
import { prismaClient } from "../../config";
import { QueryParams } from "../../dto";
import { IQuery } from "../../types/data.type";
import { validateToken } from "../auth/auth.controller";

export const createRole = async (req: Request, response: Response) => {
    try {
        const { name, userId } = req.body;

        if (!name) {
            return responseAPI(response, {
                status: 400,
                message: "Name is required",
            });
        }

        const existingRole = await prismaClient.role.findUnique({
            where: {
                name: name,
            },
        });
        if (existingRole) {
            responseAPI(response, {
                status: 400,
                message: "Role already exists",
            });
            return;
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

export const getAllRole = async (req: Request, response: Response) => {
    try {
        const queryParams = req.query as QueryParams; // Adjust type as needed
        let queryTable = {
            select: {
                id: true,
                name: true,
                createdAt: true,
                updatedAt: true,
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                updatedBy: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
            },
        } as IQuery;

        if (queryParams.page || queryParams.limit) {
            const paramPage = queryParams.page ? Number(queryParams.page) : 1;
            const paramLimit = queryParams.limit ? Number(queryParams.limit) : 10;
            const page = getPage(paramPage,paramLimit);
            queryTable = {
                ...queryTable,
                skip: page.skip,
                take: page.take,
            }
        }

        const roles = await prismaClient.role.findMany(queryTable);
        const totalRecords = await prismaClient.role.count();

        responseAPITable(response, {
            status: 200,
            message: "Roles retrieved successfully",
            data: {
                totalRecords,
                data: roles,
            },
        });
    } catch (error) {
        responseAPI(response, {
            status: 500,
            message: "Internal server error",
        });
    }
}

export const updateRole = async (req: Request, res: Response) => {
    try {
        const tokenHead = req.headers['authorization']?.split(' ')[1] as string;
        const user = await validateToken(tokenHead);
        if (!user) {
            responseAPI(res, {
                status: 401,
                message: 'Unauthorized',
            });
            return;
        }

        const id = Number(req.params.id);
        const body = req.body as { name: string; };

        if (!body || !body.name) {
            responseAPI(res, {
                status: 400,
                message: 'Name is required',
            });
            return;
        }

        const existingRole = await prismaClient.role.findUnique({
            where: { id: id },
        });

        if (!existingRole) {
            responseAPI(res, {
                status: 404,
                message: "Role not found",
            });
            return;
        }

        await prismaClient.role.update({
            where: { id: id },
            data: {
                name: body.name.trim(),
                updatedBy: {
                    connect: { id: user.id },
                },
            },
        });

        responseAPI(res, {
            status: 200,
            message: "Role updated successfully",
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: "Internal server error",
        });
    }
}

export const getRoleDropdown = async (_req: Request, res: Response) => {
    try {
        const roles = await prismaClient.role.findMany({
            select: {
                id: true,
                name: true,
            },
        });

        responseAPIData(res, {
            status: 200,
            message: "Roles retrieved successfully",
            data: roles,
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: "Internal server error",
        });
    }
}

export const deleteRole = async (req: Request, res: Response) => {
    try {
        const body = req.body as { id: number[] };

        if (!body) {
            responseAPI(res, {
                status: 400,
                message: 'No data provided',
            });
            return;
        }

        await Promise.all(
            body.id.map(id => 
                prismaClient.role.delete({
                    where: { id: id },
                }
            )
        )); // Delete multiple roles by ID

        responseAPI(res, {
            status: 200,
            message: "Role deleted successfully",
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: "Internal server error",
        });
    }
}