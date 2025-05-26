import { Request, Response } from "express";
import { getPage, responseAPI, responseAPIData, responseAPITable } from "../../utils";
import { prismaClient } from "../../config";
import { QueryParams } from "../../dto";
import { IQuery } from "../../types/data.type";

export const createCategory = async (req: Request, res: Response) => {
    try {
        const { name, userId } = req.body;

        if (!name) {
            return responseAPI(res, {
                status: 400,
                message: "Name is required",
            });
        }

        const existingCategory = await prismaClient.category.findUnique({
            where: {
                name: name,
            },
        });

        if (existingCategory) {
            return responseAPI(res, {
                status: 400,
                message: "Category already exists",
            });
        }

        await prismaClient.category.create({
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
            message: "Category created successfully",
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: "Internal server error",
        })
    }
}

export const getAllCategory = async (req: Request, res: Response) => {
    try {
        const queryParams = req.query as QueryParams;
        let queryTable = {
            select: {
                id: true,
                name: true,
                code: true,
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

        const categories = await prismaClient.category.findMany(queryTable);
        const totalRecords = await prismaClient.category.count();

        responseAPITable(res, {
            status: 200,
            message: "Categories fetched successfully",
            data: {
                totalRecords,
                data: categories
            }
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: "Internal server error",
        });
    }
}

export const getCategoryDropdown = async (_req: Request, res: Response) => {
    try {
        const categories = await prismaClient.category.findMany({
            select: {
                id: true,
                name: true,
            },
        });

        responseAPIData(res, {
            status: 200,
            message: "Categories fetched successfully",
            data: categories,
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: "Internal server error",
        });
    }
}