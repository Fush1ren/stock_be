import { Request, Response } from "express";
import { getPage, responseAPI, responseAPIData, responseAPITable } from "../../utils";
import { prismaClient } from "../../config";
import { QueryParams } from "../../dto";
import { IQuery } from "../../types/data.type";
import { validateToken } from "../auth/auth.controller";
import { BodyCreateBrand } from "../../../dto/brand.dto";

export const createBrand = async (req: Request, res: Response) => {
    try {
        const tokenHead = req.headers['authorization']?.split(' ')[1] as string;
        const user = await validateToken(tokenHead);
        if (!user) {
            return responseAPI(res, {
                status: 401,
                message: 'Unauthorized',
            });
        }

        const body = req.body as BodyCreateBrand;

        if (!body.name) {
            return responseAPI(res, {
                status: 400,
                message: 'Name is required!',
            });
        }

        const existingBrand = await prismaClient.brand.findUnique({
            where: {
                name: body.name.trim(),
            },
        });

        if (existingBrand) {
            return responseAPI(res, {
                status: 400,
                message: 'Brand already exists!',
            });
        }

        await prismaClient.brand.create({
            data: {
                name: body.name.trim(),
                createdBy: {
                    connect: { id: user.id },
                },
                updatedBy: {
                    connect: { id: user.id },
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
            const paramPage = queryParams.page ? Number(queryParams.page) : 1;
            const paramLimit = queryParams.limit ? Number(queryParams.limit) : 10;
            const page = getPage(paramPage,paramLimit);
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

export const getBrandDropdown = async (_req: Request, res: Response) => {
    try {
        const brands = await prismaClient.brand.findMany({
            select: {
                id: true,
                name: true,
            },
        });

        responseAPIData(res, {
            status: 200,
            message: 'Get brand dropdown successfully',
            data: brands,
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: 'Internal server error',
        });
    }
}
