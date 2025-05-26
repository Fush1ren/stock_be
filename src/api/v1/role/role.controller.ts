import { Request, Response } from "express";
import { getPage, responseAPI, responseAPITable } from "../../utils";
import { prismaClient } from "../../config";
import { QueryParams } from "../../dto";
import { IQuery } from "../../types/data.type";

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