import { Request, Response } from "express";
import { getPage, responseAPI, responseAPIData, responseAPITable } from "../../utils";
import { prismaClient } from "../../config";
import { QueryParams } from "../../dto";
import { validateToken } from "../auth/auth.controller";
import { BodyCreateBrand } from "../../../dto/brand.dto";
import { parseSort } from "../../utils/data.util";

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

        const existingBrand = await prismaClient.brand.findFirst({
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
    const search = queryParams.search?.toString().trim();

    let where: any = {};

    // Search nama brand (case-insensitive)
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    // Filter createdAt
    if (queryParams.createdAt) {
      const createdAt = JSON.parse(queryParams.createdAt as string) as string[];
      where.createdAt = {};
      if (createdAt[0]) where.createdAt.gte = new Date(createdAt[0]);
      if (createdAt[1]) where.createdAt.lte = new Date(createdAt[1]);
    }

    // Filter updatedAt
    if (queryParams.updatedAt) {
      const updatedAt = JSON.parse(queryParams.updatedAt as string) as string[];
      where.updatedAt = {};
      if (updatedAt[0]) where.updatedAt.gte = new Date(updatedAt[0]);
      if (updatedAt[1]) where.updatedAt.lte = new Date(updatedAt[1]);
    }

    let queryTable: any = {
      where,
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    };

    // Sorting
    const orderBy = parseSort({
      sortBy: queryParams.sortBy,
      sortOrder: queryParams.sortOrder,
    });
    if (orderBy) {
      queryTable.orderBy = orderBy;
    }

    // Pagination
    if (queryParams.page || queryParams.limit) {
      const paramPage = queryParams.page ? Number(queryParams.page) : 1;
      const paramLimit = queryParams.limit ? Number(queryParams.limit) : 10;
      const page = getPage(paramPage, paramLimit);
      queryTable.skip = page.skip;
      queryTable.take = page.take;
    }

    // Fetch data
    const brands = await prismaClient.brand.findMany(queryTable);
    const totalRecords = await prismaClient.brand.count({ where });

    responseAPITable(res, {
      status: 200,
      message: 'Get all brands successfully',
      data: {
        totalRecords,
        data: brands,
      },
    });
  } catch (error) {
    console.error(error);
    responseAPI(res, {
      status: 500,
      message: 'Internal server error',
    });
  }
};

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

export const deleteBrand = async (req: Request, res: Response) => {
    try {
        const body = req.body as { id: number[] };
        if (!body.id || body.id.length === 0) {
            return responseAPI(res, {
                status: 400,
                message: 'Brand ID is required',
            });
        }

        const existingBrands = await prismaClient.brand.findMany({
            where: {
                id: {
                    in: body.id
                },
            },
        });

        if (existingBrands.length === 0) {
            return responseAPI(res, {
                status: 404,
                message: 'Brand not found',
            });
        }

        await prismaClient.brand.deleteMany({
            where: {
                id: {
                    in: body.id
                }
            }
        })

        responseAPI(res, {
            status: 200,
            message: 'Brand deleted successfully',
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: 'Internal server error',
        });
    }
}

export const updateBrand = async (req: Request, res: Response) => {
    try {
        const tokenHead = req.headers['authorization']?.split(' ')[1] as string;
        const user = await validateToken(tokenHead);
        if (!user) {
            return responseAPI(res, {
                status: 401,
                message: 'Unauthorized',
            });
        }
        const id = Number(req.params.id);
        const body = req.body as { name: string };
        if (!body || !id || !body.name) {
            return responseAPI(res, {
                status: 400,
                message: 'Invalid request body',
            });
        }

        const existingBrands = await prismaClient.brand.findFirst({
            where: {
                id: id,
            },
        });

        if (!existingBrands) {
            return responseAPI(res, {
                status: 404,
                message: 'Brand not found',
            });
        }

        await prismaClient.brand.update({
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
            message: 'Brand updated successfully',
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: 'Internal server error',
        });
    }
}