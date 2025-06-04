import { Request, Response } from "express";
import { getPage, responseAPI, responseAPIData, responseAPITable } from "../../utils";
import { prismaClient } from "../../config";
import { QueryParams } from "../../dto";
import { validateToken } from "../auth/auth.controller";
import { parseSort } from "../../utils/data.util";

export const createCategory = async (req: Request, res: Response) => {
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
                        id: user.id,
                    }
                },
                updatedBy: {
                    connect: {
                        id: user.id,
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

export const deleteCategory = async (req: Request, res: Response) => {
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

        const { id } = req.body as { id: string[] };

        if (!id || id.length === 0) {
            responseAPI(res, {
                status: 400,
                message: "Category ID is required",
            });
            return;
        }


        const existingCategory = await prismaClient.category.findMany({
            where: { id: {
                in: id.map(item => Number(item)),
            } },
        });

        if (!existingCategory || existingCategory.length === 0) {
            return responseAPI(res, {
                status: 404,
                message: "Category not found",
            });
        }

        await Promise.all(
            id.map(categoryId => 
                prismaClient.category.delete({
                    where: { id: Number(categoryId) },
                })

        ));


        responseAPI(res, {
            status: 200,
            message: "Category deleted successfully",
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: "Internal server error",
        });
    }
}

export const updateCategory = async (req: Request, res: Response) => {
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

        const body = req.body as { name: string };

        if (!body || !id || !body.name) {
            return responseAPI(res, {
                status: 400,
                message: "Invalid request body",
            });
        }

        const existingCategory = await prismaClient.category.findFirst({
            where: { 
                id: Number(id)
            },
        });

        if (!existingCategory) {
            return responseAPI(res, {
                status: 404,
                message: "Category not found",
            });
        }

        await prismaClient.category.update({
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
            message: "Category updated successfully",
        });
    } catch (error) {
        responseAPI(res, {
            status: 500,
            message: "Internal server error",
        });
    }
}

export const getAllCategory = async (req: Request, res: Response) => {
  try {
    const queryParams = req.query as QueryParams;
    const search = queryParams.search?.toString().trim();

    let where: any = {};

    // Search nama kategori (case-insensitive)
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
    const categories = await prismaClient.category.findMany(queryTable);
    const totalRecords = await prismaClient.category.count({ where });

    responseAPITable(res, {
      status: 200,
      message: "Categories fetched successfully",
      data: {
        totalRecords,
        data: categories,
      },
    });
  } catch (error) {
    console.error(error);
    responseAPI(res, {
      status: 500,
      message: "Internal server error",
    });
  }
};

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