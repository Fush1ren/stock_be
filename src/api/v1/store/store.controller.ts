import { Request, Response } from "express";
import { prismaClient } from "../../config";
import { QueryParams } from "../../dto";
import { getPage, responseAPI, responseAPITable } from "../../utils";
import { IQuery } from "../../types/data.type";

export const createStore = async (req: Request, res: Response) => {
    try {
        const { name, userId } = req.body;

        if (!name) {
            responseAPI(res, {
                status: 400,
                message: "Name is required",
            });
        }

        await prismaClient.store.create({
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


        responseAPI(res, {
            status: 201,
            message: "Store created successfully",
        });

    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: 'Internal server error',
        });
    }
}

export const getAllStore = async (req: Request, res: Response) => {
    try {
        const queryParams = req.query as QueryParams;
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
            }
        } as IQuery;
        if (queryParams.page || queryParams.limit) {
            const page = getPage(queryParams.page ?? 1, queryParams.limit ?? 10);
            queryTable = {
                ...queryTable,
                skip: page.skip,
                take: page.take,
            }
        }

        const stores = await prismaClient.store.findMany(queryTable);
        const totalRecords = await prismaClient.store.count();

        responseAPITable(res, {
            status: 200,
            message: "Stores retrieved successfully",
            data: {
                totalRecords: totalRecords,
                data: stores,
            }
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: "Internal server error",
        })
    }
}