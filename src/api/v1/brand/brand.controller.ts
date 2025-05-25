import { Request, Response } from "express";
import { getPage, responseAPI, responseAPITable } from "../../utils";
import { prismaClient } from "../../config";
import { QueryParams } from "../../dto";
import { IQuery } from "../../types/data.type";

export const createBrand = async (req: Request, res: Response) => {
    try {
        const { name, userId } = req.body;

        if (!name) {
            return responseAPI(res, {
                status: 400,
                message: 'Name is required!',
            });
        }

        if (!userId) {
            return responseAPI(res, {
                status: 400,
                message: 'User Id is required!',
            });
        }

        await prismaClient.brand.create({
            data: {
                name,
                createdBy: {
                    connect: { id: userId },
                },
                updatedBy: {
                    connect: { id: userId },
                },
            },
        });

        responseAPI(res, {
            status: 200,
            message: 'Brand created successfully',
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: 'Internal server error',
        });
    }
}

export const getAllBrand = async (req: Request, res: Response) => {
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
            },
        } as IQuery;

        if (queryParams.page || queryParams.limit) {
            const page = getPage(queryParams.page ?? 1, queryParams.limit ?? 10);
            queryTable = {
                ...queryTable,
                skip: page.skip,
                take: page.take,
            }
        }

        const brands = await prismaClient.brand.findMany(queryTable);
        const totalRecords = await prismaClient.brand.count();
        responseAPITable(res, {
            status: 200,
            message: 'Get all brands successfully',
            data: {
                totalRecords,
                data: brands,
            },
        });

    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: 'Internal server error',
        });
    }
}