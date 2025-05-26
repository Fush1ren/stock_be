import { Request, Response } from "express";
import { getPage, responseAPI, responseAPIData } from "../../utils";
import { prismaClient } from "../../config";
import { QueryParams } from "../../dto";
import { IQuery } from "../../types/data.type";

export const createUnit = async (req: Request, res: Response) => {
    try {
        const { name, userId } = req.body;
        if (!name) {
            responseAPI(res, {
                status: 400,
                message: 'Name is required!',
            });
        }

        if (!userId) {
            responseAPI(res, {
                status: 400,
                message: 'User Id is required!',
            });
        }

        await prismaClient.unit.create({
            data: {
                name,
                createdBy: {
                    connect: {
                        id: userId,
                    }
                },
                updatedBy: {
                    connect: {
                        id: userId,
                    }
                }
            }
        });
        responseAPI(res, {
            status: 200,
            message: 'Unit created successfully',
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: 'Internal server error',
        });
    }
}

export const getAllUnit = async (req: Request, res: Response) => {
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
                }
             }
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
        const units = await prismaClient.unit.findMany(queryTable);
        const totalRecords = await prismaClient.unit.count();
        responseAPIData(res, {
            status: 200,
            message: 'Units retrieved successfully',
            data: {
                totalRecords,
                data: units,
            },
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: 'Internal server error',
        });
    }
}

export const getUnitDropdown = async (_req: Request, res: Response) => {
    try {
        const units = await prismaClient.unit.findMany({
            select: {
                id: true,
                name: true,
            },
        });
        responseAPIData(res, {
            status: 200,
            message: 'Units dropdown retrieved successfully',
            data: units,
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: 'Internal server error',
        });
    }
}