import { Request, Response } from "express";
import { getPage, responseAPI, responseAPIData } from "../../utils";
import { prismaClient } from "../../config";
import { QueryParams } from "../../dto";
import { IQuery } from "../../types/data.type";
import { validateToken } from "../auth/auth.controller";
import { BodyDeleteProductData, BodyUpdateProductUnit } from "../../../dto/product.dto";

export const createUnit = async (req: Request, res: Response) => {
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
        const { name } = req.body;
        if (!name) {
            responseAPI(res, {
                status: 400,
                message: 'Name is required!',
            });
        }
        await prismaClient.unit.create({
            data: {
                name,
                createdBy: {
                    connect: {
                        id: user.id,
                    }
                },
                updatedBy: {
                    connect: {
                        id: user.id,
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

export const updateUnit = async (req: Request, res: Response) => {
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
        const body = req.body as BodyUpdateProductUnit;
        
        if (!body) {
            responseAPI(res, {
                status: 400,
                message: 'No data provided',
            });
            return;
        }
        
        if (!body.id) {
            responseAPI(res, {
                status: 400,
                message: 'ID is required for update!',
            });
            return;
        }

        if (!body.name) {
            responseAPI(res, {
                status: 400,
                message: 'Name is required for update!',
            });
            return;
        }

        const existingUnit = await prismaClient.unit.findFirst({
            where: {
                id: body.id,
            },
            select: {
                id: true,
            }
        });
        if (!existingUnit) {
            responseAPI(res, {
                status: 404,
                message: 'Unit not found!',
            });
            return;
        }

        await prismaClient.unit.update({
            where: {
                id: body.id,
            },
            data: {
                name: body.name.trim(),
                updatedBy: {
                    connect: {
                        id: user.id,
                    }
                },
            }
        });
        
        responseAPI(res, {
            status: 200,
            message: 'Unit updated successfully',
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: 'Internal server error',
        });
    }
}

export const deleteUnit = async (req: Request, res: Response) => {
    try {
        const body = req.body as BodyDeleteProductData;
        if (!body) {
            responseAPI(res, {
                status: 400,
                message: 'No data provided',
            });
            return;
        }

        const unitIds = [...new Set(body.id.map((id) => id))];

        const [ existingUnitId ] = await Promise.all([
            prismaClient.unit.findMany({
                where: {
                    id: {
                        in: unitIds,
                    },
                },
                select: {
                    id: true,
                },
            })
        ]);

        if (existingUnitId.length > 0) {
            responseAPI(res, {
                status: 400,
                message: 'Unit ID is required for all units!',
            });
            return;
        }

        await Promise.all(
            body.id.map(unit => prismaClient.unit.delete({
                where: {
                    id: unit,
                }
            }))
        )

        responseAPI(res, {
            status: 200,
            message: 'Unit deleted successfully',
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