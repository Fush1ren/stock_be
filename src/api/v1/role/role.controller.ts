import { Request, Response } from "express";
import { getPage, responseAPI, responseAPIData, responseAPITable } from "../../utils";
import { prismaClient } from "../../config";
import { QueryParams } from "../../dto";
import { validateToken } from "../auth/auth.controller";
import { parseSort } from "../../utils/data.util";

export const createRole = async (req: Request, response: Response) => {
    try {
        const tokenHead = req.headers['authorization']?.split(' ')[1] as string;
        const user = await validateToken(tokenHead);
        if (!user) {
            responseAPI(response, {
                status: 401,
                message: 'Unauthorized',
            });
            return;
        }

        const { name } = req.body;

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
    const queryParams = req.query as QueryParams;
    const search = queryParams.search?.toString().trim();

    let where: any = {};

    // 🔍 Search by role name
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    // 📆 Filter createdAt
    if (queryParams.createdAt) {
      const createdAt = JSON.parse(queryParams.createdAt as string) as string[];
      where.createdAt = {};
      if (createdAt[0]) where.createdAt.gte = new Date(createdAt[0]);
      if (createdAt[1]) where.createdAt.lte = new Date(createdAt[1]);
    }

    // 📆 Filter updatedAt
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

    // 🔃 Sorting
    const orderBy = parseSort({
      sortBy: queryParams.sortBy,
      sortOrder: queryParams.sortOrder,
    });
    if (orderBy) {
      queryTable.orderBy = orderBy;
    }

    // 📄 Pagination
    if (queryParams.page || queryParams.limit) {
      const paramPage = queryParams.page ? Number(queryParams.page) : 1;
      const paramLimit = queryParams.limit ? Number(queryParams.limit) : 10;
      const page = getPage(paramPage, paramLimit);
      queryTable.skip = page.skip;
      queryTable.take = page.take;
    }

    // 📥 Fetch data
    const roles = await prismaClient.role.findMany(queryTable);
    const totalRecords = await prismaClient.role.count({ where });

    responseAPITable(response, {
      status: 200,
      message: 'Roles retrieved successfully',
      data: {
        totalRecords,
        data: roles,
      },
    });
  } catch (error) {
    console.error(error);
    responseAPI(response, {
      status: 500,
      message: 'Internal server error',
    });
  }
};

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